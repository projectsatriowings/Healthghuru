'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ExternalLink, Play, Clock, BookOpen } from 'lucide-react';
import { PillBadge } from '@/components/ui/PillBadge';

export interface ContentCardProps {
  item: {
    id: string;
    title: string;
    slug: string;
    content_type: 'news' | 'article' | 'magazine' | 'video';
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
  layout?: 'standard' | 'horizontal' | 'compact';
}

export function ContentCard({ item, layout = 'standard' }: ContentCardProps) {
  const [imageError, setImageError] = useState(false);

  const isVideo = item.content_type === 'video';
  const isOriginal = !item.is_external;

  const targetHref = isVideo
    ? `/video/${item.slug}`
    : isOriginal
    ? `/blog/${item.slug}`
    : item.canonical_url;

  const isExternalLink = !isVideo && !isOriginal;

  const recordClick = () => {
    try {
      fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentItemId: item.id, metricType: 'click' }),
      });
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

  if (layout === 'horizontal') {
    return (
      <div className="group bg-white rounded-2xl border border-border p-4 sm:p-5 shadow-sm hover:shadow-card transition-all duration-300 flex flex-col sm:flex-row gap-5 items-start">
        {/* Thumbnail */}
        <div className="w-full sm:w-56 aspect-[16/10] relative rounded-xl overflow-hidden bg-surface shrink-0 border border-border/40">
          <Image
            src={displayImage}
            alt={item.title}
            fill
            onError={() => setImageError(true)}
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            unoptimized
          />
          {isVideo && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-white/90 text-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Play size={18} className="fill-primary ml-0.5" />
              </div>
            </div>
          )}
          {isVideo && item.duration_seconds ? (
            <span className="absolute bottom-2 right-2 bg-dark/80 text-white text-[10px] font-mono px-2 py-0.5 rounded backdrop-blur-sm">
              {formatDuration(item.duration_seconds)}
            </span>
          ) : null}
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col justify-between h-full space-y-2">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <PillBadge active className="text-[11px] py-0.5 px-2.5">
                {item.category || 'Wellness'}
              </PillBadge>
              <span className="text-xs text-text-muted">·</span>
              <span className="text-xs text-text-secondary font-medium">
                {isOriginal ? 'HealthGhuru Original' : item.source_name || 'External'}
              </span>
              <span className="text-xs text-text-muted">·</span>
              <span className="text-xs text-text-muted">
                {new Date(item.published_at).toLocaleDateString()}
              </span>
            </div>

            <h3 className="font-heading font-semibold text-dark text-base sm:text-lg group-hover:text-primary transition-colors leading-snug line-clamp-2">
              <a
                href={targetHref}
                target={isExternalLink ? '_blank' : '_self'}
                rel={isExternalLink ? 'noopener noreferrer' : undefined}
                onClick={recordClick}
              >
                {item.title}
              </a>
            </h3>

            <p className="text-xs sm:text-sm text-text-secondary line-clamp-2 mt-1.5 leading-relaxed">
              {item.excerpt || item.description || ''}
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-text-muted border-t border-border/40">
            <span>By {item.author_name || item.source_name || 'HealthGhuru'}</span>
            <a
              href={targetHref}
              target={isExternalLink ? '_blank' : '_self'}
              rel={isExternalLink ? 'noopener noreferrer' : undefined}
              onClick={recordClick}
              className="font-medium text-primary hover:text-primary-dark inline-flex items-center gap-1"
            >
              {isExternalLink ? 'Read at Source' : isVideo ? 'Watch Video' : 'Read Article'}
              {isExternalLink ? <ExternalLink size={12} /> : <BookOpen size={12} />}
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Standard Card
  return (
    <div className="group bg-white rounded-2xl border border-border shadow-sm hover:shadow-card hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden">
      {/* Thumbnail */}
      <div className="w-full aspect-[16/10] relative overflow-hidden bg-surface">
        <Image
          src={displayImage}
          alt={item.title}
          fill
          onError={() => setImageError(true)}
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          unoptimized
        />

        {/* Category Pill Over Image */}
        <div className="absolute top-3 left-3 z-10">
          <PillBadge active className="text-[11px] py-0.5 px-2.5 shadow-sm">
            {item.category || 'Wellness'}
          </PillBadge>
        </div>

        {/* Video Overlay */}
        {isVideo && (
          <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-white/90 text-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Play size={20} className="fill-primary ml-0.5" />
            </div>
          </div>
        )}

        {/* Video Duration */}
        {isVideo && item.duration_seconds ? (
          <span className="absolute bottom-2.5 right-2.5 bg-dark/80 text-white text-[10px] font-mono px-2 py-0.5 rounded backdrop-blur-sm">
            {formatDuration(item.duration_seconds)}
          </span>
        ) : null}

        {/* Attribution Badge */}
        <div className="absolute bottom-2.5 left-2.5 bg-dark/80 text-white/90 text-[10px] font-medium px-2 py-0.5 rounded backdrop-blur-sm">
          {isOriginal ? '✦ Original' : item.source_name || 'External'}
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="text-[11px] text-text-muted mb-1.5 flex items-center gap-1.5">
            <Clock size={11} />
            <span>{new Date(item.published_at).toLocaleDateString()}</span>
          </div>

          <h3 className="font-heading font-semibold text-dark text-base group-hover:text-primary transition-colors leading-snug line-clamp-2">
            <a
              href={targetHref}
              target={isExternalLink ? '_blank' : '_self'}
              rel={isExternalLink ? 'noopener noreferrer' : undefined}
              onClick={recordClick}
            >
              {item.title}
            </a>
          </h3>

          <p className="text-xs text-text-secondary line-clamp-2 mt-2 leading-relaxed">
            {item.excerpt || item.description || ''}
          </p>
        </div>

        {/* Card Footer */}
        <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs text-text-muted">
          <span className="truncate max-w-[130px] font-medium text-dark">
            {item.author_name || item.source_name || 'HealthGhuru'}
          </span>
          <a
            href={targetHref}
            target={isExternalLink ? '_blank' : '_self'}
            rel={isExternalLink ? 'noopener noreferrer' : undefined}
            onClick={recordClick}
            className="text-primary hover:underline inline-flex items-center gap-1 font-semibold"
          >
            {isExternalLink ? 'Source' : isVideo ? 'Watch' : 'Read'}
            {isExternalLink ? <ExternalLink size={11} /> : <BookOpen size={11} />}
          </a>
        </div>
      </div>
    </div>
  );
}
