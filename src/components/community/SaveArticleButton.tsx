'use client';

import { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck, X, FolderPlus } from 'lucide-react';

interface Collection {
  id: string;
  name: string;
}

export function SaveArticleButton({ articleId }: { articleId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    // Ideally we'd fetch if this is already saved, but for now we'll fetch collections on open
  }, [articleId]);

  const handleOpen = async () => {
    setIsOpen(true);
    setLoading(true);
    try {
      const res = await fetch('/api/collections');
      const data = await res.json();
      if (data.success) {
        setCollections(data.collections || []);
        // Check if article is in savedArticles
        const isAlreadySaved = data.savedArticles?.some((a: any) => a.article_id === articleId || a.id === articleId);
        setIsSaved(isAlreadySaved);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleSave = async (collectionId: string | null) => {
    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_article', articleId, collectionId })
      });
      const data = await res.json();
      if (data.success) {
        setIsSaved(true);
        setIsOpen(false);
        showToast('Article saved successfully!', 'success');
      } else {
        showToast(data.error || 'Failed to save article.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('An error occurred.', 'error');
    }
  };

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;
    setIsCreating(true);
    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_collection', name: newCollectionName })
      });
      const data = await res.json();
      if (data.success) {
        setCollections([data.collection, ...collections]);
        setNewCollectionName('');
        showToast('Collection created successfully!', 'success');
        // Auto-save to the new collection
        handleSave(data.collection.id);
      } else {
        showToast(data.error || 'Failed to create collection.', 'error');
      }
    } catch (err) {
      showToast('An error occurred.', 'error');
    }
    setIsCreating(false);
  };

  return (
    <>
      <button 
        onClick={handleOpen}
        className="article-share-icon w-10 h-10 rounded-full bg-surface-alt flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
        title="Save to Collection"
      >
        {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 text-text-muted hover:text-dark rounded-full hover:bg-surface transition-colors"
            >
              <X size={20} />
            </button>
            
            <h3 className="font-display text-xl text-dark mb-1">Save Article</h3>
            <p className="text-xs text-text-secondary mb-5">Choose a collection or create a new one.</p>

            {loading ? (
              <div className="py-8 flex justify-center">
                <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
                  <button
                    onClick={() => handleSave(null)}
                    className="w-full text-left px-4 py-3 rounded-xl hover:bg-surface border border-transparent hover:border-border transition-colors flex items-center justify-between group"
                  >
                    <span className="font-heading font-semibold text-sm text-dark">All Saved Items (Default)</span>
                    <Bookmark size={16} className="text-text-muted group-hover:text-primary" />
                  </button>
                  
                  {collections.map(c => (
                    <button
                      key={c.id}
                      onClick={() => handleSave(c.id)}
                      className="w-full text-left px-4 py-3 rounded-xl hover:bg-surface border border-transparent hover:border-border transition-colors flex items-center justify-between group"
                    >
                      <span className="font-heading font-semibold text-sm text-dark">{c.name}</span>
                      <FolderPlus size={16} className="text-text-muted group-hover:text-primary" />
                    </button>
                  ))}
                </div>

                <div className="pt-3 border-t border-border">
                  <form onSubmit={handleCreateCollection} className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="New collection name..."
                      value={newCollectionName}
                      onChange={e => setNewCollectionName(e.target.value)}
                      className="flex-1 bg-surface border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                    <button 
                      type="submit"
                      disabled={isCreating || !newCollectionName.trim()}
                      className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 shrink-0"
                    >
                      Create
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-24 right-6 z-[60] animate-in slide-in-from-top-5 fade-in duration-300">
          <div className={`px-5 py-3 rounded-xl shadow-lg border text-sm font-semibold flex items-center gap-2 ${
            toast.type === 'success' ? 'bg-white border-green-200 text-green-700' : 'bg-white border-red-200 text-red-600'
          }`}>
            {toast.message}
          </div>
        </div>
      )}
    </>
  );
}
