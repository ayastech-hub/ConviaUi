import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
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
    body: 'Swap cryptocurrency in a few clicks.',
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

const AUTO_MS = 5000;

interface Props {
  onNavigate: (s: Screen) => void;
}

/** Swipeable promo carousel + auto-advance every 5s. */
export function PromoBanner({ onNavigate }: Props) {
  const [i, setI] = useState(0);
  const touchX = useRef<number | null>(null);
  const paused = useRef(false);

  const go = useCallback((next: number) => {
    const n = SLIDES.length;
    setI(((next % n) + n) % n);
  }, []);

  const goNext = useCallback(() => go(i + 1), [go, i]);
  const goPrev = useCallback(() => go(i - 1), [go, i]);

  // Auto-slide every 5s (pauses while finger is down)
  useEffect(() => {
    const id = window.setInterval(() => {
      if (!paused.current) setI((v) => (v + 1) % SLIDES.length);
    }, AUTO_MS);
    return () => window.clearInterval(id);
  }, []);

  const onTouchStart = (e: React.TouchEvent) => {
    paused.current = true;
    touchX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    paused.current = false;
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) < 40) return; // tap, not swipe
    if (dx < 0) goNext();
    else goPrev();
  };

  // Mouse drag (desktop)
  const mouseX = useRef<number | null>(null);
  const onMouseDown = (e: React.MouseEvent) => {
    paused.current = true;
    mouseX.current = e.clientX;
  };
  const onMouseUp = (e: React.MouseEvent) => {
    paused.current = false;
    if (mouseX.current == null) return;
    const dx = e.clientX - mouseX.current;
    mouseX.current = null;
    if (Math.abs(dx) < 40) return;
    if (dx < 0) goNext();
    else goPrev();
  };

  return (
    <div className="px-5 mb-5">
      <div
        className="overflow-hidden rounded-2xl touch-pan-y"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseLeave={() => {
          mouseX.current = null;
          paused.current = false;
        }}
        style={{ border: '1px solid var(--border)', background: 'var(--card)' }}
      >
        <motion.div
          className="flex"
          animate={{ x: `-${i * 100}%` }}
          transition={{ type: 'spring', stiffness: 280, damping: 32 }}
          style={{ width: `${SLIDES.length * 100}%` }}
        >
          {SLIDES.map((slide) => {
            const Icon = slide.Icon;
            return (
              <button
                key={slide.id}
                type="button"
                onClick={() => {
                  if (Math.abs((mouseX.current ?? 0)) > 0) return;
                  if (slide.screen) onNavigate(slide.screen);
                }}
                className="flex items-center gap-3 px-4 py-3.5 text-left shrink-0"
                style={{ width: `${100 / SLIDES.length}%` }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--muted)' }}
                >
                  <Icon size={22} style={{ color: slide.accent }} strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>
                    {slide.title}
                  </p>
                  <p
                    style={{ color: 'var(--muted-foreground)', fontSize: 12, marginTop: 2 }}
                    className="truncate"
                  >
                    {slide.body}
                  </p>
                </div>
                <ChevronRight size={18} style={{ color: 'var(--muted-foreground)' }} />
              </button>
            );
          })}
        </motion.div>
      </div>

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
