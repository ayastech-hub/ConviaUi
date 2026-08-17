import { motion } from 'motion/react';
import { Home, Wallet, User, Grid3x3 } from 'lucide-react';
import type { Screen } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';

interface BottomNavProps {
  activeTab: Screen;
  onNavigate: (screen: Screen) => void;
  onSwap: () => void;
}

export function BottomNav({ activeTab, onNavigate }: BottomNavProps) {
  const { t } = useLanguage();
  const tabs = [
    { id: 'home' as Screen, label: t('nav.home'), icon: Home },
    { id: 'wallet' as Screen, label: t('nav.wallet'), icon: Wallet },
    { id: 'profile' as Screen, label: t('nav.profile'), icon: User },
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
        {isActive && (
          <motion.div
            layoutId="bottom-nav-active"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="absolute top-2 h-1 w-5 rounded-full"
            style={{ background: 'var(--accent)' }}
          />
        )}
        <motion.div animate={{ scale: isActive ? 1.05 : 1 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
          <Icon
            size={22}
            strokeWidth={isActive ? 2.2 : 1.6}
            style={{ color: isActive ? 'var(--foreground)' : 'var(--muted-foreground)' }}
          />
        </motion.div>
        <span
          className="text-[10px] tracking-wide"
          style={{ color: isActive ? 'var(--foreground)' : 'var(--muted-foreground)', fontWeight: isActive ? 600 : 400 }}
        >
          {tab.label}
        </span>
      </motion.button>
    );
  };

  return (
    <div className="relative w-full" style={{ height: 92 }}>
      <div className="absolute bottom-0 left-0 right-0" style={{ height: 72, background: 'var(--card)', borderTop: '1px solid var(--border)' }}>
        <div className="flex h-full items-stretch px-2">
          <div className="flex flex-1">{leftTabs.map(renderTab)}</div>
          <div className="w-[72px]" />
          <div className="flex flex-1">{rightTabs.map(renderTab)}</div>
        </div>
      </div>
      <motion.button
        type="button"
        onClick={() => onNavigate('services')}
        whileTap={{ scale: 0.88 }}
        aria-label={t('nav.services')}
        className="absolute left-1/2 top-0 z-10 flex h-[58px] w-[58px] -translate-x-1/2 items-center justify-center rounded-full"
        style={{ background: 'var(--foreground)', color: 'var(--background)', border: '4px solid var(--background)' }}
      >
        <Grid3x3 size={21} strokeWidth={2} />
      </motion.button>
    </div>
  );
}
