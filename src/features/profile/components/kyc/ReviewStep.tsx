import { motion } from 'motion/react';
import { User, FileText, Camera, CheckCircle2, Shield, ShieldCheck, ChevronLeft, ArrowLeft, Loader } from 'lucide-react';
import { formatFileSize, type Country, type UploadedFile } from './types';

interface ReviewStepProps {
  fullName: string;
  dob: string;
  country: Country | null;
  address1: string;
  address2: string;
  city: string;
  postalCode: string;
  docTypeLabel: string;
  uploadedFile: UploadedFile | null;
  submitting: boolean;
  onEditStep: (step: number) => void;
  onBack: () => void;
  onSubmit: () => void;
}

/** KYC Step 4: read-only summary of the previous 3 steps, plus the final submit action. */
export function ReviewStep({
  fullName, dob, country, address1, address2, city, postalCode,
  docTypeLabel, uploadedFile, submitting, onEditStep, onBack, onSubmit,
}: ReviewStepProps) {
  const personalRows = [
    { label: 'Full Name', value: fullName },
    { label: 'Date of Birth', value: dob },
    { label: 'Country', value: country ? `${country.flag} ${country.name}` : '' },
    { label: 'Address', value: [address1, address2].filter(Boolean).join(', ') },
    { label: 'City', value: city },
    { label: 'Postal Code', value: postalCode },
  ];

  return (
    <div>
      <div className="mb-5">
        <h3 style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 17, marginBottom: 4 }}>Review & Submit</h3>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Please confirm your information before submitting.</p>
      </div>

      <div className="rounded-[20px] p-4 mb-3" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[10px] flex items-center justify-center" style={{ background: 'var(--muted)' }}>
              <User size={16} style={{ color: 'var(--foreground)' }} />
            </div>
            <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>Personal Information</p>
          </div>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => onEditStep(0)} className="px-3 py-1.5 rounded-[10px] flex items-center gap-1" style={{ background: 'var(--muted)' }}>
            <ChevronLeft size={12} style={{ color: 'var(--foreground)', transform: 'rotate(180deg)' }} />
            <span style={{ color: 'var(--foreground)', fontSize: 12, fontWeight: 600 }}>Edit</span>
          </motion.button>
        </div>
        <div className="space-y-2">
          {personalRows.map((row) => (
            <div key={row.label} className="flex justify-between items-start gap-3">
              <span style={{ color: 'var(--muted-foreground)', fontSize: 12, flexShrink: 0 }}>{row.label}</span>
              <span style={{ color: 'var(--foreground)', fontSize: 12, fontWeight: 600, textAlign: 'right', wordBreak: 'break-word' }}>{row.value || '—'}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[20px] p-4 mb-3" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[10px] flex items-center justify-center" style={{ background: 'var(--muted)' }}>
              <FileText size={16} style={{ color: 'var(--foreground)' }} />
            </div>
            <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>Document</p>
          </div>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => onEditStep(1)} className="px-3 py-1.5 rounded-[10px] flex items-center gap-1" style={{ background: 'var(--muted)' }}>
            <ChevronLeft size={12} style={{ color: 'var(--foreground)', transform: 'rotate(180deg)' }} />
            <span style={{ color: 'var(--foreground)', fontSize: 12, fontWeight: 600 }}>Edit</span>
          </motion.button>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-start gap-3">
            <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Document Type</span>
            <span style={{ color: 'var(--foreground)', fontSize: 12, fontWeight: 600, textAlign: 'right' }}>{docTypeLabel || '—'}</span>
          </div>
          <div className="flex justify-between items-start gap-3">
            <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>File</span>
            <span style={{ color: 'var(--foreground)', fontSize: 12, fontWeight: 600, textAlign: 'right' }}>
              {uploadedFile ? `${uploadedFile.name} (${formatFileSize(uploadedFile.size)})` : '—'}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-[20px] p-4 mb-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[10px] flex items-center justify-center" style={{ background: 'var(--muted)' }}>
              <Camera size={16} style={{ color: 'var(--foreground)' }} />
            </div>
            <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>Selfie Verification</p>
          </div>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => onEditStep(2)} className="px-3 py-1.5 rounded-[10px] flex items-center gap-1" style={{ background: 'var(--muted)' }}>
            <ChevronLeft size={12} style={{ color: 'var(--foreground)', transform: 'rotate(180deg)' }} />
            <span style={{ color: 'var(--foreground)', fontSize: 12, fontWeight: 600 }}>Edit</span>
          </motion.button>
        </div>
        <div className="flex items-center gap-2.5">
          <CheckCircle2 size={16} style={{ color: 'var(--positive)' }} />
          <span style={{ color: 'var(--foreground)', fontSize: 12, fontWeight: 600 }}>Liveness check passed</span>
        </div>
      </div>

      <div className="rounded-[14px] p-3.5 mb-4 flex items-start gap-2.5" style={{ background: 'var(--muted)', border: '1px solid var(--muted)' }}>
        <Shield size={16} style={{ color: 'var(--foreground)', flexShrink: 0, marginTop: 1 }} />
        <p style={{ color: 'var(--muted-foreground)', fontSize: 11, lineHeight: 1.5 }}>
          By submitting, you confirm the information is accurate and consent to Convia verifying your identity with our compliance partners. Your data is encrypted and stored securely.
        </p>
      </div>

      <div className="flex gap-3">
        <motion.button whileTap={{ scale: 0.97 }} onClick={onBack} className="flex items-center justify-center gap-1.5 py-3.5 rounded-[16px]" style={{ background: 'var(--muted)', color: 'var(--foreground)', fontWeight: 700, fontSize: 15, width: 56, border: '1px solid var(--border)' }}>
          <ArrowLeft size={18} />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onSubmit}
          disabled={submitting}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[16px] text-white"
          style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 15, opacity: submitting ? 0.8 : 1 }}
        >
          {submitting ? (<><Loader size={18} className="animate-spin" /> Submitting...</>) : (<><ShieldCheck size={18} /> Submit Verification</>)}
        </motion.button>
      </div>
    </div>
  );
}
