/* eslint-disable @typescript-eslint/no-explicit-any */
import { Metadata } from 'next';
import { sql } from '@/lib/db';
import { notFound } from 'next/navigation';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { ContentCard } from '@/components/media/ContentCard';
import { HealthDisclaimer } from '@/components/media/HealthDisclaimer';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, ShieldCheck, Globe } from 'lucide-react';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const sources = await sql`
    SELECT name FROM content_sources WHERE LOWER(REPLACE(name, ' ', '-')) = LOWER(${params.slug})
  `;
  if (sources.length === 0) return { title: 'Source Not Found | HealthGhuru' };

  return {
    title: `${sources[0].name} | HealthGhuru Content Sources`,
    description: `Syndicated health news and evidence-based articles from ${sources[0].name}.`,
  };
}

export default async function SourceDetailPage({ params }: { params: { slug: string } }) {
  const sources = await sql`
    SELECT * FROM content_sources
    WHERE LOWER(REPLACE(name, ' ', '-')) = LOWER(${params.slug})
  `;

  if (sources.length === 0) {
    notFound();
  }

  const source = sources[0];

  const items = await sql`
    SELECT i.*, s.name as source_name
    FROM content_items i
    LEFT JOIN content_sources s ON i.source_id = s.id
    WHERE i.source_id = ${source.id}::uuid AND i.status = 'published' AND i.deleted_at IS NULL
    ORDER BY i.published_at DESC
    LIMIT 30
  `;

  return (
    <div className="pt-6 sm:pt-10 pb-20 bg-surface/30 min-h-screen">
      <div className="site-container space-y-8">
        <ScrollReveal>
          <div className="space-y-4 border-b border-border pb-6">
            <Link
              href="/news"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-primary transition-colors"
            >
              <ArrowLeft size={14} /> Back to News
            </Link>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold uppercase text-text-muted">Content Publisher</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck size={12} /> {source.trust_score} Trust Tier
                  </span>
                </div>
                <h1 className="font-display text-3xl sm:text-4xl text-dark font-bold">{source.name}</h1>
              </div>

              {source.website_url && (
                <a
                  href={source.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-surface text-primary border border-border font-medium text-xs shadow-sm transition-colors shrink-0"
                >
                  <Globe size={14} /> Visit Official Website <ExternalLink size={12} />
                </a>
              )}
            </div>
          </div>
        </ScrollReveal>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-border shadow-sm">
            <h3 className="font-display text-xl text-dark mb-1">No Articles Syndicated Yet</h3>
            <p className="text-sm text-text-muted">
              Scheduled ingestion for this publisher will automatically populate its archive.
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
