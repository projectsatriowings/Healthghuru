import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth.config';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch user topic interests
    const topics = await sql`
      SELECT topic, preference_type, created_at 
      FROM user_preferences 
      WHERE user_id = ${userId}::uuid
      ORDER BY created_at ASC
    `;

    // Fetch user content type preferences
    const contentTypes = await sql`
      SELECT content_type, created_at 
      FROM user_content_preferences 
      WHERE user_id = ${userId}::uuid
      ORDER BY created_at ASC
    `;

    // Available standard taxonomy categories
    const allCategories = await sql`
      SELECT name, slug, icon_name, description 
      FROM content_categories 
      WHERE is_enabled = TRUE 
      ORDER BY display_order ASC
    `;

    return NextResponse.json({
      success: true,
      selectedTopics: topics.map((t) => t.topic),
      selectedContentTypes: contentTypes.map((c) => c.content_type),
      availableCategories: allCategories,
      availableContentTypes: [
        { id: 'article', label: 'Articles & Stories', description: 'Deep-dive evidence-based articles & clinician insights', icon: 'FileText' },
        { id: 'video', label: 'Videos & Workouts', description: 'Visual routines, workouts & expert discussions', icon: 'Play' },
        { id: 'short', label: 'Shorts & Reels', description: 'Bite-sized rapid wellness tips & exercise demos', icon: 'Zap' },
        { id: 'health_tip', label: 'Daily Wellness Tips', description: 'Actionable micro-habits and nutritional advice', icon: 'Sparkles' },
        { id: 'guide', label: 'Pillar Guides', description: 'Comprehensive starter guides & wellness protocols', icon: 'Compass' },
        { id: 'magazine', label: 'Magazine & Bulletins', description: 'Quarterly clinical digests & institutional reports', icon: 'BookOpen' },
        { id: 'news', label: 'Research & News', description: 'Clinical breakthroughs and medical trial updates', icon: 'Newspaper' },
      ],
    });
  } catch (error: any) {
    console.error('Error in GET /api/user/preferences:', error);
    return NextResponse.json({ error: 'Failed to load user preferences.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const { topics = [], contentTypes = [] } = body;

    if (!Array.isArray(topics) || !Array.isArray(contentTypes)) {
      return NextResponse.json({ error: 'Topics and contentTypes must be arrays.' }, { status: 400 });
    }

    // 1. Update topic preferences
    await sql`DELETE FROM user_preferences WHERE user_id = ${userId}::uuid`;

    for (const topic of topics) {
      if (typeof topic === 'string' && topic.trim()) {
        await sql`
          INSERT INTO user_preferences (user_id, topic, preference_type)
          VALUES (${userId}::uuid, ${topic.trim()}, 'interest')
          ON CONFLICT (user_id, topic, preference_type) DO NOTHING
        `;
      }
    }

    // 2. Update content format preferences
    await sql`DELETE FROM user_content_preferences WHERE user_id = ${userId}::uuid`;

    for (const cType of contentTypes) {
      if (typeof cType === 'string' && cType.trim()) {
        await sql`
          INSERT INTO user_content_preferences (user_id, content_type)
          VALUES (${userId}::uuid, ${cType.trim().toLowerCase()})
          ON CONFLICT (user_id, content_type) DO NOTHING
        `;
      }
    }

    // 3. Mark user as onboarded
    await sql`
      UPDATE users 
      SET onboarded = TRUE, updated_at = NOW() 
      WHERE id = ${userId}::uuid
    `;

    return NextResponse.json({
      success: true,
      message: 'Preferences successfully saved!',
      selectedTopics: topics,
      selectedContentTypes: contentTypes,
    });
  } catch (error: any) {
    console.error('Error in PUT /api/user/preferences:', error);
    return NextResponse.json({ error: 'Failed to save preferences.' }, { status: 500 });
  }
}
