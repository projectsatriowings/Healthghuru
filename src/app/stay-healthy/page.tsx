/* eslint-disable @typescript-eslint/no-explicit-any */
import { Metadata } from "next";
import StayHeroSection from "@/components/stay-healthy/StayHeroSection";
import SixTips from "@/components/stay-healthy/SixTips";
import ContentPillar from "@/components/stay-healthy/ContentPillar";
import FiveExercises from "@/components/stay-healthy/FiveExercises";
import SleepRisks from "@/components/stay-healthy/SleepRisks";
import HealthierLivesAccordion from "@/components/stay-healthy/HealthierLivesAccordion";
import MentalHealthEditorial from "@/components/stay-healthy/MentalHealthEditorial";
import { sql } from "@/lib/db";
import { ContentCard } from "@/components/media/ContentCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { HealthDisclaimer } from "@/components/media/HealthDisclaimer";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Stay Healthy | HealthGhuru — Evidence-Based Wellness Pillars",
  description: "Evidence-based tips, scientific guides, and practical strategies for Nutrition, Fitness, Mental Health, and Sleep.",
};

export default async function StayHealthyPage() {
  const pillarGuides = await sql`
    SELECT i.*, s.name as source_name
    FROM content_items i
    LEFT JOIN content_sources s ON i.source_id = s.id
    WHERE i.category IN ('Nutrition', 'Fitness', 'Mental Health', 'Sleep')
      AND i.status = 'published' AND i.deleted_at IS NULL
    ORDER BY i.published_at DESC
    LIMIT 4
  `;

  return (
    <>
      <StayHeroSection />
      <SixTips />

      {/* Content Pillars */}
      <ContentPillar
        label="NUTRITION"
        title="Fuel Your Body Right"
        body="We provide nutrition strategies and ideas to help you achieve your objectives, whether you're trying to maintain, lose, or gain weight."
        bulletPoints={[
          "Eat more filling foods",
          "Plan meals in advance",
          "Find physical activities you enjoy",
          "Manage your stress",
          "Supplement your strategies"
        ]}
        imageUrl="/images/nutrition_pillar.png"
        imageAlt="Healthy Food"
        ctaText="Read Nutrition Articles →"
        ctaHref="/category/nutrition"
      />

      <ContentPillar
        label="FITNESS"
        title="Move Your Body, Change Your Life"
        body="Regular physical activity provides immediate and long-term health benefits and enhances overall quality of life."
        bulletPoints={[
          "Reduces the risk of diseases",
          "Improves mental health",
          "Increases muscle and bone health",
          "Increases energy levels",
          "Lowers excess weight"
        ]}
        imageUrl="/images/fitness_pillar.png"
        imageAlt="Fitness Workout"
        reversed
        ctaText="Explore Workouts →"
        ctaHref="/category/fitness"
        className="bg-surface-alt"
      />

      <ContentPillar
        label="MENTAL HEALTH"
        title="A Healthy Mind is Everything"
        body="Emotional, psychological, and social wellbeing all fall under the category of mental health. It influences our thoughts, feelings, and actions."
        bulletPoints={[
          "Value yourself",
          "Take care of your body",
          "Surround yourself with good people",
          "Learn how to deal with stress",
          "Avoid alcohol and other drugs",
          "Set realistic goals"
        ]}
        imageUrl="/images/mental_health_pillar.png"
        imageAlt="Mental Wellbeing"
        ctaText="Mental Health Guide →"
        ctaHref="/category/mental-health"
      />

      <ContentPillar
        label="SLEEP"
        title="Rest is Not a Luxury"
        body="Good sleep is a very important aspect of our everyday life. Sleep affects our quality of life in many ways."
        bulletPoints={[
          "Lower your risk for serious health problems",
          "Reduce stress and improve your mood",
          "Get along better with people",
          "Stay at a healthy weight"
        ]}
        imageUrl="/images/sleep_pillar.png"
        imageAlt="Good Sleep"
        reversed
        ctaText="Improve Your Sleep →"
        ctaHref="/category/sleep"
        className="bg-surface-alt"
      />

      {/* Database-Driven Recent Pillar Guides */}
      {pillarGuides.length > 0 && (
        <section className="py-16 bg-white border-t border-b border-border/50">
          <div className="site-container">
            <ScrollReveal>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary font-heading flex items-center gap-1.5 mb-1">
                    <Sparkles size={14} /> Live Research & Guides
                  </span>
                  <SectionHeader
                    title="Featured Pillar Guides"
                    subtitle="Latest clinical advice and evidence-based articles fetched directly from medical authorities."
                  />
                </div>
                <Link
                  href="/latest"
                  className="text-xs font-semibold text-primary hover:text-primary-dark inline-flex items-center gap-1 shrink-0"
                >
                  View All Feeds <ArrowRight size={14} />
                </Link>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {pillarGuides.map((item: any) => (
                <ContentCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      <HealthierLivesAccordion />
      <FiveExercises />
      <MentalHealthEditorial />
      <SleepRisks />

      <div className="site-container pb-16">
        <HealthDisclaimer />
      </div>
    </>
  );
}
