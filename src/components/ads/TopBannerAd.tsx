'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Advertisement } from '@/lib/types/advertisement';
import { trackAdEvent } from './adTracking';
import Image from 'next/image';

interface TopBannerAdProps {
  initialAd?: Advertisement | null;
  category?: string;
}

const DEFAULT_TOP_BANNER_AD: Advertisement = {
  id: '959aff6d-88b4-4fce-b1ae-58598857b38f',
  title: 'Top Banner - LivePure Nutrition',
  placement: 'top_banner',
  image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80',
  target_url: '/blog/boost-immune-system',
  headline: 'LivePure Organic Superfoods — 25% Off Plant Protein & Daily Greens',
  description: 'Doctor-formulated, clean 100% organic ingredients with no artificial additives.',
  cta_text: 'Claim 25% Off',
  category: 'Nutrition',
  html_code: null,
  is_active: true,
  impressions_count: 0,
  clicks_count: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export function TopBannerAd({ initialAd, category }: TopBannerAdProps) {
  const [ad, setAd] = useState<Advertisement | null>(initialAd || DEFAULT_TOP_BANNER_AD);
  const trackedRef = useRef(false);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const url = category
          ? `/api/ads/active?placement=top_banner&category=${category}`
          : `/api/ads/active?placement=top_banner`;
        const res = await fetch(url);
        const json = await res.json();
        if (json.success && json.ads && json.ads.length > 0) {
          setAd(json.ads[0]);
        }
      } catch {
        // keep fallback
      }
    };

    fetchAd();
  }, [category]);

  useEffect(() => {
    if (ad && !trackedRef.current) {
      trackedRef.current = true;
      trackAdEvent(ad.id, 'impression');
    }
  }, [ad]);

  if (!ad) return null;

  const handleClick = () => {
    if (ad) {
      trackAdEvent(ad.id, 'click');
    }
  };

  // If custom HTML embed code is provided
  if (ad.html_code) {
    return (
      <div className="w-full py-3 px-4 flex items-center justify-center bg-transparent z-40">
        <div className="max-w-5xl w-full bg-white rounded-2xl border border-border p-4 text-center shadow-md">
          <div dangerouslySetInnerHTML={{ __html: ad.html_code }} />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-1 sm:py-2 px-3 sm:px-6 flex items-center justify-center bg-transparent z-40">
      {/* Contained Centered Large Pill Banner */}
      <div className="max-w-5xl lg:max-w-6xl w-full mx-auto bg-gradient-to-r from-[#0a1b0e] via-[#143419] to-[#0a1b0e] text-white border-2 border-primary/40 rounded-2xl sm:rounded-full shadow-lg px-4 sm:px-6 py-1.5 sm:py-2 transition-all hover:border-primary/60 hover:shadow-xl">
        <a
          href={ad.target_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className="w-full flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 text-center sm:text-left group cursor-pointer"
        >
          {/* Left: Sponsored Badge & Large Image Thumbnail */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider bg-white/10 text-emerald-300 px-2 py-0.5 rounded-full border border-white/15 flex items-center gap-1 shadow-sm">
              <Sparkles size={10} className="text-emerald-400" /> SPONSORED
            </span>

            {ad.image_url && (
              <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden border border-white/25 shrink-0 shadow bg-white/5">
                <Image
                  src={ad.image_url}
                  alt={ad.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}
          </div>

          {/* Middle: Prominent Large Bold Headline */}
          <div className="flex-1 min-w-0 text-center sm:text-left">
            <p className="text-xs sm:text-sm md:text-base font-heading font-bold text-white leading-snug group-hover:text-emerald-300 transition-colors line-clamp-1">
              {ad.headline || ad.title}
            </p>
          </div>

          {/* Right: Big Gradient CTA Button */}
          <div className="shrink-0">
            <span className="inline-flex items-center justify-center gap-1.5 text-xs font-heading font-bold text-white bg-gradient-to-r from-accent via-[#ff6f3c] to-[#ff8a57] hover:brightness-110 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full shadow-md shadow-accent/25 group-hover:scale-105 active:scale-95 transition-all whitespace-nowrap">
              <span>{ad.cta_text || 'Claim Offer'}</span>
              <ArrowRight size={14} />
            </span>
          </div>
        </a>
      </div>
    </div>
  );
}
