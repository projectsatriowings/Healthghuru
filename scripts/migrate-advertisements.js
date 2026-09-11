const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env' });

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not defined in .env');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function migrateAdvertisements() {
  console.log('Connecting to database and running advertisement migration...');

  try {
    // 1. Create advertisements table
    await sql`
      CREATE TABLE IF NOT EXISTS advertisements (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        placement VARCHAR(50) NOT NULL CHECK (placement IN ('top_banner', 'hero_banner', 'sidebar', 'floating_footer', 'popup')),
        image_url TEXT,
        target_url TEXT NOT NULL DEFAULT '#',
        headline VARCHAR(255),
        description TEXT,
        cta_text VARCHAR(50) DEFAULT 'Learn More',
        category VARCHAR(100) DEFAULT 'All',
        html_code TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        impressions_count INTEGER DEFAULT 0,
        clicks_count INTEGER DEFAULT 0,
        start_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        end_date TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('✓ advertisements table verified/created');

    // 2. Check if table is empty and pre-seed high quality health ads
    const countRes = await sql`SELECT COUNT(*)::int as count FROM advertisements`;
    const count = countRes[0]?.count || 0;

    if (count === 0) {
      console.log('Seeding initial active health advertisements...');

      const sampleAds = [
        {
          title: 'Top Banner - LivePure Nutrition',
          placement: 'top_banner',
          image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80',
          target_url: 'https://www.healthghuru.com/stay-healthy',
          headline: 'LivePure Organic Superfoods — 25% Off Plant Protein & Daily Greens',
          description: 'Doctor-formulated, clean 100% organic ingredients with no artificial additives.',
          cta_text: 'Claim 25% Off',
          category: 'Nutrition',
          is_active: true,
        },
        {
          title: 'Hero Banner - FitPulse Health Tracker',
          placement: 'hero_banner',
          image_url: 'https://images.unsplash.com/photo-1576243345690-4e4b79b63288?auto=format&fit=crop&w=1200&q=80',
          target_url: 'https://www.healthghuru.com/stay-healthy',
          headline: 'FitPulse Smart Health & Recovery Ring — 24/7 Biometric Insights',
          description: 'Track HRV, sleep stages, body temperature, and daily recovery with clinical precision.',
          cta_text: 'Explore Device',
          category: 'Fitness',
          is_active: true,
        },
        {
          title: 'Sidebar Banner - NutriLife Daily Vitamins',
          placement: 'sidebar',
          image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
          target_url: 'https://www.healthghuru.com/stay-healthy',
          headline: 'NutriLife Doctor-Formulated Vitamin D3 + K2 & Omega-3 Pack',
          description: 'Bioavailable essential micronutrients designed for peak immune vitality and heart health.',
          cta_text: 'Shop Wellness',
          category: 'Wellness',
          is_active: true,
        },
        {
          title: 'Floating Footer - ZenMind Deep Sleep Guide',
          placement: 'floating_footer',
          image_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
          target_url: 'https://www.healthghuru.com/stay-healthy',
          headline: 'Better Sleep Tonight — Download HealthGhuru 7-Day Sleep & Calm Protocol',
          description: 'Evidence-backed breathwork, magnesium timing, and circadian rhythm optimization.',
          cta_text: 'Get Free Guide',
          category: 'Mental Health',
          is_active: true,
        },
        {
          title: 'Popup Modal - 2026 Longevity Wellness Blueprint',
          placement: 'popup',
          image_url: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80',
          target_url: 'https://www.healthghuru.com/stay-healthy',
          headline: 'Unlock The 2026 Longevity & Cellular Health Blueprint',
          description: 'Join 50,000+ health enthusiasts getting science-backed nutrition, fasting regimens, and vitality tips weekly.',
          cta_text: 'Join Free Today',
          category: 'All',
          is_active: true,
        },
      ];

      for (const ad of sampleAds) {
        await sql`
          INSERT INTO advertisements (
            title, placement, image_url, target_url, headline, description, cta_text, category, is_active
          ) VALUES (
            ${ad.title}, ${ad.placement}, ${ad.image_url}, ${ad.target_url}, ${ad.headline}, ${ad.description}, ${ad.cta_text}, ${ad.category}, ${ad.is_active}
          );
        `;
      }
      console.log(`✓ Pre-seeded ${sampleAds.length} active advertisements across all 5 placements`);
    } else {
      console.log(`✓ Table already contains ${count} advertisements`);
    }

    console.log('Advertisement migration complete successfully!');
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

migrateAdvertisements();
