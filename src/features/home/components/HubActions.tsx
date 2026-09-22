import { motion } from 'motion/react';
import { ArrowUpRight, ArrowDownLeft, History, LayoutGrid } from 'lucide-react';
import type { Screen } from '../../../shared/data/mockData';

type Props = {
  onNavigate: (s: Screen) => void;
  onOpenApps: () => void;
  /** Optional: open deposit options sheet instead of full receive page */
  onReceive?: () => void;
};

/** Wallet-style circular actions under balance (Send / Receive / History / Apps). */
export function HubActions({ onNavigate, onOpenApps, onReceive }: Props) {
  const items: { label: string; Icon: typeof ArrowUpRight; action: () => void }[] = [
    { label: 'Send', Icon: ArrowUpRight, action: () => onNavigate('send') },
    {
      label: 'Receive',
      Icon: ArrowDownLeft,
      action: () => (onReceive ? onReceive() : onNavigate('deposit')),
    },
    { label: 'History', Icon: History, action: () => onNavigate('history') },
    { label: 'Apps', Icon: LayoutGrid, action: () => onOpenApps() },
  ];

  return (
    <div className="flex justify-center gap-5 px-4 mb-6">
      {items.map((a) => (
        <motion.button
          key={a.label}
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={a.action}
          className="flex flex-col items-center gap-2 min-w-[64px]"
          aria-label={a.label}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              background: 'var(--muted)',
              border: '1px solid var(--border)',
            }}
          >
            <a.Icon size={20} style={{ color: 'var(--primary)' }} strokeWidth={2.2} />
          </div>
          <span style={{ color: 'var(--foreground)', fontSize: 12, fontWeight: 600 }}>{a.label}</span>
        </motion.button>
      ))}
    </div>
  );
}
