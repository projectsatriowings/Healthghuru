'use server';

import { requireAdmin } from '@/lib/auth/session';
import { canManageArticles } from '@/lib/admin/permissions';
import { sql } from '@/lib/db';
import { writeAuditLog } from './auditLog';
import { z } from 'zod';
import { randomUUID } from 'crypto';

const articleSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3),
  slug: z.string().min(3),
  category: z.string(),
  matchedGoalCategory: z.string().optional(),
  excerpt: z.string(),
  readTime: z.number().int().min(1),
  status: z.enum(['draft', 'published']),
  heroImageUrl: z.string().optional(),
  heroImageAlt: z.string().optional(),
  authorName: z.string().optional(),
  authorAvatar: z.string().optional(),
  authorCredential: z.string().optional(),
  isFeatured: z.boolean().optional(),
  isTrending: z.boolean().optional(),
  qualityScore: z.number().optional(),
  tags: z.array(z.string()).optional(),
  blocks: z.any().optional(),
  action: z.enum(['create', 'update', 'delete']),
});

export async function manageArticle(input: z.infer<typeof articleSchema>) {
  const session = await requireAdmin();
  if (!canManageArticles(session)) {
    throw new Error('Forbidden');
  }

  const validated = articleSchema.parse(input);

  if (validated.action === 'create') {
    const newId = randomUUID();
    await sql`
      INSERT INTO articles (
        id, title, slug, category, matched_goal_category, excerpt, read_time, status, publish_date,
        hero_image_url, hero_image_alt, author_name, author_avatar, author_credential, blocks
      )
      VALUES (
        ${newId}::uuid, ${validated.title}, ${validated.slug}, ${validated.category}, ${validated.matchedGoalCategory || null}, 
        ${validated.excerpt}, ${validated.readTime}, ${validated.status}, CURRENT_TIMESTAMP,
        ${validated.heroImageUrl || null}, ${validated.heroImageAlt || null}, ${validated.authorName || null}, 
        ${validated.authorAvatar || null}, ${validated.authorCredential || null}, ${JSON.stringify(validated.blocks || [])}::jsonb
      )
    `;

    // Dual-write into unified content_items platform with recommendation signals
    try {
      await sql`
        INSERT INTO content_items (
          id, content_type, title, slug, excerpt, description, canonical_url,
          image_url, author_name, published_at, source_id, status, language,
          category, is_external, is_featured, is_trending, is_breaking, is_verified,
          requires_review, quality_score, relevance_score, created_at, updated_at
        ) VALUES (
          ${newId}::uuid, 'article', ${validated.title}, ${validated.slug}, ${validated.excerpt}, ${validated.excerpt},
          ${'/blog/' + validated.slug}, ${validated.heroImageUrl || null}, ${validated.authorName || 'HealthGhuru Editorial Team'},
          CURRENT_TIMESTAMP, NULL, ${validated.status}, 'en',
          ${validated.category}, FALSE, ${validated.isFeatured ?? true}, ${validated.isTrending ?? false}, FALSE, TRUE,
          FALSE, ${validated.qualityScore ?? 95.0}, 95.0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
        ON CONFLICT (slug) DO UPDATE SET
          title = EXCLUDED.title,
          excerpt = EXCLUDED.excerpt,
          category = EXCLUDED.category,
          image_url = EXCLUDED.image_url,
          status = EXCLUDED.status,
          is_featured = EXCLUDED.is_featured,
          is_trending = EXCLUDED.is_trending,
          quality_score = EXCLUDED.quality_score,
          updated_at = CURRENT_TIMESTAMP;
      `;

      // Sync tags if provided
      if (validated.tags && validated.tags.length > 0) {
        for (const tagName of validated.tags) {
          if (!tagName.trim()) continue;
          const tagRes = await sql`
            INSERT INTO content_tags (name, slug)
            VALUES (${tagName.trim()}, ${tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-')})
            ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
            RETURNING id
          `;
          if (tagRes.length > 0) {
            await sql`
              INSERT INTO content_item_tags (content_item_id, tag_id)
              VALUES (${newId}::uuid, ${tagRes[0].id}::uuid)
              ON CONFLICT (content_item_id, tag_id) DO NOTHING
            `;
          }
        }
      }
    } catch (syncErr) {
      console.warn('Failed to sync article to content_items:', syncErr);
    }

    await writeAuditLog({
      adminUserId: session.user.id,
      actionType: 'article_create',
      targetTable: 'articles',
      targetId: newId,
      afterValue: { title: validated.title, status: validated.status }
    });

    return { success: true, id: newId };
  } 
  
  if (validated.action === 'update' && validated.id) {
    const existing = await sql`SELECT * FROM articles WHERE id = ${validated.id}::uuid`;
    
    await sql`
      UPDATE articles 
      SET 
        title = ${validated.title},
        slug = ${validated.slug},
        category = ${validated.category},
        matched_goal_category = ${validated.matchedGoalCategory || null},
        excerpt = ${validated.excerpt},
        read_time = ${validated.readTime},
        status = ${validated.status},
        hero_image_url = ${validated.heroImageUrl || null},
        hero_image_alt = ${validated.heroImageAlt || null},
        author_name = ${validated.authorName || null},
        author_avatar = ${validated.authorAvatar || null},
        author_credential = ${validated.authorCredential || null},
        blocks = ${JSON.stringify(validated.blocks || [])}::jsonb,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${validated.id}::uuid
    `;

    // Dual-update into unified content_items
    try {
      await sql`
        UPDATE content_items
        SET
          title = ${validated.title},
          slug = ${validated.slug},
          category = ${validated.category},
          excerpt = ${validated.excerpt},
          description = ${validated.excerpt},
          image_url = ${validated.heroImageUrl || null},
          author_name = ${validated.authorName || null},
          status = ${validated.status},
          ${validated.isFeatured !== undefined ? sql`is_featured = ${validated.isFeatured},` : sql``}
          ${validated.isTrending !== undefined ? sql`is_trending = ${validated.isTrending},` : sql``}
          ${validated.qualityScore !== undefined ? sql`quality_score = ${validated.qualityScore},` : sql``}
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${validated.id}::uuid;
      `;

      // Sync tags if provided
      if (validated.tags && validated.tags.length > 0) {
        for (const tagName of validated.tags) {
          if (!tagName.trim()) continue;
          const tagRes = await sql`
            INSERT INTO content_tags (name, slug)
            VALUES (${tagName.trim()}, ${tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-')})
            ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
            RETURNING id
          `;
          if (tagRes.length > 0) {
            await sql`
              INSERT INTO content_item_tags (content_item_id, tag_id)
              VALUES (${validated.id}::uuid, ${tagRes[0].id}::uuid)
              ON CONFLICT (content_item_id, tag_id) DO NOTHING
            `;
          }
        }
      }
    } catch (syncErr) {
      console.warn('Failed to sync update to content_items:', syncErr);
    }

    await writeAuditLog({
      adminUserId: session.user.id,
      actionType: 'article_update',
      targetTable: 'articles',
      targetId: validated.id,
      beforeValue: existing[0],
      afterValue: { title: validated.title, status: validated.status }
    });

    return { success: true };
  }

  if (validated.action === 'delete' && validated.id) {
    // Soft delete in articles and content_items
    await sql`UPDATE articles SET deleted_at = CURRENT_TIMESTAMP WHERE id = ${validated.id}::uuid`;
    try {
      await sql`UPDATE content_items SET deleted_at = CURRENT_TIMESTAMP WHERE id = ${validated.id}::uuid`;
    } catch (syncErr) {
      console.warn('Failed to soft delete in content_items:', syncErr);
    }

    await writeAuditLog({
      adminUserId: session.user.id,
      actionType: 'article_delete',
      targetTable: 'articles',
      targetId: validated.id,
      afterValue: { deleted_at: 'NOW()' }
    });

    return { success: true };
  }

  throw new Error('Invalid action or missing ID');
}
