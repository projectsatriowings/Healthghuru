export type ContentType = 'news' | 'article' | 'magazine' | 'video';

export type SourceType = 'rss' | 'atom' | 'youtube' | 'newsapi' | 'generic_api' | 'manual';

export type ContentStatus = 'draft' | 'published' | 'review' | 'archived' | 'rejected';

export type TrustScore = 'High' | 'Medium' | 'Low' | 'Unverified';

export type SourceHealthStatus = 'Healthy' | 'Warning' | 'Failing' | 'Disabled' | 'Rate Limited' | 'Auth Error';

export interface NormalizedContentItem {
  externalId: string;
  sourceId?: string;
  sourceName?: string;
  sourceType?: SourceType;
  title: string;
  slug: string;
  description?: string;
  excerpt?: string;
  canonicalUrl: string;
  imageUrl?: string;
  authorName?: string;
  publishedAt: Date;
  updatedAt?: Date;
  contentType: ContentType;
  category?: string;
  subcategory?: string;
  tags?: string[];
  language?: string;
  country?: string;
  durationSeconds?: number;
  videoId?: string;
  isExternal: boolean;
  rawPayload?: Record<string, unknown>;
  sourceMetadata?: Record<string, unknown>;
}

export interface SourceConfig {
  id: string;
  name: string;
  type: SourceType;
  provider?: string;
  websiteUrl?: string;
  feedUrl?: string;
  youtubeChannelId?: string;
  apiConfig?: Record<string, unknown>;
  categoryId?: string;
  defaultCategory?: string;
  language?: string;
  country?: string;
  enabled: boolean;
  autoPublish: boolean;
  requiresReview: boolean;
  priority: number;
  trustScore: TrustScore;
  fetchIntervalMinutes: number;
  lastFetchedAt?: string | null;
  lastSuccessAt?: string | null;
  lastFailureAt?: string | null;
  lastError?: string | null;
  itemCount?: number;
}

export interface IngestionErrorItem {
  itemIdentifier?: string;
  stage: 'fetch' | 'parse' | 'normalize' | 'validate' | 'dedupe' | 'classify' | 'score' | 'save';
  errorCode: string;
  errorMessage: string;
  rawData?: Record<string, unknown>;
}

export interface IngestionResult {
  runId: string;
  sourceId: string;
  sourceName: string;
  status: 'success' | 'partial' | 'failed';
  durationMs: number;
  itemsFound: number;
  itemsImported: number;
  itemsUpdated: number;
  itemsSkipped: number;
  itemsDuplicated: number;
  itemsFailed: number;
  errors: IngestionErrorItem[];
}

export interface DeduplicationMatch {
  isDuplicate: boolean;
  matchLevel?: 'external_id' | 'canonical_url' | 'title_date_window' | 'fuzzy_title';
  existingItemId?: string;
  confidence: number;
}

export interface QualityScoreBreakdown {
  qualityScore: number;
  relevanceScore: number;
  reasons: string[];
}
