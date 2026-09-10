import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import {
  MOCK_ARTICLES,
  MOCK_MEALS_TODAY,
  MOCK_WORKOUT_HISTORY,
  MOCK_USER_PLAN,
  MOCK_FAMILY_MEMBERS,
  MOCK_VAULT_RECORDS,
  MOCK_GOALS,
  MOCK_LIBRARY_ARTICLES,
  MOCK_VAULT_ACTIVITY
} from '../src/lib/mockData';

dotenv.config({ path: '.env' });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not defined');
}

const sql = neon(process.env.DATABASE_URL);

async function seedCompleteData() {
  console.log('Seeding demo and mock data into new database...');
  try {
    // 1. Admin and Demo User
    const adminHash = await bcrypt.hash('admin123', 10);
    await sql`
      INSERT INTO users (name, email, password_hash, dob, gender, height, weight, city, role, status)
      VALUES ('System Admin', 'admin@healthghuru.com', ${adminHash}, '1980-01-01', 'other', 170, 70, 'Admin City', 'admin', 'active')
      ON CONFLICT (email) DO UPDATE SET role = 'admin', password_hash = ${adminHash}, status = 'active';
    `;
    console.log('✓ Admin user verified');

    const passwordHash = await bcrypt.hash('password123', 10);
    const existingUsers = await sql`SELECT id FROM users WHERE email = 'user@example.com'`;
    let userId: string;
    if (existingUsers.length === 0) {
      const users = await sql`
        INSERT INTO users (name, email, password_hash, dob, gender, height, weight, city, calorie_target, role, status)
        VALUES ('Mohammed Thalha', 'user@example.com', ${passwordHash}, '1990-01-01', 'male', 175, 80, 'New York', 2200, 'user', 'active')
        RETURNING id;
      `;
      userId = users[0].id;
    } else {
      userId = existingUsers[0].id;
    }
    console.log(`✓ User ID: ${userId}`);

    // 2. User plan
    await sql`
      INSERT INTO user_plans (user_id, tier, records_used, records_limit, active_goals_limit, family_members_limit, ads_enabled, ocr_enabled, data_export_enabled)
      VALUES (${userId}, ${MOCK_USER_PLAN.tier}, ${MOCK_USER_PLAN.recordsUsed}, ${MOCK_USER_PLAN.recordsLimit}, ${MOCK_USER_PLAN.activeGoalsLimit}, ${MOCK_USER_PLAN.familyMembersLimit}, ${MOCK_USER_PLAN.adsEnabled}, ${MOCK_USER_PLAN.ocrEnabled}, ${MOCK_USER_PLAN.dataExportEnabled})
      ON CONFLICT (user_id) DO UPDATE SET 
        tier = EXCLUDED.tier,
        records_limit = EXCLUDED.records_limit,
        active_goals_limit = EXCLUDED.active_goals_limit;
    `;
    console.log('✓ User plan updated');

    // 3. Family members
    const familyMemberMap = new Map<string, string>();
    for (const member of MOCK_FAMILY_MEMBERS) {
      const existing = await sql`
        SELECT id FROM family_members WHERE user_id = ${userId}::uuid AND name = ${member.name}
      `;
      if (existing.length > 0) {
        familyMemberMap.set(member.id, existing[0].id);
      } else {
        const inserted = await sql`
          INSERT INTO family_members (user_id, name, relationship, avatar_initials, dob)
          VALUES (${userId}::uuid, ${member.name}, ${member.relationship}, ${member.avatarInitials}, ${member.dob ? new Date(member.dob) : null})
          RETURNING id;
        `;
        familyMemberMap.set(member.id, inserted[0].id);
      }
    }
    const selfMemberId = familyMemberMap.get('self') || 'self';
    console.log('✓ Family members ready');

    // 4. Articles
    const allArticles = [...MOCK_ARTICLES, ...MOCK_LIBRARY_ARTICLES.filter(a => !MOCK_ARTICLES.some(ma => ma.slug === a.slug))];
    for (const article of allArticles) {
      const articleImage = 'image' in article ? (article as any).image : null;
      const matchedGoal = 'matchedGoalCategory' in article ? (article as any).matchedGoalCategory : null;
      const blocks = [
        { type: 'paragraph', id: '1', text: article.excerpt },
        { type: 'heading', id: '2', text: 'Overview', level: 2 },
        { type: 'paragraph', id: '3', text: `${article.title} provides evidence-based techniques to improve daily wellness, optimize lifestyle habits, and sustain peak long-term health.` }
      ];

      const inserted = await sql`
        INSERT INTO articles (
          slug, title, category, excerpt, read_time, publish_date,
          hero_image_url, hero_image_alt, tags, blocks, matched_goal_category, status
        )
        VALUES (
          ${article.slug},
          ${article.title},
          ${article.category},
          ${article.excerpt},
          ${article.readTime},
          ${new Date(article.date)},
          ${articleImage},
          ${article.title},
          ARRAY[${article.category}],
          ${JSON.stringify(blocks)}::jsonb,
          ${matchedGoal},
          'published'
        )
        ON CONFLICT (slug) DO UPDATE SET
          hero_image_url = EXCLUDED.hero_image_url,
          excerpt = EXCLUDED.excerpt,
          blocks = EXCLUDED.blocks
        RETURNING id;
      `;

      if (article.saved && inserted.length > 0) {
        await sql`
          INSERT INTO user_saved_articles (user_id, article_id)
          VALUES (${userId}::uuid, ${inserted[0].id}::uuid)
          ON CONFLICT DO NOTHING;
        `;
      }
    }
    console.log(`✓ ${allArticles.length} articles seeded`);

    // 5. Vault Records
    for (const record of MOCK_VAULT_RECORDS) {
      // both vault_records and app_vault_records
      await sql`
        INSERT INTO vault_records (user_id, type, title, record_date, doctor_or_facility, tags, file_name, created_at)
        VALUES (${userId}::uuid, ${record.type}, ${record.title}, ${new Date(record.date)}, ${record.doctorOrFacility || null}, ${record.tags}, ${record.fileName}, ${new Date(record.createdAt)})
        ON CONFLICT DO NOTHING;
      `;
      await sql`
        INSERT INTO app_vault_records (id, user_id, member_id, type, title, date, doctor_or_facility, tags, file_name, created_at)
        VALUES (
          ${record.id},
          ${userId},
          ${record.memberId || selfMemberId},
          ${record.type},
          ${record.title},
          ${record.date},
          ${record.doctorOrFacility || null},
          ${JSON.stringify(record.tags)}::jsonb,
          ${record.fileName},
          ${new Date(record.createdAt)}
        )
        ON CONFLICT (id) DO NOTHING;
      `;
    }
    console.log('✓ Vault records seeded');

    // 6. Goals
    for (const goal of MOCK_GOALS) {
      await sql`
        INSERT INTO app_vault_goals (id, user_id, member_id, title, category, start_value, target_value, unit, target_date, status, history)
        VALUES (
          ${goal.id},
          ${userId},
          ${goal.memberId || selfMemberId},
          ${goal.title},
          ${goal.category},
          ${goal.startValue},
          ${goal.targetValue},
          ${goal.unit},
          ${new Date(goal.targetDate)},
          ${goal.status},
          ${JSON.stringify(goal.history || [])}::jsonb
        )
        ON CONFLICT (id) DO NOTHING;
      `;

      const insertedGoal = await sql`
        INSERT INTO goals (user_id, title, category, start_value, target_value, unit, target_date, status)
        VALUES (${userId}::uuid, ${goal.title}, ${goal.category}, ${goal.startValue}, ${goal.targetValue}, ${goal.unit}, ${new Date(goal.targetDate)}, ${goal.status})
        RETURNING id;
      `;
      if (insertedGoal.length > 0) {
        const goalId = insertedGoal[0].id;
        for (const history of goal.history) {
          await sql`
            INSERT INTO goal_progress_entries (goal_id, entry_date, value)
            VALUES (${goalId}, ${new Date(history.date)}, ${history.value});
          `;
        }
      }
    }
    console.log('✓ Goals and progress entries seeded');

    // 7. Activity Events
    for (const event of MOCK_VAULT_ACTIVITY) {
      await sql`
        INSERT INTO vault_activity_events (user_id, type, label, event_timestamp, link_href)
        VALUES (${userId}::uuid, ${event.type}, ${event.label}, ${new Date(event.timestamp)}, ${event.linkHref});
      `;
    }
    console.log('✓ Vault activity events seeded');

    // 8. Workout history
    for (const workout of MOCK_WORKOUT_HISTORY) {
      await sql`
        INSERT INTO workout_logs (user_id, log_date, type, duration, intensity, calories)
        VALUES (${userId}::uuid, ${new Date(workout.date)}, ${workout.type}, ${workout.duration}, 'moderate', ${workout.calories});
      `;
    }
    console.log('✓ Workout logs seeded');

    // 9. Meal Logs
    const today = new Date().toISOString().split('T')[0];
    const insertedMealLog = await sql`
      INSERT INTO meal_logs (user_id, log_date)
      VALUES (${userId}::uuid, ${today})
      ON CONFLICT (user_id, log_date) DO UPDATE SET log_date = EXCLUDED.log_date
      RETURNING id;
    `;
    const mealLogId = insertedMealLog[0].id;

    for (const type of ['breakfast', 'lunch', 'dinner', 'snacks']) {
      const items = MOCK_MEALS_TODAY[type as keyof typeof MOCK_MEALS_TODAY];
      for (const item of items) {
        await sql`
          INSERT INTO meal_items (meal_log_id, meal_type, name, calories, protein, carbs, fat)
          VALUES (${mealLogId}, ${type}, ${item.name}, ${item.calories}, ${item.protein}, ${item.carbs}, ${item.fat});
        `;
      }
    }
    console.log('✓ Meal logs seeded');

    // 10. Sleep Logs
    const sampleSleepLogs = [
      { date: '2026-06-01', bedtime: '22:30:00', wakeTime: '06:45:00', duration: 8.25, quality: 4, notes: 'Deep restful sleep, felt energized.' },
      { date: '2026-06-02', bedtime: '23:15:00', wakeTime: '07:00:00', duration: 7.75, quality: 3, notes: 'Slightly interrupted early morning.' },
      { date: '2026-06-03', bedtime: '22:00:00', wakeTime: '06:30:00', duration: 8.5, quality: 5, notes: 'Optimal sleep schedule restored.' }
    ];
    for (const s of sampleSleepLogs) {
      await sql`
        INSERT INTO sleep_logs (user_id, log_date, bedtime, wake_time, duration, quality, notes)
        VALUES (${userId}::uuid, ${new Date(s.date)}, ${s.bedtime}, ${s.wakeTime}, ${s.duration}, ${s.quality}, ${s.notes});
      `;
    }
    console.log('✓ Sleep logs seeded');

    // 11. Journal Entries
    const sampleJournal = [
      { date: '2026-06-01', text: 'Started the new cardio routine and felt motivated throughout the afternoon.', mood: 4 },
      { date: '2026-06-02', text: 'Focused on hydration and clean eating today. Energy levels remained stable.', mood: 5 },
      { date: '2026-06-03', text: 'A bit busy with work meetings, but managed a 20-minute stretching session.', mood: 4 }
    ];
    for (const j of sampleJournal) {
      await sql`
        INSERT INTO journal_entries (user_id, entry_date, text, mood)
        VALUES (${userId}::uuid, ${new Date(j.date)}, ${j.text}, ${j.mood});
      `;
    }
    console.log('✓ Journal entries seeded');


    console.log('\nAll data seeded successfully into the new database!');
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedCompleteData();
