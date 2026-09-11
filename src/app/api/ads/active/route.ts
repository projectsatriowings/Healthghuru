import { NextRequest, NextResponse } from 'next/server';
import { getActiveAds } from '@/lib/advertisements';
import { AdPlacement } from '@/lib/types/advertisement';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const placement = searchParams.get('placement') as AdPlacement | null;
    const category = searchParams.get('category') || undefined;

    const ads = await getActiveAds(placement || undefined, category);

    return NextResponse.json({
      success: true,
      ads,
    });
  } catch (error: any) {
    console.error('Error in /api/ads/active:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
