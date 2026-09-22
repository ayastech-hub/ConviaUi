import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { Screen } from '../../../shared/data/mockData';
import { PageTop } from '../../../shared/components/PageTop';
import { ConviaAvatar } from '../../../shared/components/ConviaAvatar';
import { DualIconBox, DualToneIcon, type DualIconKey } from '../../home/components/icons/DualToneIcons';
import { useWalletAssets } from '../../../shared/hooks/useWalletAssets';
import { AssetIcon } from '../../../shared/components/AssetIcon';
import { useCurrency } from '../../../shared/context/CurrencyContext';
import { CurrencyPickerView } from '../../profile/components/CurrencyPickerView';

type Props = {
  navigate: (s: Screen, param?: string) => void;
};

type Feat = { label: string; icon: DualIconKey; screen: Screen; param?: string };

type HeroSlide = {
  id: string;
  title: string;
  sub: string;
  cta: string;
  screen: Screen;
  param?: string;
  /** Accent for decorative side */
  accent: string;
};

const QUICK: Feat[] = [
  { label: 'QR pay', icon: 'qr', screen: 'scan' },
  { label: 'Mobile top-up', icon: 'airtime', screen: 'services', param: 'airtime' },
  { label: 'Card', icon: 'card', screen: 'onramp' },
];

const HERO: HeroSlide[] = [
  {
    id: 'offramp',
    title: 'USDT to local currency instantly',
    sub: 'Direct bank payouts — no P2P hassle or frozen funds.',
    cta: 'Go',
    screen: 'offramp',
    accent: 'var(--primary)',
  },
  {
    id: 'onramp',
    title: 'Buy crypto in seconds',
    sub: 'Card or bank transfer. Funds land in your Convia wallet.',
    cta: 'Buy',
    screen: 'onramp',
    accent: '#38bdf8',
  },
  {
    id: 'gifts',
    title: 'Send crypto gifts',
    sub: 'Create a giveaway card or claim with a code.',
    cta: 'Open',
    screen: 'giveaway',
    accent: '#a78bfa',
  },
  {
    id: 'bills',
    title: 'Pay bills from crypto',
    sub: 'Airtime, data, power, TV — settled from your balance.',
    cta: 'Pay bills',
    screen: 'services',
    param: 'airtime',
    accent: '#34d399',
  },
];

const LIFESTYLE: Feat[] = [
  { label: 'Airtime', icon: 'airtime', screen: 'services', param: 'airtime' },
  { label: 'Data', icon: 'data', screen: 'services', param: 'data' },
  { label: 'Electricity', icon: 'power', screen: 'services', param: 'electricity' },
  { label: 'TV & cable', icon: 'tv', screen: 'services', param: 'bills' },
  { label: 'Betting', icon: 'betting', screen: 'services', param: 'betting' },
  { label: 'Gifts', icon: 'gifts', screen: 'giveaway' },
];

const TOOLS: Feat[] = [
  { label: 'Swap', icon: 'swap', screen: 'swap' },
  { label: 'Buy', icon: 'buy', screen: 'onramp' },
  { label: 'Sell', icon: 'sell', screen: 'offramp' },
  { label: 'Pay link', icon: 'reqlink', screen: 'request-link' },
  { label: 'Request', icon: 'request', screen: 'request' },
  { label: 'Rewards', icon: 'rewards', screen: 'rewards' },
  { label: 'History', icon: 'history', screen: 'history' },
  { label: 'Support', icon: 'support', screen: 'support-center' },
];

function HeroArt({ accent }: { accent: string }) {
  return (
    <div className="relative w-full h-[140px] flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: `radial-gradient(ellipse 70% 60% at 50% 40%, ${accent}55, transparent 70%)`,
        }}
      />
      {/* Left phone card */}
      <div
        className="absolute left-[12%] top-6 w-[72px] h-[100px] rounded-2xl flex flex-col items-center justify-center gap-1"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          boxShadow: '0 12px 28px rgba(0,0,0,0.25)',
          transform: 'rotate(-8deg)',
        }}
      >
        <DualToneIcon name="send" />
        <span style={{ color: 'var(--muted-foreground)', fontSize: 9, fontWeight: 600 }}>USDT</span>
      </div>
      {/* Arrows */}
      <div className="relative z-[1] flex gap-0.5" style={{ color: accent }}>
        {[0, 1, 2].map((i) => (
          <span key={i} style={{ opacity: 0.35 + i * 0.25, fontSize: 22, fontWeight: 800 }}>
            ›
          </span>
        ))}
      </div>
      {/* Right bank card */}
      <div
        className="absolute right-[12%] top-6 w-[72px] h-[100px] rounded-2xl flex flex-col items-center justify-center gap-1"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          boxShadow: '0 12px 28px rgba(0,0,0,0.25)',
          transform: 'rotate(8deg)',
        }}
      >
        <DualToneIcon name="bank" />
        <span style={{ color: 'var(--muted-foreground)', fontSize: 9, fontWeight: 600 }}>BANK</span>
      </div>
    </div>
  );
}

/**
 * Explore — tour-style discovery (banners, quick pay, lifestyle, tools).
 */
export function ExploreScreen({ navigate }: Props) {
  const { assets, loading } = useWalletAssets();
  const { currency, setCurrency, convert } = useCurrency();
  const [heroIdx, setHeroIdx] = useState(0);
  const [showCurrency, setShowCurrency] = useState(false);

  const slide = HERO[heroIdx % HERO.length];

  const nextHero = useCallback(() => {
    setHeroIdx((i) => (i + 1) % HERO.length);
  }, []);

  useEffect(() => {
    const t = window.setInterval(nextHero, 5500);
    return () => window.clearInterval(t);
  }, [nextHero]);

  const movers = (assets || [])
    .filter((a) => a.price > 0)
    .slice()
    .sort((a, b) => Math.abs(b.change24h || 0) - Math.abs(a.change24h || 0))
    .slice(0, 8);

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

      {/* Top bar: account + currency */}
      <div className="flex items-center justify-between px-4 pt-1 pb-3">
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

      {/* Quick pills */}
      <div
        className="flex gap-2 px-4 mb-4 overflow-x-auto"
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

      {/* Hero banner carousel */}
      <div className="px-4 mb-6">
        <div
          className="relative rounded-[22px] overflow-hidden"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            minHeight: 280,
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.28 }}
              className="px-4 pt-2 pb-5"
            >
              <HeroArt accent={slide.accent} />
              <p
                className="text-center px-2"
                style={{
                  color: 'var(--foreground)',
                  fontWeight: 800,
                  fontSize: 18,
                  letterSpacing: -0.3,
                  lineHeight: 1.25,
                }}
              >
                {slide.title}
              </p>
              <p
                className="text-center px-3 mt-2 mb-4"
                style={{ color: 'var(--muted-foreground)', fontSize: 13, lineHeight: 1.4 }}
              >
                {slide.sub}
              </p>
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(slide.screen, slide.param)}
                className="w-full rounded-full"
                style={{
                  height: 48,
                  background: 'var(--primary)',
                  color: 'var(--primary-foreground, #0a0a0a)',
                  fontWeight: 700,
                  fontSize: 15,
                }}
              >
                {slide.cta}
              </motion.button>
            </motion.div>
          </AnimatePresence>

          {/* Dots */}
          <div className="flex justify-center gap-1.5 pb-3">
            {HERO.map((h, i) => (
              <button
                key={h.id}
                type="button"
                aria-label={`Slide ${i + 1}`}
                onClick={() => setHeroIdx(i)}
                className="rounded-full"
                style={{
                  width: i === heroIdx % HERO.length ? 16 : 6,
                  height: 6,
                  background:
                    i === heroIdx % HERO.length
                      ? 'var(--primary)'
                      : 'color-mix(in oklab, var(--muted-foreground) 40%, transparent)',
                  transition: 'width 0.2s ease',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Lifestyle / bills grid */}
      <div className="px-4 mb-5">
        <div className="flex items-center justify-between px-0.5 mb-3">
          <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 16 }}>Lifestyle</p>
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('services')}
            className="flex items-center gap-0.5"
            style={{ color: 'var(--muted-foreground)', fontSize: 13, fontWeight: 500 }}
          >
            See all
            <ChevronRight size={16} />
          </motion.button>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {LIFESTYLE.map((f) => (
            <motion.button
              key={f.label}
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate(f.screen, f.param)}
              className="flex flex-col items-center gap-2 rounded-2xl py-4 px-2"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
              }}
            >
              <DualIconBox size={48}>
                <span style={{ transform: 'scale(0.88)', transformOrigin: 'center' }}>
                  <DualToneIcon name={f.icon} />
                </span>
              </DualIconBox>
              <span
                className="text-center leading-tight"
                style={{ color: 'var(--foreground)', fontSize: 12, fontWeight: 600 }}
              >
                {f.label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Markets strip */}
      <div className="mb-5">
        <div className="flex items-center justify-between px-5 mb-2.5">
          <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 16 }}>Markets</p>
        </div>
        <div
          className="flex gap-2.5 px-4 overflow-x-auto pb-1"
          style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          {loading && movers.length === 0
            ? [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="shrink-0 rounded-2xl"
                  style={{ width: 128, height: 88, background: 'var(--muted)' }}
                />
              ))
            : movers.map((a) => {
                const up = (a.change24h || 0) >= 0;
                const local = convert(a.price || 0);
                return (
                  <motion.button
                    key={a.symbol}
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate('token', a.symbol)}
                    className="shrink-0 rounded-2xl p-3 text-left"
                    style={{
                      width: 132,
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <AssetIcon symbol={a.symbol} size={22} />
                      <span style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 13 }}>
                        {a.symbol}
                      </span>
                    </div>
                    <p
                      className="tabular-nums"
                      style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}
                    >
                      {currency.symbol}
                      {local.toLocaleString(undefined, {
                        maximumFractionDigits: local >= 100 ? 2 : 6,
                      })}
                    </p>
                    <p
                      className="tabular-nums"
                      style={{
                        color: up ? 'var(--positive, #22c55e)' : 'var(--destructive)',
                        fontSize: 12,
                        fontWeight: 600,
                        marginTop: 2,
                      }}
                    >
                      {up ? '+' : ''}
                      {(a.change24h || 0).toFixed(2)}%
                    </p>
                  </motion.button>
                );
              })}
        </div>
      </div>

      {/* Tools */}
      <div className="px-4 pb-28">
        <p className="px-0.5 mb-3" style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 16 }}>
          More tools
        </p>
        <div className="grid grid-cols-4 gap-y-4 gap-x-2">
          {TOOLS.map((f) => (
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
      </div>
    </div>
  );
}
