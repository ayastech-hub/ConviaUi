import { motion } from 'motion/react';
import { ArrowDownUp } from 'lucide-react';

/** The circular flip button that sits between the "You pay" and "You receive" cards. */
export function SwapDirectionButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="absolute left-1/2 -translate-x-1/2 -bottom-5 z-10">
      <motion.button
        whileTap={{ scale: 0.85, rotate: 180 }}
        onClick={onClick}
        aria-label="Flip swap direction"
        className="w-10 h-10 rounded-full flex items-center justify-center"
        style={{ background: 'var(--secondary)', border: '3px solid var(--background)', boxShadow: '0 4px 14px var(--muted)' }}
      >
        <ArrowDownUp size={16} className="text-white" />
      </motion.button>
    </div>
  );
}
