/* eslint-disable @typescript-eslint/no-explicit-any */
import Image from "next/image";
import Link from "next/link";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Leaf, Apple, Heart, Brain, Moon, Sparkles, Activity } from "lucide-react";

const CATEGORY_IMAGE_MAP: Record<string, { image: string; icon: any }> = {
  nutrition: { image: "/images/nutrition_pillar.png", icon: Leaf },
  fitness: { image: "/images/fitness_pillar.png", icon: Activity },
  "mental-health": { image: "/images/mental_health_pillar.png", icon: Brain },
  sleep: { image: "/images/sleep_pillar.png", icon: Moon },
  "heart-health": { image: "/images/exercise_push.png", icon: Heart },
  "preventive-care": { image: "/images/nutrition_pillar.png", icon: Sparkles },
  "gut-health": { image: "/images/nutrition_pillar.png", icon: Apple },
  "healthy-aging": { image: "/images/fitness_pillar.png", icon: Sparkles },
};

export default function FoodCategories({ categories }: { categories?: any[] }) {
  // If database categories are passed, display the top 3-4, otherwise fallback to standard taxonomy
  const displayCategories = categories && categories.length > 0 
    ? categories.slice(0, 3).map((c) => {
        const meta = CATEGORY_IMAGE_MAP[c.slug] || { image: "/images/nutrition_pillar.png", icon: Leaf };
        return {
          name: c.name,
          slug: c.slug,
          icon: meta.icon,
          image: meta.image,
        };
      })
    : [
        { name: "Nutrition", slug: "nutrition", icon: Leaf, image: "/images/nutrition_pillar.png" },
        { name: "Gut Health", slug: "gut-health", icon: Apple, image: "/images/nutrition_pillar.png" },
        { name: "Heart Health", slug: "heart-health", icon: Heart, image: "/images/exercise_push.png" },
      ];

  return (
    <section className="section-padding bg-white">
      <div className="site-container">
        <ScrollReveal variant="fadeIn">
          <SectionHeader 
            eyebrow="Taxonomy & Topics"
            title="For Well-Rounded Guidance for Your Health and Well-Being" 
            subtitle="Explore our verified, peer-reviewed health topics and comprehensive clinical categories."
          />
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 xl:gap-8 2xl:gap-10 mt-12">
          {displayCategories.map((category, index) => {
            const Icon = category.icon;
            return (
              <ScrollReveal key={category.name} delay={index * 0.1}>
                <Link
                  href={`/category/${category.slug}`}
                  className="group block relative w-full aspect-[4/5] rounded-[16px] overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300"
                >
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark/85 via-dark/25 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-300" />
                  <div className="absolute bottom-6 left-0 w-full text-center px-4">
                    <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md text-white font-heading font-semibold px-6 py-2.5 rounded-full border border-white/30 text-base sm:text-lg group-hover:-translate-y-1 transition-transform duration-300 shadow-sm">
                      {category.name} <Icon size={18} />
                    </span>
                  </div>
                </Link>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
