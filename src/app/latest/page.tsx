/* eslint-disable @typescript-eslint/no-explicit-any */
import { Metadata } from 'next';
import { sql } from '@/lib/db';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { ContentCard } from '@/components/media/ContentCard';
import { HealthDisclaimer } from '@/components/media/HealthDisclaimer';

export const metadata: Metadata = {
  title: 'Latest Health Feeds | HealthGhuru — Real-Time Wellness Stream',
  description: 'Chronological timeline of the newest health news, articles, and video releases across all verified sources.',
};

export default async function LatestFeedPage() {
  const items = await sql`
    SELECT i.*, s.name as source_name
    FROM content_items i
    LEFT JOIN content_sources s ON i.source_id = s.id
    WHERE i.status = 'published' AND i.deleted_at IS NULL
    ORDER BY i.published_at DESC
    LIMIT 30
  `;

  return (
    <div className="pt-28 pb-20 bg-surface/30 min-h-screen">
      <div className="site-container space-y-8">
        <ScrollReveal>
          <div className="border-b border-border pb-6">
            <SectionHeader
              eyebrow="Chronological Stream"
              title="Latest Health Updates"
              subtitle="All newly published and syndicated health stories, news, and videos in real time."
            />
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item: any) => (
            <ContentCard key={item.id} item={item} />
          ))}
        </div>

        <HealthDisclaimer />
      </div>
    </div>
  );
}
