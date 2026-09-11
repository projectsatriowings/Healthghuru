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
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10), 0);

    const savedItems = await sql`
      SELECT 
        i.*,
        s.name as source_name,
        s.trust_score as source_trust_score,
        s.type as source_type,
        s.website_url as source_website_url,
        sc.created_at as saved_at
      FROM user_saved_content sc
      JOIN content_items i ON sc.content_id = i.id
      LEFT JOIN content_sources s ON i.source_id = s.id
      WHERE sc.user_id = ${session.user.id}::uuid
        AND i.deleted_at IS NULL
      ORDER BY sc.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const countRes = await sql`
      SELECT COUNT(*)::int as total
      FROM user_saved_content sc
      JOIN content_items i ON sc.content_id = i.id
      WHERE sc.user_id = ${session.user.id}::uuid AND i.deleted_at IS NULL
    `;
    const total = countRes[0]?.total || 0;

    return NextResponse.json({
      success: true,
      items: savedItems,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + savedItems.length < total,
      },
    });
  } catch (error: any) {
    console.error('Error in GET /api/user/saved:', error);
    return NextResponse.json({ error: 'Failed to fetch saved content.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const body = await req.json();
    const { contentId } = body;

    if (!contentId || typeof contentId !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid contentId.' }, { status: 400 });
    }

    // Insert into user_saved_content
    await sql`
      INSERT INTO user_saved_content (user_id, content_id)
      VALUES (${session.user.id}::uuid, ${contentId}::uuid)
      ON CONFLICT (user_id, content_id) DO NOTHING
    `;

    // Increment bookmark counter on content_items
    try {
      await sql`
        UPDATE content_items 
        SET bookmark_count = bookmark_count + 1 
        WHERE id = ${contentId}::uuid
      `;
    } catch {
      // Non-blocking
    }

    // Log save activity
    try {
      await sql`
        INSERT INTO user_activity (user_id, content_id, action)
        VALUES (${session.user.id}::uuid, ${contentId}::uuid, 'save')
      `;
    } catch {
      // Non-blocking
    }

    return NextResponse.json({
      success: true,
      message: 'Item saved to your library!',
      saved: true,
    });
  } catch (error: any) {
    console.error('Error in POST /api/user/saved:', error);
    return NextResponse.json({ error: 'Failed to save item.' }, { status: 500 });
  }
}
