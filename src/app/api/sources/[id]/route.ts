/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { sql } from '@/lib/db';
import { SourceConfigSchema } from '@/lib/ingestion/validate';
import { evaluateSourceHealth } from '@/lib/ingestion/health';
import { writeAuditLog } from '@/lib/admin/actions/auditLog';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sources = await sql`
      SELECT * FROM content_sources WHERE id = ${params.id}::uuid
    `;
    if (sources.length === 0) {
      return NextResponse.json({ success: false, error: { message: 'Source not found' } }, { status: 404 });
    }

    const source = sources[0];
    return NextResponse.json({
      success: true,
      source: {
        ...source,
        healthStatus: evaluateSourceHealth(source),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin();
    const body = await req.json();

    const parsed = SourceConfigSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { message: parsed.error.issues.map(i => i.message).join(', ') } },
        { status: 400 }
      );
    }

    const existing = await sql`SELECT * FROM content_sources WHERE id = ${params.id}::uuid`;
    if (existing.length === 0) {
      return NextResponse.json({ success: false, error: { message: 'Source not found' } }, { status: 404 });
    }

    const data = parsed.data;
    await sql`
      UPDATE content_sources
      SET
        name = COALESCE(${data.name || null}, name),
        type = COALESCE(${data.type || null}, type),
        provider = COALESCE(${data.provider || null}, provider),
        website_url = COALESCE(${data.websiteUrl || null}, website_url),
        feed_url = COALESCE(${data.feedUrl || null}, feed_url),
        youtube_channel_id = COALESCE(${data.youtubeChannelId || null}, youtube_channel_id),
        api_config = COALESCE(${data.apiConfig ? JSON.stringify(data.apiConfig) : null}::jsonb, api_config),
        default_category = COALESCE(${data.defaultCategory || null}, default_category),
        enabled = COALESCE(${data.enabled !== undefined ? data.enabled : null}, enabled),
        auto_publish = COALESCE(${data.autoPublish !== undefined ? data.autoPublish : null}, auto_publish),
        requires_review = COALESCE(${data.requiresReview !== undefined ? data.requiresReview : null}, requires_review),
        priority = COALESCE(${data.priority !== undefined ? data.priority : null}, priority),
        trust_score = COALESCE(${data.trustScore || null}, trust_score),
        fetch_interval_minutes = COALESCE(${data.fetchIntervalMinutes !== undefined ? data.fetchIntervalMinutes : null}, fetch_interval_minutes),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${params.id}::uuid;
    `;

    await writeAuditLog({
      adminUserId: session.user.id,
      actionType: 'source_update',
      targetTable: 'content_sources',
      targetId: params.id,
      beforeValue: existing[0],
      afterValue: data,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    const status = error.message === 'Unauthorized' || error.message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ success: false, error: { message: error.message } }, { status });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin();
    const existing = await sql`SELECT * FROM content_sources WHERE id = ${params.id}::uuid`;
    if (existing.length === 0) {
      return NextResponse.json({ success: false, error: { message: 'Source not found' } }, { status: 404 });
    }

    await sql`DELETE FROM content_sources WHERE id = ${params.id}::uuid`;

    await writeAuditLog({
      adminUserId: session.user.id,
      actionType: 'source_delete',
      targetTable: 'content_sources',
      targetId: params.id,
      beforeValue: existing[0],
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    const status = error.message === 'Unauthorized' || error.message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ success: false, error: { message: error.message } }, { status });
  }
}
