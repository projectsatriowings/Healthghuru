/* eslint-disable @typescript-eslint/no-explicit-any */
import { sql } from '@/lib/db';
import { SourceConfig, IngestionResult } from './types';
import { runIngestionPipeline } from './pipeline';

export interface SchedulerOptions {
  sourceId?: string;
  forceAll?: boolean;
  retryFailedOnly?: boolean;
  limitPerSource?: number;
}

export interface SchedulerRunSummary {
  timestamp: string;
  sourcesProcessed: number;
  totalImported: number;
  totalErrors: number;
  results: IngestionResult[];
}

/**
 * Discovers and runs ingestion for all sources currently due according to their schedule
 */
export async function runScheduledIngestion(options: SchedulerOptions = {}): Promise<SchedulerRunSummary> {
  const { sourceId, forceAll, retryFailedOnly, limitPerSource } = options;

  let sourcesToRun: any[] = [];

  if (sourceId) {
    // Single specific source requested
    sourcesToRun = await sql`
      SELECT * FROM content_sources
      WHERE id = ${sourceId}::uuid
    `;
  } else if (retryFailedOnly) {
    // Retry sources whose last run failed
    sourcesToRun = await sql`
      SELECT * FROM content_sources
      WHERE enabled = TRUE AND last_failure_at IS NOT NULL
        AND (last_success_at IS NULL OR last_failure_at > last_success_at)
      ORDER BY priority ASC
    `;
  } else if (forceAll) {
    // Force refresh all enabled sources
    sourcesToRun = await sql`
      SELECT * FROM content_sources
      WHERE enabled = TRUE
      ORDER BY priority ASC
    `;
  } else {
    // Standard cron schedule: select enabled sources where fetch interval has passed
    sourcesToRun = await sql`
      SELECT * FROM content_sources
      WHERE enabled = TRUE
        AND (
          last_fetched_at IS NULL 
          OR last_fetched_at <= (CURRENT_TIMESTAMP - (fetch_interval_minutes || ' minutes')::interval)
        )
      ORDER BY priority ASC, last_fetched_at ASC NULLS FIRST
      LIMIT 10
    `;
  }

  const results: IngestionResult[] = [];
  let totalImported = 0;
  let totalErrors = 0;

  // Process sources sequentially or with small batches to isolate errors
  for (const rawSource of sourcesToRun) {
    const sourceConfig: SourceConfig = {
      id: rawSource.id,
      name: rawSource.name,
      type: rawSource.type,
      provider: rawSource.provider,
      websiteUrl: rawSource.website_url,
      feedUrl: rawSource.feed_url,
      youtubeChannelId: rawSource.youtube_channel_id,
      apiConfig: rawSource.api_config || {},
      categoryId: rawSource.category_id,
      defaultCategory: rawSource.default_category,
      language: rawSource.language || 'en',
      country: rawSource.country,
      enabled: rawSource.enabled,
      autoPublish: rawSource.auto_publish,
      requiresReview: rawSource.requires_review,
      priority: rawSource.priority || 5,
      trustScore: rawSource.trust_score || 'Medium',
      fetchIntervalMinutes: rawSource.fetch_interval_minutes || 60,
      lastFetchedAt: rawSource.last_fetched_at,
      lastSuccessAt: rawSource.last_success_at,
      lastFailureAt: rawSource.last_failure_at,
      lastError: rawSource.last_error,
      itemCount: rawSource.item_count || 0,
    };

    try {
      const result = await runIngestionPipeline(sourceConfig, { limit: limitPerSource });
      results.push(result);
      totalImported += result.itemsImported;
      totalErrors += result.errors.length;
    } catch (err) {
      console.error(`Unexpected failure running source ${sourceConfig.name}:`, err);
    }
  }

  return {
    timestamp: new Date().toISOString(),
    sourcesProcessed: sourcesToRun.length,
    totalImported,
    totalErrors,
    results,
  };
}
