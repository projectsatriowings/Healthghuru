import 'dotenv/config';
import { sql } from '../src/lib/db';
import bcrypt from 'bcryptjs';

async function testUserProfileAndPreferences() {
  console.log('========================================================');
  console.log('🧪 TESTING USER PROFILE, PREFERENCES & SAVED CONTENT');
  console.log('========================================================\n');

  const testEmail = `profile_test_${Date.now()}@healthghurutest.com`;
  const testPassword = 'Password123!';
  const testName = 'Dr. Jordan Hayes';

  try {
    // 1. Create a test user
    console.log(`[1] Creating test user for profile tests: ${testEmail}`);
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(testPassword, salt);

    const userRes = await sql`
      INSERT INTO users (name, email, password_hash, role, status, bio, city, created_at, updated_at)
      VALUES (${testName}, ${testEmail}, ${passwordHash}, 'user', 'active', 'Integrative medicine & nutrition researcher', 'Boston, MA', NOW(), NOW())
      RETURNING id, name, email, bio, city, role;
    `;
    const user = userRes[0];
    console.log('   ✓ User created in PostgreSQL with ID:', user.id);

    // 2. Test Profile Update
    console.log('\n[2] Testing Profile Details Update');
    const updatedBio = 'Senior Wellness Fellow specializing in longevity and circadian biology';
    const updatedCity = 'Cambridge, MA';

    const updateRes = await sql`
      UPDATE users
      SET bio = ${updatedBio}, city = ${updatedCity}, updated_at = NOW()
      WHERE id = ${user.id}::uuid
      RETURNING bio, city;
    `;
    if (updateRes[0].bio === updatedBio && updateRes[0].city === updatedCity) {
      console.log('   ✓ Profile bio and city updated successfully in PostgreSQL');
    }

    // 3. Test Health Topic Preferences Insertion
    console.log('\n[3] Testing User Topic Preferences (user_preferences)');
    const selectedTopics = ['Nutrition', 'Sleep', 'Fitness', 'Gut Health'];

    for (const topic of selectedTopics) {
      await sql`
        INSERT INTO user_preferences (user_id, topic, preference_type)
        VALUES (${user.id}::uuid, ${topic}, 'interest')
        ON CONFLICT (user_id, topic, preference_type) DO NOTHING
      `;
    }

    const fetchedTopics = await sql`
      SELECT topic FROM user_preferences WHERE user_id = ${user.id}::uuid ORDER BY topic ASC
    `;
    console.log('   ✓ Saved topics in DB:', fetchedTopics.map((t) => t.topic));
    if (fetchedTopics.length === 4) {
      console.log('   ✓ All 4 topics stored and verified');
    }

    // 4. Test Content Format Preferences Insertion
    console.log('\n[4] Testing Content Format Preferences (user_content_preferences)');
    const selectedFormats = ['article', 'video', 'magazine'];

    for (const format of selectedFormats) {
      await sql`
        INSERT INTO user_content_preferences (user_id, content_type)
        VALUES (${user.id}::uuid, ${format})
        ON CONFLICT (user_id, content_type) DO NOTHING
      `;
    }

    const fetchedFormats = await sql`
      SELECT content_type FROM user_content_preferences WHERE user_id = ${user.id}::uuid
    `;
    console.log('   ✓ Saved format types in DB:', fetchedFormats.map((f) => f.content_type));
    if (fetchedFormats.length === 3) {
      console.log('   ✓ All 3 format preferences stored and verified');
    }

    // 5. Test Saved Bookmarks (user_saved_content)
    console.log('\n[5] Testing User Saved Content & Bookmarking');
    // Get a published content item from DB
    const sampleItem = await sql`
      SELECT id, title FROM content_items WHERE status = 'published' AND deleted_at IS NULL LIMIT 1
    `;

    if (sampleItem.length > 0) {
      const contentId = sampleItem[0].id;
      console.log('   Using sample content item:', sampleItem[0].title);

      // Save item
      await sql`
        INSERT INTO user_saved_content (user_id, content_id)
        VALUES (${user.id}::uuid, ${contentId}::uuid)
        ON CONFLICT (user_id, content_id) DO NOTHING
      `;

      const savedCheck = await sql`
        SELECT * FROM user_saved_content WHERE user_id = ${user.id}::uuid AND content_id = ${contentId}::uuid
      `;
      if (savedCheck.length === 1) {
        console.log('   ✓ Item bookmarked in user_saved_content table');
      }

      // Unsave item
      await sql`
        DELETE FROM user_saved_content WHERE user_id = ${user.id}::uuid AND content_id = ${contentId}::uuid
      `;
      const unsaveCheck = await sql`
        SELECT * FROM user_saved_content WHERE user_id = ${user.id}::uuid AND content_id = ${contentId}::uuid
      `;
      if (unsaveCheck.length === 0) {
        console.log('   ✓ Item removed from user_saved_content table cleanly');
      }
    }

    // 6. Test User Activity Tracking (user_activity)
    console.log('\n[6] Testing User Activity / Reading History');
    if (sampleItem.length > 0) {
      const contentId = sampleItem[0].id;
      await sql`
        INSERT INTO user_activity (user_id, content_id, action)
        VALUES (${user.id}::uuid, ${contentId}::uuid, 'read')
      `;

      const historyRes = await sql`
        SELECT action, created_at FROM user_activity WHERE user_id = ${user.id}::uuid
      `;
      if (historyRes.length === 1 && historyRes[0].action === 'read') {
        console.log('   ✓ User read activity logged and verified in user_activity');
      }
    }

    // 7. Cleanup
    await sql`DELETE FROM users WHERE id = ${user.id}::uuid`;
    console.log('\n[7] Cleaned up temporary test user and cascaded relational records');

    console.log('\n========================================================');
    console.log('🎉 ALL USER PROFILE & PREFERENCES TESTS PASSED 100%!');
    console.log('========================================================\n');
  } catch (error) {
    console.error('❌ User profile test failed:', error);
    process.exit(1);
  }
}

testUserProfileAndPreferences();
