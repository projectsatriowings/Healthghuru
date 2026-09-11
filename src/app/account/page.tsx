"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Heart,
  Bookmark,
  History,
  Settings,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ExternalLink,
  BookOpen,
  Play,
  Trash2,
  Clock,
  Layers,
  LogOut,
  Mail,
  MapPin,
  Flame,
  Check,
  Stethoscope,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ContentCard } from "@/components/media/ContentCard";
import { PrescriptionUploader } from "@/components/personalization/PrescriptionUploader";
import { PrescriptionInsightsCard } from "@/components/personalization/PrescriptionInsightsCard";
import { formatDate } from "@/lib/utils";

type AccountTab = "profile" | "interests" | "formats" | "prescriptions" | "saved" | "history" | "security";

function AccountDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const tabParam = (searchParams.get("tab") as AccountTab) || "profile";
  const [activeTab, setActiveTab] = useState<AccountTab>(tabParam);

  // Profile data
  const [profile, setProfile] = useState<any>(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [newsletterOptIn, setNewsletterOptIn] = useState(true);
  const [digestFreq, setDigestFreq] = useState("weekly");

  // Preferences data
  const [availableCategories, setAvailableCategories] = useState<any[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [availableContentTypes, setAvailableContentTypes] = useState<any[]>([]);
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>([]);

  // Prescriptions data
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [prescriptionContent, setPrescriptionContent] = useState<any[]>([]);
  const [prescriptionsLoading, setPrescriptionsLoading] = useState(false);

  // Saved content data
  const [savedItems, setSavedItems] = useState<any[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);

  // History data
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // State flags
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Redirect if unauthenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/account");
    }
  }, [status, router]);

  // Sync tab with URL
  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Load initial profile and preferences data
  useEffect(() => {
    if (status === "authenticated") {
      fetchProfile();
      fetchPreferences();
      fetchPrescriptions();
    }
  }, [status]);

  // Fetch when tab changes
  useEffect(() => {
    if (activeTab === "saved") {
      fetchSavedContent();
    } else if (activeTab === "history") {
      fetchHistory();
    } else if (activeTab === "prescriptions") {
      fetchPrescriptions();
    }
  }, [activeTab]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/user/profile");
      const data = await res.json();
      if (res.ok && data.success) {
        setProfile(data.profile);
        setName(data.profile.name || "");
        setBio(data.profile.bio || "");
        setCity(data.profile.city || "");
        setNewsletterOptIn(data.profile.newsletter_opt_in ?? true);
        setDigestFreq(data.profile.email_digest_frequency || "weekly");
      }
    } catch (err) {
      console.error("Error loading profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPreferences = async () => {
    try {
      const res = await fetch("/api/user/preferences");
      const data = await res.json();
      if (res.ok && data.success) {
        setSelectedTopics(data.selectedTopics || []);
        setSelectedContentTypes(data.selectedContentTypes || []);
        setAvailableCategories(data.availableCategories || []);
        setAvailableContentTypes(data.availableContentTypes || []);
      }
    } catch (err) {
      console.error("Error loading preferences:", err);
    }
  };

  const fetchSavedContent = async () => {
    try {
      setSavedLoading(true);
      const res = await fetch("/api/user/saved");
      const data = await res.json();
      if (res.ok && data.success) {
        setSavedItems(data.items || []);
      }
    } catch (err) {
      console.error("Error loading saved items:", err);
    } finally {
      setSavedLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);
      const res = await fetch("/api/user/history");
      const data = await res.json();
      if (res.ok && data.success) {
        setHistoryItems(data.items || []);
      }
    } catch (err) {
      console.error("Error loading history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchPrescriptions = async () => {
    try {
      setPrescriptionsLoading(true);
      const res = await fetch("/api/user/prescriptions");
      const data = await res.json();
      if (res.ok && data.success) {
        setPrescriptions(data.prescriptions || []);
        setPrescriptionContent(data.matchedContent || []);
      }
    } catch (err) {
      console.error("Error loading prescriptions:", err);
    } finally {
      setPrescriptionsLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          bio,
          city,
          newsletter_opt_in: newsletterOptIn,
          email_digest_frequency: digestFreq,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile.");

      setStatusMessage({ type: "success", text: "Profile details saved successfully!" });
      setProfile((prev: any) => ({ ...prev, ...data.profile }));
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to update profile." });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleTopic = (topicName: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topicName) ? prev.filter((t) => t !== topicName) : [...prev, topicName]
    );
  };

  const handleToggleContentType = (typeId: string) => {
    setSelectedContentTypes((prev) =>
      prev.includes(typeId) ? prev.filter((t) => t !== typeId) : [...prev, typeId]
    );
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/user/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topics: selectedTopics,
          contentTypes: selectedContentTypes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save preferences.");

      setStatusMessage({ type: "success", text: "Your health topic preferences have been saved!" });
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to save preferences." });
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveSavedItem = async (contentId: string) => {
    try {
      const res = await fetch(`/api/user/saved/${contentId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSavedItems((prev) => prev.filter((item) => item.id !== contentId));
        setStatusMessage({ type: "success", text: "Item removed from saved bookmarks." });
      }
    } catch (err) {
      console.error("Error removing saved item:", err);
    }
  };

  const handleClearHistory = async () => {
    if (!confirm("Are you sure you want to clear your reading and viewing history?")) return;

    try {
      const res = await fetch("/api/user/history", {
        method: "DELETE",
      });
      if (res.ok) {
        setHistoryItems([]);
        setStatusMessage({ type: "success", text: "Reading history cleared." });
      }
    } catch (err) {
      console.error("Error clearing history:", err);
    }
  };

  if (status === "loading" || (loading && !profile)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-cream">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-xs font-heading font-semibold text-text-muted">Loading your account...</p>
        </div>
      </div>
    );
  }

  const userInitials = profile?.name
    ? profile.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "HG";

  return (
    <div className="min-h-screen bg-cream py-8 sm:py-12">
      <div className="site-container">
        
        {/* User Greeting Hero Banner */}
        <div className="bg-white rounded-3xl border border-primary/15 p-6 sm:p-8 shadow-sm mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary via-secondary to-accent" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-hero text-white flex items-center justify-center font-heading font-bold text-2xl shadow-md border-2 border-white shrink-0">
                {userInitials}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-display text-2xl sm:text-3xl text-dark">
                    {profile?.name || "HealthGuru Member"}
                  </h1>
                  <span className="text-[10px] font-heading font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {profile?.role === "admin" ? "Administrator" : "Verified Member"}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-text-secondary mt-0.5">{profile?.email}</p>
                <p className="text-[11px] text-text-muted mt-1 flex items-center gap-1.5">
                  <Clock size={12} />
                  <span>Member since {profile?.created_at ? formatDate(profile.created_at) : "2025"}</span>
                </p>
              </div>
            </div>

            {/* Account Quick Stats */}
            <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
              <div className="px-4 py-2.5 rounded-2xl bg-surface border border-primary/10 text-center shrink-0">
                <span className="block font-heading font-bold text-lg text-primary">
                  {selectedTopics.length}
                </span>
                <span className="text-[10px] font-heading uppercase tracking-wider text-text-muted">
                  Interests
                </span>
              </div>
              <div className="px-4 py-2.5 rounded-2xl bg-surface border border-primary/10 text-center shrink-0">
                <span className="block font-heading font-bold text-lg text-primary">
                  {prescriptions.length}
                </span>
                <span className="text-[10px] font-heading uppercase tracking-wider text-text-muted">
                  Prescriptions
                </span>
              </div>
              <div className="px-4 py-2.5 rounded-2xl bg-surface border border-primary/10 text-center shrink-0">
                <span className="block font-heading font-bold text-lg text-primary">
                  {profile?.stats?.saved_count ?? savedItems.length}
                </span>
                <span className="text-[10px] font-heading uppercase tracking-wider text-text-muted">
                  Saved Items
                </span>
              </div>
              <div className="px-4 py-2.5 rounded-2xl bg-surface border border-primary/10 text-center shrink-0">
                <span className="block font-heading font-bold text-lg text-primary">
                  {profile?.stats?.activity_count ?? historyItems.length}
                </span>
                <span className="text-[10px] font-heading uppercase tracking-wider text-text-muted">
                  Activities
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Alerts */}
        <AnimatePresence>
          {statusMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-6 p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs font-medium ${
                statusMessage.type === "success"
                  ? "bg-green-50 border-green-200 text-primary"
                  : "bg-red-50 border-red-200 text-red-700"
              }`}
            >
              <div className="flex items-center gap-2">
                {statusMessage.type === "success" ? (
                  <CheckCircle2 size={16} className="text-primary shrink-0" />
                ) : (
                  <AlertCircle size={16} className="text-red-600 shrink-0" />
                )}
                <span>{statusMessage.text}</span>
              </div>
              <button
                type="button"
                onClick={() => setStatusMessage(null)}
                className="text-xs hover:underline font-bold"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dashboard Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Navigation Tabs Sidebar */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-primary/15 p-4 shadow-sm space-y-1.5 sticky top-24">
            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs sm:text-sm font-heading font-semibold transition-all ${
                activeTab === "profile"
                  ? "bg-primary text-white shadow-xs"
                  : "text-text-primary hover:bg-surface hover:text-primary"
              }`}
            >
              <div className="flex items-center gap-3">
                <User size={16} />
                <span>Profile & Details</span>
              </div>
              <ArrowRight size={14} className={activeTab === "profile" ? "text-white" : "text-text-muted"} />
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("interests")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs sm:text-sm font-heading font-semibold transition-all ${
                activeTab === "interests"
                  ? "bg-primary text-white shadow-xs"
                  : "text-text-primary hover:bg-surface hover:text-primary"
              }`}
            >
              <div className="flex items-center gap-3">
                <Heart size={16} />
                <span>My Health Interests</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 font-mono">
                {selectedTopics.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("formats")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs sm:text-sm font-heading font-semibold transition-all ${
                activeTab === "formats"
                  ? "bg-primary text-white shadow-xs"
                  : "text-text-primary hover:bg-surface hover:text-primary"
              }`}
            >
              <div className="flex items-center gap-3">
                <Layers size={16} />
                <span>Content Preferences</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 font-mono">
                {selectedContentTypes.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("prescriptions")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs sm:text-sm font-heading font-semibold transition-all ${
                activeTab === "prescriptions"
                  ? "bg-primary text-white shadow-xs"
                  : "text-text-primary hover:bg-surface hover:text-primary"
              }`}
            >
              <div className="flex items-center gap-3">
                <Stethoscope size={16} />
                <span>Prescriptions & Vault</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 font-mono">
                {prescriptions.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("saved")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs sm:text-sm font-heading font-semibold transition-all ${
                activeTab === "saved"
                  ? "bg-primary text-white shadow-xs"
                  : "text-text-primary hover:bg-surface hover:text-primary"
              }`}
            >
              <div className="flex items-center gap-3">
                <Bookmark size={16} />
                <span>Saved Articles & Media</span>
              </div>
              <ArrowRight size={14} className={activeTab === "saved" ? "text-white" : "text-text-muted"} />
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("history")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs sm:text-sm font-heading font-semibold transition-all ${
                activeTab === "history"
                  ? "bg-primary text-white shadow-xs"
                  : "text-text-primary hover:bg-surface hover:text-primary"
              }`}
            >
              <div className="flex items-center gap-3">
                <History size={16} />
                <span>Reading & Viewing History</span>
              </div>
              <ArrowRight size={14} className={activeTab === "history" ? "text-white" : "text-text-muted"} />
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("security")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs sm:text-sm font-heading font-semibold transition-all ${
                activeTab === "security"
                  ? "bg-primary text-white shadow-xs"
                  : "text-text-primary hover:bg-surface hover:text-primary"
              }`}
            >
              <div className="flex items-center gap-3">
                <ShieldCheck size={16} />
                <span>Security & Privacy</span>
              </div>
              <ArrowRight size={14} className={activeTab === "security" ? "text-white" : "text-text-muted"} />
            </button>

            <div className="pt-3 border-t border-border mt-3">
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-heading font-semibold text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={16} />
                <span>Sign Out of Account</span>
              </button>
            </div>
          </div>

          {/* Right Tab Panel Content */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-primary/15 p-6 sm:p-8 shadow-sm">
            
            {/* 1. Profile & Details Tab */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-2xl text-dark">Profile Information</h2>
                  <p className="text-xs sm:text-sm text-text-secondary mt-1">
                    Manage your personal account details, location, and communication preferences.
                  </p>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-heading font-semibold uppercase tracking-wider text-text-primary">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full name"
                        className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-heading font-semibold uppercase tracking-wider text-text-primary">
                        Email Address (Read Only)
                      </label>
                      <input
                        type="email"
                        disabled
                        value={profile?.email || ""}
                        className="w-full px-4 py-2.5 bg-gray-100 border border-border rounded-xl text-sm text-text-muted cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-heading font-semibold uppercase tracking-wider text-text-primary">
                      Bio / Wellness Goal Summary
                    </label>
                    <textarea
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Share a short bio or primary health focus (e.g. Improving sleep quality and strength training)..."
                      className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-heading font-semibold uppercase tracking-wider text-text-primary">
                        City / Region
                      </label>
                      <div className="relative">
                        <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="e.g. New York, USA"
                          className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-heading font-semibold uppercase tracking-wider text-text-primary">
                        Email Digest Frequency
                      </label>
                      <select
                        value={digestFreq}
                        onChange={(e) => setDigestFreq(e.target.value)}
                        className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                      >
                        <option value="daily">Daily Health Dispatch</option>
                        <option value="weekly">Weekly Wellness Digest (Recommended)</option>
                        <option value="monthly">Monthly Clinical Review</option>
                        <option value="never">Do Not Send Digests</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="flex items-center gap-2.5 cursor-pointer text-xs text-text-secondary select-none">
                      <input
                        type="checkbox"
                        checked={newsletterOptIn}
                        onChange={(e) => setNewsletterOptIn(e.target.checked)}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30 accent-primary cursor-pointer"
                      />
                      <span>Receive breaking health research alerts and community announcements.</span>
                    </label>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button variant="primary" size="md" type="submit" disabled={saving}>
                      {saving ? "Saving Changes..." : "Save Profile Changes"}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* 2. My Health Interests Tab */}
            {activeTab === "interests" && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-2xl text-dark">My Health Interests</h2>
                  <p className="text-xs sm:text-sm text-text-secondary mt-1">
                    Select the topics you want to prioritize in your personal feed, recommendations, and daily wellness tips.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {availableCategories.map((cat) => {
                    const isSelected = selectedTopics.includes(cat.name);
                    return (
                      <button
                        key={cat.slug}
                        type="button"
                        onClick={() => handleToggleTopic(cat.name)}
                        className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                          isSelected
                            ? "bg-primary/10 border-primary text-primary font-bold shadow-xs"
                            : "bg-surface border-border text-text-primary hover:border-primary/40"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-2">
                          <span className="font-heading text-xs sm:text-sm truncate">{cat.name}</span>
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                              isSelected ? "bg-primary text-white" : "border border-border"
                            }`}
                          >
                            {isSelected && <Check size={12} />}
                          </div>
                        </div>
                        <p className="text-[10px] text-text-muted line-clamp-2 leading-tight">
                          {cat.description || "Evidence-based health guides"}
                        </p>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-border">
                  <span className="text-xs text-text-muted">
                    {selectedTopics.length} topic{selectedTopics.length === 1 ? "" : "s"} selected
                  </span>
                  <Button variant="primary" size="md" onClick={handleSavePreferences} disabled={saving}>
                    {saving ? "Saving..." : "Save Interest Preferences"}
                  </Button>
                </div>
              </div>
            )}

            {/* 3. Content Preferences Tab */}
            {activeTab === "formats" && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-2xl text-dark">Preferred Content Formats</h2>
                  <p className="text-xs sm:text-sm text-text-secondary mt-1">
                    Tell HealthGuru how you like to consume wellness intelligence.
                  </p>
                </div>

                <div className="space-y-3">
                  {availableContentTypes.map((format) => {
                    const isSelected = selectedContentTypes.includes(format.id);
                    return (
                      <div
                        key={format.id}
                        onClick={() => handleToggleContentType(format.id)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? "bg-primary/5 border-primary shadow-xs"
                            : "bg-surface border-border hover:border-primary/40"
                        }`}
                      >
                        <div>
                          <h4 className="font-heading font-bold text-sm text-dark">{format.label}</h4>
                          <p className="text-xs text-text-secondary mt-0.5">{format.description}</p>
                        </div>
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${
                            isSelected ? "bg-primary text-white" : "border border-border"
                          }`}
                        >
                          {isSelected && <Check size={14} />}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-border">
                  <span className="text-xs text-text-muted">
                    {selectedContentTypes.length} format{selectedContentTypes.length === 1 ? "" : "s"} selected
                  </span>
                  <Button variant="primary" size="md" onClick={handleSavePreferences} disabled={saving}>
                    {saving ? "Saving..." : "Save Format Preferences"}
                  </Button>
                </div>
              </div>
            )}

            {/* 4. Prescriptions & Health Vault Tab */}
            {activeTab === "prescriptions" && (
              <div className="space-y-8">
                <div>
                  <h2 className="font-display text-2xl text-dark">Prescriptions & Health Vault</h2>
                  <p className="text-xs sm:text-sm text-text-secondary mt-1">
                    Upload medical prescription photos or doctor notes. HealthGuru will securely analyze key wellness markers to recommend targeted lifestyle, diet, and exercise guides.
                  </p>
                </div>

                {/* Prescription Upload Card */}
                <PrescriptionUploader
                  onSuccess={(newPrescription) => {
                    setPrescriptions((prev) => [newPrescription, ...prev]);
                    fetchPrescriptions();
                    setStatusMessage({
                      type: "success",
                      text: "Prescription analyzed successfully! Your recommendations have been updated.",
                    });
                  }}
                />

                {/* Uploaded Prescriptions List */}
                <div className="space-y-4">
                  <h3 className="font-heading font-bold text-lg text-dark flex items-center gap-2">
                    <Stethoscope size={18} className="text-primary" />
                    <span>Your Uploaded Prescriptions ({prescriptions.length})</span>
                  </h3>

                  {prescriptionsLoading ? (
                    <div className="py-8 text-center">
                      <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-2" />
                      <p className="text-xs text-text-muted">Analyzing clinical records...</p>
                    </div>
                  ) : prescriptions.length === 0 ? (
                    <div className="text-center py-10 px-4 rounded-3xl bg-surface border border-border/80">
                      <Stethoscope size={32} className="mx-auto text-text-muted mb-3 opacity-40" />
                      <h4 className="font-heading font-bold text-base text-dark">No Prescriptions Uploaded Yet</h4>
                      <p className="text-xs text-text-secondary max-w-sm mx-auto mt-1">
                        Attach a photo of your doctor&apos;s prescription above to automatically receive tailored dietary advice and health guides.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {prescriptions.map((presc) => (
                        <PrescriptionInsightsCard
                          key={presc.id}
                          prescription={presc}
                          onDelete={(id) => {
                            setPrescriptions((prev) => prev.filter((p) => p.id !== id));
                            setStatusMessage({ type: "success", text: "Prescription record removed." });
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Prescription Matched Recommended Content */}
                {prescriptionContent.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                      <Sparkles size={18} className="text-primary" />
                      <div>
                        <h3 className="font-heading font-bold text-lg text-dark">
                          Recommended Guides for Your Prescriptions
                        </h3>
                        <p className="text-xs text-text-secondary">
                          Evidence-based articles and videos matched to your detected health conditions.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {prescriptionContent.slice(0, 4).map((item) => (
                        <Link
                          key={item.id}
                          href={
                            item.contentType === "video"
                              ? `/video/${item.slug}`
                              : item.contentType === "magazine"
                              ? `/magazines`
                              : `/blog/${item.slug}`
                          }
                          className="group p-4 rounded-2xl bg-surface border border-border hover:border-primary/40 hover:shadow-xs transition-all flex flex-col justify-between"
                        >
                          <div>
                            <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-primary px-2 py-0.5 rounded-full bg-white border border-primary/15">
                              {item.category}
                            </span>
                            <h4 className="font-heading font-bold text-sm text-dark group-hover:text-primary transition-colors mt-2 line-clamp-2">
                              {item.title}
                            </h4>
                            <p className="text-xs text-text-muted line-clamp-2 mt-1 font-sans">
                              {item.excerpt}
                            </p>
                          </div>
                          <div className="mt-3 pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-text-muted">
                            <span>{item.authorName || "HealthGuru"}</span>
                            <span className="text-primary font-semibold group-hover:underline">
                              Explore Guide &rarr;
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 5. Saved Content Tab */}
            {activeTab === "saved" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-2xl text-dark">Saved Articles & Media</h2>
                    <p className="text-xs sm:text-sm text-text-secondary mt-1">
                      Articles, videos, and digests you bookmarked for later reading.
                    </p>
                  </div>
                </div>

                {savedLoading ? (
                  <div className="py-12 text-center">
                    <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-xs text-text-muted">Loading saved bookmarks...</p>
                  </div>
                ) : savedItems.length === 0 ? (
                  <div className="text-center py-12 px-4 rounded-3xl bg-surface border border-border/80">
                    <Bookmark size={32} className="mx-auto text-text-muted mb-3 opacity-40" />
                    <h3 className="font-heading font-bold text-base text-dark">No Saved Content Yet</h3>
                    <p className="text-xs text-text-secondary max-w-sm mx-auto mt-1 mb-5">
                      Explore our health articles, videos, and clinical digests, then click the bookmark icon to save them here.
                    </p>
                    <Link href="/latest">
                      <Button variant="primary" size="sm">
                        Explore Health Feed &rarr;
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {savedItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl bg-surface border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                      >
                        <div className="space-y-1 max-w-lg">
                          <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-primary px-2 py-0.5 rounded-full bg-white border border-primary/15">
                            {item.category || "Wellness"}
                          </span>
                          <h4 className="font-heading font-bold text-sm text-dark group-hover:text-primary transition-colors">
                            <Link
                              href={
                                item.content_type === "video"
                                  ? `/video/${item.slug}`
                                  : !item.is_external
                                  ? `/blog/${item.slug}`
                                  : item.canonical_url
                              }
                            >
                              {item.title}
                            </Link>
                          </h4>
                          <p className="text-xs text-text-muted line-clamp-1">{item.excerpt || item.description}</p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <Link
                            href={
                              item.content_type === "video"
                                ? `/video/${item.slug}`
                                : !item.is_external
                                ? `/blog/${item.slug}`
                                : item.canonical_url
                            }
                            className="px-3 py-1.5 text-xs font-heading font-semibold text-primary bg-white border border-primary/20 rounded-xl hover:bg-primary hover:text-white transition-all inline-flex items-center gap-1"
                          >
                            {item.content_type === "video" ? <Play size={12} /> : <BookOpen size={12} />}
                            <span>{item.content_type === "video" ? "Watch" : "Read"}</span>
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleRemoveSavedItem(item.id)}
                            className="p-2 text-text-muted hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                            title="Remove from saved"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 5. Reading & Viewing History Tab */}
            {activeTab === "history" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-2xl text-dark">Reading & Viewing History</h2>
                    <p className="text-xs sm:text-sm text-text-secondary mt-1">
                      Content you have recently explored across HealthGuru.
                    </p>
                  </div>
                  {historyItems.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearHistory}
                      className="text-xs font-heading font-semibold text-red-600 hover:underline flex items-center gap-1"
                    >
                      <Trash2 size={13} />
                      <span>Clear History</span>
                    </button>
                  )}
                </div>

                {historyLoading ? (
                  <div className="py-12 text-center">
                    <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-xs text-text-muted">Loading your activity history...</p>
                  </div>
                ) : historyItems.length === 0 ? (
                  <div className="text-center py-12 px-4 rounded-3xl bg-surface border border-border/80">
                    <History size={32} className="mx-auto text-text-muted mb-3 opacity-40" />
                    <h3 className="font-heading font-bold text-base text-dark">No History Recorded Yet</h3>
                    <p className="text-xs text-text-secondary max-w-sm mx-auto mt-1 mb-5">
                      Articles and videos you read or watch while signed in will automatically appear here.
                    </p>
                    <Link href="/">
                      <Button variant="primary" size="sm">
                        Browse Home Feed &rarr;
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {historyItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-2xl bg-surface border border-border flex items-center justify-between gap-4"
                      >
                        <div className="space-y-0.5 truncate">
                          <div className="flex items-center gap-2 text-[10px] text-text-muted">
                            <span className="capitalize font-semibold text-primary">{item.last_action || "Viewed"}</span>
                            <span>·</span>
                            <span>{item.viewed_at ? formatDate(item.viewed_at) : "Recently"}</span>
                          </div>
                          <h4 className="font-heading font-semibold text-xs sm:text-sm text-dark truncate hover:text-primary">
                            <Link
                              href={
                                item.content_type === "video"
                                  ? `/video/${item.slug}`
                                  : !item.is_external
                                  ? `/blog/${item.slug}`
                                  : item.canonical_url
                              }
                            >
                              {item.title}
                            </Link>
                          </h4>
                        </div>

                        <Link
                          href={
                            item.content_type === "video"
                              ? `/video/${item.slug}`
                              : !item.is_external
                              ? `/blog/${item.slug}`
                              : item.canonical_url
                          }
                          className="text-xs font-semibold text-primary hover:underline shrink-0"
                        >
                          View Again &rarr;
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 6. Security & Privacy Tab */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-2xl text-dark">Security & Privacy Settings</h2>
                  <p className="text-xs sm:text-sm text-text-secondary mt-1">
                    Manage your password, authentication safety, and medical data privacy.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-surface border border-primary/15 space-y-2">
                  <div className="flex items-center gap-2 text-primary font-heading font-bold text-xs uppercase tracking-wider">
                    <ShieldCheck size={18} />
                    <span>256-Bit SSL Health Privacy Boundary</span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    HealthGuru never sells or shares your personal engagement telemetry or interest preferences. All recommendation signals are computed securely to tailor educational content only.
                  </p>
                </div>

                <div className="pt-2 border-t border-border space-y-4">
                  <h3 className="font-heading font-bold text-sm text-dark">Password Management</h3>
                  <p className="text-xs text-text-secondary">
                    Need to update your password? You can request a password reset email or update it directly.
                  </p>
                  <Link href="/login?tab=forgot">
                    <Button variant="outline" size="sm">
                      Change Password &rarr;
                    </Button>
                  </Link>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cream flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      }
    >
      <AccountDashboard />
    </Suspense>
  );
}
