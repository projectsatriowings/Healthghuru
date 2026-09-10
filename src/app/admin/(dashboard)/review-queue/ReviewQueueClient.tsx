/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Check,
  X,
  ExternalLink,
  Sparkles,
  AlertTriangle,
  CheckCheck,
  Trash2,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface ReviewQueueClientProps {
  initialItems: any[];
  categories: any[];
}

export function ReviewQueueClient({ initialItems, categories }: ReviewQueueClientProps) {
  const [items, setItems] = useState(initialItems);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map(i => i.id)));
    }
  };

  const handleAction = async (
    id: string,
    action: 'approved' | 'rejected' | 'archived',
    updates: Record<string, any> = {}
  ) => {
    setActionLoadingId(id);
    try {
      const newStatus = action === 'approved' ? 'published' : action === 'rejected' ? 'rejected' : 'archived';
      const res = await fetch(`/api/content/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          requiresReview: false,
          reviewAction: action,
          ...updates,
        }),
      });

      if (res.ok) {
        setItems(prev => prev.filter(i => i.id !== id));
        setSelectedIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleBulkAction = async (action: 'approved' | 'rejected') => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    setActionLoadingId('bulk');

    for (const id of ids) {
      try {
        const newStatus = action === 'approved' ? 'published' : 'rejected';
        await fetch(`/api/content/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: newStatus,
            requiresReview: false,
            reviewAction: action,
          }),
        });
      } catch (err) {
        console.error(err);
      }
    }

    setItems(prev => prev.filter(i => !selectedIds.has(i.id)));
    setSelectedIds(new Set());
    setActionLoadingId(null);
  };

  const handleCategoryChange = async (id: string, newCategory: string) => {
    try {
      await fetch(`/api/content/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: newCategory }),
      });
      setItems(prev => prev.map(i => (i.id === id ? { ...i, category: newCategory } : i)));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Bulk Control Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-border shadow-sm">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={items.length > 0 && selectedIds.size === items.length}
            onChange={handleSelectAll}
            className="rounded text-primary focus:ring-primary w-4 h-4"
          />
          <span className="text-sm text-text-secondary">
            {selectedIds.size} of {items.length} selected
          </span>
        </div>

        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2 animate-in fade-in">
            <button
              onClick={() => handleBulkAction('approved')}
              disabled={actionLoadingId === 'bulk'}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-semibold shadow-sm transition-colors"
            >
              <CheckCheck size={14} /> Approve All Selected
            </button>
            <button
              onClick={() => handleBulkAction('rejected')}
              disabled={actionLoadingId === 'bulk'}
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-xs font-semibold shadow-sm transition-colors"
            >
              <Trash2 size={14} /> Reject Selected
            </button>
          </div>
        )}
      </div>

      {/* Review Queue Items */}
      {items.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-border shadow-sm">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <Check size={24} />
          </div>
          <h3 className="font-display text-xl text-dark mb-1">Queue is Clear!</h3>
          <p className="text-sm text-text-muted max-w-md mx-auto">
            All incoming health content has been reviewed and published. New external content requiring review will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map(item => {
            const isSelected = selectedIds.has(item.id);
            const isBusy = actionLoadingId === item.id;
            const duplicateConf = item.duplicate_confidence || 0;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border transition-all duration-200 p-6 shadow-sm hover:shadow-md ${
                  isSelected ? 'border-primary ring-1 ring-primary' : 'border-border'
                }`}
              >
                <div className="flex flex-col md:flex-row items-start gap-5">
                  {/* Select Checkbox */}
                  <div className="pt-1">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(item.id)}
                      className="rounded text-primary focus:ring-primary w-4 h-4"
                    />
                  </div>

                  {/* Thumbnail / Image */}
                  {item.image_url ? (
                    <div className="w-full md:w-44 aspect-[16/10] relative rounded-xl overflow-hidden bg-surface shrink-0 border border-border/50">
                      <Image
                        src={item.image_url}
                        alt={item.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="w-full md:w-44 aspect-[16/10] rounded-xl bg-surface flex items-center justify-center text-text-muted text-xs shrink-0 border border-border/50">
                      No Image
                    </div>
                  )}

                  {/* Content Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-semibold text-primary px-2.5 py-0.5 rounded-full bg-primary/10 capitalize">
                        {item.content_type}
                      </span>
                      <span className="text-text-muted">·</span>
                      <span className="font-medium text-dark">{item.source_name || 'External'}</span>
                      <span className="text-text-muted">·</span>
                      <span suppressHydrationWarning className="text-text-muted">
                        {formatDate(item.published_at)}
                      </span>

                      {/* Quality Score */}
                      <span className="ml-auto inline-flex items-center gap-1 font-mono text-xs px-2 py-0.5 rounded bg-surface border border-border text-dark">
                        <Sparkles size={12} className="text-amber-500" />
                        Quality: {Math.round(item.quality_score || 0)}/100
                      </span>
                    </div>

                    <h4 className="font-heading font-semibold text-dark text-lg leading-snug">
                      {item.title}
                    </h4>

                    <p className="text-sm text-text-secondary line-clamp-2">
                      {item.excerpt || item.description || 'No excerpt available.'}
                    </p>

                    {/* Review Warnings */}
                    {duplicateConf >= 0.8 && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50 text-amber-800 text-xs border border-amber-200">
                        <AlertTriangle size={13} />
                        Possible duplicate story (Confidence: {Math.round(duplicateConf * 100)}%)
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-text-muted">
                      {item.author_name && <span>By {item.author_name}</span>}
                      {item.canonical_url && (
                        <a
                          href={item.canonical_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          Source Link <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Right Actions & Category Selector */}
                  <div className="flex flex-col sm:items-end gap-3 shrink-0 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
                    <div>
                      <label className="block text-[11px] text-text-muted mb-1 font-medium">Assigned Category</label>
                      <select
                        value={item.category || 'Wellness'}
                        onChange={e => handleCategoryChange(item.id, e.target.value)}
                        className="px-2.5 py-1.5 text-xs rounded-lg border border-border bg-surface focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        {categories.map(c => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAction(item.id, 'rejected')}
                        disabled={isBusy}
                        className="px-3.5 py-1.5 rounded-full border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
                      >
                        <X size={14} /> Reject
                      </button>
                      <button
                        onClick={() => handleAction(item.id, 'approved')}
                        disabled={isBusy}
                        className="px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 transition-colors shadow-sm disabled:opacity-50"
                      >
                        <Check size={14} /> Approve & Publish
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
