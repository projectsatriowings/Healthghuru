import { sql } from '@/lib/db';

export interface RecommendationOptions {
  userId?: string | null;
  limit?: number;
  offset?: number;
  category?: string | null;
  contentType?: string | null;
  excludeId?: string | null;
}

export interface RecommendedContentItem {
  id: string;
  contentType: string;
  title: string;
  slug: string;
  excerpt: string;
  imageUrl: string | null;
  authorName: string | null;
  publishedAt: string | null;
  category: string;
  isFeatured: boolean;
  isTrending: boolean;
  durationSeconds: number | null;
  videoId: string | null;
  viewCount: number;
  score: number;
  recommendationReason: string;
  tags: string[];
}

export interface RecommendationResult {
  items: RecommendedContentItem[];
  total: number;
  userPersonalized: boolean;
}

export interface WellnessTip {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  authorName: string | null;
  publishedAt: string | null;
  recommendationReason: string;
  disclaimer: string;
}

const MEDICAL_DISCLAIMER =
  'For educational purposes only. This guidance is not intended as medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional before making health changes.';

/**
 * Retrieves personalized content recommendations for authenticated users,
 * or top curated & trending health media for unauthenticated guests.
 */
export async function getPersonalizedRecommendations(
  options: RecommendationOptions = {}
): Promise<RecommendationResult> {
  const {
    userId = null,
    limit = 12,
    offset = 0,
    category = null,
    contentType = null,
    excludeId = null,
  } = options;

  try {
    let userInterests: string[] = [];
    let userFormats: string[] = [];
    let userActivityCategories: Record<string, number> = {};
    let recentlyInteractedItemIds = new Set<string>();
    let savedCategories = new Set<string>();
    let isPersonalized = false;

    if (userId) {
      // 1. Fetch user topic preferences
      const preferences = await sql`
        SELECT topic 
        FROM user_preferences 
        WHERE user_id = ${userId}::uuid AND preference_type = 'interest'
      `;
      userInterests = preferences.map((p) => p.topic);

      // 2. Fetch user format preferences
      const formats = await sql`
        SELECT content_type 
        FROM user_content_preferences 
        WHERE user_id = ${userId}::uuid
      `;
      userFormats = formats.map((f) => f.content_type);

      // 3. Fetch recent activity (last 100 actions)
      const activities = await sql`
        SELECT action, content_id, metadata, created_at
        FROM user_activity
        WHERE user_id = ${userId}::uuid
        ORDER BY created_at DESC
        LIMIT 100
      `;

      for (const act of activities) {
        if (act.content_id) {
          recentlyInteractedItemIds.add(act.content_id);
        }
        const meta = act.metadata as Record<string, any> | null;
        const actCategory = meta?.category;
        if (actCategory && typeof actCategory === 'string') {
          userActivityCategories[actCategory] = (userActivityCategories[actCategory] || 0) + 1;
        }
      }

      // 4. Fetch saved content categories
      const savedItems = await sql`
        SELECT c.category
        FROM user_saved_content usc
        JOIN content_items c ON usc.content_id = c.id
        WHERE usc.user_id = ${userId}::uuid
      `;
      for (const s of savedItems) {
        if (s.category) savedCategories.add(s.category);
      }

      if (
        userInterests.length > 0 ||
        userFormats.length > 0 ||
        activities.length > 0 ||
        savedItems.length > 0
      ) {
        isPersonalized = true;
      }
    }

    // Query candidate content items with their tags
    const candidateItems = await sql`
      SELECT 
        i.id,
        i.content_type,
        i.title,
        i.slug,
        i.excerpt,
        i.image_url,
        i.author_name,
        i.published_at,
        i.category,
        i.is_featured,
        i.is_trending,
        i.quality_score,
        i.duration_seconds,
        i.video_id,
        i.view_count,
        COALESCE(
          json_agg(t.name) FILTER (WHERE t.name IS NOT NULL),
          '[]'::json
        ) as tags
      FROM content_items i
      LEFT JOIN content_item_tags cit ON i.id = cit.content_item_id
      LEFT JOIN content_tags t ON cit.tag_id = t.id
      WHERE i.status = 'published' 
        AND i.deleted_at IS NULL
        AND i.content_type != 'health_tip'
        ${category ? sql`AND i.category = ${category}` : sql``}
        ${contentType ? sql`AND i.content_type = ${contentType}` : sql``}
        ${excludeId ? sql`AND i.id != ${excludeId}::uuid` : sql``}
      GROUP BY i.id
    `;

    const scoredItems: RecommendedContentItem[] = candidateItems.map((item) => {
      let score = (item.quality_score || 50) * 0.05;
      let primaryReason = 'Curated HealthGuru Recommendation';

      const tags: string[] = Array.isArray(item.tags) ? item.tags : [];

      if (isPersonalized && userId) {
        // Preference topic match (+5.0)
        if (userInterests.includes(item.category)) {
          score += 5.0;
          primaryReason = `Matches your interest in ${item.category}`;
        }

        // Format preference match (+3.0)
        if (userFormats.includes(item.content_type)) {
          score += 3.0;
        }

        // Saved category match (+4.0)
        if (savedCategories.has(item.category)) {
          score += 4.0;
          if (primaryReason === 'Curated HealthGuru Recommendation') {
            primaryReason = `Based on your saved ${item.category} topics`;
          }
        }

        // Activity category engagement (+0.8 per interaction, max +4.0)
        const actCount = userActivityCategories[item.category] || 0;
        if (actCount > 0) {
          const actBonus = Math.min(actCount * 0.8, 4.0);
          score += actBonus;
          if (primaryReason === 'Curated HealthGuru Recommendation') {
            primaryReason = `Based on your reading history in ${item.category}`;
          }
        }

        // Trending / Featured boost
        if (item.is_featured) score += 1.5;
        if (item.is_trending) score += 1.0;

        // Freshness penalty if recently interacted with
        if (recentlyInteractedItemIds.has(item.id)) {
          score -= 2.0;
        }
      } else {
        // Unauthenticated scoring
        if (item.is_featured) {
          score += 4.0;
          primaryReason = 'Curated HealthGuru Pick';
        } else if (item.is_trending) {
          score += 3.0;
          primaryReason = 'Trending in Wellness';
        } else {
          score += Math.min((item.view_count || 0) * 0.005, 2.0);
          primaryReason = `Popular in ${item.category || 'Health'}`;
        }
      }

      return {
        id: item.id,
        contentType: item.content_type,
        title: item.title,
        slug: item.slug,
        excerpt: item.excerpt || '',
        imageUrl: item.image_url,
        authorName: item.author_name || 'HealthGuru Editorial Board',
        publishedAt: item.published_at ? new Date(item.published_at).toISOString() : null,
        category: item.category || 'General Health',
        isFeatured: Boolean(item.is_featured),
        isTrending: Boolean(item.is_trending),
        durationSeconds: item.duration_seconds,
        videoId: item.video_id,
        viewCount: item.view_count || 0,
        score: parseFloat(score.toFixed(2)),
        recommendationReason: primaryReason,
        tags,
      };
    });

    // Sort by calculated score descending, then published date descending
    scoredItems.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return dateB - dateA;
    });

    const total = scoredItems.length;
    const paginatedItems = scoredItems.slice(offset, offset + limit);

    return {
      items: paginatedItems,
      total,
      userPersonalized: isPersonalized,
    };
  } catch (error) {
    console.error('Error in getPersonalizedRecommendations:', error);
    return {
      items: [],
      total: 0,
      userPersonalized: false,
    };
  }
}

/**
 * Retrieves the daily featured educational wellness tip matched to the user's primary interest.
 */
export async function getPersonalizedWellnessTip(
  userId?: string | null
): Promise<WellnessTip | null> {
  try {
    let preferredCategory: string | null = null;

    if (userId) {
      const topInterest = await sql`
        SELECT topic 
        FROM user_preferences 
        WHERE user_id = ${userId}::uuid AND preference_type = 'interest'
        LIMIT 1
      `;
      if (topInterest.length > 0) {
        preferredCategory = topInterest[0].topic;
      }
    }

    let tips;
    if (preferredCategory) {
      tips = await sql`
        SELECT id, title, category, excerpt, author_name, published_at
        FROM content_items
        WHERE content_type = 'health_tip' 
          AND status = 'published'
          AND deleted_at IS NULL
          AND category = ${preferredCategory}
        ORDER BY is_featured DESC, published_at DESC
        LIMIT 1
      `;
    }

    if (!tips || tips.length === 0) {
      tips = await sql`
        SELECT id, title, category, excerpt, author_name, published_at
        FROM content_items
        WHERE content_type = 'health_tip' 
          AND status = 'published'
          AND deleted_at IS NULL
        ORDER BY is_featured DESC, is_trending DESC, published_at DESC
        LIMIT 1
      `;
    }

    if (tips.length === 0) return null;

    const tip = tips[0];
    return {
      id: tip.id,
      title: tip.title,
      category: tip.category,
      excerpt: tip.excerpt,
      authorName: tip.author_name || 'HealthGuru Medical Advisory',
      publishedAt: tip.published_at ? new Date(tip.published_at).toISOString() : null,
      recommendationReason: preferredCategory
        ? `Matched to your interest in ${preferredCategory}`
        : "Today's Daily Wellness Focus",
      disclaimer: MEDICAL_DISCLAIMER,
    };
  } catch (error) {
    console.error('Error in getPersonalizedWellnessTip:', error);
    return null;
  }
}
