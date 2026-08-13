import { motion } from 'motion/react';
import { Home, Wallet, User, ArrowLeftRight, Grid3x3 } from 'lucide-react';
import type { Screen } from '../data/mockData';

interface BottomNavProps {
  activeTab: Screen;
  onNavigate: (screen: Screen) => void;
  onSwap: () => void;
}

const tabs = [
  { id: 'home' as Screen, label: 'Home', icon: Home },
  { id: 'wallet' as Screen, label: 'Wallet', icon: Wallet },
  { id: 'profile' as Screen, label: 'Profile', icon: User },
];

export function BottomNav({ activeTab, onNavigate, onSwap }: BottomNavProps) {
  const leftTabs = tabs.slice(0, 2);
  const rightTabs = tabs.slice(2);
  const isSwapActive = activeTab === 'swap'; // Optional check if you track swap screen

  const renderTab = (tab: typeof tabs[0]) => {
    const Icon = tab.icon;
    const isActive = activeTab === tab.id;
    return (
      <motion.button
        key={tab.id}
        whileTap={{ scale: 0.9 }}
        onClick={() => onNavigate(tab.id)}
        aria-label={tab.label}
        className="flex-1 flex flex-col items-center justify-center gap-1 relative group py-2"
      >
        {/* Soft active pill glow background */}
        {isActive && (
          <motion.div
            layoutId="activePill"
            className="absolute inset-x-2 inset-y-1 rounded-2xl -z-10"
            style={{
              background: 'linear-gradient(180deg, var(--accent-subtle, rgba(var(--accent-rgb, 99, 102, 241), 0.12)) 0%, transparent 100%)',
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}

        {/* Top Active Dot indicator */}
        {isActive && (
          <motion.div
            layoutId="navIndicator"
            className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[3px] rounded-full shadow-[0_0_10px_var(--accent)]"
            style={{ background: 'var(--accent)' }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          />
        )}

        <motion.div
          animate={{ scale: isActive ? 1.1 : 1, y: isActive ? -1 : 0 }}
          transition={{ type: 'spring', damping: 18, stiffness: 300 }}
        >
          <Icon
            size={22}
            strokeWidth={isActive ? 2.5 : 1.75}
            style={{
              color: isActive ? 'var(--accent)' : 'var(--muted-foreground)',
              filter: isActive ? 'drop-shadow(0 2px 6px var(--accent-glow, rgba(99,102,241,0.3)))' : 'none',
              transition: 'color 0.2s ease',
            }}
          />
        </motion.div>
        
        <span
          className="text-[10px] tracking-wide transition-colors duration-200"
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
    <div 
      className="flex items-center h-[76px] px-3 relative glass-nav backdrop-blur-xl" 
      style={{ 
        borderTop: '1px solid var(--border)',
        background: 'var(--nav-bg, rgba(var(--background-rgb, 15, 23, 42), 0.82))',
        boxShadow: '0 -10px 30px -10px rgba(0, 0, 0, 0.15)'
      }}
    >
      {leftTabs.map(renderTab)}

      {/* Floating Center Services Button with Glowing Gradient Ring */}
      <div className="flex flex-col items-center justify-center relative px-2">
        <motion.button
          whileTap={{ scale: 0.85 }}
          whileHover={{ scale: 1.08 }}
          onClick={() => onNavigate('services')}
          aria-label="Services"
          className="w-13 h-13 rounded-3xl flex items-center justify-center relative -mt-6 shadow-xl group cursor-pointer"
          style={{
            width: '52px',
            height: '52px',
            background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover, var(--accent)) 100%)',
            color: 'var(--accent-foreground, #ffffff)',
            boxShadow: '0 10px 25px -5px var(--accent-glow, rgba(99, 102, 241, 0.5)), 0 0 0 4px var(--background)',
          }}
        >
          {/* Subtle light sheen sweep overlay */}
          <div className="absolute inset-0 rounded-3xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          
          <motion.div
            animate={{ rotate: activeTab === 'services' ? 90 : 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <Grid3x3 size={22} strokeWidth={2.2} />
          </motion.div>
        </motion.button>
        <span 
          className="text-[10px] tracking-wide mt-1 font-medium" 
          style={{ 
            color: activeTab === 'services' ? 'var(--foreground)' : 'var(--muted-foreground)' 
          }}
        >
          Services
        </span>
      </div>

      {/* Swap tab */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onSwap}
        aria-label="Swap"
        className="flex-1 flex flex-col items-center justify-center gap-1 relative group py-2"
      >
        {isSwapActive && (
          <motion.div
            layoutId="activePill"
            className="absolute inset-x-2 inset-y-1 rounded-2xl -z-10"
            style={{
              background: 'linear-gradient(180deg, var(--accent-subtle, rgba(99, 102, 241, 0.12)) 0%, transparent 100%)',
            }}
          />
        )}
        <motion.div
          animate={{ scale: isSwapActive ? 1.1 : 1 }}
          transition={{ type: 'spring', damping: 18, stiffness: 300 }}
        >
          <ArrowLeftRight 
            size={22} 
            strokeWidth={isSwapActive ? 2.5 : 1.75} 
            style={{ 
              color: isSwapActive ? 'var(--accent)' : 'var(--muted-foreground)',
              transition: 'color 0.2s ease'
            }} 
          />
        </motion.div>
        <span 
          className="text-[10px] tracking-wide transition-colors duration-200" 
          style={{ 
            color: isSwapActive ? 'var(--foreground)' : 'var(--muted-foreground)', 
            fontWeight: isSwapActive ? 600 : 400 
          }}
        >
          Swap
        </span>
      </motion.button>

      {rightTabs.map(renderTab)}
    </div>
  );
}
