import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Share2, MessageCircle, Link as LinkIcon } from "lucide-react";
import { PillBadge } from "@/components/ui/PillBadge";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { sql } from "@/lib/db";
import { AuthorBioCard } from "@/components/blog/AuthorBioCard";
import { ArticleBodyClientWrapper } from "@/components/blog/ArticleBodyClientWrapper";
import { Metadata } from "next";
import { formatDate } from "@/lib/utils";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const posts = await sql`SELECT title, excerpt FROM articles WHERE slug = ${params.slug} AND status = 'published'`;
  if (posts.length === 0) return { title: "Post Not Found" };
  const post = posts[0];
  
  return {
    title: `${post.title} | HealthGhuru Blog`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const posts = await sql`
    SELECT * FROM articles 
    WHERE slug = ${params.slug} AND status = 'published'
  `;

  if (posts.length === 0) {
    notFound();
  }

  const post = posts[0];
  const publishDate = formatDate(post.publish_date);

  return (
    <article className="pt-32 pb-24 bg-white relative">
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

        {/* Footer actions */}
        <div className="mt-10 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <span className="font-heading text-sm text-text-muted font-medium">Share:</span>
            <button className="article-share-icon w-10 h-10 rounded-full bg-surface-alt flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
              <Share2 size={18} />
            </button>
            <button className="article-share-icon w-10 h-10 rounded-full bg-surface-alt flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
              <MessageCircle size={18} />
            </button>
            <button className="article-share-icon w-10 h-10 rounded-full bg-surface-alt flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
              <LinkIcon size={18} />
            </button>
          </div>
        </div>

      </div>
    </article>
  );
}
