import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { auth } from '@/lib/auth/auth.config';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Check if a plan exists
    const existing = await sql`SELECT id FROM user_plans WHERE user_id = ${userId}`;

    if (existing.length > 0) {
      await sql`
        UPDATE user_plans 
        SET tier = 'pro'
        WHERE user_id = ${userId}
      `;
    } else {
      await sql`
        INSERT INTO user_plans (user_id, tier)
        VALUES (${userId}, 'pro')
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error upgrading user:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
