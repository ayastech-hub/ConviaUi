import { motion } from 'motion/react';
import { Wallet, ArrowLeftRight, Banknote, User } from 'lucide-react';
import type { Screen } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';

interface BottomNavProps {
  activeTab: Screen;
  onNavigate: (screen: Screen) => void;
  onSwap: () => void;
}

/**
 * Floating pill with liquid glass active indicator — light + dark via CSS vars.
 * Tabs: Wallet · Swap · Pay · Profile  (More removed)
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
      id: 'pay',
      label: 'Pay',
      icon: Banknote,
      action: () => onNavigate('pay-hub'),
      active: activeTab === 'pay-hub' || activeTab === 'services',
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
              className="relative flex flex-1 flex-col items-center justify-center gap-0.5 h-full rounded-full"
              style={{ minWidth: 0 }}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-liquid"
                  className="absolute inset-1 rounded-full"
                  style={{
                    background: 'var(--liquid-active-bg)',
                    border: '1px solid var(--liquid-active-border)',
                    boxShadow: 'var(--liquid-active-shadow)',
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                />
              )}
              <span className="relative z-10 flex flex-col items-center gap-0.5 pt-1 pb-0.5">
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.4 : 2}
                  style={{ color: isActive ? 'var(--primary)' : 'var(--muted-foreground)' }}
                />
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? 'var(--foreground)' : 'var(--muted-foreground)',
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
