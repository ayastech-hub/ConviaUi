import { motion } from 'motion/react';
import { Clock, Copy, Check } from 'lucide-react';
import type { Currency } from '../../../../shared/context/CurrencyContext';
import type { PaymentMethod } from './PaymentMethodSelector';

interface OnRampInstructionsStepProps {
  currency: Currency;
  amount: string;
  paymentMethod: PaymentMethod;
  copied: boolean;
  onCopy: (text: string) => void;
  onPaid: () => void;
}

/** On-Ramp step 3: bank/mobile-money transfer instructions to complete the on-ramp. */
export function OnRampInstructionsStep({ currency, amount, paymentMethod, copied, onCopy, onPaid }: OnRampInstructionsStepProps) {
  const rows = [
    { label: 'Account Name', value: 'Convia Technologies Ltd' },
    { label: 'Bank', value: 'GTBank Plc' },
    { label: 'Account Number', value: '0123456789' },
    ...(paymentMethod === 'mobile' ? [{ label: 'MoMo Provider', value: 'MTN Mobile Money' }] : []),
    { label: 'Reference', value: `CNV-${Date.now().toString().slice(-8)}` },
  ];

  return (
    <motion.div key="instructions" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
      <div className="rounded-[20px] p-5 mb-4 glass-card" style={{ border: '1px solid var(--border)' }}>
        <h3 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 17, marginBottom: 4 }}>Payment Instructions</h3>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginBottom: 16 }}>
          Send exactly <span style={{ color: 'var(--foreground)', fontWeight: 700 }}>{currency.symbol}{Number(amount).toLocaleString()}</span> to the account below to complete your on-ramp.
        </p>

        <div className="rounded-[14px] p-4 mb-4" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
          {rows.map((row, i) => (
            <div key={row.label} className="flex items-center justify-between py-2.5" style={{ borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{row.label}</span>
              <div className="flex items-center gap-2">
                <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600, fontFamily: row.label === 'Account Number' || row.label === 'Reference' ? 'monospace' : 'inherit' }}>{row.value}</span>
                <button onClick={() => onCopy(row.value)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--card)' }}>
                  {copied ? <Check size={12} style={{ color: 'var(--positive)' }} /> : <Copy size={12} style={{ color: 'var(--muted-foreground)' }} />}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-start gap-2 p-3 rounded-[12px] mb-4" style={{ background: 'var(--muted)', border: '1px solid var(--muted)' }}>
          <Clock size={14} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: 1 }} />
          <p style={{ color: 'var(--muted-foreground)', fontSize: 11, lineHeight: 1.5 }}>Payment must be made within 30 minutes. Your crypto will be credited automatically once payment is confirmed.</p>
        </div>
      </div>
      <motion.button whileTap={{ scale: 0.97 }} onClick={onPaid} className="w-full py-3.5 rounded-[16px] text-white" style={{ background: 'var(--positive)', fontWeight: 700, fontSize: 15 }}>
        I've Made the Payment
      </motion.button>
    </motion.div>
  );
}
