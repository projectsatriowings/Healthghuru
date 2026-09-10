/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseSourceAdapter } from './base';
import { NormalizedContentItem, SourceConfig } from '../types';
import {
  normalizeCanonicalUrl,
  sanitizePlainText,
  generateSlug,
  parsePublicationDate,
  createExcerpt
} from '../normalize';

export class NewsApiSourceAdapter extends BaseSourceAdapter {
  readonly type = 'newsapi';

  async fetch(source: SourceConfig, options?: { limit?: number }): Promise<NormalizedContentItem[]> {
    const apiKey = process.env.NEWS_API_KEY;
    if (!apiKey) {
      throw new Error('NEWS_API_KEY is not configured in server environment');
    }

    const pageSize = Math.min(options?.limit || 20, 50);
    const query = (source.apiConfig?.query as string) || 'health';
    const endpoint = (source.apiConfig?.endpoint as string) || 'top-headlines';

    let apiUrl = '';
    if (endpoint === 'top-headlines') {
      apiUrl = `https://newsapi.org/v2/top-headlines?category=health&language=${source.language || 'en'}&pageSize=${pageSize}&apiKey=${apiKey}`;
    } else {
      apiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=${source.language || 'en'}&sortBy=publishedAt&pageSize=${pageSize}&apiKey=${apiKey}`;
    }

    // Attempt with exponential backoff on transient errors
    let attempt = 0;
    let lastError: Error | null = null;
    const maxRetries = 2;

    while (attempt <= maxRetries) {
      try {
        const response = await this.secureFetch(apiUrl);
        const data = await response.json();

        if (data.status === 'error') {
          if (data.code === 'rateLimited') {
            throw new Error('NewsAPI rate limit reached. Please wait before refreshing.');
          }
          if (data.code === 'apiKeyInvalid' || data.code === 'apiKeyMissing') {
            throw new Error('NewsAPI key is invalid or unauthorized.');
          }
          throw new Error(`NewsAPI error: ${data.message || data.code}`);
        }

        const articles = data.articles || [];
        return articles
          .filter((art: any) => art.title && art.url && art.title !== '[Removed]')
          .map((art: any) => {
            const title = sanitizePlainText(art.title);
            const canonicalUrl = normalizeCanonicalUrl(art.url);
            const externalId = canonicalUrl;
            const description = sanitizePlainText(art.description || art.content || '');
            const excerpt = createExcerpt(description);
            const authorName = art.author ? sanitizePlainText(art.author) : (art.source?.name || source.name);
            const publishedAt = parsePublicationDate(art.publishedAt);
            const imageUrl = art.urlToImage || undefined;
            const slug = generateSlug(title, externalId);

            return {
              externalId,
              sourceId: source.id,
              sourceName: art.source?.name || source.name,
              sourceType: 'newsapi' as const,
              title,
              slug,
              description,
              excerpt,
              canonicalUrl,
              imageUrl,
              authorName,
              publishedAt,
              contentType: 'news' as const,
              category: source.defaultCategory || 'Medical Research',
              language: source.language || 'en',
              country: source.country,
              isExternal: true,
              rawPayload: {
                source: art.source,
                publishedAt: art.publishedAt,
              },
            };
          });
      } catch (err: any) {
        lastError = err;
        attempt++;
        if (attempt <= maxRetries) {
          await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 1000));
        }
      }
    }

    throw lastError || new Error('NewsAPI request failed after retries');
  }
}
