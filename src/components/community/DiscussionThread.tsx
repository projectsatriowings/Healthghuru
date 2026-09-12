'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, Send, ShieldAlert, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_name: string;
  user_role: string;
  is_hidden: boolean;
}

interface DiscussionThreadProps {
  articleId: string;
  isLoggedIn: boolean;
  isAdmin: boolean;
}

export function DiscussionThread({ articleId, isLoggedIn, isAdmin }: DiscussionThreadProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newContent, setNewContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [articleId]);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments?articleId=${articleId}`);
      const data = await res.json();
      if (data.success) {
        setComments(data.comments || []);
      }
    } catch (err) {
      console.error(err);
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId, content: newContent })
      });
      const data = await res.json();
      if (data.success && data.comment) {
        setComments([data.comment, ...comments]);
        setNewContent('');
      } else {
        alert(data.error || 'Failed to post comment');
      }
    } catch (err) {
      console.error(err);
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Are you sure you want to remove this comment?')) return;
    try {
      const res = await fetch(`/api/comments?id=${commentId}`, { method: 'DELETE' });
      if (res.ok) {
        setComments(comments.filter(c => c.id !== commentId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mt-12 border-t border-border pt-10">
      <div className="flex items-center gap-2 mb-8">
        <MessageCircle size={24} className="text-primary" />
        <h3 className="font-display text-2xl text-dark">Discussion</h3>
        <span className="text-xs font-semibold text-text-muted bg-surface px-2 py-1 rounded-full ml-2">
          {comments.length}
        </span>
      </div>

      {/* Input Area */}
      {isLoggedIn ? (
        <form onSubmit={handleSubmit} className="mb-10 bg-surface rounded-2xl p-4 border border-border">
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Share your thoughts or ask a question about this article..."
            className="w-full bg-white border border-border rounded-xl p-3 text-sm min-h-[100px] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors mb-3"
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-text-muted flex items-center gap-1">
              <ShieldAlert size={14} /> Please follow our community guidelines.
            </span>
            <button
              type="submit"
              disabled={isSubmitting || !newContent.trim()}
              className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl shadow-sm hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? 'Posting...' : 'Post Comment'} <Send size={14} />
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-10 p-6 rounded-2xl bg-surface border border-border text-center">
          <h4 className="font-heading font-semibold text-dark mb-2">Join the Conversation</h4>
          <p className="text-sm text-text-secondary mb-4">Sign in to leave a comment, ask questions, and interact with the community.</p>
          <Link href="/login" className="inline-block px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors">
            Login to Comment
          </Link>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-center text-sm text-text-muted py-8">No comments yet. Be the first to start the discussion!</p>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-hero text-white flex items-center justify-center font-bold text-sm shrink-0">
                {comment.user_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="bg-white border border-border rounded-2xl p-4 shadow-sm relative group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-dark text-sm">{comment.user_name}</span>
                      {comment.user_role === 'admin' && (
                        <span className="text-[9px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">Admin</span>
                      )}
                      <span className="text-xs text-text-muted">· {new Date(comment.created_at).toLocaleDateString()}</span>
                    </div>
                    {isAdmin && (
                      <button 
                        onClick={() => handleDelete(comment.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete comment (Moderator)"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
