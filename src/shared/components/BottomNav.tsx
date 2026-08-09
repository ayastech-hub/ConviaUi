import { motion } from 'motion/react';
import { Home, Wallet, User, MessageCircle, Grid3x3 } from 'lucide-react';
import type { Screen } from '../data/mockData';

interface BottomNavProps {
  activeTab: Screen;
  onNavigate: (screen: Screen) => void;
  onSend: () => void;
}

const tabs = [
  { id: 'home' as Screen, label: 'Home', icon: Home },
  { id: 'wallet' as Screen, label: 'Wallet', icon: Wallet },
  { id: 'social' as Screen, label: 'Social', icon: MessageCircle },
  { id: 'profile' as Screen, label: 'Profile', icon: User },
];

export function BottomNav({ activeTab, onNavigate }: BottomNavProps) {
  const leftTabs = tabs.slice(0, 2);
  const rightTabs = tabs.slice(2);

  const renderTab = (tab: typeof tabs[0]) => {
    const Icon = tab.icon;
    const isActive = activeTab === tab.id;
    return (
      <motion.button
        key={tab.id}
        whileTap={{ scale: 0.9 }}
        onClick={() => onNavigate(tab.id)}
        aria-label={tab.label}
        className="flex-1 flex flex-col items-center justify-center gap-1 relative"
      >
        {isActive && (
          <motion.div
            layoutId="navIndicator"
            className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
            style={{ background: 'var(--accent)' }}
          />
        )}
        <motion.div
          animate={{ scale: isActive ? 1.05 : 1 }}
          transition={{ type: 'spring', damping: 15, stiffness: 300 }}
        >
          <Icon
            size={22}
            strokeWidth={isActive ? 2 : 1.5}
            style={{ color: isActive ? 'var(--foreground)' : 'var(--muted-foreground)' }}
          />
        </motion.div>
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
  };

  return (
    <div className="flex items-stretch h-[68px] px-2 relative glass-nav" style={{ borderTop: '1px solid var(--border)' }}>
      {leftTabs.map(renderTab)}

      {/* Center Services Button */}
      <div className="flex flex-col items-center justify-center" style={{ width: 72 }}>
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => onNavigate('services')}
          aria-label="Services"
          className="w-12 h-12 rounded-2xl flex items-center justify-center relative -mt-4"
          style={{
            background: 'var(--foreground)',
            color: 'var(--background)',
          }}
        >
          <Grid3x3 size={20} strokeWidth={2} />
        </motion.button>
        <span className="text-[10px] tracking-wide mt-0.5" style={{ color: 'var(--muted-foreground)', fontWeight: 400 }}>Services</span>
      </div>

      {rightTabs.map(renderTab)}
    </div>
  );
}
