"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Sparkles, Shield, Zap, BookOpen, Star, HelpCircle, ArrowRight, ArrowLeft, CheckCircle2, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PillBadge } from "@/components/ui/PillBadge";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

interface Plan {
  id: string;
  name: string;
  tagline: string;
  priceMonthly: number;
  priceAnnual: number;
  popular?: boolean;
  features: string[];
  cta: string;
  badge?: string;
}

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free Access",
    tagline: "Essential wellness intelligence for everyone.",
    priceMonthly: 0,
    priceAnnual: 0,
    features: [
      "Access to standard health articles",
      "Full video library and YouTube guides",
      "Daily Wellness Shorts and Reels",
      "Basic health categories & taxonomy",
      "Weekly HealthGuru newsletter",
    ],
    cta: "Get Started Free",
  },
  {
    id: "premium",
    name: "Premium Member",
    tagline: "Unrestricted medical reports, research & digital magazines.",
    priceMonthly: 9.99,
    priceAnnual: 7.99,
    popular: true,
    badge: "Most Popular",
    features: [
      "All Free features included",
      "Unlimited access to all Premium Articles",
      "Full Digital Magazine Archive (PDF & Web)",
      "Exclusive clinical guides & meal plans",
      "Ad-free reading experience",
      "Priority editorial newsletter & alerts",
      "Personalized bookmarking & wellness dashboard",
    ],
    cta: "Upgrade to Premium",
  },
  {
    id: "annual",
    name: "Annual VIP Pass",
    tagline: "Maximum value with comprehensive wellness resources.",
    priceMonthly: 6.58, // $79 billed annually
    priceAnnual: 6.58,
    badge: "Best Value — Save 35%",
    features: [
      "Everything in Premium included",
      "Annual Digital Magazine subscription",
      "Early access to investigative health reports",
      "VIP member wellness webinars",
      "Full archive of downloadable wellness eBooks",
      "Dedicated member support line",
    ],
    cta: "Claim Annual VIP Pass",
  },
];

const FAQS = [
  {
    q: "Can I cancel my subscription anytime?",
    a: "Yes, you can cancel or switch your subscription tier at any time with a single click from your account dashboard with no hidden fees.",
  },
  {
    q: "What is included in the digital magazine access?",
    a: "Premium and Annual members get full digital and high-resolution PDF access to every issue of HealthGuru Magazine, including back-issues.",
  },
  {
    q: "Is payment integration active right now?",
    a: "Currently, HealthGuru is previewing membership tiers during our launch phase. You can select and activate your plan immediately with zero upfront payment charge.",
  },
  {
    q: "Are the health articles verified by experts?",
    a: "Yes, 100% of our clinical reports and articles are reviewed by medical professionals and backed by peer-reviewed clinical citations.",
  },
];

export default function SubscribePage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<"plans" | "checkout" | "success">("plans");
  const [checkoutEmail, setCheckoutEmail] = useState("");
  const [checkoutName, setCheckoutName] = useState("");

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    setCheckoutStep("checkout");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCompleteSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutEmail || !checkoutEmail.includes("@")) return;
    setCheckoutStep("success");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const activePlanObj = PLANS.find((p) => p.id === selectedPlan) || PLANS[1];

  return (
    <div className="min-h-screen bg-cream pb-24 relative overflow-hidden">
      {/* Background Decorative Rings */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <header className="bg-white border-b border-primary/10 py-4 sm:py-5 sticky top-0 z-30 shadow-xs">
        <div className="site-container flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-text-secondary hover:text-primary transition-colors text-sm font-heading font-medium">
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <Link href="/" className="relative w-44 sm:w-52 h-12 flex items-center">
            <Image
              src="/images/logo_transparent.png"
              alt="HealthGuru Logo"
              fill
              className="object-contain"
              priority
            />
          </Link>
          <Link href="/login" className="text-xs sm:text-sm font-heading font-semibold text-primary hover:underline">
            Already a member? Sign In
          </Link>
        </div>
      </header>

      {/* Step 1: Plan Selection */}
      {checkoutStep === "plans" && (
        <main className="site-container pt-12 sm:pt-16">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <PillBadge active className="mb-4 inline-flex gap-1.5"><Sparkles size={14} /> HealthGuru Membership</PillBadge>
            <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl text-dark leading-tight mb-4">
              Invest in Your Longevity & Daily Wellness
            </h1>
            <p className="text-text-secondary text-base sm:text-xl font-body leading-relaxed max-w-2xl mx-auto">
              Join our community of over 50,000+ proactive readers enjoying science-backed health insights and exclusive digital magazine editions.
            </p>

            {/* Billing Cycle Toggle */}
            <div className="mt-8 inline-flex items-center bg-white p-1.5 rounded-full border border-primary/20 shadow-sm">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`px-6 py-2 rounded-full text-xs sm:text-sm font-heading font-semibold transition-all ${
                  billingCycle === "monthly"
                    ? "bg-primary text-white shadow-sm"
                    : "text-text-secondary hover:text-dark"
                }`}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("annual")}
                className={`px-6 py-2 rounded-full text-xs sm:text-sm font-heading font-semibold transition-all flex items-center gap-1.5 ${
                  billingCycle === "annual"
                    ? "bg-primary text-white shadow-sm"
                    : "text-text-secondary hover:text-dark"
                }`}
              >
                Annual Billing <span className="bg-accent text-white text-[10px] px-2 py-0.5 rounded-full font-bold">Save 35%</span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto items-stretch">
            {PLANS.map((plan) => {
              const isAnnual = billingCycle === "annual";
              const price = isAnnual ? plan.priceAnnual : plan.priceMonthly;
              const isPopular = plan.popular;

              return (
                <motion.div
                  key={plan.id}
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.3 }}
                  className={`relative rounded-3xl p-8 sm:p-10 flex flex-col justify-between transition-all ${
                    isPopular
                      ? "bg-white border-2 border-primary shadow-2xl ring-4 ring-primary/10"
                      : "bg-white/90 border border-primary/15 shadow-lg"
                  }`}
                >
                  {/* Badge */}
                  {plan.badge && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-primary-dark text-white text-xs font-heading font-bold px-4 py-1 rounded-full shadow-md uppercase tracking-wider">
                      {plan.badge}
                    </div>
                  )}

                  <div>
                    <h2 className="font-display text-2xl text-dark mb-2">{plan.name}</h2>
                    <p className="text-text-secondary text-xs sm:text-sm mb-6 min-h-[40px] leading-relaxed">
                      {plan.tagline}
                    </p>

                    {/* Price */}
                    <div className="mb-6 pb-6 border-b border-border">
                      <div className="flex items-baseline gap-1">
                        <span className="font-display text-4xl sm:text-5xl font-bold text-dark">
                          ${price === 0 ? "0" : price.toFixed(2)}
                        </span>
                        <span className="text-text-muted text-sm font-medium">
                          {price === 0 ? " / forever" : " / month"}
                        </span>
                      </div>
                      {isAnnual && price > 0 && (
                        <p className="text-xs text-primary font-semibold mt-1">
                          Billed annually (${(price * 12).toFixed(2)}/year)
                        </p>
                      )}
                    </div>

                    {/* Features */}
                    <ul className="space-y-3.5 mb-8">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-text-primary">
                          <Check size={16} className="text-primary shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    variant={isPopular ? "accent" : "primary"}
                    size="lg"
                    onClick={() => handleSelectPlan(plan.id)}
                    className="w-full shadow-md flex items-center justify-center gap-2"
                  >
                    {plan.cta} <ArrowRight size={16} />
                  </Button>
                </motion.div>
              );
            })}
          </div>

          {/* Trust Banner */}
          <div className="mt-16 max-w-4xl mx-auto bg-white rounded-2xl p-6 sm:p-8 border border-primary/10 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Shield size={24} />
              </div>
              <div>
                <h3 className="font-heading font-bold text-dark text-base">Risk-Free 30-Day Guarantee</h3>
                <p className="text-xs sm:text-sm text-text-secondary">If you are not completely satisfied, cancel anytime with one click.</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-accent font-bold text-sm">
              <Star size={16} className="fill-accent" />
              <Star size={16} className="fill-accent" />
              <Star size={16} className="fill-accent" />
              <Star size={16} className="fill-accent" />
              <Star size={16} className="fill-accent" />
              <span className="ml-1 text-dark font-heading">4.9 / 5 Rating</span>
            </div>
          </div>

          {/* FAQs */}
          <div className="mt-20 max-w-3xl mx-auto">
            <h2 className="font-display text-2xl sm:text-3xl text-dark text-center mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {FAQS.map((faq, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-border shadow-2xs">
                  <h4 className="font-heading font-bold text-dark text-base sm:text-lg mb-2 flex items-start gap-2.5">
                    <HelpCircle size={18} className="text-primary shrink-0 mt-0.5" />
                    {faq.q}
                  </h4>
                  <p className="text-text-secondary text-sm leading-relaxed pl-7">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      {/* Step 2: Checkout / Registration Flow */}
      {checkoutStep === "checkout" && (
        <main className="site-container pt-12 max-w-2xl mx-auto">
          <button
            type="button"
            onClick={() => setCheckoutStep("plans")}
            className="inline-flex items-center gap-2 text-text-secondary hover:text-primary transition-colors text-sm font-heading font-medium mb-6"
          >
            <ArrowLeft size={16} /> Back to Plan Selection
          </button>

          <div className="bg-white rounded-3xl shadow-xl border border-primary/10 p-8 sm:p-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary to-accent" />

            <div className="flex items-center justify-between pb-6 border-b border-border mb-6">
              <div>
                <span className="text-xs font-mono text-primary uppercase tracking-wider font-semibold">Selected Membership</span>
                <h2 className="font-display text-2xl sm:text-3xl text-dark">{activePlanObj.name}</h2>
              </div>
              <div className="text-right">
                <span className="font-display text-3xl font-bold text-dark">
                  ${billingCycle === "annual" ? activePlanObj.priceAnnual.toFixed(2) : activePlanObj.priceMonthly.toFixed(2)}
                </span>
                <span className="text-text-muted text-xs block">/ month ({billingCycle})</span>
              </div>
            </div>

            <form onSubmit={handleCompleteSubscription} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-heading font-semibold uppercase tracking-wider text-text-primary">
                  Your Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={checkoutName}
                  onChange={(e) => setCheckoutName(e.target.value)}
                  className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-heading font-semibold uppercase tracking-wider text-text-primary">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={checkoutEmail}
                  onChange={(e) => setCheckoutEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                />
              </div>

              <div className="p-4 rounded-2xl bg-surface-alt border border-border/80 flex items-start gap-3 mt-4">
                <Lock size={18} className="text-primary shrink-0 mt-0.5" />
                <div className="text-xs text-text-secondary leading-relaxed">
                  <span className="font-semibold text-dark block mb-0.5">Zero Risk Launch Preview</span>
                  No credit card required. Membership benefits are activated instantly for your account during our community launch period.
                </div>
              </div>

              <Button
                variant="accent"
                size="lg"
                type="submit"
                className="w-full mt-4 flex items-center justify-center gap-2 shadow-lg"
              >
                Activate {activePlanObj.name} <ArrowRight size={16} />
              </Button>
            </form>
          </div>
        </main>
      )}

      {/* Step 3: Success Confirmation */}
      {checkoutStep === "success" && (
        <main className="site-container pt-16 max-w-xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl shadow-xl border border-primary/15 p-8 sm:p-12"
          >
            <div className="w-20 h-20 bg-green-100 text-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <CheckCircle2 size={44} />
            </div>

            <h2 className="font-display text-3xl text-dark mb-2">
              Welcome to HealthGuru!
            </h2>
            <p className="text-text-secondary text-sm sm:text-base leading-relaxed mb-6 font-body">
              Your <strong className="text-primary">{activePlanObj.name}</strong> has been successfully activated for <strong>{checkoutEmail}</strong>.
            </p>

            <div className="bg-surface rounded-2xl p-4 text-xs text-text-secondary space-y-2 mb-8 text-left">
              <div className="flex justify-between">
                <span>Plan:</span>
                <span className="font-semibold text-dark">{activePlanObj.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Billing:</span>
                <span className="font-semibold text-dark">{billingCycle === "annual" ? "Annual Pass" : "Monthly"}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="font-semibold text-primary">Active & Verified</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/">
                <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-md">
                  Explore HealthGuru Feed &rarr;
                </Button>
              </Link>
              <Link href="/magazines">
                <Button variant="ghost" size="lg" className="w-full sm:w-auto">
                  Browse Magazines
                </Button>
              </Link>
            </div>
          </motion.div>
        </main>
      )}
    </div>
  );
}
