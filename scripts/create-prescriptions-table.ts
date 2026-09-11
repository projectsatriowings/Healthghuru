import 'dotenv/config';
import { sql } from '../src/lib/db';

async function setupPrescriptionsTable() {
  console.log('--- Creating user_prescriptions table in PostgreSQL ---');
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS user_prescriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        doctor_or_facility VARCHAR(255),
        file_url TEXT,
        file_name VARCHAR(255),
        raw_text TEXT,
        detected_conditions JSONB DEFAULT '[]'::jsonb,
        matched_categories JSONB DEFAULT '[]'::jsonb,
        actionable_insights JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_user_prescriptions_user_id ON user_prescriptions(user_id);
    `;

    console.log('✓ user_prescriptions table and indexes created successfully!');
  } catch (error) {
    console.error('Error creating user_prescriptions table:', error);
    process.exit(1);
  }
}

setupPrescriptionsTable();
