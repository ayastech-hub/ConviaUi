import { motion } from 'motion/react';
import {
  QrCode,
  Building2,
  CreditCard,
  Smartphone,
  Gift,
  Users,
  Zap,
  Tv,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import type { Screen } from '../../../shared/data/mockData';
import { PageTop } from '../../../shared/components/PageTop';

type Props = {
  navigate: (s: Screen, param?: string) => void;
};

type Row = { label: string; sub?: string; Icon: LucideIcon; screen: Screen; param?: string };

const PAY_ACTIONS: Row[] = [
  { label: 'QR pay', sub: 'Scan or show code', Icon: QrCode, screen: 'scan' },
  { label: 'Bank transfer', sub: 'Deposit via bank', Icon: Building2, screen: 'onramp' },
  { label: 'Card', sub: 'Buy with card', Icon: CreditCard, screen: 'onramp' },
  { label: 'Mobile top-up', sub: 'Airtime', Icon: Smartphone, screen: 'services', param: 'airtime' },
  { label: 'Data', sub: 'Mobile data bundles', Icon: Zap, screen: 'services', param: 'data' },
  { label: 'TV & cable', sub: 'Pay subscriptions', Icon: Tv, screen: 'services', param: 'bills' },
  { label: 'Request money', sub: 'Ask a contact', Icon: Users, screen: 'request' },
  { label: 'Gifts', sub: 'Create or claim giveaway', Icon: Gift, screen: 'giveaway' },
];

export function PayHubScreen({ navigate }: Props) {
  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--background)' }}>
      <PageTop />
      <div className="px-5 pt-1 pb-3">
        <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 22, letterSpacing: -0.3 }}>Pay</p>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginTop: 4 }}>
          Transfers, bills, and gifts from your balance
        </p>
      </div>

      {/* Featured strip */}
      <div className="flex gap-3 px-5 mb-5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {[
          { label: 'QR pay', screen: 'scan' as Screen, Icon: QrCode },
          { label: 'Bank', screen: 'onramp' as Screen, Icon: Building2 },
          { label: 'Top-up', screen: 'services' as Screen, Icon: Smartphone, param: 'airtime' },
          { label: 'Gifts', screen: 'giveaway' as Screen, Icon: Gift },
        ].map((f) => (
          <motion.button
            key={f.label}
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate(f.screen, f.param)}
            className="flex flex-col items-center gap-2 shrink-0"
            style={{ width: 72 }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
            >
              <f.Icon size={22} style={{ color: 'var(--primary)' }} />
            </div>
            <span style={{ color: 'var(--foreground)', fontSize: 11, fontWeight: 600 }}>{f.label}</span>
          </motion.button>
        ))}
      </div>

      <div className="px-4 pb-28">
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          {PAY_ACTIONS.map((row, i) => (
            <motion.button
              key={row.label}
              type="button"
              whileTap={{ scale: 0.99 }}
              onClick={() => navigate(row.screen, row.param)}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
              style={{
                borderTop: i === 0 ? undefined : '1px solid var(--border)',
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'var(--muted)' }}
              >
                <row.Icon size={18} style={{ color: 'var(--primary)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>{row.label}</p>
                {row.sub && (
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginTop: 1 }}>{row.sub}</p>
                )}
              </div>
              <ChevronRight size={16} style={{ color: 'var(--muted-foreground)' }} />
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
