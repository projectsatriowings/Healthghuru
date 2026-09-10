/* eslint-disable @typescript-eslint/no-explicit-any */
import { XMLParser } from 'fast-xml-parser';
import { BaseSourceAdapter } from './base';
import { NormalizedContentItem, SourceConfig } from '../types';
import {
  normalizeCanonicalUrl,
  sanitizePlainText,
  generateSlug,
  parsePublicationDate,
  createExcerpt
} from '../normalize';

export class RssSourceAdapter extends BaseSourceAdapter {
  readonly type = 'rss';

  private xmlParser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    textNodeName: '#text',
    trimValues: true,
    parseTagValue: false,
  });

  async fetch(source: SourceConfig, options?: { limit?: number }): Promise<NormalizedContentItem[]> {
    const feedUrl = source.feedUrl || source.websiteUrl;
    if (!feedUrl) {
      throw new Error(`RSS Source "${source.name}" has no feedUrl configured`);
    }

    const response = await this.secureFetch(feedUrl);
    const xmlText = await response.text();

    return this.parseRssXml(xmlText, source, options?.limit);
  }

  parseRssXml(xmlText: string, source: SourceConfig, limit?: number): NormalizedContentItem[] {
    let parsed: any;
    try {
      parsed = this.xmlParser.parse(xmlText);
    } catch (err: any) {
      throw new Error(`Failed to parse RSS XML: ${err.message}`);
    }

    // Support standard RSS 2.0 (<rss><channel><item>) and RDF (<rdf:RDF><item>)
    const channel = parsed?.rss?.channel || parsed?.['rdf:RDF'] || parsed;
    let items = channel?.item;

    if (!items) {
      return [];
    }

    if (!Array.isArray(items)) {
      items = [items];
    }

    const targetItems = limit ? items.slice(0, limit) : items;
    const normalized: NormalizedContentItem[] = [];

    for (const item of targetItems) {
      try {
        const itemResult = this.normalizeRssItem(item, source);
        if (itemResult) {
          normalized.push(itemResult);
        }
      } catch (e) {
        console.warn(`[RSS] Skipped malformed item in source ${source.name}:`, e);
      }
    }

    return normalized;
  }

  private normalizeRssItem(item: any, source: SourceConfig): NormalizedContentItem | null {
    // 1. Title
    const rawTitle = typeof item.title === 'object' ? item.title?.['#text'] : item.title;
    const title = sanitizePlainText(String(rawTitle || ''));
    if (!title) return null;

    // 2. Link
    let rawLink = typeof item.link === 'object' ? item.link?.['#text'] || item.link?.['@_href'] : item.link;
    if (!rawLink && item.guid) {
      rawLink = typeof item.guid === 'object' ? item.guid?.['#text'] : item.guid;
    }
    const canonicalUrl = normalizeCanonicalUrl(String(rawLink || ''));
    if (!canonicalUrl) return null;

    // 3. External ID
    let externalId = '';
    if (item.guid) {
      externalId = typeof item.guid === 'object' ? String(item.guid?.['#text'] || '') : String(item.guid);
    }
    if (!externalId) {
      externalId = canonicalUrl;
    }

    // 4. Description / Content
    const rawDesc = item.description ? (typeof item.description === 'object' ? item.description?.['#text'] : item.description) : '';
    const rawContent = item['content:encoded'] ? (typeof item['content:encoded'] === 'object' ? item['content:encoded']?.['#text'] : item['content:encoded']) : '';
    const descriptionText = sanitizePlainText(String(rawContent || rawDesc || ''));
    const excerpt = createExcerpt(descriptionText);

    // 5. Author
    let authorName: string | undefined;
    if (item['dc:creator']) {
      authorName = sanitizePlainText(String(typeof item['dc:creator'] === 'object' ? item['dc:creator']?.['#text'] : item['dc:creator']));
    } else if (item.author) {
      authorName = sanitizePlainText(String(typeof item.author === 'object' ? item.author?.['#text'] || item.author?.name : item.author));
    }
    if (!authorName) {
      authorName = source.name;
    }

    // 6. Publication Date
    const rawDate = item.pubDate || item['dc:date'] || item.published;
    const publishedAt = parsePublicationDate(rawDate);

    // 7. Image Extraction
    let imageUrl: string | undefined;
    
    // media:content
    const mediaContent = item['media:content'];
    if (mediaContent) {
      if (Array.isArray(mediaContent)) {
        imageUrl = mediaContent[0]?.['@_url'];
      } else {
        imageUrl = mediaContent['@_url'];
      }
    }
    
    // media:thumbnail
    if (!imageUrl && item['media:thumbnail']) {
      const thumb = item['media:thumbnail'];
      imageUrl = Array.isArray(thumb) ? thumb[0]?.['@_url'] : thumb['@_url'];
    }

    // enclosure
    if (!imageUrl && item.enclosure) {
      const enc = Array.isArray(item.enclosure) ? item.enclosure[0] : item.enclosure;
      if (enc?.['@_type']?.startsWith('image/') || enc?.['@_url']?.match(/\.(jpg|jpeg|png|webp|avif)/i)) {
        imageUrl = enc['@_url'];
      }
    }

    // HTML fallback image search in description
    if (!imageUrl && (rawDesc || rawContent)) {
      const match = String(rawContent || rawDesc).match(/<img[^>]+src=["']([^"'>]+)["']/i);
      if (match && match[1]) {
        imageUrl = match[1];
      }
    }

    // 8. Tags / Categories
    const tags: string[] = [];
    if (item.category) {
      const categories = Array.isArray(item.category) ? item.category : [item.category];
      for (const cat of categories) {
        const tagText = typeof cat === 'object' ? cat?.['#text'] : cat;
        if (tagText && typeof tagText === 'string') {
          tags.push(tagText.trim());
        }
      }
    }

    // Slug
    const slug = generateSlug(title, externalId);

    return {
      externalId,
      sourceId: source.id,
      sourceName: source.name,
      sourceType: 'rss',
      title,
      slug,
      description: descriptionText,
      excerpt,
      canonicalUrl,
      imageUrl,
      authorName,
      publishedAt,
      contentType: 'news',
      category: source.defaultCategory || 'Wellness',
      tags,
      language: source.language || 'en',
      country: source.country,
      isExternal: true,
      rawPayload: {
        guid: externalId,
        pubDate: rawDate,
        originalCategories: tags,
      },
    };
  }
}
