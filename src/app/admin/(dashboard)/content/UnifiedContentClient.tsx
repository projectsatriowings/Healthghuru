/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Edit,
  Trash2,
  ExternalLink,
  Flame,
  Zap,
  Star,
  Search,
} from 'lucide-react';
import { PillBadge } from '@/components/ui/PillBadge';

interface UnifiedContentClientProps {
  initialItems: any[];
  categories: any[];
  sources?: any[];
}

export function UnifiedContentClient({ initialItems, categories }: UnifiedContentClientProps) {
  const [items, setItems] = useState(initialItems);
  const [searchQuery, setSearchQuery] = useState('');
  const [contentTypeFilter, setContentTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredItems = items.filter(item => {
    if (contentTypeFilter !== 'all' && item.content_type !== contentTypeFilter) return false;
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        item.title?.toLowerCase().includes(q) ||
        item.author_name?.toLowerCase().includes(q) ||
        item.source_name?.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleToggle = async (id: string, field: 'is_breaking' | 'is_featured' | 'is_trending', currentVal: boolean) => {
    try {
      const res = await fetch(`/api/content/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field === 'is_breaking' ? 'isBreaking' : field === 'is_featured' ? 'isFeatured' : 'isTrending']: !currentVal }),
      });
      if (res.ok) {
        setItems(prev => prev.map(i => (i.id === id ? { ...i, [field]: !currentVal } : i)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content item?')) return;
    try {
      const res = await fetch(`/api/content/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setItems(prev => prev.filter(i => i.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters bar */}
      <div className="p-4 bg-surface rounded-2xl border border-border flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search content..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-border bg-white focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <select
            value={contentTypeFilter}
            onChange={e => setContentTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-border bg-white focus:outline-none"
          >
            <option value="all">All Types</option>
            <option value="article">Articles</option>
            <option value="news">News</option>
            <option value="video">Videos</option>
            <option value="magazine">Magazines</option>
          </select>

          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-border bg-white focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-border bg-white focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="review">Review Queue</option>
            <option value="draft">Draft</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="text-xs text-text-muted font-medium">
          Showing <span className="text-dark font-semibold">{filteredItems.length}</span> items
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-text-secondary border-collapse">
          <thead>
            <tr className="border-b border-border bg-surface text-xs uppercase font-heading font-semibold text-text-muted">
              <th className="py-3 px-4">Title & Source</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-center">Toggles</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-text-muted">
                  No content found matching the selected filters.
                </td>
              </tr>
            ) : (
              filteredItems.map(item => {
                const isOriginal = !item.is_external;

                return (
                  <tr key={item.id} className="hover:bg-surface/50 transition-colors">
                    <td className="py-3 px-4 max-w-md">
                      <div className="font-heading font-semibold text-dark text-sm line-clamp-1">
                        {item.title}
                      </div>
                      <div className="text-xs text-text-muted flex items-center gap-2 mt-0.5">
                        <span className={isOriginal ? 'font-medium text-primary' : 'text-dark'}>
                          {isOriginal ? '✦ HealthGhuru Original' : item.source_name || 'External Source'}
                        </span>
                        <span>·</span>
                        <span>{new Date(item.published_at).toLocaleDateString()}</span>
                        {item.canonical_url && (
                          <>
                            <span>·</span>
                            <a
                              href={item.canonical_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline flex items-center gap-0.5"
                            >
                              URL <ExternalLink size={10} />
                            </a>
                          </>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="capitalize text-xs font-medium px-2 py-0.5 rounded bg-surface border border-border text-dark">
                        {item.content_type}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <PillBadge className="text-xs">{item.category}</PillBadge>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          item.status === 'published'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : item.status === 'review'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggle(item.id, 'is_breaking', item.is_breaking)}
                          title="Toggle Breaking News ticker"
                          className={`p-1.5 rounded-lg border transition-colors ${
                            item.is_breaking
                              ? 'bg-rose-500 text-white border-rose-600 shadow-xs'
                              : 'bg-surface hover:bg-surface-alt text-text-muted border-border'
                          }`}
                        >
                          <Zap size={13} />
                        </button>
                        <button
                          onClick={() => handleToggle(item.id, 'is_featured', item.is_featured)}
                          title="Toggle Featured"
                          className={`p-1.5 rounded-lg border transition-colors ${
                            item.is_featured
                              ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                              : 'bg-surface hover:bg-surface-alt text-text-muted border-border'
                          }`}
                        >
                          <Star size={13} />
                        </button>
                        <button
                          onClick={() => handleToggle(item.id, 'is_trending', item.is_trending)}
                          title="Toggle Trending"
                          className={`p-1.5 rounded-lg border transition-colors ${
                            item.is_trending
                              ? 'bg-primary text-white border-primary shadow-xs'
                              : 'bg-surface hover:bg-surface-alt text-text-muted border-border'
                          }`}
                        >
                          <Flame size={13} />
                        </button>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        {isOriginal && (
                          <Link
                            href={`/admin/content/${item.id}`}
                            className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                            title="Edit original article in block editor"
                          >
                            <Edit size={14} />
                          </Link>
                        )}
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors"
                          title="Delete content item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
