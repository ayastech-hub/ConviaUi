import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeftRight,
  ArrowUpRight,
  CheckCircle2,
  Gift,
  ShieldCheck,
  Sparkles,
  Wallet,
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
    title: 'Fund your wallet',
    description: 'Buy crypto with card or bank.',
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
const SWIPE_DISTANCE = 45;

interface Props {
  onNavigate: (screen: Screen) => void;
}

/* -------------------------------------------------------------------------- */
/* Focal visuals                                                              */
/* -------------------------------------------------------------------------- */

function RewardsArt({ accent }: { accent: string }) {
  return (
    <div className="relative w-[112px] h-[100px]" aria-hidden="true">
      <motion.div
        animate={{
          rotate: [-5, 3, -5],
          y: [0, -3, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute right-0 top-1 w-[76px] h-[76px] rounded-full flex items-center justify-center"
        style={{
          background: `color-mix(in srgb, ${accent} 18%, var(--card))`,
          border: `1px solid color-mix(in srgb, ${accent} 35%, var(--border))`,
          boxShadow: `0 12px 35px color-mix(in srgb, ${accent} 22%, transparent)`,
        }}
      >
        <div
          className="w-[58px] h-[58px] rounded-full flex items-center justify-center"
          style={{
            background: `color-mix(in srgb, ${accent} 25%, var(--card))`,
          }}
        >
          <Gift
            size={26}
            strokeWidth={1.8}
            style={{ color: accent }}
          />
        </div>
      </motion.div>

      <motion.div
        animate={{
          y: [0, -5, 0],
          rotate: [3, -2, 3],
        }}
        transition={{
          duration: 3.2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute left-0 bottom-1 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          boxShadow: '0 8px 20px rgba(0,0,0,.16)',
        }}
      >
        <Sparkles size={10} style={{ color: accent }} />

        <span
          className="text-[8px] font-bold"
          style={{ color: 'var(--foreground)' }}
        >
          +250 pts
        </span>
      </motion.div>
    </div>
  );
}

function SwapArt({ accent }: { accent: string }) {
  return (
    <div className="relative w-[112px] h-[100px]" aria-hidden="true">
      <motion.div
        animate={{ rotate: [0, 4, 0] }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute right-0 top-0 w-[72px] h-[72px] rounded-2xl flex items-center justify-center"
        style={{
          background: `color-mix(in srgb, ${accent} 13%, var(--card))`,
          border: `1px solid color-mix(in srgb, ${accent} 28%, var(--border))`,
          boxShadow: `0 12px 35px color-mix(in srgb, ${accent} 18%, transparent)`,
        }}
      >
        <div className="flex items-center gap-1.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-[8px] font-bold"
            style={{
              background: 'var(--muted)',
              color: 'var(--foreground)',
            }}
          >
            ETH
          </div>

          <ArrowLeftRight
            size={13}
            style={{ color: accent }}
          />

          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-[7px] font-bold"
            style={{
              background: 'var(--muted)',
              color: 'var(--foreground)',
            }}
          >
            USDC
          </div>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 4, 0] }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute left-0 bottom-1 w-9 h-9 rounded-xl flex items-center justify-center"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          boxShadow: '0 8px 20px rgba(0,0,0,.16)',
        }}
      >
        <ArrowUpRight
          size={15}
          style={{ color: accent }}
        />
      </motion.div>
    </div>
  );
}

function BuyArt({ accent }: { accent: string }) {
  return (
    <div className="relative w-[112px] h-[100px]" aria-hidden="true">
      <motion.div
        animate={{
          y: [0, -4, 0],
          rotate: [-2, 2, -2],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute right-0 top-0 w-[82px] h-[72px] rounded-2xl p-3"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          boxShadow: '0 12px 35px rgba(0,0,0,.18)',
        }}
      >
        <div className="flex items-center justify-between">
          <Wallet
            size={15}
            style={{ color: accent }}
          />

          <span
            className="text-[7px] font-bold"
            style={{ color: 'var(--muted-foreground)' }}
          >
            WALLET
          </span>
        </div>

        <div
          className="mt-3 text-[15px] font-bold tracking-tight"
          style={{ color: 'var(--foreground)' }}
        >
          $4,820
        </div>

        <div
          className="mt-2 h-1 rounded-full"
          style={{ background: 'var(--muted)' }}
        >
          <div
            className="h-full w-[72%] rounded-full"
            style={{ background: accent }}
          />
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 4, 0] }}
        transition={{
          duration: 3.2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute left-0 bottom-1 w-10 h-10 rounded-xl flex items-center justify-center"
        style={{
          background: `color-mix(in srgb, ${accent} 12%, var(--card))`,
          border: '1px solid var(--border)',
        }}
      >
        <Zap
          size={17}
          style={{ color: accent }}
        />
      </motion.div>
    </div>
  );
}

function KycArt({ accent }: { accent: string }) {
  return (
    <div className="relative w-[112px] h-[100px]" aria-hidden="true">
      <motion.div
        animate={{
          y: [0, -4, 0],
          scale: [1, 1.015, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute right-0 top-0 w-[78px] h-[78px] rounded-full flex items-center justify-center"
        style={{
          background: `color-mix(in srgb, ${accent} 12%, var(--card))`,
          border: `1px solid color-mix(in srgb, ${accent} 28%, var(--border))`,
          boxShadow: `0 12px 35px color-mix(in srgb, ${accent} 18%, transparent)`,
        }}
      >
        <ShieldCheck
          size={34}
          strokeWidth={1.7}
          style={{ color: accent }}
        />
      </motion.div>

      <motion.div
        animate={{ y: [0, 4, 0] }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute left-0 bottom-1 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          boxShadow: '0 8px 20px rgba(0,0,0,.16)',
        }}
      >
        <CheckCircle2
          size={11}
          style={{ color: 'var(--positive, #22c55e)' }}
        />

        <span
          className="text-[8px] font-bold"
          style={{ color: 'var(--foreground)' }}
        >
          Verified
        </span>
      </motion.div>
    </div>
  );
}

function PromoArt({
  slide,
}: {
  slide: PromoSlide;
}) {
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
/* Banner                                                                     */
/* -------------------------------------------------------------------------- */

export function PromoBanner({ onNavigate }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  const touchStart = useRef<number | null>(null);
  const mouseStart = useRef<number | null>(null);
  const paused = useRef(false);
  const dragged = useRef(false);

  const goTo = useCallback((index: number) => {
    setActiveIndex(((index % SLIDES.length) + SLIDES.length) % SLIDES.length);
  }, []);

  const next = useCallback(() => {
    setActiveIndex((current) => (current + 1) % SLIDES.length);
  }, []);

  const previous = useCallback(() => {
    setActiveIndex(
      (current) => (current - 1 + SLIDES.length) % SLIDES.length,
    );
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!paused.current) {
        setActiveIndex((current) => (current + 1) % SLIDES.length);
      }
    }, AUTO_ADVANCE_MS);

    return () => window.clearInterval(timer);
  }, []);

  const onTouchStart = (event: React.TouchEvent) => {
    paused.current = true;
    dragged.current = false;
    touchStart.current = event.touches[0].clientX;
  };

  const onTouchEnd = (event: React.TouchEvent) => {
    paused.current = false;

    if (touchStart.current === null) return;

    const distance =
      event.changedTouches[0].clientX - touchStart.current;

    touchStart.current = null;

    if (Math.abs(distance) < SWIPE_DISTANCE) return;

    dragged.current = true;

    if (distance < 0) {
      next();
    } else {
      previous();
    };
  };

  const onMouseDown = (event: React.MouseEvent) => {
    paused.current = true;
    dragged.current = false;
    mouseStart.current = event.clientX;
  };

  const onMouseUp = (event: React.MouseEvent) => {
    paused.current = false;

    if (mouseStart.current === null) return;

    const distance = event.clientX - mouseStart.current;

    mouseStart.current = null;

    if (Math.abs(distance) < SWIPE_DISTANCE) return;

    dragged.current = true;

    if (distance < 0) {
      next();
    } else {
      previous();
    }
  };

  const onMouseLeave = () => {
    mouseStart.current = null;
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

  const slide = SLIDES[activeIndex];

  return (
    <div className="px-5 mb-4">
      <div
        className="relative overflow-hidden rounded-[20px] select-none"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        style={{
          height: '122px',
          background: 'var(--card)',
          border: '1px solid var(--border)',
          boxShadow: '0 6px 20px rgba(0,0,0,.07)',
        }}
      >
        {/* Accent atmosphere */}
        <motion.div
          key={slide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute -right-16 -top-20 w-[190px] h-[190px] rounded-full blur-3xl pointer-events-none"
          style={{
            background: slide.accent,
            opacity: 0.08,
          }}
        />

        {/* Content track */}
        <motion.div
          className="relative z-10 flex h-full"
          animate={{
            x: `${-(activeIndex * 100) / SLIDES.length}%`,
          }}
          transition={{
            type: 'spring',
            stiffness: 330,
            damping: 32,
            mass: 0.8,
          }}
          style={{
            width: `${SLIDES.length * 100}%`,
          }}
        >
          {SLIDES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleClick(item)}
              className="relative h-full shrink-0 text-left"
              style={{
                width: `${100 / SLIDES.length}%`,
                minWidth: `${100 / SLIDES.length}%`,
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <div className="relative h-full px-4 py-3.5">
                {/* Copy */}
                <div className="relative z-10 w-[58%]">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="text-[7px] font-bold tracking-[0.12em]"
                      style={{
                        color: item.accent,
                      }}
                    >
                      {item.label}
                    </span>
                  </div>

                  <h3
                    className="mt-1.5 text-[17px] leading-[1.08] tracking-[-0.025em] font-bold"
                    style={{
                      color: 'var(--foreground)',
                    }}
                  >
                    {item.title}
                  </h3>

                  <p
                    className="mt-1 text-[8px] leading-[1.35] max-w-[175px]"
                    style={{
                      color: 'var(--muted-foreground)',
                    }}
                  >
                    {item.description}
                  </p>

                  <div className="mt-2 flex items-center gap-1">
                    <span
                      className="text-[8px] font-bold"
                      style={{
                        color: 'var(--foreground)',
                      }}
                    >
                      Explore
                    </span>

                    <ArrowUpRight
                      size={9}
                      style={{
                        color: 'var(--foreground)',
                      }}
                    />
                  </div>
                </div>

                {/* Artwork */}
                <div className="absolute right-3 top-3">
                  <PromoArt slide={item} />
                </div>
              </div>
            </button>
          ))}
        </motion.div>

        {/* Pagination */}
        <div className="absolute left-4 bottom-2.5 z-30 flex items-center gap-1">
          {SLIDES.map((item, index) => {
            const active = index === activeIndex;

            return (
              <button
                key={item.id}
                type="button"
                aria-label={`Show ${item.label}`}
                aria-current={active ? 'true' : undefined}
                onClick={(event) => {
                  event.stopPropagation();
                  goTo(index);
                }}
                className="p-0 rounded-full transition-all duration-300"
                style={{
                  width: active ? 15 : 4,
                  height: 3,
                  background: active
                    ? 'var(--foreground)'
                    : 'color-mix(in srgb, var(--foreground) 18%, transparent)',
                }}
              />
            );
          })}
        </div>

        {/* Auto progress */}
        <motion.div
          key={`progress-${activeIndex}`}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{
            duration: AUTO_ADVANCE_MS / 1000,
            ease: 'linear',
          }}
          className="absolute bottom-0 left-0 h-[1.5px] w-full origin-left z-30"
          style={{
            background: slide.accent,
            opacity: 0.7,
          }}
        />
      </div>
    </div>
  );
}