'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import {
  Megaphone,
  Plus,
  Search,
  Eye,
  MousePointerClick,
  Percent,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  ExternalLink,
  SlidersHorizontal,
  Layout,
  Smartphone,
  Sidebar as SidebarIcon,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Advertisement, AdPlacement } from '@/lib/types/advertisement';
import { AdFormModal } from './AdFormModal';
import Image from 'next/image';

interface AdvertisementsClientProps {
  initialAds: Advertisement[];
}

const PLACEMENT_INFO: Record<AdPlacement, { label: string; icon: any; color: string }> = {
  top_banner: { label: 'Top Banner', icon: Layout, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  hero_banner: { label: 'Hero Banner', icon: Layers, color: 'bg-purple-50 text-purple-700 border-purple-200' },
  sidebar: { label: 'Sidebar Banner', icon: SidebarIcon, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  floating_footer: { label: 'Floating Footer', icon: Smartphone, color: 'bg-amber-50 text-amber-700 border-amber-200' },
  popup: { label: 'Health Popup', icon: Sparkles, color: 'bg-rose-50 text-rose-700 border-rose-200' },
};

export function AdvertisementsClient({ initialAds }: AdvertisementsClientProps) {
  const [ads, setAds] = useState<Advertisement[]>(initialAds);
  const [placementFilter, setPlacementFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adToEdit, setAdToEdit] = useState<Advertisement | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Metrics Calculation
  const totalAds = ads.length;
  const activeAds = ads.filter((a) => a.is_active).length;
  const totalImpressions = ads.reduce((acc, a) => acc + (a.impressions_count || 0), 0);
  const totalClicks = ads.reduce((acc, a) => acc + (a.clicks_count || 0), 0);
  const averageCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';

  // Filtered Ads
  const filteredAds = ads.filter((ad) => {
    const matchesPlacement = placementFilter === 'all' || ad.placement === placementFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && ad.is_active) ||
      (statusFilter === 'inactive' && !ad.is_active);
    const matchesSearch =
      searchQuery === '' ||
      ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ad.headline && ad.headline.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (ad.category && ad.category.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesPlacement && matchesStatus && matchesSearch;
  });

  const handleToggleStatus = async (ad: Advertisement) => {
    const nextStatus = !ad.is_active;
    // Optimistic UI update
    setAds((prev) => prev.map((a) => (a.id === ad.id ? { ...a, is_active: nextStatus } : a)));

    try {
      const res = await fetch(`/api/admin/advertisements/${ad.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: nextStatus }),
      });
      const json = await res.json();
      if (!json.success) {
        // Revert on error
        setAds((prev) => prev.map((a) => (a.id === ad.id ? { ...a, is_active: ad.is_active } : a)));
      }
    } catch {
      setAds((prev) => prev.map((a) => (a.id === ad.id ? { ...a, is_active: ad.is_active } : a)));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this advertisement campaign?')) return;
    setDeletingId(id);

    try {
      const res = await fetch(`/api/admin/advertisements/${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        setAds((prev) => prev.filter((a) => a.id !== id));
      } else {
        alert(json.error || 'Failed to delete advertisement');
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting advertisement');
    } finally {
      setDeletingId(null);
    }
  };

  const handleAdSaved = (savedAd: Advertisement, isNew: boolean) => {
    if (isNew) {
      setAds((prev) => [savedAd, ...prev]);
    } else {
      setAds((prev) => prev.map((a) => (a.id === savedAd.id ? savedAd : a)));
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Analytics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Campaigns */}
        <div className="bg-white rounded-xl p-5 border border-border shadow-sm">
          <div className="flex items-center justify-between text-text-secondary mb-2">
            <span className="text-xs font-heading font-medium">Total Ads</span>
            <Megaphone size={16} className="text-primary" />
          </div>
          <div className="text-2xl font-bold font-heading text-dark">{totalAds}</div>
          <div className="text-[11px] text-text-muted mt-1">{activeAds} active campaigns</div>
        </div>

        {/* Active Campaigns */}
        <div className="bg-white rounded-xl p-5 border border-border shadow-sm">
          <div className="flex items-center justify-between text-text-secondary mb-2">
            <span className="text-xs font-heading font-medium">Active Ads</span>
            <CheckCircle2 size={16} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-heading text-emerald-600">{activeAds}</div>
          <div className="text-[11px] text-text-muted mt-1">Live in ad slots</div>
        </div>

        {/* Total Impressions */}
        <div className="bg-white rounded-xl p-5 border border-border shadow-sm">
          <div className="flex items-center justify-between text-text-secondary mb-2">
            <span className="text-xs font-heading font-medium">Total Impressions</span>
            <Eye size={16} className="text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-heading text-dark">
            {totalImpressions.toLocaleString()}
          </div>
          <div className="text-[11px] text-text-muted mt-1">Views recorded</div>
        </div>

        {/* Total Clicks */}
        <div className="bg-white rounded-xl p-5 border border-border shadow-sm">
          <div className="flex items-center justify-between text-text-secondary mb-2">
            <span className="text-xs font-heading font-medium">Total Clicks</span>
            <MousePointerClick size={16} className="text-purple-600" />
          </div>
          <div className="text-2xl font-bold font-heading text-dark">{totalClicks.toLocaleString()}</div>
          <div className="text-[11px] text-text-muted mt-1">Direct outbound clicks</div>
        </div>

        {/* Average CTR */}
        <div className="bg-white rounded-xl p-5 border border-border shadow-sm col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-text-secondary mb-2">
            <span className="text-xs font-heading font-medium">Average CTR</span>
            <Percent size={16} className="text-accent" />
          </div>
          <div className="text-2xl font-bold font-heading text-accent">{averageCtr}%</div>
          <div className="text-[11px] text-text-muted mt-1">Click-through rate</div>
        </div>
      </div>

      {/* 2. Controls & Actions */}
      <div className="bg-white rounded-2xl p-6 border border-border shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Placement Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-surface p-1 rounded-xl border border-border">
            {[
              { id: 'all', label: 'All Placements' },
              { id: 'top_banner', label: 'Top Banner' },
              { id: 'hero_banner', label: 'Hero Banner' },
              { id: 'sidebar', label: 'Sidebar' },
              { id: 'floating_footer', label: 'Floating Footer' },
              { id: 'popup', label: 'Popup Modal' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setPlacementFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-heading font-medium transition-all ${
                  placementFilter === tab.id
                    ? 'bg-white text-dark shadow-sm font-semibold'
                    : 'text-text-secondary hover:text-dark'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* New Ad Button */}
          <button
            onClick={() => {
              setAdToEdit(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-heading font-semibold transition-all shadow-md shadow-primary/20 shrink-0 self-start md:self-auto"
          >
            <Plus size={16} /> Create Advertisement
          </button>
        </div>

        {/* Search & Status Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-border/50">
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3.5 top-2.5 text-text-secondary" />
            <input
              type="text"
              placeholder="Search campaigns by title, headline, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <SlidersHorizontal size={14} className="text-text-secondary" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-border bg-white text-text-secondary focus:border-primary outline-none font-medium w-full sm:w-auto"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Advertisements Table / List */}
      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        {filteredAds.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Megaphone size={40} className="mx-auto text-text-muted stroke-[1.5]" />
            <h3 className="font-heading font-bold text-base text-dark">No advertisements found</h3>
            <p className="text-xs text-text-secondary max-w-sm mx-auto">
              {searchQuery || placementFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your filters or search query.'
                : 'Get started by creating your first health advertisement campaign.'}
            </p>
            <button
              onClick={() => {
                setAdToEdit(null);
                setIsModalOpen(true);
              }}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-xs font-medium"
            >
              <Plus size={14} /> Create New Ad
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface/50 border-b border-border text-[11px] font-heading font-semibold text-text-secondary uppercase tracking-wider">
                  <th className="py-3.5 px-6">Campaign & Creative</th>
                  <th className="py-3.5 px-4">Placement</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Target Link</th>
                  <th className="py-3.5 px-4">Impressions</th>
                  <th className="py-3.5 px-4">Clicks</th>
                  <th className="py-3.5 px-4">CTR</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs">
                {filteredAds.map((ad) => {
                  const info = PLACEMENT_INFO[ad.placement] || {
                    label: ad.placement,
                    color: 'bg-gray-100 text-gray-700',
                  };
                  const adCtr =
                    ad.impressions_count > 0
                      ? ((ad.clicks_count / ad.impressions_count) * 100).toFixed(2)
                      : '0.00';

                  return (
                    <tr key={ad.id} className="hover:bg-surface/30 transition-colors">
                      {/* Title & Thumbnail */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3.5">
                          <div className="relative w-14 h-10 rounded-lg overflow-hidden border border-border shrink-0 bg-surface">
                            {ad.image_url ? (
                              <Image
                                src={ad.image_url}
                                alt={ad.title}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-text-muted">
                                <Megaphone size={16} />
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="font-heading font-bold text-dark block line-clamp-1">
                              {ad.title}
                            </span>
                            {ad.headline && (
                              <span className="text-[11px] text-text-secondary line-clamp-1">
                                {ad.headline}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Placement */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-heading font-medium border ${info.color}`}
                        >
                          {info.label}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 bg-surface rounded-full text-[11px] font-medium text-text-secondary border border-border">
                          {ad.category || 'All'}
                        </span>
                      </td>

                      {/* Target Link */}
                      <td className="py-4 px-4 whitespace-nowrap max-w-[160px] truncate">
                        <a
                          href={ad.target_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1 text-[11px]"
                        >
                          <span className="truncate">{ad.target_url}</span>
                          <ExternalLink size={12} className="shrink-0" />
                        </a>
                      </td>

                      {/* Impressions */}
                      <td className="py-4 px-4 whitespace-nowrap font-medium text-text-secondary">
                        {ad.impressions_count.toLocaleString()}
                      </td>

                      {/* Clicks */}
                      <td className="py-4 px-4 whitespace-nowrap font-medium text-dark">
                        {ad.clicks_count.toLocaleString()}
                      </td>

                      {/* CTR */}
                      <td className="py-4 px-4 whitespace-nowrap font-medium text-primary">
                        {adCtr}%
                      </td>

                      {/* Status Toggle */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(ad)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-heading font-semibold transition-all ${
                            ad.is_active
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {ad.is_active ? (
                            <>
                              <CheckCircle2 size={13} className="text-emerald-600" /> Active
                            </>
                          ) : (
                            <>
                              <XCircle size={13} className="text-gray-400" /> Paused
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setAdToEdit(ad);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 text-text-secondary hover:text-primary hover:bg-surface rounded-lg transition-colors"
                            title="Edit Campaign"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(ad.id)}
                            disabled={deletingId === ad.id}
                            className="p-1.5 text-text-secondary hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete Campaign"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal for Create/Edit */}
      <AdFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        adToEdit={adToEdit}
        onSaved={handleAdSaved}
      />
    </div>
  );
}
