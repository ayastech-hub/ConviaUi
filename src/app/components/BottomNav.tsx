import React from 'react';
import { motion } from 'motion/react';
import { Home, Wallet, TrendingUp, User, Send, MessageCircle } from 'lucide-react';
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
  { id: 'trade' as Screen, label: 'Trade', icon: TrendingUp },
  { id: 'profile' as Screen, label: 'Profile', icon: User },
];

export function BottomNav({ activeTab, onNavigate, onSend }: BottomNavProps) {
  const leftTabs = tabs.slice(0, 2);
  const rightTabs = tabs.slice(2);

  return (
    <div className="flex items-stretch h-[68px] px-2 glass-nav glass-refraction relative">
      {leftTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <motion.button
            key={tab.id}
            whileTap={{ scale: 0.9 }}
            onClick={() => onNavigate(tab.id)}
            className="flex-1 flex flex-col items-center justify-center gap-1"
          >
            <Icon
              size={22}
              strokeWidth={isActive ? 2.5 : 1.8}
              style={{ color: isActive ? 'var(--primary)' : 'var(--muted-foreground)' }}
            />
            <span
              className="text-[10px] tracking-wide"
              style={{
                color: isActive ? 'var(--primary)' : 'var(--muted-foreground)',
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {tab.label}
            </span>
          </motion.button>
        );
      })}

      {/* Center Send FAB */}
      <div className="flex flex-col items-center justify-center" style={{ width: 64 }}>
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={onSend}
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{
            background: 'var(--primary)',
            boxShadow: '0 4px 16px rgba(99,102,241,0.5)',
          }}
        >
          <Send size={22} className="text-white" />
        </motion.button>
      </div>

      {rightTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <motion.button
            key={tab.id}
            whileTap={{ scale: 0.9 }}
            onClick={() => onNavigate(tab.id)}
            className="flex-1 flex flex-col items-center justify-center gap-1"
          >
            <Icon
              size={22}
              strokeWidth={isActive ? 2.5 : 1.8}
              style={{ color: isActive ? 'var(--primary)' : 'var(--muted-foreground)' }}
            />
            <span
              className="text-[10px] tracking-wide"
              style={{
                color: isActive ? 'var(--primary)' : 'var(--muted-foreground)',
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
