import Image from "next/image";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

import { Leaf, Apple, Milk } from "lucide-react";

export default function FoodCategories() {
  const categories = [
    {
      name: "Vegetable",
      icon: Leaf,
      image: "/images/nutrition_pillar.png",
    },
    {
      name: "Fruit",
      icon: Apple,
      image: "/images/nutrition_pillar.png",
    },
    {
      name: "Dairy",
      icon: Milk,
      image: "/images/nutrition_pillar.png",
    },
  ];

  return (
    <section className="section-padding bg-white">
      <div className="site-container">
        <ScrollReveal variant="fadeIn">
          <SectionHeader title="For Well-Rounded Guidance for Your Health and Well-Being" />
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 xl:gap-8 2xl:gap-10 mt-12">
          {categories.map((category, index) => (
            <ScrollReveal key={category.name} delay={index * 0.1}>
              <div className="group relative w-full aspect-[4/5] rounded-[16px] overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-shadow duration-300">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-dark/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
                <div className="absolute bottom-6 left-0 w-full text-center">
                  <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md text-white font-heading font-semibold px-6 py-2 rounded-full border border-white/30 text-lg group-hover:-translate-y-1 transition-transform duration-300">
                    {category.name} <category.icon size={18} />
                  </span>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
