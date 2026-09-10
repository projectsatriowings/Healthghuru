import 'dotenv/config';
import { sql } from '../src/lib/db';

async function main() {
  const indexes = await sql`
    SELECT indexname, indexdef 
    FROM pg_indexes 
    WHERE tablename = 'content_items'
  `;
  console.log('Indexes on content_items:', indexes);

  const constraints = await sql`
    SELECT conname, contype, pg_get_constraintdef(oid) 
    FROM pg_constraint 
    WHERE conrelid = 'content_items'::regclass
  `;
  console.log('Constraints on content_items:', constraints);
}

main().catch(console.error);
