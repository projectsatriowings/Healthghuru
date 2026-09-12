import { NextRequest, NextResponse } from 'next/server';
import { recordAdMetric } from '@/lib/advertisements';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      const text = await request.text();
      body = JSON.parse(text);
    }

    const { adId, type } = body || {};

    if (!adId || !type || (type !== 'impression' && type !== 'click')) {
      return NextResponse.json({ success: false, error: 'Invalid parameters: adId and type required' }, { status: 400 });
    }

    await recordAdMetric(adId, type);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error tracking ad metric:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
