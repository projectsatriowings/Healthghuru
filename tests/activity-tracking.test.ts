import 'dotenv/config';
import { sql } from '../src/lib/db';
import bcrypt from 'bcryptjs';

async function testActivityTracking() {
  console.log('========================================================');
  console.log('🧪 TESTING USER ACTIVITY TRACKING & TELEMETRY SYSTEM');
  console.log('========================================================\n');

  const testEmail = `activity_test_${Date.now()}@healthghurutest.com`;
  const testPassword = 'Password123!';
  const testName = 'Marcus Aurelius';

  try {
    // 1. Create a test user
    console.log(`[1] Creating test user for activity tracking: ${testEmail}`);
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(testPassword, salt);

    const userRes = await sql`
      INSERT INTO users (name, email, password_hash, role, status, created_at, updated_at)
      VALUES (${testName}, ${testEmail}, ${passwordHash}, 'user', 'active', NOW(), NOW())
      RETURNING id, name, email;
    `;
    const user = userRes[0];
    console.log('   ✓ Test user created with ID:', user.id);

    // Get a sample content item
    const sampleItem = await sql`
      SELECT id, title, category, view_count, click_count, bookmark_count 
      FROM content_items 
      WHERE status = 'published' AND deleted_at IS NULL 
      LIMIT 1
    `;
    const content = sampleItem[0];
    console.log('   Using sample content item:', content.title);

    // 2. Test Logging 'view' Action
    console.log('\n[2] Testing Logging "view" Action:');
    await sql`
      INSERT INTO user_activity (user_id, content_id, action, metadata)
      VALUES (${user.id}::uuid, ${content.id}::uuid, 'view', ${JSON.stringify({ category: content.category })}::jsonb)
    `;
    console.log('   ✓ "view" action recorded in user_activity');

    // 3. Test Logging 'read' Action
    console.log('\n[3] Testing Logging "read" Action:');
    await sql`
      INSERT INTO user_activity (user_id, content_id, action, metadata)
      VALUES (${user.id}::uuid, ${content.id}::uuid, 'read', ${JSON.stringify({ category: content.category, read_time: 4 })}::jsonb)
    `;
    console.log('   ✓ "read" action recorded in user_activity');

    // 4. Test Logging 'watch' Action
    console.log('\n[4] Testing Logging "watch" Action:');
    await sql`
      INSERT INTO user_activity (user_id, content_id, action, metadata)
      VALUES (${user.id}::uuid, ${content.id}::uuid, 'watch', ${JSON.stringify({ category: content.category, duration: 180 })}::jsonb)
    `;
    console.log('   ✓ "watch" action recorded in user_activity');

    // 5. Test Logging 'category_click' Action
    console.log('\n[5] Testing Logging "category_click" Action:');
    await sql`
      INSERT INTO user_activity (user_id, content_id, action, metadata)
      VALUES (${user.id}::uuid, NULL, 'category_click', ${JSON.stringify({ category: 'Nutrition' })}::jsonb)
    `;
    console.log('   ✓ "category_click" action recorded in user_activity');

    // 6. Test Logging 'save' Action
    console.log('\n[6] Testing Logging "save" Action:');
    await sql`
      INSERT INTO user_activity (user_id, content_id, action, metadata)
      VALUES (${user.id}::uuid, ${content.id}::uuid, 'save', ${JSON.stringify({ category: content.category })}::jsonb)
    `;
    console.log('   ✓ "save" action recorded in user_activity');

    // 7. Verify Recorded Activities in Database
    console.log('\n[7] Verifying Recorded Activity Counts in PostgreSQL:');
    const userActivities = await sql`
      SELECT action, count(*)::int as count 
      FROM user_activity 
      WHERE user_id = ${user.id}::uuid 
      GROUP BY action
    `;
    console.log('   ✓ Activity summary:', userActivities);

    if (userActivities.length === 5) {
      console.log('   ✓ All 5 distinct activity actions verified in database!');
    } else {
      throw new Error('Activity tracking verification failed: mismatch in actions');
    }

    // 8. Cleanup
    await sql`DELETE FROM users WHERE id = ${user.id}::uuid`;
    console.log('\n[8] Cleaned up temporary test user and associated activity records');

    console.log('\n========================================================');
    console.log('🎉 ALL ACTIVITY TRACKING TESTS PASSED 100%!');
    console.log('========================================================\n');
  } catch (err) {
    console.error('❌ Activity tracking test failed:', err);
    process.exit(1);
  }
}

testActivityTracking();
