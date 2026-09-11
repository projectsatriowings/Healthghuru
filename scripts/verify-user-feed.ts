import 'dotenv/config';
import { sql } from '../src/lib/db';
import { getPersonalizedRecommendations, getPersonalizedWellnessTip } from '../src/lib/recommendations';

async function verifyUserFeed() {
  console.log('========================================================');
  console.log('🔍 VERIFYING LIVE PERSONALIZED RECOMMENDATIONS FOR USER');
  console.log('========================================================\n');

  const users = await sql`SELECT id, name, email FROM users WHERE email ILIKE '%priya%' LIMIT 1`;
  if (users.length === 0) {
    console.log('No user found');
    return;
  }
  const u = users[0];
  console.log(`[1] User Account Details:`, { id: u.id, name: u.name, email: u.email });

  const prefs = await sql`SELECT topic FROM user_preferences WHERE user_id = ${u.id}::uuid`;
  console.log(`\n[2] User's Active Health Interests in Database:`, prefs.map((p) => p.topic));

  const rxs = await sql`SELECT id, title, detected_conditions, matched_categories FROM user_prescriptions WHERE user_id = ${u.id}::uuid`;
  console.log(`\n[3] User's Uploaded Prescriptions:`, rxs);

  const recs = await getPersonalizedRecommendations({ userId: u.id, limit: 6 });
  console.log(`\n[4] Output from Recommendation Engine (Total items: ${recs.items.length}, Personalized: ${recs.userPersonalized}):`);
  
  recs.items.forEach((item, i) => {
    console.log(`   ${i + 1}. [${item.category} / ${item.contentType}] "${item.title.slice(0, 45)}..."`);
    console.log(`      Score: ${item.score} | Reason: "${item.recommendationReason}"`);
  });

  const tip = await getPersonalizedWellnessTip(u.id);
  console.log(`\n[5] Output Daily Wellness Tip:`);
  console.log(`   Title: "${tip?.title}"`);
  console.log(`   Category: ${tip?.category}`);
  console.log(`   Reason: "${tip?.recommendationReason}"`);

  console.log('\n========================================================');
}

verifyUserFeed();
