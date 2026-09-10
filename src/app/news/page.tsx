/* eslint-disable @typescript-eslint/no-explicit-any */
import { Metadata } from 'next';
import { sql } from '@/lib/db';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { ContentCard } from '@/components/media/ContentCard';
import { BreakingNewsTicker } from '@/components/media/BreakingNewsTicker';
import { HealthDisclaimer } from '@/components/media/HealthDisclaimer';
import Link from 'next/link';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Health News | HealthGhuru — Verified Global Health & Medical Headlines',
  description: 'Real-time health news, medical research updates, preventive care announcements, and evidence-based stories from verified medical sources.',
};

export default async function NewsPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const categoryFilter = searchParams?.category;

  // Execute database queries in parallel for instant sub-second rendering
  const [breakingItems, categories, newsItems] = await Promise.all([
    sql`
      SELECT id, title, slug, category, canonical_url, is_external,
             (SELECT name FROM content_sources WHERE id = content_items.source_id) as source_name
      FROM content_items
      WHERE is_breaking = TRUE AND status = 'published' AND deleted_at IS NULL
      ORDER BY published_at DESC
      LIMIT 5
    `,
    sql`
      SELECT name, slug FROM content_categories WHERE is_enabled = TRUE ORDER BY display_order ASC, name ASC LIMIT 12
    `,
    categoryFilter
      ? sql`
          SELECT i.*, s.name as source_name
          FROM content_items i
          LEFT JOIN content_sources s ON i.source_id = s.id
          WHERE i.content_type = 'news' AND i.status = 'published' AND i.deleted_at IS NULL
            AND (
              LOWER(i.category) = LOWER(${categoryFilter})
              OR LOWER(COALESCE(i.subcategory, '')) = LOWER(${categoryFilter})
            )
          ORDER BY i.published_at DESC
          LIMIT 24
        `
      : sql`
          SELECT i.*, s.name as source_name
          FROM content_items i
          LEFT JOIN content_sources s ON i.source_id = s.id
          WHERE i.content_type = 'news' AND i.status = 'published' AND i.deleted_at IS NULL
          ORDER BY i.published_at DESC
          LIMIT 24
        `,
  ]);

  return (
    <div className="pb-20 bg-surface/30 min-h-screen">
      {breakingItems.length > 0 && <BreakingNewsTicker items={breakingItems} />}

      <div className={`site-container ${breakingItems.length > 0 ? 'mt-6 sm:mt-8' : 'pt-6 sm:pt-10'} space-y-8`}>
        {/* Centered Section Header */}
        <ScrollReveal>
          <div className="w-full flex flex-col items-center justify-center text-center border-b border-border pb-6">
            <SectionHeader
              eyebrow="Live Health News"
              title="Global Health & Medical Updates"
              subtitle="Curated from world health organizations, leading research institutes, and accredited publishers."
              centered
            />
          </div>
        </ScrollReveal>

        {/* Centered Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2">
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
          <div className="bg-white rounded-2xl p-12 text-center border border-border shadow-sm max-w-xl mx-auto">
            <h3 className="font-display text-xl text-dark mb-1">No News Available</h3>
            <p className="text-sm text-text-muted mb-4">
              There are currently no articles published in this category. Check back soon.
            </p>
            <Link
              href="/news"
              className="inline-block px-5 py-2.5 bg-primary text-white rounded-full text-xs font-semibold hover:bg-primary-dark transition-all shadow-sm"
            >
              View All News
            </Link>
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
