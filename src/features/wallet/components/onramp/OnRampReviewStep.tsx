import { motion } from 'motion/react';
import type { Asset } from '../../../../shared/data/mockData';
import type { Currency } from '../../../../shared/context/CurrencyContext';
import type { SavedCard } from '../../../../shared/context/PaymentMethodsContext';
import type { PaymentMethod } from './PaymentMethodSelector';

interface OnRampReviewStepProps {
  currency: Currency;
  format: (n: number) => string;
  amount: string;
  selectedAsset: Asset;
  youGet: number;
  paymentMethod: PaymentMethod;
  selectedCard?: SavedCard;
  fee: number;
  onConfirm: () => void;
}

/** On-Ramp step 2: review the amounts and payment method before getting instructions. */
export function OnRampReviewStep({ currency, format, amount, selectedAsset, youGet, paymentMethod, selectedCard, fee, onConfirm }: OnRampReviewStepProps) {
  const rows = [
    { l: 'Method', v: paymentMethod === 'bank' ? 'Bank Transfer' : paymentMethod === 'mobile' ? 'Mobile Money' : selectedCard ? `${selectedCard.brand} •••• ${selectedCard.last4}` : 'New Card' },
    { l: 'Fee', v: format(fee) },
    { l: 'Settlement', v: '~ 5 minutes' },
  ];

  return (
    <motion.div key="review" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
      <div className="rounded-[20px] p-5 mb-4 glass-card" style={{ border: '1px solid var(--border)' }}>
        <div className="text-center mb-6">
          <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Paying</p>
          <p style={{ color: 'var(--foreground)', fontSize: 32, fontWeight: 800, letterSpacing: -1 }}>{currency.symbol}{Number(amount).toLocaleString()}</p>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>{currency.name}</p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <div style={{ height: 1, width: 40, background: 'var(--border)' }} />
            <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>to</span>
            <div style={{ height: 1, width: 40, background: 'var(--border)' }} />
          </div>
          <p style={{ color: 'var(--foreground)', fontSize: 32, fontWeight: 800, letterSpacing: -1, marginTop: 8 }}>{youGet.toFixed(6)} {selectedAsset.symbol}</p>
        </div>
        {rows.map((row) => (
          <div key={row.l} className="flex justify-between py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>{row.l}</span>
            <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}>{row.v}</span>
          </div>
        ))}
      </div>
      <motion.button whileTap={{ scale: 0.97 }} onClick={onConfirm} className="w-full py-3.5 rounded-[16px] text-white" style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 15 }}>
        Confirm & Get Payment Instructions
      </motion.button>
    </motion.div>
  );
}
