import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowUpRight,
  ArrowLeftRight,
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
  highlight: string;
  body: string;
  Icon: typeof Gift;
  accent: string;
  screen?: Screen;
};

const SLIDES: PromoSlide[] = [
  {
    id: 'rewards',
    eyebrow: 'CONVIA REWARDS',
    title: 'Turn activity',
    highlight: 'into rewards.',
    body: 'Invite friends, complete missions and earn Convia Points.',
    Icon: Gift,
    accent: 'var(--primary)',
    screen: 'rewards',
  },
  {
    id: 'swap',
    eyebrow: 'INSTANT SWAPS',
    title: 'Move money',
    highlight: 'without friction.',
    body: 'Swap supported crypto assets quickly, securely and effortlessly.',
    Icon: ArrowLeftRight,
    accent: 'var(--positive, #22c55e)',
    screen: 'swap',
  },
  {
    id: 'buy',
    eyebrow: 'BUY CRYPTO',
    title: 'Fund your wallet',
    highlight: 'in seconds.',
    body: 'Buy crypto with supported cards or bank funding and get started.',
    Icon: Zap,
    accent: 'var(--foreground)',
    screen: 'onramp',
  },
  {
    id: 'kyc',
    eyebrow: 'ACCOUNT VERIFICATION',
    title: 'Verify once.',
    highlight: 'Unlock more.',
    body: 'Complete verification to unlock higher limits and more features.',
    Icon: ShieldCheck,
    accent: 'var(--primary)',
    screen: 'kyc',
  },
];

const AUTO_MS = 5000;
const SWIPE_THRESHOLD = 45;
const N = SLIDES.length;

interface Props {
  onNavigate: (s: Screen) => void;
}

function RewardsVisual() {
  return (
    <div
      className="relative w-[132px] h-[118px] sm:w-[160px] sm:h-[140px]"
      aria-hidden="true"
    >
      <motion.div
        animate={{ y: [0, -5, 0], rotate: [-1, 1, -1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute right-0 top-1 w-[108px] sm:w-[128px] rounded-2xl p-3.5"
        style={{
          background:
            'linear-gradient(145deg, color-mix(in srgb, var(--primary) 22%, var(--card)), var(--card))',
          border: '1px solid color-mix(in srgb, var(--primary) 30%, var(--border))',
          boxShadow:
            '0 20px 45px color-mix(in srgb, var(--primary) 18%, transparent)',
        }}
      >
        <div className="flex items-center justify-between">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{
              background: 'color-mix(in srgb, var(--primary) 16%, transparent)',
            }}
          >
            <Gift size={14} style={{ color: 'var(--primary)' }} />
          </div>

          <span
            className="text-[9px] font-semibold"
            style={{ color: 'var(--muted-foreground)' }}
          >
            POINTS
          </span>
        </div>

        <div
          className="mt-4 text-xl sm:text-2xl font-bold tracking-tight"
          style={{ color: 'var(--foreground)' }}
        >
          2,450
        </div>

        <div className="mt-1 flex items-center gap-1">
          <ArrowUpRight size={10} style={{ color: 'var(--positive, #22c55e)' }} />
          <span
            className="text-[9px] font-medium"
            style={{ color: 'var(--positive, #22c55e)' }}
          >
            +240 this week
          </span>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 4, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute left-0 bottom-0 rounded-xl px-3 py-2 flex items-center gap-2"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          boxShadow: '0 12px 30px rgba(0,0,0,.18)',
        }}
      >
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center"
          style={{
            background: 'color-mix(in srgb, var(--primary) 14%, transparent)',
          }}
        >
          <Check size={12} style={{ color: 'var(--primary)' }} />
        </div>

        <div>
          <div
            className="text-[9px] font-semibold"
            style={{ color: 'var(--foreground)' }}
          >
            Task completed
          </div>
          <div
            className="text-[8px]"
            style={{ color: 'var(--muted-foreground)' }}
          >
            +100 points
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function SwapVisual() {
  return (
    <div
      className="relative w-[140px] h-[126px] sm:w-[165px] sm:h-[142px]"
      aria-hidden="true"
    >
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-x-0 top-0 rounded-2xl p-3.5"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          boxShadow: '0 20px 45px rgba(0,0,0,.2)',
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <span
            className="text-[9px] font-semibold"
            style={{ color: 'var(--foreground)' }}
          >
            SWAP
          </span>

          <div
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{
              background:
                'color-mix(in srgb, var(--positive, #22c55e) 12%, transparent)',
            }}
          >
            <ArrowLeftRight
              size={11}
              style={{ color: 'var(--positive, #22c55e)' }}
            />
          </div>
        </div>

        <div
          className="rounded-xl px-3 py-2.5"
          style={{ background: 'var(--muted)' }}
        >
          <div
            className="text-[8px]"
            style={{ color: 'var(--muted-foreground)' }}
          >
            You pay
          </div>

          <div className="flex items-center justify-between mt-1">
            <span
              className="text-sm font-bold"
              style={{ color: 'var(--foreground)' }}
            >
              0.25
            </span>
            <span
              className="text-[9px] font-semibold"
              style={{ color: 'var(--foreground)' }}
            >
              ETH
            </span>
          </div>
        </div>

        <div className="relative h-3">
          <div
            className="absolute left-1/2 -translate-x-1/2 -top-1 w-6 h-6 rounded-full flex items-center justify-center"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
            }}
          >
            <ArrowLeftRight size={10} style={{ color: 'var(--foreground)' }} />
          </div>
        </div>

        <div
          className="rounded-xl px-3 py-2.5"
          style={{ background: 'var(--muted)' }}
        >
          <div
            className="text-[8px]"
            style={{ color: 'var(--muted-foreground)' }}
          >
            You receive
          </div>

          <div className="flex items-center justify-between mt-1">
            <span
              className="text-sm font-bold"
              style={{ color: 'var(--foreground)' }}
            >
              1,245
            </span>
            <span
              className="text-[9px] font-semibold"
              style={{ color: 'var(--foreground)' }}
            >
              USDC
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function BuyVisual() {
  return (
    <div
      className="relative w-[140px] h-[126px] sm:w-[165px] sm:h-[142px]"
      aria-hidden="true"
    >
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute right-0 top-0 w-[125px] sm:w-[145px] rounded-2xl p-3.5"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          boxShadow: '0 20px 45px rgba(0,0,0,.2)',
        }}
      >
        <div className="flex items-center justify-between">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--muted)' }}
          >
            <WalletCards size={14} style={{ color: 'var(--foreground)' }} />
          </div>

          <span
            className="text-[8px] font-medium"
            style={{ color: 'var(--muted-foreground)' }}
          >
            WALLET
          </span>
        </div>

        <div
          className="mt-4 text-lg sm:text-xl font-bold"
          style={{ color: 'var(--foreground)' }}
        >
          $4,820.40
        </div>

        <div
          className="mt-1 text-[8px]"
          style={{ color: 'var(--muted-foreground)' }}
        >
          Available balance
        </div>

        <div className="mt-4 flex items-center gap-1.5">
          <div
            className="h-1.5 flex-1 rounded-full"
            style={{ background: 'var(--muted)' }}
          >
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: '72%' }}
              transition={{ duration: 1.2, delay: 0.2 }}
              className="h-full rounded-full"
              style={{ background: 'var(--foreground)' }}
            />
          </div>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 4, 0], x: [0, 2, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute left-0 bottom-0 rounded-xl px-3 py-2 flex items-center gap-2"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          boxShadow: '0 12px 30px rgba(0,0,0,.18)',
        }}
      >
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center"
          style={{
            background:
              'color-mix(in srgb, var(--positive, #22c55e) 13%, transparent)',
          }}
        >
          <Zap size={11} style={{ color: 'var(--positive, #22c55e)' }} />
        </div>

        <div>
          <div
            className="text-[9px] font-semibold"
            style={{ color: 'var(--foreground)' }}
          >
            Funding ready
          </div>
          <div
            className="text-[8px]"
            style={{ color: 'var(--muted-foreground)' }}
          >
            Start building
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function KycVisual() {
  return (
    <div
      className="relative w-[140px] h-[126px] sm:w-[165px] sm:h-[142px]"
      aria-hidden="true"
    >
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute right-0 top-0 w-[128px] sm:w-[148px] rounded-2xl p-3.5"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          boxShadow: '0 20px 45px rgba(0,0,0,.2)',
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              background:
                'color-mix(in srgb, var(--primary) 14%, transparent)',
            }}
          >
            <ShieldCheck size={15} style={{ color: 'var(--primary)' }} />
          </div>

          <div>
            <div
              className="text-[9px] font-bold"
              style={{ color: 'var(--foreground)' }}
            >
              Identity verified
            </div>
            <div
              className="text-[8px]"
              style={{ color: 'var(--muted-foreground)' }}
            >
              Account protected
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {['Identity', 'Document', 'Security'].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center"
                style={{
                  background:
                    'color-mix(in srgb, var(--positive, #22c55e) 12%, transparent)',
                }}
              >
                <Check
                  size={9}
                  style={{ color: 'var(--positive, #22c55e)' }}
                />
              </div>

              <span
                className="text-[8px]"
                style={{ color: 'var(--muted-foreground)' }}
              >
                {item}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute left-0 bottom-0 w-12 h-12 rounded-2xl flex items-center justify-center"
        style={{
          background:
            'color-mix(in srgb, var(--primary) 12%, var(--card))',
          border: '1px solid color-mix(in srgb, var(--primary) 25%, var(--border))',
        }}
      >
        <ShieldCheck size={21} style={{ color: 'var(--primary)' }} />
      </motion.div>
    </div>
  );
}

function SlideVisual({ id }: { id: string }) {
  if (id === 'rewards') return <RewardsVisual />;
  if (id === 'swap') return <SwapVisual />;
  if (id === 'buy') return <BuyVisual />;
  return <KycVisual />;
}

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
    const interval = window.setInterval(() => {
      if (!paused.current) {
        setActiveIndex((current) => (current + 1) % N);
      }
    }, AUTO_MS);

    return () => window.clearInterval(interval);
  }, []);

  const handleTouchStart = (event: React.TouchEvent) => {
    paused.current = true;
    dragged.current = false;
    touchStartX.current = event.touches[0].clientX;
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    paused.current = false;

    if (touchStartX.current === null) return;

    const deltaX = event.changedTouches[0].clientX - touchStartX.current;

    touchStartX.current = null;

    if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;

    dragged.current = true;

    if (deltaX < 0) next();
    else previous();
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

    if (deltaX < 0) next();
    else previous();
  };

  const handleMouseLeave = () => {
    mouseStartX.current = null;
    paused.current = false;
  };

  const handleSlideClick = (slide: PromoSlide) => {
    if (dragged.current) {
      dragged.current = false;
      return;
    }

    if (slide.screen) {
      onNavigate(slide.screen);
    }
  };

  return (
    <section className="px-5 mb-6" aria-label="Convia promotions">
      <div
        className="relative overflow-hidden rounded-[24px] select-none touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{
          border: '1px solid var(--border)',
          background: 'var(--card)',
          boxShadow: '0 14px 40px rgba(0, 0, 0, 0.10)',
        }}
      >
        {/* Ambient background */}
        <div
          className="pointer-events-none absolute -right-20 -top-24 w-64 h-64 rounded-full blur-3xl opacity-20"
          style={{
            background: SLIDES[activeIndex].accent,
          }}
        />

        <div
          className="pointer-events-none absolute -left-24 -bottom-28 w-56 h-56 rounded-full blur-3xl opacity-10"
          style={{
            background: SLIDES[activeIndex].accent,
          }}
        />

        {/* Slides */}
        <motion.div
          className="flex"
          animate={{
            x: `${-(activeIndex * 100) / N}%`,
          }}
          transition={{
            type: 'spring',
            stiffness: 280,
            damping: 30,
            mass: 0.8,
          }}
          style={{
            width: `${N * 100}%`,
          }}
        >
          {SLIDES.map((slide, index) => {
            const Icon = slide.Icon;
            const isActive = index === activeIndex;

            return (
              <button
                key={slide.id}
                type="button"
                onClick={() => handleSlideClick(slide)}
                className="relative text-left shrink-0 overflow-hidden group"
                style={{
                  width: `${100 / N}%`,
                  minWidth: `${100 / N}%`,
                  boxSizing: 'border-box',
                  WebkitTapHighlightColor: 'transparent',
                }}
                aria-label={`${slide.title} ${slide.highlight}`}
              >
                <div className="relative min-h-[188px] sm:min-h-[205px] px-5 py-5 sm:px-6 sm:py-6">
                  {/* Top row */}
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <motion.div
                        initial={false}
                        animate={{
                          scale: isActive ? 1 : 0.95,
                          opacity: isActive ? 1 : 0.75,
                        }}
                        className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{
                          background: `color-mix(in srgb, ${slide.accent} 12%, transparent)`,
                          border: `1px solid color-mix(in srgb, ${slide.accent} 18%, var(--border))`,
                        }}
                      >
                        <Icon
                          size={15}
                          strokeWidth={2.1}
                          style={{ color: slide.accent }}
                        />
                      </motion.div>

                      <span
                        className="text-[9px] sm:text-[10px] font-bold tracking-[0.13em]"
                        style={{
                          color: 'var(--muted-foreground)',
                        }}
                      >
                        {slide.eyebrow}
                      </span>
                    </div>

                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity"
                      style={{
                        border: '1px solid var(--border)',
                        background: 'color-mix(in srgb, var(--card) 60%, transparent)',
                      }}
                    >
                      <ArrowUpRight
                        size={13}
                        style={{ color: 'var(--foreground)' }}
                      />
                    </div>
                  </div>

                  {/* Main content */}
                  <div className="relative z-10 mt-4 sm:mt-5 max-w-[58%] sm:max-w-[61%]">
                    <h3
                      className="text-[21px] sm:text-[25px] leading-[1.05] tracking-[-0.035em] font-bold"
                      style={{ color: 'var(--foreground)' }}
                    >
                      {slide.title}
                      <br />
                      <span
                        style={{
                          color: slide.accent,
                        }}
                      >
                        {slide.highlight}
                      </span>
                    </h3>

                    <p
                      className="mt-2.5 text-[11px] sm:text-[12px] leading-[1.45]"
                      style={{
                        color: 'var(--muted-foreground)',
                      }}
                    >
                      {slide.body}
                    </p>

                    <div className="mt-4 inline-flex items-center gap-1.5">
                      <span
                        className="text-[10px] sm:text-[11px] font-bold"
                        style={{
                          color: 'var(--foreground)',
                        }}
                      >
                        Explore
                      </span>

                      <ChevronRight
                        size={13}
                        className="transition-transform group-hover:translate-x-0.5"
                        style={{
                          color: 'var(--foreground)',
                        }}
                      />
                    </div>
                  </div>

                  {/* Product visual */}
                  <div className="absolute right-3 sm:right-6 bottom-4 sm:bottom-5 z-[2]">
                    <SlideVisual id={slide.id} />
                  </div>

                  {/* Bottom fade */}
                  <div
                    className="absolute inset-x-0 bottom-0 h-16 pointer-events-none"
                    style={{
                      background:
                        'linear-gradient(to top, color-mix(in srgb, var(--card) 35%, transparent), transparent)',
                    }}
                  />
                </div>
              </button>
            );
          })}
        </motion.div>

        {/* Slide controls */}
        <div className="absolute left-5 sm:left-6 bottom-4 z-20 flex items-center gap-1.5">
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
                  width: active ? 22 : 5,
                  height: 4,
                  background: active
                    ? 'var(--foreground)'
                    : 'color-mix(in srgb, var(--foreground) 22%, transparent)',
                }}
              />
            );
          })}
        </div>

        {/* Progress line */}
        <motion.div
          key={activeIndex}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{
            duration: AUTO_MS / 1000,
            ease: 'linear',
          }}
          className="absolute left-0 bottom-0 h-[2px] w-full origin-left pointer-events-none"
          style={{
            background: SLIDES[activeIndex].accent,
            opacity: 0.7,
          }}
        />

        {/* Enterprise-style corner detail */}
        <div
          className="absolute right-0 bottom-0 w-24 h-24 pointer-events-none opacity-[0.035]"
          style={{
            background: `radial-gradient(circle at bottom right, ${SLIDES[activeIndex].accent}, transparent 70%)`,
          }}
        />
      </div>
    </section>
  );
}