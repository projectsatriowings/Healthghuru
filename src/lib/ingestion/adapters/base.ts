import { NormalizedContentItem, SourceConfig } from '../types';
import { validateSafeUrl } from '../ssrf';

export interface AdapterTestResult {
  success: boolean;
  sampleItems: NormalizedContentItem[];
  error?: string;
  diagnostics?: {
    statusCode?: number;
    latencyMs?: number;
    totalItemsFound?: number;
  };
}

export abstract class BaseSourceAdapter {
  abstract readonly type: string;

  /**
   * Fetches and normalizes records from the source
   */
  abstract fetch(source: SourceConfig, options?: { limit?: number }): Promise<NormalizedContentItem[]>;

  /**
   * Tests source connection, retrieves a small preview batch without saving
   */
  async test(source: SourceConfig): Promise<AdapterTestResult> {
    const startTime = Date.now();
    try {
      const sampleItems = await this.fetch(source, { limit: 5 });
      const latencyMs = Date.now() - startTime;
      return {
        success: true,
        sampleItems,
        diagnostics: {
          latencyMs,
          totalItemsFound: sampleItems.length,
        },
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        sampleItems: [],
        error: errorMessage,
        diagnostics: {
          latencyMs: Date.now() - startTime,
        },
      };
    }
  }

  /**
   * Protected helper to perform secure HTTP GET with SSRF check, timeout, and custom headers
   */
  protected async secureFetch(url: string, timeoutMs = 15000): Promise<Response> {
    const ssrfCheck = validateSafeUrl(url);
    if (!ssrfCheck.isValid || !ssrfCheck.safeUrl) {
      throw new Error(`SSRF Block: ${ssrfCheck.error || 'Invalid or forbidden URL'}`);
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(ssrfCheck.safeUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 (compatible; HealthGhuru/1.0)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Remote HTTP error ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error(`Request timed out after ${timeoutMs}ms`);
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }
}
