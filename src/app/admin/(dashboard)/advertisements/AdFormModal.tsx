'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { X, Upload, ExternalLink, Image as ImageIcon, Sparkles, Check, AlertCircle } from 'lucide-react';
import { Advertisement, AdPlacement } from '@/lib/types/advertisement';
import Image from 'next/image';

interface AdFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  adToEdit: Advertisement | null;
  onSaved: (ad: Advertisement, isNew: boolean) => void;
}

const PLACEMENTS: { id: AdPlacement; label: string; desc: string; size: string }[] = [
  { id: 'top_banner', label: 'Top Banner', desc: 'Top leaderboard strip above navbar or header', size: '728x90 / 970x90' },
  { id: 'hero_banner', label: 'Hero Banner', desc: 'Wide in-feed banner below hero / featured stories', size: '1200x250 / 970x250' },
  { id: 'sidebar', label: 'Sidebar Banner', desc: 'Medium rectangle / tall banner in sidebar rail', size: '300x250 / 300x600' },
  { id: 'floating_footer', label: 'Floating Footer Bar', desc: 'Fixed sticky drawer at the bottom of the viewport', size: 'Responsive Strip' },
  { id: 'popup', label: 'Health Popup Modal', desc: 'Contextual promotional health modal with frequency capping', size: '600x400 Card' },
];

const HEALTH_CATEGORIES = [
  'All',
  'Nutrition',
  'Fitness',
  'Mental Health',
  'Wellness',
  'Medicine',
  'Sleep',
  'Heart Health',
  'Ayurveda',
  'Medical Research',
  'Skin Care',
  'Immunity',
];

export function AdFormModal({ isOpen, onClose, adToEdit, onSaved }: AdFormModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    placement: 'top_banner' as AdPlacement,
    image_url: '',
    target_url: 'https://',
    headline: '',
    description: '',
    cta_text: 'Learn More',
    category: 'All',
    html_code: '',
    is_active: true,
  });

  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (adToEdit) {
      setFormData({
        title: adToEdit.title || '',
        placement: adToEdit.placement || 'top_banner',
        image_url: adToEdit.image_url || '',
        target_url: adToEdit.target_url || 'https://',
        headline: adToEdit.headline || '',
        description: adToEdit.description || '',
        cta_text: adToEdit.cta_text || 'Learn More',
        category: adToEdit.category || 'All',
        html_code: adToEdit.html_code || '',
        is_active: adToEdit.is_active ?? true,
      });
    } else {
      setFormData({
        title: '',
        placement: 'top_banner',
        image_url: '',
        target_url: 'https://',
        headline: '',
        description: '',
        cta_text: 'Learn More',
        category: 'All',
        html_code: '',
        is_active: true,
      });
    }
    setError(null);
  }, [adToEdit, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const data = new FormData();
      data.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });

      const json = await res.json();
      if (json.success && json.url) {
        setFormData((prev) => ({ ...prev, image_url: json.url }));
      } else {
        setError(json.error || 'Failed to upload image');
      }
    } catch (err: any) {
      setError(err.message || 'Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Campaign title is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = adToEdit
        ? `/api/admin/advertisements/${adToEdit.id}`
        : `/api/admin/advertisements`;
      const method = adToEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (json.success) {
        onSaved(json.advertisement, !adToEdit);
        onClose();
      } else {
        setError(json.error || 'Failed to save advertisement');
      }
    } catch (err: any) {
      setError(err.message || 'Error saving advertisement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-border w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden my-8">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between bg-surface/50">
          <div>
            <h2 className="font-heading font-bold text-xl text-dark">
              {adToEdit ? 'Edit Advertisement Campaign' : 'Create New Advertisement'}
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Configure placement slot, targeting, image banner creative, and click destination.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-secondary hover:text-dark hover:bg-surface rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Placement Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-heading font-semibold text-dark uppercase tracking-wider">
              Ad Placement Slot *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {PLACEMENTS.map((p) => {
                const isSelected = formData.placement === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, placement: p.id })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary'
                        : 'border-border hover:border-text-secondary/40 hover:bg-surface/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-heading font-semibold text-xs text-dark">{p.label}</span>
                      {isSelected && <Check size={14} className="text-primary font-bold" />}
                    </div>
                    <p className="text-[11px] text-text-secondary line-clamp-2 leading-relaxed">{p.desc}</p>
                    <span className="inline-block mt-2 text-[10px] font-mono text-primary font-medium bg-primary/10 px-1.5 py-0.5 rounded">
                      {p.size}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Campaign Title & Target Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-heading font-semibold text-dark">
                Campaign Title (Internal Name) *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. LivePure Organic Protein - Summer Promo"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-heading font-semibold text-dark">
                Target Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white transition-all"
              >
                {HEALTH_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Target Destination Link */}
          <div className="space-y-1.5">
            <label className="block text-xs font-heading font-semibold text-dark flex items-center justify-between">
              <span>Target Click Destination URL *</span>
              <span className="text-[11px] text-text-secondary font-normal">Where user lands upon click</span>
            </label>
            <div className="relative">
              <input
                type="url"
                required
                value={formData.target_url}
                onChange={(e) => setFormData({ ...formData, target_url: e.target.value })}
                placeholder="https://brand.com/offer or /stay-healthy"
                className="w-full pl-9 pr-3.5 py-2 text-sm rounded-lg border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              />
              <ExternalLink size={15} className="absolute left-3 top-3 text-text-secondary" />
            </div>
          </div>

          {/* Banner Creative Image / Upload */}
          <div className="space-y-3 p-4 bg-surface/60 rounded-xl border border-border">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-heading font-semibold text-dark">
                Banner Creative Image *
              </label>
              <span className="text-[11px] text-text-secondary">Upload file or enter image URL</span>
            </div>

            {/* Direct Upload Dropzone */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <label className="w-full sm:w-auto cursor-pointer bg-primary/10 hover:bg-primary/20 text-primary border-2 border-dashed border-primary/40 hover:border-primary px-5 py-3 rounded-xl text-xs font-heading font-semibold flex items-center justify-center gap-2 transition-all shadow-sm shrink-0">
                <Upload size={16} className={uploading ? 'animate-bounce text-primary' : 'text-primary'} />
                <span>{uploading ? 'Uploading image...' : 'Choose Banner Image File'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>

              <div className="w-full flex-1">
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="Or paste image URL (https://images.unsplash.com/...)"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white transition-all font-mono"
                />
              </div>
            </div>

            {/* Live Creative Image Preview */}
            {formData.image_url && (
              <div className="mt-2 space-y-1.5">
                <span className="text-[11px] font-heading font-semibold text-text-secondary block">
                  Creative Preview:
                </span>
                <div className="relative w-full h-40 sm:h-44 rounded-xl overflow-hidden border-2 border-primary/20 bg-dark/5 shadow-md">
                  <Image
                    src={formData.image_url}
                    alt="Banner preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute top-2 right-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image_url: '' })}
                      className="p-1 bg-black/70 hover:bg-black text-white rounded-full transition-colors text-xs flex items-center gap-1 px-2"
                    >
                      <X size={12} /> Remove
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Rich Content & Popups (Headline, Description, CTA) */}
          <div className="space-y-3 p-4 bg-surface/30 rounded-xl border border-border">
            <span className="text-xs font-heading font-bold text-dark flex items-center gap-1.5">
              <Sparkles size={14} className="text-primary" /> Rich Text & Call to Action (For Hero, Sidebar, Footer & Popups)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-heading font-semibold text-text-secondary">
                  Display Headline
                </label>
                <input
                  type="text"
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  placeholder="e.g. Save 25% on Clean Organic Supergreens"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-heading font-semibold text-text-secondary">
                  CTA Button Label
                </label>
                <input
                  type="text"
                  value={formData.cta_text}
                  onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                  placeholder="e.g. Claim Offer, Shop Now, Get Free Guide"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-heading font-semibold text-text-secondary">
                Promotional Subtext / Description
              </label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Doctor-formulated organic plant protein and daily vital minerals with zero artificial additives."
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white"
              />
            </div>
          </div>

          {/* Optional HTML/AdSense Embed Code */}
          <div className="space-y-1.5">
            <label className="block text-xs font-heading font-semibold text-text-secondary flex items-center justify-between">
              <span>Custom HTML / AdSense Script (Optional)</span>
              <span className="text-[10px] text-text-muted">Use if serving Google AdSense or HTML iframe ads</span>
            </label>
            <textarea
              rows={2}
              value={formData.html_code}
              onChange={(e) => setFormData({ ...formData, html_code: e.target.value })}
              placeholder="<script async src='...'> or <ins class='adsbygoogle' ...></ins>"
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-surface/20"
            />
          </div>

          {/* Active Status Switch */}
          <div className="flex items-center justify-between p-3 bg-surface rounded-xl border border-border">
            <div>
              <span className="font-heading font-semibold text-xs text-dark block">Campaign Active Status</span>
              <span className="text-[11px] text-text-secondary">When active, this ad is immediately rendered in public ad slots</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border flex items-center justify-end gap-3 bg-surface/50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-heading font-semibold text-text-secondary hover:text-dark hover:bg-surface rounded-lg transition-colors border border-border"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || uploading}
            className="px-6 py-2 text-xs font-heading font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg transition-all shadow-md shadow-primary/20 disabled:opacity-50"
          >
            {loading ? 'Saving...' : adToEdit ? 'Update Advertisement' : 'Create Advertisement'}
          </button>
        </div>
      </div>
    </div>
  );
}
