import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth.config';
import { sql } from '@/lib/db';

const VALID_ACTIONS = [
  'view',
  'open',
  'read',
  'watch',
  'save',
  'category_click',
  'share',
  'magazine_read',
] as const;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contentId, action, category, metadata = {} } = body;

    if (!action || !VALID_ACTIONS.includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing activity action' },
        { status: 400 }
      );
    }

    const session = await auth();
    const userId = session?.user?.id || null;

    // 1. If user is authenticated, log into user_activity
    if (userId) {
      await sql`
        INSERT INTO user_activity (
          user_id,
          content_id,
          action,
          metadata
        ) VALUES (
          ${userId}::uuid,
          ${contentId ? sql`${contentId}::uuid` : null},
          ${action},
          ${JSON.stringify({ category, ...metadata })}::jsonb
        )
      `;
    }

    // 2. If contentId is provided, increment aggregate counters on content_items
    if (contentId) {
      try {
        if (action === 'view' || action === 'open') {
          await sql`UPDATE content_items SET view_count = view_count + 1 WHERE id = ${contentId}::uuid`;
        } else if (action === 'read' || action === 'watch') {
          await sql`UPDATE content_items SET view_count = view_count + 1, click_count = click_count + 1 WHERE id = ${contentId}::uuid`;
        } else if (action === 'share') {
          await sql`UPDATE content_items SET share_count = share_count + 1 WHERE id = ${contentId}::uuid`;
        } else if (action === 'save') {
          await sql`UPDATE content_items SET bookmark_count = bookmark_count + 1 WHERE id = ${contentId}::uuid`;
        }
      } catch (counterErr) {
        // Non-blocking counter update
      }
    }

    return NextResponse.json({
      success: true,
      logged: Boolean(userId),
    });
  } catch (error: any) {
    console.error('Error in POST /api/activity:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to record activity' },
      { status: 500 }
    );
  }
}
