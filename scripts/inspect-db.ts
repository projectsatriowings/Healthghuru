import 'dotenv/config';
import { sql } from '../src/lib/db';

async function auditDatabaseContent() {
  console.log('=== DATABASE CONTENT AUDIT ===');
  
  // 1. Content types in content_items
  const contentTypes = await sql`
    SELECT content_type, COUNT(*)::int as count 
    FROM content_items 
    WHERE status = 'published' AND deleted_at IS NULL
    GROUP BY content_type
  `;
  console.log('\n[1] Published content_items by type:', contentTypes);

  // 2. Categories in content_categories
  const categories = await sql`
    SELECT id, name, slug, description, display_order 
    FROM content_categories 
    ORDER BY display_order ASC
  `;
  console.log('\n[2] Categories in content_categories:', categories.length);
  categories.forEach(c => console.log(`   - ${c.name} (${c.slug})`));

  // 3. Articles table (dual-write / original editorial)
  const articlesCount = await sql`
    SELECT COUNT(*)::int as count FROM articles WHERE status = 'published'
  `;
  console.log('\n[3] Published articles:', articlesCount[0].count);

  // 4. Content sources columns and rows
  const sourceCols = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'content_sources'
  `;
  console.log('\n[4] content_sources columns:', sourceCols.map(c => c.column_name));
  const sources = await sql`SELECT id, name, type, enabled FROM content_sources`;
  console.log('    sources:', sources);

  // 5. Breaking news items
  const breaking = await sql`
    SELECT id, title, category FROM content_items WHERE is_breaking = TRUE AND status = 'published' AND deleted_at IS NULL
  `;
  console.log('\n[5] Breaking news items:', breaking.length);

  // 6. Featured items
  const featured = await sql`
    SELECT id, title, category, content_type FROM content_items WHERE is_featured = TRUE AND status = 'published' AND deleted_at IS NULL
  `;
  console.log('\n[6] Featured items:', featured.length);
}

auditDatabaseContent().catch(console.error);
