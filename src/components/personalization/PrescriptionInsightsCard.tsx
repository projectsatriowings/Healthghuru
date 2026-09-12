'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Stethoscope,
  ShieldCheck,
  Sparkles,
  Trash2,
  ExternalLink,
  BookOpen,
  Calendar,
  Building,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { PillBadge } from '@/components/ui/PillBadge';
import { formatDate } from '@/lib/utils';

interface PrescriptionInsightsCardProps {
  prescription: any;
  onDelete?: (id: string) => void;
  className?: string;
}

export function PrescriptionInsightsCard({
  prescription,
  onDelete,
  className = '',
}: PrescriptionInsightsCardProps) {
  const [deleting, setDeleting] = useState(false);

  const detectedConditions: string[] = Array.isArray(prescription.detected_conditions)
    ? prescription.detected_conditions
    : [];

  const matchedCategories: string[] = Array.isArray(prescription.matched_categories)
    ? prescription.matched_categories
    : [];

  const actionableInsights: string[] = Array.isArray(prescription.actionable_insights)
    ? prescription.actionable_insights
    : [];

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to remove this prescription record?')) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/user/prescriptions/${prescription.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        onDelete?.(prescription.id);
      }
    } catch (err) {
      console.error('Failed to delete prescription:', err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-white border border-primary/20 p-5 sm:p-6 shadow-sm space-y-4 ${className}`}
    >
      {/* Top Banner & Metadata */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
            <Stethoscope size={20} />
          </div>
          <div>
            <h4 className="font-heading font-bold text-base sm:text-lg text-dark">
              {prescription.title}
            </h4>
            <div className="flex items-center gap-2.5 text-xs text-text-muted mt-0.5 flex-wrap">
              {prescription.doctor_or_facility && (
                <span className="flex items-center gap-1">
                  <Building size={12} />
                  <span>{prescription.doctor_or_facility}</span>
                </span>
              )}
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                <span suppressHydrationWarning>{formatDate(prescription.created_at)}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          {prescription.file_url && (
            <a
              href={prescription.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-surface hover:bg-surface-alt text-xs font-heading font-semibold text-text-primary border border-border inline-flex items-center gap-1.5 transition-colors"
            >
              <FileText size={13} />
              <span>View File</span>
              <ExternalLink size={11} />
            </a>
          )}
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="p-2 rounded-xl text-text-muted hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Delete prescription"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Detected Clinical Conditions & Health Focus Areas */}
      <div className="space-y-2">
        <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
          <Sparkles size={12} className="text-primary" />
          <span>Analyzed Health Focus Areas</span>
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {detectedConditions.map((cond, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 rounded-xl bg-primary/10 text-primary font-semibold text-xs border border-primary/20"
            >
              {cond}
            </span>
          ))}
          {matchedCategories.map((cat, idx) => (
            <PillBadge key={idx} active className="text-[10px] py-0.5 px-2">
              {cat}
            </PillBadge>
          ))}
        </div>
      </div>

      {/* Actionable Lifestyle Insights Takeaways */}
      {actionableInsights.length > 0 && (
        <div className="p-4 rounded-2xl bg-[#F5FAF5] border border-primary/15 space-y-2">
          <h5 className="font-heading font-bold text-xs uppercase tracking-wider text-primary">
            ✦ Evidence-Based Lifestyle & Nutritional Guidance
          </h5>
          <ul className="space-y-1.5">
            {actionableInsights.map((insight, idx) => (
              <li key={idx} className="text-xs text-text-secondary flex items-start gap-2 leading-relaxed">
                <CheckCircle2 size={14} className="text-primary shrink-0 mt-0.5" />
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Raw Notes / Medication Excerpt if available */}
      {prescription.raw_text && (
        <div className="text-xs text-text-muted bg-surface p-3 rounded-xl border border-border/60">
          <strong className="text-dark font-medium">Extracted Medication Notes:</strong>{' '}
          {prescription.raw_text}
        </div>
      )}

      {/* Medical Safety Disclaimer Notice */}
      <div className="pt-2 border-t border-border/40 flex items-start gap-2 text-[11px] text-text-muted leading-relaxed">
        <ShieldCheck size={14} className="text-primary shrink-0 mt-0.5" />
        <span>
          <strong>Prescription Safety Notice:</strong> These lifestyle recommendations are for educational health literacy. Always strictly adhere to your prescribing doctor’s clinical advice, dosage guidelines, and follow-up schedule.
        </span>
      </div>
    </div>
  );
}
