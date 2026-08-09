import { motion } from 'motion/react';
import { ArrowDownUp } from 'lucide-react';

interface SwapProcessingOverlayProps {
  fromSymbol: string;
  toSymbol: string;
  chainName: string;
}

/** Full-screen "Swapping X → Y" overlay shown while a swap is executing. */
export function SwapProcessingOverlay({ fromSymbol, toSymbol, chainName }: SwapProcessingOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="absolute inset-0 z-[60] flex flex-col items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
    >
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }} className="w-16 h-16 rounded-full flex items-center justify-center mb-5" style={{ background: 'var(--muted)' }}>
        <ArrowDownUp size={28} style={{ color: 'var(--foreground)' }} />
      </motion.div>
      <motion.p animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.4, repeat: Infinity }} style={{ color: '#FFF', fontSize: 15, fontWeight: 700 }}>
        Swapping {fromSymbol} → {toSymbol}
      </motion.p>
      <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginTop: 6 }}>Finding the best route on {chainName}…</p>
    </motion.div>
  );
}
