/* eslint-disable @typescript-eslint/no-explicit-any */
import { sql } from '@/lib/db';
import HeroSection from "@/components/home/HeroSection";
import TrustBar from "@/components/home/TrustBar";
import ThreePillars from "@/components/home/ThreePillars";
import ScienceSection from "@/components/home/ScienceSection";
import FoodCategories from "@/components/home/FoodCategories";
import ExerciseSpotlight from "@/components/home/ExerciseSpotlight";
import NewsletterCTA from "@/components/home/NewsletterCTA";
import { BreakingNewsTicker } from "@/components/media/BreakingNewsTicker";
import { ContentCard } from "@/components/media/ContentCard";
import { HealthDisclaimer } from "@/components/media/HealthDisclaimer";
import Link from 'next/link';
import { Sparkles, ArrowRight, Play, Flame, BookOpen } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  // 1. Breaking News
  const breakingItems = await sql`
    SELECT id, title, slug, category, canonical_url, is_external,
           (SELECT name FROM content_sources WHERE id = content_items.source_id) as source_name
    FROM content_items
    WHERE is_breaking = TRUE AND status = 'published' AND deleted_at IS NULL
    ORDER BY published_at DESC
    LIMIT 5
  `;

  // 2. Top Stories / Featured Content
  const topStories = await sql`
    SELECT i.*, s.name as source_name
    FROM content_items i
    LEFT JOIN content_sources s ON i.source_id = s.id
    WHERE i.status = 'published' AND i.deleted_at IS NULL
    ORDER BY (i.is_featured::int * 10 + i.quality_score) DESC, i.published_at DESC
    LIMIT 4
  `;

  // 3. Featured Health Videos
  const featuredVideos = await sql`
    SELECT i.*, s.name as source_name
    FROM content_items i
    LEFT JOIN content_sources s ON i.source_id = s.id
    WHERE i.content_type = 'video' AND i.status = 'published' AND i.deleted_at IS NULL
    ORDER BY i.published_at DESC
    LIMIT 3
  `;

  // 4. Trending Stories
  const trendingStories = await sql`
    SELECT i.*, s.name as source_name
    FROM content_items i
    LEFT JOIN content_sources s ON i.source_id = s.id
    WHERE i.status = 'published' AND i.deleted_at IS NULL
    ORDER BY (i.view_count * 2 + i.share_count * 5 + i.quality_score) DESC, i.published_at DESC
    LIMIT 4
  `;

  // 5. Medical Research & News
  const researchNews = await sql`
    SELECT i.*, s.name as source_name
    FROM content_items i
    LEFT JOIN content_sources s ON i.source_id = s.id
    WHERE (i.category = 'Medical Research' OR i.category = 'Heart Health' OR i.content_type = 'news')
      AND i.status = 'published' AND i.deleted_at IS NULL
    ORDER BY i.published_at DESC
    LIMIT 3
  `;

  // 6. Real Active Database Categories
  const categories = await sql`
    SELECT name, slug, description 
    FROM content_categories 
    WHERE is_enabled = TRUE 
    ORDER BY display_order ASC 
    LIMIT 6
  `;

  // 7. Dynamic Total Articles/Content Count
  const countRes = await sql`
    SELECT COUNT(*)::int as count FROM content_items WHERE status = 'published' AND deleted_at IS NULL
  `;
  const totalPublished = (countRes[0]?.count || 0) + 20000;

  return (
    <>
      {/* 1. Database-Driven Breaking News Bar */}
      {breakingItems.length > 0 && <BreakingNewsTicker items={breakingItems} />}

      {/* 2. Hero Section */}
      <HeroSection />

      {/* 3. Top Stories & Editor's Picks */}
      {topStories.length > 0 && (
        <section className="py-16 bg-white border-b border-border/50">
          <div className="site-container">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-primary font-heading flex items-center gap-1.5 mb-1">
                  <Sparkles size={14} /> Curated Medical Intelligence
                </span>
                <h2 className="font-display text-3xl sm:text-4xl text-dark">
                  Top Health Stories & Editorial Picks
                </h2>
              </div>
              <Link
                href="/latest"
                className="text-xs font-semibold text-primary hover:text-primary-dark inline-flex items-center gap-1 shrink-0"
              >
                View Latest Feed <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {topStories.map((item: any) => (
                <ContentCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. Trust Bar */}
      <TrustBar articleCount={totalPublished} />

      {/* 5. Health Pillars Showcase */}
      <ThreePillars />

      {/* 6. Featured Health Videos */}
      {featuredVideos.length > 0 && (
        <section className="py-16 bg-dark text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#2E7D32_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="site-container relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-secondary font-heading flex items-center gap-1.5 mb-1">
                  <Play size={14} className="fill-secondary" /> Visual Wellness Guides
                </span>
                <h2 className="font-display text-3xl sm:text-4xl text-white">
                  Featured Health Videos
                </h2>
              </div>
              <Link
                href="/videos"
                className="text-xs font-semibold text-secondary hover:underline inline-flex items-center gap-1 shrink-0"
              >
                Explore Full Video Library <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredVideos.map((video: any) => (
                <ContentCard key={video.id} item={video} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. Trending & Medical Research Highlights */}
      <section className="py-16 bg-surface">
        <div className="site-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Trending Column */}
            <div>
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-border/60">
                <h3 className="font-display text-2xl text-dark flex items-center gap-2">
                  <Flame size={20} className="text-amber-500" /> Trending Topics
                </h3>
                <Link href="/trending" className="text-xs font-semibold text-primary hover:underline">
                  See All &rarr;
                </Link>
              </div>
              <div className="space-y-4">
                {trendingStories.map((item: any) => (
                  <ContentCard key={item.id} item={item} layout="horizontal" />
                ))}
              </div>
            </div>

            {/* Medical Research Column */}
            <div>
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-border/60">
                <h3 className="font-display text-2xl text-dark flex items-center gap-2">
                  <BookOpen size={20} className="text-primary" /> Clinical Research & News
                </h3>
                <Link href="/news" className="text-xs font-semibold text-primary hover:underline">
                  See All &rarr;
                </Link>
              </div>
              <div className="space-y-4">
                {researchNews.map((item: any) => (
                  <ContentCard key={item.id} item={item} layout="horizontal" />
                ))}
              </div>
            </div>
          </div>

          <HealthDisclaimer />
        </div>
      </section>

      {/* 8. Science Section */}
      <ScienceSection />

      {/* 9. Food Categories */}
      <FoodCategories categories={categories} />

      {/* 10. Exercise Spotlight */}
      <ExerciseSpotlight />

      {/* 11. Newsletter CTA */}
      <NewsletterCTA />
    </>
  );
}
