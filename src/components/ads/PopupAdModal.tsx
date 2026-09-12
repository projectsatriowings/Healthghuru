'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from 'react';
import { X, Sparkles, ArrowRight, ShieldCheck, HeartHandshake } from 'lucide-react';
import { Advertisement } from '@/lib/types/advertisement';
import { trackAdEvent } from './adTracking';
import Image from 'next/image';

interface PopupAdModalProps {
  initialAd?: Advertisement | null;
  category?: string;
  delayMs?: number;
}

export function PopupAdModal({ initialAd, category, delayMs = 6000 }: PopupAdModalProps) {
  const [ad, setAd] = useState<Advertisement | null>(initialAd || null);
  const [isOpen, setIsOpen] = useState(false);
  const trackedRef = useRef(false);

  useEffect(() => {
    // Check frequency cap in session
    const hasSeen = sessionStorage.getItem('hg_health_popup_seen') === 'true';
    if (hasSeen) return;

    // Fetch active popup ad
    const fetchAd = async () => {
      try {
        const url = category
          ? `/api/ads/active?placement=popup&category=${category}`
          : `/api/ads/active?placement=popup`;
        const res = await fetch(url);
        const json = await res.json();
        if (json.success && json.ads && json.ads.length > 0) {
          setAd(json.ads[0]);
        }
      } catch {
        // ignore
      }
    };

    if (!initialAd) {
      fetchAd();
    }

    // Trigger popup after gentle delay
    const timer = setTimeout(() => {
      const alreadyDismissed = sessionStorage.getItem('hg_health_popup_seen') === 'true';
      if (!alreadyDismissed) {
        setIsOpen(true);
      }
    }, delayMs);

    return () => clearTimeout(timer);
  }, [initialAd, category, delayMs]);

  useEffect(() => {
    if (ad && isOpen && !trackedRef.current) {
      trackedRef.current = true;
      trackAdEvent(ad.id, 'impression');
    }
  }, [ad, isOpen]);

  if (!isOpen || !ad) return null;

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('hg_health_popup_seen', 'true');
  };

  const handleClick = () => {
    if (ad) {
      trackAdEvent(ad.id, 'click');
      handleClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative bg-white rounded-3xl shadow-2xl border border-border max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 p-2 bg-black/40 hover:bg-black/70 text-white rounded-full backdrop-blur-md transition-colors"
          aria-label="Close Health Promotion"
        >
          <X size={18} />
        </button>

        {/* Ad Image Hero */}
        {ad.image_url && (
          <div className="relative w-full h-52 sm:h-60 bg-dark">
            <Image
              src={ad.image_url}
              alt={ad.title}
              fill
              className="object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute top-4 left-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-emerald-300 border border-white/20 text-xs font-mono font-bold uppercase tracking-wider">
                <Sparkles size={12} className="text-emerald-400" /> SPONSORED HEALTH AD
              </span>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-xs text-text-secondary font-medium">
            <ShieldCheck size={16} className="text-primary" />
            <span>HealthGhuru Verified Wellness Partner</span>
          </div>

          <h3 className="font-display text-2xl sm:text-3xl text-dark font-bold leading-tight">
            {ad.headline || ad.title}
          </h3>

          {ad.description && (
            <p className="text-sm text-text-secondary leading-relaxed">
              {ad.description}
            </p>
          )}

          {/* Action Buttons */}
          <div className="pt-3 flex flex-col sm:flex-row items-center gap-3">
            <a
              href={ad.target_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleClick}
              className="w-full sm:flex-1 py-3.5 px-6 rounded-xl font-heading font-bold text-sm text-white bg-primary hover:bg-primary-dark transition-all text-center flex items-center justify-center gap-2 shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-95"
            >
              <span>{ad.cta_text || 'Claim Exclusive Offer'}</span>
              <ArrowRight size={15} />
            </a>

            <button
              onClick={handleClose}
              className="w-full sm:w-auto py-3 px-5 text-xs font-heading font-semibold text-text-muted hover:text-dark transition-colors"
            >
              Maybe Later
            </button>
          </div>

          <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-text-muted">
            <HeartHandshake size={13} className="text-primary" />
            <span>Science-backed wellness recommendations</span>
          </div>
        </div>
      </div>
    </div>
  );
}
