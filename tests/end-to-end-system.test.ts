import 'dotenv/config';
import { sql } from '../src/lib/db';
import bcrypt from 'bcryptjs';
import { getPersonalizedRecommendations, getPersonalizedWellnessTip } from '../src/lib/recommendations';

async function testFullHealthGuruSystem() {
  console.log('========================================================');
  console.log('🌟 HEALTHGURU COMPLETE E2E SYSTEM INTEGRATION TEST');
  console.log('========================================================\n');

  const testEmail = `e2e_guru_${Date.now()}@healthghurutest.com`;
  const testPassword = 'SecurePassword123!';
  const testName = 'Alex Rivera';

  try {
    // 1. User Registration Flow
    console.log('[1] User Registration & Account Creation:');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(testPassword, salt);

    const userRes = await sql`
      INSERT INTO users (name, email, password_hash, role, status, onboarded, created_at, updated_at)
      VALUES (${testName}, ${testEmail}, ${passwordHash}, 'user', 'active', FALSE, NOW(), NOW())
      RETURNING id, name, email, role, status, onboarded;
    `;
    const user = userRes[0];
    console.log('   ✓ User registered successfully in PostgreSQL:', {
      id: user.id,
      name: user.name,
      email: user.email,
      onboarded: user.onboarded,
    });

    // 2. User Onboarding Flow
    console.log('\n[2] User Onboarding & Preference Selection:');
    const topics = ['Nutrition', 'Gut Health', 'Sleep'];
    const formats = ['article', 'video', 'magazine'];

    for (const topic of topics) {
      await sql`
        INSERT INTO user_preferences (user_id, topic, preference_type)
        VALUES (${user.id}::uuid, ${topic}, 'interest');
      `;
    }
    for (const format of formats) {
      await sql`
        INSERT INTO user_content_preferences (user_id, content_type)
        VALUES (${user.id}::uuid, ${format});
      `;
    }
    await sql`
      UPDATE users SET onboarded = TRUE WHERE id = ${user.id}::uuid;
    `;
    console.log(`   ✓ Onboarded user with ${topics.length} topics and ${formats.length} content formats`);

    // 3. User Telemetry & Activity Tracking
    console.log('\n[3] Simulating User Reading & Watch Telemetry:');
    const sampleItems = await sql`
      SELECT id, title, category, content_type
      FROM content_items
      WHERE status = 'published' AND deleted_at IS NULL
      LIMIT 3;
    `;

    for (const item of sampleItems) {
      await sql`
        INSERT INTO user_activity (user_id, content_id, action, metadata)
        VALUES (${user.id}::uuid, ${item.id}::uuid, 'read', ${JSON.stringify({ category: item.category })}::jsonb);
      `;
    }
    console.log(`   ✓ Logged ${sampleItems.length} user activities into user_activity table`);

    // 4. User Bookmark / Saved Content Flow
    console.log('\n[4] Bookmarking Content in User Library:');
    if (sampleItems.length > 0) {
      const bookmarkedItem = sampleItems[0];
      await sql`
        INSERT INTO user_saved_content (user_id, content_id)
        VALUES (${user.id}::uuid, ${bookmarkedItem.id}::uuid);
      `;
      console.log('   ✓ Bookmarked:', bookmarkedItem.title);
    }

    // 5. Recommendation Engine Personalized Feed
    console.log('\n[5] Generating Rule-Based Personalized Recommendation Feed:');
    const recommendations = await getPersonalizedRecommendations({
      userId: user.id,
      limit: 8,
    });
    console.log(`   ✓ Generated ${recommendations.items.length} ranked items (Personalized: ${recommendations.userPersonalized})`);
    
    if (!recommendations.userPersonalized) {
      throw new Error('Recommendations must be personalized for onboarded user');
    }

    console.log('   Top 3 Ranked Items:');
    recommendations.items.slice(0, 3).forEach((item, i) => {
      console.log(`     ${i + 1}. [Score: ${item.score}] "${item.title.slice(0, 35)}..." (${item.recommendationReason})`);
    });

    // 6. Personalized Daily Wellness Tip
    console.log('\n[6] Fetching Daily Wellness Tip for User:');
    const wellnessTip = await getPersonalizedWellnessTip(user.id);
    if (wellnessTip) {
      console.log('   ✓ Tip Title:', wellnessTip.title);
      console.log('   ✓ Category:', wellnessTip.category);
      console.log('   ✓ Reason:', wellnessTip.recommendationReason);
      console.log('   ✓ Medical Disclaimer:', wellnessTip.disclaimer.slice(0, 50) + '...');
    } else {
      throw new Error('Failed to retrieve daily wellness tip');
    }

    // 7. Cleanup
    console.log('\n[7] Cleaning up test user and relational entities:');
    await sql`DELETE FROM users WHERE id = ${user.id}::uuid;`;
    console.log('   ✓ Test user data deleted cleanly.');

    console.log('\n========================================================');
    console.log('🎉 ALL HEALTHGURU E2E SYSTEM INTEGRATION TESTS PASSED 100%!');
    console.log('========================================================\n');
  } catch (error) {
    console.error('❌ E2E system integration test failed:', error);
    process.exit(1);
  }
}

testFullHealthGuruSystem();
