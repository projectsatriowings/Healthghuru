"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { PillBadge } from "@/components/ui/PillBadge";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Sparkles, Apple, Moon, Dumbbell, Star } from "lucide-react";

export default function HeroSection() {
  const headline = "Live Better.\nFeel Stronger.\nEvery Day.".split("\n");

  return (
    <section className="relative flex items-center py-8 sm:py-14 lg:py-20 overflow-hidden">
      {/* Background SVG pattern */}
      <div className="absolute inset-y-0 left-0 w-1/2 opacity-[0.04] pointer-events-none z-0 bg-[url('/images/leaf-pattern.svg')] bg-repeat" />

      <div className="site-container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-8 xl:gap-16 2xl:gap-24 items-center">
          
          {/* Left Content */}
          <div className="flex flex-col items-start gap-5 sm:gap-6 max-w-2xl xl:max-w-3xl 2xl:max-w-4xl">
            <ScrollReveal variant="slideLeft">
              <PillBadge active className="hero-eyebrow-pill mb-1 sm:mb-2 gap-2"><Sparkles size={16} /> Science-Backed Wellness</PillBadge>
            </ScrollReveal>

            <h1 className="hero-headline font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl 2xl:text-8xl text-dark leading-[1.15]">
              {headline.map((line, index) => (
                <motion.span
                  key={index}
                  className="block"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 + 0.2, duration: 0.6 }}
                >
                  {line}
                </motion.span>
              ))}
            </h1>

            <ScrollReveal delay={0.5}>
              <p className="hero-subtext text-text-secondary text-lg 2xl:text-xl max-w-lg xl:max-w-2xl">
                Expert-reviewed articles on Nutrition, Sleep, Fitness and Mental Health — personalized for your journey.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.6}>
              <div className="flex flex-wrap gap-3 py-2">
                <Link href="/category/nutrition">
                  <motion.div whileHover={{ scale: 1.05 }} className="hero-floating-badges bg-white rounded-full font-heading shadow-sm text-primary flex items-center gap-2 cursor-pointer hover:shadow-md transition-shadow">
                    <Apple size={16} /> Nutrition
                  </motion.div>
                </Link>
                <Link href="/category/sleep">
                  <motion.div whileHover={{ scale: 1.05 }} className="hero-floating-badges bg-white rounded-full font-heading shadow-sm text-primary flex items-center gap-2 cursor-pointer hover:shadow-md transition-shadow">
                    <Moon size={16} /> Sleep
                  </motion.div>
                </Link>
                <Link href="/category/fitness">
                  <motion.div whileHover={{ scale: 1.05 }} className="hero-floating-badges bg-white rounded-full font-heading shadow-sm text-primary flex items-center gap-2 cursor-pointer hover:shadow-md transition-shadow">
                    <Dumbbell size={16} /> Fitness
                  </motion.div>
                </Link>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.7} className="mt-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/latest" className="w-full sm:w-auto">
                  <Button variant="primary" size="lg" className="hero-cta-primary w-full sm:w-auto">Explore Wellness &rarr;</Button>
                </Link>
                <Link href="/blog" className="w-full sm:w-auto">
                  <Button variant="ghost" size="lg" className="hero-cta-secondary w-full sm:w-auto">Read Our Blog</Button>
                </Link>
              </div>
              <p className="mt-4 text-sm text-text-muted font-medium tracking-wide flex items-center gap-1.5">
                <Star size={16} className="text-yellow-500 fill-yellow-500" /> 20,000+ expert-reviewed articles
              </p>
            </ScrollReveal>
          </div>

          {/* Right Visual */}
          <div className="relative w-full aspect-[4/5] lg:aspect-[3/4] max-w-lg xl:max-w-xl 2xl:max-w-2xl mx-auto lg:ml-auto">
            <ScrollReveal delay={0.3} className="w-full h-full relative rounded-[24px] overflow-hidden shadow-2xl">
              <Image
                src="/images/fitness_pillar.png"
                alt="Wellness Lifestyle"
                fill
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/40 to-transparent" />
            </ScrollReveal>

            {/* Floating Stat Card 1 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8, type: "spring", stiffness: 100 }}
              className="absolute top-2 right-2 sm:-top-6 sm:-right-6 lg:-right-10 xl:-right-12 bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-lg sm:shadow-xl border border-primary/10 max-w-[140px] sm:max-w-[180px] xl:max-w-[200px]"
            >
              <div className="text-xl sm:text-3xl font-mono text-accent font-bold mb-0.5 sm:mb-1">20K+</div>
              <div className="text-xs sm:text-sm font-heading text-text-primary leading-tight">Expert-reviewed Articles</div>
            </motion.div>

            {/* Floating Stat Card 2 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.9, type: "spring", stiffness: 100 }}
              className="absolute bottom-2 left-2 sm:-bottom-8 sm:-left-6 lg:-left-10 xl:-left-12 bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-lg sm:shadow-xl border border-primary/10 max-w-[150px] sm:max-w-[200px] xl:max-w-[220px]"
            >
              <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs sm:text-base">✓</div>
                <div className="text-lg sm:text-2xl font-mono text-primary font-bold">100%</div>
              </div>
              <div className="text-xs sm:text-sm font-heading text-text-primary leading-tight">Science-Backed Content</div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
