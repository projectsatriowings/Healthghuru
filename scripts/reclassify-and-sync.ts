import 'dotenv/config';
import { sql } from '../src/lib/db';
import { runScheduledIngestion } from '../src/lib/ingestion/scheduler';

async function main() {
  console.log('🔄 1. Reclassifying existing database records...');

  // 1. YouTube videos
  await sql`
    UPDATE content_items
    SET content_type = 'video',
        subcategory = CASE
          WHEN LOWER(title) LIKE '%#short%' OR LOWER(COALESCE(description, '')) LIKE '%#short%' OR (duration_seconds > 0 AND duration_seconds <= 60) THEN 'short'
          ELSE 'video'
        END
    WHERE canonical_url LIKE '%youtube.com%' OR canonical_url LIKE '%youtu.be%' OR video_id IS NOT NULL;
  `;

  // 2. Instagram Reels
  await sql`
    UPDATE content_items
    SET content_type = 'video',
        subcategory = 'short'
    WHERE canonical_url LIKE '%instagram.com/reel%' OR canonical_url LIKE '%instagram.com/reels%';
  `;

  // 3. Instagram standard posts (/p/)
  await sql`
    UPDATE content_items
    SET content_type = 'article',
        subcategory = 'infographic'
    WHERE canonical_url LIKE '%instagram.com/p/%' AND canonical_url NOT LIKE '%/reel%';
  `;

  console.log('✅ Reclassification complete.');

  console.log('🔄 2. Running active ingestion pipeline across all channels...');
  const summary = await runScheduledIngestion({ limitPerSource: 20 });
  console.log(`✅ Ingestion finished: ${summary.totalImported} new items imported, ${summary.totalErrors} errors.`);

  // Check counts
  const counts = await sql`
    SELECT content_type, subcategory, COUNT(*) as count
    FROM content_items
    GROUP BY content_type, subcategory
    ORDER BY count DESC;
  `;

  console.log('\n📊 Current Database Breakdown:');
  counts.forEach((c: any) => {
    console.log(` - [${c.content_type}] subcategory: ${c.subcategory || 'none'} -> ${c.count} items`);
  });
}

main().catch(console.error);
