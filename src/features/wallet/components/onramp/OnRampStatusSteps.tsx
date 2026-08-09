import { motion } from 'motion/react';
import { Loader, CheckCircle2, Clock } from 'lucide-react';
import type { Currency } from '../../../../shared/context/CurrencyContext';

interface OnRampProcessingStepProps {
  currency: Currency;
  amount: string;
  youGet: number;
  symbol: string;
}

/** On-Ramp step 4: brief "converting" spinner. */
export function OnRampProcessingStep({ currency, amount, youGet, symbol }: OnRampProcessingStepProps) {
  return (
    <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20">
      <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ background: 'var(--muted)' }}>
        <Loader size={44} style={{ color: 'var(--foreground)' }} className="animate-spin" />
      </div>
      <h3 style={{ color: 'var(--foreground)', fontWeight: 700, marginBottom: 8, marginTop: 24 }}>Processing...</h3>
      <p style={{ color: 'var(--muted-foreground)', fontSize: 13, textAlign: 'center' }}>
        Converting {currency.symbol}{Number(amount).toLocaleString()} to {youGet.toFixed(6)} {symbol}
      </p>
    </motion.div>
  );
}

interface OnRampDoneStepProps {
  youGet: number;
  symbol: string;
  onDone: () => void;
}

/** On-Ramp step 5: final success confirmation. */
export function OnRampDoneStep({ youGet, symbol, onDone }: OnRampDoneStepProps) {
  return (
    <motion.div key="done" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center py-12 text-center">
      <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ background: 'var(--muted)' }}>
        <CheckCircle2 size={52} style={{ color: 'var(--positive)' }} />
      </div>
      <h2 style={{ color: 'var(--foreground)', fontWeight: 800, marginBottom: 8 }}>On-Ramp Successful!</h2>
      <p style={{ color: 'var(--foreground)', fontSize: 28, fontWeight: 800, marginBottom: 4 }}>{youGet.toFixed(6)} {symbol}</p>
      <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginBottom: 6 }}>Credited to your wallet</p>
      <div className="flex items-center gap-1.5 mb-10 px-3 py-1.5 rounded-full" style={{ background: 'var(--muted)' }}>
        <Clock size={12} style={{ color: 'var(--foreground)' }} />
        <span style={{ color: 'var(--foreground)', fontSize: 12, fontWeight: 600 }}>Completed</span>
      </div>
      <motion.button whileTap={{ scale: 0.97 }} onClick={onDone} className="w-full py-3.5 rounded-[16px] text-white" style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 15 }}>
        Done
      </motion.button>
    </motion.div>
  );
}
