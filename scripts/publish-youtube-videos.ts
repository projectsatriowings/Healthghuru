import 'dotenv/config';
import { sql } from '../src/lib/db';

async function main() {
  // Publish all Health Ghuru tamil channel videos
  await sql`
    UPDATE content_items
    SET status = 'published', requires_review = FALSE
    WHERE author_name = 'Health Ghuru tamil' OR source_id = (SELECT id FROM content_sources WHERE youtube_channel_id = 'UCDt-1tmXpqoQ-mK5Q4qY8vw' LIMIT 1)
  `;

  // Remove old mock/placeholder demo videos if any
  await sql`
    DELETE FROM content_items
    WHERE content_type = 'video' AND author_name != 'Health Ghuru tamil' AND is_external = TRUE AND source_id IS NULL
  `;

  const videos = await sql`
    SELECT id, title, slug, content_type, status, published_at, video_id, author_name
    FROM content_items
    WHERE content_type = 'video' AND status = 'published' AND deleted_at IS NULL
    ORDER BY published_at DESC
  `;

  console.log(`Published videos for the site (${videos.length}):`);
  videos.forEach((v: any, i: number) => {
    console.log(`${i + 1}. [${v.video_id}] ${v.title} (${v.published_at})`);
  });
}

main().catch(console.error);
