'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Sparkles, ExternalLink } from 'lucide-react';
import { Advertisement } from '@/lib/types/advertisement';
import { trackAdEvent } from './adTracking';
import Image from 'next/image';

interface HeroBannerAdProps {
  initialAd?: Advertisement | null;
  category?: string;
  className?: string;
}

export function HeroBannerAd({ initialAd, category, className = '' }: HeroBannerAdProps) {
  const [ad, setAd] = useState<Advertisement | null>(initialAd || null);
  const trackedRef = useRef(false);

  useEffect(() => {
    if (!initialAd) {
      const fetchAd = async () => {
        try {
          const url = category
            ? `/api/ads/active?placement=hero_banner&category=${category}`
            : `/api/ads/active?placement=hero_banner`;
          const res = await fetch(url);
          const json = await res.json();
          if (json.success && json.ads && json.ads.length > 0) {
            setAd(json.ads[0]);
          }
        } catch {
          // ignore
        }
      };
      fetchAd();
    }
  }, [initialAd, category]);

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

  if (ad.html_code) {
    return (
      <div className={`site-container my-8 ${className}`}>
        <div className="bg-surface rounded-2xl p-4 border border-border text-center overflow-hidden">
          <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted mb-2 block">
            ADVERTISEMENT
          </span>
          <div dangerouslySetInnerHTML={{ __html: ad.html_code }} />
        </div>
      </div>
    );
  }

  return (
    <div className={`site-container my-8 sm:my-12 ${className}`}>
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-primary/20 bg-gradient-to-br from-[#0c1a0f] via-[#162e1a] to-[#0d2112] shadow-xl group">
        {/* Decorative ambient radial light */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/15 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10 p-6 sm:p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10">
          {/* Text Content */}
          <div className="flex-1 space-y-3.5 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-emerald-300 border border-white/10 text-[11px] font-mono uppercase tracking-wider">
              <Sparkles size={12} className="text-emerald-400" /> SPONSORED HEALTH SPOTLIGHT
            </div>

            <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl text-white font-bold leading-tight">
              {ad.headline || ad.title}
            </h3>

            {ad.description && (
              <p className="text-sm sm:text-base text-white/80 leading-relaxed max-w-2xl">
                {ad.description}
              </p>
            )}

            <div className="pt-2">
              <a
                href={ad.target_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleClick}
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 rounded-full text-xs sm:text-sm font-heading font-bold text-dark bg-white hover:bg-emerald-300 transition-all shadow-lg hover:shadow-emerald-500/20 hover:scale-105 active:scale-95 cursor-pointer"
              >
                {ad.cta_text || 'Learn More'} <ArrowRight size={15} />
              </a>
            </div>
          </div>

          {/* Banner Creative Image */}
          {ad.image_url && (
            <a
              href={ad.target_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleClick}
              className="relative w-full md:w-80 lg:w-96 h-48 sm:h-56 rounded-2xl overflow-hidden border border-white/20 shadow-2xl shrink-0 block group-hover:scale-[1.02] transition-transform duration-300"
            >
              <Image
                src={ad.image_url}
                alt={ad.title}
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
              <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] text-white flex items-center gap-1 font-heading">
                Sponsored <ExternalLink size={10} />
              </div>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
