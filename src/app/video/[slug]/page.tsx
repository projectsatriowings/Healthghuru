/* eslint-disable @typescript-eslint/no-explicit-any */
import { Metadata } from 'next';
import { sql } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, User, ShieldCheck } from 'lucide-react';
import { YouTubePlayer } from '@/components/media/YouTubePlayer';
import { PillBadge } from '@/components/ui/PillBadge';
import { ContentCard } from '@/components/media/ContentCard';
import { HealthDisclaimer } from '@/components/media/HealthDisclaimer';
import { HeroBannerAd } from '@/components/ads/HeroBannerAd';

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
  const isShort = video.subcategory === 'short' || isInstagram;

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
    <div className="pt-6 sm:pt-10 pb-20 bg-surface/30 min-h-screen">
      <div className="site-container max-w-5xl space-y-8">
        {/* Back Link */}
        <Link
          href={isShort ? '/videos?format=short' : '/videos'}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-primary transition-colors"
        >
          <ArrowLeft size={14} /> Back to {isShort ? 'Shorts & Reels' : 'Video Library'}
        </Link>

        {/* Interactive Video Player (Supports YouTube, Instagram Reels, and Direct Video) */}
        <YouTubePlayer
          videoId={video.video_id}
          videoUrl={video.canonical_url}
          title={video.title}
          thumbnailUrl={video.image_url}
          canonicalUrl={video.canonical_url}
          authorName={video.author_name || video.source_name}
          durationSeconds={video.duration_seconds}
        />

        {/* Title, Attribution & Actions */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-border shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-border/50">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <PillBadge active className="text-xs">{video.category || 'Wellness'}</PillBadge>
                <span className="text-xs text-text-muted">·</span>
                <span className="text-xs text-text-secondary flex items-center gap-1">
                  <ShieldCheck size={12} className="text-primary" /> {isInstagram ? 'Verified Instagram Reel' : 'Verified Channel'}
                </span>
              </div>

              <h1 className="font-display text-2xl sm:text-3xl text-dark leading-tight">
                {video.title}
              </h1>

              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <User size={15} className="text-primary" />
                <span className="font-medium text-dark">{video.author_name || video.source_name || 'HealthGhuru'}</span>
              </div>
            </div>

            <a
              href={video.canonical_url}
              target="_blank"
              rel="noopener noreferrer"
              className={`px-6 py-3 rounded-full text-xs font-semibold shrink-0 shadow-md transition-all flex items-center gap-2 self-start sm:self-center hover:scale-105 ${
                isInstagram
                  ? 'bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] text-white shadow-rose-500/25'
                  : 'bg-[#E50914] hover:bg-[#c40812] text-white shadow-red-600/25'
              }`}
            >
              {isInstagram ? <InstagramIcon size={14} /> : <YoutubeIcon size={14} />}
              {isInstagram ? 'Watch on Instagram' : 'Watch on YouTube'} <ExternalLink size={13} />
            </a>
          </div>

          {/* Description / Overview */}
          {(video.description || video.excerpt) && (
            <div className="space-y-2 text-sm text-text-secondary leading-relaxed whitespace-pre-line">
              <h3 className="font-heading font-semibold text-dark text-base">Video Overview</h3>
              <p>{video.description || video.excerpt}</p>
            </div>
          )}
        </div>

        <HealthDisclaimer />

        {/* In-Feed Video Sponsor Banner */}
        <HeroBannerAd category={video.category} className="!my-6 !px-0" />

        {/* Related Content */}
        {relatedVideos.length > 0 && (
          <div className="space-y-4 pt-4">
            <h3 className="font-heading font-semibold text-dark text-xl">
              {isShort ? 'More Health Shorts & Reels' : 'Related Health Videos'}
            </h3>
            <div
              className={
                isShort
                  ? 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6'
                  : 'grid grid-cols-1 md:grid-cols-3 gap-6'
              }
            >
              {relatedVideos.map((rel: any) => (
                <ContentCard key={rel.id} item={rel} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
