/* eslint-disable @typescript-eslint/no-explicit-any */
import { requireAdmin } from '@/lib/auth/session';
import { sql } from '@/lib/db';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export default async function RunDetailPage({ params }: { params: { runId: string } }) {
  await requireAdmin();

  const runs = await sql`
    SELECT r.*, s.type as source_type, s.website_url, s.feed_url
    FROM ingestion_runs r
    LEFT JOIN content_sources s ON r.source_id = s.id
    WHERE r.id = ${params.runId}::uuid
  `;

  if (runs.length === 0) {
    notFound();
  }

  const run = runs[0];
  const errors = await sql`
    SELECT * FROM ingestion_errors
    WHERE run_id = ${params.runId}::uuid
    ORDER BY created_at ASC
  `;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <ScrollReveal>
        <div className="flex items-center gap-3 mb-2">
          <Link
            href="/admin/ingestion"
            className="text-xs font-medium text-text-muted hover:text-primary transition-colors flex items-center gap-1"
          >
            <ArrowLeft size={14} /> Back to Ingestion Runs
          </Link>
        </div>
        <SectionHeader
          title={`Run: ${run.source_name || 'System Scheduler'}`}
          eyebrow="Ingestion Execution Report"
          subtitle={`Run ID: ${run.id}`}
        />
      </ScrollReveal>

      {/* Summary Stats Grid */}
      <ScrollReveal delay={0.1}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-border">
            <span className="text-xs text-text-muted uppercase font-heading font-semibold">Status</span>
            <div className="mt-1 text-xl font-display font-semibold capitalize text-dark">{run.status}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-border">
            <span className="text-xs text-text-muted uppercase font-heading font-semibold">Duration</span>
            <div className="mt-1 text-xl font-display font-semibold text-dark">
              {run.duration_ms ? `${(run.duration_ms / 1000).toFixed(2)}s` : '—'}
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-border">
            <span className="text-xs text-text-muted uppercase font-heading font-semibold">Imported</span>
            <div className="mt-1 text-xl font-display font-semibold text-emerald-600">+{run.items_imported}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-border">
            <span className="text-xs text-text-muted uppercase font-heading font-semibold">Failures</span>
            <div className="mt-1 text-xl font-display font-semibold text-rose-600">{run.items_failed}</div>
          </div>
        </div>
      </ScrollReveal>

      {/* Detailed Meta */}
      <ScrollReveal delay={0.2}>
        <div className="bg-white p-6 rounded-2xl border border-border space-y-3 text-sm">
          <h3 className="font-heading font-semibold text-dark text-base border-b border-border/40 pb-2">
            Execution Timestamps & Parameters
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-text-muted">Started At: </span>
              <span className="font-medium text-dark">{new Date(run.started_at).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-text-muted">Completed At: </span>
              <span className="font-medium text-dark">
                {run.completed_at ? new Date(run.completed_at).toLocaleString() : 'In Progress'}
              </span>
            </div>
            <div>
              <span className="text-text-muted">Source Feed/URL: </span>
              <span className="font-mono text-dark truncate block">{run.feed_url || run.website_url || 'N/A'}</span>
            </div>
            <div>
              <span className="text-text-muted">Duplicates Detected: </span>
              <span className="font-medium text-dark">{run.items_duplicated} items</span>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Error Audit Table */}
      <ScrollReveal delay={0.3}>
        <div className="bg-white rounded-2xl border border-border overflow-hidden p-6">
          <h3 className="font-heading font-semibold text-dark text-base mb-4 flex items-center gap-2">
            <AlertCircle size={18} className="text-rose-600" />
            Individual Record Errors ({errors.length})
          </h3>

          {errors.length === 0 ? (
            <div className="py-6 text-center text-sm text-text-muted">
              ✓ No item errors recorded for this ingestion run. All items processed cleanly.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-text-secondary">
                <thead className="bg-surface border-b border-border font-semibold uppercase text-text-muted">
                  <tr>
                    <th className="py-3 px-4">Stage</th>
                    <th className="py-3 px-4">Item Identifier</th>
                    <th className="py-3 px-4">Error Code</th>
                    <th className="py-3 px-4">Error Message</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {errors.map((err: any) => (
                    <tr key={err.id} className="hover:bg-rose-50/40 transition-colors">
                      <td className="py-3 px-4 uppercase font-mono font-semibold text-text-primary">{err.stage}</td>
                      <td className="py-3 px-4 font-mono truncate max-w-xs text-dark">{err.item_identifier || '—'}</td>
                      <td className="py-3 px-4 font-mono text-rose-600">{err.error_code}</td>
                      <td className="py-3 px-4 text-rose-700">{err.error_message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </ScrollReveal>
    </div>
  );
}
