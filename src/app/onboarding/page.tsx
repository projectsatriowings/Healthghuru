"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Heart,
  Layers,
  FileText,
  Play,
  Zap,
  BookOpen,
  Newspaper,
  Compass,
  CheckCircle2,
  ShieldCheck,
  Activity,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Category {
  name: string;
  slug: string;
  description?: string;
  icon_name?: string;
}

interface FormatOption {
  id: string;
  label: string;
  description: string;
  icon: string;
}

const DEFAULT_POPULAR_TOPICS = ["Nutrition", "Fitness", "Sleep", "Mental Health"];
const DEFAULT_POPULAR_FORMATS = ["article", "video", "short", "health_tip"];

function OnboardingWizard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formats, setFormats] = useState<FormatOption[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>(DEFAULT_POPULAR_TOPICS);
  const [selectedFormats, setSelectedFormats] = useState<string[]>(DEFAULT_POPULAR_FORMATS);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Redirect if unauthenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/onboarding");
    }
  }, [status, router]);

  // Fetch available categories and formats
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch("/api/user/preferences");
        const data = await res.json();
        if (res.ok && data.success) {
          if (data.availableCategories?.length) {
            setCategories(data.availableCategories);
          }
          if (data.availableContentTypes?.length) {
            setFormats(data.availableContentTypes);
          }
          if (data.selectedTopics?.length) {
            setSelectedTopics(data.selectedTopics);
          }
          if (data.selectedContentTypes?.length) {
            setSelectedFormats(data.selectedContentTypes);
          }
        }
      } catch (err) {
        console.error("Failed to load onboarding preferences:", err);
      } finally {
        setLoading(false);
      }
    }

    if (status === "authenticated") {
      loadData();
    }
  }, [status]);

  const toggleTopic = (name: string) => {
    setSelectedTopics((prev) =>
      prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name]
    );
  };

  const toggleFormat = (id: string) => {
    setSelectedFormats((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const selectAllTopics = () => {
    setSelectedTopics(categories.map((c) => c.name));
  };

  const selectPopularTopics = () => {
    setSelectedTopics(DEFAULT_POPULAR_TOPICS);
  };

  const handleCompleteOnboarding = async () => {
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/user/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topics: selectedTopics,
          contentTypes: selectedFormats,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save your preferences.");
      }

      setStep(3);
    } catch (err: any) {
      setError(err.message || "Failed to finalize onboarding. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-xs font-heading font-semibold text-text-muted">
            Setting up your personalization wizard...
          </p>
        </div>
      </div>
    );
  }

  const renderFormatIcon = (id: string) => {
    switch (id) {
      case "article":
        return <FileText size={18} />;
      case "video":
        return <Play size={18} />;
      case "short":
        return <Zap size={18} />;
      case "health_tip":
        return <Sparkles size={18} />;
      case "guide":
        return <Compass size={18} />;
      case "magazine":
        return <BookOpen size={18} />;
      case "news":
        return <Newspaper size={18} />;
      default:
        return <Layers size={18} />;
    }
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col justify-between relative overflow-hidden py-6 sm:py-10">
      {/* Background Ambience */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-accent/10 rounded-full blur-[110px] pointer-events-none" />

      {/* Top Header */}
      <header className="site-container max-w-4xl mx-auto flex items-center justify-between relative z-10 mb-6">
        <Link href="/" className="inline-block relative w-44 sm:w-52 h-12">
          <Image
            src="/images/logo_transparent.png"
            alt="HealthGuru Logo"
            fill
            className="object-contain object-left"
            priority
          />
        </Link>

        {/* Wizard Step Progress */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-heading font-bold text-text-secondary">
            Step {step} of 3
          </span>
          <div className="flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-6 sm:w-8 h-1.5 rounded-full transition-all duration-300 ${
                  step >= s ? "bg-primary" : "bg-primary/20"
                }`}
              />
            ))}
          </div>
        </div>
      </header>

      {/* Main Wizard Container */}
      <main className="site-container max-w-4xl mx-auto relative z-10 my-auto">
        <div className="bg-white rounded-3xl border border-primary/15 p-6 sm:p-10 shadow-xl relative overflow-hidden">
          
          {/* Top Gradient Stripe */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary via-secondary to-accent" />

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

          <AnimatePresence mode="wait">
            
            {/* STEP 1: HEALTH TOPICS & INTERESTS */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <span className="text-xs font-heading font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 mb-1.5">
                    <Heart size={14} className="fill-primary" /> Personalize Your Experience
                  </span>
                  <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl text-dark">
                    What health topics are you interested in?
                  </h1>
                  <p className="text-xs sm:text-sm text-text-secondary mt-1 max-w-2xl">
                    Select the wellness areas you want HealthGuru to prioritize. You can select multiple topics and modify them anytime.
                  </p>
                </div>

                {/* Quick Selection Shortcuts */}
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <button
                    type="button"
                    onClick={selectPopularTopics}
                    className="px-3 py-1.5 rounded-full bg-surface border border-primary/20 text-primary font-heading font-semibold hover:bg-primary/10 transition-colors"
                  >
                    ✦ Popular 4 (Nutrition, Fitness, Sleep, Mental Health)
                  </button>
                  <button
                    type="button"
                    onClick={selectAllTopics}
                    className="px-3 py-1.5 rounded-full bg-surface border border-primary/20 text-text-primary font-heading font-semibold hover:bg-primary/10 transition-colors"
                  >
                    Select All Topics
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTopics([])}
                    className="px-3 py-1.5 rounded-full text-text-muted hover:text-red-600 transition-colors"
                  >
                    Clear Selection
                  </button>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[48vh] overflow-y-auto pr-1">
                  {categories.map((cat) => {
                    const isSelected = selectedTopics.includes(cat.name);
                    return (
                      <button
                        key={cat.slug}
                        type="button"
                        onClick={() => toggleTopic(cat.name)}
                        className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between group ${
                          isSelected
                            ? "bg-primary/10 border-primary text-primary font-bold shadow-xs scale-[1.01]"
                            : "bg-surface border-border text-text-primary hover:border-primary/40 hover:bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-2">
                          <span className="font-heading text-xs sm:text-sm truncate">{cat.name}</span>
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 transition-colors ${
                              isSelected ? "bg-primary text-white" : "border border-border group-hover:border-primary"
                            }`}
                          >
                            {isSelected && <Check size={12} />}
                          </div>
                        </div>
                        <p className="text-[10px] text-text-muted line-clamp-2 leading-tight">
                          {cat.description || "Evidence-based health guidance"}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {/* Step 1 Actions */}
                <div className="pt-4 border-t border-border flex items-center justify-between">
                  <span className="text-xs font-heading font-semibold text-text-secondary">
                    {selectedTopics.length} topic{selectedTopics.length === 1 ? "" : "s"} selected
                  </span>

                  <Button
                    variant="primary"
                    size="lg"
                    type="button"
                    disabled={selectedTopics.length === 0}
                    onClick={() => setStep(2)}
                    className="inline-flex items-center gap-2"
                  >
                    <span>Next: Content Preferences</span>
                    <ArrowRight size={16} />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: CONTENT PREFERENCES */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <span className="text-xs font-heading font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 mb-1.5">
                    <Layers size={14} className="text-primary" /> Delivery & Format
                  </span>
                  <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl text-dark">
                    How do you prefer to consume wellness content?
                  </h1>
                  <p className="text-xs sm:text-sm text-text-secondary mt-1 max-w-2xl">
                    Choose your favorite formats. We will tune your dashboard and recommendations to prioritize the mediums you enjoy most.
                  </p>
                </div>

                {/* Formats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[48vh] overflow-y-auto pr-1">
                  {formats.map((fmt) => {
                    const isSelected = selectedFormats.includes(fmt.id);
                    return (
                      <div
                        key={fmt.id}
                        onClick={() => toggleFormat(fmt.id)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                          isSelected
                            ? "bg-primary/5 border-primary shadow-xs scale-[1.01]"
                            : "bg-surface border-border hover:border-primary/40 hover:bg-white"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              isSelected ? "bg-primary text-white" : "bg-white text-primary border border-primary/20"
                            }`}
                          >
                            {renderFormatIcon(fmt.id)}
                          </div>
                          <div>
                            <h4 className="font-heading font-bold text-sm text-dark">{fmt.label}</h4>
                            <p className="text-xs text-text-secondary mt-0.5 leading-snug">
                              {fmt.description}
                            </p>
                          </div>
                        </div>

                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5 ${
                            isSelected ? "bg-primary text-white" : "border border-border"
                          }`}
                        >
                          {isSelected && <Check size={12} />}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Step 2 Actions */}
                <div className="pt-4 border-t border-border flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex items-center gap-1.5 text-xs font-heading font-semibold text-text-secondary hover:text-primary transition-colors"
                  >
                    <ArrowLeft size={15} /> Back to Topics
                  </button>

                  <Button
                    variant="primary"
                    size="lg"
                    type="button"
                    disabled={selectedFormats.length === 0 || saving}
                    onClick={handleCompleteOnboarding}
                    className="inline-flex items-center gap-2"
                  >
                    {saving ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Finish & Launch Feed</span>
                        <Sparkles size={16} />
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: CELEBRATION & PERSONALIZED CONFIRMATION */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="py-6 sm:py-10 text-center space-y-6"
              >
                <div className="w-20 h-20 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-inner border border-primary/20">
                  <Sparkles size={36} className="animate-pulse" />
                </div>

                <div className="max-w-md mx-auto space-y-2">
                  <h1 className="font-display text-3xl sm:text-4xl text-dark">
                    Your Personalized Feed is Ready!
                  </h1>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    HealthGuru has configured your recommendation engine. Here are your active preferences:
                  </p>
                </div>

                {/* Summary Pills */}
                <div className="max-w-lg mx-auto p-5 rounded-2xl bg-surface border border-primary/15 space-y-4 text-left">
                  <div>
                    <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-text-muted block mb-2">
                      Selected Health Topics ({selectedTopics.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedTopics.map((topic) => (
                        <span
                          key={topic}
                          className="text-xs font-heading font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border">
                    <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-text-muted block mb-2">
                      Preferred Formats ({selectedFormats.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedFormats.map((fmt) => (
                        <span
                          key={fmt}
                          className="text-xs font-heading font-semibold px-2.5 py-1 rounded-full bg-white text-dark border border-border capitalize"
                        >
                          {fmt.replace("_", " ")}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Next Steps CTA */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link href="/account">
                    <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-md">
                      Go to My Account Dashboard &rarr;
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto">
                      Explore HealthGuru Home
                    </Button>
                  </Link>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

        </div>
      </main>

      {/* Footer Disclaimer */}
      <footer className="site-container max-w-4xl mx-auto text-center text-[11px] text-text-muted mt-6 relative z-10 flex items-center justify-center gap-1.5">
        <ShieldCheck size={13} className="text-primary" />
        <span>Preferences are private and used solely to recommend educational wellness content.</span>
      </footer>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cream flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      }
    >
      <OnboardingWizard />
    </Suspense>
  );
}
