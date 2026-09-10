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
  title: 'Health Articles | HealthGhuru — Expert Insights & In-Depth Wellness Guides',
  description: 'Evidence-based articles on Nutrition, Fitness, Mental Health, Sleep, and Preventive Medicine by medical writers and reputable health institutions.',
};

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: { category?: string; filter?: string };
}) {
  const categoryFilter = searchParams?.category;
  const isOriginalOnly = searchParams?.filter === 'original';

  // Execute database queries in parallel for instant response
  const [categories, articles] = await Promise.all([
    sql`
      SELECT name, slug FROM content_categories WHERE is_enabled = TRUE ORDER BY display_order ASC, name ASC LIMIT 12
    `,
    isOriginalOnly
      ? sql`
          SELECT i.*, s.name as source_name
          FROM content_items i
          LEFT JOIN content_sources s ON i.source_id = s.id
          WHERE i.content_type = 'article' AND i.status = 'published' AND i.deleted_at IS NULL
            AND i.is_external = FALSE
          ORDER BY i.published_at DESC
          LIMIT 24
        `
      : categoryFilter
      ? sql`
          SELECT i.*, s.name as source_name
          FROM content_items i
          LEFT JOIN content_sources s ON i.source_id = s.id
          WHERE i.content_type = 'article' AND i.status = 'published' AND i.deleted_at IS NULL
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
          WHERE i.content_type = 'article' AND i.status = 'published' AND i.deleted_at IS NULL
          ORDER BY i.published_at DESC
          LIMIT 24
        `,
  ]);

  return (
    <div className="pt-6 sm:pt-10 pb-20 bg-surface/30 min-h-screen">
      <div className="site-container space-y-8">
        {/* Centered Section Header */}
        <ScrollReveal>
          <div className="w-full flex flex-col items-center justify-center text-center border-b border-border pb-6 space-y-5">
            <SectionHeader
              eyebrow="Editorial & Syndicated"
              title="Health & Wellness Articles"
              subtitle="Explore original guides by HealthGhuru alongside in-depth analyses from accredited medical publishers."
              centered
            />

            {/* Centered Filter Tabs */}
            <div className="flex items-center justify-center gap-2 pt-2">
              <Link
                href="/articles"
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  !isOriginalOnly ? 'bg-primary text-white shadow-sm' : 'bg-white text-text-secondary border border-border hover:bg-surface'
                }`}
              >
                All Articles
              </Link>
              <Link
                href="/articles?filter=original"
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isOriginalOnly ? 'bg-primary text-white shadow-sm' : 'bg-white text-text-secondary border border-border hover:bg-surface'
                }`}
              >
                ✦ HealthGhuru Originals
              </Link>
            </div>
          </div>
        </ScrollReveal>

        {/* Centered Categories Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {categories.map((c: any) => {
            const active = categoryFilter?.toLowerCase() === c.name.toLowerCase();
            return (
              <Link
                key={c.slug}
                href={`/articles?category=${encodeURIComponent(c.name)}`}
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

        {/* Articles Grid */}
        {articles.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-border shadow-sm max-w-xl mx-auto">
            <h3 className="font-display text-xl text-dark mb-1">No Articles Found</h3>
            <p className="text-sm text-text-muted mb-4">
              There are currently no articles in this section. Explore our other health categories.
            </p>
            <Link
              href="/articles"
              className="inline-block px-5 py-2.5 bg-primary text-white rounded-full text-xs font-semibold hover:bg-primary-dark transition-all shadow-sm"
            >
              View All Articles
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((item: any) => (
              <ContentCard key={item.id} item={item} />
            ))}
          </div>
        )}

        <HealthDisclaimer />
      </div>
    </div>
  );
}
