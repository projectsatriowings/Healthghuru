import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { auth } from '@/lib/auth/auth.config';

export async function GET(req: NextRequest) {
  try {
    const questions = await sql`
      SELECT 
        q.id, q.title, q.content, q.status, q.upvotes, q.created_at,
        u.name as user_name, u.email as user_email,
        (
          SELECT json_agg(
            json_build_object(
              'id', a.id,
              'content', a.content,
              'created_at', a.created_at,
              'expert_name', ex.name,
              'expert_email', ex.email
            )
          )
          FROM expert_answers a
          JOIN users ex ON a.expert_id = ex.id
          WHERE a.question_id = q.id
        ) as answers
      FROM expert_questions q
      JOIN users u ON q.user_id = u.id
      ORDER BY q.upvotes DESC, q.created_at DESC
    `;
    
    return NextResponse.json({ success: true, questions });
  } catch (error: any) {
    console.error('Error fetching expert questions:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { action, questionId, title, content } = await req.json();

    if (action === 'ask') {
      if (!title || !content) {
        return NextResponse.json({ success: false, error: 'Title and content required' }, { status: 400 });
      }

      const newQuestion = await sql`
        INSERT INTO expert_questions (user_id, title, content)
        VALUES (${session.user.id}, ${title}, ${content})
        RETURNING *
      `;

      return NextResponse.json({ success: true, question: newQuestion[0] });
    } 
    else if (action === 'answer') {
      if (!questionId || !content) {
        return NextResponse.json({ success: false, error: 'Question ID and content required' }, { status: 400 });
      }

      // Ensure user is admin
      const userRes = await sql`SELECT role FROM users WHERE id = ${session.user.id}`;
      if (userRes.length === 0 || userRes[0].role !== 'admin') {
        return NextResponse.json({ success: false, error: 'Only admins can answer questions' }, { status: 403 });
      }

      const newAnswer = await sql`
        INSERT INTO expert_answers (question_id, expert_id, content)
        VALUES (${questionId}, ${session.user.id}, ${content})
        RETURNING *
      `;

      // Update question status to answered
      await sql`UPDATE expert_questions SET status = 'answered' WHERE id = ${questionId}`;

      return NextResponse.json({ success: true, answer: newAnswer[0] });
    }
    else if (action === 'upvote') {
      if (!questionId) {
        return NextResponse.json({ success: false, error: 'Question ID required' }, { status: 400 });
      }

      const updated = await sql`
        UPDATE expert_questions 
        SET upvotes = upvotes + 1 
        WHERE id = ${questionId} 
        RETURNING upvotes
      `;
      
      return NextResponse.json({ success: true, upvotes: updated[0].upvotes });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    console.error('Error posting expert question/answer:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
