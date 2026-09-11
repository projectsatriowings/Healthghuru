'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Sparkles, ExternalLink } from 'lucide-react';
import { Advertisement } from '@/lib/types/advertisement';
import { trackAdEvent } from './adTracking';
import Image from 'next/image';

interface SidebarAdProps {
  initialAd?: Advertisement | null;
  category?: string;
  className?: string;
  sticky?: boolean;
}

export function SidebarAd({ initialAd, category, className = '', sticky = false }: SidebarAdProps) {
  const [ad, setAd] = useState<Advertisement | null>(initialAd || null);
  const trackedRef = useRef(false);

  useEffect(() => {
    if (!initialAd) {
      const fetchAd = async () => {
        try {
          const url = category
            ? `/api/ads/active?placement=sidebar&category=${category}`
            : `/api/ads/active?placement=sidebar`;
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
      <div className={`bg-white rounded-2xl p-4 border border-border shadow-sm text-center ${sticky ? 'sticky top-28' : ''} ${className}`}>
        <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted mb-2 block">
          ADVERTISEMENT
        </span>
        <div dangerouslySetInnerHTML={{ __html: ad.html_code }} />
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl border border-border/80 shadow-sm overflow-hidden group hover:shadow-md transition-shadow ${sticky ? 'sticky top-28' : ''} ${className}`}>
      {/* Top Tag */}
      <div className="px-4 py-2 bg-surface/60 border-b border-border/60 flex items-center justify-between">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary flex items-center gap-1">
          <Sparkles size={10} /> SPONSORED
        </span>
        <span className="text-[10px] text-text-muted">Ad</span>
      </div>

      <a
        href={ad.target_url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="block p-5 space-y-4"
      >
        {/* Creative Image */}
        {ad.image_url && (
          <div className="relative w-full h-44 rounded-xl overflow-hidden border border-border bg-surface group-hover:scale-[1.02] transition-transform duration-300">
            <Image
              src={ad.image_url}
              alt={ad.title}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        )}

        {/* Content */}
        <div className="space-y-2">
          <h4 className="font-heading font-bold text-dark text-base leading-snug group-hover:text-primary transition-colors">
            {ad.headline || ad.title}
          </h4>

          {ad.description && (
            <p className="text-xs text-text-secondary leading-relaxed line-clamp-3">
              {ad.description}
            </p>
          )}
        </div>

        {/* CTA Button */}
        <div className="pt-1">
          <div className="w-full py-2.5 px-4 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-heading font-semibold text-center transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-primary/20">
            <span>{ad.cta_text || 'Learn More'}</span>
            <ArrowRight size={13} />
          </div>
        </div>
      </a>
    </div>
  );
}
