/* eslint-disable @typescript-eslint/no-explicit-any */
import { Metadata } from 'next';
import { sql } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Calendar, User, ShieldCheck } from 'lucide-react';
import { PillBadge } from '@/components/ui/PillBadge';
import { formatDate } from '@/lib/utils';
import { ContentCard } from '@/components/media/ContentCard';
import { HealthDisclaimer } from '@/components/media/HealthDisclaimer';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const items = await sql`
    SELECT title, excerpt FROM content_items WHERE slug = ${params.slug} AND content_type = 'video'
  `;
  if (items.length === 0) return { title: 'Video Not Found | HealthGhuru' };

  return {
    title: `${items[0].title} | HealthGhuru Videos`,
    description: items[0].excerpt,
  };
}

export default async function VideoDetailPage({ params }: { params: { slug: string } }) {
  const items = await sql`
    SELECT i.*, s.name as source_name, s.website_url as source_website
    FROM content_items i
    LEFT JOIN content_sources s ON i.source_id = s.id
    WHERE i.slug = ${params.slug} AND i.content_type = 'video' AND i.deleted_at IS NULL
  `;

  if (items.length === 0) {
    notFound();
  }

  const video = items[0];
  const videoId = video.video_id || (video.canonical_url.match(/v=([a-zA-Z0-9_-]+)/) || [])[1];

  // Related videos
  const relatedVideos = await sql`
    SELECT i.*, s.name as source_name
    FROM content_items i
    LEFT JOIN content_sources s ON i.source_id = s.id
    WHERE i.content_type = 'video' AND i.id != ${video.id}::uuid AND i.status = 'published' AND i.deleted_at IS NULL
      AND (LOWER(i.category) = LOWER(${video.category || ''}) OR i.category IS NULL)
    ORDER BY i.published_at DESC
    LIMIT 3
  `;

  return (
    <div className="pt-6 sm:pt-10 pb-20 bg-surface/30 min-h-screen">
      <div className="site-container max-w-5xl space-y-8">
        {/* Back Link */}
        <Link
          href="/videos"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-primary transition-colors"
        >
          <ArrowLeft size={14} /> Back to Video Library
        </Link>

        {/* Video Player Container */}
        <div className="bg-black rounded-3xl overflow-hidden shadow-2xl aspect-video relative border border-border">
          {videoId ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&rel=0`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white text-sm">
              Video player unavailable.
            </div>
          )}
        </div>

        {/* Title & Channel Attribution */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-border shadow-sm space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <PillBadge active className="text-xs">{video.category || 'Wellness'}</PillBadge>
            <span className="text-xs text-text-muted">·</span>
            <span className="text-xs text-text-secondary flex items-center gap-1">
              <ShieldCheck size={12} className="text-primary" /> Verified Channel
            </span>
          </div>

          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl text-dark leading-tight">
            {video.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-t border-b border-border/40 text-xs text-text-muted">
            <div className="flex items-center gap-4">
              <span className="font-semibold text-dark flex items-center gap-1.5 text-sm">
                <User size={15} className="text-primary" /> {video.author_name || video.source_name}
              </span>
              <span suppressHydrationWarning className="flex items-center gap-1">
                <Calendar size={13} /> {formatDate(video.published_at)}
              </span>
            </div>

            <a
              href={video.canonical_url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline inline-flex items-center gap-1 text-xs"
            >
              Watch on YouTube <ExternalLink size={12} />
            </a>
          </div>

          {/* Description */}
          <div className="space-y-3 pt-2 text-sm text-text-secondary leading-relaxed whitespace-pre-line">
            <h3 className="font-heading font-semibold text-dark text-base">Video Overview</h3>
            <p>{video.description || video.excerpt || 'No description provided.'}</p>
          </div>
        </div>

        <HealthDisclaimer />

        {/* Related Content */}
        {relatedVideos.length > 0 && (
          <div className="space-y-4 pt-4">
            <h3 className="font-heading font-semibold text-dark text-xl">Related Health Videos</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
