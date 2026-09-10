import { Metadata } from 'next';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { SearchClient } from './SearchClient';
import { HealthDisclaimer } from '@/components/media/HealthDisclaimer';
import { sql } from '@/lib/db';

export const metadata: Metadata = {
  title: 'Search Health Topics | HealthGhuru — Unified Medical Search',
  description: 'Search across thousands of curated health articles, breaking news, medical videos, and research bulletins.',
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string; type?: string };
}) {
  const initialQuery = searchParams.q || '';
  const initialType = searchParams.type || 'all';

  const categories = await sql`
    SELECT name, slug FROM content_categories ORDER BY display_order ASC, name ASC LIMIT 12
  `;

  return (
    <div className="pt-6 sm:pt-10 pb-20 bg-surface/30 min-h-screen">
      <div className="site-container max-w-6xl space-y-8">
        <ScrollReveal>
          <SectionHeader
            eyebrow="Universal Search"
            title="Search Health & Wellness"
            subtitle="Find evidence-based answers across clinical research, health news, original articles, and verified videos."
          />
        </ScrollReveal>

        <SearchClient
          initialQuery={initialQuery}
          initialType={initialType}
          categories={categories}
        />

        <HealthDisclaimer />
      </div>
    </div>
  );
}
