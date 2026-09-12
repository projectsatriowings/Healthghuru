'use client';

import { useState } from 'react';
import { Share2, Link as LinkIcon, Check } from 'lucide-react';

interface ShareActionsProps {
  title: string;
}

export function ShareActions({ title }: ShareActionsProps) {
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      showToast('Link copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error copying link:', err);
      showToast('Failed to copy link.', 'error');
    }
  };

  return (
    <>
      <button 
        onClick={handleShare}
        className="article-share-icon w-10 h-10 rounded-full bg-surface-alt flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
        title="Share Article"
      >
        <Share2 size={18} />
      </button>
      
      <button 
        onClick={handleCopyLink}
        className="article-share-icon w-10 h-10 rounded-full bg-surface-alt flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
        title="Copy Link"
      >
        {copied ? <Check size={18} /> : <LinkIcon size={18} />}
      </button>

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
