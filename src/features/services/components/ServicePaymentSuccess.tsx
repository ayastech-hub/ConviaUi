import { motion } from 'motion/react';
import { Check, XCircle, Home, RotateCcw } from 'lucide-react';

export interface ServiceSuccessInfo {
  label: string;
  provider: string;
  localAmount: string;
  localCurrency: string;
  cryptoAmount?: string;
  cryptoAsset?: string;
  status: 'completed' | 'processing' | 'failed';
  externalRef?: string;
  failureReason?: string;
  customerRef?: string;
}

interface ServicePaymentSuccessProps {
  info: ServiceSuccessInfo;
  onNewPayment: () => void;
  onBackToHome: () => void;
}

function formatLocal(amount: string, currency: string) {
  const n = Number(amount);
  const c = (currency || 'NGN').toUpperCase();
  if (!Number.isFinite(n)) return `${c} ${amount}`;
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: c,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${c} ${amount}`;
  }
}

export function ServicePaymentSuccess({ info, onNewPayment, onBackToHome }: ServicePaymentSuccessProps) {
  const ok = info.status === 'completed' || info.status === 'processing';
  const title =
    info.status === 'completed'
      ? 'Payment successful'
      : info.status === 'processing'
        ? 'Payment processing'
        : 'Payment failed';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center px-1 pt-6 pb-8"
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
        style={{
          background: ok ? 'color-mix(in oklab, var(--positive) 18%, transparent)' : 'color-mix(in oklab, var(--destructive) 18%, transparent)',
          border: `1px solid ${ok ? 'var(--positive)' : 'var(--destructive)'}`,
        }}
      >
        {ok ? (
          <Check size={32} style={{ color: 'var(--positive)' }} strokeWidth={2.5} />
        ) : (
          <XCircle size={32} style={{ color: 'var(--destructive)' }} strokeWidth={2} />
        )}
      </div>

      <h2 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 22, marginBottom: 6 }}>{title}</h2>
      <p style={{ color: 'var(--muted-foreground)', fontSize: 14, textAlign: 'center', marginBottom: 20, maxWidth: 280 }}>
        {ok
          ? `${info.label} · ${info.provider}`
          : info.failureReason || 'The provider could not complete this payment. Your balance was not charged or has been refunded.'}
      </p>

      <div
        className="w-full rounded-2xl p-4 mb-6 space-y-3"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <Row label="Service" value={info.label} />
        <Row label="Provider" value={info.provider} />
        {info.customerRef ? <Row label="Recipient" value={info.customerRef} /> : null}
        <div className="flex justify-between pt-2" style={{ borderTop: '1px solid var(--border)' }}>
          <span style={{ color: 'var(--foreground)', fontSize: 14, fontWeight: 700 }}>Bill amount</span>
          <span style={{ color: 'var(--foreground)', fontSize: 18, fontWeight: 800 }}>
            {formatLocal(info.localAmount, info.localCurrency)}
          </span>
        </div>
        {info.cryptoAmount && info.cryptoAsset ? (
          <div className="flex justify-between">
            <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Crypto debited</span>
            <span style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}>
              {Number(info.cryptoAmount).toFixed(6)} {info.cryptoAsset}
            </span>
          </div>
        ) : null}
        {info.externalRef ? (
          <div className="flex justify-between">
            <span style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>Reference</span>
            <span style={{ color: 'var(--muted-foreground)', fontSize: 11, fontFamily: 'monospace' }}>
              {info.externalRef.slice(0, 24)}
            </span>
          </div>
        ) : null}
      </div>

      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        onClick={onNewPayment}
        className="w-full py-3.5 rounded-full flex items-center justify-center gap-2 mb-3"
        style={{ background: 'var(--primary)', color: 'var(--primary-foreground, #fff)', fontWeight: 700, fontSize: 15 }}
      >
        <RotateCcw size={16} />
        New payment
      </motion.button>
      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        onClick={onBackToHome}
        className="w-full py-3.5 rounded-full flex items-center justify-center gap-2"
        style={{ background: 'var(--muted)', color: 'var(--foreground)', fontWeight: 600, fontSize: 15 }}
      >
        <Home size={16} />
        Home
      </motion.button>
    </motion.div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>{label}</span>
      <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600, textAlign: 'right' }}>{value}</span>
    </div>
  );
}
