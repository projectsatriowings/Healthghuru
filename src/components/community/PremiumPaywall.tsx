'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Lock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export function PremiumPaywall() {
  const router = useRouter();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDebugUpgrade = async () => {
    setIsUpgrading(true);
    try {
      const res = await fetch('/api/debug/upgrade', { method: 'POST' });
      if (res.ok) {
        showToast('Successfully upgraded to Pro!', 'success');
        // Give the toast a moment to show before refreshing
        setTimeout(() => router.refresh(), 1000);
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to upgrade account', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('A network error occurred.', 'error');
    }
    setIsUpgrading(false);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-20 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-primary/10 text-center relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-gradient-to-br from-accent/20 to-primary/5 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-gradient-to-tr from-primary/10 to-transparent rounded-full blur-2xl" />
        
        <div className="relative z-10">
          <div className="w-16 h-16 mx-auto bg-gradient-hero rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg transform rotate-3">
            <Lock size={32} />
          </div>
          
          <h2 className="font-display text-3xl text-dark mb-3">Premium Tools</h2>
          <p className="text-text-secondary mb-8">
            Get exclusive access to our advanced health calculators and AI Symptom Checker by upgrading to HealthGhuru Pro.
          </p>
          
          <div className="text-left space-y-4 mb-8 bg-surface rounded-2xl p-5 border border-primary/10">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={18} className="text-primary shrink-0 mt-0.5" />
              <span className="text-sm font-semibold text-dark">Personalized Macro & Calorie Calculator</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 size={18} className="text-primary shrink-0 mt-0.5" />
              <span className="text-sm font-semibold text-dark">Sleep Cycle Optimization Calculator</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 size={18} className="text-primary shrink-0 mt-0.5" />
              <span className="text-sm font-semibold text-dark">AI-Powered Health Assistant</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <Link 
              href="/subscribe"
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-accent to-[#ff8a57] text-white font-heading font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Sparkles size={18} />
              Upgrade to Pro
            </Link>
            
            <button 
              onClick={handleDebugUpgrade}
              disabled={isUpgrading}
              className="text-xs font-semibold text-text-muted hover:text-primary transition-colors underline decoration-border underline-offset-4"
            >
              {isUpgrading ? 'Upgrading...' : 'Developer Test: Upgrade Account'}
            </button>
          </div>
        </div>
      </div>

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
    </div>
  );
}
