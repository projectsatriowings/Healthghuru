import { sql } from '@/lib/db';
import { Advertisement, AdPlacement } from '@/lib/types/advertisement';

export async function getActiveAds(placement?: AdPlacement, category?: string): Promise<Advertisement[]> {
  try {
    let ads;
    if (placement && category && category !== 'All') {
      ads = await sql`
        SELECT * FROM advertisements
        WHERE is_active = TRUE
          AND placement = ${placement}
          AND (category = ${category} OR category = 'All' OR category IS NULL)
        ORDER BY created_at DESC
      `;
    } else if (placement) {
      ads = await sql`
        SELECT * FROM advertisements
        WHERE is_active = TRUE
          AND placement = ${placement}
        ORDER BY created_at DESC
      `;
    } else {
      ads = await sql`
        SELECT * FROM advertisements
        WHERE is_active = TRUE
        ORDER BY created_at DESC
      `;
    }

    return ads as Advertisement[];
  } catch (error) {
    console.error('Error fetching active advertisements:', error);
    return [];
  }
}

export async function getActiveAdForPlacement(placement: AdPlacement, category?: string): Promise<Advertisement | null> {
  const ads = await getActiveAds(placement, category);
  if (!ads || ads.length === 0) return null;
  // Return random active ad or the most recent
  return ads[Math.floor(Math.random() * ads.length)];
}

export async function recordAdMetric(adId: string, type: 'impression' | 'click') {
  try {
    if (type === 'impression') {
      await sql`
        UPDATE advertisements
        SET impressions_count = impressions_count + 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${adId}::uuid
      `;
    } else if (type === 'click') {
      await sql`
        UPDATE advertisements
        SET clicks_count = clicks_count + 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${adId}::uuid
      `;
    }
  } catch (error) {
    console.error(`Error recording ad ${type}:`, error);
    throw error;
  }
}
