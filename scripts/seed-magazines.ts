import 'dotenv/config';
import { sql } from '../src/lib/db';

async function seedMagazines() {
  console.log('Seeding magazine and clinical bulletin issues into content_items...');

  // Get sources
  const sources = await sql`SELECT id, name FROM content_sources`;
  const getSourceId = (nameSubstr: string) => {
    const s = sources.find((src: any) => src.name.toLowerCase().includes(nameSubstr.toLowerCase()));
    return s ? s.id : null;
  };

  const harvardId = getSourceId('Harvard');
  const mayoId = getSourceId('Mayo');
  const nihId = getSourceId('NIH');
  const whoId = getSourceId('WHO') || getSourceId('World Health');
  const cdcId = getSourceId('CDC');
  const mntId = getSourceId('Medical News Today');

  const magazineItems = [
    {
      title: 'Harvard Medicine: The Longevity Paradigm & Cellular Regeneration',
      slug: 'harvard-medicine-longevity-paradigm',
      content_type: 'magazine',
      excerpt: 'Exploring the frontier of cellular senescence, NAD+ precursor therapies, telomere preservation, and metabolic health interventions for healthy aging.',
      description: 'The definitive quarterly digest from Harvard Medical School examining breakthroughs in longevity science, cellular autophagy, and personalized longevity therapeutics.',
      canonical_url: 'https://hms.harvard.edu/magazine',
      image_url: '/images/fitness_pillar.png',
      author_name: 'Harvard Medical School Faculty of Medicine',
      category: 'Healthy Aging',
      source_id: harvardId,
      status: 'published',
      is_external: true,
      is_featured: true,
      quality_score: 98,
      published_at: '2025-01-15T10:00:00Z',
    },
    {
      title: 'NIH Research Matters: Microbiome Diversity and Metabolic Equilibrium',
      slug: 'nih-research-matters-microbiome-metabolic',
      content_type: 'magazine',
      excerpt: 'A comprehensive clinical digest on research advances funded by the National Institutes of Health exploring gut microbiome diversity and autoimmune resilience.',
      description: 'Monthly clinical research compendium detailing clinical trials on short-chain fatty acids, gut barrier integrity, and metabolic biomarkers.',
      canonical_url: 'https://www.nih.gov/news-events/nih-research-matters',
      image_url: '/images/nutrition_pillar.png',
      author_name: 'National Institutes of Health Clinical Center',
      category: 'Gut Health',
      source_id: nihId,
      status: 'published',
      is_external: true,
      is_featured: true,
      quality_score: 95,
      published_at: '2025-01-20T14:30:00Z',
    },
    {
      title: 'Mayo Clinic Health Letter: Cardiovascular Prevention & Arterial Health',
      slug: 'mayo-clinic-cardiovascular-prevention-guide',
      content_type: 'magazine',
      excerpt: 'Practical clinical guidance from Mayo Clinic cardiology teams on blood pressure variability, endothelial elasticity, and heart rhythm optimization.',
      description: 'Special monthly issue on preventative cardiovascular medicine, coronary calcium scoring, lipid sub-fraction testing, and cardiac lifestyle interventions.',
      canonical_url: 'https://healthletter.mayoclinic.org',
      image_url: '/images/exercise_push.png',
      author_name: 'Mayo Foundation for Medical Education & Research',
      category: 'Heart Health',
      source_id: mayoId,
      status: 'published',
      is_external: true,
      is_featured: true,
      quality_score: 96,
      published_at: '2025-02-01T08:00:00Z',
    },
    {
      title: 'WHO Global Health Bulletin: Worldwide Non-Communicable Disease Strategies',
      slug: 'who-global-health-bulletin-ncd-prevention',
      content_type: 'magazine',
      excerpt: 'World Health Organization clinical overview detailing preventive guidelines for hypertension, type-2 diabetes, and respiratory wellness across demographics.',
      description: 'Global epidemiology and preventive health bulletin outlining evidence-based interventions for chronic lifestyle diseases across 194 member states.',
      canonical_url: 'https://www.who.int/publications/journals/bulletin',
      image_url: '/images/mental_health_pillar.png',
      author_name: 'World Health Organization Department of Public Health',
      category: 'Preventive Care',
      source_id: whoId,
      status: 'published',
      is_external: true,
      is_featured: false,
      quality_score: 94,
      published_at: '2025-02-10T12:00:00Z',
    },
    {
      title: 'CDC MMWR: Sleep Architecture and Neuro-Immune Recovery',
      slug: 'cdc-mmwr-sleep-architecture-immune-recovery',
      content_type: 'magazine',
      excerpt: 'Clinical report analyzing the direct correlation between deep slow-wave sleep cycles and systemic antibody production during seasonal viral surges.',
      description: 'Morbidity and Mortality Weekly Report focused on preventive behavioral health, circadian hygiene, and natural immune system enhancement.',
      canonical_url: 'https://www.cdc.gov/mmwr/',
      image_url: '/images/sleep_pillar.png',
      author_name: 'CDC Office of Public Health Science',
      category: 'Sleep',
      source_id: cdcId,
      status: 'published',
      is_external: true,
      is_featured: false,
      quality_score: 92,
      published_at: '2025-02-18T16:00:00Z',
    },
    {
      title: 'Medical News Today Clinical Digest: The Neurobiology of Stress & Cortisol',
      slug: 'mnt-clinical-digest-stress-cortisol-biology',
      content_type: 'magazine',
      excerpt: 'In-depth medical digest on the hypothalamic-pituitary-adrenal (HPA) axis, vagus nerve stimulation techniques, and mindfulness-based stress reduction.',
      description: 'Medical peer review of current neurological and biochemical interventions for chronic sympathetic nervous system arousal and burnout.',
      canonical_url: 'https://www.medicalnewstoday.com',
      image_url: '/images/cycling.png',
      author_name: 'Medical News Today Clinical Review Board',
      category: 'Mental Health',
      source_id: mntId,
      status: 'published',
      is_external: true,
      is_featured: true,
      quality_score: 93,
      published_at: '2025-02-25T09:15:00Z',
    }
  ];

  for (const item of magazineItems) {
    const existing = await sql`SELECT id FROM content_items WHERE slug = ${item.slug}`;
    if (existing.length === 0) {
      await sql`
        INSERT INTO content_items (
          title, slug, content_type, excerpt, description,
          canonical_url, image_url, author_name, category,
          source_id, status, is_external, is_featured,
          quality_score, published_at
        ) VALUES (
          ${item.title}, ${item.slug}, ${item.content_type}, ${item.excerpt}, ${item.description},
          ${item.canonical_url}, ${item.image_url}, ${item.author_name}, ${item.category},
          ${item.source_id}::uuid, ${item.status}, ${item.is_external}, ${item.is_featured},
          ${item.quality_score}, ${item.published_at}::timestamptz
        );
      `;
    } else {
      await sql`
        UPDATE content_items SET
          title = ${item.title},
          excerpt = ${item.excerpt},
          description = ${item.description},
          canonical_url = ${item.canonical_url},
          image_url = ${item.image_url},
          category = ${item.category},
          source_id = ${item.source_id}::uuid,
          quality_score = ${item.quality_score}
        WHERE id = ${existing[0].id};
      `;
    }
    console.log(`✓ Seeded magazine: ${item.title}`);
  }

  const count = await sql`SELECT COUNT(*)::int as c FROM content_items WHERE content_type = 'magazine'`;
  console.log(`Total magazines in database: ${count[0].c}`);
}

seedMagazines().catch(console.error);
