import { motion } from 'motion/react';
import {
  Wallet,
  CreditCard,
  ArrowLeftRight,
  Send,
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
 * 5-item nav matching modern crypto hubs:
 * Wallet (merged home) · Buy · Swap · Send · More (services)
 * Trade/P2P replaced with Buy + Send (Convia capabilities).
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
      id: 'buy',
      label: 'Buy',
      icon: CreditCard,
      action: () => onNavigate('onramp'),
      active: activeTab === 'onramp',
    },
    {
      id: 'swap',
      label: t('nav.swap') || 'Swap',
      icon: ArrowLeftRight,
      action: onSwap,
      active: activeTab === 'swap',
    },
    {
      id: 'send',
      label: 'Send',
      icon: Send,
      action: () => onNavigate('send'),
      active: activeTab === 'send',
    },
    {
      id: 'more',
      label: 'More',
      icon: Grid3x3,
      action: () => onNavigate('services'),
      active: activeTab === 'services' || activeTab === 'profile',
    },
  ];

  return (
    <div
      className="flex items-stretch h-[68px] px-1 relative"
      style={{
        borderTop: '1px solid var(--border)',
        background: 'var(--background)',
      }}
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
            className="relative flex h-full flex-1 flex-col items-center justify-center gap-1"
          >
            {isActive && (
              <motion.div
                layoutId="bottom-nav-active"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="absolute top-2 h-1 w-5 rounded-full"
                style={{ background: 'var(--foreground)' }}
              />
            )}
            <Icon
              size={22}
              strokeWidth={isActive ? 2.2 : 1.6}
              style={{
                color: isActive ? 'var(--foreground)' : 'var(--muted-foreground)',
              }}
            />
            <span
              className="text-[10px] tracking-wide"
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
    </div>
  );
}
