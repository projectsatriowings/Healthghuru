const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const sql = neon(process.env.DATABASE_URL);

async function main() {
  const sources = await sql`SELECT id, name, type, website_url, feed_url FROM content_sources`;
  console.log('Sources:', sources);

  const instagramItems = await sql`
    SELECT id, title, canonical_url, image_url, raw_payload
    FROM content_items
    WHERE canonical_url LIKE '%instagram%'
    LIMIT 3
  `;
  console.log('Sample Instagram Items:', JSON.stringify(instagramItems, null, 2));
}

main().catch(console.error);
