/* eslint-disable @typescript-eslint/no-explicit-any */
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Clock, Sparkles, BookOpen, ArrowRight, CheckCircle2 } from "lucide-react";
import { PillBadge } from "@/components/ui/PillBadge";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { sql } from "@/lib/db";
import { AuthorBioCard } from "@/components/blog/AuthorBioCard";
import { ArticleBodyClientWrapper } from "@/components/blog/ArticleBodyClientWrapper";
import { SidebarAd } from "@/components/ads/SidebarAd";
import { Metadata } from "next";
import { formatDate } from "@/lib/utils";
import { SaveArticleButton } from "@/components/community/SaveArticleButton";
import { ShareActions } from "@/components/community/ShareActions";
import { DiscussionThread } from "@/components/community/DiscussionThread";
import { auth } from "@/lib/auth/auth.config";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const posts = await sql`SELECT title, excerpt FROM articles WHERE slug = ${params.slug} AND status = 'published'`;
  
  let post;
  if (posts.length === 0) {
    if (params.slug === 'boost-immune-system') {
      post = { title: "Boost Your Immune System Naturally", excerpt: "Your immune system is your body's defense network. These 8 natural strategies will make it stronger." };
    } else if (params.slug === 'sleep-quality-guide') {
      post = { title: "Why Sleep Quality Matters More Than Sleep Quantity", excerpt: "Eight hours of bad sleep is worse than six hours of deep, restorative sleep. Here's what the science says." };
    } else {
      return { title: "Post Not Found" };
    }
  } else {
    post = posts[0];
  }
  
  return {
    title: `${post.title} | HealthGhuru Blog`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const isAdmin = session?.user?.role === 'admin';

  const [posts, relatedQuery] = await Promise.all([
    sql`
      SELECT * FROM articles 
      WHERE slug = ${params.slug} AND status = 'published'
    `,
    sql`
      SELECT id, title, slug, category, hero_image_url, read_time, publish_date
      FROM articles
      WHERE slug != ${params.slug} AND status = 'published' AND deleted_at IS NULL
      ORDER BY publish_date DESC
      LIMIT 3
    `
  ]);

  let post;
  
  if (posts.length === 0) {
    if (params.slug === 'boost-immune-system') {
      post = {
        id: 'boost-immune-system',
        title: "Boost Your Immune System Naturally: Effective Strategies for Optimal Health",
        category: "Nutrition",
        excerpt: "Your immune system is your body's defense network. These 8 natural strategies will make it stronger.",
        author_name: "Dr. Sarah Jenkins",
        author_credential: "MD, Nutrition",
        publish_date: new Date().toISOString(),
        read_time: 5,
        hero_image_url: "/images/nutrition_pillar.png",
        blocks: [
          { id: '1', type: 'paragraph', text: 'In today\'s fast-paced world, maintaining a strong immune system is more critical than ever. While supplements are popular, the foundation of true immune resilience lies in our daily habits, particularly our nutrition.' },
          { id: '2', type: 'heading', level: 2, text: '1. Plant-Based Proteins' },
          { id: '3', type: 'paragraph', text: 'LivePure Organic Superfoods provides an excellent source of clean, plant-based proteins that contain essential amino acids needed for immune cell production.' },
          { id: '4', type: 'tip_callout', icon: 'leaf', text: 'Mix your plant-based protein with a source of Vitamin C (like berries) to increase nutrient absorption.' },
          { id: '5', type: 'heading', level: 2, text: '2. Daily Greens and Antioxidants' },
          { id: '6', type: 'paragraph', text: 'Antioxidants combat free radicals. Consuming daily greens can reduce oxidative stress and keep your immune system functioning optimally. Make sure to get at least 3 servings of leafy greens a day.' }
        ],
        tags: ["Immunity", "Nutrition", "Superfoods"]
      };
    } else if (params.slug === 'sleep-quality-guide') {
      post = {
        id: 'sleep-quality-guide',
        title: "Why Sleep Quality Matters More Than Sleep Quantity",
        category: "Sleep",
        excerpt: "Eight hours of bad sleep is worse than six hours of deep, restorative sleep. Here's what the science says.",
        author_name: "Dr. Michael Chen",
        author_credential: "PhD, Sleep Medicine",
        publish_date: new Date().toISOString(),
        read_time: 6,
        hero_image_url: "/images/sleep_pillar.png",
        blocks: [
          { id: '1', type: 'paragraph', text: 'For decades, we\'ve been told to get 8 hours of sleep. But modern research shows that the quality of those hours matters far more than the quantity.' },
          { id: '2', type: 'heading', level: 2, text: 'The Stages of Sleep' },
          { id: '3', type: 'paragraph', text: 'Your body goes through multiple stages of sleep. The deep, slow-wave sleep is where physical restoration occurs, while REM sleep is crucial for cognitive function and emotional regulation.' },
          { id: '4', type: 'tip_callout', icon: 'moon', text: 'Try taking magnesium 30 minutes before bed to improve deep sleep cycles.' },
          { id: '5', type: 'heading', level: 2, text: 'Improving Sleep Architecture' },
          { id: '6', type: 'paragraph', text: 'To get better sleep, focus on light exposure. Get bright sunlight in the morning, and avoid blue light from screens at least 2 hours before bed.' }
        ],
        tags: ["Sleep", "Recovery", "Wellness"]
      };
    } else {
      notFound();
    }
  } else {
    post = posts[0];
  }

  const publishDate = formatDate(post.publish_date);

  // Fallback related posts if database is empty
  const relatedPosts = relatedQuery.length > 0 ? relatedQuery : [
    {
      id: 'fallback-1',
      title: params.slug === 'boost-immune-system' ? "Why Sleep Quality Matters More Than Sleep Quantity" : "Boost Your Immune System Naturally: Effective Strategies for Optimal Health",
      slug: params.slug === 'boost-immune-system' ? 'sleep-quality-guide' : 'boost-immune-system',
      category: params.slug === 'boost-immune-system' ? 'Sleep' : 'Nutrition',
      hero_image_url: params.slug === 'boost-immune-system' ? '/images/sleep_pillar.png' : '/images/nutrition_pillar.png',
      read_time: 6,
      publish_date: new Date().toISOString()
    }
  ];

  // Extract headings for Table of Contents
  const headings = (post.blocks || [])
    .filter((b: any) => b.type === 'heading')
    .map((b: any) => b.text);

  return (
    <article className="pt-6 sm:pt-10 pb-24 bg-white relative">
      <div className="site-container-article">
        
        {/* Breadcrumbs */}
        <ScrollReveal variant="fadeIn">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-text-muted font-heading mb-6 overflow-hidden">
            <Link href="/" className="hover:text-primary transition-colors shrink-0">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-primary transition-colors shrink-0">Blog</Link>
            <span>/</span>
            <span className="text-text-primary truncate">{post.title}</span>
          </div>
        </ScrollReveal>

        {/* 2-Column Responsive Layout: Content on Left (8-cols), Sticky Sidebar on Right (4-cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-14 items-start">
          
          {/* ========================================================= */}
          {/* MAIN ARTICLE CONTENT (LEFT 8 COLUMNS)                     */}
          {/* ========================================================= */}
          <div className="lg:col-span-8 min-w-0">
            
            {/* Header */}
            <ScrollReveal variant="fadeUp" delay={0.05}>
              <div className="mb-4">
                <PillBadge active className="article-category-pill">{post.category}</PillBadge>
              </div>
              <h1 className="article-h1 font-display text-3xl sm:text-4xl lg:text-5xl 2xl:text-[54px] leading-[1.15] text-dark mb-6 tracking-tight">
                {post.title}
              </h1>

              <div className="flex items-center gap-4 py-5 border-t border-b border-border mb-8">
                <div className="w-12 h-12 rounded-full relative overflow-hidden bg-surface-alt shrink-0 border border-primary/20">
                  <Image 
                    src={post.author_avatar || "/images/exercise_plank.png"} 
                    alt={post.author_name || "Author"} 
                    fill 
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="article-byline-name font-heading font-semibold text-text-primary text-sm sm:text-base">{post.author_name}</span>
                  <span suppressHydrationWarning className="article-byline-meta text-text-muted text-xs sm:text-sm flex items-center gap-1.5">
                    {post.author_credential && <span className="text-primary font-medium">{post.author_credential} •</span>}
                    {publishDate} · {post.read_time} min read
                  </span>
                </div>
              </div>
            </ScrollReveal>

            {/* Hero Image */}
            <ScrollReveal variant="scaleUp" delay={0.1} className="mb-10">
              <div className="relative w-full aspect-[16/9] rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg border border-border/50">
                <Image
                  src={post.hero_image_url || "/images/exercise_push.png"}
                  alt={post.hero_image_alt || post.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              {post.hero_image_alt && (
                <p className="text-xs sm:text-sm text-center mt-3 italic text-text-muted">
                  {post.hero_image_alt}
                </p>
              )}
            </ScrollReveal>

            {/* Article Body */}
            <ScrollReveal variant="fadeIn" delay={0.15}>
              <p className="text-lg sm:text-xl text-text-secondary leading-relaxed mb-8 font-medium border-l-4 border-primary/40 pl-4 py-1 italic bg-surface/40 rounded-r-xl">
                {post.excerpt}
              </p>
              
              <div className="prose-lg max-w-none">
                <ArticleBodyClientWrapper blocks={post.blocks || []} />
              </div>
            </ScrollReveal>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-10 flex gap-2 flex-wrap items-center">
                <span className="text-xs font-heading font-semibold text-text-muted mr-1">Tags:</span>
                {post.tags.map((tag: string) => (
                  <PillBadge key={tag} active={false} className="text-xs py-1">
                    #{tag}
                  </PillBadge>
                ))}
              </div>
            )}

            {/* Author Bio Card */}
            <div className="mt-10">
              <AuthorBioCard 
                name={post.author_name}
                avatarUrl={post.author_avatar || "/images/exercise_plank.png"}
                credential={post.author_credential}
                bio="Specializing in holistic health and preventative care, dedicated to helping people live their healthiest lives through evidence-based lifestyle changes."
              />
            </div>

            {/* In-Article Sponsor Ad */}
            <SidebarAd category={post.category} className="my-10" />

            {/* Footer actions */}
            <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                <span className="font-heading text-xs sm:text-sm text-text-muted font-medium">Share article:</span>
                <ShareActions title={post.title} />
              </div>
              <SaveArticleButton articleId={post.id} />
            </div>

            {/* Discussion Thread */}
            <div className="mt-12">
              <ScrollReveal variant="fadeIn" delay={0.2}>
                <DiscussionThread 
                  articleId={post.id} 
                  isLoggedIn={isLoggedIn} 
                  isAdmin={isAdmin} 
                />
              </ScrollReveal>
            </div>

          </div>

          {/* ========================================================= */}
          {/* RIGHT RAIL / STICKY EDITORIAL SIDEBAR (RIGHT 4 COLUMNS)   */}
          {/* ========================================================= */}
          <aside className="hidden lg:block lg:col-span-4 sticky top-28 space-y-6">
            
            {/* 1. Medical Accuracy / Fact Check Seal */}
            <div className="bg-emerald-50/70 rounded-2xl p-5 border border-emerald-200/60 shadow-xs">
              <div className="flex items-center gap-2.5 text-emerald-800 font-heading font-bold text-sm mb-2">
                <ShieldCheck size={18} className="text-emerald-600" />
                <span>Medically Reviewed</span>
              </div>
              <p className="text-xs text-emerald-950/80 leading-relaxed mb-3">
                All health guides on HealthGhuru adhere to evidence-based medical consensus and clinical research publications.
              </p>
              <div className="flex items-center gap-2 text-[11px] text-emerald-700 font-medium">
                <CheckCircle2 size={13} />
                <span>Verified by Medical Review Board</span>
              </div>
            </div>

            {/* 2. Table of Contents (if article has headings) */}
            {headings.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-border shadow-xs">
                <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-dark flex items-center gap-2 mb-4">
                  <BookOpen size={16} className="text-primary" />
                  In This Article
                </h3>
                <nav className="space-y-2.5 text-xs">
                  {headings.map((h: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 group cursor-pointer text-text-secondary hover:text-primary transition-colors">
                      <span className="font-mono text-primary/70 font-semibold shrink-0 mt-0.5">0{idx + 1}.</span>
                      <span className="leading-snug">{h}</span>
                    </div>
                  ))}
                </nav>
              </div>
            )}

            {/* 3. Related Health Reads */}
            <div className="bg-white rounded-2xl p-6 border border-border shadow-xs">
              <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-dark flex items-center gap-2 mb-4">
                <Sparkles size={16} className="text-accent" />
                Related Articles
              </h3>
              <div className="space-y-4">
                {relatedPosts.map((rel: any) => (
                  <Link
                    key={rel.id || rel.slug}
                    href={`/blog/${rel.slug}`}
                    className="group flex gap-3 items-center hover:bg-surface p-2 rounded-xl transition-all"
                  >
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-surface-alt shrink-0 border border-border/50">
                      <Image
                        src={rel.hero_image_url || "/images/nutrition_pillar.png"}
                        alt={rel.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                        {rel.category}
                      </span>
                      <h4 className="text-xs font-heading font-semibold text-dark line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                        {rel.title}
                      </h4>
                      <span className="text-[11px] text-text-muted flex items-center gap-1 mt-0.5">
                        <Clock size={11} /> {rel.read_time || 5} min read
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* 4. Weekly Newsletter Subscription */}
            <div className="bg-gradient-to-br from-[#1A2E1A] to-[#0D1F0D] text-white rounded-2xl p-6 shadow-md border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="p-1 rounded bg-secondary/20 text-secondary">
                  <Sparkles size={14} />
                </span>
                <span className="text-xs font-mono uppercase tracking-wider text-secondary font-bold">
                  Health Intelligence
                </span>
              </div>
              <h4 className="font-display text-lg text-white mb-2">
                Get Weekly Wellness Dispatches
              </h4>
              <p className="text-xs text-white/80 leading-relaxed mb-4">
                Join 50,000+ proactive individuals receiving science-backed nutritional protocols.
              </p>
              <div className="space-y-2">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
                />
                <button
                  type="button"
                  className="w-full py-2 px-3 rounded-xl bg-secondary text-[#0D1F0D] font-heading font-bold text-xs hover:bg-[#7cd480] transition-colors shadow-sm flex items-center justify-center gap-1"
                >
                  Subscribe Free <ArrowRight size={13} />
                </button>
              </div>
            </div>

          </aside>

        </div>

      </div>
    </article>
  );
}
