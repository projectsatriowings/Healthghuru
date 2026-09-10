import { requireAdmin } from '@/lib/auth/session';
import { sql } from '@/lib/db';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { CategoriesClient } from './CategoriesClient';

export default async function AdminCategoriesPage() {
  await requireAdmin();

  const categories = await sql`
    SELECT c.*, COUNT(i.id)::int as item_count
    FROM content_categories c
    LEFT JOIN content_items i ON LOWER(c.name) = LOWER(i.category) AND i.deleted_at IS NULL
    GROUP BY c.id
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
