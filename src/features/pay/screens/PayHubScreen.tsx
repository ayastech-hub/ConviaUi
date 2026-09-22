import { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import type { Screen } from '../../../shared/data/mockData';
import { PageTop } from '../../../shared/components/PageTop';
import { ConviaAvatar } from '../../../shared/components/ConviaAvatar';
import { DualIconBox, DualToneIcon, type DualIconKey } from '../../home/components/icons/DualToneIcons';
import { useCurrency } from '../../../shared/context/CurrencyContext';
import { CurrencyPickerView } from '../../profile/components/CurrencyPickerView';

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
  { label: 'Mobile top-up', icon: 'airtime', screen: 'services', param: 'airtime' },
  { label: 'Card', icon: 'card', screen: 'onramp' },
  { label: 'Pay link', icon: 'reqlink', screen: 'request-link' },
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
      { label: 'Rewards', sub: 'Tasks and referral bonuses', icon: 'rewards', screen: 'rewards' },
    ],
  },
];

export function PayHubScreen({ navigate }: Props) {
  const { currency, setCurrency } = useCurrency();
  const [showCurrency, setShowCurrency] = useState(false);

  if (showCurrency) {
    return (
      <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
        <PageTop />
        <CurrencyPickerView
          currentCode={currency.code}
          onSelect={(c) => {
            setCurrency(c);
            setShowCurrency(false);
          }}
          onBack={() => setShowCurrency(false)}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--background)' }}>
      <PageTop />

      {/* Account + currency — same pattern as Explore */}
      <div className="flex items-center justify-between px-4 pt-1 pb-2">
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={() => navigate('profile')}
          aria-label="Account"
          className="flex items-center justify-center"
          style={{ background: 'transparent', border: 'none', padding: 0 }}
        >
          <ConviaAvatar size={36} />
        </motion.button>

        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          onClick={() => setShowCurrency(true)}
          className="flex items-center gap-1.5 rounded-full pl-1.5 pr-2.5 py-1"
          style={{
            background: 'var(--muted)',
            border: '1px solid var(--border)',
          }}
        >
          <span
            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
            style={{
              background: 'color-mix(in oklab, var(--primary) 25%, var(--card))',
              color: 'var(--primary)',
            }}
          >
            {currency.code.slice(0, 2)}
          </span>
          <span style={{ color: 'var(--foreground)', fontSize: 12, fontWeight: 600 }}>{currency.code}</span>
          <ChevronDown size={14} style={{ color: 'var(--muted-foreground)' }} />
        </motion.button>
      </div>

      <div className="px-5 pb-3">
        <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 22, letterSpacing: -0.4 }}>Pay</p>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginTop: 4, lineHeight: 1.35 }}>
          Transfers, bills, and links from your balance
        </p>
      </div>

      {/* Quick pills */}
      <div
        className="flex gap-2 px-4 mb-5 overflow-x-auto"
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        {QUICK.map((q) => (
          <motion.button
            key={q.label}
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate(q.screen, q.param)}
            className="flex items-center gap-2 shrink-0 rounded-full pl-1.5 pr-3 py-1.5"
            style={{
              background: 'var(--muted)',
              border: '1px solid var(--border)',
              minHeight: 40,
            }}
          >
            <span style={{ transform: 'scale(0.72)', transformOrigin: 'center' }}>
              <DualToneIcon name={q.icon} />
            </span>
            <span style={{ color: 'var(--foreground)', fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap' }}>
              {q.label}
            </span>
          </motion.button>
        ))}
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
                    borderTop:
                      i === 0 ? undefined : '1px solid color-mix(in oklab, var(--border) 85%, transparent)',
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
