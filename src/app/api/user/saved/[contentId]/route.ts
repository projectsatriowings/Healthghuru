import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth.config';
import { sql } from '@/lib/db';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { contentId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const { contentId } = params;

    if (!contentId) {
      return NextResponse.json({ error: 'Missing contentId.' }, { status: 400 });
    }

    await sql`
      DELETE FROM user_saved_content 
      WHERE user_id = ${session.user.id}::uuid 
        AND content_id = ${contentId}::uuid
    `;

    // Decrement bookmark count safely
    try {
      await sql`
        UPDATE content_items 
        SET bookmark_count = GREATEST(bookmark_count - 1, 0) 
        WHERE id = ${contentId}::uuid
      `;
    } catch {
      // Non-blocking
    }

    return NextResponse.json({
      success: true,
      message: 'Item removed from saved library.',
      saved: false,
    });
  } catch (error: any) {
    console.error('Error in DELETE /api/user/saved/[contentId]:', error);
    return NextResponse.json({ error: 'Failed to remove saved item.' }, { status: 500 });
  }
}
