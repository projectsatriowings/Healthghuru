import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { auth } from '@/lib/auth/auth.config';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const articleId = searchParams.get('articleId');

    if (!articleId) {
      return NextResponse.json({ success: false, error: 'Article ID required' }, { status: 400 });
    }

    const comments = await sql`
      SELECT c.id, c.content, c.created_at, c.is_hidden, u.name as user_name, u.role as user_role
      FROM article_comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.article_id = ${articleId} AND c.is_hidden = FALSE
      ORDER BY c.created_at DESC
    `;

    return NextResponse.json({ success: true, comments });
  } catch (error: any) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { articleId, content } = await req.json();

    if (!articleId || !content) {
      return NextResponse.json({ success: false, error: 'Article ID and content required' }, { status: 400 });
    }

    const newComment = await sql`
      INSERT INTO article_comments (article_id, user_id, content)
      VALUES (${articleId}, ${session.user.id}, ${content})
      RETURNING *
    `;

    // Fetch the user details to return with the comment
    const userRes = await sql`SELECT name, role FROM users WHERE id = ${session.user.id}`;
    const commentWithUser = {
      ...newComment[0],
      user_name: userRes[0].name,
      user_role: userRes[0].role
    };

    return NextResponse.json({ success: true, comment: commentWithUser });
  } catch (error: any) {
    console.error('Error posting comment:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure user is admin
    const userRes = await sql`SELECT role FROM users WHERE id = ${session.user.id}`;
    if (userRes.length === 0 || userRes[0].role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Only admins can moderate comments' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const commentId = searchParams.get('id');

    if (!commentId) {
      return NextResponse.json({ success: false, error: 'Comment ID required' }, { status: 400 });
    }

    // Soft delete (hide) the comment
    await sql`UPDATE article_comments SET is_hidden = TRUE WHERE id = ${commentId}`;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting comment:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
