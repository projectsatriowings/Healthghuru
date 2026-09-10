/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { Zap, ChevronRight, ChevronLeft } from 'lucide-react';

export interface BreakingItem {
  id: string;
  title: string;
  slug: string;
  category?: string;
  source_name?: string;
  canonical_url?: string;
  is_external?: boolean;
  [key: string]: any;
}

export function BreakingNewsTicker({ items }: { items: (BreakingItem | any)[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [items.length]);

  if (!items || items.length === 0) {
    return null;
  }

  const current = items[currentIndex];
  const targetHref = current.is_external ? current.canonical_url : `/blog/${current.slug}`;

  return (
    <div className="bg-dark text-white border-b border-primary/20 py-2.5 px-4 z-40 relative">
      <div className="site-container flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 overflow-hidden flex-1">
          {/* Breaking badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-600 text-white font-heading font-bold text-xs shrink-0 uppercase tracking-wider animate-pulse">
            <Zap size={12} className="fill-white" /> Breaking Health
          </div>

          {/* Headline link */}
          <div className="truncate text-xs sm:text-sm font-medium">
            <span className="text-secondary font-semibold mr-2">[{current.category}]</span>
            <a
              href={targetHref}
              target={current.is_external ? '_blank' : '_self'}
              rel="noopener noreferrer"
              className="hover:underline text-surface"
            >
              {current.title}
            </a>
            {current.source_name && (
              <span className="text-text-muted text-xs ml-2 hidden md:inline">
                via {current.source_name}
              </span>
            )}
          </div>
        </div>

        {/* Controls if multiple items */}
        {items.length > 1 && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)}
              className="p-1 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              aria-label="Previous story"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-[11px] font-mono text-white/60">
              {currentIndex + 1}/{items.length}
            </span>
            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % items.length)}
              className="p-1 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              aria-label="Next story"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
