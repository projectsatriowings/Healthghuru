'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from 'react';
import { X, Sparkles, ExternalLink, ArrowRight } from 'lucide-react';
import { Advertisement } from '@/lib/types/advertisement';
import { trackAdEvent } from './adTracking';
import Image from 'next/image';

interface SideFloatingBannersProps {
  initialLeftAd?: Advertisement | null;
  initialRightAd?: Advertisement | null;
  category?: string;
}

export function SideFloatingBanners({ initialLeftAd, initialRightAd, category }: SideFloatingBannersProps) {
  const [leftAd, setLeftAd] = useState<Advertisement | null>(initialLeftAd || null);
  const [rightAd, setRightAd] = useState<Advertisement | null>(initialRightAd || null);
  const [leftDismissed, setLeftDismissed] = useState(false);
  const [rightDismissed, setRightDismissed] = useState(false);
  const leftTrackedRef = useRef(false);
  const rightTrackedRef = useRef(false);

  useEffect(() => {
    // Check session dismissal
    if (sessionStorage.getItem('hg_left_side_ad_dismissed') === 'true') {
      setLeftDismissed(true);
    }
    if (sessionStorage.getItem('hg_right_side_ad_dismissed') === 'true') {
      setRightDismissed(true);
    }

    // Fetch active sidebar or flanker ads
    const fetchAds = async () => {
      try {
        const url = category
          ? `/api/ads/active?placement=sidebar&category=${category}`
          : `/api/ads/active?placement=sidebar`;
        const res = await fetch(url);
        const json = await res.json();
        if (json.success && json.ads && json.ads.length > 0) {
          setLeftAd(json.ads[0]);
          // If multiple ads exist, use 2nd for right, else use the first
          setRightAd(json.ads[1] || json.ads[0]);
        }
      } catch {
        // ignore
      }
    };

    if (!initialLeftAd || !initialRightAd) {
      fetchAds();
    }
  }, [initialLeftAd, initialRightAd, category]);

  useEffect(() => {
    if (leftAd && !leftDismissed && !leftTrackedRef.current) {
      leftTrackedRef.current = true;
      trackAdEvent(leftAd.id, 'impression');
    }
  }, [leftAd, leftDismissed]);

  useEffect(() => {
    if (rightAd && !rightDismissed && !rightTrackedRef.current) {
      rightTrackedRef.current = true;
      trackAdEvent(rightAd.id, 'impression');
    }
  }, [rightAd, rightDismissed]);

  const handleDismissLeft = () => {
    setLeftDismissed(true);
    sessionStorage.setItem('hg_left_side_ad_dismissed', 'true');
  };

  const handleDismissRight = () => {
    setRightDismissed(true);
    sessionStorage.setItem('hg_right_side_ad_dismissed', 'true');
  };

  return (
    <>
      {/* 1. Left Floating Skyscraper Banner (Visible on ultra-wide / desktop >= 1380px) */}
      {!leftDismissed && leftAd && (
        <aside
          aria-label="Left Side Advertisement"
          className="fixed left-2 top-28 z-30 hidden 2xl:block w-[140px] bg-white rounded-2xl border border-primary/20 shadow-xl overflow-hidden animate-in fade-in slide-in-from-left duration-500 group"
        >
          {/* Dismiss Button */}
          <button
            onClick={handleDismissLeft}
            className="absolute top-1.5 right-1.5 z-20 p-1 bg-black/60 hover:bg-black text-white rounded-full transition-colors"
            title="Dismiss Ad"
          >
            <X size={12} />
          </button>

          <a
            href={leftAd.target_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackAdEvent(leftAd.id, 'click')}
            className="block text-center p-2.5 space-y-2 cursor-pointer"
          >
            <div className="flex items-center justify-center gap-1 text-[9px] font-mono font-bold uppercase tracking-wider text-primary bg-primary/10 py-0.5 rounded">
              <Sparkles size={8} /> SPONSORED
            </div>

            {leftAd.image_url && (
              <div className="relative w-full h-36 rounded-lg overflow-hidden border border-border bg-surface group-hover:scale-105 transition-transform duration-300">
                <Image
                  src={leftAd.image_url}
                  alt={leftAd.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}

            <h5 className="font-heading font-bold text-[11px] text-dark leading-tight line-clamp-3 group-hover:text-primary transition-colors">
              {leftAd.headline || leftAd.title}
            </h5>

            <div className="w-full py-1.5 px-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-[10px] font-heading font-bold flex items-center justify-center gap-1 shadow-sm">
              <span>{leftAd.cta_text || 'View'}</span>
              <ArrowRight size={10} />
            </div>
          </a>
        </aside>
      )}

      {/* 2. Right Floating Skyscraper Banner (Visible on ultra-wide / desktop >= 1380px) */}
      {!rightDismissed && rightAd && (
        <aside
          aria-label="Right Side Advertisement"
          className="fixed right-2 top-28 z-30 hidden 2xl:block w-[140px] bg-white rounded-2xl border border-primary/20 shadow-xl overflow-hidden animate-in fade-in slide-in-from-right duration-500 group"
        >
          {/* Dismiss Button */}
          <button
            onClick={handleDismissRight}
            className="absolute top-1.5 right-1.5 z-20 p-1 bg-black/60 hover:bg-black text-white rounded-full transition-colors"
            title="Dismiss Ad"
          >
            <X size={12} />
          </button>

          <a
            href={rightAd.target_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackAdEvent(rightAd.id, 'click')}
            className="block text-center p-2.5 space-y-2 cursor-pointer"
          >
            <div className="flex items-center justify-center gap-1 text-[9px] font-mono font-bold uppercase tracking-wider text-primary bg-primary/10 py-0.5 rounded">
              <Sparkles size={8} /> SPONSORED
            </div>

            {rightAd.image_url && (
              <div className="relative w-full h-36 rounded-lg overflow-hidden border border-border bg-surface group-hover:scale-105 transition-transform duration-300">
                <Image
                  src={rightAd.image_url}
                  alt={rightAd.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}

            <h5 className="font-heading font-bold text-[11px] text-dark leading-tight line-clamp-3 group-hover:text-primary transition-colors">
              {rightAd.headline || rightAd.title}
            </h5>

            <div className="w-full py-1.5 px-2 bg-gradient-to-r from-accent to-[#ff8a57] text-white rounded-lg text-[10px] font-heading font-bold flex items-center justify-center gap-1 shadow-sm">
              <span>{rightAd.cta_text || 'Explore'}</span>
              <ArrowRight size={10} />
            </div>
          </a>
        </aside>
      )}
    </>
  );
}
