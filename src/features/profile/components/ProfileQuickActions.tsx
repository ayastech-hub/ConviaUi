import { motion } from 'motion/react';
import { CreditCard, FileCheck, Shield, UserRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Screen } from '../../../shared/data/mockData';

interface ProfileQuickActionsProps {
  onNavigate: (s: Screen) => void;
  kycDone: boolean;
}

const ITEMS: { id: Screen; label: string; icon: LucideIcon }[] = [
  { id: 'edit-profile', label: 'Edit', icon: UserRound },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'payment-methods', label: 'Banks', icon: CreditCard },
  { id: 'kyc', label: 'Verify', icon: FileCheck },
];

/** Four primary account destinations — face of the hub, before the long lists. */
export function ProfileQuickActions({ onNavigate, kycDone }: ProfileQuickActionsProps) {
  return (
    <div className="px-5 mb-6">
      <div className="grid grid-cols-4 gap-2">
        {ITEMS.map((item, i) => {
          const Icon = item.icon;
          const verified = item.id === 'kyc' && kycDone;
          return (
            <motion.button
              key={item.id}
              type="button"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onNavigate(item.id)}
              className="flex flex-col items-center gap-2 py-3 px-1 rounded-[20px]"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'var(--muted)' }}
              >
                <Icon size={18} style={{ color: verified ? 'var(--positive)' : 'var(--foreground)' }} strokeWidth={2} />
              </div>
              <span style={{ color: 'var(--foreground)', fontSize: 11, fontWeight: 600 }}>
                {verified ? 'Verified' : item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
