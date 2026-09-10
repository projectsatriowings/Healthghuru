/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const status = req.nextUrl.searchParams.get('status');
    const sourceId = req.nextUrl.searchParams.get('sourceId');
    const limit = Math.min(parseInt(req.nextUrl.searchParams.get('limit') || '50', 10), 100);

    let runs;
    if (status && sourceId) {
      runs = await sql`
        SELECT r.*, s.type as source_type
        FROM ingestion_runs r
        LEFT JOIN content_sources s ON r.source_id = s.id
        WHERE r.status = ${status} AND r.source_id = ${sourceId}::uuid
        ORDER BY r.started_at DESC
        LIMIT ${limit}
      `;
    } else if (status) {
      runs = await sql`
        SELECT r.*, s.type as source_type
        FROM ingestion_runs r
        LEFT JOIN content_sources s ON r.source_id = s.id
        WHERE r.status = ${status}
        ORDER BY r.started_at DESC
        LIMIT ${limit}
      `;
    } else if (sourceId) {
      runs = await sql`
        SELECT r.*, s.type as source_type
        FROM ingestion_runs r
        LEFT JOIN content_sources s ON r.source_id = s.id
        WHERE r.source_id = ${sourceId}::uuid
        ORDER BY r.started_at DESC
        LIMIT ${limit}
      `;
    } else {
      runs = await sql`
        SELECT r.*, s.type as source_type
        FROM ingestion_runs r
        LEFT JOIN content_sources s ON r.source_id = s.id
        ORDER BY r.started_at DESC
        LIMIT ${limit}
      `;
    }

    return NextResponse.json({ success: true, runs });
  } catch (error: any) {
    const code = error.message === 'Unauthorized' || error.message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: code });
  }
}
