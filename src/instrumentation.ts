export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startAutoIngestionWorker } = await import('@/lib/ingestion/autoScheduler');
    startAutoIngestionWorker();
  }
}
