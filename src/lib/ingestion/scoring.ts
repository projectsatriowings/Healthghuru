import { NormalizedContentItem, SourceConfig, QualityScoreBreakdown } from './types';

/**
 * Calculates internal quality and relevance scores for content ranking
 */
export function calculateScores(
  item: NormalizedContentItem,
  source: SourceConfig,
  baseRelevance: number,
  duplicateConfidence = 0.0
): QualityScoreBreakdown {
  let quality = 0;
  const reasons: string[] = [];

  // 1. Source Trust Level
  switch (source.trustScore) {
    case 'High':
      quality += 35;
      reasons.push('High source trust tier (+35)');
      break;
    case 'Medium':
      quality += 25;
      reasons.push('Medium source trust tier (+25)');
      break;
    case 'Low':
      quality += 15;
      reasons.push('Low source trust tier (+15)');
      break;
    default:
      quality += 5;
      reasons.push('Unverified source tier (+5)');
      break;
  }

  // 2. Completeness of Metadata
  if (item.imageUrl) {
    quality += 15;
    reasons.push('Visual asset included (+15)');
  }
  if (item.description && item.description.length >= 100) {
    quality += 15;
    reasons.push('Comprehensive summary available (+15)');
  } else if (item.excerpt && item.excerpt.length > 50) {
    quality += 8;
    reasons.push('Short excerpt available (+8)');
  }

  if (item.authorName && item.authorName !== source.name) {
    quality += 10;
    reasons.push('Explicit author attribution (+10)');
  }

  if (item.canonicalUrl && item.canonicalUrl.startsWith('https://')) {
    quality += 10;
    reasons.push('Secure canonical URL (+10)');
  }

  // 3. Recency Bonus
  const ageHours = (Date.now() - item.publishedAt.getTime()) / (1000 * 60 * 60);
  if (ageHours <= 24 && ageHours >= -2) {
    quality += 15;
    reasons.push('Breaking/Recent publication (+15)');
  } else if (ageHours <= 168) {
    quality += 10;
    reasons.push('Published this week (+10)');
  } else if (ageHours <= 720) {
    quality += 5;
    reasons.push('Published this month (+5)');
  }

  // 4. Duplicate Penalty
  if (duplicateConfidence > 0.8) {
    quality = Math.max(10, quality - 30);
    reasons.push(`High duplicate probability penalty (-30) [conf: ${duplicateConfidence}]`);
  }

  const finalQuality = Math.min(100, Math.max(0, quality));
  const finalRelevance = Math.min(100, Math.max(0, baseRelevance));

  return {
    qualityScore: finalQuality,
    relevanceScore: finalRelevance,
    reasons,
  };
}
