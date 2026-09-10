"use client";

import { Button } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Mail } from "lucide-react";

export default function NewsletterCTA() {
  return (
    <section className="bg-gradient-primary py-20 relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/3 w-96 h-96 bg-dark opacity-10 rounded-full blur-3xl pointer-events-none" />

      <div className="site-container-narrow relative z-10 text-center">
        <ScrollReveal variant="fadeUp">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm text-white mb-6">
            <Mail size={32} />
          </div>
          <h2 className="font-display text-4xl md:text-5xl 2xl:text-6xl text-white mb-6">
            Join 5,000+ Health Enthusiasts
          </h2>
          <p className="text-white/90 text-lg md:text-xl 2xl:text-2xl font-body max-w-2xl 2xl:max-w-3xl mx-auto mb-10 leading-relaxed">
            Get personalized health content, expert tips, and exclusive resources delivered straight to your inbox every week.
          </p>
          
          <form className="flex flex-col sm:flex-row gap-4 max-w-lg 2xl:max-w-xl mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="Enter your email address" 
              required
              className="flex-grow px-6 py-4 rounded-full text-text-primary focus:outline-none focus:ring-4 focus:ring-white/30 shadow-inner"
            />
            <Button variant="accent" size="lg" className="w-full sm:w-auto shadow-xl">
              Subscribe Now
            </Button>
          </form>
          <p className="text-white/60 text-sm mt-4">We care about your data in our privacy policy.</p>
        </ScrollReveal>
      </div>
    </section>
  );
}
