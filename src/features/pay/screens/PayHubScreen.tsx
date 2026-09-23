import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronDown,
  ChevronRight,
  Smartphone,
  QrCode,
  Link2,
  Zap,
  ArrowUpRight,
} from 'lucide-react';
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

/** Theme-only accents — matches home PromoBanner */
type PaySlide = {
  id: string;
  label: string;
  title: string;
  description: string;
  screen: Screen;
  accent: string; // CSS var only
};

const SLIDES: PaySlide[] = [
  {
    id: 'bills',
    label: 'BILLS & AIRTIME',
    title: 'Pay from your balance',
    description: 'Airtime, data, power and TV in seconds.',
    screen: 'airtime',
    accent: 'var(--primary)',
  },
  {
    id: 'qr',
    label: 'SCAN & PAY',
    title: 'Pay with QR',
    description: 'No long addresses — scan and confirm.',
    screen: 'scan',
    accent: 'var(--primary)',
  },
  {
    id: 'link',
    label: 'PAYMENT LINK',
    title: 'Get paid with a link',
    description: 'Share once. Receive when they pay.',
    screen: 'request-link',
    accent: 'var(--positive, #16A34A)',
  },
  {
    id: 'buy',
    label: 'BUY CRYPTO',
    title: 'Fund your wallet',
    description: 'Card or bank — crypto lands in Convia.',
    screen: 'onramp',
    accent: 'var(--foreground)',
  },
];

const N = SLIDES.length;
const AUTO_MS = 5000;
const SWIPE = 40;

function BillsArt({ accent }: { accent: string }) {
  return (
    <div className="relative w-[76px] h-[62px]" aria-hidden>
      <motion.div
        animate={{ y: [0, -3, 0], rotate: [-3, 2, -3] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute right-0 top-0 w-[54px] h-[54px] rounded-2xl flex items-center justify-center"
        style={{
          background: `color-mix(in srgb, ${accent} 14%, var(--card))`,
          border: `1px solid color-mix(in srgb, ${accent} 28%, var(--border))`,
          boxShadow: `0 8px 22px color-mix(in srgb, ${accent} 16%, transparent)`,
        }}
      >
        <Smartphone size={22} strokeWidth={1.7} style={{ color: accent }} />
      </motion.div>
      <motion.div
        animate={{ y: [0, 3, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute left-0 bottom-0 flex items-center gap-1 px-1.5 py-1 rounded-md"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
        }}
      >
        <Zap size={8} style={{ color: accent }} />
        <span className="text-[6px] font-bold" style={{ color: 'var(--foreground)' }}>
          LIVE
        </span>
      </motion.div>
    </div>
  );
}

function QrArt({ accent }: { accent: string }) {
  return (
    <div className="relative w-[76px] h-[62px]" aria-hidden>
      <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute right-0 top-0 w-[54px] h-[54px] rounded-xl flex items-center justify-center"
        style={{
          background: `color-mix(in srgb, ${accent} 10%, var(--card))`,
          border: `1px solid color-mix(in srgb, ${accent} 26%, var(--border))`,
          boxShadow: '0 8px 22px rgba(0,0,0,0.12)',
        }}
      >
        <QrCode size={24} strokeWidth={1.6} style={{ color: accent }} />
      </motion.div>
    </div>
  );
}

function LinkArt({ accent }: { accent: string }) {
  return (
    <div className="relative w-[76px] h-[62px]" aria-hidden>
      <motion.div
        animate={{ y: [0, -3, 0], rotate: [0, 3, 0] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute right-0 top-0 w-[54px] h-[54px] rounded-full flex items-center justify-center"
        style={{
          background: `color-mix(in srgb, ${accent} 12%, var(--card))`,
          border: `1px solid color-mix(in srgb, ${accent} 28%, var(--border))`,
          boxShadow: `0 8px 22px color-mix(in srgb, ${accent} 14%, transparent)`,
        }}
      >
        <Link2 size={22} strokeWidth={1.7} style={{ color: accent }} />
      </motion.div>
      <motion.div
        animate={{ y: [0, 3, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute left-0 bottom-0 w-7 h-7 rounded-lg flex items-center justify-center"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <ArrowUpRight size={12} style={{ color: accent }} />
      </motion.div>
    </div>
  );
}

function BuyArt({ accent }: { accent: string }) {
  return (
    <div className="relative w-[76px] h-[62px]" aria-hidden>
      <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute right-0 top-0 w-[54px] h-[54px] rounded-xl flex items-center justify-center"
        style={{
          background: `color-mix(in srgb, ${accent} 8%, var(--card))`,
          border: '1px solid var(--border)',
          boxShadow: '0 8px 22px rgba(0,0,0,0.12)',
        }}
      >
        <Zap size={24} strokeWidth={1.7} style={{ color: accent }} />
      </motion.div>
    </div>
  );
}

function SlideArt({ slide }: { slide: PaySlide }) {
  switch (slide.id) {
    case 'bills':
      return <BillsArt accent={slide.accent} />;
    case 'qr':
      return <QrArt accent={slide.accent} />;
    case 'link':
      return <LinkArt accent={slide.accent} />;
    default:
      return <BuyArt accent={slide.accent} />;
  }
}

function PayPromoBanner({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [active, setActive] = useState(0);
  const paused = useRef(false);
  const touchX = useRef<number | null>(null);
  const mouseX = useRef<number | null>(null);
  const dragged = useRef(false);

  const go = useCallback((i: number) => setActive(((i % N) + N) % N), []);
  const next = useCallback(() => setActive((c) => (c + 1) % N), []);
  const prev = useCallback(() => setActive((c) => (c - 1 + N) % N), []);

  useEffect(() => {
    const t = window.setInterval(() => {
      if (!paused.current) setActive((c) => (c + 1) % N);
    }, AUTO_MS);
    return () => window.clearInterval(t);
  }, []);

  const slide = SLIDES[active];

  return (
    <div className="w-full">
      <div
        className="relative overflow-hidden rounded-2xl select-none"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          boxShadow: '0 1px 0 color-mix(in srgb, var(--foreground) 4%, transparent)',
        }}
        onTouchStart={(e) => {
          paused.current = true;
          dragged.current = false;
          touchX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          paused.current = false;
          if (touchX.current == null) return;
          const d = e.changedTouches[0].clientX - touchX.current;
          touchX.current = null;
          if (Math.abs(d) < SWIPE) return;
          dragged.current = true;
          if (d < 0) next();
          else prev();
        }}
        onMouseDown={(e) => {
          paused.current = true;
          dragged.current = false;
          mouseX.current = e.clientX;
        }}
        onMouseUp={(e) => {
          paused.current = false;
          if (mouseX.current == null) return;
          const d = e.clientX - mouseX.current;
          mouseX.current = null;
          if (Math.abs(d) < SWIPE) return;
          dragged.current = true;
          if (d < 0) next();
          else prev();
        }}
        onClick={() => {
          if (dragged.current) return;
          onNavigate(slide.screen);
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onNavigate(slide.screen);
        }}
      >
        {/* Soft primary wash — brand only */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 80% 90% at 100% 50%, color-mix(in srgb, var(--primary) 14%, transparent), transparent 55%)`,
          }}
        />

        <div className="relative z-[1] flex items-center gap-3 px-4 py-3.5 min-h-[96px]">
          <div className="min-w-0 flex-1">
            <p
              style={{
                color: slide.accent === 'var(--foreground)' ? 'var(--muted-foreground)' : slide.accent,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.08em',
              }}
            >
              {slide.label}
            </p>
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.22 }}
              >
                <h3
                  className="mt-1"
                  style={{
                    color: 'var(--foreground)',
                    fontSize: 16,
                    fontWeight: 800,
                    letterSpacing: -0.3,
                    lineHeight: 1.25,
                  }}
                >
                  {slide.title}
                </h3>
                <p
                  className="mt-0.5"
                  style={{
                    color: 'var(--muted-foreground)',
                    fontSize: 12,
                    lineHeight: 1.4,
                  }}
                >
                  {slide.description}
                </p>
              </motion.div>
            </AnimatePresence>
            <div className="mt-2.5 flex items-center gap-1" style={{ color: 'var(--primary)' }}>
              <span style={{ fontSize: 12, fontWeight: 700 }}>Open</span>
              <ChevronRight size={14} strokeWidth={2.5} />
            </div>
          </div>
          <SlideArt slide={slide} />
        </div>
      </div>

      {/* Dots — primary only */}
      <div className="flex items-center justify-center gap-1.5 mt-3">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            aria-label={`Slide ${i + 1}`}
            onClick={(e) => {
              e.stopPropagation();
              go(i);
            }}
            className="rounded-full transition-all"
            style={{
              width: i === active ? 14 : 6,
              height: 6,
              background: i === active ? 'var(--primary)' : 'var(--border)',
              border: 'none',
              padding: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function SectionTitle({ title, action }: { title: string; action?: { label: string; onClick: () => void } }) {
  return (
    <div className="flex items-center justify-between mb-3 px-0.5">
      <h2 style={{ color: 'var(--foreground)', fontSize: 15, fontWeight: 700, letterSpacing: -0.2 }}>
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
            background: 'var(--secondary)',
            border: '1px solid var(--border)',
          }}
        >
          <CountryFlag code={currency.countryCode || currency.code} size={18} />
          <span style={{ color: 'var(--foreground)', fontSize: 12, fontWeight: 700 }}>{currency.code}</span>
          <ChevronDown size={14} style={{ color: 'var(--muted-foreground)' }} />
        </motion.button>
      </div>

      <div className="px-4 pb-28 flex flex-col gap-6">
        <PayPromoBanner onNavigate={(s) => navigate(s)} />

        <section>
          <SectionTitle title="Quick actions" />
          <div className="rounded-[20px] p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <ActionGrid items={QUICK} navigate={navigate} />
          </div>
        </section>

        <section>
          <SectionTitle title="Bills & services" action={{ label: 'Airtime', onClick: () => navigate('airtime') }} />
          <div className="rounded-[20px] p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <ActionGrid items={BILLS} navigate={navigate} />
          </div>
        </section>

        <section>
          <SectionTitle title="Send & collect" />
          <div className="rounded-[20px] p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <ActionGrid items={TRANSFER} navigate={navigate} />
          </div>
        </section>
      </div>
    </div>
  );
}
