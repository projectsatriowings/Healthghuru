/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contentItemId, metricType } = body;

    if (!contentItemId || !metricType) {
      return NextResponse.json({ success: false, error: 'Missing contentItemId or metricType' }, { status: 400 });
    }

    if (!['view', 'click', 'share', 'bookmark'].includes(metricType)) {
      return NextResponse.json({ success: false, error: 'Invalid metricType' }, { status: 400 });
    }

    const metricId = randomUUID();

    // Increment corresponding counter
    if (metricType === 'view') {
      await sql`UPDATE content_items SET view_count = view_count + 1 WHERE id = ${contentItemId}::uuid`;
    } else if (metricType === 'click') {
      await sql`UPDATE content_items SET click_count = click_count + 1 WHERE id = ${contentItemId}::uuid`;
    } else if (metricType === 'share') {
      await sql`UPDATE content_items SET share_count = share_count + 1 WHERE id = ${contentItemId}::uuid`;
    } else if (metricType === 'bookmark') {
      await sql`UPDATE content_items SET bookmark_count = bookmark_count + 1 WHERE id = ${contentItemId}::uuid`;
    }

    // Record audit event asynchronously
    await sql`
      INSERT INTO content_metrics (id, content_item_id, metric_type)
      VALUES (${metricId}::uuid, ${contentItemId}::uuid, ${metricType})
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
