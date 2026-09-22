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
 * Compact dual-tone action pills in one horizontal row (template-style).
 * Icon: offset accent behind + primary face (not half-split).
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
    <div
      className="flex items-center gap-2 px-4 mb-4 w-full"
      style={{ overflowX: 'auto', scrollbarWidth: 'none' }}
    >
      {items.map((a) => (
        <motion.button
          key={a.label}
          type="button"
          whileTap={{ scale: 0.96 }}
          onClick={a.action}
          aria-label={a.label}
          className="flex items-center gap-1.5 shrink-0 rounded-full pl-1.5 pr-2.5 py-1"
          style={{
            background: 'var(--muted)',
            border: '1px solid var(--border)',
            minHeight: 34,
          }}
        >
          <span
            className="flex items-center justify-center shrink-0"
            style={{ width: 22, height: 22 }}
          >
            {/* scale dual icon down */}
            <span style={{ transform: 'scale(0.72)', transformOrigin: 'center' }}>
              <DualToneIcon name={a.icon} />
            </span>
          </span>
          <span
            style={{
              color: 'var(--foreground)',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: -0.1,
              whiteSpace: 'nowrap',
            }}
          >
            {a.label}
          </span>
        </motion.button>
      ))}
    </div>
  );
}
