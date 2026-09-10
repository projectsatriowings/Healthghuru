import { requireAdmin } from '@/lib/auth/session';
import { sql } from '@/lib/db';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { CategoriesClient } from './CategoriesClient';

export default async function AdminCategoriesPage() {
  await requireAdmin();

  const categories = await sql`
    WITH counts AS (
      SELECT LOWER(category) as cat, COUNT(*)::int as count
      FROM content_items
      WHERE deleted_at IS NULL
      GROUP BY LOWER(category)
    )
    SELECT 
      c.id,
      c.name,
      c.slug,
      c.description,
      c.icon_name,
      c.display_order,
      c.is_enabled,
      c.created_at,
      COALESCE(counts.count, 0) as item_count
    FROM content_categories c
    LEFT JOIN counts ON LOWER(c.name) = counts.cat
    ORDER BY c.display_order ASC, c.name ASC
  `;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <ScrollReveal>
        <SectionHeader
          title="Health Taxonomy & Categories"
          eyebrow="Taxonomy Engine"
          subtitle="Manage the 20+ core health pillars, topics, and classification hierarchies used for content organization."
        />
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <CategoriesClient initialCategories={categories} />
      </ScrollReveal>
    </div>
  );
}
