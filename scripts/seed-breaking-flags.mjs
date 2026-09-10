import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function main() {
  await sql`
    UPDATE content_items
    SET is_breaking = TRUE
    WHERE id IN (
      SELECT id FROM content_items
      WHERE is_external = TRUE
      LIMIT 2
    );
  `;

  await sql`
    UPDATE content_items
    SET is_featured = TRUE, is_trending = TRUE
    WHERE id IN (
      SELECT id FROM content_items
      LIMIT 6
    );
  `;

  console.log('✓ Successfully updated breaking and featured flags on live content items');
}

main().catch(console.error);
