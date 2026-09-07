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
 * Floating pill: Wallet · Swap · More · Profile
 * (Buy / Send removed from nav — Buy is a hub action; Send via assets / flows)
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
        className="pointer-events-auto flex items-center justify-between gap-0.5 px-2 py-1.5"
        style={{
          width: 'min(92%, 380px)',
          height: 58,
          borderRadius: 999,
          background: 'var(--card)',
          border: '1px solid var(--border)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
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
              whileTap={{ scale: 0.88 }}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
              className="relative flex flex-col items-center justify-center gap-0.5 flex-1 min-w-0 h-full rounded-full"
              style={{
                background: isActive ? 'var(--muted)' : 'transparent',
              }}
            >
              <Icon
                size={20}
                strokeWidth={isActive ? 2.25 : 1.6}
                style={{
                  color: isActive ? 'var(--foreground)' : 'var(--muted-foreground)',
                }}
              />
              <span
                className="text-[9px] tracking-wide truncate max-w-full px-0.5"
                style={{
                  color: isActive ? 'var(--foreground)' : 'var(--muted-foreground)',
                  fontWeight: isActive ? 600 : 400,
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
