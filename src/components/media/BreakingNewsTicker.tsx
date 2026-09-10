/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { Zap, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    <div className="bg-[#EBF5EB] text-text-primary border-b border-primary/20 py-2 sm:py-2.5 px-2.5 sm:px-4 z-40 relative shadow-[inset_0_1px_2px_rgba(46,125,50,0.04)]">
      <div className="site-container flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Left: Badge + Animated Headline */}
        <div className="flex items-center gap-2 sm:gap-3 overflow-hidden flex-1 min-w-0">
          
          {/* Breaking Badge (Responsive: Icon on small mobile, Full on tablet/desktop) */}
          <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-rose-600 text-white font-heading font-bold text-[10px] sm:text-xs shrink-0 uppercase tracking-wider animate-pulse shadow-xs">
            <Zap size={11} className="fill-white shrink-0" />
            <span className="hidden sm:inline">Breaking News</span>
            <span className="sm:hidden font-extrabold text-[9px]">Live</span>
          </div>

          {/* Animated Headline Container */}
          <div className="flex-1 min-w-0 overflow-hidden relative h-5 sm:h-6 flex items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="truncate text-xs sm:text-sm font-medium flex items-center min-w-0 w-full"
              >
                {/* Category Pill (Hidden on narrow screens to maximize space for headline text) */}
                {current.category && (
                  <span className="text-primary font-bold mr-1.5 shrink-0 hidden md:inline font-heading">
                    [{current.category}]
                  </span>
                )}

                {/* News Title Link */}
                <a
                  href={targetHref}
                  target={current.is_external ? '_blank' : '_self'}
                  rel="noopener noreferrer"
                  className="hover:underline text-text-primary hover:text-primary font-semibold truncate transition-colors flex-1 min-w-0"
                  title={current.title}
                >
                  {current.title}
                </a>

                {/* Source Label (Desktop only) */}
                {current.source_name && (
                  <span className="text-text-secondary text-[11px] ml-2 shrink-0 hidden lg:inline font-normal">
                    via {current.source_name}
                  </span>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

        </div>

        {/* Right: Pagination Controls */}
        {items.length > 1 && (
          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0 ml-1">
            <button
              onClick={() => setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)}
              className="p-1 sm:p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors flex items-center justify-center active:scale-95"
              aria-label="Previous breaking news story"
            >
              <ChevronLeft size={15} />
            </button>
            
            <span className="text-[10px] sm:text-xs font-mono text-primary font-bold px-1 text-center select-none">
              {currentIndex + 1}/{items.length}
            </span>
            
            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % items.length)}
              className="p-1 sm:p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors flex items-center justify-center active:scale-95"
              aria-label="Next breaking news story"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
