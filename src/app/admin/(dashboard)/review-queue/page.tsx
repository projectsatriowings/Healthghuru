import { requireAdmin } from '@/lib/auth/session';
import { sql } from '@/lib/db';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { ReviewQueueClient } from './ReviewQueueClient';

export default async function AdminReviewQueuePage() {
  await requireAdmin();

  const items = await sql`
    SELECT 
      i.*,
      s.name as source_name,
      s.trust_score as source_trust_score,
      s.type as source_type
    FROM content_items i
    LEFT JOIN content_sources s ON i.source_id = s.id
    WHERE (i.status = 'review' OR i.requires_review = TRUE) AND i.deleted_at IS NULL
    ORDER BY i.quality_score DESC, i.published_at DESC
  `;

  const categories = await sql`
    SELECT id, name FROM content_categories ORDER BY display_order ASC, name ASC
  `;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <ScrollReveal>
        <SectionHeader
          title="Editorial Review Queue"
          eyebrow="Moderation & Quality Gate"
          subtitle="Review, categorize, verify, and approve incoming external health articles, videos, and news before public syndication."
        />
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <ReviewQueueClient initialItems={items} categories={categories} />
      </ScrollReveal>
    </div>
  );
}
