import { motion } from 'motion/react';
import { ArrowDownUp } from 'lucide-react';

/** Center flip control between You send / You receive. */
export function SwapDirectionButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="relative flex items-center justify-center py-4">
      <div className="absolute left-0 right-0 h-px" style={{ background: 'var(--border)' }} />
      <motion.button
        type="button"
        whileTap={{ scale: 0.88, rotate: 180 }}
        onClick={onClick}
        aria-label="Flip swap direction"
        className="relative z-10 w-11 h-11 rounded-full flex items-center justify-center"
        style={{
          background: 'var(--muted)',
          border: '1px solid var(--border)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
        }}
      >
        <ArrowDownUp size={18} style={{ color: 'var(--foreground)' }} />
      </motion.button>
    </div>
  );
}
