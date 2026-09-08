import { motion } from 'motion/react';
import { ArrowDownToLine, ArrowUpFromLine, CreditCard } from 'lucide-react';
import type { Screen } from '../../../shared/data/mockData';

const ACTIONS: { label: string; screen: Screen; Icon: typeof ArrowDownToLine }[] = [
  { label: 'Deposit', screen: 'deposit', Icon: ArrowDownToLine },
  { label: 'Withdraw', screen: 'withdraw', Icon: ArrowUpFromLine },
  { label: 'Buy', screen: 'onramp', Icon: CreditCard },
];

/** Circular hub actions under the balance. */
export function HubActions({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <div className="flex justify-center gap-9 px-5 mb-7">
      {ACTIONS.map((a) => (
        <motion.button
          key={a.label}
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={() => onNavigate(a.screen)}
          className="flex flex-col items-center gap-2"
          aria-label={a.label}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{
              background: 'var(--muted)',
              border: '1px solid var(--border)',
            }}
          >
            <a.Icon size={22} style={{ color: 'var(--foreground)' }} strokeWidth={2} />
          </div>
          <span style={{ color: 'var(--foreground)', fontSize: 12, fontWeight: 600 }}>{a.label}</span>
        </motion.button>
      ))}
    </div>
  );
}
