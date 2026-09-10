import { z } from 'zod';

export const SourceConfigSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, 'Source name must be at least 2 characters'),
  type: z.enum(['rss', 'atom', 'youtube', 'newsapi', 'generic_api', 'manual']),
  provider: z.string().optional(),
  websiteUrl: z.string().url('Invalid website URL').optional().or(z.literal('')),
  feedUrl: z.string().url('Invalid feed URL').optional().or(z.literal('')),
  youtubeChannelId: z.string().optional().or(z.literal('')),
  apiConfig: z.record(z.string(), z.unknown()).optional(),
  defaultCategory: z.string().optional(),
  language: z.string().default('en'),
  country: z.string().optional(),
  enabled: z.boolean().default(true),
  autoPublish: z.boolean().default(true),
  requiresReview: z.boolean().default(false),
  priority: z.number().int().min(1).max(10).default(5),
  trustScore: z.enum(['High', 'Medium', 'Low', 'Unverified']).default('Medium'),
  fetchIntervalMinutes: z.number().int().min(5).max(10080).default(60),
});

export const NormalizedContentItemSchema = z.object({
  externalId: z.string().min(1, 'External ID is required'),
  sourceId: z.string().uuid().optional(),
  sourceName: z.string().optional(),
  sourceType: z.enum(['rss', 'atom', 'youtube', 'newsapi', 'generic_api', 'manual']).optional(),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  slug: z.string().min(3, 'Slug is required'),
  description: z.string().optional().nullable(),
  excerpt: z.string().optional().nullable(),
  canonicalUrl: z.string().url('Canonical URL must be a valid URL'),
  imageUrl: z.string().url().optional().or(z.literal('')).nullable(),
  authorName: z.string().optional().nullable(),
  publishedAt: z.date(),
  updatedAt: z.date().optional().nullable(),
  contentType: z.enum(['news', 'article', 'magazine', 'video']),
  category: z.string().optional().nullable(),
  subcategory: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
  language: z.string().default('en'),
  country: z.string().optional().nullable(),
  durationSeconds: z.number().int().nonnegative().optional().nullable(),
  videoId: z.string().optional().nullable(),
  isExternal: z.boolean().default(true),
  rawPayload: z.record(z.string(), z.unknown()).optional().nullable(),
  sourceMetadata: z.record(z.string(), z.unknown()).optional().nullable(),
});

export function validateNormalizedItem(item: unknown) {
  return NormalizedContentItemSchema.safeParse(item);
}

export function validateSourceConfig(config: unknown) {
  return SourceConfigSchema.safeParse(config);
}
