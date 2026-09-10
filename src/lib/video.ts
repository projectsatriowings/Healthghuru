/**
 * Video helper utilities for extracting video identifiers, handling platforms,
 * and normalizing playback sources.
 */

export interface ParsedVideoSource {
  type: 'youtube' | 'direct' | 'unsupported' | 'empty';
  videoId?: string;
  directUrl?: string;
  embedUrl?: string;
}

/**
 * Extracts clean YouTube 11-character Video ID from any URL, embed link, short link, or raw ID.
 */
export function extractYouTubeId(input?: string | null): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Direct 11-char alphanumeric YouTube ID (including - and _)
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Atom/RSS format: yt:video:mhYEro-bOnU
  if (trimmed.startsWith('yt:video:')) {
    const clean = trimmed.replace('yt:video:', '').trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) return clean;
  }

  // Full YouTube URL matching:
  // - https://www.youtube.com/watch?v=mhYEro-bOnU
  // - https://m.youtube.com/watch?v=mhYEro-bOnU
  // - https://youtu.be/mhYEro-bOnU
  // - https://www.youtube.com/shorts/mhYEro-bOnU
  // - https://www.youtube.com/embed/mhYEro-bOnU
  // - https://www.youtube.com/v/mhYEro-bOnU
  // - https://www.youtube-nocookie.com/embed/mhYEro-bOnU
  const match = trimmed.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/|youtube-nocookie\.com\/embed\/)([^"&?\/\s]{11})/i
  );
  if (match && match[1]) {
    return match[1];
  }

  return null;
}

/**
 * Parses any video source input (URL or ID) and determines its playback type.
 */
export function parseVideoSource(urlOrId?: string | null, fallback?: string | null): ParsedVideoSource {
  const primaryId = extractYouTubeId(urlOrId);
  if (primaryId) {
    return {
      type: 'youtube',
      videoId: primaryId,
      embedUrl: `https://www.youtube-nocookie.com/embed/${primaryId}?enablejsapi=1&rel=0&modestbranding=1&playsinline=1&controls=1`,
    };
  }

  const fallbackId = extractYouTubeId(fallback);
  if (fallbackId) {
    return {
      type: 'youtube',
      videoId: fallbackId,
      embedUrl: `https://www.youtube-nocookie.com/embed/${fallbackId}?enablejsapi=1&rel=0&modestbranding=1&playsinline=1&controls=1`,
    };
  }

  const input = (urlOrId || fallback || '').trim();
  if (!input) return { type: 'empty' };

  // Direct HTML5 video file formats
  if (/\.(mp4|webm|ogg|mov|m4v)($|\?)/i.test(input)) {
    return {
      type: 'direct',
      directUrl: input,
    };
  }

  return { type: 'unsupported' };
}
