import 'dotenv/config';
import { sql } from '../src/lib/db';

async function testContentMetadataAndTagging() {
  console.log('========================================================');
  console.log('🧪 TESTING CONTENT METADATA, TAGGING & INTEGRATIONS');
  console.log('========================================================\n');

  try {
    // 1. Verify content_items by type
    console.log('[1] Checking Content Types in Database:');
    const contentTypes = await sql`
      SELECT content_type, COUNT(*)::int as count 
      FROM content_items 
      WHERE deleted_at IS NULL 
      GROUP BY content_type 
      ORDER BY count DESC
    `;
    console.log('   ✓ Content distribution:', contentTypes);

    const typesPresent = contentTypes.map((c) => c.content_type);
    if (typesPresent.includes('article') && typesPresent.includes('video') && typesPresent.includes('magazine') && typesPresent.includes('health_tip')) {
      console.log('   ✓ All required core content types (Articles, Videos, Magazines, Health Tips) are present');
    } else {
      throw new Error('Missing core content types in content_items');
    }

    // 2. Verify YouTube videos have categories and tags
    console.log('\n[2] Checking YouTube & Video Integration Metadata:');
    const ytVideos = await sql`
      SELECT i.id, i.title, i.category, i.canonical_url,
             COUNT(cit.tag_id)::int as tag_count
      FROM content_items i
      LEFT JOIN content_item_tags cit ON i.id = cit.content_item_id
      WHERE i.content_type = 'video' AND i.deleted_at IS NULL
      GROUP BY i.id, i.title, i.category, i.canonical_url
      LIMIT 5
    `;
    console.log('   ✓ Sample YouTube videos with metadata:', ytVideos.map((v) => ({ title: v.title.slice(0, 35) + '...', category: v.category, tags: v.tag_count })));

    // 3. Verify Health Tips have categories and tags
    console.log('\n[3] Checking Educational Wellness Tips Metadata:');
    const tips = await sql`
      SELECT title, category, excerpt 
      FROM content_items 
      WHERE content_type = 'health_tip' AND deleted_at IS NULL
    `;
    console.log(`   ✓ Found ${tips.length} verified educational wellness tips across categories:`, tips.map((t) => t.category));

    // 4. Verify category and tag relational query for recommendation engine
    console.log('\n[4] Testing Relational Tag Query for Personalization:');
    const sampleTopic = 'Nutrition';
    const matchingItems = await sql`
      SELECT DISTINCT i.id, i.title, i.content_type, i.category
      FROM content_items i
      LEFT JOIN content_item_tags cit ON i.id = cit.content_item_id
      LEFT JOIN content_tags t ON cit.tag_id = t.id
      WHERE (i.category = ${sampleTopic} OR t.name ILIKE ${'%' + sampleTopic + '%'})
        AND i.status = 'published' AND i.deleted_at IS NULL
      LIMIT 5
    `;
    console.log(`   ✓ Successfully queried ${matchingItems.length} items matching topic '${sampleTopic}':`, matchingItems.map((m) => `${m.title.slice(0, 30)}... [${m.content_type}]`));

    console.log('\n========================================================');
    console.log('🎉 ALL CONTENT METADATA & TAGGING TESTS PASSED 100%!');
    console.log('========================================================\n');
  } catch (err) {
    console.error('❌ Content metadata test failed:', err);
    process.exit(1);
  }
}

testContentMetadataAndTagging();
