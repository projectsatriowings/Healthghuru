/* eslint-disable @typescript-eslint/no-explicit-any */
import { Metadata } from 'next';
import { sql } from '@/lib/db';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { ContentCard } from '@/components/media/ContentCard';
import { HealthDisclaimer } from '@/components/media/HealthDisclaimer';
import { Flame } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Trending Health Topics | HealthGhuru — Most Engaging Stories',
  description: 'Trending health discussions, high-engagement wellness breakthroughs, and popular health guides.',
};

export default async function TrendingPage() {
  const items = await sql`
    SELECT i.*, s.name as source_name
    FROM content_items i
    LEFT JOIN content_sources s ON i.source_id = s.id
    WHERE i.status = 'published' AND i.deleted_at IS NULL
    ORDER BY (
      i.view_count * 2 + 
      i.share_count * 5 + 
      i.bookmark_count * 3 + 
      i.quality_score + 
      CASE WHEN i.is_trending = TRUE THEN 100 ELSE 0 END
    ) DESC, i.published_at DESC
    LIMIT 24
  `;

  return (
    <div className="pt-6 sm:pt-10 pb-20 bg-surface/30 min-h-screen">
      <div className="site-container space-y-8">
        <ScrollReveal>
          <div className="border-b border-border pb-6 flex items-start gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 shrink-0 mt-1">
              <Flame size={28} />
            </div>
            <SectionHeader
              eyebrow="Community Engagement"
              title="Trending Health Stories"
              subtitle="The most read, shared, and discussed health topics and scientific developments this week."
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
