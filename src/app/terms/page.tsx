"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  AlertTriangle, 
  Scale, 
  UserCheck, 
  CreditCard, 
  Copyright, 
  ShieldAlert, 
  BookOpen, 
  Mail, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Shield, 
  HelpCircle,
  FileCheck,
  ChevronRight,
  Search,
  Printer,
  Share2,
  Check,
  AlertCircle
} from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const SECTIONS = [
  {
    id: "medical-disclaimer",
    number: "01",
    icon: <AlertTriangle size={18} className="text-amber-600" />,
    title: "Medical Disclaimer & Educational Purpose",
    shortTitle: "Medical Disclaimer",
    isHighlight: true,
    badgeText: "Crucial Medical Notice",
    content: `HealthGhuru is dedicated to delivering evidence-based health and wellness intelligence. However, ALL MATERIALS ON THIS PLATFORM—INCLUDING ARTICLES, VIDEOS, CALCULATORS, DIETARY RECOMMENDATIONS, FITNESS ROUTINES, AND BREAKING NEWS—ARE FOR INFORMATIONAL AND EDUCATIONAL PURPOSES ONLY.`,
    points: [
      { label: "Not Medical Advice", text: "HealthGhuru does not provide clinical diagnoses, customized treatment plans, or emergency healthcare services." },
      { label: "Consult Qualified Practitioners", text: "Always consult your physician or qualified healthcare provider with any questions regarding a medical condition, diet, or exercise regimen." },
      { label: "Never Disregard Professional Care", text: "Never disregard or delay seeking professional medical advice because of something you have read or watched on HealthGhuru." },
      { label: "Immediate Medical Emergencies", text: "If you are experiencing a medical emergency, immediately call your local emergency services (e.g., 911 / 112 / 108) or proceed to the nearest emergency room." }
    ]
  },
  {
    id: "acceptance",
    number: "02",
    icon: <Scale size={18} className="text-primary" />,
    title: "Acceptance & Agreement to Terms",
    shortTitle: "Acceptance of Terms",
    badgeText: "Legally Binding",
    content: `By visiting, accessing, or registering an account on HealthGhuru, you confirm that you have read, understood, and agreed to be legally bound by these Terms of Service, along with our Privacy Policy. If you do not accept these terms, you must discontinue using the platform immediately.`
  },
  {
    id: "accounts",
    number: "03",
    icon: <UserCheck size={18} className="text-primary" />,
    title: "User Accounts & Security Obligations",
    shortTitle: "User Accounts",
    badgeText: "Security & Access",
    content: `Certain features, such as personalized recommendations, bookmarking, and the Health Vault, require an active account. You agree to maintain accurate information and safeguard your credentials.`,
    points: [
      { label: "Accurate Information", text: "Provide true, current, and complete details during the registration and onboarding process." },
      { label: "Password Confidentiality", text: "You are solely responsible for maintaining the confidentiality of your login credentials." },
      { label: "Account Responsibility", text: "You accept full responsibility for all activities and data logged under your authorized account." },
      { label: "Security Incident Reporting", text: "Notify our security team immediately at security@healthghuru.com if you suspect any unauthorized access." }
    ]
  },
  {
    id: "subscriptions",
    number: "04",
    icon: <CreditCard size={18} className="text-primary" />,
    title: "Subscription, Billing & Cancellation Policy",
    shortTitle: "Subscriptions & Billing",
    badgeText: "Transparent Pricing",
    content: `HealthGhuru offers open-access wellness guides as well as optional Premium memberships with advanced wellness tracking, health calculators, and ad-free clinical bulletins.`,
    points: [
      { label: "Recurring Subscriptions", text: "Premium memberships are billed in advance on an automated monthly or annual cycle until canceled by the subscriber." },
      { label: "Hassle-Free Cancellation", text: "You can cancel your subscription at any time via Account Settings. You retain complete access until the end of your prepaid billing period." },
      { label: "Refund Terms", text: "Fees are generally non-refundable once a cycle begins, except where mandated by applicable statutory consumer protection regulations." }
    ]
  },
  {
    id: "intellectual-property",
    number: "05",
    icon: <Copyright size={18} className="text-primary" />,
    title: "Intellectual Property & Content Syndication",
    shortTitle: "Intellectual Property",
    badgeText: "Copyright Protected",
    content: `All original editorial articles, research summaries, graphics, layouts, and software code on HealthGhuru are the proprietary property of HealthGhuru and protected under international copyright laws. Syndicated publications from accredited medical institutions (e.g., Mayo Clinic, PubMed) are used with permission or under editorial fair-use syndication and remain the intellectual property of their respective owners.`
  },
  {
    id: "prohibited",
    number: "06",
    icon: <ShieldAlert size={18} className="text-primary" />,
    title: "Prohibited Platform Conduct",
    shortTitle: "Prohibited Conduct",
    badgeText: "Community Safety",
    content: `To preserve a safe, reliable, and scientifically accurate environment, users must not engage in any of the following activities:`,
    points: [
      { label: "Medical Misinformation", text: "Do not post, distribute, or promote unverified medical advice or dangerous health claims." },
      { label: "Automated Data Scraping", text: "Do not use automated bots, spiders, or scrapers to harvest content or user records without written authorization." },
      { label: "System Tampering & Probing", text: "Do not attempt to probe, breach, or circumvent authentication or platform security safeguards." },
      { label: "Medical Impersonation", text: "Do not falsely represent yourself as a licensed physician, certified medical specialist, or representative of HealthGhuru." }
    ]
  },
  {
    id: "liability",
    number: "07",
    icon: <BookOpen size={18} className="text-primary" />,
    title: "Limitation of Liability & Warranties",
    shortTitle: "Limitation of Liability",
    badgeText: "Disclaimers & Limits",
    content: `HealthGhuru is provided on an 'as is' and 'as available' basis. To the maximum extent permitted by applicable law, HealthGhuru, its founders, medical writers, and affiliates shall not be liable for any direct, indirect, incidental, or consequential damages resulting from your use of the website or implementation of wellness suggestions.`
  }
];

export default function TermsOfServicePage() {
  const lastUpdated = "September 10, 2026";
  const [activeSection, setActiveSection] = useState("medical-disclaimer");
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Track scroll position & active section
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }

      const scrollPosition = window.scrollY + 220;
      for (const section of SECTIONS) {
        const el = document.getElementById(section.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -90;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Filter sections based on search query
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return SECTIONS;
    const q = searchQuery.toLowerCase();
    return SECTIONS.filter(
      (sec) =>
        sec.title.toLowerCase().includes(q) ||
        sec.content.toLowerCase().includes(q) ||
        (sec.points && sec.points.some(p => p.label.toLowerCase().includes(q) || p.text.toLowerCase().includes(q)))
    );
  }, [searchQuery]);

  return (
    <div className="bg-[#FAFDF9] min-h-screen text-dark relative selection:bg-primary/20 selection:text-primary-dark">
      
      {/* Top Reading Progress Bar */}
      <div 
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-emerald-400 to-accent z-50 origin-left transition-all duration-150"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Hero Header Area */}
      <header className="border-b border-primary/10 bg-white/80 backdrop-blur-md pt-8 pb-10 sm:py-12">
        <div className="site-container max-w-6xl">
          
          {/* Breadcrumb & Quick Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-primary transition-colors group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
              Back to Home
            </Link>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-text-secondary bg-surface hover:bg-surface-alt border border-border transition-colors"
                title="Copy shareable link"
              >
                {copied ? (
                  <>
                    <Check size={13} className="text-primary" />
                    <span className="text-primary font-semibold">Link Copied</span>
                  </>
                ) : (
                  <>
                    <Share2 size={13} />
                    <span>Share</span>
                  </>
                )}
              </button>

              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-text-secondary bg-surface hover:bg-surface-alt border border-border transition-colors"
                title="Print document"
              >
                <Printer size={13} />
                <span>Print</span>
              </button>
            </div>
          </div>

          {/* Hero Typography */}
          <ScrollReveal variant="fadeUp">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary font-heading font-semibold text-xs mb-4">
                <FileCheck size={14} />
                <span>Official Platform Agreement</span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-dark tracking-tight leading-[1.15] mb-4">
                HealthGhuru Terms of Service
              </h1>

              <p className="text-text-secondary text-base sm:text-lg leading-relaxed mb-6 font-normal">
                Please read these terms carefully before accessing HealthGhuru. They outline your rights, legal responsibilities, and essential medical disclaimers.
              </p>

              {/* Meta indicators strip */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 sm:gap-x-6 text-xs text-text-muted font-heading font-medium">
                <span className="flex items-center gap-1.5">
                  <Clock size={14} className="text-primary" /> Last Updated: <strong className="text-dark font-semibold">{lastUpdated}</strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <FileCheck size={14} className="text-primary" /> Platform Version: <strong className="text-dark font-semibold">v2.4</strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Shield size={14} className="text-primary" /> Globally Enforceable
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5 text-text-secondary">
                  <BookOpen size={14} /> ~6 min read
                </span>
              </div>
            </div>
          </ScrollReveal>

        </div>
      </header>

      {/* Main Document Body */}
      <div className="site-container max-w-6xl py-10 sm:py-14">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          
          {/* Left: Sticky Floating Navigator */}
          <aside className="w-full lg:w-72 xl:w-80 shrink-0 lg:sticky lg:top-24 space-y-5">
            
            {/* Search Box */}
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Search terms & conditions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white border border-primary/20 text-dark placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted hover:text-dark"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Navigation List */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-primary/15 shadow-sm">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/80">
                <span className="font-heading font-bold text-xs uppercase tracking-wider text-text-secondary">
                  Terms Index
                </span>
                <span className="text-[11px] font-mono text-primary font-bold">
                  {filteredSections.length} of {SECTIONS.length}
                </span>
              </div>

              <nav className="flex flex-col gap-1">
                {filteredSections.map((sec) => {
                  const isActive = activeSection === sec.id;
                  return (
                    <button
                      key={sec.id}
                      onClick={() => scrollToSection(sec.id)}
                      className={`text-left px-3 py-2.5 rounded-xl text-xs sm:text-[13px] font-heading transition-all flex items-center justify-between group ${
                        isActive
                          ? "bg-primary text-white font-semibold shadow-xs"
                          : "text-text-primary hover:bg-surface hover:text-primary font-medium"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate pr-2">
                        <span className={`font-mono text-xs ${isActive ? "text-white/80" : "text-text-muted"}`}>
                          {sec.number}
                        </span>
                        <span className="truncate">{sec.shortTitle}</span>
                      </div>
                      <ChevronRight 
                        size={14} 
                        className={`shrink-0 transition-transform ${
                          isActive ? "text-white translate-x-0.5" : "text-text-muted group-hover:text-primary group-hover:translate-x-0.5"
                        }`} 
                      />
                    </button>
                  );
                })}
              </nav>

              {/* Legal & Medical Review Team Contact */}
              <div className="mt-5 pt-4 border-t border-border/80">
                <div className="bg-surface rounded-xl p-3.5 border border-primary/15">
                  <p className="text-xs font-heading font-bold text-dark mb-1 flex items-center gap-1.5">
                    <HelpCircle size={14} className="text-primary" /> Legal &amp; Compliance Team
                  </p>
                  <p className="text-[11px] text-text-secondary leading-relaxed mb-2">
                    Questions on platform terms or dispute resolution:
                  </p>
                  <a
                    href="mailto:legal@healthghuru.com"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline font-mono"
                  >
                    <Mail size={12} /> legal@healthghuru.com
                  </a>
                </div>
              </div>
            </div>
          </aside>

          {/* Right: Editorial Paper Document */}
          <main className="flex-1 w-full bg-white rounded-3xl border border-primary/15 shadow-[0_4px_24px_rgba(46,125,50,0.06)] overflow-hidden">
            
            {/* Top Accent Bar */}
            <div className="h-1.5 bg-gradient-to-r from-amber-500 via-primary to-accent w-full" />

            <div className="p-6 sm:p-10 lg:p-14 space-y-12 sm:space-y-16">
              
              {filteredSections.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-text-secondary text-sm mb-2">No matching sections found for &quot;{searchQuery}&quot;.</p>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Reset search filter
                  </button>
                </div>
              ) : (
                filteredSections.map((section) => (
                  <article
                    key={section.id}
                    id={section.id}
                    className="scroll-mt-24 pb-10 border-b border-border/60 last:border-b-0 last:pb-0"
                  >
                    {/* Section Header */}
                    <div className="flex items-start gap-4 mb-5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-2xs ${
                        section.isHighlight ? 'bg-amber-500/15 text-amber-700' : 'bg-primary/10 text-primary'
                      }`}>
                        {section.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className="font-mono text-xs font-bold text-primary tracking-wider uppercase">
                            Section {section.number}
                          </span>
                          {section.badgeText && (
                            <span className={`px-2.5 py-0.5 rounded-full font-heading font-semibold text-[10px] tracking-wide ${
                              section.isHighlight 
                                ? 'bg-amber-500/15 text-amber-800' 
                                : 'bg-primary/10 text-primary'
                            }`}>
                              {section.badgeText}
                            </span>
                          )}
                        </div>
                        <h2 className="font-display text-2xl sm:text-3xl text-dark leading-snug">
                          {section.title}
                        </h2>
                      </div>
                    </div>

                    {/* Section Content & Key Points */}
                    <div className="space-y-5 text-text-primary">
                      
                      {/* Highlight Callout or Standard Prose */}
                      {section.isHighlight ? (
                        <div className="bg-amber-500/[0.08] border-l-4 border-amber-500 p-5 sm:p-6 rounded-r-2xl">
                          <p className="text-amber-950 font-medium text-sm sm:text-base leading-relaxed">
                            {section.content}
                          </p>
                        </div>
                      ) : (
                        <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
                          {section.content}
                        </p>
                      )}

                      {/* Streamlined Point List (No heavy boxy cards) */}
                      {section.points && (
                        <div className="grid grid-cols-1 gap-3 pt-2">
                          {section.points.map((pt, pIdx) => (
                            <div 
                              key={pIdx}
                              className={`group p-3.5 sm:p-4 rounded-xl border transition-all ${
                                section.isHighlight
                                  ? 'bg-amber-500/[0.03] hover:bg-amber-500/[0.07] border-amber-200/70 hover:border-amber-300'
                                  : 'bg-surface/70 hover:bg-surface border-primary/10 hover:border-primary/25'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                {section.isHighlight ? (
                                  <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                                ) : (
                                  <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                                )}
                                <div>
                                  <h3 className="font-heading font-bold text-xs sm:text-sm text-dark mb-0.5">
                                    {pt.label}
                                  </h3>
                                  <p className="text-xs sm:text-[13px] text-text-secondary leading-relaxed">
                                    {pt.text}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                    </div>
                  </article>
                ))
              )}

              {/* Bottom Resolution / Legal Notices Banner */}
              <div className="mt-8 rounded-2xl bg-gradient-to-br from-surface to-surface-alt p-6 sm:p-8 border border-primary/15">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                  <div>
                    <h3 className="font-heading font-bold text-base sm:text-lg text-dark mb-1 flex items-center gap-2">
                      <Sparkles size={16} className="text-primary" /> Questions, Legal Notices or Disputes
                    </h3>
                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-xl">
                      Our legal and medical review team is available to assist you with any contractual questions or content syndication inquiries.
                    </p>
                  </div>
                  <a
                    href="mailto:legal@healthghuru.com?subject=Legal%20Inquiry%20-%20HealthGhuru"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary hover:bg-primary-dark text-white font-heading font-semibold text-xs sm:text-sm shrink-0 shadow-md hover:shadow-lg transition-all"
                  >
                    <Mail size={15} /> Contact Legal Counsel
                  </a>
                </div>
              </div>

            </div>

          </main>
        </div>
      </div>

    </div>
  );
}
