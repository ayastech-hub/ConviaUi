import { motion } from 'motion/react';
import { Shield } from 'lucide-react';

interface PaymentSummaryCardProps {
  provider: string;
  serviceLabel: string;
  displayAmount: string;
  canPay: boolean;
  onPay: () => void;
}

/** Sticky-style pay CTA + fee summary for bill flows. */
export function PaymentSummaryCard({
  provider,
  serviceLabel,
  displayAmount,
  canPay,
  onPay,
}: PaymentSummaryCardProps) {
  const amt = Number(displayAmount) || 0;

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
        <div
          className="flex justify-between pt-2"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}>You pay</span>
          <span style={{ color: 'var(--primary)', fontSize: 16, fontWeight: 700 }}>
            ${amt > 0 ? amt.toFixed(2) : '0.00'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 pt-1">
          <Shield size={12} style={{ color: 'var(--muted-foreground)' }} />
          <span style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>
            Debited from your Convia balance · usually instant
          </span>
        </div>
      </div>

      <motion.button
        type="button"
        whileTap={{ scale: canPay ? 0.98 : 1 }}
        disabled={!canPay}
        onClick={onPay}
        className="w-full py-4 rounded-full"
        style={{
          background: canPay ? 'var(--primary)' : 'var(--muted)',
          color: canPay ? 'var(--primary-foreground, #fff)' : 'var(--muted-foreground)',
          fontWeight: 700,
          fontSize: 16,
        }}
      >
        {canPay ? 'Pay now' : 'Complete details to pay'}
      </motion.button>
    </div>
  );
}
