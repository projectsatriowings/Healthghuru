import { requireAdmin } from '@/lib/auth/session';
import { sql } from '@/lib/db';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { PlanOverrideClient } from './PlanOverrideClient';

export default async function AdminSubscriptionsPage() {
  await requireAdmin();

  const users = await sql`
    SELECT 
      u.id, 
      u.name, 
      u.email, 
      p.tier, 
      p.records_limit, 
      p.active_goals_limit, 
      p.family_members_limit
    FROM users u
    LEFT JOIN user_plans p ON p.user_id = u.id
    ORDER BY u.name ASC
    LIMIT 100
  `;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <ScrollReveal>
        <SectionHeader 
          title="Subscription Management" 
          eyebrow="Admin Console"
          subtitle="Override user subscription plans and limits."
        />
      </ScrollReveal>

      <ScrollReveal delay={0.2}>
        <PlanOverrideClient users={users} />
      </ScrollReveal>
    </div>
  );
}
