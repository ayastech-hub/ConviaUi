import { motion } from 'motion/react';
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

const QUICK: { label: string; icon: DualIconKey; screen: Screen; param?: string }[] = [
  { label: 'QR pay', icon: 'qr', screen: 'scan' },
  { label: 'Request', icon: 'request', screen: 'request' },
  { label: 'Pay link', icon: 'reqlink', screen: 'request-link' },
  { label: 'Betting', icon: 'betting', screen: 'services', param: 'betting' },
];

const SECTIONS: { title: string; items: Row[] }[] = [
  {
    title: 'Transfer',
    items: [
      { label: 'QR pay', sub: 'Scan or show your code', icon: 'qr', screen: 'scan' },
      { label: 'Request money', sub: 'Ask a contact to pay you', icon: 'request', screen: 'request' },
      { label: 'Payment link', sub: 'Create a shareable pay link', icon: 'reqlink', screen: 'request-link' },
      { label: 'Bank transfer', sub: 'Fund via local bank', icon: 'bank', screen: 'onramp' },
      { label: 'Card', sub: 'Buy with debit or credit card', icon: 'card', screen: 'onramp' },
    ],
  },
  {
    title: 'Bills & top-up',
    items: [
      { label: 'Airtime', sub: 'Mobile top-up', icon: 'airtime', screen: 'services', param: 'airtime' },
      { label: 'Data', sub: 'Mobile data bundles', icon: 'data', screen: 'services', param: 'data' },
      { label: 'Electricity', sub: 'Prepaid & postpaid', icon: 'power', screen: 'services', param: 'electricity' },
      { label: 'TV & cable', sub: 'DSTV, GOtv and more', icon: 'tv', screen: 'services', param: 'bills' },
      { label: 'Betting', sub: 'Fund betting accounts', icon: 'betting', screen: 'services', param: 'betting' },
    ],
  },
  {
    title: 'Share',
    items: [
      { label: 'Gifts', sub: 'Create or claim a giveaway', icon: 'gifts', screen: 'giveaway' },
    ],
  },
];

export function PayHubScreen({ navigate }: Props) {
  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--background)' }}>
      <PageTop />

      <div className="px-5 pt-1 pb-4">
        <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 22, letterSpacing: -0.4 }}>
          Pay
        </p>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginTop: 4, lineHeight: 1.35 }}>
          Transfers, bills, payment links, and more from your balance
        </p>
      </div>

      {/* Quick actions */}
      <div className="px-4 mb-5">
        <div
          className="grid grid-cols-4 gap-2 rounded-2xl p-3"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          {QUICK.map((f) => (
            <motion.button
              key={f.label}
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={() => navigate(f.screen, f.param)}
              className="flex flex-col items-center gap-2 py-1"
            >
              <DualIconBox size={48}>
                <span style={{ transform: 'scale(0.88)', transformOrigin: 'center' }}>
                  <DualToneIcon name={f.icon} />
                </span>
              </DualIconBox>
              <span
                className="text-center leading-tight"
                style={{ color: 'var(--foreground)', fontSize: 11, fontWeight: 600 }}
              >
                {f.label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-28 flex flex-col gap-4">
        {SECTIONS.map((sec) => (
          <div key={sec.title}>
            <p
              className="px-1 mb-2"
              style={{
                color: 'var(--muted-foreground)',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              {sec.title}
            </p>
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              {sec.items.map((row, i) => (
                <motion.button
                  key={row.label}
                  type="button"
                  whileTap={{ scale: 0.99 }}
                  onClick={() => navigate(row.screen, row.param)}
                  className="w-full flex items-center gap-3 px-3.5 py-3.5 text-left"
                  style={{
                    borderTop: i === 0 ? undefined : '1px solid color-mix(in oklab, var(--border) 85%, transparent)',
                  }}
                >
                  <DualIconBox size={44}>
                    <span style={{ transform: 'scale(0.82)', transformOrigin: 'center' }}>
                      <DualToneIcon name={row.icon} />
                    </span>
                  </DualIconBox>
                  <div className="flex-1 min-w-0">
                    <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14.5 }}>{row.label}</p>
                    {row.sub && (
                      <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginTop: 2 }}>{row.sub}</p>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
