import { motion } from 'motion/react';
import {
  Wallet,
  ArrowLeftRight,
  Grid3x3,
  User,
} from 'lucide-react';
import type { Screen } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';

interface BottomNavProps {
  activeTab: Screen;
  onNavigate: (screen: Screen) => void;
  onSwap: () => void;
}

/**
 * Floating pill with liquid glass active indicator — light + dark via CSS vars.
 */
export function BottomNav({ activeTab, onNavigate, onSwap }: BottomNavProps) {
  const { t } = useLanguage();

  const items: {
    id: string;
    label: string;
    icon: typeof Wallet;
    action: () => void;
    active: boolean;
  }[] = [
    {
      id: 'wallet',
      label: t('nav.wallet') || 'Wallet',
      icon: Wallet,
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
      id: 'more',
      label: 'More',
      icon: Grid3x3,
      action: () => onNavigate('services'),
      active: activeTab === 'services',
    },
    {
      id: 'profile',
      label: t('nav.profile') || 'Profile',
      icon: User,
      action: () => onNavigate('profile'),
      active: activeTab === 'profile' || activeTab === 'settings' || activeTab === 'security',
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
              whileTap={{ scale: 0.9 }}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
              className="relative flex flex-col items-center justify-center gap-1 flex-1 min-w-0 h-full rounded-full z-[1]"
              style={{ background: 'transparent', paddingTop: 6, paddingBottom: 5 }}
            >
              {isActive && (
                <motion.span
                  layoutId="nav-liquid-glass"
                  className="absolute rounded-full pointer-events-none"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  style={{
                    top: 3,
                    bottom: 3,
                    left: 2,
                    right: 2,
                    background: 'var(--liquid-pill-bg)',
                    border: '1px solid var(--liquid-pill-border)',
                    boxShadow: 'var(--liquid-pill-shadow)',
                    backdropFilter: 'blur(12px) saturate(200%)',
                    WebkitBackdropFilter: 'blur(12px) saturate(200%)',
                  }}
                />
              )}
              <Icon
                size={20}
                strokeWidth={isActive ? 2.3 : 1.6}
                className="relative z-[1]"
                style={{
                  color: isActive ? 'var(--liquid-icon-active)' : 'var(--liquid-icon-inactive)',
                }}
              />
              <span
                className="relative z-[1] text-[9px] tracking-wide truncate max-w-full px-0.5"
                style={{
                  color: isActive ? 'var(--liquid-icon-active)' : 'var(--liquid-icon-inactive)',
                  fontWeight: isActive ? 650 : 400,
                }}
              >
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </nav>
    </div>
  );
}
