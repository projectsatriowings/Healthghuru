import 'dotenv/config';
import { sql } from '../src/lib/db';

async function enhanceUserAuthSchema() {
  console.log('--- Enhancing User Auth Database Schema ---');

  try {
    // 1. Add reset_token and reset_token_expires if they do not exist
    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255),
      ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS remember_token VARCHAR(255),
      ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
    `;
    console.log('✓ Added auth fields to users table (reset_token, reset_token_expires, email_verified, last_login_at)');

    // 2. Ensure role column allows standard roles: user, subscriber, admin
    // Remove check constraint if restrictive or update it
    try {
      await sql`
        ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
      `;
      await sql`
        ALTER TABLE users ADD CONSTRAINT users_role_check 
        CHECK (role IN ('user', 'subscriber', 'admin', 'editor'));
      `;
      console.log('✓ Updated users_role_check constraint');
    } catch (e: any) {
      console.log('Note on constraint:', e.message);
    }

    // 3. Create index for fast email lookups
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email_lower ON users(LOWER(email));`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token) WHERE reset_token IS NOT NULL;`;

    console.log('--- User Auth Database Schema Ready ---');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

enhanceUserAuthSchema();
