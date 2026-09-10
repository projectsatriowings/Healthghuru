import { URL } from 'url';

// Tracking query parameter keys to purge
const TRACKING_PARAMS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'utm_id',
  'fbclid',
  'gclid',
  'msclkid',
  'twclid',
  'igshid',
  'mc_eid',
  'mc_cid',
  '_hsenc',
  '_hsmi',
  'ref',
  'referrer',
  'source'
]);

/**
 * Normalizes an external URL:
 * - Purges tracking & analytics queries
 * - Retains critical functional queries (like `v` for YouTube)
 * - Normalizes scheme and host casing
 * - Strips trailing hash anchors
 */
export function normalizeCanonicalUrl(rawUrl: string): string {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  try {
    const parsed = new URL(rawUrl.trim());
    
    // Purge tracking parameters
    const paramsToDelete: string[] = [];
    parsed.searchParams.forEach((_, key) => {
      if (TRACKING_PARAMS.has(key.toLowerCase()) || key.toLowerCase().startsWith('utm_')) {
        paramsToDelete.push(key);
      }
    });
    for (const key of paramsToDelete) {
      parsed.searchParams.delete(key);
    }

    // Purge hash fragment
    parsed.hash = '';

    // Standardize trailing slash on base URLs
    let clean = parsed.toString();
    if (parsed.pathname !== '/' && clean.endsWith('/')) {
      clean = clean.slice(0, -1);
    }
    return clean;
  } catch {
    return rawUrl.trim();
  }
}

/**
 * Strips HTML tags and unescapes standard entities for clean text
 */
export function sanitizePlainText(htmlOrText: string): string {
  if (!htmlOrText || typeof htmlOrText !== 'string') return '';

  return htmlOrText
    // Remove CDATA markers
    .replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')
    // Remove script / style tags and contents
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    // Strip HTML tags
    .replace(/<[^>]+>/g, ' ')
    // Unescape HTML entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    // Collapse whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Generates an SEO-safe slug from a title
 */
export function generateSlug(title: string, externalId?: string): string {
  if (!title) {
    return `item-${Date.now().toString(36)}`;
  }

  let slug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^a-z0-9\s-]/g, '') // remove special chars
    .trim()
    .replace(/\s+/g, '-') // spaces to hyphens
    .replace(/-+/g, '-'); // collapse hyphens

  if (slug.length > 80) {
    slug = slug.substring(0, 80).replace(/-+$/, '');
  }

  // Suffix externalId hash if provided to prevent collisions
  if (externalId) {
    const hash = Buffer.from(externalId).toString('base64url').substring(0, 6).toLowerCase();
    slug = `${slug}-${hash}`;
  }

  return slug || `item-${Date.now().toString(36)}`;
}

/**
 * Robust date parser handling RFC 2822, ISO, Unix epochs, or falling back to current date
 */
export function parsePublicationDate(dateInput: unknown): Date {
  if (!dateInput) return new Date();
  if (dateInput instanceof Date && !isNaN(dateInput.getTime())) return dateInput;

  if (typeof dateInput === 'number') {
    // If epoch seconds instead of ms
    const ms = dateInput < 10000000000 ? dateInput * 1000 : dateInput;
    const parsed = new Date(ms);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  }

  if (typeof dateInput === 'string') {
    const parsed = new Date(dateInput.trim());
    if (!isNaN(parsed.getTime())) return parsed;
  }

  return new Date();
}

/**
 * Generates an excerpt of max target length ending at word boundary
 */
export function createExcerpt(text: string, maxLength = 220): string {
  const clean = sanitizePlainText(text);
  if (clean.length <= maxLength) return clean;

  const truncated = clean.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 50 ? truncated.substring(0, lastSpace) : truncated) + '...';
}
