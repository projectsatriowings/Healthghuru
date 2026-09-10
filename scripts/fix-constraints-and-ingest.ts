import 'dotenv/config';
import { sql } from '../src/lib/db';
import { runIngestionPipeline } from '../src/lib/ingestion/pipeline';
import { randomUUID } from 'crypto';

async function main() {
  console.log('Ensuring unique constraint on content_items(slug)...');
  try {
    await sql`ALTER TABLE content_items ADD CONSTRAINT content_items_slug_key UNIQUE (slug)`;
    console.log('Added unique constraint on slug.');
  } catch (e: any) {
    console.log('Constraint check:', e.message);
  }

  const channelId = 'UCDt-1tmXpqoQ-mK5Q4qY8vw';
  const channelName = 'Health Ghuru tamil';

  const existing = await sql`
    SELECT * FROM content_sources WHERE youtube_channel_id = ${channelId}
  `;

  let sourceId = existing[0]?.id;
  if (!sourceId) {
    sourceId = randomUUID();
    await sql`
      INSERT INTO content_sources (
        id, name, type, provider, youtube_channel_id, default_category,
        language, country, enabled, auto_publish, requires_review, priority, trust_score
      ) VALUES (
        ${sourceId}::uuid,
        ${channelName},
        'youtube',
        'youtube',
        ${channelId},
        'Wellness',
        'ta',
        'India',
        TRUE,
        TRUE,
        FALSE,
        1,
        'High'
      )
    `;
  }

  const sourceConfig = {
    id: sourceId,
    name: channelName,
    type: 'youtube' as const,
    provider: 'youtube',
    youtubeChannelId: channelId,
    defaultCategory: 'Wellness',
    language: 'ta',
    country: 'India',
    enabled: true,
    autoPublish: true,
    requiresReview: false,
    priority: 1,
    trustScore: 'High' as const,
    fetchIntervalMinutes: 60,
  };

  console.log('Running ingestion pipeline...');
  const result = await runIngestionPipeline(sourceConfig, { limit: 25 });
  console.log('Ingestion result:', {
    status: result.status,
    itemsFound: result.itemsFound,
    itemsImported: result.itemsImported,
    itemsFailed: result.itemsFailed,
    errors: result.errors,
  });

  const videos = await sql`
    SELECT id, title, slug, content_type, status, published_at
    FROM content_items
    WHERE content_type = 'video'
    ORDER BY published_at DESC
  `;
  console.log(`\nTotal videos in database now: ${videos.length}`);
  videos.forEach((v: any, i: number) => {
    console.log(`${i + 1}. [${v.status}] ${v.title}`);
  });
}

main().catch(console.error);
