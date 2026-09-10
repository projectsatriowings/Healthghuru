import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card } from "@/components/ui/Card";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SIX_TIPS } from "@/lib/constants";

export default function SixTips() {
  return (
    <section className="section-padding bg-white">
      <div className="site-container">
        <ScrollReveal variant="fadeIn">
          <SectionHeader title="Tips for Staying Healthy" />
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-10 2xl:gap-12 mt-12">
          {SIX_TIPS.map((tip, index) => (
            <ScrollReveal key={index} delay={index * 0.1}>
              <Card className="h-full p-8 flex flex-col items-start gap-4">
                <span className="font-mono text-5xl text-primary font-bold opacity-30">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="font-heading text-lg font-medium text-text-primary leading-relaxed">
                  {tip}
                </p>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
