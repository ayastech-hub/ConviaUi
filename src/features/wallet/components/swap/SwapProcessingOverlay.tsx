import { motion } from 'motion/react';
import { Loader } from 'lucide-react';
import { AssetIcon } from '../../../../shared/components/AssetIcon';

interface SwapProcessingOverlayProps {
  fromSymbol: string;
  toSymbol: string;
  chainName?: string;
}

/** Full-viewport processing state — fixed so parent height collapse cannot blank the UI. */
export function SwapProcessingOverlay({ fromSymbol, toSymbol }: SwapProcessingOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex flex-col items-center justify-center px-6"
      style={{ background: 'var(--background)' }}
      role="status"
      aria-live="polite"
      aria-label="Swapping"
    >
      <div className="flex items-center gap-4 mb-6">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <AssetIcon symbol={fromSymbol} size={36} />
        </div>
        <Loader size={22} className="animate-spin shrink-0" style={{ color: 'var(--primary)' }} />
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <AssetIcon symbol={toSymbol} size={36} />
        </div>
      </div>
      <p style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 18 }}>Swapping…</p>
      <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginTop: 8, textAlign: 'center' }}>
        {fromSymbol.toUpperCase()} → {toSymbol.toUpperCase()}
      </p>
    </motion.div>
  );
}
