import 'dotenv/config';
import { sql } from '../src/lib/db';

async function main() {
  await sql`
    DELETE FROM content_items 
    WHERE content_type = 'video' AND (author_name != 'Health Ghuru tamil' AND source_id != (SELECT id FROM content_sources WHERE youtube_channel_id = 'UCDt-1tmXpqoQ-mK5Q4qY8vw' LIMIT 1))
  `;

  const videos = await sql`
    SELECT id, title, slug, content_type, status, published_at, video_id, author_name
    FROM content_items
    WHERE content_type = 'video' AND status = 'published' AND deleted_at IS NULL
    ORDER BY published_at DESC
  `;

  console.log(`Current active videos in database (${videos.length}):`);
  videos.forEach((v: any, i: number) => {
    console.log(`${i + 1}. [${v.video_id}] ${v.title}`);
  });
}

main().catch(console.error);
