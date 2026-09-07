import { useCallback, useEffect, useState } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { ChevronRight, Gift, ArrowLeftRight, Zap, Shield } from 'lucide-react';
import type { Screen } from '../../../shared/data/mockData';

const SLIDES = [
  {
    id: 'rewards',
    title: 'Earn rewards',
    body: 'Invite friends and complete tasks for Convia points.',
    Icon: Gift,
    accent: 'var(--primary)',
    screen: 'rewards' as Screen,
  },
  {
    id: 'swap',
    title: 'Instant swaps',
    body: 'Swap cryptocurrency in a few clicks.',
    Icon: ArrowLeftRight,
    accent: '#22c55e', // Hardcoded for consistent color-mix behavior
    screen: 'swap' as Screen,
  },
  {
    id: 'buy',
    title: 'Buy crypto',
    body: 'Fund with card or bank and start building.',
    Icon: Zap,
    accent: 'var(--foreground)',
    screen: 'onramp' as Screen,
  },
  {
    id: 'kyc',
    title: 'Verify once',
    body: 'Unlock higher limits with KYC verification.',
    Icon: Shield,
    accent: 'var(--primary)',
    screen: 'kyc' as Screen,
  },
];

const AUTO_MS = 6000;
const N = SLIDES.length;
const SWIPE_CONFIDENCE_THRESHOLD = 10000;

const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

interface Props {
  onNavigate: (s: Screen) => void;
}

export function PromoBanner({ onNavigate }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const paginate = useCallback((newDirection: number) => {
    setActiveIndex((prev) => (prev + newDirection + N) % N);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => paginate(1), AUTO_MS);
    return () => clearInterval(timer);
  }, [paginate, isPaused]);

  const handleDragEnd = (e: Event, { offset, velocity }: PanInfo) => {
    const swipe = swipePower(offset.x, velocity.x);
    if (swipe < -SWIPE_CONFIDENCE_THRESHOLD) {
      paginate(1);
    } else if (swipe > SWIPE_CONFIDENCE_THRESHOLD) {
      paginate(-1);
    }
  };

  return (
    <div 
      className="px-5 mb-6 group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div
        className="relative overflow-hidden rounded-2xl transition-shadow duration-300 shadow-sm hover:shadow-md"
        style={{
          border: '1px solid var(--border)',
          background: 'linear-gradient(180deg, var(--card) 0%, rgba(0,0,0,0.02) 100%)',
          backgroundColor: 'var(--card)'
        }}
      >
        <motion.div
          className="flex flex-nowrap cursor-grab active:cursor-grabbing"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragEnd={handleDragEnd}
          animate={{ x: `${-(activeIndex * 100) / N}%` }}
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30, opacity: 1 },
          }}
          style={{ width: `${N * 100}%` }}
        >
          {SLIDES.map((slide, idx) => {
            const Icon = slide.Icon;
            const isActive = idx === activeIndex;

            return (
              <button
                key={slide.id}
                type="button"
                aria-hidden={!isActive}
                tabIndex={isActive ? 0 : -1}
                onClick={() => slide.screen && onNavigate(slide.screen)}
                className="flex items-center gap-4 px-5 py-4 text-left shrink-0 outline-none transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                style={{
                  width: `${100 / N}%`,
                  minWidth: `${100 / N}%`,
                }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm"
                  style={{
                    backgroundColor: slide.accent.startsWith('var') 
                      ? 'var(--muted)' 
                      : `color-mix(in srgb, ${slide.accent} 15%, transparent)`,
                    color: slide.accent,
                  }}
                >
                  <Icon size={24} strokeWidth={2.2} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 
                    className="font-semibold truncate tracking-tight transition-colors duration-200"
                    style={{ color: 'var(--foreground)', fontSize: 15 }}
                  >
                    {slide.title}
                  </h3>
                  <p
                    className="truncate mt-0.5 opacity-80"
                    style={{ color: 'var(--muted-foreground)', fontSize: 13 }}
                  >
                    {slide.body}
                  </p>
                </div>
                
                <ChevronRight 
                  size={20} 
                  className="transition-transform duration-300 transform group-hover:translate-x-1"
                  style={{ color: 'var(--muted-foreground)' }} 
                />
              </button>
            );
          })}
        </motion.div>
      </div>

      {/* Enterprise Animated Pagination */}
      <div className="flex justify-center gap-2 mt-4" aria-hidden="true">
        {SLIDES.map((s, idx) => {
          const isActive = idx === activeIndex;
          return (
            <button
              key={s.id}
              type="button"
              aria-label={`Go to slide ${idx + 1}`}
              onClick={() => setActiveIndex(idx)}
              className="relative h-1.5 rounded-full overflow-hidden transition-all duration-300"
              style={{
                width: isActive ? 24 : 8,
                backgroundColor: 'var(--border)',
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute inset-0 rounded-full"
                  style={{ backgroundColor: 'var(--foreground)' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
