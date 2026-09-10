/* eslint-disable @typescript-eslint/no-explicit-any */
import { Metadata } from 'next';
import { sql } from '@/lib/db';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { ContentCard } from '@/components/media/ContentCard';
import { HealthDisclaimer } from '@/components/media/HealthDisclaimer';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Health Videos | HealthGhuru — Verified Medical & Wellness Video Guides',
  description: 'Watch doctor-led wellness breakdowns, fitness routines, nutrition science explainers, and mental health practices from certified channels.',
};

export default async function VideosPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const categoryFilter = searchParams.category;

  let videos;
  if (categoryFilter) {
    videos = await sql`
      SELECT i.*, s.name as source_name
      FROM content_items i
      LEFT JOIN content_sources s ON i.source_id = s.id
      WHERE i.content_type = 'video' AND i.status = 'published' AND i.deleted_at IS NULL
        AND LOWER(i.category) = LOWER(${categoryFilter})
      ORDER BY i.published_at DESC
      LIMIT 24
    `;
  } else {
    videos = await sql`
      SELECT i.*, s.name as source_name
      FROM content_items i
      LEFT JOIN content_sources s ON i.source_id = s.id
      WHERE i.content_type = 'video' AND i.status = 'published' AND i.deleted_at IS NULL
      ORDER BY i.published_at DESC
      LIMIT 24
    `;
  }

  const categories = await sql`
    SELECT name, slug FROM content_categories ORDER BY display_order ASC, name ASC LIMIT 10
  `;

  return (
    <div className="pt-28 pb-20 bg-surface/30 min-h-screen">
      <div className="site-container space-y-8">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
            <SectionHeader
              eyebrow="Visual Wellness"
              title="Health & Medical Video Library"
              subtitle="Verified video content from accredited medical professionals, fitness instructors, and nutrition specialists."
            />
          </div>
        </ScrollReveal>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
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
            const active = categoryFilter?.toLowerCase() === c.name.toLowerCase();
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
          <div className="bg-white rounded-2xl p-12 text-center border border-border shadow-sm">
            <h3 className="font-display text-xl text-dark mb-1">No Videos Found</h3>
            <p className="text-sm text-text-muted">
              Configure or fetch YouTube channels in the admin dashboard to populate the video gallery.
            </p>
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
