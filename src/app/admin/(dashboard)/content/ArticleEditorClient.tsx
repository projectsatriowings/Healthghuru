/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect } from 'react';
import { manageArticle } from '@/lib/admin/actions/manageArticle';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/providers/ToastProvider';
import { BlockEditor } from '@/components/admin/content/BlockEditor';
import type { ArticleBlock } from '@/lib/types/article';
import { estimateReadTime } from '@/lib/utils/readTime';

export function ArticleEditorClient({ initialArticle }: { initialArticle?: any }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: initialArticle?.title || '',
    slug: initialArticle?.slug || '',
    category: initialArticle?.category || 'Nutrition',
    matchedGoalCategory: initialArticle?.matched_goal_category || '',
    excerpt: initialArticle?.excerpt || '',
    readTime: initialArticle?.read_time || 5,
    status: initialArticle?.status || 'draft',
    authorName: initialArticle?.author_name || 'Dr. Sarah Jenkins',
    authorCredential: initialArticle?.author_credential || 'MD, Nutrition Science',
    authorAvatar: initialArticle?.author_avatar || '/images/exercise_plank.png',
    heroImageUrl: initialArticle?.hero_image_url || '',
    heroImageAlt: initialArticle?.hero_image_alt || '',
    isFeatured: initialArticle?.is_featured ?? true,
    isTrending: initialArticle?.is_trending ?? false,
    qualityScore: initialArticle?.quality_score ?? 95,
    tagsInput: initialArticle?.tags ? initialArticle.tags.join(', ') : '',
  });
  
  const [blocks, setBlocks] = useState<ArticleBlock[]>(
    initialArticle?.blocks || [
      { type: 'paragraph', id: crypto.randomUUID(), text: '' }
    ]
  );
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const uploadData = new FormData();
    uploadData.append('file', file);
    
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: uploadData });
      const data = await res.json();
      if (data.url) {
        setFormData(prev => ({ ...prev, heroImageUrl: data.url }));
        toast.success('Hero image uploaded successfully');
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error: any) {
      toast.error('Upload failed: ' + error.message);
    }
  };

  // Auto-calculate read time when blocks change (if not manually overridden in a deep way)
  useEffect(() => {
    const estimated = estimateReadTime(blocks);
    setFormData(prev => ({ ...prev, readTime: estimated }));
  }, [blocks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const parsedTags = formData.tagsInput
        ? formData.tagsInput
            .split(',')
            .map((t: string) => t.trim())
            .filter(Boolean)
        : [];

      await manageArticle({
        action: initialArticle ? 'update' : 'create',
        id: initialArticle?.id,
        ...formData,
        isFeatured: Boolean(formData.isFeatured),
        isTrending: Boolean(formData.isTrending),
        qualityScore: Number(formData.qualityScore),
        tags: parsedTags,
        readTime: Number(formData.readTime),
        blocks: blocks,
      } as any);
      router.push('/admin/content');
      router.refresh();
      toast.success(initialArticle ? 'Article updated successfully' : 'Article created successfully');
    } catch (e: any) {
      toast.error('Error saving article: ' + e.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[rgba(46,125,50,0.15)] p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Top Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-4">
            <label className="block text-sm font-medium text-[#1A2E1A] mb-1">Title</label>
            <input 
              type="text" required
              value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-lg font-medium"
              placeholder="e.g. The Science of Sleep"
            />
          </div>
          
          <div className="lg:col-span-1">
            <label className="block text-sm font-medium text-[#1A2E1A] mb-1">Slug</label>
            <input 
              type="text" required
              value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="e.g. science-of-sleep"
            />
          </div>

          <div className="lg:col-span-1">
            <label className="block text-sm font-medium text-[#1A2E1A] mb-1">Status</label>
            <select 
              value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="draft">Draft ▾</option>
              <option value="published">Published ▾</option>
            </select>
          </div>

          <div className="lg:col-span-1">
            <label className="block text-sm font-medium text-[#1A2E1A] mb-1">Category</label>
            <select 
              value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="Nutrition">Nutrition ▾</option>
              <option value="Fitness">Fitness ▾</option>
              <option value="Sleep">Sleep ▾</option>
              <option value="Mental Health">Mental Health ▾</option>
              <option value="Gut Health">Gut Health ▾</option>
              <option value="Heart Health">Heart Health ▾</option>
              <option value="Healthy Aging">Healthy Aging ▾</option>
              <option value="Immunity">Immunity ▾</option>
            </select>
          </div>

          <div className="lg:col-span-1">
            <label className="block text-sm font-medium text-[#1A2E1A] mb-1">Matched Goal</label>
            <select 
              value={formData.matchedGoalCategory} onChange={e => setFormData({...formData, matchedGoalCategory: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">-- None -- ▾</option>
              <option value="weight">Weight ▾</option>
              <option value="fitness">Fitness ▾</option>
              <option value="sleep">Sleep ▾</option>
              <option value="mental_health">Mental Health ▾</option>
            </select>
          </div>

          <div className="lg:col-span-1">
            <label className="block text-sm font-medium text-[#1A2E1A] mb-1">Read Time (min)</label>
            <div className="flex items-center gap-2">
              <input 
                type="number" required min="1"
                value={formData.readTime} onChange={e => setFormData({...formData, readTime: parseInt(e.target.value) || 1})}
                className="w-20 px-4 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <span className="text-sm text-gray-500">≈ {estimateReadTime(blocks)} min est.</span>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <label className="block text-sm font-medium text-[#1A2E1A] mb-1">Author</label>
            <input 
              type="text" required
              value={formData.authorName} onChange={e => setFormData({...formData, authorName: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-[#1A2E1A] mb-1">Author Credential</label>
            <input 
              type="text"
              value={formData.authorCredential} onChange={e => setFormData({...formData, authorCredential: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-[#1A2E1A] mb-1">Hero Image</label>
            <div className="flex gap-3 items-center">
              <input 
                type="file" accept="image/*"
                onChange={handleHeroImageUpload}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white"
              />
              {formData.heroImageUrl && (
                <div className="relative w-10 h-10 rounded border border-gray-200 overflow-hidden shrink-0">
                  <img src={formData.heroImageUrl} alt="Preview" className="object-cover w-full h-full" />
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-[#1A2E1A] mb-1">Hero Image Alt Text</label>
            <input 
              type="text"
              value={formData.heroImageAlt} onChange={e => setFormData({...formData, heroImageAlt: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          <div className="lg:col-span-4">
            <label className="block text-sm font-medium text-[#1A2E1A] mb-1">Excerpt</label>
            <textarea 
              required rows={2}
              value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none text-sm"
              placeholder="A brief summary of the article..."
            ></textarea>
          </div>
        </div>

        {/* Recommendation Engine Signals & Tags */}
        <div className="p-4 bg-[#F5FAF5] rounded-xl border border-[rgba(46,125,50,0.2)] space-y-4">
          <h4 className="font-heading font-semibold text-sm text-primary flex items-center gap-2">
            <span>✦ Personalization & Recommendation Engine Signals</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isFeaturedToggle"
                checked={formData.isFeatured}
                onChange={e => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="w-4 h-4 rounded text-primary focus:ring-primary/40"
              />
              <label htmlFor="isFeaturedToggle" className="text-xs font-semibold text-dark cursor-pointer">
                Curated Pick (is_featured +1.5x)
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isTrendingToggle"
                checked={formData.isTrending}
                onChange={e => setFormData({ ...formData, isTrending: e.target.checked })}
                className="w-4 h-4 rounded text-primary focus:ring-primary/40"
              />
              <label htmlFor="isTrendingToggle" className="text-xs font-semibold text-dark cursor-pointer">
                Trending Surge (is_trending +1.0x)
              </label>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-dark">
                Quality Score (1–100): {formData.qualityScore}
              </label>
              <input
                type="range"
                min="50"
                max="100"
                value={formData.qualityScore}
                onChange={e => setFormData({ ...formData, qualityScore: parseInt(e.target.value) || 90 })}
                className="w-full accent-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-dark">
                Taxonomy Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tagsInput}
                onChange={e => setFormData({ ...formData, tagsInput: e.target.value })}
                placeholder="e.g. nutrition, longevity, diet"
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs"
              />
            </div>
          </div>
        </div>

        <hr className="border-t border-[rgba(46,125,50,0.15)] my-8" />
        
        <div>
          <h3 className="text-lg font-semibold text-[#1A2E1A] mb-4">Article Body</h3>
          <BlockEditor blocks={blocks} onChange={setBlocks} />
        </div>

        <hr className="border-t border-[rgba(46,125,50,0.15)] my-8" />

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={() => router.push('/admin/content')} className="px-6 py-2 rounded-lg text-[#78909C] hover:bg-gray-100 font-medium transition-colors">
            Cancel
          </button>
          <button 
            type="button" 
            onClick={(e) => { setFormData(prev => ({ ...prev, status: 'draft' })); handleSubmit(e); }} 
            disabled={isSubmitting} 
            className="border border-[#2E7D32] text-[#2E7D32] hover:bg-[#F5FAF5] px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Save Draft
          </button>
          <button 
            type="button"
            onClick={(e) => { setFormData(prev => ({ ...prev, status: 'published' })); handleSubmit(e); }}
            disabled={isSubmitting} 
            className="bg-accent hover:opacity-90 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {initialArticle && formData.status === 'published' ? 'Update Published' : 'Publish'}
          </button>
        </div>
      </form>
    </div>
  );
}
