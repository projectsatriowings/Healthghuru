import 'dotenv/config';
import { sql } from '../src/lib/db';
import { classifyContent } from '../src/lib/ingestion/classify';

async function reclassifyVideos() {
  console.log('Reclassifying all videos in content_items based on description and title keywords...');

  const videos = await sql`
    SELECT id, title, description, category, raw_metadata
    FROM content_items 
    WHERE content_type = 'video'
  `;

  console.log(`Found ${videos.length} videos to process.`);

  let updatedCount = 0;
  for (const v of videos) {
    const res = classifyContent(v.title, v.description || '', [], 'Wellness');
    
    // Merge matched_categories into raw_metadata
    const currentMeta = (typeof v.raw_metadata === 'object' && v.raw_metadata !== null) ? v.raw_metadata : {};
    const updatedMeta = {
      ...currentMeta,
      matched_categories: res.matchedCategories,
    };

    // Update category, subcategory, and raw_metadata
    await sql`
      UPDATE content_items 
      SET 
        category = ${res.primaryCategory},
        subcategory = ${res.subcategory || null},
        raw_metadata = ${JSON.stringify(updatedMeta)}::jsonb,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${v.id}::uuid;
    `;

    // Persist tags
    for (const tag of res.tags) {
      const tagSlug = tag.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 50);
      if (!tagSlug) continue;
      try {
        const tagRes = await sql`
          INSERT INTO content_tags (name, slug)
          VALUES (${tag}, ${tagSlug})
          ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
          RETURNING id;
        `;
        if (tagRes[0]?.id) {
          await sql`
            INSERT INTO content_item_tags (content_item_id, tag_id)
            VALUES (${v.id}::uuid, ${tagRes[0].id}::uuid)
            ON CONFLICT DO NOTHING;
          `;
        }
      } catch (err) {
        // Tag collision ignore
      }
    }

    console.log(`✓ [${res.primaryCategory}] Matched: [${res.matchedCategories.join(', ')}] -> ${v.title.substring(0, 45)}...`);
    updatedCount++;
  }

  console.log(`\nSuccessfully updated ${updatedCount} videos!`);

  // Count by primary category
  const breakdown = await sql`
    SELECT category, COUNT(*)::int as count 
    FROM content_items 
    WHERE content_type = 'video'
    GROUP BY category
    ORDER BY count DESC
  `;
  console.log('\nPrimary Category Distribution:');
  breakdown.forEach(b => console.log(` - ${b.category}: ${b.count} videos`));
}

reclassifyVideos().catch(console.error);
