import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card } from "@/components/ui/Card";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SLEEP_RISKS } from "@/lib/constants";
import * as Icons from "lucide-react";

export default function SleepRisks() {
  return (
    <section className="section-padding bg-accent-light">
      <div className="site-container">
        <ScrollReveal variant="fadeIn">
          <SectionHeader title="The Hidden Risks of Poor Sleep" />
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 xl:gap-8 mt-12">
          {SLEEP_RISKS.map((risk, index) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const IconComponent = (Icons as any)[risk.icon];
            
            return (
              <ScrollReveal key={risk.title} delay={index * 0.1}>
                <Card className="h-full p-6 relative group overflow-hidden">
                  <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-red-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                  
                  {IconComponent && (
                    <div className="mb-4 text-red-700/80 group-hover:text-red-600 transition-colors">
                      <IconComponent size={32} />
                    </div>
                  )}
                  
                  <h3 className="font-heading font-bold text-dark mb-3 pr-4 leading-tight">
                    {risk.title}
                  </h3>
                  
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {risk.description}
                  </p>
                </Card>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
