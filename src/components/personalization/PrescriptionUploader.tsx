'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import {
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  Stethoscope,
  ShieldCheck,
  Camera,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PrescriptionUploaderProps {
  onSuccess?: (newPrescription: any) => void;
  className?: string;
}

export function PrescriptionUploader({ onSuccess, className = '' }: PrescriptionUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [doctorOrFacility, setDoctorOrFacility] = useState('');
  const [rawText, setRawText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    setError(null);
    setFile(selectedFile);

    if (!title) {
      const cleanName = selectedFile.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }

    if (selectedFile.type.startsWith('image/')) {
      const url = URL.createObjectURL(selectedFile);
      setFilePreview(url);
    } else {
      setFilePreview(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleClearFile = () => {
    setFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file && !rawText.trim() && !title.trim()) {
      setError('Please attach a prescription file or enter medication details.');
      return;
    }

    setUploading(true);
    setError(null);
    setAnalysisStep('Uploading prescription file...');

    try {
      let uploadedFileUrl: string | null = null;
      let uploadedFileName: string | null = null;

      if (file) {
        const formData = new FormData();
        formData.append('file', file);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok || !uploadData.url) {
          throw new Error(uploadData.error || 'Failed to upload prescription image');
        }

        uploadedFileUrl = uploadData.url;
        uploadedFileName = file.name;
      }

      setAnalysisStep('Analyzing clinical markers & dietary connections...');
      await new Promise((resolve) => setTimeout(resolve, 800)); // Smooth UX transition

      const res = await fetch('/api/user/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || 'Medical Prescription',
          doctorOrFacility: doctorOrFacility || null,
          fileUrl: uploadedFileUrl,
          fileName: uploadedFileName,
          rawText: rawText || '',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze prescription');
      }

      setAnalysisStep('Personalizing your HealthGuru feed...');
      await new Promise((resolve) => setTimeout(resolve, 400));

      // Reset form
      setFile(null);
      setFilePreview(null);
      setTitle('');
      setDoctorOrFacility('');
      setRawText('');
      setUploading(false);
      setAnalysisStep(null);

      onSuccess?.(data.prescription);
    } catch (err: any) {
      console.error('Prescription upload error:', err);
      setError(err.message || 'Error processing prescription.');
      setUploading(false);
      setAnalysisStep(null);
    }
  };

  return (
    <div className={`bg-white rounded-3xl border border-primary/20 p-6 shadow-sm ${className}`}>
      <div className="flex items-center gap-2.5 mb-2">
        <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <Stethoscope size={18} />
        </div>
        <div>
          <h3 className="font-heading font-bold text-lg text-dark">Upload Medical Prescription</h3>
          <p className="text-xs text-text-secondary">
            Upload your prescription photo or document to receive tailored educational guides, diets, and exercise insights.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        {/* Drag & Drop Upload Zone */}
        {!filePreview && !file ? (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-primary/30 hover:border-primary rounded-2xl p-6 text-center cursor-pointer bg-surface/60 hover:bg-surface transition-all group"
          >
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*,application/pdf"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <Upload size={20} />
            </div>
            <p className="font-heading font-semibold text-sm text-dark">
              Click or drag prescription photo here
            </p>
            <p className="text-xs text-text-muted mt-1">
              Supports JPG, PNG, WEBP, and PDF documents (Max 10MB)
            </p>
          </div>
        ) : (
          <div className="relative p-4 rounded-2xl bg-surface border border-primary/20 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 overflow-hidden">
              {filePreview ? (
                <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-border shrink-0">
                  <Image src={filePreview} alt="Prescription preview" fill className="object-cover" />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <FileText size={24} />
                </div>
              )}
              <div className="overflow-hidden">
                <p className="font-heading font-semibold text-xs sm:text-sm text-dark truncate">
                  {file?.name || 'Attached Prescription'}
                </p>
                <p className="text-[11px] text-text-muted">
                  {file ? (file.size / (1024 * 1024)).toFixed(2) + ' MB' : 'Ready for analysis'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClearFile}
              className="p-1.5 rounded-lg text-text-muted hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Remove attached file"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Prescription Metadata Form Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1">
            <label className="block text-xs font-heading font-semibold uppercase tracking-wider text-text-primary">
              Prescription Title / Condition
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Cardiology Checkup, Blood Pressure Rx"
              className="w-full px-3.5 py-2 bg-surface border border-border rounded-xl text-xs text-dark focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-heading font-semibold uppercase tracking-wider text-text-primary">
              Doctor or Clinic (Optional)
            </label>
            <input
              type="text"
              value={doctorOrFacility}
              onChange={(e) => setDoctorOrFacility(e.target.value)}
              placeholder="e.g. Dr. Kumar / Apollo Clinic"
              className="w-full px-3.5 py-2 bg-surface border border-border rounded-xl text-xs text-dark focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Medicines / Notes Input */}
        <div className="space-y-1">
          <label className="block text-xs font-heading font-semibold uppercase tracking-wider text-text-primary">
            Prescribed Medications & Notes (Optional)
          </label>
          <textarea
            rows={2}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="e.g. Metformin 500mg, Telmisartan 40mg, Vitamin D3 once weekly, Omeprazole before breakfast..."
            className="w-full px-3.5 py-2 bg-surface border border-border rounded-xl text-xs text-dark focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Medical Privacy & Disclaimer Guarantee */}
        <div className="flex items-center justify-between pt-1 text-[11px] text-text-muted">
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-primary" />
            <span>256-bit encrypted • Private to your personal account</span>
          </span>
          <Button variant="primary" size="md" type="submit" disabled={uploading}>
            {uploading ? (
              <span className="flex items-center gap-2">
                <Sparkles size={14} className="animate-spin" />
                <span>{analysisStep || 'Analyzing...'}</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Sparkles size={14} />
                <span>Analyze & Get Recommendations</span>
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
