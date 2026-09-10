/* eslint-disable @typescript-eslint/no-explicit-any */
import { Metadata } from 'next';
import { sql } from '@/lib/db';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { ContentCard } from '@/components/media/ContentCard';
import { BreakingNewsTicker } from '@/components/media/BreakingNewsTicker';
import { HealthDisclaimer } from '@/components/media/HealthDisclaimer';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Health News | HealthGhuru — Verified Global Health & Medical Headlines',
  description: 'Real-time health news, medical research updates, preventive care announcements, and evidence-based stories from verified medical sources.',
};

export default async function NewsPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const categoryFilter = searchParams.category;

  const breakingItems = await sql`
    SELECT id, title, slug, category, canonical_url, is_external,
           (SELECT name FROM content_sources WHERE id = content_items.source_id) as source_name
    FROM content_items
    WHERE is_breaking = TRUE AND status = 'published' AND deleted_at IS NULL
    ORDER BY published_at DESC
    LIMIT 5
  `;

  let newsItems;
  if (categoryFilter) {
    newsItems = await sql`
      SELECT i.*, s.name as source_name
      FROM content_items i
      LEFT JOIN content_sources s ON i.source_id = s.id
      WHERE i.content_type = 'news' AND i.status = 'published' AND i.deleted_at IS NULL
        AND LOWER(i.category) = LOWER(${categoryFilter})
      ORDER BY i.published_at DESC
      LIMIT 24
    `;
  } else {
    newsItems = await sql`
      SELECT i.*, s.name as source_name
      FROM content_items i
      LEFT JOIN content_sources s ON i.source_id = s.id
      WHERE i.content_type = 'news' AND i.status = 'published' AND i.deleted_at IS NULL
      ORDER BY i.published_at DESC
      LIMIT 24
    `;
  }

  const categories = await sql`
    SELECT name, slug FROM content_categories ORDER BY display_order ASC, name ASC LIMIT 10
  `;

  return (
    <div className="pt-24 pb-20 bg-surface/30 min-h-screen">
      {breakingItems.length > 0 && <BreakingNewsTicker items={breakingItems} />}

      <div className="site-container mt-8 space-y-8">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
            <SectionHeader
              eyebrow="Live Health News"
              title="Global Health & Medical Updates"
              subtitle="Curated from world health organizations, leading research institutes, and accredited publishers."
            />
          </div>
        </ScrollReveal>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/news"
            className={`px-4 py-1.5 rounded-full text-xs font-heading font-medium transition-all ${
              !categoryFilter
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white hover:bg-surface text-text-secondary border border-border'
            }`}
          >
            All News
          </Link>
          {categories.map((c: any) => {
            const active = categoryFilter?.toLowerCase() === c.name.toLowerCase();
            return (
              <Link
                key={c.slug}
                href={`/news?category=${encodeURIComponent(c.name)}`}
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

        {/* News Grid */}
        {newsItems.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-border shadow-sm">
            <h3 className="font-display text-xl text-dark mb-1">No News Available</h3>
            <p className="text-sm text-text-muted">
              There are currently no articles published in this category. Check back soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newsItems.map((item: any) => (
              <ContentCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {/* Medical Disclaimer */}
        <HealthDisclaimer />
      </div>
    </div>
  );
}
