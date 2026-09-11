/**
 * Lightweight client activity telemetry helper.
 * Sends engagement signals (views, reads, watches, category clicks, bookmarks)
 * to /api/activity in a non-blocking manner.
 */

export interface TrackActivityParams {
  contentId?: string;
  action: 'view' | 'open' | 'read' | 'watch' | 'save' | 'category_click' | 'share' | 'magazine_read';
  category?: string;
  metadata?: Record<string, any>;
}

export function trackActivity({ contentId, action, category, metadata }: TrackActivityParams) {
  if (typeof window === 'undefined') return;

  try {
    fetch('/api/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contentId,
        action,
        category,
        metadata,
      }),
      keepalive: true,
    }).catch(() => {
      // Non-blocking telemetry
    });
  } catch {
    // Non-blocking telemetry
  }
}
