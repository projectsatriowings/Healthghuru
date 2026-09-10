/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { sql } from '@/lib/db';

export async function GET(
  _req: NextRequest,
  { params }: { params: { runId: string } }
) {
  try {
    await requireAdmin();

    const runs = await sql`
      SELECT r.*, s.type as source_type, s.website_url, s.feed_url
      FROM ingestion_runs r
      LEFT JOIN content_sources s ON r.source_id = s.id
      WHERE r.id = ${params.runId}::uuid
    `;
    if (runs.length === 0) {
      return NextResponse.json({ success: false, error: { message: 'Run not found' } }, { status: 404 });
    }

    const errors = await sql`
      SELECT * FROM ingestion_errors
      WHERE run_id = ${params.runId}::uuid
      ORDER BY created_at ASC
    `;

    return NextResponse.json({
      success: true,
      run: runs[0],
      errors,
    });
  } catch (error: any) {
    const code = error.message === 'Unauthorized' || error.message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: code });
  }
}
