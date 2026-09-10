import { SourceConfig, SourceHealthStatus } from './types';

/**
 * Computes live operational health status for a content source
 */
export function evaluateSourceHealth(source: Partial<SourceConfig>): SourceHealthStatus {
  if (!source.enabled) {
    return 'Disabled';
  }

  const errorText = (source.lastError || '').toLowerCase();

  if (errorText.includes('rate limit') || errorText.includes('429') || errorText.includes('quota')) {
    return 'Rate Limited';
  }

  if (
    errorText.includes('api key') ||
    errorText.includes('unauthorized') ||
    errorText.includes('401') ||
    errorText.includes('403') ||
    errorText.includes('forbidden')
  ) {
    return 'Auth Error';
  }

  if (source.lastFailureAt) {
    const failTime = new Date(source.lastFailureAt).getTime();
    const successTime = source.lastSuccessAt ? new Date(source.lastSuccessAt).getTime() : 0;

    if (failTime > successTime) {
      return 'Failing';
    }
    // Succeeded, but has recent error warning
    if (source.lastError) {
      return 'Warning';
    }
  }

  return 'Healthy';
}

/**
 * Returns UI badge styling and human-readable label for a health status
 */
export function getHealthBadgeProps(status: SourceHealthStatus): {
  label: string;
  bgClass: string;
  textClass: string;
  dotClass: string;
} {
  switch (status) {
    case 'Healthy':
      return {
        label: 'Healthy',
        bgClass: 'bg-emerald-50 border-emerald-200',
        textClass: 'text-emerald-700',
        dotClass: 'bg-emerald-500',
      };
    case 'Warning':
      return {
        label: 'Warning',
        bgClass: 'bg-amber-50 border-amber-200',
        textClass: 'text-amber-700',
        dotClass: 'bg-amber-500',
      };
    case 'Failing':
      return {
        label: 'Failing',
        bgClass: 'bg-rose-50 border-rose-200',
        textClass: 'text-rose-700',
        dotClass: 'bg-rose-500',
      };
    case 'Rate Limited':
      return {
        label: 'Rate Limited',
        bgClass: 'bg-purple-50 border-purple-200',
        textClass: 'text-purple-700',
        dotClass: 'bg-purple-500',
      };
    case 'Auth Error':
      return {
        label: 'Auth Error',
        bgClass: 'bg-red-50 border-red-200',
        textClass: 'text-red-700',
        dotClass: 'bg-red-500',
      };
    case 'Disabled':
    default:
      return {
        label: 'Disabled',
        bgClass: 'bg-gray-50 border-gray-200',
        textClass: 'text-gray-600',
        dotClass: 'bg-gray-400',
      };
  }
}
