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
 * Compact dual-tone pills in one row. More = icon-only so it fits on mobile.
 */
export function HubActions({ onNavigate, onOpenMore, onReceive, onSend }: Props) {
  const labeled: { label: string; icon: DualIconKey; action: () => void }[] = [
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
  ];

  return (
    <div className="flex items-center gap-1.5 px-4 mb-4 w-full min-w-0">
      {labeled.map((a) => (
        <motion.button
          key={a.label}
          type="button"
          whileTap={{ scale: 0.96 }}
          onClick={a.action}
          aria-label={a.label}
          className="flex items-center gap-1.5 flex-1 min-w-0 rounded-full pl-1 pr-2 py-1 justify-center"
          style={{
            background: 'var(--muted)',
            border: '1px solid var(--border)',
            minHeight: 34,
            maxWidth: '100%',
          }}
        >
          <span className="flex items-center justify-center shrink-0" style={{ width: 20, height: 20 }}>
            <span style={{ transform: 'scale(0.68)', transformOrigin: 'center' }}>
              <DualToneIcon name={a.icon} />
            </span>
          </span>
          <span
            style={{
              color: 'var(--foreground)',
              fontSize: 11.5,
              fontWeight: 600,
              letterSpacing: -0.15,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {a.label}
          </span>
        </motion.button>
      ))}

      {/* More — icon only */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.94 }}
        onClick={onOpenMore}
        aria-label="More"
        className="shrink-0 rounded-full flex items-center justify-center"
        style={{
          width: 34,
          height: 34,
          background: 'var(--muted)',
          border: '1px solid var(--border)',
        }}
      >
        <span style={{ transform: 'scale(0.65)', transformOrigin: 'center' }}>
          <DualToneIcon name="more" />
        </span>
      </motion.button>
    </div>
  );
}
