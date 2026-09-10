import { SectionHeader } from "@/components/ui/SectionHeader";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import Link from "next/link";

export default function StayHeroSection() {
  return (
    <section className="bg-surface min-h-[60vh] flex items-center pt-24 pb-16">
      <div className="site-container">
        <ScrollReveal variant="fadeUp" className="text-center">
          <SectionHeader
            eyebrow="YOUR WELLNESS JOURNEY"
            title="Stay Healthy"
            subtitle="Evidence-based tips and strategies for a longer, healthier life."
          />
          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-text-secondary font-heading">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span>&rarr;</span>
            <span className="text-primary font-medium">Stay Healthy</span>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
