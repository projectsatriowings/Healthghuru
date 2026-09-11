import Link from "next/link";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card } from "@/components/ui/Card";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Apple, Moon, Dumbbell } from "lucide-react";

export default function ThreePillars() {
  const pillars = [
    {
      title: "Nutrition",
      icon: <Apple size={32} className="text-primary mb-4" />,
      description: "We provide nutrition strategies and ideas to help you achieve your objectives, whether you're trying to maintain, lose, or gain weight.",
      link: "/category/nutrition",
    },
    {
      title: "Sleep",
      icon: <Moon size={32} className="text-primary mb-4" />,
      description: "Good sleep is a topic that is often neglected, but it is a very important aspect of our everyday life affecting quality of life in countless ways.",
      link: "/category/sleep",
    },
    {
      title: "Fitness",
      icon: <Dumbbell size={32} className="text-primary mb-4" />,
      description: "Regular physical activity provides immediate and long-term health benefits and enhances overall quality of life regardless of age, sex, or physical ability.",
      link: "/category/fitness",
    },
  ];

  return (
    <section className="section-padding bg-white">
      <div className="site-container">
        <ScrollReveal variant="fadeIn">
          <SectionHeader title="Your Health. Three Pillars." />
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 xl:gap-10 2xl:gap-12 mt-12">
          {pillars.map((pillar, index) => (
            <ScrollReveal key={pillar.title} delay={index * 0.1}>
              <Card className="h-full border-l-[4px] border-l-primary p-8 flex flex-col items-start group">
                <div className="group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300">
                  {pillar.icon}
                </div>
                <h3 className="text-xl font-heading font-semibold text-dark mb-3">{pillar.title}</h3>
                <p className="text-text-secondary leading-relaxed mb-6 flex-grow">{pillar.description}</p>
                <Link
                  href={pillar.link}
                  data-cursor="text"
                  className="inline-flex items-center text-primary font-heading font-medium hover:text-primary-dark transition-colors group"
                >
                  Learn More <span className="ml-1 group-hover:translate-x-1 transition-transform">&rarr;</span>
                </Link>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
