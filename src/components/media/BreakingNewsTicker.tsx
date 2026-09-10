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
    <div className="bg-[#EBF5EB] text-text-primary border-b border-primary/20 py-2.5 sm:py-3 px-3 sm:px-4 z-40 relative shadow-[inset_0_1px_2px_rgba(46,125,50,0.05)]">
      <div className="site-container flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3 overflow-hidden flex-1 min-w-0">
          {/* Breaking badge */}
          <div className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-rose-600 text-white font-heading font-bold text-[10px] sm:text-xs shrink-0 uppercase tracking-wider animate-pulse shadow-sm">
            <Zap size={11} className="fill-white" />
            <span className="hidden xs:inline">Breaking Health</span>
            <span className="xs:hidden">Breaking</span>
          </div>

          {/* Headline link */}
          <div className="truncate text-xs sm:text-sm font-medium flex items-center min-w-0">
            {current.category && (
              <span className="text-primary-dark font-bold mr-1.5 sm:mr-2 shrink-0">
                [{current.category}]
              </span>
            )}
            <a
              href={targetHref}
              target={current.is_external ? '_blank' : '_self'}
              rel="noopener noreferrer"
              className="hover:underline text-text-primary hover:text-primary font-semibold truncate transition-colors"
            >
              {current.title}
            </a>
            {current.source_name && (
              <span className="text-text-secondary text-[11px] ml-2 shrink-0 hidden lg:inline font-normal">
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
              className="p-1 sm:p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors"
              aria-label="Previous story"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-[11px] sm:text-xs font-mono text-primary font-bold min-w-[32px] text-center">
              {currentIndex + 1}/{items.length}
            </span>
            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % items.length)}
              className="p-1 sm:p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors"
              aria-label="Next story"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
