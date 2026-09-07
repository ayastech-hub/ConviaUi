import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeftRight,
  ArrowUpRight,
  CheckCircle2,
  Gift,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import type { Screen } from '../../../shared/data/mockData';

type PromoSlide = {
  id: string;
  label: string;
  title: string;
  description: string;
  Icon: typeof Gift;
  accent: string;
  screen?: Screen;
};

const SLIDES: PromoSlide[] = [
  {
    id: 'rewards',
    label: 'CONVIA REWARDS',
    title: 'Earn more points',
    description: 'Invite friends and complete tasks.',
    Icon: Gift,
    accent: 'var(--primary)',
    screen: 'rewards',
  },
  {
    id: 'swap',
    label: 'INSTANT SWAP',
    title: 'Swap in seconds',
    description: 'Move between supported assets.',
    Icon: ArrowLeftRight,
    accent: 'var(--positive, #22c55e)',
    screen: 'swap',
  },
  {
    id: 'buy',
    label: 'BUY CRYPTO',
    title: 'Buy crypto easily',
    description: 'Fast and simple funding.',
    Icon: Zap,
    accent: 'var(--foreground)',
    screen: 'onramp',
  },
  {
    id: 'kyc',
    label: 'ACCOUNT SECURITY',
    title: 'Get verified',
    description: 'Unlock higher limits and features.',
    Icon: ShieldCheck,
    accent: 'var(--primary)',
    screen: 'kyc',
  },
];

const AUTO_ADVANCE_MS = 5000;
const SWIPE_DISTANCE = 40;
const N = SLIDES.length;

/* -------------------------------------------------------------------------- */
/* Small decorative artwork                                                   */
/* -------------------------------------------------------------------------- */

function RewardsArt({ accent }: { accent: string }) {
  return (
    <div
      className="relative w-[76px] h-[62px]"
      aria-hidden="true"
    >
      <motion.div
        animate={{
          y: [0, -3, 0],
          rotate: [-4, 3, -4],
        }}
        transition={{
          duration: 3.8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute right-0 top-0 w-[54px] h-[54px] rounded-full flex items-center justify-center"
        style={{
          background: `color-mix(in srgb, ${accent} 16%, var(--card))`,
          border: `1px solid color-mix(in srgb, ${accent} 30%, var(--border))`,
          boxShadow: `0 8px 24px color-mix(in srgb, ${accent} 18%, transparent)`,
        }}
      >
        <Gift
          size={21}
          strokeWidth={1.8}
          style={{ color: accent }}
        />
      </motion.div>

      <motion.div
        animate={{
          y: [0, 3, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute left-0 bottom-0 flex items-center gap-1 px-2 py-1 rounded-md"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          boxShadow: '0 5px 14px rgba(0,0,0,.14)',
        }}
      >
        <Sparkles
          size={8}
          style={{ color: accent }}
        />

        <span
          className="text-[6px] font-bold"
          style={{ color: 'var(--foreground)' }}
        >
          +POINTS
        </span>
      </motion.div>
    </div>
  );
}

function SwapArt({ accent }: { accent: string }) {
  return (
    <div
      className="relative w-[78px] h-[62px]"
      aria-hidden="true"
    >
      <motion.div
        animate={{
          y: [0, -3, 0],
          rotate: [0, 3, 0],
        }}
        transition={{
          duration: 3.8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute right-0 top-0 w-[58px] h-[52px] rounded-xl flex items-center justify-center"
        style={{
          background: `color-mix(in srgb, ${accent} 10%, var(--card))`,
          border: `1px solid color-mix(in srgb, ${accent} 26%, var(--border))`,
          boxShadow: `0 8px 24px color-mix(in srgb, ${accent} 14%, transparent)`,
        }}
      >
        <div className="flex items-center gap-1">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-[5px] font-bold"
            style={{
              background: 'var(--muted)',
              color: 'var(--foreground)',
            }}
          >
            ETH
          </div>

          <ArrowLeftRight
            size={10}
            style={{ color: accent }}
          />

          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-[5px] font-bold"
            style={{
              background: 'var(--muted)',
              color: 'var(--foreground)',
            }}
          >
            USDC
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function BuyArt({ accent }: { accent: string }) {
  return (
    <div
      className="relative w-[76px] h-[62px]"
      aria-hidden="true"
    >
      <motion.div
        animate={{
          y: [0, -3, 0],
          rotate: [-2, 2, -2],
        }}
        transition={{
          duration: 3.8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute right-0 top-0 w-[55px] h-[53px] rounded-xl flex items-center justify-center"
        style={{
          background: `color-mix(in srgb, ${accent} 9%, var(--card))`,
          border: '1px solid var(--border)',
          boxShadow: '0 8px 24px rgba(0,0,0,.14)',
        }}
      >
        <Zap
          size={25}
          strokeWidth={1.7}
          style={{ color: accent }}
        />
      </motion.div>

      <motion.div
        animate={{
          y: [0, 3, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute left-0 bottom-0 w-7 h-7 rounded-lg flex items-center justify-center"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
        }}
      >
        <ArrowUpRight
          size={12}
          style={{ color: accent }}
        />
      </motion.div>
    </div>
  );
}

function KycArt({ accent }: { accent: string }) {
  return (
    <div
      className="relative w-[76px] h-[62px]"
      aria-hidden="true"
    >
      <motion.div
        animate={{
          y: [0, -3, 0],
          scale: [1, 1.03, 1],
        }}
        transition={{
          duration: 3.8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute right-0 top-0 w-[55px] h-[55px] rounded-full flex items-center justify-center"
        style={{
          background: `color-mix(in srgb, ${accent} 12%, var(--card))`,
          border: `1px solid color-mix(in srgb, ${accent} 28%, var(--border))`,
          boxShadow: `0 8px 24px color-mix(in srgb, ${accent} 17%, transparent)`,
        }}
      >
        <ShieldCheck
          size={25}
          strokeWidth={1.7}
          style={{ color: accent }}
        />
      </motion.div>

      <motion.div
        animate={{
          y: [0, 3, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute left-0 bottom-0 flex items-center gap-1 px-2 py-1 rounded-md"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          boxShadow: '0 5px 14px rgba(0,0,0,.14)',
        }}
      >
        <CheckCircle2
          size={8}
          style={{
            color: 'var(--positive, #22c55e)',
          }}
        />

        <span
          className="text-[6px] font-bold"
          style={{ color: 'var(--foreground)' }}
        >
          VERIFIED
        </span>
      </motion.div>
    </div>
  );
}

function PromoArt({ slide }: { slide: PromoSlide }) {
  switch (slide.id) {
    case 'rewards':
      return <RewardsArt accent={slide.accent} />;

    case 'swap':
      return <SwapArt accent={slide.accent} />;

    case 'buy':
      return <BuyArt accent={slide.accent} />;

    case 'kyc':
      return <KycArt accent={slide.accent} />;

    default:
      return null;
  }
}

/* -------------------------------------------------------------------------- */
/* Promo Banner                                                               */
/* -------------------------------------------------------------------------- */

interface Props {
  onNavigate: (screen: Screen) => void;
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

  /* Auto advance */
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!paused.current) {
        setActiveIndex((current) => (current + 1) % N);
      }
    }, AUTO_ADVANCE_MS);

    return () => window.clearInterval(timer);
  }, []);

  /* Touch */
  const handleTouchStart = (event: React.TouchEvent) => {
    paused.current = true;
    dragged.current = false;

    touchStartX.current = event.touches[0].clientX;
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    paused.current = false;

    if (touchStartX.current === null) return;

    const distance =
      event.changedTouches[0].clientX - touchStartX.current;

    touchStartX.current = null;

    if (Math.abs(distance) < SWIPE_DISTANCE) return;

    dragged.current = true;

    if (distance < 0) {
      next();
    } else {
      previous();
    }
  };

  /* Mouse support for desktop/testing */
  const handleMouseDown = (event: React.MouseEvent) => {
    paused.current = true;
    dragged.current = false;

    mouseStartX.current = event.clientX;
  };

  const handleMouseUp = (event: React.MouseEvent) => {
    paused.current = false;

    if (mouseStartX.current === null) return;

    const distance = event.clientX - mouseStartX.current;

    mouseStartX.current = null;

    if (Math.abs(distance) < SWIPE_DISTANCE) return;

    dragged.current = true;

    if (distance < 0) {
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

  const activeSlide = SLIDES[activeIndex];

  return (
    <div className="px-5 mb-4">
      <div
        className="relative overflow-hidden rounded-[17px] select-none touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{
          height: '92px',
          background: 'var(--card)',
          border: '1px solid var(--border)',
          boxShadow: '0 5px 18px rgba(0,0,0,.06)',
        }}
      >
        {/* Extremely subtle ambient light */}
        <motion.div
          key={activeSlide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute pointer-events-none -right-14 -top-16 w-[150px] h-[150px] rounded-full blur-3xl"
          style={{
            background: activeSlide.accent,
            opacity: 0.07,
          }}
        />

        {/* Slide track */}
        <motion.div
          className="relative z-10 flex h-full"
          animate={{
            x: `${-(activeIndex * 100) / N}%`,
          }}
          transition={{
            type: 'spring',
            stiffness: 330,
            damping: 32,
            mass: 0.8,
          }}
          style={{
            width: `${N * 100}%`,
          }}
        >
          {SLIDES.map((slide) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => handleClick(slide)}
              className="relative h-full shrink-0 text-left"
              style={{
                width: `${100 / N}%`,
                minWidth: `${100 / N}%`,
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <div className="relative h-full px-4 py-2.5">
                {/* Text */}
                <div className="relative z-10 w-[62%]">
                  <div
                    className="text-[6px] font-bold tracking-[0.13em]"
                    style={{
                      color: slide.accent,
                    }}
                  >
                    {slide.label}
                  </div>

                  <h3
                    className="mt-1 text-[14px] leading-[1.05] tracking-[-0.02em] font-bold"
                    style={{
                      color: 'var(--foreground)',
                    }}
                  >
                    {slide.title}
                  </h3>

                  <p
                    className="mt-1 text-[7px] leading-[1.2] max-w-[170px]"
                    style={{
                      color: 'var(--muted-foreground)',
                    }}
                  >
                    {slide.description}
                  </p>

                  <div className="mt-1.5 flex items-center gap-0.5">
                    <span
                      className="text-[7px] font-bold"
                      style={{
                        color: 'var(--foreground)',
                      }}
                    >
                      Explore
                    </span>

                    <ArrowUpRight
                      size={8}
                      style={{
                        color: 'var(--foreground)',
                      }}
                    />
                  </div>
                </div>

                {/* Artwork */}
                <div className="absolute right-3 top-3">
                  <PromoArt slide={slide} />
                </div>
              </div>
            </button>
          ))}
        </motion.div>

        {/* Pagination */}
        <div className="absolute left-4 bottom-2 z-30 flex items-center gap-1">
          {SLIDES.map((slide, index) => {
            const active = index === activeIndex;

            return (
              <button
                key={slide.id}
                type="button"
                aria-label={`Show ${slide.label}`}
                aria-current={active ? 'true' : undefined}
                onClick={(event) => {
                  event.stopPropagation();
                  goTo(index);
                }}
                className="p-0 rounded-full transition-all duration-300"
                style={{
                  width: active ? 14 : 4,
                  height: 3,
                  background: active
                    ? 'var(--foreground)'
                    : 'color-mix(in srgb, var(--foreground) 18%, transparent)',
                }}
              />
            );
          })}
        </div>

        {/* Auto-progress */}
        <motion.div
          key={activeIndex}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{
            duration: AUTO_ADVANCE_MS / 1000,
            ease: 'linear',
          }}
          className="absolute bottom-0 left-0 z-30 h-[1.5px] w-full origin-left"
          style={{
            background: activeSlide.accent,
            opacity: 0.65,
          }}
        />
      </div>
    </div>
  );
}