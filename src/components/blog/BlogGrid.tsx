/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { BlogCard } from "./BlogCard";
import CategoryFilter from "./CategoryFilter";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const blogImages = [
  "/images/yoga.webp", // sun salutation
  "/images/nutrition_pillar.webp", // nutrient timing
  "/images/fitness_pillar.webp", // abs
  "/images/mental_health_pillar.webp", // yoga mental health
  "/images/sleep_pillar.webp", // boost immune
];

export default function BlogGrid({ posts }: { posts: any[] }) {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredPosts = posts.filter(post => 
    activeCategory === "All" || post.category === activeCategory
  );

  return (
    <div className="w-full">
      <ScrollReveal variant="fadeIn">
        <CategoryFilter onCategoryChange={setActiveCategory} />
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        {filteredPosts.map((post, index) => {
          return (
            <ScrollReveal key={post.slug || index} delay={index * 0.1}>
              <BlogCard post={post} image={post.hero_image_url || post.image_url || blogImages[index % blogImages.length]} />
            </ScrollReveal>
          );
        })}
      </div>
      
      {filteredPosts.length === 0 && (
        <div className="text-center py-12 text-text-muted">
          No articles found for this category.
        </div>
      )}
    </div>
  );
}
