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

export class AtomSourceAdapter extends BaseSourceAdapter {
  readonly type = 'atom';

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
      throw new Error(`Atom Source "${source.name}" has no feedUrl configured`);
    }

    const response = await this.secureFetch(feedUrl);
    const xmlText = await response.text();

    return this.parseAtomXml(xmlText, source, options?.limit);
  }

  parseAtomXml(xmlText: string, source: SourceConfig, limit?: number): NormalizedContentItem[] {
    let parsed: any;
    try {
      parsed = this.xmlParser.parse(xmlText);
    } catch (err: any) {
      throw new Error(`Failed to parse Atom XML: ${err.message}`);
    }

    const feed = parsed?.feed || parsed;
    let entries = feed?.entry;

    if (!entries) {
      return [];
    }

    if (!Array.isArray(entries)) {
      entries = [entries];
    }

    const targetEntries = limit ? entries.slice(0, limit) : entries;
    const normalized: NormalizedContentItem[] = [];

    for (const entry of targetEntries) {
      try {
        const itemResult = this.normalizeAtomEntry(entry, source);
        if (itemResult) {
          normalized.push(itemResult);
        }
      } catch (e) {
        console.warn(`[Atom] Skipped malformed entry in source ${source.name}:`, e);
      }
    }

    return normalized;
  }

  private normalizeAtomEntry(entry: any, source: SourceConfig): NormalizedContentItem | null {
    // 1. Title
    const rawTitle = typeof entry.title === 'object' ? entry.title?.['#text'] : entry.title;
    const title = sanitizePlainText(String(rawTitle || ''));
    if (!title) return null;

    // 2. Link
    let linkUrl = '';
    if (entry.link) {
      if (Array.isArray(entry.link)) {
        const altLink = entry.link.find((l: any) => l['@_rel'] === 'alternate' || !l['@_rel']);
        linkUrl = altLink?.['@_href'] || entry.link[0]?.['@_href'];
      } else if (typeof entry.link === 'object') {
        linkUrl = entry.link['@_href'] || entry.link['#text'];
      } else {
        linkUrl = String(entry.link);
      }
    }
    const canonicalUrl = normalizeCanonicalUrl(linkUrl || String(entry.id || ''));
    if (!canonicalUrl) return null;

    // 3. External ID
    let externalId = '';
    if (entry.id) {
      externalId = typeof entry.id === 'object' ? String(entry.id?.['#text'] || '') : String(entry.id);
    }
    if (!externalId) {
      externalId = canonicalUrl;
    }

    // 4. Content / Summary
    const rawContent = entry.content ? (typeof entry.content === 'object' ? entry.content?.['#text'] : entry.content) : '';
    const rawSummary = entry.summary ? (typeof entry.summary === 'object' ? entry.summary?.['#text'] : entry.summary) : '';
    const descriptionText = sanitizePlainText(String(rawContent || rawSummary || ''));
    const excerpt = createExcerpt(descriptionText);

    // 5. Author
    let authorName: string | undefined;
    if (entry.author) {
      if (Array.isArray(entry.author)) {
        authorName = entry.author[0]?.name;
      } else if (typeof entry.author === 'object') {
        authorName = entry.author.name?.['#text'] || entry.author.name;
      } else {
        authorName = String(entry.author);
      }
    }
    if (!authorName) {
      authorName = source.name;
    }

    // 6. Dates
    const rawDate = entry.published || entry.updated;
    const publishedAt = parsePublicationDate(rawDate);

    // 7. Image Extraction
    let imageUrl: string | undefined;
    if (rawContent || rawSummary) {
      const match = String(rawContent || rawSummary).match(/<img[^>]+src=["']([^"'>]+)["']/i);
      if (match && match[1]) {
        imageUrl = match[1];
      }
    }

    // 8. Tags / Categories
    const tags: string[] = [];
    if (entry.category) {
      const cats = Array.isArray(entry.category) ? entry.category : [entry.category];
      for (const c of cats) {
        const term = c['@_term'] || c['@_label'] || (typeof c === 'string' ? c : null);
        if (term) tags.push(String(term).trim());
      }
    }

    const slug = generateSlug(title, externalId);

    return {
      externalId,
      sourceId: source.id,
      sourceName: source.name,
      sourceType: 'atom',
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
        id: externalId,
        published: rawDate,
      },
    };
  }
}
