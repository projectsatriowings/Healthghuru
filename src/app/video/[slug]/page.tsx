/* eslint-disable @typescript-eslint/no-explicit-any */
import { Metadata } from 'next';
import { sql } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ExternalLink,
  User,
  ShieldCheck,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { YouTubePlayer } from '@/components/media/YouTubePlayer';
import { PillBadge } from '@/components/ui/PillBadge';
import { ContentCard } from '@/components/media/ContentCard';
import { HealthDisclaimer } from '@/components/media/HealthDisclaimer';
import { HeroBannerAd } from '@/components/ads/HeroBannerAd';
import { VideoEngagementBar } from '@/components/media/VideoEngagementBar';
import { formatDate } from '@/lib/utils';

function InstagramIcon({ size = 14, className = '' }: { size?: number; className?: string }) {
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

function YoutubeIcon({ size = 14, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const slug = decodeURIComponent(params.slug);
  const items = await sql`
    SELECT title, excerpt FROM content_items WHERE (slug = ${params.slug} OR slug = ${slug}) AND content_type = 'video'
  `;
  if (items.length === 0) return { title: 'Video Not Found | HealthGhuru' };

  return {
    title: `${items[0].title} | HealthGhuru Videos`,
    description: items[0].excerpt,
  };
}

export default async function VideoDetailPage({ params }: { params: { slug: string } }) {
  const slug = decodeURIComponent(params.slug);
  const items = await sql`
    SELECT i.*, s.name as source_name, s.website_url as source_website
    FROM content_items i
    LEFT JOIN content_sources s ON i.source_id = s.id
    WHERE (i.slug = ${params.slug} OR i.slug = ${slug}) AND i.content_type = 'video' AND i.deleted_at IS NULL
  `;

  if (items.length === 0) {
    notFound();
  }

  const video = items[0];
  const isInstagram = Boolean(video.canonical_url?.includes('instagram.com'));
  const isYouTubeShort = Boolean(video.canonical_url?.includes('/shorts/'));
  const isShort = video.subcategory === 'short' || isInstagram || isYouTubeShort;

  // Related videos
  const relatedVideos = await sql`
    SELECT i.*, s.name as source_name
    FROM content_items i
    LEFT JOIN content_sources s ON i.source_id = s.id
    WHERE i.content_type = 'video' AND i.id != ${video.id}::uuid AND i.status = 'published' AND i.deleted_at IS NULL
      AND (
        ${isShort ? sql`i.subcategory = 'short'` : sql`i.subcategory = 'video' OR i.subcategory IS NULL`}
      )
    ORDER BY i.published_at DESC
    LIMIT 4
  `;

  return (
    <div className="pt-6 sm:pt-8 pb-20 bg-surface/30 min-h-screen">
      <div className="site-container max-w-[1560px] 2xl:max-w-[1680px] space-y-8">
        {/* Top Breadcrumb / Back Bar */}
        <div className="flex items-center justify-between gap-4 pb-2 border-b border-border/40">
          <Link
            href={isShort ? '/videos?format=short' : '/videos'}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-text-secondary hover:text-primary transition-colors py-1"
          >
            <ArrowLeft size={16} /> Back to {isShort ? 'Shorts & Reels' : 'Video Library'}
          </Link>

          <div className="hidden sm:flex items-center gap-2 text-xs text-text-muted">
            <span>Video Library</span>
            <span>/</span>
            <span className="text-primary font-medium">{video.category || 'Wellness'}</span>
            <span>/</span>
            <span className="truncate max-w-[300px]">{video.title}</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* UNIVERSAL TWO-COLUMN HERO: VIDEO ONLY ON LEFT, CONTENT ONLY ON RIGHT      */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-start">
          {/* ===================================================== */}
          {/* LEFT COLUMN: VIDEO PLAYER ONLY (EXPANDED TO FILL SPACE) */}
          {/* ===================================================== */}
          <div
            className={`w-full ${
              isShort
                ? 'lg:col-span-5 xl:col-span-5 flex justify-center lg:justify-start lg:sticky lg:top-24'
                : 'lg:col-span-8 xl:col-span-8 2xl:col-span-8 lg:sticky lg:top-24'
            }`}
          >
            <YouTubePlayer
              videoId={video.video_id}
              videoUrl={video.canonical_url}
              title={video.title}
              thumbnailUrl={video.image_url}
              canonicalUrl={video.canonical_url}
              authorName={video.author_name || video.source_name}
              durationSeconds={video.duration_seconds}
              isShort={isShort}
            />
          </div>

          {/* ===================================================== */}
          {/* RIGHT COLUMN: ALL CONTENT, METADATA & ACTIONS         */}
          {/* ===================================================== */}
          <div
            className={`space-y-4 w-full ${
              isShort
                ? 'lg:col-span-7 xl:col-span-7'
                : 'lg:col-span-4 xl:col-span-4 2xl:col-span-4'
            }`}
          >
            {/* Main Content Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-border shadow-sm space-y-5">
              {/* 1. Category, Badges & Verification Row */}
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <PillBadge active className="text-xs px-3 py-1">
                    {video.category || 'Wellness'}
                  </PillBadge>
                  <span className="text-xs text-text-muted">·</span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    <ShieldCheck size={13} className="text-primary" />
                    {isInstagram
                      ? 'Verified Reel'
                      : isYouTubeShort
                      ? 'Verified Short'
                      : 'Verified Channel'}
                  </span>
                  <span className="text-xs text-text-muted">·</span>
                  <span className="text-xs text-text-muted flex items-center gap-1">
                    <Clock size={12} /> {isShort ? '9:16 Reel' : 'HD Video'}
                  </span>
                </div>

                {video.published_at && (
                  <span suppressHydrationWarning className="text-xs text-text-muted">
                    {formatDate(video.published_at)}
                  </span>
                )}
              </div>

              {/* 2. Main Title */}
              <h1 className="font-display text-xl sm:text-2xl lg:text-2xl xl:text-3xl text-dark leading-snug font-bold">
                {video.title}
              </h1>

              {/* 3. Author / Source & Primary Action Button Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-surface border border-border/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0 border border-primary/20">
                    <User size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-heading font-semibold text-dark text-sm truncate max-w-[150px] sm:max-w-[180px]">
                        {video.author_name || video.source_name || 'HealthGhuru'}
                      </span>
                      <CheckCircle2 size={14} className="text-primary" />
                    </div>
                    <p className="text-[11px] text-text-muted">
                      {isInstagram ? 'Instagram Creator' : 'HealthGhuru Verified'}
                    </p>
                  </div>
                </div>

                {/* Primary CTA Link */}
                {video.canonical_url && (
                  <a
                    href={video.canonical_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`px-4 py-2 rounded-full text-xs font-semibold shrink-0 shadow-md transition-all flex items-center justify-center gap-1.5 self-start sm:self-center hover:scale-105 active:scale-95 ${
                      isInstagram
                        ? 'bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] text-white shadow-rose-500/25'
                        : 'bg-[#E50914] hover:bg-[#c40812] text-white shadow-red-600/25'
                    }`}
                  >
                    {isInstagram ? <InstagramIcon size={13} /> : <YoutubeIcon size={13} />}
                    {isInstagram ? 'Watch on Instagram' : 'Watch on YouTube'}
                    <ExternalLink size={11} />
                  </a>
                )}
              </div>

              {/* 4. Interactive Engagement Bar (Share & Bookmark) */}
              <div className="flex items-center justify-between border-t border-border/50 pt-3.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-secondary font-medium">Actions:</span>
                  <VideoEngagementBar
                    contentId={video.id}
                    title={video.title}
                    category={video.category}
                    canonicalUrl={video.canonical_url}
                  />
                </div>
              </div>
            </div>

            {/* Medical Information Disclaimer */}
            <div className="!my-0">
              <HealthDisclaimer />
            </div>

            {/* In-Feed Sponsor Banner */}
            <HeroBannerAd category={video.category} className="!my-0 !px-0" />
          </div>
        </div>

        {/* ============================================================== */}
        {/* BOTTOM SECTION: RELATED VIDEOS & SHORTS GRID                    */}
        {/* ============================================================== */}
        {relatedVideos.length > 0 && (
          <div className="space-y-6 pt-10 border-t border-border/60">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading font-semibold text-dark text-xl sm:text-2xl">
                  {isShort ? 'More Health Shorts & Reels' : 'Related Health Videos'}
                </h3>
                <p className="text-xs sm:text-sm text-text-muted mt-0.5">
                  Hand-curated quick health tips, wellness guides, and verified video insights
                </p>
              </div>

              <Link
                href={isShort ? '/videos?format=short' : '/videos'}
                className="text-xs sm:text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1"
              >
                View All <ExternalLink size={12} />
              </Link>
            </div>

            <div
              className={
                isShort
                  ? 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6'
                  : 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'
              }
            >
              {relatedVideos.map((rel: any) => (
                <ContentCard key={rel.id} item={rel} layout={isShort ? 'short' : 'standard'} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
