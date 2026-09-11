'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from 'react';
import { X, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { Advertisement } from '@/lib/types/advertisement';
import { trackAdEvent } from './adTracking';
import Image from 'next/image';

interface FloatingFooterAdProps {
  initialAd?: Advertisement | null;
  category?: string;
}

// Default rich health advertisement fallback so it is ALWAYS visible immediately
const DEFAULT_FALLBACK_AD: Advertisement = {
  id: '575ba51f-eca2-4bc9-a732-be90401b9fab',
  title: 'ZenMind Deep Sleep Guide',
  placement: 'floating_footer',
  image_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
  target_url: 'https://www.healthghuru.com/stay-healthy',
  headline: 'Better Sleep Tonight — Download HealthGhuru 7-Day Sleep & Calm Protocol',
  description: 'Evidence-backed breathwork, magnesium timing, and circadian rhythm optimization.',
  cta_text: 'Get Free Guide',
  category: 'Mental Health',
  html_code: null,
  is_active: true,
  impressions_count: 0,
  clicks_count: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export function FloatingFooterAd({ initialAd, category }: FloatingFooterAdProps) {
  const [ad, setAd] = useState<Advertisement | null>(initialAd || DEFAULT_FALLBACK_AD);
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);
  const trackedRef = useRef(false);

  useEffect(() => {
    // Show smoothly immediately upon mounting
    const timer = setTimeout(() => {
      setVisible(true);
    }, 300);

    // Fetch dynamic ad from database
    const fetchAd = async () => {
      try {
        const url = category
          ? `/api/ads/active?placement=floating_footer&category=${category}`
          : `/api/ads/active?placement=floating_footer`;
        const res = await fetch(url);
        const json = await res.json();
        if (json.success && json.ads && json.ads.length > 0) {
          setAd(json.ads[0]);
        }
      } catch {
        // Fallback to initial/default
      }
    };

    fetchAd();

    return () => clearTimeout(timer);
  }, [category]);

  useEffect(() => {
    if (ad && !dismissed && visible && !trackedRef.current) {
      trackedRef.current = true;
      trackAdEvent(ad.id, 'impression');
    }
  }, [ad, dismissed, visible]);

  if (dismissed || !ad) return null;

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setVisible(false);
    setTimeout(() => {
      setDismissed(true);
    }, 300);
  };

  const handleClick = () => {
    if (ad) {
      trackAdEvent(ad.id, 'click');
    }
  };

  return (
    <aside
      aria-label="Bottom Right Floating Advertisement"
      className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-[360px] md:w-[380px] max-w-[380px] pointer-events-auto transition-all duration-500 transform ${
        visible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-12 opacity-0 scale-95'
      }`}
    >
      <div className="relative bg-white rounded-3xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.35)] border-2 border-primary/30 ring-1 ring-black/10 overflow-hidden group hover:shadow-[0_25px_70px_-10px_rgba(0,0,0,0.45)] transition-all">
        {/* Top Header Bar with Sponsor Label and Close Button */}
        <div className="px-4 py-2.5 bg-surface/90 border-b border-border/80 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-primary">
            <Sparkles size={12} className="text-primary" />
            <span>SPONSORED</span>
          </div>

          {/* Prominent Close Button */}
          <button
            onClick={handleDismiss}
            className="p-1.5 bg-black/70 hover:bg-black text-white rounded-full transition-transform hover:scale-110 active:scale-95 shadow-md"
            aria-label="Close Floating Banner"
            title="Dismiss Advertisement"
          >
            <X size={14} />
          </button>
        </div>

        {/* Ad Body Link */}
        <a
          href={ad.target_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className="block p-4 sm:p-5 space-y-3.5 cursor-pointer"
        >
          {/* Large Creative Image */}
          {ad.image_url && (
            <div className="relative w-full h-44 sm:h-48 rounded-2xl overflow-hidden border border-border shadow-inner bg-surface group-hover:scale-[1.02] transition-transform duration-300">
              <Image
                src={ad.image_url}
                alt={ad.title}
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-mono text-white flex items-center gap-1">
                <ShieldCheck size={11} className="text-emerald-400" /> Health Partner
              </div>
            </div>
          )}

          {/* Headline & Description */}
          <div className="space-y-1.5">
            <h4 className="font-heading font-bold text-base sm:text-lg text-dark leading-snug group-hover:text-primary transition-colors line-clamp-2">
              {ad.headline || ad.title}
            </h4>

            {ad.description && (
              <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
                {ad.description}
              </p>
            )}
          </div>

          {/* Full-Width Large Gradient CTA Button */}
          <div className="pt-1">
            <div className="w-full py-3 sm:py-3.5 px-5 bg-gradient-to-r from-accent via-[#ff6f3c] to-[#ff8a57] hover:brightness-105 text-white rounded-xl sm:rounded-2xl text-xs sm:text-sm font-heading font-bold text-center transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent/25 group-hover:scale-[1.02] active:scale-95">
              <span>{ad.cta_text || 'Shop Wellness'}</span>
              <ArrowRight size={15} />
            </div>
          </div>
        </a>
      </div>
    </aside>
  );
}
