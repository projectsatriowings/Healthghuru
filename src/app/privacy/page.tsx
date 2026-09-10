"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  Shield, 
  Database, 
  Eye, 
  Lock, 
  UserCheck, 
  FileText, 
  Bell, 
  Mail, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  KeyRound, 
  HelpCircle,
  ChevronRight,
  Search,
  Printer,
  Share2,
  Check,
  ShieldCheck,
  Award,
  BookOpen
} from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const SECTIONS = [
  {
    id: "commitment",
    number: "01",
    icon: <Shield size={18} className="text-primary" />,
    title: "Our Core Privacy Commitment",
    shortTitle: "Privacy Commitment",
    isHighlight: true,
    badgeText: "Zero Data Monetization",
    content: `At HealthGhuru, we treat your health and wellness data with the utmost confidentiality. We firmly believe that your personal health journey belongs solely to you. We NEVER sell, rent, or monetize your health metrics, personal tracking logs, or contact details to third-party data brokers or advertisers.`,
    points: [
      { label: "Zero Data Monetization", text: "Your health records and activity metrics are never commercialized, rented, or shared for third-party marketing purposes." },
      { label: "Patient-Grade Ethics", text: "We adhere strictly to evidence-based data privacy and clinical health information handling principles." },
      { label: "User Autonomy & Control", text: "You maintain complete ownership and control over how your data is collected, stored, exported, or permanently deleted." }
    ]
  },
  {
    id: "collection",
    number: "02",
    icon: <Database size={18} className="text-primary" />,
    title: "Information We Collect & Process",
    shortTitle: "Information We Collect",
    badgeText: "Transparent Collection",
    content: `To provide personalized health articles, video recommendations, and secure Health Vault tracking, we collect the following limited categories of information:`,
    points: [
      { label: "Account Information", text: "Your name, verified email address, hashed password, and subscription status upon account registration." },
      { label: "Health Vault Data", text: "Self-logged nutrition habits, fitness milestones, sleep metrics, and saved research articles stored securely." },
      { label: "Technical & Diagnostic Logs", text: "Anonymized IP addresses, browser types, device diagnostics, and reading analytics to ensure platform stability." },
      { label: "User Communications", text: "Inquiries submitted to our editorial board, medical review team, or customer support desk." }
    ]
  },
  {
    id: "usage",
    number: "03",
    icon: <Eye size={18} className="text-primary" />,
    title: "How We Utilize Your Information",
    shortTitle: "How We Use Data",
    badgeText: "Purpose Limitation",
    content: `Information collected on HealthGhuru is used strictly to enhance your wellness journey and keep the platform secure:`,
    points: [
      { label: "Personalized Recommendations", text: "Curating relevant medical research, fitness workouts, and sleep guides tailored to your chosen health goals." },
      { label: "Health Vault Visualizations", text: "Generating interactive progress charts, health calculators, and private wellness trend summaries." },
      { label: "Health Bulletins & Alerts", text: "Delivering opt-in verified medical news, breaking research bulletins, and subscriber newsletter editions." },
      { label: "Security & Fraud Prevention", text: "Protecting database integrity, defending against brute-force attacks, and verifying authorized sessions." }
    ]
  },
  {
    id: "security",
    number: "04",
    icon: <Lock size={18} className="text-primary" />,
    title: "Enterprise Data Security & Encryption",
    shortTitle: "Security & Encryption",
    badgeText: "AES-256 & TLS 1.3",
    content: `We implement defense-in-depth security standards to protect your health records against unauthorized access, loss, or alteration.`,
    points: [
      { label: "End-to-End Encryption in Transit", text: "All client-server communications are enforced over TLS 1.3 with modern cryptographic cipher suites." },
      { label: "At-Rest Database Encryption", text: "All sensitive user profiles and health logs stored on Neon PostgreSQL are protected with AES-256 encryption." },
      { label: "Strict Least-Privilege Access", text: "Zero employee access to unencrypted health logs; systems enforce multi-factor authentication and strict access controls." }
    ]
  },
  {
    id: "rights",
    number: "05",
    icon: <UserCheck size={18} className="text-primary" />,
    title: "Your Legal Privacy Rights (GDPR & CCPA)",
    shortTitle: "Your Data Rights",
    badgeText: "GDPR & CCPA Compliant",
    content: `Under global privacy frameworks including GDPR and CCPA, you have extensive legal rights regarding your personal information:`,
    points: [
      { label: "Right of Access & Portability", text: "Export your complete Health Vault history and personal profile data anytime in standardized JSON format." },
      { label: "Right to Rectification", text: "Update, correct, or modify inaccurate personal information directly from your Account Settings." },
      { label: "Right to Erasure (Right to be Forgotten)", text: "Request the immediate and irreversible deletion of your account and all associated health entries." },
      { label: "Right to Restrict Processing", text: "Opt out of non-essential analytics tracking or marketing communications with a single click." }
    ]
  },
  {
    id: "cookies",
    number: "06",
    icon: <FileText size={18} className="text-primary" />,
    title: "Cookies & Anonymous Analytics",
    shortTitle: "Cookies Policy",
    badgeText: "Minimal Tracking",
    content: `We use minimal, privacy-centric cookies. Essential cookies are required for user authentication and session security. Optional analytics cookies help us measure article readership trends without tracking you across third-party websites or creating advertising profiles.`
  },
  {
    id: "updates",
    number: "07",
    icon: <Bell size={18} className="text-primary" />,
    title: "Policy Updates & Notification Process",
    shortTitle: "Policy Updates",
    badgeText: "Continuous Transparency",
    content: `As we introduce new wellness tools or as global privacy regulations evolve, we may update this Privacy Policy. Significant modifications will be announced via prominent site notifications or email updates prior to taking effect.`
  }
];

export default function PrivacyPolicyPage() {
  const lastUpdated = "September 10, 2026";
  const [activeSection, setActiveSection] = useState("commitment");
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
                <ShieldCheck size={14} />
                <span>Privacy &amp; Data Ethics Policy</span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-dark tracking-tight leading-[1.15] mb-4">
                HealthGhuru Privacy Policy
              </h1>

              <p className="text-text-secondary text-base sm:text-lg leading-relaxed mb-6 font-normal">
                Your health data is sacred. We outline here how HealthGhuru safeguards your records, encrypts your Health Vault logs, and upholds global patient-grade data privacy standards.
              </p>

              {/* Meta indicators strip */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 sm:gap-x-6 text-xs text-text-muted font-heading font-medium">
                <span className="flex items-center gap-1.5">
                  <Clock size={14} className="text-primary" /> Last Updated: <strong className="text-dark font-semibold">{lastUpdated}</strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <KeyRound size={14} className="text-primary" /> AES-256 Encrypted
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Award size={14} className="text-primary" /> GDPR &amp; CCPA Compliant
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5 text-text-secondary">
                  <BookOpen size={14} /> ~5 min read
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
                placeholder="Search privacy topics..."
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
                  Document Sections
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

              {/* Data Protection Officer Contact */}
              <div className="mt-5 pt-4 border-t border-border/80">
                <div className="bg-surface rounded-xl p-3.5 border border-primary/15">
                  <p className="text-xs font-heading font-bold text-dark mb-1 flex items-center gap-1.5">
                    <HelpCircle size={14} className="text-primary" /> Data Protection Officer
                  </p>
                  <p className="text-[11px] text-text-secondary leading-relaxed mb-2">
                    For GDPR access, export, or deletion requests:
                  </p>
                  <a
                    href="mailto:privacy@healthghuru.com"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline font-mono"
                  >
                    <Mail size={12} /> privacy@healthghuru.com
                  </a>
                </div>
              </div>
            </div>
          </aside>

          {/* Right: Editorial Paper Document */}
          <main className="flex-1 w-full bg-white rounded-3xl border border-primary/15 shadow-[0_4px_24px_rgba(46,125,50,0.06)] overflow-hidden">
            
            {/* Top Green Accent Bar */}
            <div className="h-1.5 bg-gradient-to-r from-primary via-emerald-400 to-accent w-full" />

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
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                        {section.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className="font-mono text-xs font-bold text-primary tracking-wider uppercase">
                            Section {section.number}
                          </span>
                          {section.badgeText && (
                            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-heading font-semibold text-[10px] tracking-wide">
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
                        <div className="bg-primary/[0.04] border-l-4 border-primary p-5 sm:p-6 rounded-r-2xl">
                          <p className="text-dark font-medium text-sm sm:text-base leading-relaxed">
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
                              className="group p-3.5 sm:p-4 rounded-xl bg-surface/70 hover:bg-surface border border-primary/10 hover:border-primary/25 transition-all"
                            >
                              <div className="flex items-start gap-3">
                                <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
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

              {/* Bottom Resolution / Rights Banner */}
              <div className="mt-8 rounded-2xl bg-gradient-to-br from-surface to-surface-alt p-6 sm:p-8 border border-primary/15">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                  <div>
                    <h3 className="font-heading font-bold text-base sm:text-lg text-dark mb-1 flex items-center gap-2">
                      <Sparkles size={16} className="text-primary" /> Request Your Data Records
                    </h3>
                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-xl">
                      Under GDPR and CCPA regulations, you can request an instant export or irreversible deletion of your Health Vault data anytime.
                    </p>
                  </div>
                  <a
                    href="mailto:privacy@healthghuru.com?subject=Data%20Request%20-%20HealthGhuru"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary hover:bg-primary-dark text-white font-heading font-semibold text-xs sm:text-sm shrink-0 shadow-md hover:shadow-lg transition-all"
                  >
                    <Mail size={15} /> Submit Privacy Request
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
