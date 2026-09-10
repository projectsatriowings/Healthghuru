/* eslint-disable @typescript-eslint/no-explicit-any */
import { Metadata } from 'next';
import { sql } from '@/lib/db';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { HealthDisclaimer } from '@/components/media/HealthDisclaimer';
import Image from 'next/image';
import { BookOpen, ExternalLink, Calendar } from 'lucide-react';
import { formatMonthYear } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Health Magazines & Periodicals | HealthGhuru — Medical Digests & Publications',
  description: 'Curated periodicals, monthly health digests, clinical bulletins, and institutional health magazines.',
};

export default async function MagazinesPage() {
  const magazines = await sql`
    SELECT i.*, s.name as source_name
    FROM content_items i
    LEFT JOIN content_sources s ON i.source_id = s.id
    WHERE i.content_type = 'magazine' AND i.status = 'published' AND i.deleted_at IS NULL
    ORDER BY i.published_at DESC
    LIMIT 24
  `;

  // Fetched 100% dynamically from content_items
  const displayMagazines = magazines;

  return (
    <div className="pt-6 sm:pt-10 pb-20 bg-surface/30 min-h-screen">
      <div className="site-container space-y-8">
        <ScrollReveal>
          <div className="border-b border-border pb-6">
            <SectionHeader
              eyebrow="Periodicals & Digests"
              title="Health Magazines & Clinical Bulletins"
              subtitle="Curated monthly digests, medical school journals, and clinical letters from world-class healthcare authorities."
            />
          </div>
        </ScrollReveal>

        {/* Magazine Shelf */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayMagazines.map((mag: any) => (
            <div
              key={mag.id}
              className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-card hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="w-full aspect-[4/3] relative bg-surface">
                <Image
                  src={mag.image_url || '/images/fitness_pillar.png'}
                  alt={mag.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute top-3 left-3 bg-dark/80 backdrop-blur-sm text-white text-[10px] uppercase font-heading font-bold px-3 py-1 rounded-full">
                  {mag.category || 'Periodical'}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-text-muted mb-2">
                    <Calendar size={12} />
                    <span suppressHydrationWarning>{formatMonthYear(mag.published_at)}</span>
                    <span>·</span>
                    <span className="text-dark font-medium">{mag.source_name}</span>
                  </div>

                  <h3 className="font-heading font-semibold text-dark text-lg leading-snug">
                    {mag.title}
                  </h3>

                  <p className="text-xs text-text-secondary mt-2 line-clamp-3 leading-relaxed">
                    {mag.excerpt || mag.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-border/40 flex items-center justify-between">
                  <span className="text-xs text-text-muted">By {mag.author_name}</span>
                  <a
                    href={mag.canonical_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary hover:bg-primary-dark text-white text-xs font-semibold shadow-sm transition-colors"
                  >
                    <BookOpen size={13} /> View Issue <ExternalLink size={11} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        <HealthDisclaimer />
      </div>
    </div>
  );
}
