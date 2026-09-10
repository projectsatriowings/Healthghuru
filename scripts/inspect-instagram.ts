import 'dotenv/config';
import { sql } from '../src/lib/db';

async function main() {
  const instagramItems = await sql`
    SELECT id, title, slug, content_type, canonical_url 
    FROM content_items 
    WHERE canonical_url LIKE '%instagram.com%'
  `;
  console.log(`Instagram items (${instagramItems.length}):`);
  instagramItems.forEach((item: any) => {
    console.log(`- [${item.content_type}] ${item.title.slice(0, 50)} (${item.canonical_url})`);
  });
}

main().catch(console.error);
