import { requireAdmin } from '@/lib/auth/session';
import { sql } from '@/lib/db';
import Link from 'next/link';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { UnifiedContentClient } from './UnifiedContentClient';

export const dynamic = 'force-dynamic';

export default async function AdminContentPage() {
  await requireAdmin();

  // Run lightweight projected queries in parallel (avoid fetching huge full bodies / embeddings)
  const [items, categories, sources] = await Promise.all([
    sql`
      SELECT 
        i.id,
        i.title,
        i.slug,
        i.content_type,
        i.category,
        i.status,
        i.is_breaking,
        i.is_featured,
        i.is_trending,
        i.is_external,
        i.canonical_url,
        i.published_at,
        i.author_name,
        s.name as source_name,
        s.type as source_type
      FROM content_items i
      LEFT JOIN content_sources s ON i.source_id = s.id
      WHERE i.deleted_at IS NULL
      ORDER BY i.published_at DESC
      LIMIT 100
    `,
    sql`SELECT id, name FROM content_categories ORDER BY display_order ASC, name ASC`,
    sql`SELECT id, name FROM content_sources ORDER BY name ASC`
  ]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <ScrollReveal>
          <SectionHeader 
            title="Content Management" 
            eyebrow="Admin Console"
            subtitle="Manage and syndicate HealthGhuru original articles alongside external health news, videos, and periodicals."
          />
        </ScrollReveal>
        
        <ScrollReveal delay={0.1}>
          <div className="flex items-center gap-3">
            <Link 
              href="/admin/review-queue"
              className="bg-surface hover:bg-surface-alt text-text-primary px-5 py-2 rounded-full font-medium text-sm transition-colors border border-border inline-block shadow-sm"
            >
              Review Queue
            </Link>
            <Link 
              href="/admin/content/new"
              className="bg-accent hover:opacity-90 text-white px-5 py-2 rounded-full font-medium text-sm transition-colors shadow-sm hover:shadow-md inline-block"
            >
              + Write Original Article
            </Link>
          </div>
        </ScrollReveal>
      </div>

      <ScrollReveal delay={0.15} className="bg-white rounded-2xl shadow-card border border-border overflow-hidden p-4">
        <UnifiedContentClient initialItems={items} categories={categories} sources={sources} />
      </ScrollReveal>
    </div>
  );
}
