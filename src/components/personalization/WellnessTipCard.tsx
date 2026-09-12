'use client';

import { useState } from 'react';
import { Sparkles, ShieldCheck, Bookmark, Check, Share2, Heart } from 'lucide-react';
import { PillBadge } from '@/components/ui/PillBadge';
import { WellnessTip } from '@/lib/recommendations';

interface WellnessTipCardProps {
  tip: WellnessTip | null;
  className?: string;
  onSave?: (tipId: string) => void;
}

export function WellnessTipCard({ tip, className = '', onSave }: WellnessTipCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!tip) return null;

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      if (!isSaved) {
        const res = await fetch('/api/user/saved', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contentId: tip.id }),
        });
        if (res.ok) {
          setIsSaved(true);
          onSave?.(tip.id);
        }
      } else {
        const res = await fetch(`/api/user/saved/${tip.id}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          setIsSaved(false);
        }
      }
    } catch {
      // Graceful fallback
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    const textToShare = `💡 Today's HealthGuru Wellness Tip: "${tip.title}"\n\n${tip.excerpt}\n\nRead more at HealthGuru.`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: tip.title,
          text: textToShare,
          url: window.location.origin,
        });
      } catch {
        // User cancelled or not supported
      }
    } else {
      await navigator.clipboard.writeText(textToShare);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-surface to-accent/5 border border-primary/20 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 ${className}`}
    >
      {/* Decorative background glow */}
      <div className="absolute -top-16 -right-16 w-36 h-36 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-accent/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
            <Sparkles size={13} className="text-primary animate-pulse" />
            Today&apos;s Wellness Tip
          </span>
          <PillBadge active className="text-[11px] py-0.5 px-2.5">
            {tip.category}
          </PillBadge>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleShare}
            aria-label="Share Wellness Tip"
            title="Share Tip"
            className="p-1.5 text-text-muted hover:text-primary hover:bg-white/80 rounded-lg transition-colors border border-transparent hover:border-border"
          >
            {copied ? <Check size={16} className="text-primary" /> : <Share2 size={16} />}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            aria-label={isSaved ? 'Remove from Saved' : 'Save Wellness Tip'}
            title={isSaved ? 'Saved to Bookmarks' : 'Save Tip'}
            className={`p-1.5 rounded-lg transition-colors border ${
              isSaved
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'text-text-muted hover:text-primary hover:bg-white/80 border-transparent hover:border-border'
            }`}
          >
            <Bookmark size={16} className={isSaved ? 'fill-white' : ''} />
          </button>
        </div>
      </div>

      {/* Tip Title & Excerpt */}
      <div className="relative z-10 mb-3.5">
        <h3 className="text-base sm:text-lg font-heading font-bold text-dark mb-1.5 leading-snug">
          {tip.title}
        </h3>
        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-sans">
          {tip.excerpt}
        </p>
      </div>

      {/* Recommendation reason tag */}
      {tip.recommendationReason && (
        <div className="relative z-10 mb-3 flex items-center gap-1.5 text-xs text-primary font-medium">
          <Heart size={12} className="text-accent fill-accent" />
          <span>{tip.recommendationReason}</span>
        </div>
      )}

      {/* Medical Safety Disclaimer Footer */}
      <div className="relative z-10 pt-3 border-t border-border/50 flex items-start gap-2 text-[11px] text-text-muted leading-relaxed">
        <ShieldCheck size={14} className="text-primary shrink-0 mt-0.5" />
        <span>{tip.disclaimer}</span>
      </div>
    </div>
  );
}
