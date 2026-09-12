'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import {
  Sparkles,
  Heart,
  Bookmark,
  History,
  Compass,
  ArrowRight,
  BookOpen,
  Play,
  Sliders,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Stethoscope,
} from 'lucide-react';
import { WellnessTipCard } from '@/components/personalization/WellnessTipCard';
import { RecommendedFeed } from '@/components/personalization/RecommendedFeed';
import { PillBadge } from '@/components/ui/PillBadge';
import { Button } from '@/components/ui/Button';
import { WellnessTip } from '@/lib/recommendations';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const user = session?.user;

  const [wellnessTip, setWellnessTip] = useState<WellnessTip | null>(null);
  const [userInterests, setUserInterests] = useState<string[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [savedItems, setSavedItems] = useState<any[]>([]);
  const [recentHistory, setRecentHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);

        // 1. Fetch recommendations endpoint to get the wellness tip
        const recRes = await fetch('/api/recommendations?limit=1&includeTip=true');
        if (recRes.ok) {
          const recData = await recRes.json();
          if (recData.wellnessTip) {
            setWellnessTip(recData.wellnessTip);
          }
        }

        // If authenticated, load profile preferences, prescriptions, saved items, and history
        if (session?.user) {
          const [prefRes, prescRes, savedRes, historyRes] = await Promise.all([
            fetch('/api/user/preferences'),
            fetch('/api/user/prescriptions'),
            fetch('/api/user/saved'),
            fetch('/api/user/history'),
          ]);

          if (prefRes.ok) {
            const prefData = await prefRes.json();
            setUserInterests(prefData.selectedTopics || []);
          }

          if (prescRes.ok) {
            const prescData = await prescRes.json();
            setPrescriptions(prescData.prescriptions || []);
          }

          if (savedRes.ok) {
            const savedData = await savedRes.json();
            setSavedItems(savedData.items?.slice(0, 4) || []);
          }

          if (historyRes.ok) {
            const historyData = await historyRes.json();
            setRecentHistory(historyData.items?.slice(0, 3) || []);
          }
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [session]);

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'HG';

  const isAuthenticated = status === 'authenticated' && Boolean(user);

  return (
    <div className="min-h-screen bg-cream py-8 sm:py-12">
      <div className="site-container space-y-8">
        {/* Top Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-white border border-primary/15 p-6 sm:p-8 shadow-sm">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary via-secondary to-accent" />
          <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-start sm:items-center gap-4 sm:gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-hero text-white flex items-center justify-center font-heading font-bold text-2xl shadow-md border-2 border-white shrink-0">
                {isAuthenticated ? userInitials : <Sparkles size={28} />}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-display text-2xl sm:text-3xl text-dark">
                    {isAuthenticated
                      ? `Welcome back, ${user?.name?.split(' ')[0] || 'Friend'}!`
                      : 'Personalized Health Intelligence'}
                  </h1>
                  <span className="text-[10px] font-heading font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {isAuthenticated ? 'Personalized Feed' : 'Curated Hub'}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-text-secondary">
                  {isAuthenticated
                    ? 'Your daily health dispatch, curated based on your active goals and topics.'
                    : 'Evidence-based medical journalism, workout physiology, and nutritional science.'}
                </p>

                {/* Active Interests Pills */}
                {isAuthenticated && userInterests.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-1.5">
                    <span className="text-[11px] font-medium text-text-muted">Interests:</span>
                    {userInterests.slice(0, 5).map((topic) => (
                      <span
                        key={topic}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface text-primary border border-primary/15"
                      >
                        {topic}
                      </span>
                    ))}
                    {userInterests.length > 5 && (
                      <span className="text-[10px] text-text-muted">
                        +{userInterests.length - 5} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto flex-wrap">
              {isAuthenticated ? (
                <>
                  <Link href="/account?tab=prescriptions">
                    <button className="px-3.5 py-2 rounded-xl text-xs font-heading font-semibold text-primary bg-primary/10 border border-primary/20 hover:bg-primary hover:text-white transition-all inline-flex items-center gap-1.5">
                      <Stethoscope size={14} />
                      <span>Prescriptions ({prescriptions.length})</span>
                    </button>
                  </Link>
                  <Link href="/account?tab=interests">
                    <button className="px-3.5 py-2 rounded-xl text-xs font-heading font-semibold text-text-primary bg-surface border border-border hover:border-primary/40 hover:text-primary transition-all inline-flex items-center gap-1.5">
                      <Sliders size={14} />
                      <span>Edit Interests</span>
                    </button>
                  </Link>
                  <Link href="/account">
                    <button className="px-4 py-2 rounded-xl text-xs font-heading font-semibold text-white bg-primary hover:bg-primary-dark transition-all inline-flex items-center gap-1.5 shadow-sm">
                      <span>Account Settings</span>
                    </button>
                  </Link>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login">
                    <Button variant="outline" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/onboarding">
                    <Button variant="primary" size="sm">
                      Personalize Feed &rarr;
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Two-Column Grid: Main Feed & Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Column (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* 1. Today's Wellness Tip */}
            {wellnessTip && (
              <WellnessTipCard
                tip={wellnessTip}
                onSave={(tipId) => {
                  setSavedItems((prev) => [{ id: tipId, title: wellnessTip.title, category: wellnessTip.category }, ...prev]);
                }}
              />
            )}

            {/* 2. Active Prescription Care Insights (If uploaded) */}
            {isAuthenticated && prescriptions.length > 0 && (
              <div className="bg-gradient-to-br from-[#F5FAF5] via-white to-surface rounded-3xl border border-primary/25 p-5 sm:p-6 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Stethoscope size={18} className="text-primary" />
                    <h3 className="font-heading font-bold text-base text-dark">
                      Prescription Insights: {prescriptions[0].title}
                    </h3>
                  </div>
                  <Link
                    href="/account?tab=prescriptions"
                    className="text-xs font-heading font-semibold text-primary hover:underline"
                  >
                    View Prescription Vault &rarr;
                  </Link>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs text-text-muted font-medium">Detected Focus:</span>
                  {(prescriptions[0].detected_conditions || []).map((cond: string, i: number) => (
                    <span
                      key={i}
                      className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold text-[11px] border border-primary/20"
                    >
                      {cond}
                    </span>
                  ))}
                </div>

                {prescriptions[0].actionable_insights && prescriptions[0].actionable_insights.length > 0 && (
                  <div className="text-xs text-text-secondary bg-white p-3 rounded-xl border border-border/60 space-y-1">
                    <p className="font-semibold text-dark text-[11px] uppercase tracking-wider">
                      ✦ Recommended Actionable Guidance:
                    </p>
                    <p className="leading-relaxed">
                      {prescriptions[0].actionable_insights[0]}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* 2. Continue Reading / Watching Strip (If history exists) */}
            {isAuthenticated && recentHistory.length > 0 && (
              <div className="bg-white rounded-3xl border border-primary/15 p-5 sm:p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <History size={16} className="text-primary" />
                    <h3 className="font-heading font-bold text-base text-dark">
                      Jump Back In (Recent Activity)
                    </h3>
                  </div>
                  <Link
                    href="/account?tab=history"
                    className="text-xs font-heading font-semibold text-primary hover:underline"
                  >
                    View All History &rarr;
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {recentHistory.map((hist, idx) => (
                    <Link
                      key={idx}
                      href={
                        hist.content_type === 'video'
                          ? `/video/${hist.slug}`
                          : hist.content_type === 'magazine'
                          ? `/magazines`
                          : `/blog/${hist.slug}`
                      }
                      className="group p-3 rounded-2xl bg-surface border border-border hover:border-primary/40 hover:shadow-xs transition-all flex flex-col justify-between"
                    >
                      <div>
                        <span className="text-[9px] font-heading font-bold uppercase tracking-wider text-primary px-1.5 py-0.5 rounded bg-white border border-primary/15">
                          {hist.category || 'Health'}
                        </span>
                        <h4 className="font-heading font-semibold text-xs text-dark group-hover:text-primary transition-colors line-clamp-2 mt-1.5 leading-snug">
                          {hist.title}
                        </h4>
                      </div>
                      <div className="mt-2.5 flex items-center justify-between text-[10px] text-text-muted border-t border-border/40 pt-1.5">
                        <span className="capitalize">{hist.action || 'Viewed'}</span>
                        <span className="text-primary font-semibold group-hover:underline inline-flex items-center gap-0.5">
                          Resume {hist.content_type === 'video' ? <Play size={8} /> : <BookOpen size={8} />}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Recommended For You Feed */}
            <div className="bg-white rounded-3xl border border-primary/15 p-6 sm:p-8 shadow-sm">
              <RecommendedFeed
                title={isAuthenticated ? 'Recommended For You' : 'Trending & Curated Health'}
                subtitle={
                  isAuthenticated
                    ? 'Algorithmic feed tuned to your selected topics, engagement history, and bookmarked formats.'
                    : 'Explore the most impactful medical research, nutrition breakthroughs, and wellness videos.'
                }
                userPersonalized={isAuthenticated}
                limit={12}
                showFilters={true}
              />
            </div>
          </div>

          {/* Right Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* My Saved Bookmarks Quick Box */}
            <div className="bg-white rounded-3xl border border-primary/15 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bookmark size={16} className="text-primary" />
                  <h3 className="font-heading font-bold text-base text-dark">Saved Library</h3>
                </div>
                {isAuthenticated && (
                  <Link
                    href="/account?tab=saved"
                    className="text-xs font-heading font-semibold text-primary hover:underline"
                  >
                    View All &rarr;
                  </Link>
                )}
              </div>

              {isAuthenticated ? (
                savedItems.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-surface border border-border/80 text-center space-y-2">
                    <p className="text-xs text-text-secondary">No saved bookmarks yet.</p>
                    <p className="text-[11px] text-text-muted">
                      Click the bookmark icon on any article or video to save it for quick reference.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {savedItems.map((item) => (
                      <Link
                        key={item.id}
                        href={
                          item.content_type === 'video'
                            ? `/video/${item.slug}`
                            : !item.is_external
                            ? `/blog/${item.slug}`
                            : item.canonical_url
                        }
                        className="group p-3 rounded-2xl bg-surface border border-border hover:border-primary/40 hover:bg-primary/5 transition-all block"
                      >
                        <span className="text-[9px] font-heading font-bold uppercase tracking-wider text-primary px-1.5 py-0.5 rounded bg-white border border-primary/15">
                          {item.category || 'Wellness'}
                        </span>
                        <h4 className="font-heading font-semibold text-xs text-dark group-hover:text-primary transition-colors line-clamp-1 mt-1">
                          {item.title}
                        </h4>
                      </Link>
                    ))}
                  </div>
                )
              ) : (
                <div className="p-4 rounded-2xl bg-surface border border-border/80 text-center space-y-3">
                  <p className="text-xs text-text-secondary">
                    Create a free account to save health guides, articles, and workouts.
                  </p>
                  <Link href="/login">
                    <Button variant="primary" size="sm" className="w-full">
                      Sign In to Save
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Explore Health Topics Categories Box */}
            <div className="bg-white rounded-3xl border border-primary/15 p-5 sm:p-6 shadow-sm space-y-3.5">
              <div className="flex items-center gap-2">
                <Compass size={16} className="text-primary" />
                <h3 className="font-heading font-bold text-base text-dark">Explore Health Topics</h3>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: 'Nutrition', count: '24 articles', slug: 'nutrition' },
                  { name: 'Fitness', count: '18 workouts', slug: 'fitness' },
                  { name: 'Sleep', count: '12 guides', slug: 'sleep' },
                  { name: 'Mental Health', count: '15 guides', slug: 'mental-health' },
                  { name: 'Gut Health', count: '9 articles', slug: 'gut-health' },
                  { name: 'Healthy Aging', count: '14 studies', slug: 'healthy-aging' },
                ].map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/category/${cat.slug}`}
                    className="p-2.5 rounded-xl bg-surface border border-border hover:border-primary/40 hover:text-primary transition-all group"
                  >
                    <p className="font-heading font-bold text-xs text-dark group-hover:text-primary truncate">
                      {cat.name}
                    </p>
                    <p className="text-[10px] text-text-muted mt-0.5">{cat.count}</p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Medical Educational Assurance Banner */}
            <div className="bg-surface rounded-3xl border border-primary/20 p-5 space-y-2">
              <div className="flex items-center gap-2 text-primary font-heading font-bold text-xs uppercase tracking-wider">
                <ShieldCheck size={16} />
                <span>HealthGuru Clinical Standard</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed font-sans">
                Our recommendation algorithm prioritizes peer-reviewed medical research, clinical
                trials, and licensed practitioner insights with zero sponsored medical bias.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
