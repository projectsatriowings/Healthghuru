/* eslint-disable @typescript-eslint/no-explicit-any */
import { Metadata } from 'next';
import { sql } from '@/lib/db';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { HealthDisclaimer } from '@/components/media/HealthDisclaimer';
import Image from 'next/image';
import { BookOpen, ExternalLink, Calendar } from 'lucide-react';

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

  // Fallback curated issues if database has no magazine items yet
  const displayMagazines = magazines.length > 0 ? magazines : [
    {
      id: 'mag-1',
      title: 'Harvard Medicine: The Longevity Paradigm',
      slug: 'harvard-medicine-longevity',
      content_type: 'magazine' as const,
      excerpt: 'Exploring the frontier of cellular senescence, NAD+ therapies, and sustainable metabolic health interventions.',
      image_url: '/images/fitness_pillar.png',
      canonical_url: 'https://hms.harvard.edu/magazine',
      published_at: new Date().toISOString(),
      author_name: 'Harvard Medical School',
      category: 'Healthy Aging',
      source_name: 'Harvard Medicine Magazine',
      is_external: true,
    },
    {
      id: 'mag-2',
      title: 'NIH Research Matters: Breakthroughs in Metabolic Science',
      slug: 'nih-research-matters-digest',
      content_type: 'magazine' as const,
      excerpt: 'A monthly summary of research advances funded by the National Institutes of Health exploring gut microbiome diversity.',
      image_url: '/images/nutrition_pillar.png',
      canonical_url: 'https://www.nih.gov/news-events/nih-research-matters',
      published_at: new Date().toISOString(),
      author_name: 'National Institutes of Health',
      category: 'Medical Research',
      source_name: 'NIH News in Health',
      is_external: true,
    },
    {
      id: 'mag-3',
      title: 'Mayo Clinic Health Letter: Cardiovascular Prevention Guide',
      slug: 'mayo-clinic-health-letter-cardio',
      content_type: 'magazine' as const,
      excerpt: 'Essential practical guidance from Mayo Clinic clinicians on managing blood pressure, arterial elasticity, and heart rhythm.',
      image_url: '/images/exercise_push.png',
      canonical_url: 'https://healthletter.mayoclinic.org',
      published_at: new Date().toISOString(),
      author_name: 'Mayo Foundation for Medical Education',
      category: 'Heart Health',
      source_name: 'Mayo Clinic',
      is_external: true,
    },
  ];

  return (
    <div className="pt-28 pb-20 bg-surface/30 min-h-screen">
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
                    <span>{new Date(mag.published_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
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
