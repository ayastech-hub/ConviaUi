import type { CSSProperties } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft } from 'lucide-react';

interface BackButtonProps {
  onClick: () => void;
  /** Accessible label */
  label?: string;
  className?: string;
  size?: number;
}

const glassStyle: CSSProperties = {
  background:
    'linear-gradient(165deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0.08) 48%, rgba(255,255,255,0.04) 100%)',
  border: '1px solid rgba(255,255,255,0.22)',
  boxShadow:
    'inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.18), 0 2px 10px rgba(0,0,0,0.2)',
  backdropFilter: 'blur(16px) saturate(180%)',
  WebkitBackdropFilter: 'blur(16px) saturate(180%)',
};

/** Liquid Apple-glass circular back control — use everywhere instead of ad-hoc chevrons. */
export function BackButton({ onClick, label = 'Go back', className = '', size = 40 }: BackButtonProps) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      aria-label={label}
      className={`flex items-center justify-center flex-shrink-0 rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        ...glassStyle,
      }}
    >
      <ChevronLeft size={Math.round(size * 0.5)} style={{ color: 'rgba(255,255,255,0.95)' }} strokeWidth={2.25} />
    </motion.button>
  );
}
