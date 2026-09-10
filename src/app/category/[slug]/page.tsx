/* eslint-disable @typescript-eslint/no-explicit-any */
import { Metadata } from 'next';
import { sql } from '@/lib/db';
import { notFound } from 'next/navigation';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { ContentCard } from '@/components/media/ContentCard';
import { HealthDisclaimer } from '@/components/media/HealthDisclaimer';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const cats = await sql`SELECT name, description FROM content_categories WHERE slug = ${params.slug}`;
  if (cats.length === 0) return { title: 'Category Not Found | HealthGhuru' };

  return {
    title: `${cats[0].name} | HealthGhuru Topics`,
    description: cats[0].description || `Expert-reviewed content and latest updates on ${cats[0].name}.`,
  };
}

export default async function CategoryDetailPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { type?: string };
}) {
  const cats = await sql`
    SELECT * FROM content_categories WHERE slug = ${params.slug}
  `;

  if (cats.length === 0) {
    notFound();
  }

  const category = cats[0];
  const typeFilter = searchParams.type;

  let items;
  if (typeFilter && typeFilter !== 'all') {
    items = await sql`
      SELECT i.*, s.name as source_name
      FROM content_items i
      LEFT JOIN content_sources s ON i.source_id = s.id
      WHERE LOWER(i.category) = LOWER(${category.name})
        AND i.content_type = ${typeFilter}
        AND i.status = 'published' AND i.deleted_at IS NULL
      ORDER BY i.published_at DESC
      LIMIT 30
    `;
  } else {
    items = await sql`
      SELECT i.*, s.name as source_name
      FROM content_items i
      LEFT JOIN content_sources s ON i.source_id = s.id
      WHERE LOWER(i.category) = LOWER(${category.name})
        AND i.status = 'published' AND i.deleted_at IS NULL
      ORDER BY i.published_at DESC
      LIMIT 30
    `;
  }

  return (
    <div className="pt-6 sm:pt-10 pb-20 bg-surface/30 min-h-screen">
      <div className="site-container space-y-8">
        <ScrollReveal>
          <div className="space-y-4 border-b border-border pb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-primary transition-colors"
            >
              <ArrowLeft size={14} /> Back to Home
            </Link>

            <SectionHeader
              eyebrow="Health Topic Pillar"
              title={category.name}
              subtitle={category.description || `Comprehensive insights, breaking clinical reports, and guides on ${category.name}.`}
            />

            {/* Type Switcher */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Link
                href={`/category/${params.slug}`}
                className={`px-4 py-1.5 rounded-full text-xs font-heading font-medium transition-all ${
                  !typeFilter || typeFilter === 'all'
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-white hover:bg-surface text-text-secondary border border-border'
                }`}
              >
                All Content
              </Link>
              {['article', 'news', 'video'].map(type => (
                <Link
                  key={type}
                  href={`/category/${params.slug}?type=${type}`}
                  className={`px-4 py-1.5 rounded-full text-xs font-heading font-medium capitalize transition-all ${
                    typeFilter === type
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-white hover:bg-surface text-text-secondary border border-border'
                  }`}
                >
                  {type + 's'}
                </Link>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-border shadow-sm">
            <h3 className="font-display text-xl text-dark mb-1">No Content in this Category</h3>
            <p className="text-sm text-text-muted">
              We are constantly indexing new health publications. Check back soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item: any) => (
              <ContentCard key={item.id} item={item} />
            ))}
          </div>
        )}

        <HealthDisclaimer />
      </div>
    </div>
  );
}
