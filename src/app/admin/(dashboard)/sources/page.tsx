/* eslint-disable @typescript-eslint/no-explicit-any */
import { requireAdmin } from '@/lib/auth/session';
import { sql } from '@/lib/db';
import { evaluateSourceHealth } from '@/lib/ingestion/health';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { SourcesClient } from './SourcesClient';

export default async function AdminSourcesPage() {
  await requireAdmin();

  const sources = await sql`
    SELECT s.*, c.name as category_name
    FROM content_sources s
    LEFT JOIN content_categories c ON s.category_id = c.id
    ORDER BY s.priority ASC, s.name ASC
  `;

  const enrichedSources = sources.map((s: any) => ({
    ...s,
    healthStatus: evaluateSourceHealth(s),
  }));

  const categories = await sql`
    SELECT id, name, slug FROM content_categories ORDER BY display_order ASC, name ASC
  `;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <ScrollReveal>
        <SectionHeader
          title="Content Sources & Adapters"
          eyebrow="Ingestion Pipeline"
          subtitle="Configure external health feeds, YouTube channels, News APIs, and generic endpoints."
        />
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <SourcesClient initialSources={enrichedSources} categories={categories} />
      </ScrollReveal>
    </div>
  );
}
