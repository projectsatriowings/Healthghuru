import { requireAdmin } from '@/lib/auth/session';
import { sql } from '@/lib/db';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { UserTableClient, UserRow } from './UserTableClient';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  await requireAdmin();

  // Raw SQL to fetch users and their stats
  const users = await sql`
    SELECT 
      u.id, 
      u.name, 
      u.email, 
      u.role, 
      COALESCE(u.status, 'active') as status,
      COALESCE(p.tier, 'free') as plan
    FROM users u
    LEFT JOIN user_plans p ON p.user_id = u.id
    ORDER BY u.name ASC
    LIMIT 100
  ` as unknown as UserRow[];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <ScrollReveal>
        <SectionHeader 
          title="User Management" 
          eyebrow="Admin Console"
          subtitle="View and manage user accounts and roles."
        />
      </ScrollReveal>

      <ScrollReveal delay={0.2} className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(46,125,50,0.08)] border border-border overflow-hidden p-1">
        <UserTableClient initialUsers={users} />
      </ScrollReveal>
    </div>
  );
}
