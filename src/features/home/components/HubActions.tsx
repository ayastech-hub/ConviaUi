import { motion } from 'motion/react';
import type { Screen } from '../../../shared/data/mockData';
import { DualToneIcon, type DualIconKey } from './icons/DualToneIcons';

type Props = {
  onNavigate: (s: Screen) => void;
  onOpenMore: () => void;
  onReceive?: () => void;
  onSend?: () => void;
};

/**
 * Home quick actions — dual-tone pill chips always visible (2×2 / wrap).
 */
export function HubActions({ onNavigate, onOpenMore, onReceive, onSend }: Props) {
  const items: { label: string; icon: DualIconKey; action: () => void }[] = [
    {
      label: 'Send',
      icon: 'send',
      action: () => (onSend ? onSend() : onNavigate('send')),
    },
    {
      label: 'Receive',
      icon: 'receive',
      action: () => (onReceive ? onReceive() : onNavigate('deposit')),
    },
    { label: 'History', icon: 'history', action: () => onNavigate('history') },
    { label: 'More', icon: 'more', action: () => onOpenMore() },
  ];

  return (
    <div className="grid grid-cols-2 gap-2.5 px-4 mb-5">
      {items.map((a) => (
        <motion.button
          key={a.label}
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={a.action}
          aria-label={a.label}
          className="flex items-center gap-3 rounded-full pl-2 pr-4 py-2 w-full"
          style={{
            background: 'var(--muted)',
            border: '1px solid var(--border)',
            minHeight: 48,
          }}
        >
          <span className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 overflow-hidden">
            <DualToneIcon name={a.icon} />
          </span>
          <span style={{ color: 'var(--foreground)', fontSize: 14, fontWeight: 600 }}>{a.label}</span>
        </motion.button>
      ))}
    </div>
  );
}
