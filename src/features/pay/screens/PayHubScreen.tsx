import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import type { Screen } from '../../../shared/data/mockData';
import { PageTop } from '../../../shared/components/PageTop';
import { DualIconBox, DualToneIcon, type DualIconKey } from '../../home/components/icons/DualToneIcons';

type Props = {
  navigate: (s: Screen, param?: string) => void;
};

type Row = {
  label: string;
  sub?: string;
  icon: DualIconKey;
  screen: Screen;
  param?: string;
};

const FEATURED: { label: string; icon: DualIconKey; screen: Screen; param?: string }[] = [
  { label: 'QR pay', icon: 'qr', screen: 'scan' },
  { label: 'Bank', icon: 'bank', screen: 'onramp' },
  { label: 'Top-up', icon: 'airtime', screen: 'services', param: 'airtime' },
  { label: 'Gifts', icon: 'gifts', screen: 'giveaway' },
];

const PAY_ACTIONS: Row[] = [
  { label: 'QR pay', sub: 'Scan or show code', icon: 'qr', screen: 'scan' },
  { label: 'Bank transfer', sub: 'Deposit via bank', icon: 'bank', screen: 'onramp' },
  { label: 'Card', sub: 'Buy with card', icon: 'card', screen: 'onramp' },
  { label: 'Mobile top-up', sub: 'Airtime', icon: 'airtime', screen: 'services', param: 'airtime' },
  { label: 'Data', sub: 'Mobile data bundles', icon: 'data', screen: 'services', param: 'data' },
  { label: 'TV & cable', sub: 'Pay subscriptions', icon: 'tv', screen: 'services', param: 'bills' },
  { label: 'Request money', sub: 'Ask a contact', icon: 'request', screen: 'request' },
  { label: 'Gifts', sub: 'Create or claim giveaway', icon: 'gifts', screen: 'giveaway' },
];

export function PayHubScreen({ navigate }: Props) {
  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--background)' }}>
      <PageTop />
      <div className="px-5 pt-1 pb-3">
        <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 22, letterSpacing: -0.3 }}>
          Pay
        </p>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginTop: 4 }}>
          Transfers, bills, and gifts from your balance
        </p>
      </div>

      <div className="flex gap-3 px-5 mb-5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {FEATURED.map((f) => (
          <motion.button
            key={f.label}
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate(f.screen, f.param)}
            className="flex flex-col items-center gap-2 shrink-0"
            style={{ width: 76 }}
          >
            <DualIconBox size={56}>
              <DualToneIcon name={f.icon} />
            </DualIconBox>
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
              style={{ borderTop: i === 0 ? undefined : '1px solid var(--border)' }}
            >
              <DualIconBox size={42}>
                <DualToneIcon name={row.icon} />
              </DualIconBox>
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
