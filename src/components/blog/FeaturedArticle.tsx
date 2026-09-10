/* eslint-disable @typescript-eslint/no-explicit-any */
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { PillBadge } from "@/components/ui/PillBadge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";

export default function FeaturedArticle({ post }: { post?: any }) {
  if (!post) return null;
  
  const publishDate = formatDate(post.publish_date);

  return (
    <div className="py-8">
      <Card className="flex flex-col lg:flex-row overflow-hidden group h-full cursor-pointer p-0" hoverEffect={false}>
        {/* Left: Image */}
        <div className="w-full lg:w-[55%] relative aspect-[16/9] lg:aspect-auto overflow-hidden">
          <Image
            src={post.hero_image_url || post.image_url || "/images/nutrition_pillar.png"}
            alt={post.hero_image_alt || post.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>

        {/* Right: Content */}
        <div className="w-full lg:w-[45%] p-8 lg:p-12 flex flex-col items-start justify-center bg-white relative z-10 transition-transform duration-300 group-hover:-translate-y-1 lg:group-hover:translate-y-0 lg:group-hover:-translate-x-1 shadow-[-10px_0_30px_rgba(0,0,0,0.05)] lg:rounded-l-3xl -mt-6 lg:mt-0">
          
          <div className="flex items-center gap-3 mb-6">
            <span className="font-heading text-xs font-bold text-accent tracking-widest bg-accent-light px-3 py-1 rounded-full uppercase">
              Featured
            </span>
            <PillBadge active={false}>{post.category}</PillBadge>
          </div>

          <h2 className="font-display text-3xl lg:text-4xl text-dark mb-4 leading-tight group-hover:text-primary transition-colors">
            {post.title}
          </h2>

          <p className="text-text-secondary text-lg leading-relaxed mb-8 line-clamp-3">
            {post.excerpt}
          </p>

          <Link href={`/blog/${post.slug}`} className="mb-8">
            <Button variant="primary">Read Article &rarr;</Button>
          </Link>

          <div className="mt-auto pt-6 border-t border-border flex items-center gap-4 w-full">
            <div className="w-10 h-10 rounded-full bg-primary/20 relative overflow-hidden shrink-0">
              <Image 
                src={post.author_avatar || "/images/fitness_pillar.png"} 
                alt={post.author_name || "Author"} 
                fill 
                className="object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-semibold text-sm text-dark">{post.author_name || "Dr. Sarah Jenkins"}</span>
              <span suppressHydrationWarning className="text-text-muted text-xs">{publishDate} · {post.read_time} min read</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
