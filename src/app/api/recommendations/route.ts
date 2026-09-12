import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth.config';
import { getPersonalizedRecommendations, getPersonalizedWellnessTip } from '@/lib/recommendations';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id || null;

    const { searchParams } = new URL(req.url);
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '12', 10), 1), 50);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10), 0);
    const category = searchParams.get('category') || null;
    const contentType = searchParams.get('contentType') || null;
    const excludeId = searchParams.get('excludeId') || null;
    const includeTip = searchParams.get('includeTip') !== 'false';

    const [recommendationData, wellnessTip] = await Promise.all([
      getPersonalizedRecommendations({
        userId,
        limit,
        offset,
        category,
        contentType,
        excludeId,
      }),
      includeTip ? getPersonalizedWellnessTip(userId) : Promise.resolve(null),
    ]);

    return NextResponse.json({
      success: true,
      userPersonalized: recommendationData.userPersonalized,
      total: recommendationData.total,
      recommendations: recommendationData.items,
      wellnessTip,
    });
  } catch (error: any) {
    console.error('Error in GET /api/recommendations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate recommendations.' },
      { status: 500 }
    );
  }
}
