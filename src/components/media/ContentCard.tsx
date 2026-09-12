'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { ExternalLink, Play, Clock, BookOpen } from 'lucide-react';
import { PillBadge } from '@/components/ui/PillBadge';
import { formatDate } from '@/lib/utils';

export interface ContentCardProps {
  item: {
    id: string;
    title: string;
    slug: string;
    content_type: 'news' | 'article' | 'magazine' | 'video';
    subcategory?: string | null;
    excerpt?: string;
    description?: string;
    image_url?: string;
    canonical_url: string;
    published_at: string;
    author_name?: string;
    category?: string;
    source_name?: string;
    duration_seconds?: number;
    video_id?: string;
    is_external?: boolean;
    quality_score?: number;
  };
  layout?: 'standard' | 'horizontal' | 'compact' | 'short';
}

function InstagramIcon({ size = 11, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function YouTubeShortsIcon({ size = 13, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.77 10.32l-1.2-.5L18 9.06a3.74 3.74 0 0 0-3.5-5.36 3.7 3.7 0 0 0-2.4 1.1L5.8 9.56a3.75 3.75 0 0 0 2.2 6.74l1.2.5-1.43.76a3.75 3.75 0 0 0 3.5 5.38 3.7 3.7 0 0 0 2.4-1.1l6.3-4.76a3.75 3.75 0 0 0-2.2-6.76zM10 14.65v-5.3l4.5 2.65-4.5 2.65z" />
    </svg>
  );
}

export function ContentCard({ item, layout = 'standard' }: ContentCardProps) {
  const [imageError, setImageError] = useState(false);

  const isVideo = item.content_type === 'video';
  const isOriginal = !item.is_external;
  const isInstagram = Boolean(item.canonical_url?.includes('instagram.com'));
  const isShort =
    layout === 'short' ||
    item.subcategory === 'short' ||
    isInstagram ||
    (isVideo && item.duration_seconds !== undefined && item.duration_seconds !== null && item.duration_seconds > 0 && item.duration_seconds <= 60);

  const targetHref = isVideo
    ? `/video/${item.slug}`
    : isOriginal
    ? `/blog/${item.slug}`
    : item.canonical_url;

  const isExternalLink = !isVideo && !isOriginal;

  const recordClick = () => {
    try {
      // Activity telemetry for recommendation engine
      const actionType = isVideo ? 'watch' : item.content_type === 'magazine' ? 'magazine_read' : 'read';
      fetch('/api/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId: item.id,
          action: actionType,
          category: item.category,
        }),
        keepalive: true,
      }).catch(() => {});

      // General metric counter
      fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentItemId: item.id, metricType: 'click' }),
      }).catch(() => {});
    } catch {
      // Non-blocking metric tracking
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Fallback image asset
  const displayImage = imageError || !item.image_url ? '/images/exercise_plank.png' : item.image_url;

  // 1. Horizontal List Layout (Used in Trending / Research sidebars)
  if (layout === 'horizontal') {
    return (
      <Link
        href={targetHref}
        target={isExternalLink ? '_blank' : '_self'}
        rel={isExternalLink ? 'noopener noreferrer' : undefined}
        onClick={recordClick}
        className="group bg-white rounded-2xl border border-border p-3.5 sm:p-4 shadow-sm hover:shadow-card transition-all duration-300 flex flex-col sm:flex-row gap-4 items-start block cursor-pointer text-inherit no-underline"
      >
        {/* Thumbnail */}
        <div className="w-full sm:w-48 aspect-[16/10] relative rounded-xl overflow-hidden bg-surface shrink-0 border border-border/40 block">
          <Image
            src={displayImage}
            alt={item.title}
            fill
            onError={() => setImageError(true)}
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            unoptimized
          />
          {isVideo && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center transition-colors group-hover:bg-black/40">
              <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Play size={16} className="fill-white ml-0.5" />
              </div>
            </div>
          )}
          {isVideo && item.duration_seconds ? (
            <span className="absolute bottom-1.5 right-1.5 bg-dark/80 text-white text-[9px] font-mono px-1.5 py-0.5 rounded backdrop-blur-sm">
              {formatDuration(item.duration_seconds)}
            </span>
          ) : null}
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col justify-between h-full space-y-1.5 w-full">
          <div>
            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
              <PillBadge active className="text-[10px] py-0.5 px-2">
                {item.category || 'Wellness'}
              </PillBadge>
              <span className="text-[11px] text-text-muted">·</span>
              <span className="text-[11px] text-text-secondary font-medium">
                {isOriginal ? 'HealthGhuru Original' : item.source_name || 'External'}
              </span>
              {!isVideo && (
                <>
                  <span className="text-[11px] text-text-muted">·</span>
                  <span suppressHydrationWarning className="text-[11px] text-text-muted">
                    {formatDate(item.published_at)}
                  </span>
                </>
              )}
            </div>

            <h3 className="font-heading font-semibold text-dark text-sm sm:text-base group-hover:text-primary transition-colors leading-snug line-clamp-2">
              {item.title}
            </h3>

            {!isVideo && (
              <p className="text-xs text-text-secondary line-clamp-2 mt-1 leading-relaxed">
                {item.excerpt || item.description || ''}
              </p>
            )}
          </div>

          <div className="pt-1.5 flex items-center justify-between text-[11px] text-text-muted border-t border-border/40">
            <span>By {item.author_name || item.source_name || 'HealthGhuru'}</span>
            <span className="font-medium text-primary group-hover:text-primary-dark inline-flex items-center gap-1">
              {isExternalLink ? 'Read' : isVideo ? 'Watch' : 'Read'}
              {isExternalLink ? <ExternalLink size={11} /> : <BookOpen size={11} />}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  // 2. YouTube Shorts Card Format (Vertical Thumbnail + Title below card)
  if (isShort && layout !== 'compact') {
    return (
      <Link
        href={targetHref}
        onClick={recordClick}
        className="group flex flex-col w-full select-none cursor-pointer block text-inherit no-underline"
      >
        {/* Vertical Thumbnail Container (9:16 aspect ratio, clean rounded corners) */}
        <div className="w-full aspect-[9/16] relative rounded-2xl overflow-hidden bg-slate-900 border border-border/60 shadow-sm group-hover:shadow-lg group-hover:-translate-y-1 transition-all duration-300 block">
          <Image
            src={displayImage}
            alt={item.title}
            fill
            onError={() => setImageError(true)}
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            unoptimized
          />

          {/* Top Category Badge */}
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className="text-[10px] font-medium py-0.5 px-2 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 shadow-sm">
              {item.category || 'Wellness'}
            </span>
          </div>

          {/* Top-Right Badge */}
          <div className="absolute top-2.5 right-2.5 z-10">
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-600 text-white shadow-sm">
              {isInstagram ? <InstagramIcon size={10} /> : <YouTubeShortsIcon size={11} />}
              {isInstagram ? 'Reel' : 'Shorts'}
            </span>
          </div>

          {/* Hover Play Button Overlay */}
          <div className="absolute inset-0 bg-black/25 group-hover:bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xl transform scale-75 group-hover:scale-100 transition-all duration-300 ring-4 ring-white/30">
              <Play size={20} className="fill-white ml-0.5" />
            </div>
          </div>
        </div>

        {/* Title and Metadata below the Thumbnail */}
        <div className="mt-2.5 space-y-1">
          <h4 className="font-heading font-semibold text-dark text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {item.title}
          </h4>

          <p className="text-xs text-text-muted flex items-center gap-1.5 truncate">
            <span>{item.author_name || item.source_name || 'HealthGhuru'}</span>
          </p>
        </div>
      </Link>
    );
  }

  // 3. Standard Card (16:10 for Full Length Videos and Articles)
  // ENTIRE CARD IS FULLY CLICKABLE: Clicking ANYWHERE on the card opens the video!
  return (
    <Link
      href={targetHref}
      target={isExternalLink ? '_blank' : '_self'}
      rel={isExternalLink ? 'noopener noreferrer' : undefined}
      onClick={recordClick}
      className="group bg-white rounded-xl border border-border shadow-sm hover:shadow-card hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer block text-inherit no-underline select-none"
    >
      {/* Clickable Thumbnail & Play Button */}
      <div className="w-full aspect-[16/10] relative overflow-hidden bg-surface block">
        <Image
          src={displayImage}
          alt={item.title}
          fill
          onError={() => setImageError(true)}
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          unoptimized
        />

        {/* Category Pill Over Image */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <PillBadge active className="text-[10px] py-0.5 px-2 shadow-sm">
            {item.category || 'Wellness'}
          </PillBadge>
        </div>

        {/* Video Overlay & Play Button */}
        {isVideo && (
          <div className="absolute inset-0 bg-black/25 flex items-center justify-center transition-colors group-hover:bg-black/35">
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-primary-dark transition-all ring-2 ring-white/30">
              <Play size={18} className="fill-white ml-0.5" />
            </div>
          </div>
        )}

        {/* Video Duration */}
        {isVideo && item.duration_seconds ? (
          <span className="absolute bottom-2 right-2 bg-dark/80 text-white text-[9px] font-mono px-1.5 py-0.5 rounded backdrop-blur-sm">
            {formatDuration(item.duration_seconds)}
          </span>
        ) : null}

        {/* Attribution Badge */}
        <div className="absolute bottom-2 left-2 bg-dark/80 text-white/90 text-[9px] font-medium px-1.5 py-0.5 rounded backdrop-blur-sm">
          {isOriginal ? '✦ Original' : item.source_name || 'External'}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
        <div>
          {!isVideo && (
            <div className="text-[10px] text-text-muted mb-1 flex items-center gap-1">
              <Clock size={10} />
              <span suppressHydrationWarning>{formatDate(item.published_at)}</span>
            </div>
          )}

          <h3 className="font-heading font-semibold text-dark text-sm sm:text-base group-hover:text-primary transition-colors leading-snug line-clamp-2">
            {item.title}
          </h3>

          {!isVideo && (
            <p className="text-xs text-text-secondary line-clamp-2 mt-1.5 leading-relaxed">
              {item.excerpt || item.description || ''}
            </p>
          )}
        </div>

        {/* Card Footer */}
        <div className="pt-2.5 border-t border-border/40 flex items-center justify-between text-[11px] text-text-muted">
          <span className="truncate max-w-[120px] font-medium text-dark">
            {item.author_name || item.source_name || 'HealthGhuru'}
          </span>
          <span className="text-primary group-hover:text-primary-dark inline-flex items-center gap-1 font-semibold">
            {isExternalLink ? 'Source' : isVideo ? 'Watch' : 'Read'}
            {isExternalLink ? <ExternalLink size={10} /> : <BookOpen size={10} />}
          </span>
        </div>
      </div>
    </Link>
  );
}
