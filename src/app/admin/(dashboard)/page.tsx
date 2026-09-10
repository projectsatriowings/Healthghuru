import { requireAdmin } from '@/lib/auth/session';
import { sql } from '@/lib/db';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { Users, FileText, Globe, BookOpen } from 'lucide-react';
import { DashboardChartClient } from './DashboardChartClient';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  await requireAdmin();

  // Raw SQL queries to get live media platform KPI metrics
  const totalContent = await sql`SELECT count(*) FROM content_items WHERE status = 'published' AND deleted_at IS NULL`;
  const totalArticles = await sql`SELECT count(*) FROM articles WHERE status = 'published' AND deleted_at IS NULL`;
  const activeSources = await sql`SELECT count(*) FROM content_sources WHERE enabled = TRUE`;
  const totalUsers = await sql`SELECT count(*) FROM users`;

  // Get data for the chart (Items published per day over last 30 days)
  const chartDataRaw = await sql`
    SELECT DATE(published_at) as date, COUNT(*) as count
    FROM content_items
    WHERE published_at >= CURRENT_DATE - INTERVAL '30 days' AND deleted_at IS NULL
    GROUP BY DATE(published_at)
    ORDER BY DATE(published_at) ASC
  `;

  // Generate the last 30 days to ensure continuity in the chart
  const chartData = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    
    // Find if we have data for this date
    const found = chartDataRaw.find(row => {
      const rowDateStr = row.date instanceof Date ? row.date.toISOString().split('T')[0] : new Date(row.date).toISOString().split('T')[0];
      return rowDateStr === dateStr;
    });

    chartData.push({
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: found ? parseInt(found.count) : 0
    });
  }

  const kpis = [
    { label: 'Published Content', value: totalContent[0].count, icon: FileText, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Editorial Articles', value: totalArticles[0].count, icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Active Ingestion Sources', value: activeSources[0].count, icon: Globe, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Registered Users', value: totalUsers[0].count, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <ScrollReveal>
        <SectionHeader 
          title="Platform Analytics" 
          eyebrow="Admin Console"
          subtitle="Overview of HealthGhuru platform usage and metrics."
        />
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <ScrollReveal key={i} delay={0.1 * i}>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-border flex items-center justify-between hover:shadow-md transition-shadow">
                <div>
                  <p className="text-sm text-text-secondary font-medium mb-1">{kpi.label}</p>
                  <p className="text-3xl font-heading font-bold text-dark">{kpi.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-full ${kpi.bg} ${kpi.color} flex items-center justify-center`}>
                  <Icon size={24} />
                </div>
              </div>
            </ScrollReveal>
          );
        })}
      </div>

      <ScrollReveal delay={0.4}>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-border h-96 flex items-center justify-center">
          <DashboardChartClient data={chartData} />
        </div>
      </ScrollReveal>
    </div>
  );
}
