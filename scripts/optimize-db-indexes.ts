import 'dotenv/config';
import { sql } from '../src/lib/db';

async function optimizeDb() {
  console.log('Optimizing PostgreSQL database with compound performance indexes...');
  
  await sql`
    CREATE INDEX IF NOT EXISTS idx_ci_type_status_pub 
    ON content_items(content_type, status, published_at DESC) 
    WHERE deleted_at IS NULL;
  `;
  console.log('✓ Created idx_ci_type_status_pub');

  await sql`
    CREATE INDEX IF NOT EXISTS idx_ci_cat_status_pub 
    ON content_items(category, status, published_at DESC) 
    WHERE deleted_at IS NULL;
  `;
  console.log('✓ Created idx_ci_cat_status_pub');

  await sql`
    CREATE INDEX IF NOT EXISTS idx_ci_breaking_pub 
    ON content_items(is_breaking, status, published_at DESC) 
    WHERE deleted_at IS NULL;
  `;
  console.log('✓ Created idx_ci_breaking_pub');

  await sql`
    CREATE INDEX IF NOT EXISTS idx_ci_featured_pub 
    ON content_items(is_featured, status, published_at DESC) 
    WHERE deleted_at IS NULL;
  `;
  console.log('✓ Created idx_ci_featured_pub');

  console.log('All performance indexes successfully established.');
}

optimizeDb().catch(console.error);
