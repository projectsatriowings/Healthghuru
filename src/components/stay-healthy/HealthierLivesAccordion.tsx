"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { cn } from "@/lib/utils";

const accordionData = [
  {
    title: "Why consuming a range of meals is important",
    content: "A varied diet ensures you get a wide range of essential nutrients, vitamins, and minerals needed for optimal health. Different foods provide different health benefits, and a diverse diet helps prevent nutritional deficiencies."
  },
  {
    title: "What advantages come from eating fruits and vegetables",
    content: "Fruits and vegetables are rich in vitamins, minerals, and antioxidants. They help lower blood pressure, reduce the risk of heart disease and stroke, prevent some types of cancer, and have a positive effect on blood sugar."
  },
  {
    title: "Is consuming little amounts of fats and oils healthy",
    content: "Yes, healthy fats are essential for brain health, hormone production, and absorbing fat-soluble vitamins (A, D, E, K). Focus on unsaturated fats like olive oil, avocados, and nuts while limiting saturated and trans fats."
  }
];

export default function HealthierLivesAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleOpen = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="section-padding bg-surface-alt">
      <div className="site-container-narrow">
        <ScrollReveal variant="fadeIn">
          <SectionHeader title="Creating Healthier Lives" />
        </ScrollReveal>

        <div className="mt-12 flex flex-col gap-4">
          {accordionData.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <ScrollReveal key={index} delay={index * 0.1}>
                <div 
                  className={cn(
                    "bg-white rounded-xl shadow-sm border border-primary/10 overflow-hidden transition-all duration-300",
                    isOpen ? "shadow-md ring-1 ring-primary/20" : "hover:shadow-md"
                  )}
                >
                  <button
                    onClick={() => toggleOpen(index)}
                    className="w-full px-6 py-5 flex items-center justify-between focus:outline-none"
                  >
                    <span className="font-heading font-semibold text-left text-lg text-dark pr-4">
                      {item.title}
                    </span>
                    <span className="text-primary shrink-0 transition-transform duration-300">
                      {isOpen ? <X size={24} /> : <Plus size={24} />}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <div className="px-6 pb-5 pt-0 text-text-secondary leading-relaxed">
                          <div className="h-[1px] w-full bg-border mb-4" />
                          {item.content}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
