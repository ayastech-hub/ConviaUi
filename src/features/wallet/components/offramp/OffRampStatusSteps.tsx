import { motion } from 'motion/react';
import { ArrowUpRight, Loader, CheckCircle2, Clock } from 'lucide-react';
import type { Asset } from '../../../../shared/data/mockData';
import type { Currency } from '../../../../shared/context/CurrencyContext';
import type { BankAccount } from '../../../../shared/context/PaymentMethodsContext';

interface OffRampReviewStepProps {
  currency: Currency;
  format: (n: number) => string;
  amount: string;
  selectedAsset: Asset;
  youGet: number;
  selectedAccount?: BankAccount;
  fee: number;
  onConfirm: () => void;
}

/** Off-Ramp step 2: review the conversion and payout account before confirming. */
export function OffRampReviewStep({ currency, format, amount, selectedAsset, youGet, selectedAccount, fee, onConfirm }: OffRampReviewStepProps) {
  const rows = [
    { l: 'Account', v: selectedAccount ? `${selectedAccount.bankName} · ${selectedAccount.accountNumber}` : '' },
    { l: 'Account Holder', v: selectedAccount?.accountName ?? '' },
    { l: 'Fee', v: format(fee) },
    { l: 'Settlement', v: '~ 5 minutes' },
  ];

  return (
    <motion.div key="review" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
      <div className="rounded-[20px] p-5 mb-4 glass-card" style={{ border: '1px solid var(--border)' }}>
        <div className="text-center mb-6">
          <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Converting</p>
          <p style={{ color: 'var(--foreground)', fontSize: 32, fontWeight: 800, letterSpacing: -1 }}>{amount} {selectedAsset.symbol}</p>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>≈ {format(Number(amount) * selectedAsset.price)}</p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <div style={{ height: 1, width: 40, background: 'var(--border)' }} />
            <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>to</span>
            <div style={{ height: 1, width: 40, background: 'var(--border)' }} />
          </div>
          <p style={{ color: 'var(--foreground)', fontSize: 32, fontWeight: 800, letterSpacing: -1, marginTop: 8 }}>{currency.symbol}{youGet.toLocaleString('en', { maximumFractionDigits: 0 })}</p>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>{currency.name}</p>
        </div>
        {rows.map((row) => (
          <div key={row.l} className="flex justify-between py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>{row.l}</span>
            <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}>{row.v}</span>
          </div>
        ))}
      </div>
      <motion.button whileTap={{ scale: 0.97 }} onClick={onConfirm} className="w-full py-3.5 rounded-[16px] text-white flex items-center justify-center gap-2" style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 15 }}>
        Confirm Off-Ramp <ArrowUpRight size={18} />
      </motion.button>
    </motion.div>
  );
}

interface OffRampProcessingStepProps {
  amount: string;
  symbol: string;
  currency: Currency;
  youGet: number;
}

/** Off-Ramp step 3: brief "converting" spinner. */
export function OffRampProcessingStep({ amount, symbol, currency, youGet }: OffRampProcessingStepProps) {
  return (
    <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20">
      <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ background: 'var(--muted)' }}>
        <Loader size={44} style={{ color: 'var(--foreground)' }} className="animate-spin" />
      </div>
      <h3 style={{ color: 'var(--foreground)', fontWeight: 700, marginBottom: 8, marginTop: 24 }}>Processing...</h3>
      <p style={{ color: 'var(--muted-foreground)', fontSize: 13, textAlign: 'center' }}>
        Converting {amount} {symbol} to {currency.symbol}{youGet.toLocaleString('en', { maximumFractionDigits: 0 })} {currency.code}
      </p>
    </motion.div>
  );
}

interface OffRampDoneStepProps {
  currency: Currency;
  youGet: number;
  bankName?: string;
  onDone: () => void;
}

/** Off-Ramp step 4: final success confirmation. */
export function OffRampDoneStep({ currency, youGet, bankName, onDone }: OffRampDoneStepProps) {
  return (
    <motion.div key="done" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center py-12 text-center">
      <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ background: 'var(--muted)' }}>
        <CheckCircle2 size={52} style={{ color: 'var(--positive)' }} />
      </div>
      <h2 style={{ color: 'var(--foreground)', fontWeight: 800, marginBottom: 8 }}>Off-Ramp Successful!</h2>
      <p style={{ color: 'var(--foreground)', fontSize: 28, fontWeight: 800, marginBottom: 4 }}>{currency.symbol}{youGet.toLocaleString('en', { maximumFractionDigits: 0 })}</p>
      <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginBottom: 6 }}>Sent to {bankName}</p>
      <div className="flex items-center gap-1.5 mb-10 px-3 py-1.5 rounded-full" style={{ background: 'var(--muted)' }}>
        <Clock size={12} style={{ color: 'var(--foreground)' }} />
        <span style={{ color: 'var(--foreground)', fontSize: 12, fontWeight: 600 }}>Expected in 2-5 minutes</span>
      </div>
      <motion.button whileTap={{ scale: 0.97 }} onClick={onDone} className="w-full py-3.5 rounded-[16px] text-white" style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 15 }}>
        Done
      </motion.button>
    </motion.div>
  );
}
