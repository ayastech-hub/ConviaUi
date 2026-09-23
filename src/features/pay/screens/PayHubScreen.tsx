import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronRight } from 'lucide-react';
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
  { label: 'Scan QR', icon: 'qr', screen: 'scan' },
  { label: 'Airtime', icon: 'airtime', screen: 'airtime' },
  { label: 'Buy crypto', icon: 'card', screen: 'onramp' },
  { label: 'Pay link', icon: 'reqlink', screen: 'request-link' },
];

const BILLS: GridItem[] = [
  { label: 'Airtime', icon: 'airtime', screen: 'airtime' },
  { label: 'Data', icon: 'data', screen: 'data' },
  { label: 'Electricity', icon: 'power', screen: 'electricity' },
  { label: 'TV & cable', icon: 'tv', screen: 'tv' },
  { label: 'Betting', icon: 'betting', screen: 'betting' },
  { label: 'Gifts', icon: 'gifts', screen: 'giveaway' },
];

const TRANSFER: GridItem[] = [
  { label: 'Request', icon: 'request', screen: 'request' },
  { label: 'Pay link', icon: 'reqlink', screen: 'request-link' },
  { label: 'Bank transfer', icon: 'bank', screen: 'onramp' },
  { label: 'Scan QR', icon: 'qr', screen: 'scan' },
];

type Hero = {
  id: string;
  kicker: string;
  title: string;
  sub: string;
  cta: string;
  screen: Screen;
  accent: string;
  icon: DualIconKey;
};

const HERO: Hero[] = [
  {
    id: 'bills',
    kicker: 'Everyday payments',
    title: 'Pay bills from your balance',
    sub: 'Airtime, data, power and TV — settled in seconds.',
    cta: 'Pay airtime',
    screen: 'airtime',
    accent: 'var(--primary)',
    icon: 'airtime',
  },
  {
    id: 'qr',
    kicker: 'Instant',
    title: 'Scan to pay or receive',
    sub: 'No long addresses. Point, confirm, done.',
    cta: 'Open scanner',
    screen: 'scan',
    accent: '#38bdf8',
    icon: 'qr',
  },
  {
    id: 'link',
    kicker: 'Collect',
    title: 'Get paid with a link',
    sub: 'Share once. Receive crypto when they pay.',
    cta: 'Create link',
    screen: 'request-link',
    accent: '#a78bfa',
    icon: 'reqlink',
  },
];

function SectionTitle({ title, action }: { title: string; action?: { label: string; onClick: () => void } }) {
  return (
    <div className="flex items-center justify-between mb-3 px-0.5">
      <h2
        style={{
          color: 'var(--foreground)',
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: -0.2,
        }}
      >
        {title}
      </h2>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="flex items-center gap-0.5"
          style={{ color: 'var(--primary)', fontSize: 12.5, fontWeight: 600, background: 'none', border: 'none' }}
        >
          {action.label}
          <ChevronRight size={14} strokeWidth={2.4} />
        </button>
      )}
    </div>
  );
}

function ActionGrid({ items, navigate }: { items: GridItem[]; navigate: Props['navigate'] }) {
  return (
    <div className="grid grid-cols-4 gap-y-5 gap-x-1">
      {items.map((f) => (
        <motion.button
          key={`${f.screen}-${f.label}`}
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={() => navigate(f.screen, f.param)}
          className="flex flex-col items-center gap-2"
          style={{ background: 'none', border: 'none', padding: 0 }}
        >
          <DualIconBox size={50}>
            <span style={{ transform: 'scale(0.88)', transformOrigin: 'center' }}>
              <DualToneIcon name={f.icon} />
            </span>
          </DualIconBox>
          <span
            className="text-center leading-tight px-0.5"
            style={{ color: 'var(--foreground)', fontSize: 11, fontWeight: 600, maxWidth: 72 }}
          >
            {f.label}
          </span>
        </motion.button>
      ))}
    </div>
  );
}

/** Enterprise hero — gradient card, dual-tone mark, clear CTA */
function PayHero({
  slide,
  index,
  total,
  onCta,
  onDot,
}: {
  slide: Hero;
  index: number;
  total: number;
  onCta: () => void;
  onDot: (i: number) => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-[22px]" style={{ minHeight: 168 }}>
      {/* Base surface */}
      <div
        className="absolute inset-0"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 22,
        }}
      />
      {/* Soft brand wash */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 90% 80% at 100% 0%, color-mix(in oklab, ${slide.accent} 28%, transparent), transparent 55%),
            radial-gradient(ellipse 70% 60% at 0% 100%, color-mix(in oklab, var(--primary) 12%, transparent), transparent 50%)
          `,
          borderRadius: 22,
        }}
      />
      {/* Fine grid texture */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          borderRadius: 22,
        }}
      />

      <div className="relative z-[1] flex flex-col justify-between p-4 min-h-[168px]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p
              style={{
                color: slide.accent,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              {slide.kicker}
            </p>
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.28 }}
              >
                <h3
                  className="mt-1.5"
                  style={{
                    color: 'var(--foreground)',
                    fontSize: 18,
                    fontWeight: 800,
                    letterSpacing: -0.4,
                    lineHeight: 1.25,
                  }}
                >
                  {slide.title}
                </h3>
                <p
                  className="mt-1.5"
                  style={{
                    color: 'var(--muted-foreground)',
                    fontSize: 12.5,
                    lineHeight: 1.45,
                    maxWidth: '92%',
                  }}
                >
                  {slide.sub}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Decorative icon plate */}
          <div
            className="shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{
              background: `color-mix(in oklab, ${slide.accent} 16%, var(--card))`,
              border: `1px solid color-mix(in oklab, ${slide.accent} 32%, var(--border))`,
              boxShadow: `0 8px 24px color-mix(in oklab, ${slide.accent} 18%, transparent)`,
            }}
          >
            <span style={{ transform: 'scale(1.05)' }}>
              <DualToneIcon name={slide.icon} />
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: total }).map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Slide ${i + 1}`}
                onClick={() => onDot(i)}
                className="rounded-full transition-all"
                style={{
                  width: i === index ? 16 : 6,
                  height: 6,
                  background: i === index ? slide.accent : 'var(--border)',
                  border: 'none',
                  padding: 0,
                }}
              />
            ))}
          </div>
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={onCta}
            className="rounded-full px-4 py-2 flex items-center gap-1"
            style={{
              background: 'var(--primary)',
              color: 'var(--primary-foreground, #fff)',
              fontSize: 12.5,
              fontWeight: 700,
              border: 'none',
            }}
          >
            {slide.cta}
            <ChevronRight size={14} strokeWidth={2.6} />
          </motion.button>
        </div>
      </div>
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
    const t = window.setInterval(nextHero, 6000);
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

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-1 pb-3">
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={() => navigate('profile')}
          aria-label="Account"
          style={{ background: 'transparent', border: 'none', padding: 0 }}
        >
          <ConviaAvatar size={36} />
        </motion.button>

        <div className="flex flex-col items-center">
          <span style={{ color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600, letterSpacing: '0.04em' }}>
            PAY
          </span>
          <span style={{ color: 'var(--foreground)', fontSize: 16, fontWeight: 800, letterSpacing: -0.3 }}>
            Payments
          </span>
        </div>

        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          onClick={() => setShowCurrency(true)}
          className="flex items-center gap-1.5 rounded-full pl-1.5 pr-2.5 py-1"
          style={{
            background: 'color-mix(in oklab, var(--card) 90%, var(--foreground))',
            border: '1px solid var(--border)',
          }}
        >
          <CountryFlag code={currency.countryCode || currency.code} size={18} />
          <span style={{ color: 'var(--foreground)', fontSize: 12, fontWeight: 700 }}>{currency.code}</span>
          <ChevronDown size={14} style={{ color: 'var(--muted-foreground)' }} />
        </motion.button>
      </div>

      <div className="px-4 pb-28 flex flex-col gap-6">
        {/* Banner */}
        <PayHero
          slide={slide}
          index={heroIdx % HERO.length}
          total={HERO.length}
          onCta={() => navigate(slide.screen)}
          onDot={(i) => setHeroIdx(i)}
        />

        {/* Quick actions */}
        <section>
          <SectionTitle title="Quick actions" />
          <div
            className="rounded-[20px] p-4"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
            }}
          >
            <ActionGrid items={QUICK} navigate={navigate} />
          </div>
        </section>

        {/* Bills */}
        <section>
          <SectionTitle
            title="Bills & services"
            action={{ label: 'Airtime', onClick: () => navigate('airtime') }}
          />
          <div
            className="rounded-[20px] p-4"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
            }}
          >
            <ActionGrid items={BILLS} navigate={navigate} />
          </div>
        </section>

        {/* Transfer / collect */}
        <section>
          <SectionTitle title="Send & collect" />
          <div
            className="rounded-[20px] p-4"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
            }}
          >
            <ActionGrid items={TRANSFER} navigate={navigate} />
          </div>
        </section>
      </div>
    </div>
  );
}
