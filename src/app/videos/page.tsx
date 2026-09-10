/* eslint-disable @typescript-eslint/no-explicit-any */
import { Metadata } from 'next';
import { sql } from '@/lib/db';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { ContentCard } from '@/components/media/ContentCard';
import { HealthDisclaimer } from '@/components/media/HealthDisclaimer';
import Link from 'next/link';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Health Videos | HealthGhuru — Verified Medical & Wellness Video Guides',
  description: 'Watch doctor-led wellness breakdowns, fitness routines, nutrition science explainers, and mental health practices from certified channels.',
};

export default async function VideosPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const categoryFilter = searchParams?.category;

  // Run queries in parallel for instant sub-second response
  const [categories, allVideos] = await Promise.all([
    sql`
      SELECT c.name, c.slug, c.display_order
      FROM content_categories c
      WHERE c.is_enabled = TRUE
      ORDER BY c.display_order ASC, c.name ASC
      LIMIT 12;
    `,
    categoryFilter
      ? sql`
          SELECT i.*, s.name as source_name
          FROM content_items i
          LEFT JOIN content_sources s ON i.source_id = s.id
          WHERE i.content_type = 'video' AND i.status = 'published' AND i.deleted_at IS NULL
            AND (
              LOWER(i.category) = LOWER(${categoryFilter})
              OR LOWER(COALESCE(i.subcategory, '')) = LOWER(${categoryFilter})
            )
          ORDER BY i.published_at DESC
          LIMIT 36;
        `
      : sql`
          SELECT i.*, s.name as source_name
          FROM content_items i
          LEFT JOIN content_sources s ON i.source_id = s.id
          WHERE i.content_type = 'video' AND i.status = 'published' AND i.deleted_at IS NULL
          ORDER BY i.published_at DESC
          LIMIT 36;
        `,
  ]);

  const videos = allVideos;

  return (
    <div className="pt-6 sm:pt-10 pb-20 bg-surface/30 min-h-screen">
      <div className="site-container space-y-8">
        {/* Centered Section Header */}
        <ScrollReveal>
          <div className="w-full flex flex-col items-center justify-center text-center border-b border-border pb-6">
            <SectionHeader
              eyebrow="Visual Wellness"
              title="Health & Medical Video Library"
              subtitle="Verified video content from accredited medical professionals, fitness instructors, and nutrition specialists."
              centered
            />
          </div>
        </ScrollReveal>

        {/* Centered Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Link
            href="/videos"
            className={`px-4 py-1.5 rounded-full text-xs font-heading font-medium transition-all ${
              !categoryFilter
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white hover:bg-surface text-text-secondary border border-border'
            }`}
          >
            All Videos
          </Link>
          {categories.map((c: any) => {
            const active =
              categoryFilter?.toLowerCase() === c.name.toLowerCase() ||
              categoryFilter?.toLowerCase() === c.slug.toLowerCase();
            return (
              <Link
                key={c.slug}
                href={`/videos?category=${encodeURIComponent(c.name)}`}
                className={`px-4 py-1.5 rounded-full text-xs font-heading font-medium transition-all ${
                  active
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-white hover:bg-surface text-text-secondary border border-border'
                }`}
              >
                {c.name}
              </Link>
            );
          })}
        </div>

        {/* Video Grid */}
        {videos.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-border shadow-sm max-w-xl mx-auto">
            <h3 className="font-display text-xl text-dark mb-1">
              No Videos Found {categoryFilter ? `in ${categoryFilter}` : ''}
            </h3>
            <p className="text-sm text-text-muted mb-4">
              We haven&apos;t indexed any videos under this topic yet. Check back soon or explore our full library.
            </p>
            <Link
              href="/videos"
              className="inline-block px-5 py-2.5 bg-primary text-white rounded-full text-xs font-semibold hover:bg-primary-dark transition-all shadow-sm"
            >
              View All Videos
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((item: any) => (
              <ContentCard key={item.id} item={item} />
            ))}
          </div>
        )}

        <HealthDisclaimer />
      </div>
    </div>
  );
}
