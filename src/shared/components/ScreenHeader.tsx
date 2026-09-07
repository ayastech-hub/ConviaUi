import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import { LAYOUT } from '../layout/spacing';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  right?: ReactNode;
  marginBottom?: number;
  /** When false, parent already rendered <PageTop /> */
  includeTopInset?: boolean;
}

/**
 * Standard sub-screen header: top inset + back + title.
 * Top spacing is fixed so Settings / Send / KYC / etc. align with Home.
 */
export function ScreenHeader({
  title,
  subtitle,
  onBack,
  right,
  marginBottom = LAYOUT.headerBottom,
  includeTopInset = true,
}: ScreenHeaderProps) {
  return (
    <div>
      {includeTopInset && (
        <div
          aria-hidden
          style={{
            height: `max(${LAYOUT.top}px, env(safe-area-inset-top, 0px))`,
            flexShrink: 0,
          }}
        />
      )}
      <div className="flex items-center gap-3 px-5" style={{ marginBottom }}>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          aria-label="Go back"
          className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <ChevronLeft size={20} style={{ color: 'var(--foreground)' }} />
        </motion.button>
        <div className="flex-1 min-w-0">
          <h2
            style={{
              color: 'var(--foreground)',
              fontWeight: 800,
              fontSize: subtitle ? 22 : 18,
              lineHeight: 1.1,
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginTop: 2 }}>{subtitle}</p>
          )}
        </div>
        {right}
      </div>
    </div>
  );
}
