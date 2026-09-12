import { NextRequest, NextResponse } from 'next/server';
import { getActiveAds } from '@/lib/advertisements';
import { AdPlacement } from '@/lib/types/advertisement';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const placement = searchParams.get('placement') as AdPlacement | null;
    const category = searchParams.get('category') || undefined;

    let ads = await getActiveAds(placement || undefined, category);

    // Override any external 404 links from the database to point to a reliable article
    if (ads && Array.isArray(ads)) {
      ads = ads.map((ad: any) => {
        if (ad.target_url && ad.target_url.includes('healthghuru.com')) {
          return { ...ad, target_url: '/blog/boost-immune-system' };
        }
        return ad;
      });
    }

    return NextResponse.json({
      success: true,
      ads,
    });
  } catch (error: any) {
    console.error('Error in /api/ads/active:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
