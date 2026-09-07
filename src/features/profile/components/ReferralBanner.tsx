import { motion } from 'motion/react';
import { Copy, Gift } from 'lucide-react';
import { useState, type MouseEvent } from 'react';

interface ReferralBannerProps {
  code: string;
  reward: string;
  onOpen: () => void;
}

/** Invite card on the account face — code is copyable; Share opens the referral sheet. */
export function ReferralBanner({ code, reward, onOpen }: ReferralBannerProps) {
  const [copied, setCopied] = useState(false);
  const display = code && code !== '—' ? code : '—';

  const copy = async (e: MouseEvent) => {
    e.stopPropagation();
    if (!code || code === '—') return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      onOpen();
    }
  };

  return (
    <div className="px-5 mb-5">
      <motion.div
        whileTap={{ scale: 0.99 }}
        onClick={onOpen}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onOpen();
        }}
        className="p-4 rounded-[22px] flex items-center gap-3"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--muted)' }}
        >
          <Gift size={18} style={{ color: 'var(--foreground)' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14, letterSpacing: '-0.01em' }}>
            Invite and earn
          </p>
          <p className="truncate" style={{ color: 'var(--muted-foreground)', fontSize: 12, marginTop: 2 }}>
            {reward}
          </p>
          <button
            type="button"
            onClick={copy}
            className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-lg"
            style={{
              background: 'var(--muted)',
              color: 'var(--foreground)',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.04em',
            }}
          >
            <Copy size={11} />
            {copied ? 'Copied' : display}
          </button>
        </div>
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={(e) => {
            e.stopPropagation();
            onOpen();
          }}
          className="px-3.5 py-2 rounded-xl flex-shrink-0"
          style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', fontSize: 12, fontWeight: 700 }}
        >
          Share
        </motion.button>
      </motion.div>
    </div>
  );
}
