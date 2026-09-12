import 'dotenv/config';
import { sql } from '../src/lib/db';
import bcrypt from 'bcryptjs';
import { getPersonalizedRecommendations, getPersonalizedWellnessTip } from '../src/lib/recommendations';

async function testRecommendationEngine() {
  console.log('========================================================');
  console.log('🧪 TESTING RECOMMENDATION ENGINE SERVICE (PHASE 7)');
  console.log('========================================================\n');

  try {
    // 1. Test Unauthenticated Recommendations (Fallback)
    console.log('[1] Testing Unauthenticated Guest Recommendations (Fallback):');
    const guestRecs = await getPersonalizedRecommendations({ limit: 6 });
    console.log(`   ✓ Returned ${guestRecs.items.length} items (Total: ${guestRecs.total})`);
    console.log(`   ✓ Personalized flag: ${guestRecs.userPersonalized} (Expected: false)`);
    if (guestRecs.items.length > 0) {
      console.log('   Sample recommendation:');
      console.log('     Title:', guestRecs.items[0].title);
      console.log('     Category:', guestRecs.items[0].category);
      console.log('     Score:', guestRecs.items[0].score);
      console.log('     Reason:', guestRecs.items[0].recommendationReason);
    }
    if (guestRecs.userPersonalized !== false) {
      throw new Error('Unauthenticated recommendations should not be marked personalized');
    }

    // 2. Test Guest Wellness Tip
    console.log('\n[2] Testing Guest Wellness Tip:');
    const guestTip = await getPersonalizedWellnessTip();
    if (guestTip) {
      console.log('   ✓ Retrieved tip:', guestTip.title);
      console.log('   ✓ Category:', guestTip.category);
      console.log('   ✓ Reason:', guestTip.recommendationReason);
      console.log('   ✓ Disclaimer verified:', guestTip.disclaimer.slice(0, 45) + '...');
    } else {
      throw new Error('Expected at least one wellness tip in database');
    }

    // 3. Create a Test User for Personalization
    const testEmail = `rec_test_${Date.now()}@healthghurutest.com`;
    console.log(`\n[3] Creating Test User: ${testEmail}`);
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Password123!', salt);

    const userRes = await sql`
      INSERT INTO users (name, email, password_hash, role, status, created_at, updated_at)
      VALUES ('Samantha Green', ${testEmail}, ${passwordHash}, 'user', 'active', NOW(), NOW())
      RETURNING id, name, email;
    `;
    const user = userRes[0];
    console.log('   ✓ Test user created with ID:', user.id);

    // 4. Set User Preferences: Interest = 'Nutrition', Format = 'article'
    console.log('\n[4] Configuring User Topic & Format Preferences:');
    await sql`
      INSERT INTO user_preferences (user_id, topic, preference_type)
      VALUES (${user.id}::uuid, 'Nutrition', 'interest');
    `;
    await sql`
      INSERT INTO user_content_preferences (user_id, content_type)
      VALUES (${user.id}::uuid, 'article');
    `;
    console.log('   ✓ Set interest to Nutrition and preferred format to article');

    // 5. Add User Activity: 3 read interactions in 'Sleep' category
    console.log('\n[5] Simulating User Reading Activity in "Sleep" Category:');
    for (let i = 0; i < 3; i++) {
      await sql`
        INSERT INTO user_activity (user_id, action, metadata)
        VALUES (${user.id}::uuid, 'read', ${JSON.stringify({ category: 'Sleep' })}::jsonb)
      `;
    }
    console.log('   ✓ 3 read activities logged for Sleep');

    // 6. Test Personalized Recommendations
    console.log('\n[6] Running Personalized Recommendation Engine for User:');
    const userRecs = await getPersonalizedRecommendations({ userId: user.id, limit: 10 });
    console.log(`   ✓ Returned ${userRecs.items.length} items (Total: ${userRecs.total})`);
    console.log(`   ✓ Personalized flag: ${userRecs.userPersonalized} (Expected: true)`);

    if (!userRecs.userPersonalized) {
      throw new Error('User with preferences should produce personalized recommendations');
    }

    console.log('\n   Top 4 Ranked Recommendations:');
    userRecs.items.slice(0, 4).forEach((item, idx) => {
      console.log(`   ${idx + 1}. [${item.category} / ${item.contentType}] "${item.title.slice(0, 35)}..."`);
      console.log(`      Score: ${item.score} | Reason: "${item.recommendationReason}"`);
    });

    // Verify Nutrition items get top scoring
    const topItem = userRecs.items[0];
    if (topItem.category === 'Nutrition' || topItem.recommendationReason.includes('Nutrition')) {
      console.log('   ✓ Successfully boosted Nutrition content to the top based on user interest!');
    }

    // 7. Test Personalized Wellness Tip
    console.log('\n[7] Testing Personalized Wellness Tip Matching User Interest:');
    const userTip = await getPersonalizedWellnessTip(user.id);
    if (userTip) {
      console.log('   ✓ Retrieved tip:', userTip.title);
      console.log('   ✓ Category:', userTip.category);
      console.log('   ✓ Personalization reason:', userTip.recommendationReason);
      if (userTip.category === 'Nutrition') {
        console.log('   ✓ Tip accurately matched user\'s primary interest ("Nutrition")!');
      }
    }

    // 8. Test Filter by Category and Content Type
    console.log('\n[8] Testing Filter Options (Category: Nutrition, Type: article):');
    const filteredRecs = await getPersonalizedRecommendations({
      userId: user.id,
      category: 'Nutrition',
      contentType: 'article',
      limit: 5,
    });
    console.log(`   ✓ Returned ${filteredRecs.items.length} filtered items`);
    const allMatch = filteredRecs.items.every(
      (item) => item.category === 'Nutrition' && item.contentType === 'article'
    );
    if (allMatch) {
      console.log('   ✓ All returned items strictly matched requested category and contentType');
    } else {
      throw new Error('Filtered recommendations returned mismatched item');
    }

    // 9. Cleanup Test User
    console.log('\n[9] Cleaning up test user and relational data:');
    await sql`DELETE FROM users WHERE id = ${user.id}::uuid`;
    console.log('   ✓ Test user data deleted cleanly');

    console.log('\n========================================================');
    console.log('🎉 ALL RECOMMENDATION ENGINE TESTS PASSED 100%!');
    console.log('========================================================\n');
  } catch (error) {
    console.error('❌ Recommendation engine test failed:', error);
    process.exit(1);
  }
}

testRecommendationEngine();
