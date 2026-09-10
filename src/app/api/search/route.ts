/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const query = (searchParams.get('q') || '').trim();
    const contentType = searchParams.get('contentType');
    const category = searchParams.get('category');
    const sourceId = searchParams.get('sourceId');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 60);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10), 0);

    if (!query) {
      return NextResponse.json({
        success: true,
        items: [],
        pagination: { total: 0, limit, offset, hasMore: false },
      });
    }

    const searchPattern = `%${query.toLowerCase()}%`;

    const items = await sql`
      SELECT 
        i.*,
        s.name as source_name,
        s.trust_score as source_trust_score,
        s.type as source_type
      FROM content_items i
      LEFT JOIN content_sources s ON i.source_id = s.id
      WHERE i.status = 'published' AND i.deleted_at IS NULL
        AND (
          LOWER(i.title) LIKE ${searchPattern}
          OR LOWER(COALESCE(i.excerpt, '')) LIKE ${searchPattern}
          OR LOWER(COALESCE(i.description, '')) LIKE ${searchPattern}
          OR LOWER(COALESCE(i.author_name, '')) LIKE ${searchPattern}
          OR LOWER(COALESCE(i.category, '')) LIKE ${searchPattern}
        )
        AND (${contentType || null}::varchar IS NULL OR i.content_type = ${contentType})
        AND (${category || null}::varchar IS NULL OR LOWER(i.category) = LOWER(${category}))
        AND (${sourceId || null}::uuid IS NULL OR i.source_id = ${sourceId}::uuid)
      ORDER BY 
        CASE WHEN LOWER(i.title) LIKE ${searchPattern} THEN 1 ELSE 2 END,
        i.published_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const countRes = await sql`
      SELECT COUNT(*)::int as total
      FROM content_items i
      WHERE i.status = 'published' AND i.deleted_at IS NULL
        AND (
          LOWER(i.title) LIKE ${searchPattern}
          OR LOWER(COALESCE(i.excerpt, '')) LIKE ${searchPattern}
          OR LOWER(COALESCE(i.description, '')) LIKE ${searchPattern}
          OR LOWER(COALESCE(i.author_name, '')) LIKE ${searchPattern}
          OR LOWER(COALESCE(i.category, '')) LIKE ${searchPattern}
        )
        AND (${contentType || null}::varchar IS NULL OR i.content_type = ${contentType})
        AND (${category || null}::varchar IS NULL OR LOWER(i.category) = LOWER(${category}))
        AND (${sourceId || null}::uuid IS NULL OR i.source_id = ${sourceId}::uuid)
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
    console.error('Error executing search:', error);
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}
