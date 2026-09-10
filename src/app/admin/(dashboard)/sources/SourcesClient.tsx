/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import {
  Rss,
  Video,
  Globe,
  Radio,
  Plus,
  Play,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  ShieldCheck,
  Edit2,
  Trash2,
} from 'lucide-react';
import { getHealthBadgeProps } from '@/lib/ingestion/health';

interface SourcesClientProps {
  initialSources: any[];
  categories: any[];
}

export function SourcesClient({ initialSources, categories }: SourcesClientProps) {
  const [sources, setSources] = useState(initialSources);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<any | null>(null);
  const [testResult, setTestResult] = useState<any | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    type: 'rss',
    provider: '',
    websiteUrl: '',
    feedUrl: '',
    youtubeChannelId: '',
    defaultCategory: 'Wellness',
    trustScore: 'High',
    autoPublish: true,
    requiresReview: false,
    priority: 5,
    fetchIntervalMinutes: 60,
    enabled: true,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'rss',
      provider: '',
      websiteUrl: '',
      feedUrl: '',
      youtubeChannelId: '',
      defaultCategory: 'Wellness',
      trustScore: 'High',
      autoPublish: true,
      requiresReview: false,
      priority: 5,
      fetchIntervalMinutes: 60,
      enabled: true,
    });
    setEditingSource(null);
    setTestResult(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (source: any) => {
    setEditingSource(source);
    setFormData({
      name: source.name,
      type: source.type,
      provider: source.provider || '',
      websiteUrl: source.website_url || '',
      feedUrl: source.feed_url || '',
      youtubeChannelId: source.youtube_channel_id || '',
      defaultCategory: source.default_category || 'Wellness',
      trustScore: source.trust_score || 'High',
      autoPublish: source.auto_publish ?? true,
      requiresReview: source.requires_review ?? false,
      priority: source.priority || 5,
      fetchIntervalMinutes: source.fetch_interval_minutes || 60,
      enabled: source.enabled ?? true,
    });
    setTestResult(null);
    setIsModalOpen(true);
  };

  // Test source connection
  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/sources/preview/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({ success: false, error: err.message });
    } finally {
      setIsTesting(false);
    }
  };

  // Save source
  const handleSaveSource = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingSource ? `/api/sources/${editingSource.id}` : '/api/sources';
      const method = editingSource ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to save source');
      }

      setMessage({ type: 'success', text: `Source "${formData.name}" saved successfully!` });
      setIsModalOpen(false);

      // Refresh sources list
      const refRes = await fetch('/api/sources');
      const refData = await refRes.json();
      if (refData.sources) setSources(refData.sources);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  // Fetch now
  const handleFetchNow = async (sourceId: string, sourceName: string) => {
    setLoadingId(sourceId);
    setMessage(null);
    try {
      const res = await fetch(`/api/sources/${sourceId}/ingest`, { method: 'POST' });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error?.message || 'Fetch failed');
      }

      const r = data.result;
      setMessage({
        type: 'success',
        text: `Fetch completed for "${sourceName}": ${r.itemsImported} imported, ${r.itemsDuplicated} duplicates, ${r.errors.length} errors.`,
      });

      // Refresh list
      const refRes = await fetch('/api/sources');
      const refData = await refRes.json();
      if (refData.sources) setSources(refData.sources);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoadingId(null);
    }
  };

  // Toggle enabled
  const handleToggleEnable = async (source: any) => {
    try {
      const res = await fetch(`/api/sources/${source.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !source.enabled }),
      });
      if (res.ok) {
        setSources(prev =>
          prev.map(s => (s.id === source.id ? { ...s, enabled: !s.enabled } : s))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete source
  const handleDeleteSource = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete source "${name}"?`)) return;
    try {
      const res = await fetch(`/api/sources/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSources(prev => prev.filter(s => s.id !== id));
        setMessage({ type: 'success', text: `Source "${name}" deleted.` });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'youtube':
        return <Video size={18} className="text-red-600" />;
      case 'rss':
      case 'atom':
        return <Rss size={18} className="text-amber-600" />;
      case 'newsapi':
        return <Radio size={18} className="text-blue-600" />;
      default:
        return <Globe size={18} className="text-emerald-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Alert */}
      {message && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between border ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2 text-sm font-medium">
            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-xs font-semibold hover:opacity-75">
            Dismiss
          </button>
        </div>
      )}

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="text-sm text-text-secondary">
            Total Sources: <span className="font-semibold text-dark">{sources.length}</span>
          </div>
          <div className="text-sm text-text-secondary">
            Active: <span className="font-semibold text-primary">{sources.filter(s => s.enabled).length}</span>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-full font-heading font-medium text-sm transition-all shadow-sm hover:shadow-md"
        >
          <Plus size={16} /> Add Content Source
        </button>
      </div>

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sources.map(source => {
          const health = getHealthBadgeProps(source.healthStatus || 'Healthy');
          const isBusy = loadingId === source.id;

          return (
            <div
              key={source.id}
              className={`bg-white rounded-2xl border transition-all duration-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-md ${
                source.enabled ? 'border-border' : 'border-gray-200 opacity-60'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-surface border border-border/50">
                      {getTypeIcon(source.type)}
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-dark text-base leading-tight">
                        {source.name}
                      </h3>
                      <span className="text-xs text-text-muted capitalize font-mono">
                        {source.type} · {source.default_category || 'Wellness'}
                      </span>
                    </div>
                  </div>

                  {/* Health Badge */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${health.bgClass} ${health.textClass}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${health.dotClass}`} />
                    {health.label}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-1.5 my-4 text-xs text-text-secondary border-t border-b border-border/40 py-3">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Schedule:</span>
                    <span className="font-medium text-dark">Every {source.fetch_interval_minutes}m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Trust Tier:</span>
                    <span className="font-medium text-dark flex items-center gap-1">
                      <ShieldCheck size={12} className="text-primary" /> {source.trust_score}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Items Ingested:</span>
                    <span className="font-medium text-dark">{source.item_count || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Policy:</span>
                    <span className="font-medium text-dark">
                      {source.requires_review ? 'Review Required' : 'Auto Publish'}
                    </span>
                  </div>
                  {source.last_fetched_at && (
                    <div className="flex justify-between">
                      <span className="text-text-muted">Last Fetch:</span>
                      <span className="font-medium text-dark">
                        {new Date(source.last_fetched_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                  {source.last_error && (
                    <div className="pt-1 text-rose-600 truncate" title={source.last_error}>
                      Error: {source.last_error}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-2 flex items-center justify-between gap-2 border-t border-border/30">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleFetchNow(source.id, source.name)}
                    disabled={isBusy || !source.enabled}
                    title="Fetch latest now"
                    className="p-2 rounded-lg bg-surface hover:bg-primary/10 text-primary border border-primary/20 transition-colors disabled:opacity-40"
                  >
                    {isBusy ? <RefreshCw size={15} className="animate-spin" /> : <Play size={15} />}
                  </button>
                  <button
                    onClick={() => handleOpenEdit(source)}
                    title="Edit source configuration"
                    className="p-2 rounded-lg bg-surface hover:bg-surface-alt text-text-secondary border border-border transition-colors"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => handleDeleteSource(source.id, source.name)}
                    title="Delete source"
                    className="p-2 rounded-lg bg-surface hover:bg-rose-50 text-rose-600 border border-rose-200 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleEnable(source)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                      source.enabled
                        ? 'bg-surface hover:bg-surface-alt text-text-secondary border-border'
                        : 'bg-primary/10 hover:bg-primary/20 text-primary border-primary/30'
                    }`}
                  >
                    {source.enabled ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl border border-border">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <h2 className="font-display text-2xl text-dark">
                {editingSource ? 'Edit Content Source' : 'Add New Content Source'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-text-muted hover:text-dark transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSource} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Source Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. World Health Organization"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Source Type</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="rss">RSS 2.0 Feed</option>
                    <option value="atom">Atom 1.0 Feed</option>
                    <option value="youtube">YouTube Channel</option>
                    <option value="newsapi">News API</option>
                    <option value="generic_api">Generic REST API</option>
                  </select>
                </div>
              </div>

              {formData.type === 'youtube' ? (
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">YouTube Channel ID</label>
                  <input
                    type="text"
                    required
                    value={formData.youtubeChannelId}
                    onChange={e => setFormData({ ...formData, youtubeChannelId: e.target.value })}
                    placeholder="e.g. UC0QHWhjbe5fGJEPz3sVb6nw"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-primary focus:outline-none font-mono"
                  />
                  <p className="text-xs text-text-muted mt-1">Accepts standard YouTube 24-character channel ID (starting with UC).</p>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Feed / Endpoint URL</label>
                  <input
                    type="url"
                    required={formData.type !== 'newsapi'}
                    value={formData.feedUrl}
                    onChange={e => setFormData({ ...formData, feedUrl: e.target.value })}
                    placeholder="https://example.com/rss.xml"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-primary focus:outline-none font-mono"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Website URL</label>
                  <input
                    type="url"
                    value={formData.websiteUrl}
                    onChange={e => setFormData({ ...formData, websiteUrl: e.target.value })}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Default Category</label>
                  <select
                    value={formData.defaultCategory}
                    onChange={e => setFormData({ ...formData, defaultCategory: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Editorial Trust</label>
                  <select
                    value={formData.trustScore}
                    onChange={e => setFormData({ ...formData, trustScore: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="High">High (Verified Authority)</option>
                    <option value="Medium">Medium (Established)</option>
                    <option value="Low">Low (General Publisher)</option>
                    <option value="Unverified">Unverified</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Fetch Frequency</label>
                  <select
                    value={formData.fetchIntervalMinutes}
                    onChange={e => setFormData({ ...formData, fetchIntervalMinutes: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="15">Every 15 min</option>
                    <option value="30">Every 30 min</option>
                    <option value="60">Hourly</option>
                    <option value="180">Every 3 hours</option>
                    <option value="360">Every 6 hours</option>
                    <option value="1440">Daily</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Priority (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 py-2 border-t border-b border-border/40">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={formData.autoPublish}
                    onChange={e => setFormData({ ...formData, autoPublish: e.target.checked })}
                    className="rounded text-primary focus:ring-primary"
                  />
                  <span>Auto Publish to Platform</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={formData.requiresReview}
                    onChange={e => setFormData({ ...formData, requiresReview: e.target.checked })}
                    className="rounded text-primary focus:ring-primary"
                  />
                  <span>Send to Review Queue</span>
                </label>
              </div>

              {/* Test Source Live Connection */}
              <div className="p-4 bg-surface rounded-xl border border-border/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase text-text-secondary">Test Connection</span>
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTesting || (!formData.feedUrl && !formData.youtubeChannelId)}
                    className="text-xs font-medium px-3 py-1.5 bg-white hover:bg-surface-alt border border-border rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-40"
                  >
                    {isTesting ? <RefreshCw size={12} className="animate-spin" /> : <Radio size={12} />}
                    {isTesting ? 'Testing...' : 'Test Connection & Preview'}
                  </button>
                </div>

                {testResult && (
                  <div className="mt-3 text-xs space-y-2">
                    {testResult.success ? (
                      <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200">
                        <div className="font-semibold flex items-center gap-1.5 mb-1">
                          <CheckCircle2 size={14} /> Connection Successful! (Latency: {testResult.diagnostics?.latencyMs}ms)
                        </div>
                        <p>Fetched {testResult.sampleItems?.length} sample records. No records were published.</p>
                        {testResult.sampleItems?.length > 0 && (
                          <div className="mt-2 space-y-1 text-[11px] bg-white p-2 rounded border border-emerald-100 max-h-32 overflow-y-auto">
                            {testResult.sampleItems.map((item: any, i: number) => (
                              <div key={i} className="truncate text-dark">
                                • <span className="font-medium">{item.title}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-3 bg-rose-50 text-rose-800 rounded-lg border border-rose-200">
                        <div className="font-semibold flex items-center gap-1.5 mb-1">
                          <XCircle size={14} /> Connection Failed
                        </div>
                        <p>{testResult.error || 'Failed to fetch sample from source'}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-text-secondary hover:text-dark"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-full font-medium text-sm transition-colors shadow-sm"
                >
                  {editingSource ? 'Save Changes' : 'Create Source'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
