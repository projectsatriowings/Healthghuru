/* eslint-disable @typescript-eslint/no-explicit-any */
import { Metadata } from 'next';
import { sql } from '@/lib/db';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { ContentCard } from '@/components/media/ContentCard';
import { HealthDisclaimer } from '@/components/media/HealthDisclaimer';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Health Articles | HealthGhuru — Expert Insights & In-Depth Wellness Guides',
  description: 'Evidence-based articles on Nutrition, Fitness, Mental Health, Sleep, and Preventive Medicine by medical writers and reputable health institutions.',
};

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: { category?: string; filter?: string };
}) {
  const categoryFilter = searchParams.category;
  const isOriginalOnly = searchParams.filter === 'original';

  let articles;
  if (isOriginalOnly) {
    articles = await sql`
      SELECT i.*, s.name as source_name
      FROM content_items i
      LEFT JOIN content_sources s ON i.source_id = s.id
      WHERE i.content_type = 'article' AND i.status = 'published' AND i.deleted_at IS NULL
        AND i.is_external = FALSE
      ORDER BY i.published_at DESC
      LIMIT 24
    `;
  } else if (categoryFilter) {
    articles = await sql`
      SELECT i.*, s.name as source_name
      FROM content_items i
      LEFT JOIN content_sources s ON i.source_id = s.id
      WHERE i.content_type = 'article' AND i.status = 'published' AND i.deleted_at IS NULL
        AND LOWER(i.category) = LOWER(${categoryFilter})
      ORDER BY i.published_at DESC
      LIMIT 24
    `;
  } else {
    articles = await sql`
      SELECT i.*, s.name as source_name
      FROM content_items i
      LEFT JOIN content_sources s ON i.source_id = s.id
      WHERE i.content_type = 'article' AND i.status = 'published' AND i.deleted_at IS NULL
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
              eyebrow="Editorial & Syndicated"
              title="Health & Wellness Articles"
              subtitle="Explore original guides by HealthGhuru alongside in-depth analyses from accredited medical publishers."
            />

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/articles"
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  !isOriginalOnly ? 'bg-primary text-white' : 'bg-white text-text-secondary border border-border'
                }`}
              >
                All Articles
              </Link>
              <Link
                href="/articles?filter=original"
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isOriginalOnly ? 'bg-primary text-white' : 'bg-white text-text-secondary border border-border'
                }`}
              >
                ✦ HealthGhuru Originals
              </Link>
            </div>
          </div>
        </ScrollReveal>

        {/* Categories Bar */}
        <div className="flex flex-wrap items-center gap-2">
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
          <div className="bg-white rounded-2xl p-12 text-center border border-border shadow-sm">
            <h3 className="font-display text-xl text-dark mb-1">No Articles Found</h3>
            <p className="text-sm text-text-muted">
              There are currently no articles in this section. Explore our other health categories.
            </p>
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
