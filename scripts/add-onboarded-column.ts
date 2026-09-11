import 'dotenv/config';
import { sql } from '../src/lib/db';

async function addOnboardedColumn() {
  console.log('Adding onboarded column to users table...');
  try {
    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS onboarded BOOLEAN DEFAULT FALSE;
    `;
    console.log('✓ onboarded column verified on users table');
  } catch (err) {
    console.error('Error adding onboarded column:', err);
  }
}

addOnboardedColumn();
