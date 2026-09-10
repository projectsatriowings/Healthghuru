import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { runIngestionPipeline } from '../src/lib/ingestion/pipeline';

const sql = neon(process.env.DATABASE_URL);

async function testAllSources() {
  console.log('Testing live ingestion on seeded sources...');
  
  const sources = await sql`
    SELECT * FROM content_sources WHERE enabled = TRUE ORDER BY name ASC
  `;

  for (const s of sources) {
    console.log(`\n--- Ingesting: ${s.name} (${s.type}) ---`);
    try {
      const result = await runIngestionPipeline(
        {
          id: s.id,
          name: s.name,
          type: s.type,
          feedUrl: s.feed_url,
          websiteUrl: s.website_url,
          youtubeChannelId: s.youtube_channel_id,
          defaultCategory: s.default_category,
          language: s.language,
          country: s.country,
          enabled: s.enabled,
          autoPublish: s.auto_publish,
          requiresReview: s.requires_review,
          priority: s.priority,
          trustScore: s.trust_score,
          fetchIntervalMinutes: s.fetch_interval_minutes,
        },
        { limit: 4 }
      );

      console.log(`Result for ${s.name}:`, {
        status: result.status,
        found: result.itemsFound,
        imported: result.itemsImported,
        duplicates: result.itemsDuplicated,
        errors: result.errors.length > 0 ? result.errors[0]?.errorMessage : 'None',
      });
    } catch (e) {
      console.error(`Failed ${s.name}:`, e.message);
    }
  }

  // Summary of content in DB
  const summary = await sql`
    SELECT content_type, COUNT(*)::int as count
    FROM content_items
    WHERE deleted_at IS NULL
    GROUP BY content_type
  `;
  console.log('\n=======================================');
  console.log('Current Content Catalog in Database:');
  console.log('=======================================');
  summary.forEach((row) => console.log(`  - ${row.content_type}: ${row.count} items`));
}

testAllSources().catch(e => {
  console.error(e);
  process.exit(1);
});
