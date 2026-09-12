'use client';

import { useState } from 'react';
import { Question, QuestionCard } from '@/components/community/QuestionCard';
import { MessageSquarePlus } from 'lucide-react';
import Link from 'next/link';

interface AskBoardClientProps {
  initialQuestions: Question[];
  isAdmin: boolean;
  isLoggedIn: boolean;
}

export function AskBoardClient({ initialQuestions, isAdmin, isLoggedIn }: AskBoardClientProps) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [isAsking, setIsAsking] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAskSubmit = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ask', title: newTitle, content: newContent })
      });
      const data = await res.json();
      if (data.success && data.question) {
        // Optimistically add to top
        const optimQuestion: Question = {
          ...data.question,
          user_name: 'You',
          answers: null
        };
        setQuestions([optimQuestion, ...questions]);
        setIsAsking(false);
        setNewTitle('');
        setNewContent('');
      } else {
        alert(data.error || 'Failed to submit question');
      }
    } catch (err) {
      console.error(err);
    }
    setIsSubmitting(false);
  };

  const handleAnswerSubmit = async (questionId: string, content: string) => {
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'answer', questionId, content })
      });
      const data = await res.json();
      if (data.success && data.answer) {
        setQuestions(prev => prev.map(q => {
          if (q.id === questionId) {
            const answers = q.answers || [];
            return {
              ...q,
              status: 'answered',
              answers: [...answers, { ...data.answer, expert_name: 'You (Admin)' }]
            };
          }
          return q;
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpvote = async (questionId: string) => {
    if (!isLoggedIn) {
      alert("Please log in to upvote.");
      return;
    }
    try {
      await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'upvote', questionId })
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      {/* Ask Question Bar */}
      <div className="mb-8">
        {!isAsking ? (
          <div className="bg-white rounded-2xl border border-border p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-xl text-dark font-semibold">Have a question?</h3>
              <p className="text-sm text-text-secondary">Ask the community and our experts will answer the top voted ones.</p>
            </div>
            {isLoggedIn ? (
              <button
                onClick={() => setIsAsking(true)}
                className="px-6 py-2.5 bg-primary text-white rounded-xl shadow-md hover:bg-primary-dark transition-colors font-semibold flex items-center gap-2 shrink-0"
              >
                <MessageSquarePlus size={18} /> Ask a Question
              </button>
            ) : (
              <Link href="/login" className="px-6 py-2.5 bg-primary/10 text-primary rounded-xl font-semibold hover:bg-primary/20 transition-colors shrink-0">
                Login to Ask
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-border p-6 shadow-md border-primary/20">
            <h3 className="font-display text-xl text-dark font-semibold mb-4">Post a new question</h3>
            <input 
              type="text" 
              placeholder="Question Title (e.g., Is fasting safe for diabetics?)"
              className="w-full bg-surface border border-border rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none mb-3 font-semibold text-dark"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <textarea
              placeholder="Provide more details about your question..."
              className="w-full bg-surface border border-border rounded-xl p-3 text-sm min-h-[120px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none mb-4"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsAsking(false)}
                className="px-5 py-2.5 text-sm font-semibold text-text-secondary hover:text-dark transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAskSubmit}
                disabled={isSubmitting || !newTitle.trim() || !newContent.trim()}
                className="px-6 py-2.5 bg-primary text-white rounded-xl shadow-md hover:bg-primary-dark transition-colors font-semibold disabled:opacity-50"
              >
                {isSubmitting ? 'Posting...' : 'Post Question'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="text-center py-12 text-text-muted">
            No questions asked yet. Be the first!
          </div>
        ) : (
          questions.map(q => (
            <QuestionCard 
              key={q.id} 
              question={q} 
              isAdmin={isAdmin} 
              onAnswerSubmit={handleAnswerSubmit}
              onUpvote={handleUpvote}
            />
          ))
        )}
      </div>
    </div>
  );
}
