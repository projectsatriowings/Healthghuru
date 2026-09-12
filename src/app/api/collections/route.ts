import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { auth } from '@/lib/auth/auth.config';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch collections
    const collections = await sql`
      SELECT id, name, description, created_at
      FROM article_collections
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;

    // Fetch saved articles (with or without collections)
    const savedArticles = await sql`
      SELECT 
        sa.id as saved_id, sa.collection_id,
        a.id, a.slug, a.title, a.category, a.excerpt, a.read_time, 
        a.hero_image_url, a.hero_image_alt, a.publish_date, a.author_name
      FROM user_saved_articles sa
      JOIN articles a ON sa.article_id = a.id
      WHERE sa.user_id = ${userId}
      ORDER BY sa.created_at DESC
    `;

    return NextResponse.json({ success: true, collections, savedArticles });
  } catch (error: any) {
    console.error('Error fetching collections:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const { action } = body;

    if (action === 'create_collection') {
      const { name } = body;
      if (!name) return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 });

      // Enforce Premium Check (Pro tier required for custom collections)
      const planRes = await sql`SELECT tier FROM user_plans WHERE user_id = ${userId}`;
      if (planRes.length === 0 || planRes[0].tier !== 'pro') {
        return NextResponse.json({ success: false, error: 'Premium/Pro account required to create custom collections.' }, { status: 403 });
      }

      const newCollection = await sql`
        INSERT INTO article_collections (user_id, name)
        VALUES (${userId}, ${name})
        RETURNING *
      `;
      return NextResponse.json({ success: true, collection: newCollection[0] });
    }
    
    if (action === 'save_article') {
      const { articleId, collectionId } = body; // collectionId is optional
      if (!articleId) return NextResponse.json({ success: false, error: 'Article ID required' }, { status: 400 });

      // Check if already saved
      const existing = await sql`
        SELECT id FROM user_saved_articles 
        WHERE user_id = ${userId} AND article_id = ${articleId}
      `;

      if (existing.length > 0) {
        const saved = await sql`
          UPDATE user_saved_articles 
          SET collection_id = ${collectionId || null}
          WHERE id = ${existing[0].id}
          RETURNING *
        `;
        return NextResponse.json({ success: true, saved: saved[0] });
      } else {
        const saved = await sql`
          INSERT INTO user_saved_articles (user_id, article_id, collection_id)
          VALUES (${userId}, ${articleId}, ${collectionId || null})
          RETURNING *
        `;
        return NextResponse.json({ success: true, saved: saved[0] });
      }
    }

    if (action === 'remove_article') {
      const { articleId } = body;
      if (!articleId) return NextResponse.json({ success: false, error: 'Article ID required' }, { status: 400 });

      await sql`
        DELETE FROM user_saved_articles 
        WHERE user_id = ${userId} AND article_id = ${articleId}
      `;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    console.error('Error with collection action:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
