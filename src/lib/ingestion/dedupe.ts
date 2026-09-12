import { sql } from '@/lib/db';
import { NormalizedContentItem, DeduplicationMatch } from './types';
import { normalizeCanonicalUrl } from './normalize';

/**
 * Calculates Dice's Bigram Coefficient for fuzzy string similarity (0.0 to 1.0)
 */
export function calculateDiceSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  const s2 = str2.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();

  if (s1 === s2) return 1.0;
  if (s1.length < 2 || s2.length < 2) return 0.0;

  const getBigrams = (str: string) => {
    const bigrams = new Map<string, number>();
    for (let i = 0; i < str.length - 1; i++) {
      const bigram = str.substring(i, i + 2);
      bigrams.set(bigram, (bigrams.get(bigram) || 0) + 1);
    }
    return bigrams;
  };

  const b1 = getBigrams(s1);
  const b2 = getBigrams(s2);

  let intersection = 0;
  b1.forEach((count, bigram) => {
    if (b2.has(bigram)) {
      intersection += Math.min(count, b2.get(bigram)!);
    }
  });

  const total = (s1.length - 1) + (s2.length - 1);
  return (2.0 * intersection) / total;
}

/**
 * Multi-level deduplication engine
 */
export async function detectDuplicate(
  item: NormalizedContentItem,
  sourceId: string
): Promise<DeduplicationMatch> {
  const canonicalUrl = normalizeCanonicalUrl(item.canonicalUrl);

  // Level 1: Exact External ID from this source
  if (item.externalId) {
    const l1Match = await sql`
      SELECT csi.content_item_id 
      FROM content_source_items csi
      JOIN content_items ci ON csi.content_item_id = ci.id AND ci.deleted_at IS NULL
      WHERE csi.source_id = ${sourceId}::uuid AND csi.external_id = ${item.externalId}
      LIMIT 1
    `;
    if (l1Match.length > 0) {
      return {
        isDuplicate: true,
        matchLevel: 'external_id',
        existingItemId: l1Match[0].content_item_id,
        confidence: 1.0,
      };
    }
  }

  // Level 2: Exact Canonical URL match in content_items
  if (canonicalUrl) {
    const l2Match = await sql`
      SELECT id FROM content_items
      WHERE canonical_url = ${canonicalUrl}
      LIMIT 1
    `;
    if (l2Match.length > 0) {
      return {
        isDuplicate: true,
        matchLevel: 'canonical_url',
        existingItemId: l2Match[0].id,
        confidence: 0.98,
      };
    }
  }

  // Level 3: Normalized title exact match within nearby publication date (+/- 48 hours)
  const dateWindowStart = new Date(item.publishedAt.getTime() - 48 * 60 * 60 * 1000).toISOString();
  const dateWindowEnd = new Date(item.publishedAt.getTime() + 48 * 60 * 60 * 1000).toISOString();

  const l3Match = await sql`
    SELECT id, title FROM content_items
    WHERE LOWER(title) = LOWER(${item.title})
      AND published_at >= ${dateWindowStart}::timestamptz
      AND published_at <= ${dateWindowEnd}::timestamptz
    LIMIT 1
  `;
  if (l3Match.length > 0) {
    return {
      isDuplicate: true,
      matchLevel: 'title_date_window',
      existingItemId: l3Match[0].id,
      confidence: 0.92,
    };
  }

  // Level 4: Fuzzy title similarity (> 0.85) among recent items in past 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const recentCandidates = await sql`
    SELECT id, title FROM content_items
    WHERE published_at >= ${sevenDaysAgo}::timestamptz
    ORDER BY published_at DESC
    LIMIT 100
  `;

  for (const candidate of recentCandidates) {
    const similarity = calculateDiceSimilarity(item.title, candidate.title);
    if (similarity >= 0.85) {
      return {
        isDuplicate: true,
        matchLevel: 'fuzzy_title',
        existingItemId: candidate.id,
        confidence: Number(similarity.toFixed(2)),
      };
    }
  }

  return {
    isDuplicate: false,
    confidence: 0.0,
  };
}
