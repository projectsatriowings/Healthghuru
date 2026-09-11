import 'dotenv/config';
import { sql } from '../src/lib/db';

async function setupUserProfilePreferencesTables() {
  console.log('--- Setting up User Profile, Preferences & Activity Tables ---');

  try {
    // 1. user_preferences table
    await sql`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        topic VARCHAR(100) NOT NULL,
        preference_type VARCHAR(50) NOT NULL DEFAULT 'interest',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, topic, preference_type)
      );
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_pref_user ON user_preferences(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_pref_topic ON user_preferences(topic);`;
    console.log('✓ user_preferences table ready');

    // 2. user_content_preferences table
    await sql`
      CREATE TABLE IF NOT EXISTS user_content_preferences (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content_type VARCHAR(50) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, content_type)
      );
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_content_pref_user ON user_content_preferences(user_id);`;
    console.log('✓ user_content_preferences table ready');

    // 3. user_saved_content table (Universal saved bookmarks for all content_items)
    await sql`
      CREATE TABLE IF NOT EXISTS user_saved_content (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, content_id)
      );
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_saved_content_user ON user_saved_content(user_id, created_at DESC);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_saved_content_item ON user_saved_content(content_id);`;
    console.log('✓ user_saved_content table ready');

    // 4. user_activity table (Reading history & interactions)
    await sql`
      CREATE TABLE IF NOT EXISTS user_activity (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content_id UUID REFERENCES content_items(id) ON DELETE SET NULL,
        action VARCHAR(50) NOT NULL,
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_activity_user ON user_activity(user_id, created_at DESC);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_activity_content ON user_activity(content_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_activity_action ON user_activity(action);`;
    console.log('✓ user_activity table ready');

    // 5. Add profile & notification columns to users table if missing
    await sql`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS bio TEXT,
      ADD COLUMN IF NOT EXISTS avatar_url TEXT,
      ADD COLUMN IF NOT EXISTS newsletter_opt_in BOOLEAN DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS email_digest_frequency VARCHAR(20) DEFAULT 'weekly';
    `;
    console.log('✓ users profile fields enhanced');

    console.log('--- All User Profile & Preference Tables Successfully Created ---');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

setupUserProfilePreferencesTables();
