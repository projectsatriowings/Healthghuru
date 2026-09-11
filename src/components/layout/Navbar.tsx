"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Menu,
  X,
  Search,
  ChevronRight,
  ChevronDown,
  Home,
  Newspaper,
  FileText,
  Video,
  BookOpen,
  HeartPulse,
  PenTool,
  Sparkles,
  ShieldCheck,
  User,
  LogOut,
  Bookmark,
  Compass,
  Settings,
  LayoutDashboard,
} from "lucide-react";
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
  const { data: session, status } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const pathname = usePathname();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [pathname]);

  // Close user dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  if (pathname === "/login" || pathname === "/subscribe") {
    return null;
  }

  const user = session?.user;
  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "HG";

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
                    prefetch={true}
                    className={cn(
                      "font-heading font-semibold text-sm xl:text-[15px] tracking-wide transition-colors relative py-2 whitespace-nowrap",
                      isActive ? "text-primary font-bold" : "text-text-primary hover:text-primary"
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

              {/* Logged In User State / Dropdown */}
              {status === "authenticated" && user ? (
                <div className="relative hidden sm:block" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2.5 p-1.5 pl-2.5 pr-3 rounded-full border border-primary/20 bg-surface hover:border-primary/40 transition-all text-left group"
                    aria-expanded={userDropdownOpen}
                  >
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-heading font-bold text-xs shadow-2xs">
                      {userInitials}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-heading font-bold text-xs text-dark max-w-[100px] truncate">
                        {user.name?.split(" ")[0] || "Account"}
                      </span>
                      <span className="text-[10px] text-text-muted capitalize leading-none">
                        {user.role === "admin" ? "Admin" : "Member"}
                      </span>
                    </div>
                    <ChevronDown
                      size={14}
                      className={cn(
                        "text-text-muted transition-transform duration-200 ml-0.5",
                        userDropdownOpen && "rotate-180 text-primary"
                      )}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {userDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-primary/15 p-2 z-50"
                      >
                        {/* User Header */}
                        <div className="p-3 bg-surface rounded-xl mb-1.5 border border-primary/10">
                          <p className="font-heading font-bold text-sm text-dark truncate">
                            {user.name || "HealthGuru Member"}
                          </p>
                          <p className="text-xs text-text-muted truncate mt-0.5">{user.email}</p>
                          <div className="mt-2 flex items-center gap-1.5">
                            <span className="text-[10px] font-heading font-semibold uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                              {user.role === "admin" ? "Administrator" : "Active Member"}
                            </span>
                          </div>
                        </div>

                        {/* Personalized Feed & Hub Link */}
                        <Link
                          href="/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-heading font-semibold text-text-primary hover:bg-primary/5 hover:text-primary transition-colors"
                        >
                          <Sparkles size={15} className="text-primary" />
                          <span>Personalized Hub</span>
                        </Link>

                        {/* Account & Profile Link */}
                        <Link
                          href="/account"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-heading font-semibold text-text-primary hover:bg-primary/5 hover:text-primary transition-colors"
                        >
                          <User size={15} className="text-primary" />
                          <span>My Account & Profile</span>
                        </Link>

                        {/* Saved Content Link */}
                        <Link
                          href="/account?tab=saved"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-heading font-semibold text-text-primary hover:bg-primary/5 hover:text-primary transition-colors"
                        >
                          <Bookmark size={15} className="text-primary" />
                          <span>Saved Content</span>
                        </Link>

                        {/* Admin Link (if admin) */}
                        {user.role === "admin" && (
                          <Link
                            href="/admin"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-heading font-semibold text-text-primary hover:bg-primary/5 hover:text-primary transition-colors"
                          >
                            <LayoutDashboard size={15} className="text-primary" />
                            <span>Admin Dashboard</span>
                          </Link>
                        )}

                        {/* Sign Out */}
                        <button
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            signOut({ callbackUrl: "/" });
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-heading font-semibold text-red-600 hover:bg-red-50 transition-colors mt-1 border-t border-border/60"
                        >
                          <LogOut size={15} />
                          <span>Sign Out</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
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
                </>
              )}

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

                {/* Mobile Logged In User Card */}
                {status === "authenticated" && user && (
                  <div className="p-3.5 rounded-2xl bg-surface border border-primary/15 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-heading font-bold text-sm">
                          {userInitials}
                        </div>
                        <div>
                          <p className="font-heading font-bold text-sm text-dark">{user.name}</p>
                          <p className="text-[11px] text-text-muted truncate max-w-[180px]">{user.email}</p>
                        </div>
                      </div>
                      {user.role === "admin" && (
                        <Link
                          href="/admin"
                          className="text-[10px] font-heading font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary text-white"
                        >
                          Admin
                        </Link>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/40">
                      <Link
                        href="/dashboard"
                        className="py-1.5 px-3 rounded-xl bg-primary/10 text-primary text-xs font-heading font-semibold text-center hover:bg-primary hover:text-white transition-colors flex items-center justify-center gap-1"
                      >
                        <Sparkles size={12} />
                        <span>Feed Hub</span>
                      </Link>
                      <Link
                        href="/account"
                        className="py-1.5 px-3 rounded-xl bg-white border border-border text-dark text-xs font-heading font-semibold text-center hover:border-primary/40 transition-colors flex items-center justify-center gap-1"
                      >
                        <User size={12} />
                        <span>My Account</span>
                      </Link>
                    </div>
                  </div>
                )}

                {/* Navigation Link List */}
                <nav className="flex flex-col gap-1.5" aria-label="Mobile Navigation">
                  {NAV_LINKS.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        prefetch={true}
                        className={cn(
                          "flex items-center justify-between px-3.5 py-3 rounded-xl font-heading text-sm transition-all",
                          isActive
                            ? "bg-primary text-white font-bold shadow-xs"
                            : "bg-surface/60 hover:bg-surface text-text-primary hover:text-primary font-semibold"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                              isActive
                                ? "bg-white/20 text-white"
                                : "bg-white text-primary shadow-2xs border border-primary/10"
                            )}
                          >
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
                  {status === "authenticated" ? (
                    <button
                      type="button"
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full flex items-center justify-center gap-2 py-3 text-sm font-heading font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-all"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  ) : (
                    <>
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
                    </>
                  )}
                </div>

                {/* Footer Micro-links in Mobile Menu */}
                <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-text-muted font-medium px-1">
                  <div className="flex items-center gap-3">
                    <Link href="/privacy" className="hover:text-primary transition-colors">
                      Privacy
                    </Link>
                    <span>•</span>
                    <Link href="/terms" className="hover:text-primary transition-colors">
                      Terms
                    </Link>
                    <span>•</span>
                    <Link href="/about" className="hover:text-primary transition-colors">
                      About
                    </Link>
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
