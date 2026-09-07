import { motion } from 'motion/react';
import { ArrowDownToLine, ArrowUpFromLine, ArrowDownLeft } from 'lucide-react';
import type { Screen } from '../../../shared/data/mockData';

const ACTIONS: { label: string; screen: Screen; Icon: typeof ArrowDownToLine }[] = [
  { label: 'Deposit', screen: 'deposit', Icon: ArrowDownToLine },
  { label: 'Withdraw', screen: 'withdraw', Icon: ArrowUpFromLine },
  { label: 'Receive', screen: 'receive', Icon: ArrowDownLeft },
];

/** Three circular primary actions under the balance — Crypto-Bot structure, Convia routes. */
export function HubActions({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <div className="flex justify-center gap-10 px-5 mb-6">
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
            style={{ background: 'var(--primary)' }}
          >
            <a.Icon size={22} color="var(--primary-foreground, #fff)" strokeWidth={2.2} />
          </div>
          <span style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 500 }}>{a.label}</span>
        </motion.button>
      ))}
    </div>
  );
}
