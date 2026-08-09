import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft } from 'lucide-react';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  /** Optional content rendered on the right side of the header (e.g. an action button). */
  right?: ReactNode;
  /** Extra bottom margin below the header row. Defaults to 24px (mb-6). */
  marginBottom?: number;
}

/**
 * The "back chevron + title" header used at the top of almost every
 * sub-screen in the app (Settings, Security, EditProfile, KYC, Send,
 * Receive, Swap, etc). Was previously copy-pasted with only the title
 * text changing across 20 different screen files.
 */
export function ScreenHeader({ title, subtitle, onBack, right, marginBottom = 24 }: ScreenHeaderProps) {
  return (
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
      <div className="flex-1">
        <h2 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: subtitle ? 22 : 18, lineHeight: 1.1 }}>{title}</h2>
        {subtitle && <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginTop: 2 }}>{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}
