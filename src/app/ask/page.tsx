import { Metadata } from 'next';
import { sql } from '@/lib/db';
import { auth } from '@/lib/auth/auth.config';
import { AskBoardClient } from './AskBoardClient';
import { SectionHeader } from '@/components/ui/SectionHeader';

export const metadata: Metadata = {
  title: 'Ask a Doctor | HealthGhuru Community',
  description: 'Get verified answers to your health questions from our team of medical professionals and nutritionists.',
};

export const dynamic = 'force-dynamic';

export default async function AskPage() {
  const session = await auth();
  const isAdmin = session?.user?.role === 'admin';
  const isLoggedIn = !!session?.user;

  // Fetch initial questions
  const questionsRes = await sql`
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

  return (
    <div className="bg-surface min-h-screen pb-20">
      {/* Header */}
      <div className="bg-white border-b border-border/50 py-12 sm:py-16 mb-8">
        <div className="site-container max-w-4xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary font-heading flex items-center gap-1.5 mb-2 justify-center">
            HealthGhuru Community
          </span>
          <SectionHeader
            title="Ask a Verified Expert"
            subtitle="Have a health or nutrition question? Ask our community board. Highly upvoted questions will be answered by our verified medical professionals and nutritionists."
            centered
          />
        </div>
      </div>

      {/* Board */}
      <div className="site-container max-w-4xl">
        <AskBoardClient 
          initialQuestions={questionsRes as any} 
          isAdmin={isAdmin} 
          isLoggedIn={isLoggedIn}
        />
      </div>
    </div>
  );
}
