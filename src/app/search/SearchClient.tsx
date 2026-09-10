/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, AlertCircle } from 'lucide-react';
import { ContentCard } from '@/components/media/ContentCard';

export function SearchClient({
  initialQuery,
  initialType,
  categories,
}: {
  initialQuery: string;
  initialType: string;
  categories: any[];
}) {
  const router = useRouter();

  const [query, setQuery] = useState(initialQuery);
  const [selectedType, setSelectedType] = useState(initialType);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(Boolean(initialQuery));

  const executeSearch = async (q: string, type: string, cat: string) => {
    if (!q.trim()) {
      setResults([]);
      setTotal(0);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const params = new URLSearchParams();
      params.set('q', q.trim());
      if (type !== 'all') params.set('contentType', type);
      if (cat) params.set('category', cat);
      params.set('limit', '30');

      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setResults(data.items || []);
        setTotal(data.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      executeSearch(initialQuery, selectedType, selectedCategory);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query, selectedType, selectedCategory);
    router.replace(`/search?q=${encodeURIComponent(query)}&type=${selectedType}`);
  };

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    if (query) executeSearch(query, type, selectedCategory);
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    if (query) executeSearch(query, selectedType, cat);
  };

  return (
    <div className="space-y-6">
      {/* Search Input Bar */}
      <form onSubmit={handleSubmit} className="relative w-full">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search health conditions, nutrition, symptoms, workouts, sleep science..."
          className="w-full pl-12 pr-28 py-4 bg-white rounded-2xl border border-border shadow-card focus:outline-none focus:ring-2 focus:ring-primary text-base font-body text-dark placeholder:text-text-muted transition-all"
        />
        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />

        <button
          type="submit"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : 'Search'}
        </button>
      </form>

      {/* Content Type Filter Pills */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {['all', 'news', 'article', 'video', 'magazine'].map(type => (
            <button
              key={type}
              type="button"
              onClick={() => handleTypeChange(type)}
              className={`px-4 py-1.5 rounded-full text-xs font-heading font-medium capitalize transition-all ${
                selectedType === type
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white hover:bg-surface text-text-secondary border border-border'
              }`}
            >
              {type === 'all' ? 'All Formats' : type + 's'}
            </button>
          ))}
        </div>

        {/* Categories Dropdown */}
        <select
          value={selectedCategory}
          onChange={e => handleCategoryChange(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-xl border border-border bg-white text-text-secondary focus:outline-none"
        >
          <option value="">All Health Categories</option>
          {categories.map(c => (
            <option key={c.slug} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Results Header */}
      {hasSearched && (
        <div className="text-sm text-text-muted flex items-center justify-between border-b border-border/40 pb-3">
          <span>
            Found <span className="font-semibold text-dark">{total}</span> results for &ldquo;{query}&rdquo;
          </span>
          {loading && (
            <span className="flex items-center gap-1.5 text-primary text-xs">
              <Loader2 size={13} className="animate-spin" /> Updating results...
            </span>
          )}
        </div>
      )}

      {/* Search Results Grid */}
      {hasSearched && results.length === 0 && !loading && (
        <div className="bg-white rounded-2xl p-12 text-center border border-border shadow-sm">
          <div className="w-12 h-12 rounded-full bg-surface text-text-muted flex items-center justify-center mx-auto mb-3">
            <AlertCircle size={22} />
          </div>
          <h3 className="font-display text-lg text-dark mb-1">No Results Found</h3>
          <p className="text-xs text-text-muted max-w-sm mx-auto">
            Try checking for spelling errors, using more general medical terms, or selecting &ldquo;All Formats&rdquo;.
          </p>
        </div>
      )}

      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((item: any) => (
            <ContentCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
