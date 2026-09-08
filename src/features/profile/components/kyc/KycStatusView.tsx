import { motion } from 'motion/react';
import { Check, Clock, ShieldAlert, ArrowRight, ShieldCheck } from 'lucide-react';
import { ScreenHeader } from '../../../../shared/components/ScreenHeader';

interface KycStatusViewProps {
  mode: 'approved' | 'pending' | 'rejected';
  statusLabel: string;
  onBack: () => void;
  onResubmit?: () => void;
}

const COPY = {
  approved: {
    title: 'Identity verified',
    body: 'Your documents are approved. Withdrawals, bills, and off-ramp are fully available.',
    icon: ShieldCheck,
    color: 'var(--positive)',
  },
  pending: {
    title: 'In review',
    body: 'Compliance is reviewing your documents. Typical turnaround is 24–48 hours. We will notify you when it completes.',
    icon: Clock,
    color: 'var(--warning)',
  },
  rejected: {
    title: 'Verification failed',
    body: 'We could not verify this submission. Check the photo quality and that the name matches your ID, then try again.',
    icon: ShieldAlert,
    color: 'var(--destructive)',
  },
} as const;

/** Approved / pending / rejected landing — not a dummy empty shield. */
export function KycStatusView({ mode, statusLabel, onBack, onResubmit }: KycStatusViewProps) {
  const c = COPY[mode];
  const Icon = c.icon;

  const unlocked = [
    { label: 'Withdrawals', on: mode === 'approved' },
    { label: 'Bill payments', on: mode === 'approved' },
    { label: 'Sell crypto', on: mode === 'approved' },
    { label: 'Internal transfers', on: mode !== 'rejected' },
  ];

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <ScreenHeader title="Identity" subtitle="Know-your-customer" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-5 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[24px] p-5 mb-4"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'var(--muted)' }}
          >
            <Icon size={22} style={{ color: c.color }} />
          </div>
          <h2 style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 22, letterSpacing: '-0.03em', marginBottom: 8 }}>
            {c.title}
          </h2>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 13, lineHeight: 1.5 }}>{c.body}</p>
          <span
            className="inline-block mt-4 px-2.5 py-1 rounded-full"
            style={{
              background: 'var(--muted)',
              color: c.color,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            {statusLabel}
          </span>
        </motion.div>

        <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', marginBottom: 10 }}>
          ACCESS
        </p>
        <div className="rounded-[20px] overflow-hidden mb-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          {unlocked.map((row, i) => (
            <div
              key={row.label}
              className="flex items-center justify-between px-4 py-3.5"
              style={{ borderBottom: i < unlocked.length - 1 ? '1px solid var(--border)' : 'none' }}
            >
              <span style={{ color: 'var(--foreground)', fontSize: 14, fontWeight: 500 }}>{row.label}</span>
              <span
                style={{
                  color: row.on ? 'var(--positive)' : 'var(--muted-foreground)',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {row.on ? 'Open' : 'Limited'}
              </span>
            </div>
          ))}
        </div>

        {mode === 'rejected' && onResubmit && (
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={onResubmit}
            className="w-full py-3.5 rounded-[16px] text-white flex items-center justify-center gap-2 mb-3"
            style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 15 }}
          >
            Submit again <ArrowRight size={16} />
          </motion.button>
        )}
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={onBack}
          className="w-full py-3.5 rounded-[16px] flex items-center justify-center gap-2"
          style={{
            background: 'var(--muted)',
            color: 'var(--foreground)',
            fontWeight: 600,
            fontSize: 15,
            border: '1px solid var(--border)',
          }}
        >
          {mode === 'approved' ? (
            <>
              <Check size={16} /> Done
            </>
          ) : (
            'Back'
          )}
        </motion.button>
      </div>
    </div>
  );
}
