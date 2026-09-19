import { motion } from 'motion/react';

interface PaymentSummaryCardProps {
  provider: string;
  serviceLabel: string;
  localAmount: string;
  localCurrency: string;
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

/** Compact pay footer — enterprise bill flows. */
export function PaymentSummaryCard({
  localAmount,
  localCurrency,
  canPay,
  onPay,
  paying,
}: PaymentSummaryCardProps) {
  return (
    <div
      className="mt-4 pt-4"
      style={{ borderTop: '1px solid var(--border)' }}
    >
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p style={{ color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600 }}>You pay</p>
          <p
            className="tabular-nums"
            style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em' }}
          >
            {formatLocal(localAmount, localCurrency)}
          </p>
        </div>
        <motion.button
          type="button"
          whileTap={{ scale: canPay && !paying ? 0.97 : 1 }}
          disabled={!canPay || paying}
          onClick={onPay}
          className="shrink-0 px-8 h-12 rounded-full"
          style={{
            background: canPay && !paying ? 'var(--primary)' : 'var(--muted)',
            color: canPay && !paying ? 'var(--primary-foreground, #fff)' : 'var(--muted-foreground)',
            fontWeight: 700,
            fontSize: 15,
          }}
        >
          {paying ? '…' : 'Pay'}
        </motion.button>
      </div>
    </div>
  );
}
