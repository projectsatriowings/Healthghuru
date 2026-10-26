import React from "react";
import Image from "next/image";
import Link from "next/link";
import { BlogPost } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { PillBadge } from "@/components/ui/PillBadge";

interface BlogCardProps {
  post: BlogPost;
  image: string;
}

export const BlogCard = React.memo(function BlogCard({ post, image }: BlogCardProps) {
  return (
    <Card className="h-full flex flex-col overflow-hidden group p-0">
      <Link href={`/blog/${post.slug}`} className="flex-grow flex flex-col">
        <div className="relative w-full aspect-[16/9] overflow-hidden shrink-0">
          <Image
            src={image}
            alt={post.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        
        <div className="p-6 flex flex-col flex-grow items-start bg-white z-10 transition-transform duration-300 group-hover:-translate-y-2 rounded-t-2xl -mt-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <div className="mb-4">
            <PillBadge active={false}>{post.category}</PillBadge>
          </div>
          
          <h3 className="blog-card-title font-display text-xl leading-snug text-dark mb-3 group-hover:text-primary transition-colors">
            {post.title}
          </h3>
          
          <p className="blog-card-excerpt text-text-secondary text-sm leading-relaxed mb-6 line-clamp-2 flex-grow">
            {post.excerpt}
          </p>
          
          <div className="blog-card-meta w-full pt-4 border-t border-border flex items-center justify-between text-xs text-text-muted mt-auto font-medium tracking-wide">
            <span>{post.date}</span>
            <span className="flex items-center gap-1">
              {post.readTime}
            </span>
          </div>
        </div>
      </Link>
    </Card>
  );
});
