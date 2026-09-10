/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { runScheduledIngestion } from '@/lib/ingestion/scheduler';

export async function POST(req: NextRequest) {
  return handleIngestion(req);
}

export async function GET(req: NextRequest) {
  return handleIngestion(req);
}

async function handleIngestion(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get('authorization');
  const customSecret = req.headers.get('x-cron-secret');
  const querySecret = req.nextUrl.searchParams.get('secret');

  const providedSecret = authHeader?.replace(/^Bearer\s+/i, '') || customSecret || querySecret;

  // Verify authorization
  if (!cronSecret || providedSecret !== cronSecret) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid or missing CRON_SECRET authorization token.' } },
      { status: 401 }
    );
  }

  try {
    const sourceId = req.nextUrl.searchParams.get('sourceId') || undefined;
    const forceAll = req.nextUrl.searchParams.get('force') === 'true';
    const retryFailedOnly = req.nextUrl.searchParams.get('retryFailed') === 'true';
    const limitParam = req.nextUrl.searchParams.get('limit');
    const limitPerSource = limitParam ? parseInt(limitParam, 10) : undefined;

    const summary = await runScheduledIngestion({
      sourceId,
      forceAll,
      retryFailedOnly,
      limitPerSource,
    });

    return NextResponse.json({
      success: true,
      summary,
    });
  } catch (error: any) {
    console.error('Error in /api/cron/ingest:', error);
    return NextResponse.json(
      { success: false, error: { code: 'CRON_EXECUTION_ERROR', message: error.message || 'Internal error' } },
      { status: 500 }
    );
  }
}
