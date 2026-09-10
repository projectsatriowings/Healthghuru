/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const contentType = searchParams.get('contentType');
    const category = searchParams.get('category');
    const sourceId = searchParams.get('sourceId');
    const status = searchParams.get('status') || 'published';
    const isBreaking = searchParams.get('breaking') === 'true';
    const isFeatured = searchParams.get('featured') === 'true';
    const isTrending = searchParams.get('trending') === 'true';
    const requiresReview = searchParams.get('requiresReview') === 'true';
    const sort = searchParams.get('sort') || 'latest';
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10), 0);

    // Build query dynamically with parameterization
    const conditions = [];

    if (status !== 'all') {
      conditions.push(sql`i.status = ${status}`);
    }
    if (contentType) {
      conditions.push(sql`i.content_type = ${contentType}`);
    }
    if (category) {
      conditions.push(sql`LOWER(i.category) = LOWER(${category})`);
    }
    if (sourceId) {
      conditions.push(sql`i.source_id = ${sourceId}::uuid`);
    }
    if (isBreaking) {
      conditions.push(sql`i.is_breaking = TRUE`);
    }
    if (isFeatured) {
      conditions.push(sql`i.is_featured = TRUE`);
    }
    if (isTrending) {
      conditions.push(sql`i.is_trending = TRUE`);
    }
    if (requiresReview) {
      conditions.push(sql`i.requires_review = TRUE`);
    }

    let whereClause = sql`WHERE i.deleted_at IS NULL`;
    if (conditions.length > 0) {
      for (const cond of conditions) {
        whereClause = sql`${whereClause} AND ${cond}`;
      }
    }

    let orderClause = sql`ORDER BY i.published_at DESC`;
    if (sort === 'trending') {
      orderClause = sql`ORDER BY (i.view_count * 2 + i.share_count * 5 + i.bookmark_count * 3 + i.quality_score) DESC, i.published_at DESC`;
    } else if (sort === 'quality') {
      orderClause = sql`ORDER BY i.quality_score DESC, i.published_at DESC`;
    }

    const items = await sql`
      SELECT 
        i.*,
        s.name as source_name,
        s.trust_score as source_trust_score,
        s.type as source_type,
        s.website_url as source_website_url
      FROM content_items i
      LEFT JOIN content_sources s ON i.source_id = s.id
      ${whereClause}
      ${orderClause}
      LIMIT ${limit} OFFSET ${offset}
    `;

    const countRes = await sql`
      SELECT COUNT(*)::int as total
      FROM content_items i
      ${whereClause}
    `;
    const total = countRes[0]?.total || 0;

    return NextResponse.json({
      success: true,
      items,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + items.length < total,
      },
    });
  } catch (error: any) {
    console.error('Error fetching content:', error);
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}
