"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, Search, ChevronRight, Home, Newspaper, FileText, Video, BookOpen, HeartPulse, PenTool, Sparkles, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const NAV_ICONS: Record<string, React.ReactNode> = {
  "/": <Home size={18} />,
  "/news": <Newspaper size={18} />,
  "/articles": <FileText size={18} />,
  "/videos": <Video size={18} />,
  "/magazines": <BookOpen size={18} />,
  "/stay-healthy": <HeartPulse size={18} />,
  "/blog": <PenTool size={18} />,
};

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  if (pathname === '/login' || pathname === '/subscribe') {
    return null;
  }

  return (
    <>
      <header
        className={cn(
          "sticky top-0 left-0 w-full z-50 transition-all duration-300",
          "bg-white border-b",
          scrolled
            ? "border-primary/20 shadow-[0_4px_20px_rgba(26,46,26,0.08)] py-3 sm:py-3.5"
            : "border-primary/10 shadow-[0_2px_10px_rgba(0,0,0,0.04)] py-3.5 sm:py-4 lg:py-5"
        )}
      >
        <div className="site-container">
          <div className="flex items-center justify-between gap-3 sm:gap-6">
            
            {/* Logo */}
            <Link
              href="/"
              className="flex-shrink-0 flex items-center transition-transform hover:scale-[1.02] active:scale-[0.98]"
              aria-label="HealthGhuru Home"
            >
              <div className="relative w-44 sm:w-56 md:w-64 h-12 sm:h-14 md:h-16 flex items-center">
                <Image
                  src="/images/logo_transparent.png"
                  alt="HealthGhuru Logo"
                  fill
                  sizes="(max-width: 640px) 176px, (max-width: 768px) 224px, 256px"
                  className="object-contain object-left"
                  priority
                />
              </div>
            </Link>

            {/* Desktop Navigation (visible on lg and above) */}
            <nav className="hidden lg:flex items-center gap-5 xl:gap-8" aria-label="Main Navigation">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "font-heading font-semibold text-sm xl:text-[15px] tracking-wide transition-colors relative py-2 whitespace-nowrap",
                      isActive
                        ? "text-primary font-bold"
                        : "text-text-primary hover:text-primary"
                    )}
                  >
                    {link.label}
                    {/* Active / Hover underline indicator */}
                    <span
                      className={cn(
                        "absolute -bottom-0.5 left-0 w-full h-[2.5px] rounded-full transform origin-left transition-transform duration-300",
                        isActive ? "scale-x-100 bg-primary" : "scale-x-0 group-hover:scale-x-100 bg-primary/70"
                      )}
                    />
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Actions & Buttons */}
            <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
              {/* Search Icon */}
              <Link
                href="/search"
                aria-label="Search HealthGhuru"
                className="p-2.5 sm:p-3 rounded-full text-text-primary hover:text-primary hover:bg-surface transition-colors flex items-center justify-center"
              >
                <Search size={20} />
              </Link>

              {/* Login Button (desktop / tablet) */}
              <Link href="/login" className="hidden sm:inline-block">
                <span className="inline-flex items-center justify-center px-5 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-heading font-semibold text-primary border border-primary/30 rounded-full hover:bg-primary/5 hover:border-primary/50 active:scale-95 transition-all">
                  Login
                </span>
              </Link>

              {/* Subscribe Button (desktop / tablet) */}
              <Link href="/subscribe" className="hidden sm:inline-block">
                <span className="inline-flex items-center justify-center gap-1.5 px-5 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-heading font-semibold text-white bg-gradient-to-r from-accent to-[#ff8a57] rounded-full shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all">
                  Subscribe &rarr;
                </span>
              </Link>

              {/* Mobile / Tablet Menu Toggle Button */}
              <button
                className="lg:hidden p-2.5 sm:p-3 rounded-xl bg-surface border border-primary/20 text-text-primary hover:text-primary hover:border-primary/40 active:scale-95 transition-all flex items-center justify-center shadow-2xs"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X size={22} className="text-primary font-bold" /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Drawer (Solid Opaque White Background) */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="lg:hidden bg-white border-b border-primary/20 shadow-2xl absolute top-full left-0 w-full z-50"
            >
              <div className="site-container py-5 flex flex-col gap-4 max-h-[calc(100vh-5rem)] overflow-y-auto bg-white">
                
                {/* Search Bar in Mobile Menu */}
                <Link
                  href="/search"
                  className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-surface border border-primary/15 text-text-secondary text-xs font-medium hover:border-primary/30 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Search size={15} className="text-primary" />
                    <span>Search articles, videos, conditions...</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-primary font-heading">
                    Explore
                  </span>
                </Link>

                {/* Navigation Link List */}
                <nav className="flex flex-col gap-1.5" aria-label="Mobile Navigation">
                  {NAV_LINKS.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                          "flex items-center justify-between px-3.5 py-3 rounded-xl font-heading text-sm transition-all",
                          isActive
                            ? "bg-primary text-white font-bold shadow-xs"
                            : "bg-surface/60 hover:bg-surface text-text-primary hover:text-primary font-semibold"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                            isActive ? "bg-white/20 text-white" : "bg-white text-primary shadow-2xs border border-primary/10"
                          )}>
                            {NAV_ICONS[link.href] || <FileText size={16} />}
                          </span>
                          <span>{link.label}</span>
                        </div>
                        <ChevronRight size={16} className={isActive ? "text-white" : "text-text-muted"} />
                      </Link>
                    );
                  })}
                </nav>

                {/* Mobile Auth & Subscription CTAs */}
                <div className="pt-3 border-t border-border flex flex-col gap-2.5">
                  <Link href="/login" className="w-full">
                    <span className="w-full flex items-center justify-center py-3 text-sm font-heading font-semibold text-primary bg-surface border border-primary/30 rounded-xl hover:bg-primary/10 transition-all">
                      Login to Account
                    </span>
                  </Link>
                  <Link href="/subscribe" className="w-full">
                    <span className="w-full flex items-center justify-center gap-2 py-3 text-sm font-heading font-semibold text-white bg-gradient-to-r from-accent to-[#ff8a57] rounded-xl shadow-md hover:shadow-lg active:scale-98 transition-all">
                      <Sparkles size={16} /> Subscribe for Free &rarr;
                    </span>
                  </Link>
                </div>

                {/* Footer Micro-links in Mobile Menu */}
                <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-text-muted font-medium px-1">
                  <div className="flex items-center gap-3">
                    <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
                    <span>•</span>
                    <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
                    <span>•</span>
                    <Link href="/about" className="hover:text-primary transition-colors">About</Link>
                  </div>
                  <span className="flex items-center gap-1 text-primary font-semibold">
                    <ShieldCheck size={13} /> HealthGhuru
                  </span>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Dimmed Backdrop overlay when mobile menu is open */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-dark/40 backdrop-blur-xs z-40 lg:hidden"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
    </>
  );
}
