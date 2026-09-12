const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env' });

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not defined in .env');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function fixAds() {
  try {
    console.log('Updating advertisement target URLs in database...');
    const result = await sql`UPDATE advertisements SET target_url = '/blog/boost-immune-system' WHERE target_url LIKE '%healthghuru.com%';`;
    console.log('Ads updated successfully!');
  } catch (error) {
    console.error('Error updating ads:', error);
  }
}

fixAds();
