'use client';

import { AdPlacement, Advertisement } from '@/lib/types/advertisement';
import { TopBannerAd } from './TopBannerAd';
import { HeroBannerAd } from './HeroBannerAd';
import { SidebarAd } from './SidebarAd';
import { FloatingFooterAd } from './FloatingFooterAd';
import { PopupAdModal } from './PopupAdModal';

interface AdSlotProps {
  placement: AdPlacement;
  initialAd?: Advertisement | null;
  category?: string;
  className?: string;
  sticky?: boolean;
}

export function AdSlot({ placement, initialAd, category, className, sticky }: AdSlotProps) {
  switch (placement) {
    case 'top_banner':
      return <TopBannerAd initialAd={initialAd} category={category} />;
    case 'hero_banner':
      return <HeroBannerAd initialAd={initialAd} category={category} className={className} />;
    case 'sidebar':
      return <SidebarAd initialAd={initialAd} category={category} className={className} sticky={sticky} />;
    case 'floating_footer':
      return <FloatingFooterAd initialAd={initialAd} category={category} />;
    case 'popup':
      return <PopupAdModal initialAd={initialAd} category={category} />;
    default:
      return null;
  }
}
