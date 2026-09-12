import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Share2, MessageCircle, Link as LinkIcon } from "lucide-react";
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

  const posts = await sql`
    SELECT * FROM articles 
    WHERE slug = ${params.slug} AND status = 'published'
  `;

  let post;
  
  if (posts.length === 0) {
    if (params.slug === 'boost-immune-system') {
      post = {
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

  return (
    <article className="pt-8 sm:pt-12 pb-24 bg-white relative">
      <div className="max-w-[760px] mx-auto px-4 sm:px-6">
        
        {/* Breadcrumbs */}
        <ScrollReveal variant="fadeIn">
          <div className="flex items-center gap-2 text-sm text-text-muted font-heading mb-6">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
            <span>/</span>
            <span className="text-text-primary truncate">{post.title}</span>
          </div>
        </ScrollReveal>

        {/* Header */}
        <ScrollReveal variant="fadeUp" delay={0.1}>
          <div className="mb-6">
            <PillBadge active className="article-category-pill">{post.category}</PillBadge>
          </div>
          <h1 className="article-h1 font-display text-4xl sm:text-5xl lg:text-[56px] leading-[1.1] text-dark mb-8">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 py-6 border-t border-b border-border mb-10">
            <div className="w-12 h-12 rounded-full relative overflow-hidden bg-surface-alt shrink-0">
              <Image 
                src={post.author_avatar || "/images/exercise_plank.png"} 
                alt={post.author_name || "Author"} 
                fill 
                className="object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="article-byline-name font-heading font-semibold text-text-primary">{post.author_name}</span>
              <span suppressHydrationWarning className="article-byline-meta text-text-muted text-sm">
                {post.author_credential && <span className="text-primary mr-2 font-medium">{post.author_credential}</span>}
                {publishDate} · {post.read_time} min read
              </span>
            </div>
          </div>
        </ScrollReveal>

        {/* Hero Image */}
        <ScrollReveal variant="scaleUp" delay={0.2} className="mb-12">
          <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden shadow-lg">
            <Image
              src={post.hero_image_url || "/images/exercise_push.png"}
              alt={post.hero_image_alt || post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
          {post.hero_image_alt && (
            <p className="text-sm text-center mt-3 italic text-text-muted">
              {post.hero_image_alt}
            </p>
          )}
        </ScrollReveal>

        {/* Article Body */}
        <ScrollReveal variant="fadeIn" delay={0.3}>
          <p className="text-[20px] text-text-secondary leading-relaxed mb-10 font-medium">
            {post.excerpt}
          </p>
          
          <ArticleBodyClientWrapper blocks={post.blocks || []} />
          
        </ScrollReveal>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-12 flex gap-2 flex-wrap">
            {post.tags.map((tag: string) => (
              <PillBadge key={tag} active={false} className="text-xs py-1">
                {tag}
              </PillBadge>
            ))}
          </div>
        )}

        {/* Author Bio Card */}
        <AuthorBioCard 
          name={post.author_name}
          avatarUrl={post.author_avatar || "/images/exercise_plank.png"}
          credential={post.author_credential}
          bio="Specializing in holistic health and preventative care, dedicated to helping people live their healthiest lives through evidence-based lifestyle changes."
        />

        {/* In-Article Sponsor Ad */}
        <SidebarAd category={post.category} className="my-10" />

        {/* Footer actions */}
        <div className="mt-10 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <span className="font-heading text-sm text-text-muted font-medium">Share:</span>
            <ShareActions title={post.title} />
            <SaveArticleButton articleId={post.id} />
          </div>
        </div>

        {/* Discussion Thread */}
        <ScrollReveal variant="fadeIn" delay={0.4}>
          <DiscussionThread 
            articleId={post.id} 
            isLoggedIn={isLoggedIn} 
            isAdmin={isAdmin} 
          />
        </ScrollReveal>

      </div>
    </article>
  );
}
