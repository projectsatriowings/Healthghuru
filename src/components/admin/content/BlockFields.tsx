/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import { Trash2, Plus } from 'lucide-react';
import { useToast } from '@/components/providers/ToastProvider';
import type { ArticleBlock } from '@/lib/types/article';

interface BlockFieldsProps {
  block: ArticleBlock;
  onUpdate: (updated: ArticleBlock) => void;
}

export function BlockFields({ block, onUpdate }: BlockFieldsProps) {
  const { toast } = useToast();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || block.type !== 'image') return;
    
    const uploadData = new FormData();
    uploadData.append('file', file);
    
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: uploadData });
      const data = await res.json();
      if (data.url) {
        onUpdate({ ...block, url: data.url });
      } else {
        toast.error(data.error || 'Upload failed');
      }
    } catch (error: any) {
      toast.error('Upload failed: ' + error.message);
    }
  };

  switch (block.type) {
    case 'paragraph':
      return (
        <textarea
          value={block.text}
          onChange={(e) => onUpdate({ ...block, text: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none min-h-[100px]"
          placeholder="Enter paragraph text..."
          required
        />
      );

    case 'heading':
      return (
        <div className="flex gap-4">
          <select
            value={block.level}
            onChange={(e) => onUpdate({ ...block, level: Number(e.target.value) as 2 | 3 })}
            className="px-4 py-2 border border-gray-300 rounded-lg w-24"
          >
            <option value={2}>H2</option>
            <option value={3}>H3</option>
          </select>
          <input
            type="text"
            value={block.text}
            onChange={(e) => onUpdate({ ...block, text: e.target.value })}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="Heading text..."
            required
          />
        </div>
      );

    case 'pull_quote':
      return (
        <div className="space-y-3">
          <textarea
            value={block.text}
            onChange={(e) => onUpdate({ ...block, text: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none"
            placeholder="Quote text..."
            rows={2}
            required
          />
          <input
            type="text"
            value={block.attribution || ''}
            onChange={(e) => onUpdate({ ...block, attribution: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="Attribution (optional)"
          />
        </div>
      );

    case 'key_takeaway':
      return (
        <div className="space-y-3">
          <input
            type="text"
            value={block.title}
            onChange={(e) => onUpdate({ ...block, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg font-medium"
            placeholder="Takeaway Title"
            required
          />
          {block.points.map((point, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={point}
                onChange={(e) => {
                  const newPoints = [...block.points];
                  newPoints[index] = e.target.value;
                  onUpdate({ ...block, points: newPoints });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder={`Point ${index + 1}...`}
                required
              />
              <button
                type="button"
                onClick={() => {
                  const newPoints = block.points.filter((_, i) => i !== index);
                  onUpdate({ ...block, points: newPoints });
                }}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                disabled={block.points.length <= 1}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => onUpdate({ ...block, points: [...block.points, ''] })}
            className="flex items-center gap-1 text-sm font-medium text-[#2E7D32] hover:text-[#1A2E1A]"
          >
            <Plus size={16} /> Add Point
          </button>
        </div>
      );

    case 'numbered_list':
      return (
        <div className="space-y-3">
          <input
            type="text"
            value={block.title || ''}
            onChange={(e) => onUpdate({ ...block, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg font-medium"
            placeholder="List Title (Optional)"
          />
          {block.items.map((item, index) => (
            <div key={index} className="flex gap-2">
              <span className="py-2 text-sm font-bold text-[#78909C] w-6 text-right">{index + 1}.</span>
              <input
                type="text"
                value={item}
                onChange={(e) => {
                  const newItems = [...block.items];
                  newItems[index] = e.target.value;
                  onUpdate({ ...block, items: newItems });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder={`Item ${index + 1}...`}
                required
              />
              <button
                type="button"
                onClick={() => {
                  const newItems = block.items.filter((_, i) => i !== index);
                  onUpdate({ ...block, items: newItems });
                }}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                disabled={block.items.length <= 1}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => onUpdate({ ...block, items: [...block.items, ''] })}
            className="flex items-center gap-1 text-sm font-medium text-[#2E7D32] hover:text-[#1A2E1A] ml-8"
          >
            <Plus size={16} /> Add Item
          </button>
        </div>
      );

    case 'image':
      return (
        <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Upload Image</label>
            <div className="flex gap-3 items-center">
              <input
                type="file" accept="image/*"
                onChange={handleImageUpload}
                className="flex-1 px-4 py-2 border border-gray-300 bg-white rounded-lg text-sm"
              />
              {block.url && (
                <div className="relative w-10 h-10 rounded border border-gray-200 overflow-hidden shrink-0">
                  <img src={block.url} alt="Preview" width={40} height={40} className="object-cover w-full h-full" />
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Alt Text (Required)</label>
              <input
                type="text"
                value={block.alt}
                onChange={(e) => onUpdate({ ...block, alt: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="Describe image for screen readers"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Caption (Optional)</label>
              <input
                type="text"
                value={block.caption || ''}
                onChange={(e) => onUpdate({ ...block, caption: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="Image caption"
              />
            </div>
          </div>
        </div>
      );

    case 'tip_callout':
      return (
        <div className="flex gap-4">
          <div className="w-24">
            <label className="block text-xs font-medium text-gray-500 mb-1">Icon</label>
            <select
              value={block.icon || 'leaf'}
              onChange={(e) => onUpdate({ ...block, icon: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="leaf">Leaf</option>
              <option value="heart">Heart</option>
              <option value="moon">Moon</option>
              <option value="check">Check</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">Tip Text</label>
            <textarea
              value={block.text}
              onChange={(e) => onUpdate({ ...block, text: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none text-sm"
              placeholder="Enter tip or callout text..."
              rows={2}
              required
            />
          </div>
        </div>
      );

    case 'divider':
      return (
        <div className="flex items-center justify-center p-4">
          <hr className="w-full border-t-2 border-dashed border-gray-200" />
        </div>
      );

    default:
      return <div className="text-sm text-red-500">Unknown block type</div>;
  }
}
