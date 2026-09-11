import { requireAdmin } from '@/lib/auth/session';
import { sql } from '@/lib/db';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { AdvertisementsClient } from './AdvertisementsClient';
import { Advertisement } from '@/lib/types/advertisement';

export const dynamic = 'force-dynamic';

export default async function AdminAdvertisementsPage() {
  await requireAdmin();

  const ads = await sql`
    SELECT * FROM advertisements
    ORDER BY created_at DESC
  `;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      <ScrollReveal>
        <SectionHeader
          title="Advertisement Management"
          eyebrow="Monetization Engine"
          subtitle="Configure high-converting health sponsorships, banner placements, sticky footer promotions, and contextual health popups."
        />
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <AdvertisementsClient initialAds={ads as Advertisement[]} />
      </ScrollReveal>
    </div>
  );
}
