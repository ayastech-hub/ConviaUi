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
 * Floating pill with liquid Apple-glass active indicator.
 * Wallet · Swap · More · Profile
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
        className="pointer-events-auto relative flex items-center justify-between gap-0.5 px-1.5 py-1.5"
        style={{
          width: 'min(92%, 380px)',
          height: 58,
          borderRadius: 999,
          background: 'rgba(28, 28, 30, 0.55)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow:
            '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.2)',
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
              className="relative flex flex-col items-center justify-center gap-0.5 flex-1 min-w-0 h-full rounded-full z-[1]"
              style={{ background: 'transparent' }}
            >
              {isActive && (
                <motion.span
                  layoutId="nav-liquid-glass"
                  className="absolute inset-y-1 inset-x-0.5 rounded-full pointer-events-none"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  style={{
                    background:
                      'linear-gradient(165deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.08) 45%, rgba(255,255,255,0.04) 100%)',
                    border: '1px solid rgba(255,255,255,0.22)',
                    boxShadow:
                      'inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.15), 0 2px 12px rgba(0,0,0,0.15)',
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
                  color: isActive ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.45)',
                }}
              />
              <span
                className="relative z-[1] text-[9px] tracking-wide truncate max-w-full px-0.5"
                style={{
                  color: isActive ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.45)',
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
