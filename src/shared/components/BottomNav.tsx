import { motion } from 'motion/react';
import { Home, ArrowLeftRight, Banknote, Compass } from 'lucide-react';
import type { Screen } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';

interface BottomNavProps {
  activeTab: Screen;
  onNavigate: (screen: Screen) => void;
  onSwap: () => void;
}

/**
 * Floating pill — Wallet · Swap · Pay · Explore
 * Account is reached from home avatar.
 */
export function BottomNav({ activeTab, onNavigate, onSwap }: BottomNavProps) {
  const { t } = useLanguage();

  const items: {
    id: string;
    label: string;
    icon: typeof Home;
    action: () => void;
    active: boolean;
  }[] = [
    {
      id: 'wallet',
      label: t('nav.home') || 'Home',
      icon: Home,
      action: () => onNavigate('home'),
      active: activeTab === 'home' || activeTab === 'wallet',
    },
    {
      id: 'swap',
      label: t('nav.swap') || 'Swap',
      icon: ArrowLeftRight,
      action: onSwap,
      active: activeTab === 'swap',
    },
    {
      id: 'pay',
      label: 'Pay',
      icon: Banknote,
      action: () => onNavigate('pay-hub'),
      active: activeTab === 'pay-hub' || activeTab === 'airtime' || activeTab === 'data' || activeTab === 'electricity' || activeTab === 'tv' || activeTab === 'betting',
    },
    {
      id: 'explore',
      label: 'Explore',
      icon: Compass,
      action: () => onNavigate('explore'),
      active: activeTab === 'explore',
    },
  ];

  return (
    <div
      className="pointer-events-none absolute bottom-0 left-0 right-0 z-40 flex justify-center"
      style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
    >
      <nav
        className="pointer-events-auto relative flex items-center justify-between gap-0.5 px-1.5 py-2"
        style={{
          width: 'min(92%, 380px)',
          height: 64,
          borderRadius: 999,
          background: 'var(--liquid-bar-bg)',
          border: '1px solid var(--liquid-bar-border)',
          boxShadow: 'var(--liquid-bar-shadow)',
          backdropFilter: 'blur(28px) saturate(180%)',
          WebkitBackdropFilter: 'blur(28px) saturate(180%)',
        }}
        aria-label="Main"
      >
        {items.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.active;
          return (
            <motion.button
              key={tab.id}
              type="button"
              onClick={tab.action}
              whileTap={{ scale: 0.92 }}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
              className="relative flex flex-1 flex-col items-center justify-center gap-0.5 min-w-0 h-full rounded-full"
              style={{ zIndex: 1 }}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-liquid"
                  className="absolute inset-y-1 inset-x-1 rounded-full"
                  style={{
                    background: 'var(--liquid-active-bg)',
                    border: '1px solid var(--liquid-active-border)',
                    boxShadow: 'var(--liquid-active-shadow)',
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative z-[1] flex flex-col items-center gap-0.5 pt-0.5">
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.35 : 1.9}
                  style={{
                    color: isActive ? 'var(--liquid-icon-active)' : 'var(--liquid-icon-idle)',
                  }}
                />
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? 'var(--liquid-icon-active)' : 'var(--liquid-icon-idle)',
                  }}
                >
                  {tab.label}
                </span>
              </span>
            </motion.button>
          );
        })}
      </nav>
    </div>
  );
}
