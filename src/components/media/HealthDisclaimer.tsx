import { ShieldAlert } from 'lucide-react';

export function HealthDisclaimer({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="text-[11px] text-text-muted flex items-center gap-1.5 py-2">
        <ShieldAlert size={12} className="text-primary shrink-0" />
        <span>
          <strong>Medical Disclaimer:</strong> HealthGhuru content and syndicated feeds are for educational purposes and do not constitute clinical diagnosis or medical advice.
        </span>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-2xl p-5 border border-primary/15 my-8">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
          <ShieldAlert size={20} />
        </div>
        <div className="space-y-1 text-xs text-text-secondary">
          <h4 className="font-heading font-semibold text-dark text-sm">
            Health & Medical Information Disclaimer
          </h4>
          <p className="leading-relaxed">
            The health news, articles, research summaries, and videos aggregated on HealthGhuru are provided for educational and informational purposes only. Content should not be used as a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified physician or healthcare provider regarding any health condition or dietary changes.
          </p>
        </div>
      </div>
    </div>
  );
}
