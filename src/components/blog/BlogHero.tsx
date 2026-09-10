import { SectionHeader } from "@/components/ui/SectionHeader";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import Link from "next/link";

export default function BlogHero() {
  return (
    <section className="bg-surface min-h-[50vh] flex items-center pt-24 pb-12">
      <div className="site-container">
        <ScrollReveal variant="fadeUp" className="text-center">
          <SectionHeader
            title="Wellness Knowledge Base"
            subtitle="Explore our library of expert-reviewed articles on nutrition, fitness, sleep, and mental health."
            titleClassName="blog-hero-h1"
          />
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-text-secondary font-heading">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span>&rarr;</span>
            <span className="text-primary font-medium">Blog</span>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
