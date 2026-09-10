/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { sql } from '@/lib/db';
import { getAdapterForSource } from '@/lib/ingestion/adapters';
import { SourceConfig } from '@/lib/ingestion/types';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    let sourceConfig: SourceConfig;

    if (params.id === 'preview') {
      // Ephemeral test before saving to DB
      const body = await req.json();
      sourceConfig = {
        id: 'test-preview',
        name: body.name || 'Test Source',
        type: body.type,
        provider: body.provider,
        websiteUrl: body.websiteUrl,
        feedUrl: body.feedUrl,
        youtubeChannelId: body.youtubeChannelId,
        apiConfig: body.apiConfig || {},
        defaultCategory: body.defaultCategory || 'Wellness',
        language: body.language || 'en',
        country: body.country,
        enabled: true,
        autoPublish: false,
        requiresReview: true,
        priority: 5,
        trustScore: body.trustScore || 'Medium',
        fetchIntervalMinutes: 60,
      };
    } else {
      const sources = await sql`SELECT * FROM content_sources WHERE id = ${params.id}::uuid`;
      if (sources.length === 0) {
        return NextResponse.json({ success: false, error: { message: 'Source not found' } }, { status: 404 });
      }

      const s = sources[0];
      sourceConfig = {
        id: s.id,
        name: s.name,
        type: s.type,
        provider: s.provider,
        websiteUrl: s.website_url,
        feedUrl: s.feed_url,
        youtubeChannelId: s.youtube_channel_id,
        apiConfig: s.api_config || {},
        defaultCategory: s.default_category || 'Wellness',
        language: s.language || 'en',
        country: s.country,
        enabled: s.enabled,
        autoPublish: s.auto_publish,
        requiresReview: s.requires_review,
        priority: s.priority || 5,
        trustScore: s.trust_score || 'Medium',
        fetchIntervalMinutes: s.fetch_interval_minutes || 60,
      };
    }

    const adapter = getAdapterForSource(sourceConfig.type);
    const result = await adapter.test(sourceConfig);

    return NextResponse.json({
      success: result.success,
      diagnostics: result.diagnostics,
      sampleItems: result.sampleItems,
      error: result.error,
    });
  } catch (error: any) {
    console.error('Error testing source:', error);
    const status = error.message === 'Unauthorized' || error.message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ success: false, error: { message: error.message } }, { status });
  }
}
