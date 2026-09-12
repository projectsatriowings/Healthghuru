'use client';

import { useState } from 'react';
import { ChevronUp, MessageCircle, CheckCircle2 } from 'lucide-react';
import { PillBadge } from '@/components/ui/PillBadge';

interface ExpertAnswer {
  id: string;
  content: string;
  created_at: string;
  expert_name: string;
  expert_email: string;
}

export interface Question {
  id: string;
  title: string;
  content: string;
  status: 'open' | 'answered' | 'closed';
  upvotes: number;
  created_at: string;
  user_name: string;
  user_email: string;
  answers: ExpertAnswer[] | null;
}

interface QuestionCardProps {
  question: Question;
  isAdmin: boolean;
  onAnswerSubmit: (questionId: string, content: string) => Promise<void>;
  onUpvote: (questionId: string) => Promise<void>;
}

export function QuestionCard({ question, isAdmin, onAnswerSubmit, onUpvote }: QuestionCardProps) {
  const [isAnswering, setIsAnswering] = useState(false);
  const [answerContent, setAnswerContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [upvotes, setUpvotes] = useState(question.upvotes);
  const [hasUpvoted, setHasUpvoted] = useState(false);

  const handleUpvote = async () => {
    if (hasUpvoted) return;
    setHasUpvoted(true);
    setUpvotes((prev) => prev + 1);
    await onUpvote(question.id);
  };

  const handleAnswerSubmit = async () => {
    if (!answerContent.trim()) return;
    setIsSubmitting(true);
    await onAnswerSubmit(question.id, answerContent);
    setIsSubmitting(false);
    setIsAnswering(false);
    setAnswerContent('');
  };

  return (
    <div className="bg-white rounded-2xl border border-border p-5 sm:p-6 shadow-sm mb-4">
      <div className="flex gap-4 sm:gap-6">
        {/* Upvote Column */}
        <div className="flex flex-col items-center shrink-0">
          <button
            onClick={handleUpvote}
            disabled={hasUpvoted}
            className={`w-10 h-10 rounded-full flex flex-col items-center justify-center transition-colors ${
              hasUpvoted
                ? 'bg-primary/10 text-primary'
                : 'bg-surface hover:bg-primary/5 text-text-muted hover:text-primary'
            }`}
          >
            <ChevronUp size={20} strokeWidth={hasUpvoted ? 3 : 2} />
          </button>
          <span className={`text-sm font-bold mt-1 ${hasUpvoted ? 'text-primary' : 'text-text-secondary'}`}>
            {upvotes}
          </span>
        </div>

        {/* Content Column */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-text-muted bg-surface px-2 py-0.5 rounded-full">
              {question.user_name}
            </span>
            <span className="text-xs text-text-muted">·</span>
            <span className="text-xs text-text-muted">
              {new Date(question.created_at).toLocaleDateString()}
            </span>
            {question.status === 'answered' && (
              <PillBadge active className="text-[10px] ml-auto py-0.5 px-2 bg-emerald-100 text-emerald-700">
                <CheckCircle2 size={10} className="mr-1 inline" /> Answered
              </PillBadge>
            )}
          </div>

          <h3 className="text-lg sm:text-xl font-display font-semibold text-dark mb-2">
            {question.title}
          </h3>
          <p className="text-sm sm:text-base text-text-secondary leading-relaxed mb-4 whitespace-pre-wrap">
            {question.content}
          </p>

          {/* Expert Answers Section */}
          {question.answers && question.answers.length > 0 && (
            <div className="mt-6 space-y-4">
              {question.answers.map((answer) => (
                <div key={answer.id} className="bg-surface-alt rounded-xl p-4 sm:p-5 border-l-4 border-primary">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                      {answer.expert_name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-dark flex items-center gap-1.5">
                        {answer.expert_name}
                        <CheckCircle2 size={14} className="text-primary" />
                      </div>
                      <div className="text-[11px] text-text-muted uppercase tracking-wider font-mono">
                        Verified Expert
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-dark leading-relaxed whitespace-pre-wrap pl-10">
                    {answer.content}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Admin Answer Actions */}
          {isAdmin && question.status !== 'answered' && !isAnswering && (
            <div className="mt-4 pt-4 border-t border-border flex justify-end">
              <button
                onClick={() => setIsAnswering(true)}
                className="text-sm font-semibold text-primary hover:text-primary-dark flex items-center gap-1.5"
              >
                <MessageCircle size={16} /> Write Expert Answer
              </button>
            </div>
          )}

          {/* Admin Answer Form */}
          {isAnswering && (
            <div className="mt-4 pt-4 border-t border-border">
              <textarea
                value={answerContent}
                onChange={(e) => setAnswerContent(e.target.value)}
                placeholder="Write your professional answer here..."
                className="w-full bg-surface border border-border rounded-xl p-3 text-sm min-h-[100px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors mb-3 outline-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsAnswering(false)}
                  className="px-4 py-2 text-sm font-semibold text-text-secondary hover:text-dark transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAnswerSubmit}
                  disabled={isSubmitting || !answerContent.trim()}
                  className="px-4 py-2 text-sm font-semibold bg-primary text-white rounded-lg shadow-sm hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Posting...' : 'Post Answer'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
