import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth.config';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const users = await sql`
      SELECT 
        u.id, u.name, u.email, u.role, u.status, u.bio, u.city, u.avatar_url,
        u.newsletter_opt_in, u.email_digest_frequency, u.created_at, u.last_login_at,
        p.tier as plan_tier, p.records_used, p.records_limit
      FROM users u
      LEFT JOIN user_plans p ON u.id = p.user_id
      WHERE u.id = ${session.user.id}::uuid
    `;

    if (users.length === 0) {
      return NextResponse.json({ error: 'User account not found.' }, { status: 404 });
    }

    const user = users[0];

    // Also get count of saved items and preferences
    const counts = await sql`
      SELECT 
        (SELECT COUNT(*)::int FROM user_saved_content WHERE user_id = ${session.user.id}::uuid) as saved_count,
        (SELECT COUNT(*)::int FROM user_preferences WHERE user_id = ${session.user.id}::uuid) as topics_count,
        (SELECT COUNT(*)::int FROM user_activity WHERE user_id = ${session.user.id}::uuid) as activity_count
    `;

    return NextResponse.json({
      success: true,
      profile: {
        ...user,
        stats: counts[0] || { saved_count: 0, topics_count: 0, activity_count: 0 },
      },
    });
  } catch (error: any) {
    console.error('Error in GET /api/user/profile:', error);
    return NextResponse.json({ error: 'Failed to load profile.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const body = await req.json();
    const { name, bio, city, newsletter_opt_in, email_digest_frequency } = body;

    const cleanName = (typeof name === 'string' && name.trim()) ? name.trim() : session.user.name;
    const cleanBio = typeof bio === 'string' ? bio.trim() : null;
    const cleanCity = typeof city === 'string' ? city.trim() : null;
    const cleanNewsletter = typeof newsletter_opt_in === 'boolean' ? newsletter_opt_in : true;
    const cleanFrequency = ['daily', 'weekly', 'monthly', 'never'].includes(email_digest_frequency)
      ? email_digest_frequency
      : 'weekly';

    const updated = await sql`
      UPDATE users
      SET 
        name = ${cleanName},
        bio = ${cleanBio},
        city = ${cleanCity},
        newsletter_opt_in = ${cleanNewsletter},
        email_digest_frequency = ${cleanFrequency},
        updated_at = NOW()
      WHERE id = ${session.user.id}::uuid
      RETURNING id, name, email, role, bio, city, newsletter_opt_in, email_digest_frequency, updated_at
    `;

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully!',
      profile: updated[0],
    });
  } catch (error: any) {
    console.error('Error in PUT /api/user/profile:', error);
    return NextResponse.json({ error: 'Failed to update profile.' }, { status: 500 });
  }
}
