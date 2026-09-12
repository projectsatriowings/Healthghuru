export type AdPlacement = 'top_banner' | 'hero_banner' | 'sidebar' | 'floating_footer' | 'popup';

export interface Advertisement {
  id: string;
  title: string;
  placement: AdPlacement;
  image_url: string | null;
  target_url: string;
  headline?: string | null;
  description?: string | null;
  cta_text?: string | null;
  category?: string | null;
  html_code?: string | null;
  is_active: boolean;
  impressions_count: number;
  clicks_count: number;
  start_date?: string | null;
  end_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdMetricsSummary {
  totalAds: number;
  activeAds: number;
  totalImpressions: number;
  totalClicks: number;
  averageCtr: number;
}
