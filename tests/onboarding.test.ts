import 'dotenv/config';
import { sql } from '../src/lib/db';
import bcrypt from 'bcryptjs';

async function testOnboardingFlow() {
  console.log('========================================================');
  console.log('🧪 TESTING USER ONBOARDING & PREFERENCE PERSISTENCE');
  console.log('========================================================\n');

  const testEmail = `onboard_test_${Date.now()}@healthghurutest.com`;
  const testPassword = 'Password123!';
  const testName = 'Elena Rostova';

  try {
    // 1. Create a newly registered user
    console.log(`[1] Creating new user for onboarding test: ${testEmail}`);
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(testPassword, salt);

    const userRes = await sql`
      INSERT INTO users (name, email, password_hash, role, status, onboarded, created_at, updated_at)
      VALUES (${testName}, ${testEmail}, ${passwordHash}, 'user', 'active', FALSE, NOW(), NOW())
      RETURNING id, name, email, onboarded;
    `;
    const user = userRes[0];
    console.log('   ✓ New user created with ID:', user.id, '| Initial onboarded status:', user.onboarded);

    if (user.onboarded !== false) {
      throw new Error('Initial onboarded status should be false');
    }

    // 2. Simulate Step 1 & Step 2: Submit Topics & Content Formats
    console.log('\n[2] Submitting Onboarding Selections (Topics & Content Types)');
    const selectedTopics = ['Nutrition', 'Fitness', 'Sleep', 'Heart Health', 'Healthy Aging'];
    const selectedFormats = ['article', 'video', 'short', 'health_tip', 'magazine'];

    // Insert topics
    for (const topic of selectedTopics) {
      await sql`
        INSERT INTO user_preferences (user_id, topic, preference_type)
        VALUES (${user.id}::uuid, ${topic}, 'interest')
        ON CONFLICT (user_id, topic, preference_type) DO NOTHING
      `;
    }

    // Insert formats
    for (const format of selectedFormats) {
      await sql`
        INSERT INTO user_content_preferences (user_id, content_type)
        VALUES (${user.id}::uuid, ${format})
        ON CONFLICT (user_id, content_type) DO NOTHING
      `;
    }

    // Mark as onboarded
    await sql`
      UPDATE users 
      SET onboarded = TRUE, updated_at = NOW() 
      WHERE id = ${user.id}::uuid
    `;

    // 3. Verify Database Persistence
    console.log('\n[3] Verifying Database Records');
    const dbTopics = await sql`
      SELECT topic FROM user_preferences WHERE user_id = ${user.id}::uuid ORDER BY topic ASC
    `;
    const dbFormats = await sql`
      SELECT content_type FROM user_content_preferences WHERE user_id = ${user.id}::uuid ORDER BY content_type ASC
    `;
    const dbUser = await sql`
      SELECT onboarded FROM users WHERE id = ${user.id}::uuid
    `;

    console.log('   ✓ Topics in DB:', dbTopics.map((t) => t.topic));
    console.log('   ✓ Formats in DB:', dbFormats.map((f) => f.content_type));
    console.log('   ✓ User onboarded status:', dbUser[0]?.onboarded);

    if (dbTopics.length === 5 && dbFormats.length === 5 && dbUser[0]?.onboarded === true) {
      console.log('   ✓ All 5 topics, 5 formats, and onboarded flag verified successfully!');
    } else {
      throw new Error('Database verification failed for onboarding selections');
    }

    // 4. Cleanup
    await sql`DELETE FROM users WHERE id = ${user.id}::uuid`;
    console.log('\n[4] Cleaned up temporary test user');

    console.log('\n========================================================');
    console.log('🎉 ALL ONBOARDING TESTS PASSED 100%!');
    console.log('========================================================\n');
  } catch (err) {
    console.error('❌ Onboarding test failed:', err);
    process.exit(1);
  }
}

testOnboardingFlow();
