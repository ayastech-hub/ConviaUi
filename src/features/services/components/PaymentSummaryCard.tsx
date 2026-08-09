import { motion } from 'motion/react';

interface PaymentSummaryCardProps {
  provider: string;
  serviceLabel: string;
  displayAmount: string;
  canPay: boolean;
  onPay: () => void;
}

/** Order summary (provider/service/total) and the "Pay" button at the bottom of the detail flow. */
export function PaymentSummaryCard({ provider, serviceLabel, displayAmount, canPay, onPay }: PaymentSummaryCardProps) {
  return (
    <>
      <div className="rounded-[16px] p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="flex justify-between py-1.5">
          <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Provider</span>
          <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}>{provider}</span>
        </div>
        <div className="flex justify-between py-1.5">
          <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Service</span>
          <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}>{serviceLabel}</span>
        </div>
        <div className="flex justify-between pt-2.5" style={{ borderTop: '1px solid var(--border)' }}>
          <span style={{ color: 'var(--foreground)', fontSize: 14, fontWeight: 700 }}>Total</span>
          <span style={{ color: 'var(--foreground)', fontSize: 18, fontWeight: 800 }}>${displayAmount}</span>
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onPay}
        disabled={!canPay}
        className="w-full py-4 rounded-[16px] text-white"
        style={{ background: canPay ? 'var(--primary)' : 'var(--muted)', fontWeight: 700, fontSize: 15, opacity: canPay ? 1 : 0.5 }}
      >
        {canPay ? `Pay $${displayAmount}` : 'Enter details to continue'}
      </motion.button>
    </>
  );
}
