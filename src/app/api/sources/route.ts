/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { sql } from '@/lib/db';
import { SourceConfigSchema } from '@/lib/ingestion/validate';
import { evaluateSourceHealth } from '@/lib/ingestion/health';
import { writeAuditLog } from '@/lib/admin/actions/auditLog';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sources = await sql`
      SELECT s.*, c.name as category_name
      FROM content_sources s
      LEFT JOIN content_categories c ON s.category_id = c.id
      ORDER BY s.priority ASC, s.name ASC
    `;

    const enriched = sources.map((s: any) => ({
      ...s,
      healthStatus: evaluateSourceHealth(s),
    }));

    return NextResponse.json({ success: true, sources: enriched });
  } catch (error: any) {
    console.error('Error fetching sources:', error);
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = await req.json();

    const parsed = SourceConfigSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { message: parsed.error.issues.map(i => i.message).join(', ') } },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const newId = randomUUID();

    await sql`
      INSERT INTO content_sources (
        id, name, type, provider, website_url, feed_url, youtube_channel_id,
        api_config, default_category, language, country, enabled,
        auto_publish, requires_review, priority, trust_score, fetch_interval_minutes
      ) VALUES (
        ${newId}::uuid, ${data.name}, ${data.type}, ${data.provider || null},
        ${data.websiteUrl || null}, ${data.feedUrl || null}, ${data.youtubeChannelId || null},
        ${JSON.stringify(data.apiConfig || {})}::jsonb, ${data.defaultCategory || 'Wellness'},
        ${data.language || 'en'}, ${data.country || null}, ${data.enabled},
        ${data.autoPublish}, ${data.requiresReview}, ${data.priority},
        ${data.trustScore}, ${data.fetchIntervalMinutes}
      );
    `;

    await writeAuditLog({
      adminUserId: session.user.id,
      actionType: 'source_create',
      targetTable: 'content_sources',
      targetId: newId,
      afterValue: { name: data.name, type: data.type },
    });

    return NextResponse.json({ success: true, id: newId });
  } catch (error: any) {
    console.error('Error creating source:', error);
    const status = error.message === 'Unauthorized' || error.message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ success: false, error: { message: error.message } }, { status });
  }
}
