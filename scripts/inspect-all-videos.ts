import 'dotenv/config';
import { sql } from '../src/lib/db';

async function main() {
  const items = await sql`
    SELECT id, title, slug, content_type, video_id, canonical_url, author_name, image_url
    FROM content_items
    WHERE content_type = 'video'
    ORDER BY published_at DESC
  `;

  console.log(`Found ${items.length} videos:`);
  items.forEach((item: any, index: number) => {
    console.log(`[${index + 1}] ID: ${item.id}`);
    console.log(`    Title: ${item.title}`);
    console.log(`    Slug: ${item.slug}`);
    console.log(`    Video ID: ${item.video_id}`);
    console.log(`    Canonical URL: ${item.canonical_url}`);
    console.log(`    Author: ${item.author_name}`);
    console.log('----------------------------------------------------');
  });
}

main().catch(console.error);
