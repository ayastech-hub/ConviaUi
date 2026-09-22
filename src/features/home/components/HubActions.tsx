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
 * Home quick actions — dual-tone pill chips (reference: circular dual icon + label).
 * Theme-safe: icon halves use --foreground + --primary; glyph uses --background.
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
      className="flex items-center gap-2.5 px-4 mb-5 overflow-x-auto"
      style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
    >
      {items.map((a) => (
        <motion.button
          key={a.label}
          type="button"
          whileTap={{ scale: 0.96 }}
          onClick={a.action}
          aria-label={a.label}
          className="flex items-center gap-2.5 shrink-0 rounded-full pl-1.5 pr-4 py-1.5"
          style={{
            background: 'var(--muted)',
            border: '1px solid var(--border)',
            boxShadow: '0 2px 8px color-mix(in oklab, var(--foreground) 5%, transparent)',
          }}
        >
          <span
            className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden shrink-0"
            style={{ background: 'transparent' }}
          >
            <DualToneIcon name={a.icon} />
          </span>
          <span style={{ color: 'var(--foreground)', fontSize: 13.5, fontWeight: 600 }}>{a.label}</span>
        </motion.button>
      ))}
    </div>
  );
}
