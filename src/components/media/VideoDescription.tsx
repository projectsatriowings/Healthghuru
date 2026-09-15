'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, FileText } from 'lucide-react';

interface VideoDescriptionProps {
  description?: string | null;
  excerpt?: string | null;
  publishedAt?: string | Date | null;
  category?: string | null;
  className?: string;
}

/**
 * Parses description text to turn raw URLs and hashtags into styled spans/anchors
 */
function formatDescriptionText(text: string) {
  // Regex to match URLs or hashtags (supports English & Tamil/Unicode characters)
  const tokenRegex = /(https?:\/\/[^\s]+)|(#[\w\u0B80-\u0BFF]+)|(\b\d{1,2}:\d{2}(?::\d{2})?\b)/g;

  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith('http://') || token.startsWith('https://')) {
      parts.push(
        <a
          key={match.index}
          href={token}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-primary hover:text-primary-dark underline font-medium break-all"
        >
          {token}
        </a>
      );
    } else if (token.startsWith('#')) {
      parts.push(
        <span key={match.index} className="text-primary font-medium hover:underline">
          {token}
        </span>
      );
    } else {
      // Timestamp like 01:23
      parts.push(
        <span key={match.index} className="font-mono text-primary font-semibold">
          {token}
        </span>
      );
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

export function VideoDescription({
  description,
  excerpt,
  className = '',
}: VideoDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const rawText = (description || excerpt || '').trim();

  // If there's no description available at all, return null
  if (!rawText) {
    return null;
  }

  // Get the first non-empty line for single-line display
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  const firstLine = lines[0] || rawText;
  const isMultiLineOrLong = lines.length > 1 || rawText.length > 90;

  return (
    <div
      className={`rounded-2xl transition-all duration-200 border ${
        isExpanded
          ? 'bg-surface border-primary/20 shadow-sm p-4 sm:p-5'
          : 'bg-surface/80 hover:bg-surface border-border/70 hover:border-primary/20 p-3 sm:p-3.5 cursor-pointer'
      } ${className}`}
      onClick={() => {
        if (!isExpanded && isMultiLineOrLong) {
          setIsExpanded(true);
        }
      }}
      role={isMultiLineOrLong ? 'button' : undefined}
      tabIndex={isMultiLineOrLong ? 0 : undefined}
      onKeyDown={(e) => {
        if (isMultiLineOrLong && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          setIsExpanded(!isExpanded);
        }
      }}
      aria-expanded={isExpanded}
    >
      {/* Header Label */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 text-[11px] font-heading font-semibold text-text-muted uppercase tracking-wider">
          <FileText size={13} className="text-primary" />
          <span>Description</span>
        </div>

        {isMultiLineOrLong && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="text-xs font-semibold text-primary hover:text-primary-dark inline-flex items-center gap-0.5 transition-colors"
          >
            {isExpanded ? (
              <>
                Show less <ChevronUp size={13} />
              </>
            ) : (
              <>
                more <ChevronDown size={13} />
              </>
            )}
          </button>
        )}
      </div>

      {/* Content Area */}
      {!isExpanded ? (
        /* Collapsed Single-Line Preview */
        <div className="flex items-center justify-between gap-2 text-xs sm:text-sm text-text-secondary">
          <p className="line-clamp-1 truncate font-body leading-relaxed flex-1">
            {firstLine}
          </p>
          {isMultiLineOrLong && (
            <span className="font-heading font-bold text-dark hover:text-primary text-xs shrink-0 transition-colors ml-1">
              ...more
            </span>
          )}
        </div>
      ) : (
        /* Complete Expanded Description */
        <AnimatePresence initial={false}>
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="space-y-3 pt-1"
          >
            <div className="font-body text-xs sm:text-sm text-dark leading-relaxed whitespace-pre-wrap break-words">
              {formatDescriptionText(rawText)}
            </div>

            {/* Bottom Collapse Button */}
            <div className="pt-2 border-t border-border/50 flex justify-end">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(false);
                }}
                className="text-xs font-semibold text-primary hover:text-primary-dark inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 hover:bg-primary/15 transition-all"
              >
                Show less <ChevronUp size={13} />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
