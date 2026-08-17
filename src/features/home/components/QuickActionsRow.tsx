import { motion } from 'motion/react';
import { ArrowUpRight, ArrowDownLeft, RefreshCw, Plus, Minus, HandCoins } from 'lucide-react';
import type { Screen } from '../../../shared/data/mockData';

const ACTIONS: { id: Screen; label: string; icon: React.ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }> }[] = [
  { id: 'send', label: 'Send', icon: ArrowUpRight },
  { id: 'request', label: 'Request', icon: HandCoins },
  { id: 'receive', label: 'Receive', icon: ArrowDownLeft },
  { id: 'swap', label: 'Swap', icon: RefreshCw },
  { id: 'onramp', label: 'Buy', icon: Plus },
];

/** Row of quick-action shortcuts on Home. */
export function QuickActionsRow({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <div className="px-5 mb-6">
      <div className="flex justify-between gap-1">
        {ACTIONS.map((action, i) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.id}
              type="button"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onNavigate(action.id)}
              className="flex flex-col items-center gap-2 flex-1 min-w-0"
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center glass-card glass-refraction" style={{ background: 'var(--muted)' }}>
                <Icon size={20} strokeWidth={2} style={{ color: 'var(--foreground)' }} />
              </div>
              <span style={{ fontSize: 11, color: 'var(--muted-foreground)', fontWeight: 500 }}>{action.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
