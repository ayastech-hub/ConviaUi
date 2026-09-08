import { type ReactNode, type CSSProperties } from 'react';
import { motion } from 'motion/react';
import { User, FileText, Camera, CheckCircle2, Shield, ShieldCheck, ArrowLeft, Loader } from 'lucide-react';
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

function flagSrc(code: string) {
  return `https://flagcdn.com/w40/${code.toLowerCase()}.png`;
}

function Card({
  icon: Icon,
  title,
  onEdit,
  children,
}: {
  icon: React.ComponentType<{ size?: number; style?: CSSProperties }>;
  title: string;
  onEdit: () => void;
  children: ReactNode;
}) {
  return (
    <div className="rounded-[20px] p-4 mb-3" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-[10px] flex items-center justify-center" style={{ background: 'var(--muted)' }}>
            <Icon size={16} style={{ color: 'var(--foreground)' }} />
          </div>
          <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>{title}</p>
        </div>
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          onClick={onEdit}
          className="px-3 py-1.5 rounded-[10px]"
          style={{ background: 'var(--muted)', color: 'var(--foreground)', fontSize: 12, fontWeight: 600 }}
        >
          Edit
        </motion.button>
      </div>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex justify-between items-start gap-3 py-1">
      <span style={{ color: 'var(--muted-foreground)', fontSize: 12, flexShrink: 0 }}>{label}</span>
      <span style={{ color: 'var(--foreground)', fontSize: 12, fontWeight: 600, textAlign: 'right', wordBreak: 'break-word' }}>
        {value || '—'}
      </span>
    </div>
  );
}

export function ReviewStep({
  fullName,
  dob,
  country,
  address1,
  address2,
  city,
  postalCode,
  docTypeLabel,
  uploadedFile,
  submitting,
  onEditStep,
  onBack,
  onSubmit,
}: ReviewStepProps) {
  return (
    <div>
      <div className="mb-5">
        <h3 style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em', marginBottom: 4 }}>
          Review and submit
        </h3>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Confirm this matches your ID before sending.</p>
      </div>

      <Card icon={User} title="Personal" onEdit={() => onEditStep(0)}>
        <Row label="Legal name" value={fullName} />
        <Row label="Date of birth" value={dob} />
        <Row
          label="Country"
          value={
            country ? (
              <span className="inline-flex items-center gap-1.5 justify-end">
                <img src={flagSrc(country.code)} alt="" width={16} height={11} style={{ width: 16, height: 11, objectFit: 'cover', borderRadius: 1 }} />
                {country.name}
              </span>
            ) : (
              '—'
            )
          }
        />
        <Row label="Address" value={[address1, address2].filter(Boolean).join(', ')} />
        <Row label="City" value={city} />
        <Row label="Postal code" value={postalCode} />
      </Card>

      <Card icon={FileText} title="Document" onEdit={() => onEditStep(1)}>
        <Row label="Type" value={docTypeLabel} />
        <Row label="File" value={uploadedFile ? `${uploadedFile.name} (${formatFileSize(uploadedFile.size)})` : '—'} />
      </Card>

      <Card icon={Camera} title="Selfie" onEdit={() => onEditStep(2)}>
        <div className="flex items-center gap-2.5">
          <CheckCircle2 size={16} style={{ color: 'var(--positive)' }} />
          <span style={{ color: 'var(--foreground)', fontSize: 12, fontWeight: 600 }}>Selfie captured</span>
        </div>
      </Card>

      <div className="rounded-[14px] p-3.5 mb-4 flex items-start gap-2.5" style={{ background: 'var(--muted)' }}>
        <Shield size={16} style={{ color: 'var(--foreground)', flexShrink: 0, marginTop: 1 }} />
        <p style={{ color: 'var(--muted-foreground)', fontSize: 11, lineHeight: 1.5 }}>
          You confirm this information is accurate and consent to identity checks with our compliance partners. Data is encrypted in transit.
        </p>
      </div>

      <div className="flex gap-3">
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={onBack}
          className="flex items-center justify-center py-3.5 rounded-[16px]"
          style={{
            background: 'var(--muted)',
            color: 'var(--foreground)',
            width: 56,
            border: '1px solid var(--border)',
          }}
        >
          <ArrowLeft size={18} />
        </motion.button>
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={onSubmit}
          disabled={submitting}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[16px] text-white"
          style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 15, opacity: submitting ? 0.8 : 1 }}
        >
          {submitting ? (
            <>
              <Loader size={18} className="animate-spin" /> Submitting
            </>
          ) : (
            <>
              <ShieldCheck size={18} /> Submit
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}
