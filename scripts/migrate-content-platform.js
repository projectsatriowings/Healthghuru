const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env' });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not defined');
}

const sql = neon(process.env.DATABASE_URL);

async function migrateContentPlatform() {
  console.log('--- Starting Health Content Platform Database Migration ---');

  try {
    // 1. Content Categories
    console.log('1. Creating content_categories table...');
    await sql`
      CREATE TABLE IF NOT EXISTS content_categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL UNIQUE,
        slug VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        parent_id UUID REFERENCES content_categories(id) ON DELETE SET NULL,
        display_order INTEGER DEFAULT 0,
        is_enabled BOOLEAN DEFAULT TRUE,
        icon_name VARCHAR(50),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_cat_slug ON content_categories(slug);`;

    // 2. Content Tags
    console.log('2. Creating content_tags table...');
    await sql`
      CREATE TABLE IF NOT EXISTS content_tags (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL UNIQUE,
        slug VARCHAR(100) NOT NULL UNIQUE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_tag_slug ON content_tags(slug);`;

    // 3. Content Sources
    console.log('3. Creating content_sources table...');
    await sql`
      CREATE TABLE IF NOT EXISTS content_sources (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        provider VARCHAR(100),
        website_url TEXT,
        feed_url TEXT,
        youtube_channel_id VARCHAR(100),
        api_config JSONB DEFAULT '{}'::jsonb,
        category_id UUID REFERENCES content_categories(id) ON DELETE SET NULL,
        default_category VARCHAR(100),
        language VARCHAR(20) DEFAULT 'en',
        country VARCHAR(50),
        enabled BOOLEAN DEFAULT TRUE,
        auto_publish BOOLEAN DEFAULT TRUE,
        requires_review BOOLEAN DEFAULT FALSE,
        priority INTEGER DEFAULT 5,
        trust_score VARCHAR(50) DEFAULT 'Medium',
        fetch_interval_minutes INTEGER DEFAULT 60,
        last_fetched_at TIMESTAMPTZ,
        last_success_at TIMESTAMPTZ,
        last_failure_at TIMESTAMPTZ,
        last_error TEXT,
        item_count INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_sources_enabled ON content_sources(enabled, type);`;

    // 4. Content Items
    console.log('4. Creating content_items table...');
    await sql`
      CREATE TABLE IF NOT EXISTS content_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        content_type VARCHAR(50) NOT NULL,
        title VARCHAR(500) NOT NULL,
        slug VARCHAR(500) UNIQUE NOT NULL,
        excerpt TEXT,
        description TEXT,
        canonical_url TEXT NOT NULL,
        image_url TEXT,
        author_name VARCHAR(255),
        published_at TIMESTAMPTZ,
        source_id UUID REFERENCES content_sources(id) ON DELETE SET NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'published',
        language VARCHAR(20) DEFAULT 'en',
        country VARCHAR(50),
        category VARCHAR(100),
        subcategory VARCHAR(100),
        is_external BOOLEAN DEFAULT TRUE,
        is_featured BOOLEAN DEFAULT FALSE,
        is_trending BOOLEAN DEFAULT FALSE,
        is_breaking BOOLEAN DEFAULT FALSE,
        is_verified BOOLEAN DEFAULT FALSE,
        requires_review BOOLEAN DEFAULT FALSE,
        quality_score NUMERIC(5,2) DEFAULT 0,
        relevance_score NUMERIC(5,2) DEFAULT 0,
        duration_seconds INTEGER,
        video_id VARCHAR(100),
        view_count INTEGER DEFAULT 0,
        click_count INTEGER DEFAULT 0,
        bookmark_count INTEGER DEFAULT 0,
        share_count INTEGER DEFAULT 0,
        duplicate_of_id UUID REFERENCES content_items(id) ON DELETE SET NULL,
        duplicate_confidence NUMERIC(5,2) DEFAULT 0,
        raw_metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMPTZ
      );
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_content_slug ON content_items(slug);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_content_status_pub ON content_items(status, published_at DESC);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_content_type ON content_items(content_type);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_content_category ON content_items(category);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_content_source ON content_items(source_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_content_canonical ON content_items(canonical_url);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_content_featured ON content_items(is_featured) WHERE is_featured = TRUE;`;
    await sql`CREATE INDEX IF NOT EXISTS idx_content_breaking ON content_items(is_breaking) WHERE is_breaking = TRUE;`;
    await sql`CREATE INDEX IF NOT EXISTS idx_content_trending ON content_items(is_trending) WHERE is_trending = TRUE;`;

    // 5. Content Source Items (provider identity mapping)
    console.log('5. Creating content_source_items table...');
    await sql`
      CREATE TABLE IF NOT EXISTS content_source_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        source_id UUID NOT NULL REFERENCES content_sources(id) ON DELETE CASCADE,
        content_item_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
        external_id VARCHAR(500) NOT NULL,
        external_url TEXT,
        raw_hash VARCHAR(128),
        first_seen_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        last_seen_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        raw_payload JSONB,
        UNIQUE(source_id, external_id)
      );
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_source_items_hash ON content_source_items(raw_hash);`;

    // 6. Content Item Tags
    console.log('6. Creating content_item_tags table...');
    await sql`
      CREATE TABLE IF NOT EXISTS content_item_tags (
        content_item_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
        tag_id UUID NOT NULL REFERENCES content_tags(id) ON DELETE CASCADE,
        PRIMARY KEY(content_item_id, tag_id)
      );
    `;

    // 7. Content Reviews
    console.log('7. Creating content_reviews table...');
    await sql`
      CREATE TABLE IF NOT EXISTS content_reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        content_item_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
        reviewer_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(50) NOT NULL,
        notes TEXT,
        reasons TEXT[],
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 8. Content Metrics
    console.log('8. Creating content_metrics table...');
    await sql`
      CREATE TABLE IF NOT EXISTS content_metrics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        content_item_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
        metric_type VARCHAR(50) NOT NULL,
        ip_hash VARCHAR(64),
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_metrics_item ON content_metrics(content_item_id, metric_type);`;

    // 9. Content Redirects
    console.log('9. Creating content_redirects table...');
    await sql`
      CREATE TABLE IF NOT EXISTS content_redirects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        source_slug VARCHAR(500) NOT NULL UNIQUE,
        target_slug VARCHAR(500) NOT NULL,
        status_code INTEGER DEFAULT 301,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 10. Ingestion Runs
    console.log('10. Creating ingestion_runs table...');
    await sql`
      CREATE TABLE IF NOT EXISTS ingestion_runs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        source_id UUID REFERENCES content_sources(id) ON DELETE CASCADE,
        source_name VARCHAR(255),
        started_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMPTZ,
        status VARCHAR(50) NOT NULL DEFAULT 'running',
        duration_ms INTEGER,
        items_found INTEGER DEFAULT 0,
        items_imported INTEGER DEFAULT 0,
        items_updated INTEGER DEFAULT 0,
        items_skipped INTEGER DEFAULT 0,
        items_duplicated INTEGER DEFAULT 0,
        items_failed INTEGER DEFAULT 0,
        error_message TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_ingestion_runs_source ON ingestion_runs(source_id, started_at DESC);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_ingestion_runs_status ON ingestion_runs(status, started_at DESC);`;

    // 11. Ingestion Errors
    console.log('11. Creating ingestion_errors table...');
    await sql`
      CREATE TABLE IF NOT EXISTS ingestion_errors (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        run_id UUID NOT NULL REFERENCES ingestion_runs(id) ON DELETE CASCADE,
        source_id UUID REFERENCES content_sources(id) ON DELETE SET NULL,
        item_identifier TEXT,
        stage VARCHAR(100),
        error_code VARCHAR(100),
        error_message TEXT,
        raw_data JSONB,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_ingestion_errors_run ON ingestion_errors(run_id);`;

    // Seed Standard Health Taxonomy Categories
    console.log('12. Seeding health taxonomy categories...');
    const standardCategories = [
      { name: 'Nutrition', slug: 'nutrition', description: 'Diet, vitamins, superfoods, gut health, and meal planning', icon: 'Apple', order: 1 },
      { name: 'Fitness', slug: 'fitness', description: 'Strength, cardio, flexibility, mobility, and functional movement', icon: 'Dumbbell', order: 2 },
      { name: 'Mental Health', slug: 'mental-health', description: 'Mindfulness, anxiety reduction, stress management, and emotional wellbeing', icon: 'Brain', order: 3 },
      { name: 'Sleep', slug: 'sleep', description: 'Circadian rhythm, insomnia solutions, sleep hygiene, and recovery', icon: 'Moon', order: 4 },
      { name: 'Heart Health', slug: 'heart-health', description: 'Cardiovascular wellness, blood pressure, cholesterol, and arterial health', icon: 'Heart', order: 5 },
      { name: 'Preventive Care', slug: 'preventive-care', description: 'Screenings, early detection, vaccinations, and longevity habits', icon: 'ShieldCheck', order: 6 },
      { name: 'Medical Research', slug: 'medical-research', description: 'Clinical trials, breakthroughs, neuroscience, and evidence-based studies', icon: 'Microscope', order: 7 },
      { name: 'Immunity', slug: 'immunity', description: 'Immune defense, seasonal resilience, antioxidants, and lymphatic vitality', icon: 'Sparkles', order: 8 },
      { name: 'Gut Health', slug: 'gut-health', description: 'Microbiome, digestive enzymes, probiotics, and gut-brain axis', icon: 'Activity', order: 9 },
      { name: 'Healthy Aging', slug: 'healthy-aging', description: 'Cellular health, cognitive preservation, and longevity science', icon: 'Clock', order: 10 },
      { name: 'Weight Management', slug: 'weight-management', description: 'Metabolism, sustainable body composition, and appetite regulation', icon: 'Scale', order: 11 },
      { name: 'Diabetes', slug: 'diabetes', description: 'Blood sugar regulation, insulin sensitivity, and glycemic control', icon: 'Droplets', order: 12 },
      { name: 'Women\'s Health', slug: 'womens-health', description: 'Hormonal balance, fertility, maternal care, and wellness', icon: 'User', order: 13 },
      { name: 'Men\'s Health', slug: 'mens-health', description: 'Vitality, testosterone health, prostate care, and strength', icon: 'UserCheck', order: 14 },
      { name: 'Diseases & Conditions', slug: 'diseases-conditions', description: 'Chronic disease management, symptoms, treatments, and patient care', icon: 'AlertCircle', order: 15 },
      { name: 'Wellness', slug: 'wellness', description: 'Holistic living, hydration, meditation, and healthy lifestyle habits', icon: 'Leaf', order: 16 }
    ];

    for (const cat of standardCategories) {
      await sql`
        INSERT INTO content_categories (name, slug, description, icon_name, display_order)
        VALUES (${cat.name}, ${cat.slug}, ${cat.description}, ${cat.icon}, ${cat.order})
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          icon_name = EXCLUDED.icon_name,
          display_order = EXCLUDED.display_order;
      `;
    }
    console.log(`✓ Seeded ${standardCategories.length} categories`);

    // Seed Curated External Sources
    console.log('13. Seeding verified external health sources...');
    const defaultSources = [
      {
        name: 'Medical News Today',
        type: 'rss',
        provider: 'medicalnewstoday.com',
        website_url: 'https://www.medicalnewstoday.com',
        feed_url: 'https://rss.medicalnewstoday.com/featurednews.xml',
        default_category: 'Medical Research',
        trust_score: 'High',
        auto_publish: true,
        requires_review: false,
        fetch_interval_minutes: 60
      },
      {
        name: 'NIH News in Health',
        type: 'rss',
        provider: 'nih.gov',
        website_url: 'https://newsinhealth.nih.gov',
        feed_url: 'https://newsinhealth.nih.gov/rss/nih-news-health.xml',
        default_category: 'Medical Research',
        trust_score: 'High',
        auto_publish: true,
        requires_review: false,
        fetch_interval_minutes: 120
      },
      {
        name: 'CDC Online Newsroom',
        type: 'rss',
        provider: 'cdc.gov',
        website_url: 'https://www.cdc.gov/media',
        feed_url: 'https://tools.cdc.gov/podcasts/feed.asp?feedid=183',
        default_category: 'Preventive Care',
        trust_score: 'High',
        auto_publish: true,
        requires_review: false,
        fetch_interval_minutes: 180
      },
      {
        name: 'Harvard Health Publishing',
        type: 'rss',
        provider: 'health.harvard.edu',
        website_url: 'https://www.health.harvard.edu',
        feed_url: 'https://www.health.harvard.edu/blog/feed',
        default_category: 'Wellness',
        trust_score: 'High',
        auto_publish: true,
        requires_review: false,
        fetch_interval_minutes: 120
      },
      {
        name: 'World Health Organization (WHO)',
        type: 'rss',
        provider: 'who.int',
        website_url: 'https://www.who.int',
        feed_url: 'https://www.who.int/rss-feeds/news-english.xml',
        default_category: 'Preventive Care',
        trust_score: 'High',
        auto_publish: true,
        requires_review: false,
        fetch_interval_minutes: 180
      },
      {
        name: 'Doctor Mike',
        type: 'youtube',
        provider: 'youtube.com',
        website_url: 'https://www.youtube.com/@DoctorMike',
        feed_url: '',
        youtube_channel_id: 'UC0QHWhjbe5fGJEPz3sVb6nw',
        default_category: 'Wellness',
        trust_score: 'High',
        auto_publish: true,
        requires_review: false,
        fetch_interval_minutes: 360
      },
      {
        name: 'NutritionFacts.org',
        type: 'youtube',
        provider: 'youtube.com',
        website_url: 'https://www.youtube.com/@NutritionFactsOrg',
        feed_url: '',
        youtube_channel_id: 'UCjR_S08Gj044U_zRIdH1hXg',
        default_category: 'Nutrition',
        trust_score: 'High',
        auto_publish: true,
        requires_review: false,
        fetch_interval_minutes: 360
      },
      {
        name: 'Mayo Clinic Health Letter',
        type: 'rss',
        provider: 'mayoclinic.org',
        website_url: 'https://newsnetwork.mayoclinic.org',
        feed_url: 'https://newsnetwork.mayoclinic.org/feed/',
        default_category: 'Diseases & Conditions',
        trust_score: 'High',
        auto_publish: true,
        requires_review: false,
        fetch_interval_minutes: 180
      }
    ];

    for (const src of defaultSources) {
      const existing = await sql`SELECT id FROM content_sources WHERE name = ${src.name}`;
      if (existing.length === 0) {
        await sql`
          INSERT INTO content_sources (
            name, type, provider, website_url, feed_url, youtube_channel_id,
            default_category, trust_score, auto_publish, requires_review, fetch_interval_minutes
          ) VALUES (
            ${src.name}, ${src.type}, ${src.provider}, ${src.website_url}, ${src.feed_url},
            ${src.youtube_channel_id || null}, ${src.default_category}, ${src.trust_score},
            ${src.auto_publish}, ${src.requires_review}, ${src.fetch_interval_minutes}
          );
        `;
      }
    }
    console.log(`✓ Seeded ${defaultSources.length} sources`);

    // 14. Migrate existing original articles into content_items
    console.log('14. Safely backfilling existing articles to unified content_items...');
    const existingArticles = await sql`SELECT * FROM articles WHERE deleted_at IS NULL`;
    let migratedCount = 0;

    for (const art of existingArticles) {
      const existingItem = await sql`SELECT id FROM content_items WHERE slug = ${art.slug}`;
      if (existingItem.length === 0) {
        await sql`
          INSERT INTO content_items (
            id, content_type, title, slug, excerpt, description, canonical_url,
            image_url, author_name, published_at, source_id, status, language,
            category, is_external, is_featured, is_trending, is_breaking, is_verified,
            requires_review, quality_score, relevance_score, created_at, updated_at
          ) VALUES (
            ${art.id}::uuid, 'article', ${art.title}, ${art.slug}, ${art.excerpt}, ${art.excerpt},
            ${'/blog/' + art.slug}, ${art.hero_image_url || null}, ${art.author_name || 'HealthGhuru Editorial Team'},
            ${art.publish_date || new Date().toISOString()}, NULL, ${art.status || 'published'}, 'en',
            ${art.category || 'Wellness'}, FALSE, TRUE, TRUE, FALSE, TRUE,
            FALSE, 95.0, 95.0, ${art.publish_date || new Date().toISOString()}, CURRENT_TIMESTAMP
          );
        `;
        migratedCount++;
      }
    }
    console.log(`✓ Successfully migrated/linked ${migratedCount} existing original articles into content_items!`);

    console.log('--- Migration Completed Successfully ---');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateContentPlatform();
