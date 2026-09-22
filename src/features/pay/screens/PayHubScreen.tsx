import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import type { Screen } from '../../../shared/data/mockData';
import { PageTop } from '../../../shared/components/PageTop';
import { ConviaAvatar } from '../../../shared/components/ConviaAvatar';
import { CountryFlag } from '../../../shared/components/CountryFlag';
import { DualIconBox, DualToneIcon, type DualIconKey } from '../../home/components/icons/DualToneIcons';
import { useCurrency } from '../../../shared/context/CurrencyContext';
import { CurrencyPickerView } from '../../profile/components/CurrencyPickerView';

type Props = {
  navigate: (s: Screen, param?: string) => void;
};

type GridItem = { label: string; icon: DualIconKey; screen: Screen; param?: string };

const QUICK: GridItem[] = [
  { label: 'QR pay', icon: 'qr', screen: 'scan' },
  { label: 'Top-up', icon: 'airtime', screen: 'airtime' },
  { label: 'Card', icon: 'card', screen: 'onramp' },
  { label: 'Pay link', icon: 'reqlink', screen: 'request-link' },
];

const TRANSFER: GridItem[] = [
  { label: 'QR pay', icon: 'qr', screen: 'scan' },
  { label: 'Request', icon: 'request', screen: 'request' },
  { label: 'Pay link', icon: 'reqlink', screen: 'request-link' },
  { label: 'Bank', icon: 'bank', screen: 'onramp' },
];

const BILLS: GridItem[] = [
  { label: 'Airtime', icon: 'airtime', screen: 'airtime' },
  { label: 'Data', icon: 'data', screen: 'data' },
  { label: 'Power', icon: 'power', screen: 'electricity' },
  { label: 'TV', icon: 'tv', screen: 'tv' },
  { label: 'Betting', icon: 'betting', screen: 'betting' },
  { label: 'Gifts', icon: 'gifts', screen: 'giveaway' },
];

type Hero = {
  id: string;
  title: string;
  sub: string;
  cta: string;
  screen: Screen;
  accent: string;
};

const HERO: Hero[] = [
  {
    id: 'bills',
    title: 'Pay bills from crypto',
    sub: 'Airtime, data, electricity and TV — settled from your balance.',
    cta: 'Buy airtime',
    screen: 'airtime',
    accent: 'var(--primary)',
  },
  {
    id: 'qr',
    title: 'Scan & pay instantly',
    sub: 'Use QR to send or receive without typing addresses.',
    cta: 'Open scanner',
    screen: 'scan',
    accent: '#38bdf8',
  },
  {
    id: 'link',
    title: 'Share a payment link',
    sub: 'Create a link, send it, get paid in crypto.',
    cta: 'Create link',
    screen: 'request-link',
    accent: '#a78bfa',
  },
];

function Grid({ items, navigate }: { items: GridItem[]; navigate: Props['navigate'] }) {
  return (
    <div className="grid grid-cols-4 gap-y-4 gap-x-2">
      {items.map((f) => (
        <motion.button
          key={f.label}
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={() => navigate(f.screen, f.param)}
          className="flex flex-col items-center gap-2"
        >
          <DualIconBox size={52}>
            <span style={{ transform: 'scale(0.9)', transformOrigin: 'center' }}>
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
  );
}

export function PayHubScreen({ navigate }: Props) {
  const { currency, setCurrency } = useCurrency();
  const [showCurrency, setShowCurrency] = useState(false);
  const [heroIdx, setHeroIdx] = useState(0);
  const slide = HERO[heroIdx % HERO.length];

  const nextHero = useCallback(() => setHeroIdx((i) => (i + 1) % HERO.length), []);
  useEffect(() => {
    const t = window.setInterval(nextHero, 5500);
    return () => window.clearInterval(t);
  }, [nextHero]);

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

      <div className="flex items-center justify-between px-4 pt-1 pb-2">
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={() => navigate('profile')}
          aria-label="Account"
          style={{ background: 'transparent', border: 'none', padding: 0 }}
        >
          <ConviaAvatar size={36} />
        </motion.button>

        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          onClick={() => setShowCurrency(true)}
          className="flex items-center gap-1.5 rounded-full pl-1.5 pr-2.5 py-1"
          style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
        >
          <CountryFlag code={currency.code} size={18} />
          <span style={{ color: 'var(--foreground)', fontSize: 12, fontWeight: 600 }}>{currency.code}</span>
          <ChevronDown size={14} style={{ color: 'var(--muted-foreground)' }} />
        </motion.button>
      </div>

      <div className="px-5 pb-3">
        <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 22, letterSpacing: -0.4 }}>Pay</p>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginTop: 4 }}>
          Transfers, bills, and payment links
        </p>
      </div>

      {/* Quick dual-tone row */}
      <div className="px-4 mb-5">
        <Grid items={QUICK} navigate={navigate} />
      </div>

      {/* Hero banners */}
      <div className="px-4 mb-6">
        <div
          className="relative rounded-[22px] overflow-hidden"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            minHeight: 168,
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.28 }}
              className="px-5 py-5"
            >
              <div
                className="absolute inset-0 pointer-events-none opacity-50"
                style={{
                  background: `radial-gradient(ellipse 80% 70% at 90% 0%, ${slide.accent}44, transparent 60%)`,
                }}
              />
              <p
                style={{
                  color: 'var(--foreground)',
                  fontWeight: 800,
                  fontSize: 17,
                  letterSpacing: -0.3,
                  lineHeight: 1.25,
                  position: 'relative',
                }}
              >
                {slide.title}
              </p>
              <p
                style={{
                  color: 'var(--muted-foreground)',
                  fontSize: 13,
                  lineHeight: 1.4,
                  marginTop: 8,
                  marginBottom: 16,
                  position: 'relative',
                }}
              >
                {slide.sub}
              </p>
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(slide.screen)}
                className="relative rounded-full px-5"
                style={{
                  height: 40,
                  background: 'var(--primary)',
                  color: 'var(--primary-foreground, #0a0a0a)',
                  fontWeight: 700,
                  fontSize: 13.5,
                }}
              >
                {slide.cta}
              </motion.button>
            </motion.div>
          </AnimatePresence>
          <div className="flex justify-center gap-1.5 pb-3 relative">
            {HERO.map((h, i) => (
              <button
                key={h.id}
                type="button"
                aria-label={`Slide ${i + 1}`}
                onClick={() => setHeroIdx(i)}
                className="rounded-full"
                style={{
                  width: i === heroIdx % HERO.length ? 14 : 6,
                  height: 6,
                  background:
                    i === heroIdx % HERO.length
                      ? 'var(--primary)'
                      : 'color-mix(in oklab, var(--muted-foreground) 40%, transparent)',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 mb-5">
        <p className="px-0.5 mb-3" style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 16 }}>
          Bills & lifestyle
        </p>
        <Grid items={BILLS} navigate={navigate} />
      </div>

      <div className="px-4 pb-28">
        <p className="px-0.5 mb-3" style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 16 }}>
          Transfer
        </p>
        <Grid items={TRANSFER} navigate={navigate} />
      </div>
    </div>
  );
}
