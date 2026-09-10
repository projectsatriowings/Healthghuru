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

export class GenericApiSourceAdapter extends BaseSourceAdapter {
  readonly type = 'generic_api';

  async fetch(source: SourceConfig, options?: { limit?: number }): Promise<NormalizedContentItem[]> {
    const endpointUrl = source.feedUrl || source.websiteUrl;
    if (!endpointUrl) {
      throw new Error(`Generic API Source "${source.name}" has no endpoint URL configured`);
    }

    const response = await this.secureFetch(endpointUrl);
    const data = await response.json();

    const config = source.apiConfig || {};
    const itemsPath = (config.itemsPath as string) || '';
    
    // Resolve items array from nested JSON path
    let items: any = data;
    if (itemsPath) {
      const parts = itemsPath.split('.');
      for (const part of parts) {
        if (items && typeof items === 'object' && part in items) {
          items = items[part];
        } else {
          items = [];
          break;
        }
      }
    }

    if (!Array.isArray(items)) {
      items = [];
    }

    const targetItems = options?.limit ? items.slice(0, options.limit) : items;
    const fieldMap = (config.fieldMap as Record<string, string>) || {};

    const idField = fieldMap.id || 'id';
    const titleField = fieldMap.title || 'title';
    const urlField = fieldMap.url || 'url' || 'link';
    const descField = fieldMap.description || 'description' || 'summary';
    const authorField = fieldMap.author || 'author';
    const dateField = fieldMap.publishedAt || 'publishedAt' || 'date';
    const imageField = fieldMap.imageUrl || 'imageUrl' || 'image';

    return targetItems
      .filter((item: any) => item && (item[titleField] || item[urlField]))
      .map((item: any) => {
        const title = sanitizePlainText(String(item[titleField] || ''));
        const canonicalUrl = normalizeCanonicalUrl(String(item[urlField] || ''));
        const externalId = String(item[idField] || canonicalUrl);
        const description = sanitizePlainText(String(item[descField] || ''));
        const excerpt = createExcerpt(description);
        const authorName = item[authorField] ? sanitizePlainText(String(item[authorField])) : source.name;
        const publishedAt = parsePublicationDate(item[dateField]);
        const imageUrl = item[imageField] ? String(item[imageField]) : undefined;
        const slug = generateSlug(title, externalId);

        return {
          externalId,
          sourceId: source.id,
          sourceName: source.name,
          sourceType: 'generic_api' as const,
          title,
          slug,
          description,
          excerpt,
          canonicalUrl,
          imageUrl,
          authorName,
          publishedAt,
          contentType: 'article' as const,
          category: source.defaultCategory || 'Wellness',
          language: source.language || 'en',
          country: source.country,
          isExternal: true,
          rawPayload: item,
        };
      });
  }
}
