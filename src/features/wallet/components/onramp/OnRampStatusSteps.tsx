import { motion } from 'motion/react';
import { Loader, CheckCircle2 } from 'lucide-react';
import type { Currency } from '../../../../shared/context/CurrencyContext';

interface OnRampProcessingStepProps {
  currency: Currency;
  amount: string;
  youGet: number;
  symbol: string;
}

export function OnRampProcessingStep({ currency, amount, youGet, symbol }: OnRampProcessingStepProps) {
  return (
    <motion.div
      key="processing"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-24 px-5"
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center"
        style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
      >
        <Loader size={28} style={{ color: 'var(--foreground)' }} className="animate-spin" />
      </div>
      <h3 style={{ color: 'var(--foreground)', fontWeight: 700, marginTop: 20, fontSize: 18 }}>
        Processing
      </h3>
      <p style={{ color: 'var(--muted-foreground)', fontSize: 13, textAlign: 'center', marginTop: 8 }}>
        {currency.symbol}
        {Number(amount).toLocaleString()} → {youGet.toLocaleString(undefined, { maximumFractionDigits: 6 })}{' '}
        {symbol}
      </p>
    </motion.div>
  );
}

interface OnRampDoneStepProps {
  youGet: number;
  symbol: string;
  onDone: () => void;
}

export function OnRampDoneStep({ youGet, symbol, onDone }: OnRampDoneStepProps) {
  return (
    <motion.div
      key="done"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center py-16 px-5 text-center"
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
        style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
      >
        <CheckCircle2 size={32} style={{ color: 'var(--primary)' }} />
      </div>
      <h2 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 20, marginBottom: 8 }}>
        Order submitted
      </h2>
      <p className="tabular-nums" style={{ color: 'var(--foreground)', fontSize: 24, fontWeight: 700 }}>
        {youGet.toLocaleString(undefined, { maximumFractionDigits: 6 })} {symbol}
      </p>
      <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginTop: 6, marginBottom: 28 }}>
        Credited when payment confirms
      </p>
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={onDone}
        className="w-full py-4 rounded-full"
        style={{
          background: 'var(--primary)',
          color: 'var(--primary-foreground, #fff)',
          fontWeight: 700,
          fontSize: 16,
        }}
      >
        Done
      </motion.button>
    </motion.div>
  );
}
