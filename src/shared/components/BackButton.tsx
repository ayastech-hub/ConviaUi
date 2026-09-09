import type { CSSProperties } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft } from 'lucide-react';

interface BackButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
  size?: number;
}

const glassStyle: CSSProperties = {
  background: 'var(--liquid-control-bg)',
  border: '1px solid var(--liquid-control-border)',
  boxShadow: 'var(--liquid-control-shadow)',
  backdropFilter: 'blur(16px) saturate(180%)',
  WebkitBackdropFilter: 'blur(16px) saturate(180%)',
};

/** Liquid glass back control — theme tokens for light + dark. */
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
      <ChevronLeft
        size={Math.round(size * 0.5)}
        style={{ color: 'var(--liquid-icon-active)' }}
        strokeWidth={2.25}
      />
    </motion.button>
  );
}
