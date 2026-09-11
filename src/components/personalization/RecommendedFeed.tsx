'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Sparkles,
  Filter,
  Bookmark,
  BookOpen,
  Play,
  RotateCcw,
  ShieldCheck,
  Zap,
  Check,
} from 'lucide-react';
import { RecommendedContentItem } from '@/lib/recommendations';
import { PillBadge } from '@/components/ui/PillBadge';

interface RecommendedFeedProps {
  initialItems?: RecommendedContentItem[];
  userPersonalized?: boolean;
  title?: string;
  subtitle?: string;
  limit?: number;
  showFilters?: boolean;
  className?: string;
}

const CATEGORIES = [
  'All',
  'Nutrition',
  'Fitness',
  'Mental Health',
  'Sleep',
  'Gut Health',
  'Heart Health',
  'Healthy Aging',
  'Immunity',
];

const CONTENT_TYPES = [
  { label: 'All Formats', value: 'all' },
  { label: 'Articles', value: 'article' },
  { label: 'Videos & Shorts', value: 'video' },
  { label: 'Magazines', value: 'magazine' },
];

export function RecommendedFeed({
  initialItems = [],
  userPersonalized = false,
  title = 'Recommended For You',
  subtitle = 'Curated health insights and evidence-based media aligned with your wellness interests',
  limit = 12,
  showFilters = true,
  className = '',
}: RecommendedFeedProps) {
  const [items, setItems] = useState<RecommendedContentItem[]>(initialItems);
  const [loading, setLoading] = useState(initialItems.length === 0);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeType, setActiveType] = useState<string>('all');
  const [isPersonalized, setIsPersonalized] = useState(userPersonalized);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [savingId, setSavingId] = useState<string | null>(null);

  // Fetch initial saved IDs
  useEffect(() => {
    fetch('/api/user/saved')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.savedItems && Array.isArray(data.savedItems)) {
          setSavedIds(new Set(data.savedItems.map((s: any) => s.id)));
        }
      })
      .catch(() => {});
  }, []);

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('limit', String(limit));
      if (activeCategory !== 'All') params.set('category', activeCategory);
      if (activeType !== 'all') params.set('contentType', activeType);

      const res = await fetch(`/api/recommendations?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.recommendations || []);
        setIsPersonalized(Boolean(data.userPersonalized));
      }
    } catch (err) {
      console.error('Failed to load recommendations:', err);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, activeType, limit]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const handleToggleSave = async (contentId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (savingId) return;

    setSavingId(contentId);
    const isCurrentlySaved = savedIds.has(contentId);

    try {
      if (!isCurrentlySaved) {
        const res = await fetch('/api/user/saved', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contentId }),
        });
        if (res.ok) {
          setSavedIds((prev) => new Set(prev).add(contentId));
        }
      } else {
        const res = await fetch(`/api/user/saved/${contentId}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          setSavedIds((prev) => {
            const next = new Set(prev);
            next.delete(contentId);
            return next;
          });
        }
      }
    } catch (error) {
      console.error('Error toggling save:', error);
    } finally {
      setSavingId(null);
    }
  };

  const handleCardClick = (item: RecommendedContentItem) => {
    try {
      const actionType =
        item.contentType === 'video'
          ? 'watch'
          : item.contentType === 'magazine'
          ? 'magazine_read'
          : 'read';

      fetch('/api/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId: item.id,
          action: actionType,
          category: item.category,
        }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      // Non-blocking
    }
  };

  return (
    <section className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
              <Sparkles size={13} className="text-primary" />
              {isPersonalized ? 'Personalized For You' : 'Curated Highlights'}
            </span>
            {isPersonalized && (
              <span className="text-xs text-text-muted hidden sm:inline">
                • Tuned to your interests & reading habits
              </span>
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-dark tracking-tight">
            {title}
          </h2>
          <p className="text-sm text-text-secondary mt-1 max-w-2xl">{subtitle}</p>
        </div>

        {/* Format Pill Switcher */}
        {showFilters && (
          <div className="flex items-center gap-1.5 bg-surface p-1 rounded-xl border border-border/80 self-start md:self-auto overflow-x-auto max-w-full">
            {CONTENT_TYPES.map((type) => {
              const active = activeType === type.value;
              return (
                <button
                  key={type.value}
                  onClick={() => setActiveType(type.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                    active
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-text-muted hover:text-dark hover:bg-white/60'
                  }`}
                >
                  {type.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Category Pills Bar */}
      {showFilters && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <div className="text-xs font-semibold text-text-muted flex items-center gap-1 shrink-0 mr-1">
            <Filter size={13} />
            <span>Topic:</span>
          </div>
          {CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 border ${
                  isSelected
                    ? 'bg-dark text-white border-dark shadow-sm'
                    : 'bg-white text-text-secondary border-border hover:border-primary/40 hover:text-primary'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      )}

      {/* Content Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-border p-4 space-y-3 animate-pulse"
            >
              <div className="w-full aspect-[16/10] bg-surface rounded-xl" />
              <div className="h-4 bg-surface rounded-md w-3/4" />
              <div className="h-3 bg-surface rounded-md w-full" />
              <div className="h-3 bg-surface rounded-md w-1/2" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-14 h-14 rounded-full bg-surface text-text-muted flex items-center justify-center mx-auto">
            <BookOpen size={24} />
          </div>
          <div>
            <h3 className="font-heading font-bold text-dark text-lg">
              No matching recommendations found
            </h3>
            <p className="text-xs text-text-secondary mt-1">
              Try adjusting your category or format filters to discover more health topics.
            </p>
          </div>
          <button
            onClick={() => {
              setActiveCategory('All');
              setActiveType('all');
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary-dark transition-colors shadow-sm"
          >
            <RotateCcw size={14} />
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {items.map((item) => {
            const isVideo = item.contentType === 'video';
            const isMagazine = item.contentType === 'magazine';
            const isSaved = savedIds.has(item.id);
            const targetHref = isVideo
              ? `/video/${item.slug}`
              : isMagazine
              ? `/magazines`
              : `/blog/${item.slug}`;

            return (
              <div
                key={item.id}
                className="group bg-white rounded-2xl border border-border shadow-sm hover:shadow-card hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden relative"
              >
                {/* Thumbnail & Badges */}
                <Link
                  href={targetHref}
                  onClick={() => handleCardClick(item)}
                  className="w-full aspect-[16/10] relative overflow-hidden bg-surface block cursor-pointer"
                >
                  <Image
                    src={item.imageUrl || '/images/exercise_plank.png'}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                  />

                  {/* Top-Left Category Badge */}
                  <div className="absolute top-2.5 left-2.5 z-10">
                    <PillBadge active className="text-[10px] py-0.5 px-2 shadow-sm">
                      {item.category}
                    </PillBadge>
                  </div>

                  {/* Top-Right Quick Bookmark */}
                  <button
                    onClick={(e) => handleToggleSave(item.id, e)}
                    disabled={savingId === item.id}
                    title={isSaved ? 'Saved to Bookmarks' : 'Save Item'}
                    aria-label={isSaved ? 'Saved to Bookmarks' : 'Save Item'}
                    className={`absolute top-2.5 right-2.5 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      isSaved
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-black/50 text-white/90 hover:bg-primary hover:text-white backdrop-blur-sm'
                    }`}
                  >
                    <Bookmark size={14} className={isSaved ? 'fill-white' : ''} />
                  </button>

                  {/* Video Play Overlay */}
                  {isVideo && (
                    <div className="absolute inset-0 bg-black/25 flex items-center justify-center transition-colors group-hover:bg-black/35">
                      <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-primary-dark transition-all ring-2 ring-white/30">
                        <Play size={18} className="fill-white ml-0.5" />
                      </div>
                    </div>
                  )}

                  {/* Recommendation Reason Pill over bottom edge */}
                  {item.recommendationReason && (
                    <div className="absolute bottom-2 left-2 right-2 z-10">
                      <div className="bg-dark/85 backdrop-blur-md text-white text-[10px] font-medium px-2 py-0.5 rounded-lg truncate border border-white/10 flex items-center gap-1 shadow-sm">
                        <Sparkles size={10} className="text-accent shrink-0" />
                        <span className="truncate">{item.recommendationReason}</span>
                      </div>
                    </div>
                  )}
                </Link>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-2.5">
                  <div>
                    <h3 className="font-heading font-semibold text-dark text-sm sm:text-base group-hover:text-primary transition-colors leading-snug line-clamp-2">
                      <Link href={targetHref} onClick={() => handleCardClick(item)}>
                        {item.title}
                      </Link>
                    </h3>

                    <p className="text-xs text-text-secondary line-clamp-2 mt-1.5 leading-relaxed font-sans">
                      {item.excerpt}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="pt-2.5 border-t border-border/50 flex items-center justify-between text-[11px] text-text-muted">
                    <span className="truncate max-w-[130px] font-medium text-dark">
                      {item.authorName || 'HealthGuru'}
                    </span>
                    <Link
                      href={targetHref}
                      onClick={() => handleCardClick(item)}
                      className="text-primary hover:underline inline-flex items-center gap-1 font-semibold"
                    >
                      {isVideo ? 'Watch Video' : isMagazine ? 'Read Issue' : 'Read Article'}
                      {isVideo ? <Play size={10} /> : <BookOpen size={10} />}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Medical Safety Disclaimer Notice */}
      <div className="bg-surface rounded-2xl border border-border/80 p-4 flex items-start gap-3 text-xs text-text-muted">
        <ShieldCheck size={18} className="text-primary shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-dark font-medium">HealthGuru Medical & Educational Notice:</strong>{' '}
          All recommendations and daily wellness insights are curated for general health education
          and lifestyle awareness. They do not constitute personalized medical advice, diagnosis, or
          clinical treatment. Always consult a certified healthcare professional before adopting new
          health or dietary regimens.
        </p>
      </div>
    </section>
  );
}
