"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import Link from "next/link";
import { EXERCISE_DATA } from "@/lib/constants";

export default function ExerciseSpotlight() {
  return (
    <section className="section-padding bg-gradient-dark overflow-hidden">
      <div className="site-container">
        <ScrollReveal variant="fadeIn">
          <SectionHeader title="Explore the Best Exercises" light />
        </ScrollReveal>

        {/* Grid Layout Row */}
        <div className="mt-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8 pb-8 pt-4">
            {EXERCISE_DATA.map((exercise, index) => (
              <Link key={exercise.name} href="/category/fitness" className="block w-full">
                <motion.div
                  className="w-full relative rounded-2xl overflow-hidden shadow-2xl group cursor-pointer"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="aspect-[3/4] relative w-full">
                    <Image
                      src={exercise.image}
                      alt={exercise.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/40 to-transparent opacity-90" />
                    
                    <div className="absolute top-4 left-4">
                      <span className="bg-accent text-dark text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                        Recommended
                      </span>
                    </div>

                    <div className="absolute bottom-0 left-0 w-full p-6 flex flex-col items-start">
                      <h3 className="font-display text-white text-3xl mb-2">{exercise.name}</h3>
                      <p className="text-white/70 font-body text-sm line-clamp-3 mb-4 leading-relaxed">
                        {exercise.description}
                      </p>
                      <span data-cursor="text" className="text-accent font-heading font-medium text-sm group-hover:text-white transition-colors flex items-center gap-1">
                        Learn More <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                      </span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
