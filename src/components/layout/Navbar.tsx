"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300 bg-white/95 backdrop-blur-[20px] border-b border-primary/15 shadow-sm",
          scrolled ? "py-2 sm:py-2.5" : "py-2.5 sm:py-3"
        )}
      >
        <div className="site-container">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="flex-shrink-0 z-50 transition-transform hover:scale-105 outline-none focus:outline-none focus:ring-0 focus-visible:outline-none active:outline-none border-0 select-none"
              style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
            >
              <div
                className="relative w-36 h-11 sm:w-44 sm:h-14 -ml-1 md:ml-0 outline-none border-0"
                style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
              >
                <Image
                  src="/images/logo_transparent.png"
                  alt="HealthGhuru Logo"
                  fill
                  className="object-contain object-left outline-none border-0"
                  style={{ outline: 'none', border: 'none' }}
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
                      isActive ? "text-primary font-semibold" : "text-dark hover:text-primary"
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

            {/* Desktop Right CTA: Search Only */}
            <div className="hidden md:flex items-center">
              <Link
                href="/search"
                aria-label="Search HealthGhuru"
                className="p-2.5 rounded-full hover:bg-surface text-dark transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <Search size={19} />
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-1.5">
              <Link
                href="/search"
                aria-label="Search"
                className="p-2 text-text-primary hover:text-primary transition-colors"
              >
                <Search size={22} />
              </Link>
              <button
                className="z-50 p-2 rounded-md transition-colors text-text-primary hover:text-primary active:scale-95"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
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
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="md:hidden overflow-hidden bg-white border-b border-primary/10 shadow-xl absolute top-full left-0 w-full z-50"
            >
              <div className="site-container py-5 flex flex-col gap-1">
                {NAV_LINKS.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "font-heading font-medium text-base py-3 px-3 rounded-xl transition-colors flex items-center justify-between",
                        isActive
                          ? "text-primary bg-primary/5 font-semibold"
                          : "text-text-primary hover:bg-surface hover:text-primary"
                      )}
                    >
                      <span>{link.label}</span>
                      {isActive && <span className="w-2 h-2 rounded-full bg-primary" />}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Drawer Dimming Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 top-[56px] sm:top-[64px] bg-dark/40 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
