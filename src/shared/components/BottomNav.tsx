import { motion } from 'motion/react';
import {
  Home,
  Wallet,
  User,
  ArrowLeftRight,
  Grid3x3,
} from 'lucide-react';
import type { Screen } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';

interface BottomNavProps {
  activeTab: Screen;
  onNavigate: (screen: Screen) => void;
  onSwap: () => void;
}

/**
 * Mobile bottom nav — layout must stay identical to design (rounded bar + center Services + Swap).
 * Only labels are translated; structure/CSS unchanged.
 */
export function BottomNav({
  activeTab,
  onNavigate,
  onSwap,
}: BottomNavProps) {
  const { t } = useLanguage();

  const tabs = [
    {
      id: 'home' as Screen,
      label: t('nav.home'),
      icon: Home,
    },
    {
      id: 'wallet' as Screen,
      label: t('nav.wallet'),
      icon: Wallet,
    },
    {
      id: 'profile' as Screen,
      label: t('nav.profile'),
      icon: User,
    },
  ];

  const leftTabs = tabs.slice(0, 2);
  const rightTabs = tabs.slice(2);

  const renderTab = (tab: (typeof tabs)[number]) => {
    const Icon = tab.icon;
    const isActive = activeTab === tab.id;

    return (
      <motion.button
        key={tab.id}
        type="button"
        onClick={() => onNavigate(tab.id)}
        whileTap={{ scale: 0.9 }}
        aria-label={tab.label}
        className="relative flex h-full flex-1 flex-col items-center justify-center gap-1"
      >
        {/* Active indicator */}
        {isActive && (
          <motion.div
            layoutId="bottom-nav-active"
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 30,
            }}
            className="absolute top-2 h-1 w-5 rounded-full"
            style={{
              background: 'var(--accent)',
            }}
          />
        )}

        <motion.div
          animate={{
            scale: isActive ? 1.05 : 1,
          }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 25,
          }}
        >
          <Icon
            size={22}
            strokeWidth={isActive ? 2.2 : 1.6}
            style={{
              color: isActive
                ? 'var(--foreground)'
                : 'var(--muted-foreground)',
            }}
          />
        </motion.div>

        <span
          className="text-[10px] tracking-wide"
          style={{
            color: isActive
              ? 'var(--foreground)'
              : 'var(--muted-foreground)',
            fontWeight: isActive ? 600 : 400,
          }}
        >
          {tab.label}
        </span>
      </motion.button>
    );
  };

  return (
    <div
      className="relative w-full"
      style={{
        height: 92,
      }}
    >
      {/* Navigation surface */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[76px] rounded-t-[28px]"
        style={{
          background: 'var(--background)',
          borderTop: '1px solid var(--border)',
        }}
      >
        <div className="flex h-full items-center px-3 pb-1">
          {/* Left side */}
          <div className="flex h-full flex-1">
            {leftTabs.map(renderTab)}
          </div>

          {/* Center space */}
          <div className="w-[76px] shrink-0" />

          {/* Right side */}
          <div className="flex h-full flex-1">
            {/* Swap */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={onSwap}
              aria-label={t('nav.swap')}
              className="flex h-full flex-1 flex-col items-center justify-center gap-1"
            >
              <ArrowLeftRight
                size={22}
                strokeWidth={1.6}
                style={{
                  color: 'var(--muted-foreground)',
                }}
              />

              <span
                className="text-[10px] tracking-wide"
                style={{
                  color: 'var(--muted-foreground)',
                  fontWeight: 400,
                }}
              >
                {t('nav.swap')}
              </span>
            </motion.button>

            {rightTabs.map(renderTab)}
          </div>
        </div>
      </div>

      {/* Floating center action */}
      <motion.button
        type="button"
        onClick={() => onNavigate('services')}
        whileTap={{ scale: 0.88 }}
        whileHover={{ scale: 1.04 }}
        aria-label={t('nav.services')}
        className="absolute left-1/2 top-0 z-10 flex h-[58px] w-[58px] -translate-x-1/2 items-center justify-center rounded-full"
        style={{
          background: 'var(--foreground)',
          color: 'var(--background)',
          border: '4px solid var(--background)',
        }}
      >
        <Grid3x3
          size={21}
          strokeWidth={2}
        />
      </motion.button>
    </div>
  );
}
