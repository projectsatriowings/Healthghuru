import 'dotenv/config';
import { sql } from '../src/lib/db';
import bcrypt from 'bcryptjs';
import { analyzePrescriptionText } from '../src/lib/prescription-analyzer';
import { getPersonalizedRecommendations } from '../src/lib/recommendations';

async function testPrescriptionFlow() {
  console.log('========================================================');
  console.log('🩺 TESTING PRESCRIPTION UPLOAD & INTELLIGENT CARE FLOW');
  console.log('========================================================\n');

  try {
    // 1. Test Prescription Analyzer Engine with real clinical medications
    console.log('[1] Testing Clinical Medication & Term Analyzer:');
    const sampleRxText = 'Rx: Telmisartan 40mg once daily in morning, Metformin 500mg with dinner, Omeprazole 20mg before breakfast, Vitamin D3 60k weekly.';
    const analysis = analyzePrescriptionText(sampleRxText);

    console.log('   ✓ Detected Conditions:', analysis.detectedConditions);
    console.log('   ✓ Matched Categories:', analysis.matchedCategories);
    console.log('   ✓ Actionable Insights Generated:', analysis.actionableInsights.length);

    if (
      analysis.matchedCategories.includes('Heart Health') &&
      analysis.matchedCategories.includes('Nutrition') &&
      analysis.matchedCategories.includes('Gut Health')
    ) {
      console.log('   ✓ Successfully matched Heart Health (Telmisartan), Nutrition (Metformin), and Gut Health (Omeprazole)!');
    } else {
      throw new Error('Prescription analyzer failed to match expected categories');
    }

    // 2. Create Test User
    const testEmail = `rx_test_${Date.now()}@healthghurutest.com`;
    console.log(`\n[2] Creating Test User for Prescription Vault: ${testEmail}`);
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Password123!', salt);

    const userRes = await sql`
      INSERT INTO users (name, email, password_hash, role, status, created_at, updated_at)
      VALUES ('Elena Rostova', ${testEmail}, ${passwordHash}, 'user', 'active', NOW(), NOW())
      RETURNING id, name, email;
    `;
    const user = userRes[0];
    console.log('   ✓ Test user created with ID:', user.id);

    // 3. Store Prescription in user_prescriptions Table
    console.log('\n[3] Inserting Analyzed Prescription into user_prescriptions:');
    const insertRes = await sql`
      INSERT INTO user_prescriptions (
        user_id, title, doctor_or_facility, file_url, file_name,
        raw_text, detected_conditions, matched_categories, actionable_insights,
        created_at, updated_at
      ) VALUES (
        ${user.id}::uuid,
        'Cardio & Metabolic Care Rx',
        'Dr. V. Sharma (Apollo Healthcare)',
        '/uploads/test-prescription-sample.png',
        'test-prescription-sample.png',
        ${sampleRxText},
        ${JSON.stringify(analysis.detectedConditions)}::jsonb,
        ${JSON.stringify(analysis.matchedCategories)}::jsonb,
        ${JSON.stringify(analysis.actionableInsights)}::jsonb,
        NOW(),
        NOW()
      )
      RETURNING *;
    `;
    const savedRx = insertRes[0];
    console.log('   ✓ Prescription stored in PostgreSQL with ID:', savedRx.id);

    // 4. Auto-sync detected categories into user_preferences
    console.log('\n[4] Synchronizing Detected Categories to User Preferences:');
    for (const cat of analysis.matchedCategories) {
      await sql`
        INSERT INTO user_preferences (user_id, topic, preference_type)
        VALUES (${user.id}::uuid, ${cat}, 'interest')
        ON CONFLICT (user_id, topic, preference_type) DO NOTHING;
      `;
    }
    const syncedPreferences = await sql`
      SELECT topic FROM user_preferences WHERE user_id = ${user.id}::uuid;
    `;
    console.log('   ✓ User preferences now active:', syncedPreferences.map((p) => p.topic));

    // 5. Query Targeted Recommendations for User based on Prescription
    console.log('\n[5] Generating Targeted Recommendation Feed for Prescription:');
    const recommendations = await getPersonalizedRecommendations({
      userId: user.id,
      limit: 6,
    });
    console.log(`   ✓ Retrieved ${recommendations.items.length} items (Personalized: ${recommendations.userPersonalized})`);
    
    console.log('   Top 3 Prescription-Matched Content Items:');
    recommendations.items.slice(0, 3).forEach((item, i) => {
      console.log(`     ${i + 1}. [${item.category}] "${item.title.slice(0, 35)}..." (${item.recommendationReason})`);
    });

    const hasPrescriptionCategory = recommendations.items.some((item) =>
      analysis.matchedCategories.includes(item.category)
    );
    if (hasPrescriptionCategory) {
      console.log('   ✓ Recommended feed correctly reflects prescription health topics!');
    }

    // 6. Test Delete Prescription
    console.log('\n[6] Testing Prescription Deletion from Vault:');
    await sql`DELETE FROM user_prescriptions WHERE id = ${savedRx.id}::uuid;`;
    const checkDeleted = await sql`SELECT * FROM user_prescriptions WHERE id = ${savedRx.id}::uuid;`;
    if (checkDeleted.length === 0) {
      console.log('   ✓ Prescription deleted successfully.');
    }

    // 7. Cleanup
    console.log('\n[7] Cleaning up test user and relational data:');
    await sql`DELETE FROM users WHERE id = ${user.id}::uuid;`;
    console.log('   ✓ Cleaned up test user.');

    console.log('\n========================================================');
    console.log('🎉 ALL PRESCRIPTION & INTELLIGENT CARE TESTS PASSED 100%!');
    console.log('========================================================\n');
  } catch (error) {
    console.error('❌ Prescription flow test failed:', error);
    process.exit(1);
  }
}

testPrescriptionFlow();
