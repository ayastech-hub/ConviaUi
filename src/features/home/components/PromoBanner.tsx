import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeftRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  Gift,
  ShieldCheck,
  Sparkles,
  WalletCards,
  Zap,
} from 'lucide-react';
import type { Screen } from '../../../shared/data/mockData';

type PromoSlide = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  Icon: typeof Gift;
  accent: string;
  screen?: Screen;
};

const SLIDES: PromoSlide[] = [
  {
    id: 'rewards',
    eyebrow: 'REWARDS',
    title: 'Earn more with Convia',
    body: 'Invite friends and complete tasks to earn points.',
    Icon: Gift,
    accent: 'var(--primary)',
    screen: 'rewards',
  },
  {
    id: 'swap',
    eyebrow: 'SWAP',
    title: 'Swap crypto instantly',
    body: 'Move between supported assets with ease.',
    Icon: ArrowLeftRight,
    accent: 'var(--positive, #22c55e)',
    screen: 'swap',
  },
  {
    id: 'buy',
    eyebrow: 'BUY CRYPTO',
    title: 'Fund your wallet',
    body: 'Buy crypto with card or bank funding.',
    Icon: Zap,
    accent: 'var(--foreground)',
    screen: 'onramp',
  },
  {
    id: 'kyc',
    eyebrow: 'VERIFICATION',
    title: 'Verify your account',
    body: 'Unlock higher limits and more features.',
    Icon: ShieldCheck,
    accent: 'var(--primary)',
    screen: 'kyc',
  },
];

const AUTO_MS = 5000;
const SWIPE_THRESHOLD = 40;
const N = SLIDES.length;

interface Props {
  onNavigate: (s: Screen) => void;
}

/* -------------------------------------------------------------------------- */
/* Compact visuals                                                            */
/* -------------------------------------------------------------------------- */

function RewardsVisual() {
  return (
    <div className="relative w-[88px] h-[76px]" aria-hidden="true">
      <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute right-0 top-1 w-[76px] rounded-xl p-2.5"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          boxShadow: '0 8px 20px rgba(0,0,0,.15)',
        }}
      >
        <div className="flex items-center justify-between">
          <div
            className="w-5 h-5 rounded-md flex items-center justify-center"
            style={{
              background:
                'color-mix(in srgb, var(--primary) 13%, transparent)',
            }}
          >
            <Gift size={10} style={{ color: 'var(--primary)' }} />
          </div>

          <span
            className="text-[6px] font-bold"
            style={{ color: 'var(--muted-foreground)' }}
          >
            POINTS
          </span>
        </div>

        <div
          className="mt-2 text-[15px] font-bold"
          style={{ color: 'var(--foreground)' }}
        >
          2,450
        </div>

        <div
          className="text-[6px] mt-0.5"
          style={{ color: 'var(--positive, #22c55e)' }}
        >
          +240 this week
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 2, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute left-0 bottom-0 rounded-lg px-2 py-1.5 flex items-center gap-1.5"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          boxShadow: '0 6px 15px rgba(0,0,0,.15)',
        }}
      >
        <div
          className="w-4 h-4 rounded-full flex items-center justify-center"
          style={{
            background:
              'color-mix(in srgb, var(--primary) 12%, transparent)',
          }}
        >
          <Check size={8} style={{ color: 'var(--primary)' }} />
        </div>

        <span
          className="text-[6px] font-semibold"
          style={{ color: 'var(--foreground)' }}
        >
          +100 pts
        </span>
      </motion.div>
    </div>
  );
}

function SwapVisual() {
  return (
    <motion.div
      animate={{ y: [0, -3, 0] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      className="relative w-[88px] h-[76px] rounded-xl p-2.5"
      aria-hidden="true"
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        boxShadow: '0 8px 20px rgba(0,0,0,.15)',
      }}
    >
      <div className="flex items-center justify-between">
        <span
          className="text-[7px] font-bold"
          style={{ color: 'var(--foreground)' }}
        >
          SWAP
        </span>

        <ArrowLeftRight
          size={10}
          style={{ color: 'var(--positive, #22c55e)' }}
        />
      </div>

      <div
        className="mt-2 rounded-lg px-2 py-1.5 flex items-center justify-between"
        style={{ background: 'var(--muted)' }}
      >
        <span
          className="text-[9px] font-bold"
          style={{ color: 'var(--foreground)' }}
        >
          0.25
        </span>

        <span
          className="text-[6px] font-bold"
          style={{ color: 'var(--muted-foreground)' }}
        >
          ETH
        </span>
      </div>

      <div className="h-1 flex items-center justify-center">
        <ArrowLeftRight
          size={7}
          style={{ color: 'var(--muted-foreground)' }}
        />
      </div>

      <div
        className="rounded-lg px-2 py-1.5 flex items-center justify-between"
        style={{ background: 'var(--muted)' }}
      >
        <span
          className="text-[9px] font-bold"
          style={{ color: 'var(--foreground)' }}
        >
          1,245
        </span>

        <span
          className="text-[6px] font-bold"
          style={{ color: 'var(--muted-foreground)' }}
        >
          USDC
        </span>
      </div>
    </motion.div>
  );
}

function BuyVisual() {
  return (
    <motion.div
      animate={{ y: [0, -3, 0] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      className="relative w-[88px] h-[76px] rounded-xl p-2.5"
      aria-hidden="true"
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        boxShadow: '0 8px 20px rgba(0,0,0,.15)',
      }}
    >
      <div className="flex items-center justify-between">
        <div
          className="w-5 h-5 rounded-md flex items-center justify-center"
          style={{ background: 'var(--muted)' }}
        >
          <WalletCards size={10} style={{ color: 'var(--foreground)' }} />
        </div>

        <span
          className="text-[6px] font-bold"
          style={{ color: 'var(--muted-foreground)' }}
        >
          WALLET
        </span>
      </div>

      <div
        className="mt-2 text-[14px] font-bold"
        style={{ color: 'var(--foreground)' }}
      >
        $4,820
      </div>

      <div
        className="mt-2 h-1 rounded-full overflow-hidden"
        style={{ background: 'var(--muted)' }}
      >
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: '72%' }}
          transition={{ duration: 1.2 }}
          className="h-full rounded-full"
          style={{ background: 'var(--foreground)' }}
        />
      </div>
    </motion.div>
  );
}

function KycVisual() {
  return (
    <motion.div
      animate={{ y: [0, -3, 0] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      className="relative w-[88px] h-[76px] rounded-xl p-2.5"
      aria-hidden="true"
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        boxShadow: '0 8px 20px rgba(0,0,0,.15)',
      }}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center"
          style={{
            background:
              'color-mix(in srgb, var(--primary) 12%, transparent)',
          }}
        >
          <ShieldCheck size={11} style={{ color: 'var(--primary)' }} />
        </div>

        <div>
          <div
            className="text-[7px] font-bold"
            style={{ color: 'var(--foreground)' }}
          >
            Verified
          </div>

          <div
            className="text-[5px]"
            style={{ color: 'var(--muted-foreground)' }}
          >
            Account secure
          </div>
        </div>
      </div>

      <div className="mt-3 space-y-1.5">
        {['Identity', 'Document', 'Security'].map((item) => (
          <div key={item} className="flex items-center gap-1.5">
            <Check
              size={7}
              style={{ color: 'var(--positive, #22c55e)' }}
            />

            <span
              className="text-[6px]"
              style={{ color: 'var(--muted-foreground)' }}
            >
              {item}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function SlideVisual({ id }: { id: string }) {
  switch (id) {
    case 'rewards':
      return <RewardsVisual />;
    case 'swap':
      return <SwapVisual />;
    case 'buy':
      return <BuyVisual />;
    default:
      return <KycVisual />;
  }
}

/* -------------------------------------------------------------------------- */
/* Banner                                                                     */
/* -------------------------------------------------------------------------- */

export function PromoBanner({ onNavigate }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  const touchStartX = useRef<number | null>(null);
  const mouseStartX = useRef<number | null>(null);
  const paused = useRef(false);
  const dragged = useRef(false);

  const goTo = useCallback((index: number) => {
    setActiveIndex(((index % N) + N) % N);
  }, []);

  const next = useCallback(() => {
    setActiveIndex((current) => (current + 1) % N);
  }, []);

  const previous = useCallback(() => {
    setActiveIndex((current) => (current - 1 + N) % N);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!paused.current) {
        setActiveIndex((current) => (current + 1) % N);
      }
    }, AUTO_MS);

    return () => window.clearInterval(timer);
  }, []);

  const handleTouchStart = (event: React.TouchEvent) => {
    paused.current = true;
    dragged.current = false;
    touchStartX.current = event.touches[0].clientX;
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    paused.current = false;

    if (touchStartX.current === null) return;

    const deltaX =
      event.changedTouches[0].clientX - touchStartX.current;

    touchStartX.current = null;

    if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;

    dragged.current = true;

    if (deltaX < 0) {
      next();
    } else {
      previous();
    }
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    paused.current = true;
    dragged.current = false;
    mouseStartX.current = event.clientX;
  };

  const handleMouseUp = (event: React.MouseEvent) => {
    paused.current = false;

    if (mouseStartX.current === null) return;

    const deltaX = event.clientX - mouseStartX.current;

    mouseStartX.current = null;

    if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;

    dragged.current = true;

    if (deltaX < 0) {
      next();
    } else {
      previous();
    }
  };

  const handleMouseLeave = () => {
    mouseStartX.current = null;
    paused.current = false;
  };

  const handleClick = (slide: PromoSlide) => {
    if (dragged.current) {
      dragged.current = false;
      return;
    }

    if (slide.screen) {
      onNavigate(slide.screen);
    }
  };

  return (
    <div className="px-5 mb-4">
      <div
        className="relative overflow-hidden rounded-[18px] select-none touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{
          height: '116px',
          border: '1px solid var(--border)',
          background: 'var(--card)',
          boxShadow: '0 8px 24px rgba(0,0,0,.08)',
        }}
      >
        {/* Subtle glow */}
        <motion.div
          animate={{
            opacity: [0.08, 0.15, 0.08],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -right-12 -top-16 w-40 h-40 rounded-full blur-3xl pointer-events-none"
          style={{
            background: SLIDES[activeIndex].accent,
          }}
        />

        {/* Slides */}
        <motion.div
          className="flex h-full"
          animate={{
            x: `${-(activeIndex * 100) / N}%`,
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 32,
          }}
          style={{
            width: `${N * 100}%`,
          }}
        >
          {SLIDES.map((slide, index) => {
            const Icon = slide.Icon;
            const active = index === activeIndex;

            return (
              <button
                key={slide.id}
                type="button"
                onClick={() => handleClick(slide)}
                className="relative shrink-0 text-left overflow-hidden group"
                style={{
                  width: `${100 / N}%`,
                  minWidth: `${100 / N}%`,
                  height: '116px',
                  boxSizing: 'border-box',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                {/* Content */}
                <div className="relative z-10 h-full px-4 py-3.5">
                  {/* Eyebrow */}
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center"
                      style={{
                        background: `color-mix(in srgb, ${slide.accent} 12%, transparent)`,
                      }}
                    >
                      <Icon
                        size={10}
                        style={{ color: slide.accent }}
                      />
                    </div>

                    <span
                      className="text-[7px] font-bold tracking-[0.12em]"
                      style={{
                        color: 'var(--muted-foreground)',
                      }}
                    >
                      {slide.eyebrow}
                    </span>
                  </div>

                  {/* Text */}
                  <div className="mt-2 max-w-[57%]">
                    <h3
                      className="text-[15px] leading-[1.1] tracking-[-0.02em] font-bold"
                      style={{
                        color: 'var(--foreground)',
                      }}
                    >
                      {slide.title}
                    </h3>

                    <p
                      className="mt-1 text-[8px] leading-[1.35]"
                      style={{
                        color: 'var(--muted-foreground)',
                      }}
                    >
                      {slide.body}
                    </p>

                    <div className="mt-2 flex items-center gap-0.5">
                      <span
                        className="text-[8px] font-bold"
                        style={{
                          color: 'var(--foreground)',
                        }}
                      >
                        Explore
                      </span>

                      <ChevronRight
                        size={10}
                        style={{
                          color: 'var(--foreground)',
                        }}
                      />
                    </div>
                  </div>

                  {/* Visual */}
                  <div className="absolute right-3 top-5">
                    <SlideVisual id={slide.id} />
                  </div>
                </div>
              </button>
            );
          })}
        </motion.div>

        {/* Dots */}
        <div className="absolute left-4 bottom-2.5 z-20 flex items-center gap-1">
          {SLIDES.map((slide, index) => {
            const active = index === activeIndex;

            return (
              <button
                key={slide.id}
                type="button"
                aria-label={`Go to promotion ${index + 1}`}
                aria-current={active ? 'true' : undefined}
                onClick={(event) => {
                  event.stopPropagation();
                  goTo(index);
                }}
                className="rounded-full transition-all duration-300"
                style={{
                  width: active ? 16 : 4,
                  height: 3,
                  padding: 0,
                  background: active
                    ? 'var(--foreground)'
                    : 'color-mix(in srgb, var(--foreground) 20%, transparent)',
                }}
              />
            );
          })}
        </div>

        {/* Auto progress */}
        <motion.div
          key={activeIndex}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{
            duration: AUTO_MS / 1000,
            ease: 'linear',
          }}
          className="absolute left-0 bottom-0 h-[1.5px] w-full origin-left"
          style={{
            background: SLIDES[activeIndex].accent,
          }}
        />
      </div>
    </div>
  );
}