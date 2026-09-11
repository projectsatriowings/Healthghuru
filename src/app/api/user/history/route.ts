import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth.config';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50);

    // Fetch distinct recently engaged content items
    const historyItems = await sql`
      SELECT DISTINCT ON (i.id)
        i.*,
        s.name as source_name,
        s.trust_score as source_trust_score,
        s.type as source_type,
        a.action as last_action,
        a.created_at as viewed_at
      FROM user_activity a
      JOIN content_items i ON a.content_id = i.id
      LEFT JOIN content_sources s ON i.source_id = s.id
      WHERE a.user_id = ${session.user.id}::uuid
        AND i.deleted_at IS NULL
        AND a.action IN ('view', 'read', 'watch', 'open')
      ORDER BY i.id, a.created_at DESC
      LIMIT ${limit}
    `;

    // Sort by viewed_at descending
    historyItems.sort((a, b) => new Date(b.viewed_at).getTime() - new Date(a.viewed_at).getTime());

    return NextResponse.json({
      success: true,
      items: historyItems,
    });
  } catch (error: any) {
    console.error('Error in GET /api/user/history:', error);
    return NextResponse.json({ error: 'Failed to fetch history.' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    await sql`
      DELETE FROM user_activity 
      WHERE user_id = ${session.user.id}::uuid
        AND action IN ('view', 'read', 'watch', 'open')
    `;

    return NextResponse.json({
      success: true,
      message: 'Reading history cleared successfully.',
    });
  } catch (error: any) {
    console.error('Error in DELETE /api/user/history:', error);
    return NextResponse.json({ error: 'Failed to clear history.' }, { status: 500 });
  }
}
