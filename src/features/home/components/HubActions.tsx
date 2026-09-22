import { motion } from 'motion/react';
import { ArrowUpRight, ArrowDownLeft, History, LayoutGrid } from 'lucide-react';
import type { Screen } from '../../../shared/data/mockData';

type Props = {
  onNavigate: (s: Screen) => void;
  onOpenApps: () => void;
};

const ACTIONS: {
  label: string;
  Icon: typeof ArrowUpRight;
  onClick: (p: Props) => void;
}[] = [
  { label: 'Send', Icon: ArrowUpRight, onClick: (p) => p.onNavigate('send') },
  { label: 'Receive', Icon: ArrowDownLeft, onClick: (p) => p.onNavigate('deposit') },
  { label: 'History', Icon: History, onClick: (p) => p.onNavigate('history') },
  { label: 'Apps', Icon: LayoutGrid, onClick: (p) => p.onOpenApps() },
];

/** Wallet-style circular actions under balance (Send / Receive / History / Apps). */
export function HubActions({ onNavigate, onOpenApps }: Props) {
  return (
    <div className="flex justify-center gap-5 px-4 mb-6">
      {ACTIONS.map((a) => (
        <motion.button
          key={a.label}
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={() => a.onClick({ onNavigate, onOpenApps })}
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
