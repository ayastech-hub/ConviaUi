import { motion } from 'motion/react';
import { Loader } from 'lucide-react';
import { AssetIcon } from '../../../../shared/components/AssetIcon';

interface SwapProcessingOverlayProps {
  fromSymbol: string;
  toSymbol: string;
  chainName?: string;
}

/** Opaque full-screen — never show the form underneath. */
export function SwapProcessingOverlay({ fromSymbol, toSymbol }: SwapProcessingOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-[60] flex flex-col items-center justify-center"
      style={{ background: 'var(--background)' }}
    >
      <div className="flex items-center gap-3 mb-5">
        <AssetIcon symbol={fromSymbol} size={36} />
        <Loader size={18} className="animate-spin" style={{ color: 'var(--muted-foreground)' }} />
        <AssetIcon symbol={toSymbol} size={36} />
      </div>
      <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 16 }}>Swapping…</p>
    </motion.div>
  );
}
