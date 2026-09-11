import { runScheduledIngestion } from './scheduler';

declare global {
  // Prevent multiple worker timers in Next.js development HMR
  // eslint-disable-next-line no-var
  var __healthghuru_auto_ingest_timer: NodeJS.Timeout | null | undefined;
  // eslint-disable-next-line no-var
  var __healthghuru_auto_ingest_running: boolean | undefined;
}

const SYNC_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

/**
 * HealthGhuru Automated 24/7 Ingestion Worker
 * Periodically checks all active YouTube, Instagram, and medical sources
 * and automatically imports & publishes new videos, shorts, and articles.
 */
export function startAutoIngestionWorker() {
  if (global.__healthghuru_auto_ingest_timer) {
    return;
  }

  console.log('⚡ [Auto-Ingestion Worker] Initialized 24/7 background sync scheduler (Interval: 30m).');

  const executeSync = async () => {
    if (global.__healthghuru_auto_ingest_running) {
      console.log('⚡ [Auto-Ingestion Worker] Previous sync still in progress, skipping cycle.');
      return;
    }

    try {
      global.__healthghuru_auto_ingest_running = true;
      console.log('⚡ [Auto-Ingestion Worker] Starting automated background ingestion for active sources...');
      const summary = await runScheduledIngestion({ limitPerSource: 15 });
      console.log(`⚡ [Auto-Ingestion Worker] Auto-sync finished. Imported: ${summary.totalImported}, Errors: ${summary.totalErrors}`);
    } catch (err) {
      console.error('❌ [Auto-Ingestion Worker] Error during scheduled sync:', err);
    } finally {
      global.__healthghuru_auto_ingest_running = false;
    }
  };

  // Run initial background sync 10 seconds after server start
  setTimeout(() => {
    executeSync().catch(console.error);
  }, 10000);

  // Set recurring 30-minute interval
  global.__healthghuru_auto_ingest_timer = setInterval(executeSync, SYNC_INTERVAL_MS);
}
