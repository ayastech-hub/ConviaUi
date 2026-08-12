import { motion } from 'motion/react';
import { ArrowDownUp } from 'lucide-react';

interface SwapProcessingOverlayProps {
  fromSymbol: string;
  toSymbol: string;
  chainName?: string;
}

/** Shown only while the execute API is in flight (ledger, not on-chain routing). */
export function SwapProcessingOverlay({ fromSymbol, toSymbol }: SwapProcessingOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.12 }}
      className="absolute inset-0 z-[60] flex flex-col items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
        style={{ background: 'var(--muted)' }}
      >
        <ArrowDownUp size={24} style={{ color: 'var(--foreground)' }} />
      </motion.div>
      <p style={{ color: '#FFF', fontSize: 15, fontWeight: 700 }}>
        Swapping {fromSymbol} → {toSymbol}
      </p>
      <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginTop: 6 }}>Updating your ledger…</p>
    </motion.div>
  );
}
