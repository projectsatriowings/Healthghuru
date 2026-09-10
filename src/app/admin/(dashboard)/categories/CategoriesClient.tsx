/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { Plus, Layers, CheckCircle2 } from 'lucide-react';

export function CategoriesClient({ initialCategories }: { initialCategories: any[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [iconName] = useState('Heart');
  const [displayOrder] = useState(1);
  const [message, setMessage] = useState<string | null>(null);

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug, description, iconName, displayOrder }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`Category "${name}" created successfully!`);
        setIsModalOpen(false);
        // Refresh
        const ref = await fetch('/api/categories');
        const refData = await ref.json();
        if (refData.categories) setCategories(refData.categories);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{message}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-xs font-semibold">
            Dismiss
          </button>
        </div>
      )}

      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-border shadow-sm">
        <span className="text-sm text-text-secondary">
          Active Categories: <span className="font-semibold text-dark">{categories.length}</span>
        </span>
        <button
          onClick={() => {
            setName('');
            setSlug('');
            setDescription('');
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-full font-heading font-medium text-sm transition-all shadow-sm"
        >
          <Plus size={16} /> Add Category
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(cat => (
          <div
            key={cat.id}
            className="bg-white rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-surface text-primary border border-border/60">
                    <Layers size={18} />
                  </div>
                  <h3 className="font-heading font-semibold text-dark text-base">{cat.name}</h3>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-surface border border-border text-text-muted">
                  #{cat.display_order}
                </span>
              </div>

              <p className="text-xs text-text-secondary line-clamp-2 my-2">{cat.description || 'No description provided.'}</p>
            </div>

            <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs text-text-muted">
              <span className="font-mono">/category/{cat.slug}</span>
              <span className="font-semibold text-primary">{cat.item_count || 0} items</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-border">
            <h2 className="font-display text-2xl text-dark mb-4">Add Taxonomy Category</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => handleNameChange(e.target.value)}
                  placeholder="e.g. Gut Health"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Slug</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={e => setSlug(e.target.value)}
                  placeholder="e.g. gut-health"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-primary focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Short description of this health domain..."
                  rows={2}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-primary focus:outline-none"
                />
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
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
