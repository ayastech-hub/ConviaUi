import { motion } from 'motion/react';
import {
  Home,
  Wallet,
  User,
  ArrowLeftRight,
  Grid3x3,
} from 'lucide-react';
import type { Screen } from '../data/mockData';

interface BottomNavProps {
  activeTab: Screen;
  onNavigate: (screen: Screen) => void;
  onSwap: () => void;
}

const tabs = [
  { id: 'home' as Screen, label: 'Home', icon: Home },
  { id: 'wallet' as Screen, label: 'Wallet', icon: Wallet },
  { id: 'profile' as Screen, label: 'Profile', icon: User },
];

export function BottomNav({
  activeTab,
  onNavigate,
  onSwap,
}: BottomNavProps) {
  const leftTabs = tabs.slice(0, 2);
  const rightTabs = tabs.slice(2);

  const renderTab = (tab: typeof tabs[number]) => {
    const Icon = tab.icon;
    const isActive = activeTab === tab.id;

    return (
      <motion.button
        key={tab.id}
        type="button"
        whileTap={{ scale: 0.92 }}
        onClick={() => onNavigate(tab.id)}
        aria-label={tab.label}
        className="relative flex h-full flex-1 flex-col items-center justify-center gap-1"
      >
        {/* Active glow / pill */}
        {isActive && (
          <motion.div
            layoutId="activeNav"
            transition={{
              type: 'spring',
              stiffness: 420,
              damping: 30,
            }}
            className="absolute top-2 h-8 w-12 rounded-2xl"
            style={{
              background:
                'color-mix(in srgb, var(--accent) 13%, transparent)',
            }}
          />
        )}

        {/* Active top indicator */}
        {isActive && (
          <motion.div
            layoutId="activeDot"
            className="absolute top-0.5 h-1 w-5 rounded-full"
            style={{
              background: 'var(--accent)',
              boxShadow: '0 0 12px color-mix(in srgb, var(--accent) 65%, transparent)',
            }}
          />
        )}

        <motion.div
          animate={{
            y: isActive ? -1 : 0,
            scale: isActive ? 1.04 : 1,
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 25,
          }}
          className="relative z-10"
        >
          <Icon
            size={21}
            strokeWidth={isActive ? 2.2 : 1.7}
            style={{
              color: isActive
                ? 'var(--foreground)'
                : 'var(--muted-foreground)',
            }}
          />
        </motion.div>

        <motion.span
          animate={{
            y: isActive ? -1 : 0,
            opacity: isActive ? 1 : 0.72,
          }}
          className="relative z-10 text-[10px] tracking-[0.01em]"
          style={{
            color: isActive
              ? 'var(--foreground)'
              : 'var(--muted-foreground)',
            fontWeight: isActive ? 650 : 450,
          }}
        >
          {tab.label}
        </motion.span>
      </motion.button>
    );
  };

  return (
    <nav
      className="absolute bottom-0 left-0 right-0 z-50 px-3 pb-3"
      aria-label="Main navigation"
    >
      <div
        className="relative flex h-[68px] items-center overflow-visible rounded-[26px] px-1.5"
        style={{
          background:
            'color-mix(in srgb, var(--background) 88%, transparent)',
          border: '1px solid color-mix(in srgb, var(--border) 75%, transparent)',
          boxShadow:
            '0 12px 40px color-mix(in srgb, var(--foreground) 8%, transparent), inset 0 1px 0 color-mix(in srgb, white 7%, transparent)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
      >
        {/* Left */}
        {leftTabs.map(renderTab)}

        {/* Center action */}
        <div className="relative flex h-full w-[76px] shrink-0 items-center justify-center">
          <motion.button
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onNavigate('services')}
            aria-label="Services"
            className="relative -mt-7 flex h-[54px] w-[54px] items-center justify-center rounded-[20px]"
            style={{
              background: 'var(--foreground)',
              color: 'var(--background)',
              boxShadow:
                '0 10px 28px color-mix(in srgb, var(--foreground) 20%, transparent)',
            }}
          >
            {/* Inner highlight */}
            <div
              className="absolute inset-[1px] rounded-[19px]"
              style={{
                border:
                  '1px solid color-mix(in srgb, var(--background) 12%, transparent)',
              }}
            />

            <motion.div
              animate={{ rotate: 0 }}
              whileHover={{ rotate: 45 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 20,
              }}
            >
              <Grid3x3 size={21} strokeWidth={2} />
            </motion.div>
          </motion.button>

          <span
            className="absolute bottom-[7px] text-[10px] tracking-wide"
            style={{
              color: 'var(--muted-foreground)',
              fontWeight: 450,
            }}
          >
            Services
          </span>
        </div>

        {/* Swap */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={onSwap}
          aria-label="Swap"
          className="relative flex h-full flex-1 flex-col items-center justify-center gap-1"
        >
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{
              type: 'spring',
              stiffness: 250,
              damping: 18,
            }}
          >
            <ArrowLeftRight
              size={21}
              strokeWidth={1.7}
              style={{ color: 'var(--muted-foreground)' }}
            />
          </motion.div>

          <span
            className="text-[10px] tracking-[0.01em]"
            style={{
              color: 'var(--muted-foreground)',
              fontWeight: 450,
            }}
          >
            Swap
          </span>
        </motion.button>

        {/* Right */}
        {rightTabs.map(renderTab)}
      </div>
    </nav>
  );
}