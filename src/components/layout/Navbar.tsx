"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  if (pathname === '/login' || pathname === '/subscribe') {
    return null;
  }

  return (
    <header
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-300",
        scrolled
          ? "bg-white/90 backdrop-blur-[20px] border-b border-primary/20 py-3 shadow-sm"
          : "bg-transparent py-5"
      )}
    >
      <div className="site-container">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 z-50 transition-transform hover:scale-105">
            <div className="relative w-40 h-14 sm:h-16 -ml-2 md:ml-0">
              <Image
                src="/images/logo_transparent.png"
                alt="HealthGhuru Logo"
                fill
                className="object-contain object-left"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "font-heading font-medium text-sm transition-colors relative group py-2",
                    scrolled ? "text-text-primary hover:text-primary" : "text-dark hover:text-primary",
                    isActive && "text-primary"
                  )}
                >
                  {link.label}
                  {/* Active / Hover underline indicator */}
                  <span
                    className={cn(
                      "absolute bottom-0 left-0 w-full h-[2px] transform origin-left transition-transform duration-300",
                      isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                      "bg-primary"
                    )}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/search"
              aria-label="Search HealthGhuru"
              className={cn(
                "p-2.5 rounded-full transition-colors",
                scrolled ? "hover:bg-surface text-dark" : "hover:bg-white/10 text-dark"
              )}
            >
              <Search size={19} />
            </Link>
            <Link href="/login">
              <Button variant="ghost" className={cn(
                scrolled ? "border-primary text-primary" : "border-primary text-primary hover:bg-primary/10"
              )}>
                Login
              </Button>
            </Link>
            <Link href="/subscribe">
              <Button variant="primary">
                Subscribe &rarr;
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <Link
              href="/search"
              aria-label="Search"
              className="p-2 text-text-primary hover:text-primary transition-colors"
            >
              <Search size={22} />
            </Link>
            <button
              className="z-50 p-2 rounded-md transition-colors text-text-primary"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden overflow-hidden bg-white border-b border-primary/10 shadow-lg absolute top-full left-0 w-full"
          >
            <div className="px-4 py-6 flex flex-col gap-6">
              <nav className="flex flex-col gap-4">
                {NAV_LINKS.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "mobile-nav-link border-b border-gray-100",
                        isActive ? "text-primary" : "text-text-primary"
                      )}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
              
              <div className="flex flex-col gap-3 pt-2 mt-auto">
                <Link href="/login" className="w-full">
                  <Button variant="secondary" className="w-full justify-center min-h-[52px] text-base">
                    Login
                  </Button>
                </Link>
                <Link href="/subscribe" className="w-full">
                  <Button variant="primary" className="w-full justify-center min-h-[52px] text-base">
                    Subscribe &rarr;
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
