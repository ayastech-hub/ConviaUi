import { motion } from 'motion/react';
import { Shield } from 'lucide-react';

interface PaymentSummaryCardProps {
  provider: string;
  serviceLabel: string;
  /** Local fiat amount user is paying for the bill (e.g. 500) */
  localAmount: string;
  /** e.g. NGN */
  localCurrency: string;
  /** Optional crypto debit estimate shown secondary */
  cryptoHint?: string;
  canPay: boolean;
  onPay: () => void;
  paying?: boolean;
}

function formatLocal(amount: string, currency: string) {
  const n = Number(amount);
  const c = (currency || 'NGN').toUpperCase();
  if (!Number.isFinite(n)) return `${c} 0`;
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: c,
      maximumFractionDigits: c === 'NGN' || c === 'GHS' || c === 'KES' ? 0 : 2,
    }).format(n);
  } catch {
    return `${c} ${n.toLocaleString()}`;
  }
}

/** Pay CTA — amounts in local currency, not USD. */
export function PaymentSummaryCard({
  provider,
  serviceLabel,
  localAmount,
  localCurrency,
  cryptoHint,
  canPay,
  onPay,
  paying,
}: PaymentSummaryCardProps) {
  return (
    <div className="mt-2 pb-4">
      <div
        className="rounded-2xl p-4 mb-4 space-y-2.5"
        style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
      >
        <div className="flex justify-between">
          <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Service</span>
          <span style={{ color: 'var(--foreground)', fontSize: 12, fontWeight: 600 }}>{serviceLabel}</span>
        </div>
        <div className="flex justify-between">
          <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Provider</span>
          <span style={{ color: 'var(--foreground)', fontSize: 12, fontWeight: 600 }}>{provider}</span>
        </div>
        <div className="flex justify-between pt-2" style={{ borderTop: '1px solid var(--border)' }}>
          <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}>Bill amount</span>
          <span style={{ color: 'var(--primary)', fontSize: 18, fontWeight: 800 }}>
            {formatLocal(localAmount, localCurrency)}
          </span>
        </div>
        {cryptoHint ? (
          <div className="flex justify-between">
            <span style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>Est. crypto debit</span>
            <span style={{ color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600 }}>{cryptoHint}</span>
          </div>
        ) : null}
        <div className="flex items-center gap-1.5 pt-1">
          <Shield size={12} style={{ color: 'var(--muted-foreground)' }} />
          <span style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>
            Paid from Convia balance · VTPass for Nigeria
          </span>
        </div>
      </div>

      <motion.button
        type="button"
        whileTap={{ scale: canPay && !paying ? 0.98 : 1 }}
        disabled={!canPay || paying}
        onClick={onPay}
        className="w-full py-4 rounded-full"
        style={{
          background: canPay && !paying ? 'var(--primary)' : 'var(--muted)',
          color: canPay && !paying ? 'var(--primary-foreground, #fff)' : 'var(--muted-foreground)',
          fontWeight: 700,
          fontSize: 16,
        }}
      >
        {paying ? 'Processing…' : canPay ? `Pay ${formatLocal(localAmount, localCurrency)}` : 'Complete details to pay'}
      </motion.button>
    </div>
  );
}
