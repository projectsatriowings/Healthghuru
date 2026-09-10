"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { MapPin, Phone, MessageCircle, Share2, Globe, Send, Mail, Heart, Sparkles, Compass, ShieldCheck, HeartPulse } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";

export default function Footer() {
  const pathname = usePathname();

  if (pathname === '/login' || pathname === '/subscribe') {
    return null;
  }

  const socialVariants = {
    hover: { scale: 1.15, y: -2, transition: { duration: 0.2 } },
    tap: { scale: 0.95 },
  };

  const linkVariants = {
    hover: { x: 4, color: "#66BB6A", transition: { duration: 0.2 } },
  };

  return (
    <footer className="bg-dark text-white pt-12 sm:pt-14 pb-8 border-t border-primary/20 overflow-hidden">
      <div className="site-container">
        
        {/* Main 4-Column Grid with Animated Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 mb-10">
          
          {/* Column 1: Brand & Logo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col items-start gap-3.5"
          >
            {/* Seamless dark-mode logo (no white box) */}
            <Link
              href="/"
              className="inline-block transition-transform hover:scale-[1.02] active:scale-[0.98]"
              aria-label="HealthGhuru Home"
            >
              <div className="relative w-40 sm:w-48 h-16 sm:h-20 flex items-center">
                <Image
                  src="/images/logo_white.png"
                  alt="HealthGhuru Logo"
                  fill
                  sizes="(max-width: 640px) 160px, 192px"
                  className="object-contain object-left"
                />
              </div>
            </Link>

            <p className="font-heading text-sm font-semibold text-white/95 flex items-center gap-1.5">
              <Sparkles size={14} className="text-secondary" /> Live Better. Feel Stronger.
            </p>
            <p className="text-white/70 text-xs leading-relaxed max-w-xs">
              Science-backed wellness covering Nutrition, Sleep, Fitness and Mental Health. 20,000+ expert-reviewed guides.
            </p>

            {/* Social Links with Hover Animation */}
            <div className="flex items-center gap-2.5 text-white/75 pt-1">
              {[
                { icon: <Globe size={15} />, label: "Website", href: "#" },
                { icon: <MessageCircle size={15} />, label: "Community", href: "#" },
                { icon: <Share2 size={15} />, label: "Share", href: "#" },
                { icon: <Send size={15} />, label: "Telegram", href: "#" },
              ].map((item, index) => (
                <motion.a
                  key={index}
                  href={item.href}
                  aria-label={item.label}
                  variants={socialVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 hover:text-white flex items-center justify-center transition-colors shadow-sm"
                >
                  {item.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Column 2: Explore Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col gap-3"
          >
            <h4 className="font-heading font-bold text-sm uppercase tracking-wider text-white mb-1 flex items-center gap-2">
              <Compass size={16} className="text-secondary" /> Explore
            </h4>
            <nav className="flex flex-col gap-2 text-xs font-medium">
              {NAV_LINKS.map((link) => (
                <motion.div key={link.href} variants={linkVariants} whileHover="hover">
                  <Link
                    href={link.href}
                    className="text-white/75 hover:text-secondary transition-colors inline-flex items-center gap-1.5 group py-0.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary/40 group-hover:bg-secondary transition-colors" />
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div variants={linkVariants} whileHover="hover">
                <Link
                  href="/about"
                  className="text-white/75 hover:text-secondary transition-colors inline-flex items-center gap-1.5 group py-0.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary/40 group-hover:bg-secondary transition-colors" />
                  About Us
                </Link>
              </motion.div>
            </nav>
          </motion.div>

          {/* Column 3: Health Pillars & Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col gap-3"
          >
            <h4 className="font-heading font-bold text-sm uppercase tracking-wider text-white mb-1 flex items-center gap-2">
              <HeartPulse size={16} className="text-secondary" /> Health Pillars
            </h4>
            <nav className="flex flex-col gap-2 text-xs font-medium">
              {[
                { label: "Nutrition & Diet", href: "/category/nutrition" },
                { label: "Fitness & Movement", href: "/category/fitness" },
                { label: "Sleep & Recovery", href: "/category/sleep" },
                { label: "Mental Health", href: "/category/mental-health" },
                { label: "Trending Stories", href: "/trending" },
                { label: "Latest Updates", href: "/latest" },
              ].map((item) => (
                <motion.div key={item.href} variants={linkVariants} whileHover="hover">
                  <Link
                    href={item.href}
                    className="text-white/75 hover:text-secondary transition-colors inline-flex items-center gap-1.5 group py-0.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary/40 group-hover:bg-secondary transition-colors" />
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>

          {/* Column 4: Contact & Subscribe */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col gap-3"
          >
            <h4 className="font-heading font-bold text-sm uppercase tracking-wider text-white mb-1 flex items-center gap-2">
              <ShieldCheck size={16} className="text-secondary" /> Contact Us
            </h4>
            
            <div className="flex items-start gap-2.5 text-white/75 text-xs">
              <MapPin className="text-secondary shrink-0 mt-0.5" size={15} />
              <p className="leading-relaxed">
                No.1A, Gurudev Complex,<br />
                57th Street, Korattur,<br />
                Chennai – 600 080
              </p>
            </div>

            <div className="flex items-center gap-2.5 text-white/75 text-xs">
              <Phone className="text-secondary shrink-0" size={15} />
              <a href="tel:+918825948859" className="hover:text-white transition-colors">+91 88259 48859</a>
            </div>

            <div className="flex items-center gap-2.5 text-white/75 text-xs">
              <Mail className="text-secondary shrink-0" size={15} />
              <a href="mailto:contact@healthghuru.com" className="hover:text-white transition-colors">contact@healthghuru.com</a>
            </div>

            {/* Quick CTA with Hover Scale */}
            <div className="pt-2">
              <Link href="/subscribe" className="w-full inline-block">
                <motion.span
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-heading font-semibold text-white bg-gradient-to-r from-accent to-[#ff8a57] rounded-full shadow-md hover:shadow-lg transition-all"
                >
                  Subscribe for Free &rarr;
                </motion.span>
              </Link>
            </div>
          </motion.div>

        </div>

        {/* Medical Disclaimer Strip */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="border-t border-white/10 pt-4 pb-4 text-[11px] text-white/50 leading-relaxed"
        >
          <p>
            <strong className="text-secondary font-semibold">Medical Disclaimer:</strong> The articles, videos, and wellness guides on HealthGhuru are intended for informational and educational purposes only and do not constitute professional medical advice, diagnosis, or treatment. Always consult your physician or qualified healthcare provider.
          </p>
        </motion.div>

        {/* Bottom Bar: Copyright & Working Legal Links */}
        <div className="border-t border-white/10 pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-white/55 gap-3">
          <p className="flex items-center gap-1">
            Copyright &copy; {new Date().getFullYear()} Healthghuru. Made with <Heart size={12} className="text-rose-500 fill-rose-500" /> for healthier lives.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
