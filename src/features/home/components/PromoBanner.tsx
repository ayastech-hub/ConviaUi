import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Gift, ArrowLeftRight, Zap, Shield } from 'lucide-react';
import type { Screen } from '../../../shared/data/mockData';

const SLIDES: {
  id: string;
  title: string;
  body: string;
  Icon: typeof Gift;
  accent: string;
  screen?: Screen;
}[] = [
  {
    id: 'rewards',
    title: 'Earn rewards',
    body: 'Invite friends and complete tasks for Convia points.',
    Icon: Gift,
    accent: 'var(--primary)',
    screen: 'rewards',
  },
  {
    id: 'swap',
    title: 'Instant swaps',
    body: 'Exchange tokens in a few taps — live quotes.',
    Icon: ArrowLeftRight,
    accent: 'var(--positive, #22c55e)',
    screen: 'swap',
  },
  {
    id: 'buy',
    title: 'Buy crypto',
    body: 'Fund with card or bank and start building.',
    Icon: Zap,
    accent: 'var(--foreground)',
    screen: 'onramp',
  },
  {
    id: 'kyc',
    title: 'Verify once',
    body: 'Unlock higher limits with KYC verification.',
    Icon: Shield,
    accent: 'var(--primary)',
    screen: 'kyc',
  },
];

interface Props {
  onNavigate: (s: Screen) => void;
}

/** Ad-style carousel — structure inspired by crypto wallet promos, Convia copy & colors. */
export function PromoBanner({ onNavigate }: Props) {
  const [i, setI] = useState(0);
  const slide = SLIDES[i];
  const Icon = slide.Icon;

  return (
    <div className="px-5 mb-5">
      <AnimatePresence mode="wait">
        <motion.button
          key={slide.id}
          type="button"
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            if (slide.screen) onNavigate(slide.screen);
            else setI((v) => (v + 1) % SLIDES.length);
          }}
          className="w-full flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
          }}
        >
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--muted)' }}
          >
            <Icon size={22} style={{ color: slide.accent }} strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>{slide.title}</p>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginTop: 2 }} className="truncate">
              {slide.body}
            </p>
          </div>
          <ChevronRight size={18} style={{ color: 'var(--muted-foreground)' }} />
        </motion.button>
      </AnimatePresence>
      <div className="flex justify-center gap-1.5 mt-2.5">
        {SLIDES.map((s, idx) => (
          <button
            key={s.id}
            type="button"
            aria-label={`Promo ${idx + 1}`}
            onClick={() => setI(idx)}
            className="rounded-full transition-all"
            style={{
              width: idx === i ? 14 : 6,
              height: 6,
              background: idx === i ? 'var(--foreground)' : 'var(--border)',
            }}
          />
        ))}
      </div>
    </div>
  );
}
