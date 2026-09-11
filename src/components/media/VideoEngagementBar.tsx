'use client';

import { useState } from 'react';
import { Share2, Bookmark, Check } from 'lucide-react';

interface VideoEngagementBarProps {
  contentId: string;
  title: string;
  category?: string;
  canonicalUrl?: string;
}

export function VideoEngagementBar({
  contentId,
  title,
  category = 'Wellness',
  canonicalUrl,
}: VideoEngagementBarProps) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleShare = async () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : canonicalUrl || '';
    
    // Activity telemetry
    try {
      fetch('/api/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId,
          action: 'share',
          category,
        }),
      }).catch(() => {});
    } catch {
      // ignore
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `Check out this health video on HealthGhuru: ${title}`,
          url: shareUrl,
        });
        return;
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
      }
    }

    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleToggleBookmark = async () => {
    if (saving) return;
    setSaving(true);
    const nextSaved = !saved;
    setSaved(nextSaved);

    try {
      if (nextSaved) {
        await fetch('/api/user/saved', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contentId }),
        });
        // Log activity
        await fetch('/api/activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contentId, action: 'bookmark', category }),
        });
      } else {
        await fetch(`/api/user/saved/${contentId}`, {
          method: 'DELETE',
        });
      }
    } catch {
      // Rollback on network failure
      setSaved(!nextSaved);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-2 pt-1">
      {/* Share Button with Hover & Moving Effects */}
      <button
        onClick={handleShare}
        type="button"
        aria-label="Share this video"
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-text-secondary bg-surface hover:bg-surface-alt border border-border/80 hover:text-dark transition-all duration-200 hover:scale-105 hover:-translate-y-0.5 hover:shadow-sm active:scale-95"
      >
        {copied ? (
          <>
            <Check size={14} className="text-primary animate-bounce" />
            <span className="text-primary">Link Copied!</span>
          </>
        ) : (
          <>
            <Share2 size={14} className="transition-transform duration-200 hover:rotate-12" />
            <span>Share</span>
          </>
        )}
      </button>

      {/* Bookmark Button with Hover & Moving Effects */}
      <button
        onClick={handleToggleBookmark}
        type="button"
        disabled={saving}
        aria-label={saved ? 'Remove from saved' : 'Save to bookmarks'}
        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 hover:scale-105 hover:-translate-y-0.5 hover:shadow-sm active:scale-95 border ${
          saved
            ? 'bg-primary/10 text-primary border-primary/30 shadow-sm'
            : 'bg-surface hover:bg-surface-alt text-text-secondary hover:text-dark border-border/80'
        }`}
      >
        <Bookmark size={14} className={`transition-transform duration-200 hover:scale-110 ${saved ? 'fill-primary text-primary' : ''}`} />
        <span>{saved ? 'Saved' : 'Bookmark'}</span>
      </button>
    </div>
  );
}
