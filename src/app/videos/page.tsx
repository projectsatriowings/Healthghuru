/* eslint-disable @typescript-eslint/no-explicit-any */
import { Metadata } from 'next';
import { sql } from '@/lib/db';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { ContentCard } from '@/components/media/ContentCard';
import { HealthDisclaimer } from '@/components/media/HealthDisclaimer';
import { Film, Layers } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Health Videos & Wellness Shorts | HealthGhuru',
  description: 'Watch doctor-led wellness breakdowns, fitness routines, nutrition science explainers, and quick health reels from certified channels.',
};

function YouTubeShortsIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.77 10.32l-1.2-.5L18 9.06a3.74 3.74 0 0 0-3.5-5.36 3.7 3.7 0 0 0-2.4 1.1L5.8 9.56a3.75 3.75 0 0 0 2.2 6.74l1.2.5-1.43.76a3.75 3.75 0 0 0 3.5 5.38 3.7 3.7 0 0 0 2.4-1.1l6.3-4.76a3.75 3.75 0 0 0-2.2-6.76zM10 14.65v-5.3l4.5 2.65-4.5 2.65z" />
    </svg>
  );
}

export default async function VideosPage({
  searchParams,
}: {
  searchParams: { category?: string; format?: string };
}) {
  const categoryFilter = searchParams?.category;
  const formatFilter = searchParams?.format; // 'video' | 'short'

  // Fetch categories and filtered video items
  const [categories, videos] = await Promise.all([
    sql`
      SELECT c.name, c.slug, c.display_order
      FROM content_categories c
      WHERE c.is_enabled = TRUE
      ORDER BY c.display_order ASC, c.name ASC
      LIMIT 12;
    `,
    sql`
      SELECT i.*, s.name as source_name
      FROM content_items i
      LEFT JOIN content_sources s ON i.source_id = s.id
      WHERE i.content_type = 'video' 
        AND i.status = 'published' 
        AND i.deleted_at IS NULL
        AND (
          ${categoryFilter || null}::text IS NULL
          OR LOWER(i.category) = LOWER(${categoryFilter || ''})
          OR LOWER(COALESCE(i.subcategory, '')) = LOWER(${categoryFilter || ''})
        )
        AND (
          ${formatFilter || null}::text IS NULL
          OR (
            ${formatFilter === 'short'} AND (i.subcategory = 'short' OR i.canonical_url LIKE '%instagram%' OR (i.duration_seconds > 0 AND i.duration_seconds <= 60))
          )
          OR (
            ${formatFilter === 'video'} AND (i.subcategory = 'video' OR (i.subcategory IS NULL AND i.canonical_url NOT LIKE '%instagram%') OR i.duration_seconds > 60)
          )
        )
      ORDER BY i.published_at DESC
      LIMIT 36;
    `,
  ]);

  const buildUrl = (newCategory?: string, newFormat?: string) => {
    const params = new URLSearchParams();
    const cat = newCategory !== undefined ? newCategory : categoryFilter;
    const fmt = newFormat !== undefined ? newFormat : formatFilter;

    if (cat) params.set('category', cat);
    if (fmt) params.set('format', fmt);

    const qs = params.toString();
    return `/videos${qs ? `?${qs}` : ''}`;
  };

  const isShortsOnly = formatFilter === 'short';
  const isVideosOnly = formatFilter === 'video';

  const fullVideos = videos.filter(
    (v: any) =>
      v.subcategory === 'video' ||
      (!v.subcategory && !v.canonical_url?.includes('instagram.com') && (!v.duration_seconds || v.duration_seconds > 60))
  );

  const shorts = videos.filter(
    (v: any) =>
      v.subcategory === 'short' ||
      v.canonical_url?.includes('instagram.com') ||
      (v.duration_seconds > 0 && v.duration_seconds <= 60)
  );

  return (
    <div className="pt-6 sm:pt-10 pb-20 bg-surface/30 min-h-screen">
      <div className="site-container space-y-8">
        {/* Centered Section Header */}
        <ScrollReveal>
          <div className="w-full flex flex-col items-center justify-center text-center border-b border-border pb-6">
            <SectionHeader
              eyebrow="Visual Wellness Intelligence"
              title="Health Videos & Shorts"
              subtitle="Explore official HealthGhuru medical explainers, home remedies, and quick wellness shorts."
              centered
            />
          </div>
        </ScrollReveal>

        {/* 1. Format Switcher Tabs (All, Full Videos, Shorts) */}
        <div className="flex items-center justify-center gap-2">
          <div className="inline-flex items-center p-1 bg-white border border-border rounded-full shadow-sm">
            <Link
              href={buildUrl(undefined, '')}
              className={`px-4 py-1.5 rounded-full text-xs font-heading font-semibold inline-flex items-center gap-1.5 transition-all ${
                !formatFilter
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-secondary hover:text-dark'
              }`}
            >
              <Layers size={13} /> All Formats
            </Link>
            <Link
              href={buildUrl(undefined, 'video')}
              className={`px-4 py-1.5 rounded-full text-xs font-heading font-semibold inline-flex items-center gap-1.5 transition-all ${
                formatFilter === 'video'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-secondary hover:text-dark'
              }`}
            >
              <Film size={13} /> Full Videos
            </Link>
            <Link
              href={buildUrl(undefined, 'short')}
              className={`px-4 py-1.5 rounded-full text-xs font-heading font-semibold inline-flex items-center gap-1.5 transition-all ${
                formatFilter === 'short'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-text-secondary hover:text-dark'
              }`}
            >
              <YouTubeShortsIcon size={13} className={formatFilter === 'short' ? 'fill-white' : 'fill-red-600'} /> Shorts
            </Link>
          </div>
        </div>

        {/* 2. Topic Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Link
            href={buildUrl('', undefined)}
            className={`px-4 py-1.5 rounded-full text-xs font-heading font-medium transition-all ${
              !categoryFilter
                ? 'bg-dark text-white shadow-sm'
                : 'bg-white hover:bg-surface text-text-secondary border border-border'
            }`}
          >
            All Topics
          </Link>
          {categories.map((c: any) => {
            const active =
              categoryFilter?.toLowerCase() === c.name.toLowerCase() ||
              categoryFilter?.toLowerCase() === c.slug.toLowerCase();
            return (
              <Link
                key={c.slug}
                href={buildUrl(c.name, undefined)}
                className={`px-4 py-1.5 rounded-full text-xs font-heading font-medium transition-all ${
                  active
                    ? 'bg-dark text-white shadow-sm'
                    : 'bg-white hover:bg-surface text-text-secondary border border-border'
                }`}
              >
                {c.name}
              </Link>
            );
          })}
        </div>

        {/* 3. Video Display */}
        {videos.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-border shadow-sm max-w-xl mx-auto">
            <h3 className="font-display text-xl text-dark mb-1">
              No Content Found
            </h3>
            <p className="text-sm text-text-muted mb-4">
              We haven&apos;t indexed any videos under this specific filter combination yet. Explore our complete library.
            </p>
            <Link
              href="/videos"
              className="inline-block px-5 py-2.5 bg-primary text-white rounded-full text-xs font-semibold hover:bg-primary-dark transition-all shadow-sm"
            >
              View All Videos
            </Link>
          </div>
        ) : isShortsOnly ? (
          /* Shorts Only View - YouTube Shorts Shelf Grid */
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-border/50">
              <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-sm">
                <YouTubeShortsIcon size={15} className="fill-white" />
              </div>
              <h3 className="font-display text-2xl text-dark">
                Shorts
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
              {videos.map((item: any) => (
                <ContentCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        ) : isVideosOnly ? (
          /* Full Videos Only View - 3 Column 16:9 Grid */
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border/50">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-white shadow-sm">
                <Film size={15} />
              </div>
              <h3 className="font-display text-2xl text-dark">
                Full-Length Videos
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((item: any) => (
                <ContentCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        ) : (
          /* All Formats Combined View - YouTube Style Shelf Organization */
          <div className="space-y-12">
            {/* 1. Shorts Shelf (YouTube Format) */}
            {shorts.length > 0 && (
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-border/50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-sm shadow-red-600/20">
                      <YouTubeShortsIcon size={15} className="fill-white" />
                    </div>
                    <h3 className="font-display text-2xl text-dark">
                      Shorts
                    </h3>
                  </div>
                  <Link
                    href={buildUrl(undefined, 'short')}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    View all &rarr;
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
                  {shorts.slice(0, 12).map((item: any) => (
                    <ContentCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}

            {/* 2. Full Videos Section */}
            {fullVideos.length > 0 && (
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-border/50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-white shadow-sm">
                      <Film size={15} />
                    </div>
                    <h3 className="font-display text-2xl text-dark">
                      Featured Videos
                    </h3>
                  </div>
                  <Link
                    href={buildUrl(undefined, 'video')}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    View all &rarr;
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {fullVideos.map((item: any) => (
                    <ContentCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <HealthDisclaimer />
      </div>
    </div>
  );
}
