/* eslint-disable @typescript-eslint/no-explicit-any */
import { requireAdmin } from '@/lib/auth/session';
import { sql } from '@/lib/db';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import Link from 'next/link';
import { CheckCircle2, AlertTriangle, XCircle, Clock, ArrowRight } from 'lucide-react';

export default async function AdminIngestionPage() {
  await requireAdmin();

  const runs = await sql`
    SELECT 
      r.id,
      r.source_id,
      r.source_name,
      r.status,
      r.started_at,
      r.duration_ms,
      r.items_found,
      r.items_imported,
      r.items_duplicated,
      r.items_failed,
      s.type as source_type
    FROM ingestion_runs r
    LEFT JOIN content_sources s ON r.source_id = s.id
    ORDER BY r.started_at DESC
    LIMIT 50
  `;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <ScrollReveal>
          <SectionHeader
            title="Ingestion Runs"
            eyebrow="Monitoring & Audit"
            subtitle="Real-time execution logs, item metrics, durations, and error reports for all ingestion runs."
          />
        </ScrollReveal>
      </div>

      <ScrollReveal delay={0.1}>
        <div className="bg-white rounded-2xl shadow-card border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-text-secondary">
              <thead className="bg-surface border-b border-border text-xs uppercase font-heading font-semibold text-text-muted">
                <tr>
                  <th className="py-4 px-6">Source</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Started</th>
                  <th className="py-4 px-6">Duration</th>
                  <th className="py-4 px-6 text-center">Found</th>
                  <th className="py-4 px-6 text-center">Imported</th>
                  <th className="py-4 px-6 text-center">Duplicates</th>
                  <th className="py-4 px-6 text-center">Failed</th>
                  <th className="py-4 px-6 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {runs.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-text-muted">
                      No ingestion runs recorded yet. Use &quot;Fetch Now&quot; on a source or await scheduled cron.
                    </td>
                  </tr>
                ) : (
                  runs.map((run: any) => {
                    let statusBadge = (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 size={13} /> Success
                      </span>
                    );

                    if (run.status === 'partial') {
                      statusBadge = (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          <AlertTriangle size={13} /> Partial
                        </span>
                      );
                    } else if (run.status === 'failed') {
                      statusBadge = (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle size={13} /> Failed
                        </span>
                      );
                    } else if (run.status === 'running') {
                      statusBadge = (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          <Clock size={13} className="animate-spin" /> Running
                        </span>
                      );
                    }

                    return (
                      <tr key={run.id} className="hover:bg-surface/50 transition-colors">
                        <td className="py-4 px-6 font-medium text-dark">
                          <div>{run.source_name || 'System Scheduler'}</div>
                          <div className="text-xs text-text-muted capitalize">{run.source_type}</div>
                        </td>
                        <td className="py-4 px-6">{statusBadge}</td>
                        <td className="py-4 px-6 text-xs text-text-muted">
                          {new Date(run.started_at).toLocaleString()}
                        </td>
                        <td className="py-4 px-6 font-mono text-xs">
                          {run.duration_ms ? `${(run.duration_ms / 1000).toFixed(1)}s` : '—'}
                        </td>
                        <td className="py-4 px-6 text-center font-medium text-dark">{run.items_found}</td>
                        <td className="py-4 px-6 text-center font-medium text-emerald-600">
                          +{run.items_imported}
                        </td>
                        <td className="py-4 px-6 text-center font-medium text-amber-600">
                          {run.items_duplicated}
                        </td>
                        <td className="py-4 px-6 text-center font-medium text-rose-600">
                          {run.items_failed}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Link
                            href={`/admin/ingestion/${run.id}`}
                            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-dark transition-colors"
                          >
                            Inspect <ArrowRight size={13} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
