import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export default function ScienceSection() {
  const points = [
    "Each of our 20,000+ articles is checked by a medical subject matter expert",
    "Our advice is current and research-based",
    "Medical credibility and social impact are all evaluated",
    "We establish high standards for quality, research, and openness"
  ];

  return (
    <section className="section-padding bg-surface-alt overflow-hidden">
      <div className="site-container">
        <div className="flex flex-col lg:flex-row gap-16 xl:gap-20 2xl:gap-24 items-center">
          
          {/* Left: Image */}
          <div className="w-full lg:w-[45%] relative">
            <ScrollReveal variant="slideRight" className="relative w-full aspect-[4/5] rounded-[24px] overflow-hidden shadow-2xl">
              <Image
                src="/images/mental_health_pillar.png"
                alt="Yoga and Science"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent opacity-80" />
            </ScrollReveal>

            {/* Floating Badge */}
            <ScrollReveal delay={0.4} variant="scaleUp" className="absolute -bottom-6 -right-6 lg:-right-12 z-10">
              <div className="bg-primary text-white rounded-full px-6 py-3 font-heading font-semibold text-sm shadow-xl border-4 border-surface-alt flex items-center gap-2">
                Medical Expert Verified <CheckCircle2 size={18} />
              </div>
            </ScrollReveal>
          </div>

          {/* Right: Content */}
          <div className="w-full lg:w-[55%]">
            <ScrollReveal variant="slideLeft">
              <SectionHeader
                eyebrow="TRUSTED HEALTH CONTENT"
                title="We Believe in Science"
                centered={false}
                className="mb-8"
              />
              
              <ul className="space-y-6">
                {points.map((point, index) => (
                  <li key={index} className="flex items-start gap-4">
                    <CheckCircle2 className="text-primary shrink-0 mt-1" size={24} />
                    <span className="text-lg text-text-secondary leading-relaxed font-body">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            </ScrollReveal>
          </div>

        </div>
      </div>
    </section>
  );
}
