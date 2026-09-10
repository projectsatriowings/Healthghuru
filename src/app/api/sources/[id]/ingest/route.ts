/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { sql } from '@/lib/db';
import { runIngestionPipeline } from '@/lib/ingestion/pipeline';
import { SourceConfig } from '@/lib/ingestion/types';
import { writeAuditLog } from '@/lib/admin/actions/auditLog';

// In-memory cooldown tracker to prevent repeated spam
const lastManualFetch = new Map<string, number>();

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin();

    const now = Date.now();
    const lastRun = lastManualFetch.get(params.id) || 0;
    if (now - lastRun < 10000) {
      return NextResponse.json(
        { success: false, error: { message: 'Please wait at least 10 seconds between manual fetch requests.' } },
        { status: 429 }
      );
    }
    lastManualFetch.set(params.id, now);

    const sources = await sql`SELECT * FROM content_sources WHERE id = ${params.id}::uuid`;
    if (sources.length === 0) {
      return NextResponse.json({ success: false, error: { message: 'Source not found' } }, { status: 404 });
    }

    const s = sources[0];
    const sourceConfig: SourceConfig = {
      id: s.id,
      name: s.name,
      type: s.type,
      provider: s.provider,
      websiteUrl: s.website_url,
      feedUrl: s.feed_url,
      youtubeChannelId: s.youtube_channel_id,
      apiConfig: s.api_config || {},
      categoryId: s.category_id,
      defaultCategory: s.default_category || 'Wellness',
      language: s.language || 'en',
      country: s.country,
      enabled: s.enabled,
      autoPublish: s.auto_publish,
      requiresReview: s.requires_review,
      priority: s.priority || 5,
      trustScore: s.trust_score || 'Medium',
      fetchIntervalMinutes: s.fetch_interval_minutes || 60,
      lastFetchedAt: s.last_fetched_at,
      lastSuccessAt: s.last_success_at,
      lastFailureAt: s.last_failure_at,
      lastError: s.last_error,
      itemCount: s.item_count || 0,
    };

    const result = await runIngestionPipeline(sourceConfig);

    await writeAuditLog({
      adminUserId: session.user.id,
      actionType: 'source_manual_ingest',
      targetTable: 'content_sources',
      targetId: params.id,
      afterValue: {
        runId: result.runId,
        itemsImported: result.itemsImported,
        status: result.status,
      },
    });

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('Error in manual ingest:', error);
    const status = error.message === 'Unauthorized' || error.message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ success: false, error: { message: error.message } }, { status });
  }
}
