import 'dotenv/config';
import { RssSourceAdapter } from '../src/lib/ingestion/adapters/rss';
import { AtomSourceAdapter } from '../src/lib/ingestion/adapters/atom';
import { validateSafeUrl } from '../src/lib/ingestion/ssrf';
import {
  normalizeCanonicalUrl,
  sanitizePlainText,
  generateSlug,
  parsePublicationDate,
  createExcerpt
} from '../src/lib/ingestion/normalize';
import { calculateDiceSimilarity } from '../src/lib/ingestion/dedupe';
import { classifyContent } from '../src/lib/ingestion/classify';
import { calculateScores } from '../src/lib/ingestion/scoring';
import { SourceConfig, NormalizedContentItem } from '../src/lib/ingestion/types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('Running Health Content Platform Automated Test Suite');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function test(name: string, fn: () => void | Promise<void>) {
    try {
      fn();
      console.log(`✓ PASS: ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`✗ FAIL: ${name}`);
      console.error(`  Error: ${err.message}`);
      failed++;
    }
  }

  // --- 1. SSRF Firewall Tests ---
  test('SSRF Firewall blocks localhost and loopback', () => {
    assert(!validateSafeUrl('http://localhost:3000/feed').isValid, 'Should block localhost');
    assert(!validateSafeUrl('http://127.0.0.1/rss').isValid, 'Should block 127.0.0.1');
    assert(!validateSafeUrl('http://[::1]/feed').isValid, 'Should block IPv6 loopback');
  });

  test('SSRF Firewall blocks RFC 1918 private subnets and cloud metadata', () => {
    assert(!validateSafeUrl('http://10.0.0.1/api').isValid, 'Should block 10.x.x.x');
    assert(!validateSafeUrl('http://172.16.5.10/rss').isValid, 'Should block 172.16.x.x');
    assert(!validateSafeUrl('http://192.168.1.1/feed').isValid, 'Should block 192.168.x.x');
    assert(!validateSafeUrl('http://169.254.169.254/latest/meta-data').isValid, 'Should block AWS metadata');
    assert(!validateSafeUrl('http://metadata.google.internal/computeMetadata').isValid, 'Should block GCP metadata');
  });

  test('SSRF Firewall permits valid public HTTPS URLs', () => {
    const valid = validateSafeUrl('https://www.who.int/rss-feeds/news-english.xml');
    assert(valid.isValid, 'Should permit valid public HTTPS domain');
    assert(valid.safeUrl === 'https://www.who.int/rss-feeds/news-english.xml', 'Safe URL matches');
  });

  // --- 2. URL Normalization & Text Sanitization ---
  test('Canonical URL normalization strips tracking parameters', () => {
    const raw = 'https://news.example.com/article?utm_source=twitter&utm_medium=social&fbclid=12345&v=important#comments';
    const clean = normalizeCanonicalUrl(raw);
    assert(!clean.includes('utm_source'), 'Should remove utm_source');
    assert(!clean.includes('fbclid'), 'Should remove fbclid');
    assert(!clean.includes('#comments'), 'Should remove hash fragment');
    assert(clean.includes('v=important'), 'Should retain functional parameter v');
  });

  test('HTML and Entity Sanitization cleans tags and unescapes entities', () => {
    const raw = '<p>Regular exercise &amp; <strong>proper sleep</strong> can reduce stress by &gt; 50%.</p>';
    const clean = sanitizePlainText(raw);
    assert(clean === 'Regular exercise & proper sleep can reduce stress by > 50%.', 'Sanitized text matches');
  });

  test('Slug generation produces safe alphanumeric hyphenated slugs', () => {
    const title = 'Cardiovascular Health: 5 Breakthrough Diet Tips!';
    const slug = generateSlug(title);
    assert(slug.startsWith('cardiovascular-health-5-breakthrough-diet-tips'), 'Generates correct slug');
    assert(!/[^a-z0-9-]/.test(slug), 'Contains no invalid characters');
  });

  test('Excerpt creation truncates cleanly at word boundaries', () => {
    const longText = 'The human microbiome plays an indispensable role in maintaining systemic immune homeostasis, metabolic regulation, neurodevelopment, and nutrient synthesis across diverse mammalian biological models.';
    const excerpt = createExcerpt(longText, 80);
    assert(excerpt.length <= 85, 'Excerpt satisfies max target length');
    assert(excerpt.endsWith('...'), 'Excerpt appends ellipsis');
  });

  // --- 3. RSS 2.0 XML Parsing ---
  test('RSS 2.0 Parser extracts items with media enclosures and dates', () => {
    const sampleRss = `<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:media="http://search.yahoo.com/mrss/">
      <channel>
        <title>Medical News Daily</title>
        <link>https://medicalnewsdaily.com</link>
        <item>
          <title><![CDATA[New Findings on Vitamin D and Bone Density]]></title>
          <link>https://medicalnewsdaily.com/article-123?utm_source=rss</link>
          <guid>med-123</guid>
          <pubDate>Mon, 08 Sep 2025 10:00:00 GMT</pubDate>
          <dc:creator>Dr. Jane Foster</dc:creator>
          <description><![CDATA[A randomized clinical trial demonstrates significant benefits of Vitamin D3.]]></description>
          <media:content url="https://images.example.com/vitamind.jpg" type="image/jpeg" />
          <category>Nutrition</category>
        </item>
      </channel>
    </rss>`;

    const adapter = new RssSourceAdapter();
    const dummySource: SourceConfig = {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Medical News Daily',
      type: 'rss',
      enabled: true,
      autoPublish: true,
      requiresReview: false,
      priority: 5,
      trustScore: 'High',
      fetchIntervalMinutes: 60,
    };

    const items = adapter.parseRssXml(sampleRss, dummySource);
    assert(items.length === 1, 'Extracted 1 item');
    assert(items[0].title === 'New Findings on Vitamin D and Bone Density', 'Title parsed correctly');
    assert(items[0].externalId === 'med-123', 'GUID parsed correctly');
    assert(items[0].authorName === 'Dr. Jane Foster', 'dc:creator author parsed');
    assert(items[0].imageUrl === 'https://images.example.com/vitamind.jpg', 'media:content image parsed');
    assert(!items[0].canonicalUrl.includes('utm_source'), 'Canonical URL cleaned');
  });

  // --- 4. Atom 1.0 XML Parsing ---
  test('Atom 1.0 Parser extracts alternate links and authors', () => {
    const sampleAtom = `<?xml version="1.0" encoding="utf-8"?>
    <feed xmlns="http://www.w3.org/2005/Atom">
      <title>Global Health Reports</title>
      <entry>
        <id>urn:uuid:1225c695-cfb8-4ebb-aaaa-80da344efa6a</id>
        <title>Early Detection Strategies for Hypertension</title>
        <link rel="alternate" href="https://globalhealth.org/reports/hypertension?utm_campaign=feed" />
        <published>2025-09-08T12:00:00Z</published>
        <author>
          <name>World Health Experts</name>
        </author>
        <summary>Clinical guidelines regarding regular arterial blood pressure monitoring.</summary>
        <category term="Heart Health" />
      </entry>
    </feed>`;

    const adapter = new AtomSourceAdapter();
    const dummySource: SourceConfig = {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Global Health Reports',
      type: 'atom',
      enabled: true,
      autoPublish: true,
      requiresReview: false,
      priority: 5,
      trustScore: 'High',
      fetchIntervalMinutes: 60,
    };

    const items = adapter.parseAtomXml(sampleAtom, dummySource);
    assert(items.length === 1, 'Extracted 1 atom entry');
    assert(items[0].title === 'Early Detection Strategies for Hypertension', 'Title parsed');
    assert(items[0].authorName === 'World Health Experts', 'Author parsed');
    assert(items[0].canonicalUrl === 'https://globalhealth.org/reports/hypertension', 'Alternate link parsed without utm');
  });

  // --- 5. Deduplication Similarity Tests ---
  test('Dice coefficient detects string similarity between identical or near-identical headlines', () => {
    const s1 = 'New clinical trial shows Mediterranean diet reduces cardiovascular disease risk';
    const s2 = 'New clinical trial shows Mediterranean diet reduces cardiovascular disease risks';
    const s3 = 'Breakthrough insomnia treatment improves circadian melatonin rhythm';

    const sim1 = calculateDiceSimilarity(s1, s2);
    const sim2 = calculateDiceSimilarity(s1, s3);

    assert(sim1 > 0.95, `Identical variations have high similarity (got ${sim1})`);
    assert(sim2 < 0.40, `Unrelated stories have low similarity (got ${sim2}) and remain well below 0.85 threshold`);
  });

  // --- 6. Health Taxonomy Classification ---
  test('Deterministic classification assigns proper category based on health keywords', () => {
    const heartRes = classifyContent('High Blood Pressure and Arterial Health: Reducing LDL Cholesterol');
    assert(heartRes.primaryCategory === 'Heart Health', `Classified as Heart Health (got ${heartRes.primaryCategory})`);

    const mentalRes = classifyContent('Mindfulness meditation strategies to reduce cortisol and chronic anxiety');
    assert(mentalRes.primaryCategory === 'Mental Health', `Classified as Mental Health (got ${mentalRes.primaryCategory})`);

    const sleepRes = classifyContent('Circadian biology and melatonin: overcoming severe insomnia at bedtime');
    assert(sleepRes.primaryCategory === 'Sleep', `Classified as Sleep (got ${sleepRes.primaryCategory})`);
  });

  // --- 7. Quality & Trust Scoring ---
  test('Quality scoring awards verified sources and penalizes duplicates', () => {
    const highSource: SourceConfig = {
      id: '1',
      name: 'NIH',
      type: 'rss',
      trustScore: 'High',
      enabled: true,
      autoPublish: true,
      requiresReview: false,
      priority: 1,
      fetchIntervalMinutes: 60,
    };

    const item: NormalizedContentItem = {
      externalId: 'test-1',
      title: 'Evidence-Based Nutrition',
      slug: 'evidence-based-nutrition',
      canonicalUrl: 'https://nih.gov/nutrition',
      imageUrl: 'https://images.example.com/food.jpg',
      authorName: 'Dr. Smith',
      description: 'A detailed exploration of micronutrient density and longevity across cohorts over twenty years.',
      publishedAt: new Date(),
      contentType: 'article',
      isExternal: true,
    };

    const score = calculateScores(item, highSource, 80, 0.0);
    assert(score.qualityScore >= 75, `High authority item receives high quality score (got ${score.qualityScore})`);

    const duplicateScore = calculateScores(item, highSource, 80, 0.95);
    assert(duplicateScore.qualityScore < score.qualityScore, 'High duplicate probability reduces quality score');
  });

  console.log(`\n====================================================`);
  console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`====================================================`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
