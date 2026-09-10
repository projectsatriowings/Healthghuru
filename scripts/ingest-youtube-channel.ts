import 'dotenv/config';
import { sql } from '../src/lib/db';
import { runIngestionPipeline } from '../src/lib/ingestion/pipeline';
import { randomUUID } from 'crypto';

async function main() {
  const channelId = 'UCDt-1tmXpqoQ-mK5Q4qY8vw';
  const channelName = 'Health Ghuru tamil';

  console.log(`Checking if YouTube source exists for channel ${channelId}...`);
  const existing = await sql`
    SELECT * FROM content_sources WHERE youtube_channel_id = ${channelId}
  `;

  let sourceId: string;
  if (existing.length > 0) {
    sourceId = existing[0].id;
    console.log(`Found existing source: ${sourceId} (${existing[0].name})`);
    await sql`
      UPDATE content_sources
      SET enabled = TRUE, auto_publish = TRUE, name = ${channelName}
      WHERE id = ${sourceId}::uuid
    `;
  } else {
    sourceId = randomUUID();
    console.log(`Creating new YouTube source with ID ${sourceId}...`);
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
    console.log('Source created successfully.');
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

  console.log('Running ingestion pipeline for YouTube channel...');
  const result = await runIngestionPipeline(sourceConfig, { limit: 25 });
  console.log('Ingestion result:', result);

  // Check imported videos
  const videos = await sql`
    SELECT id, title, slug, content_type, status, published_at, canonical_url
    FROM content_items
    WHERE content_type = 'video'
    ORDER BY published_at DESC
  `;
  console.log(`\nTotal videos in database: ${videos.length}`);
  videos.forEach((v: any, i: number) => {
    console.log(`${i + 1}. [${v.status}] ${v.title} -> /video/${v.slug}`);
  });
}

main().catch(console.error);
