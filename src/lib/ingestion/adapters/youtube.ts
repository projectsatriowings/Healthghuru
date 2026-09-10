/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseSourceAdapter } from './base';
import { NormalizedContentItem, SourceConfig } from '../types';
import {
  sanitizePlainText,
  generateSlug,
  parsePublicationDate,
  createExcerpt
} from '../normalize';
import { XMLParser } from 'fast-xml-parser';

export class YouTubeSourceAdapter extends BaseSourceAdapter {
  readonly type = 'youtube';

  private xmlParser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    textNodeName: '#text',
    trimValues: true,
  });

  async fetch(source: SourceConfig, options?: { limit?: number }): Promise<NormalizedContentItem[]> {
    const channelId = source.youtubeChannelId;
    if (!channelId) {
      throw new Error(`YouTube Source "${source.name}" has no youtubeChannelId configured`);
    }

    const apiKey = process.env.YOUTUBE_API_KEY;

    // Mode 1: If YouTube API Key is present, use official YouTube Data API v3
    if (apiKey) {
      return this.fetchViaYouTubeApi(channelId, apiKey, source, options?.limit);
    }

    // Mode 2: Zero-config fallback using official YouTube Channel XML feed (real data, no key required)
    return this.fetchViaChannelFeed(channelId, source, options?.limit);
  }

  /**
   * Fetches videos using official YouTube Data API v3
   */
  private async fetchViaYouTubeApi(
    channelId: string,
    apiKey: string,
    source: SourceConfig,
    limit = 10
  ): Promise<NormalizedContentItem[]> {
    // 1. Get uploads playlist ID: channel ID with 'UU' prefix instead of 'UC'
    const uploadsPlaylistId = channelId.startsWith('UC') ? 'UU' + channelId.substring(2) : channelId;
    const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=${Math.min(limit, 25)}&key=${apiKey}`;

    const res = await this.secureFetch(playlistUrl);
    const data = await res.json();

    if (data.error) {
      throw new Error(`YouTube API error: ${data.error.message || 'Unknown error'}`);
    }

    const items = data.items || [];
    const videoIds = items.map((i: any) => i.contentDetails?.videoId).filter(Boolean);

    // 2. Fetch durations for retrieved videos via videos endpoint
    const durationMap: Record<string, number> = {};
    if (videoIds.length > 0) {
      try {
        const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds.join(',')}&key=${apiKey}`;
        const vRes = await this.secureFetch(videosUrl);
        const vData = await vRes.json();
        if (vData.items) {
          for (const v of vData.items) {
            durationMap[v.id] = this.parseIsoDuration(v.contentDetails?.duration);
          }
        }
      } catch (e) {
        console.warn('Failed to fetch video durations from YouTube API:', e);
      }
    }

    return items.map((item: any) => {
      const snippet = item.snippet;
      const videoId = item.contentDetails?.videoId || snippet.resourceId?.videoId;
      const title = sanitizePlainText(snippet.title);
      const description = sanitizePlainText(snippet.description || '');
      const excerpt = createExcerpt(description);
      const canonicalUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const imageUrl = snippet.thumbnails?.maxres?.url || snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url;
      const publishedAt = parsePublicationDate(snippet.publishedAt);
      const slug = generateSlug(title, videoId);

      return {
        externalId: videoId,
        sourceId: source.id,
        sourceName: source.name,
        sourceType: 'youtube' as const,
        title,
        slug,
        description,
        excerpt,
        canonicalUrl,
        imageUrl,
        authorName: snippet.channelTitle || source.name,
        publishedAt,
        contentType: 'video' as const,
        category: source.defaultCategory || 'Wellness',
        language: source.language || 'en',
        country: source.country,
        durationSeconds: durationMap[videoId] || 0,
        videoId,
        isExternal: true,
        rawPayload: { videoId, channelId },
      };
    });
  }

  /**
   * Fetches real videos using official YouTube Channel Atom feed (zero-config, high reliability)
   */
  private async fetchViaChannelFeed(
    channelId: string,
    source: SourceConfig,
    limit = 10
  ): Promise<NormalizedContentItem[]> {
    const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    const res = await this.secureFetch(feedUrl);
    const xmlText = await res.text();

    const parsed: any = this.xmlParser.parse(xmlText);
    const feed = parsed?.feed || parsed;
    let entries = feed?.entry || [];

    if (!Array.isArray(entries)) {
      entries = [entries];
    }

    const targetEntries = entries.slice(0, limit);
    return targetEntries.map((entry: any) => {
      const videoId = entry['yt:videoId'] || (typeof entry.id === 'string' ? entry.id.replace('yt:video:', '') : '');
      const title = sanitizePlainText(entry.title || '');
      const mediaGroup = entry['media:group'];
      const rawDesc = mediaGroup?.['media:description'] || '';
      const description = sanitizePlainText(rawDesc);
      const excerpt = createExcerpt(description);
      const canonicalUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const imageUrl = mediaGroup?.['media:thumbnail']?.['@_url'] || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
      const publishedAt = parsePublicationDate(entry.published);
      const authorName = entry.author?.name || source.name;
      const slug = generateSlug(title, videoId);

      return {
        externalId: videoId,
        sourceId: source.id,
        sourceName: source.name,
        sourceType: 'youtube' as const,
        title,
        slug,
        description,
        excerpt,
        canonicalUrl,
        imageUrl,
        authorName,
        publishedAt,
        contentType: 'video' as const,
        category: source.defaultCategory || 'Wellness',
        language: source.language || 'en',
        country: source.country,
        videoId,
        isExternal: true,
        rawPayload: { videoId, channelId },
      };
    });
  }

  /**
   * Converts ISO 8601 duration (e.g. PT12M34S) to total seconds
   */
  private parseIsoDuration(durationStr: string): number {
    if (!durationStr) return 0;
    const match = durationStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    const seconds = parseInt(match[3] || '0', 10);
    return hours * 3600 + minutes * 60 + seconds;
  }
}
