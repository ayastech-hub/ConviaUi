import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

import type { Screen } from './data/mockData';
import { BottomNav } from './components/BottomNav';
import { OnboardingScreen } from './components/screens/OnboardingScreen';
import { HomeScreen } from './components/screens/HomeScreen';
import { WalletScreen } from './components/screens/WalletScreen';
import { TradeScreen } from './components/screens/TradeScreen';
import { SocialScreen } from './components/screens/SocialScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { SendScreen } from './components/screens/SendScreen';
import { SwapScreen } from './components/screens/SwapScreen';
import { OffRampScreen } from './components/screens/OffRampScreen';
import { DepositScreen } from './components/screens/DepositScreen';
import { OTCScreen } from './components/screens/OTCScreen';
import { NotificationsScreen } from './components/screens/NotificationsScreen';
import { RewardsScreen } from './components/screens/RewardsScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { SecurityScreen } from './components/screens/SecurityScreen';
import { KYCScreen } from './components/screens/KYCScreen';
import { ChatScreen } from './components/screens/ChatScreen';
import { PortfolioScreen } from './components/screens/PortfolioScreen';
import { WithdrawScreen } from './components/screens/WithdrawScreen';
import { OnRampScreen } from './components/screens/OnRampScreen';
import { AuthScreen } from './components/screens/AuthScreen';
import { HelpCenterScreen } from './components/screens/HelpCenterScreen';
import { AboutScreen } from './components/screens/AboutScreen';
import { PaymentMethodsScreen } from './components/screens/PaymentMethodsScreen';
import { CurrencyProvider } from './context/CurrencyContext';
import { ConviaLogo } from './components/ConviaLogo';

const MAIN_TABS: Screen[] = ['home', 'wallet', 'social', 'trade', 'profile'];

function useNavigation(initial: Screen = 'onboarding') {
  const [stack, setStack] = useState<Screen[]>([initial]);
  const current = stack[stack.length - 1];

  const navigate = (s: Screen) => setStack(prev => [...prev, s]);
  const goBack = () => setStack(prev => prev.length > 1 ? prev.slice(0, -1) : prev);
  const switchTab = (s: Screen) => setStack([s]);

  return { current, navigate, goBack, switchTab };
}

const springTransition = { type: 'spring' as const, damping: 28, stiffness: 320 };

const slideUp = {
  initial: { y: '100%', opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: '100%', opacity: 0 },
  transition: springTransition,
};

const slideRight = {
  initial: { x: '100%', opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: '100%', opacity: 0 },
  transition: springTransition,
};

const fadeIn = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
  transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] as const },
};

export default function App() {
  const { current, navigate, goBack, switchTab } = useNavigation('onboarding');
  const [darkMode, setDarkMode] = useState(true);

  const isMainTab = MAIN_TABS.includes(current);
  const activeTab = isMainTab ? current : MAIN_TABS[0];

  const renderScreen = () => {
    const commonProps = { navigate, goBack };

    switch (current) {
      case 'onboarding':
        return (
          <motion.div key="onboarding" {...fadeIn} className="absolute inset-0">
            <OnboardingScreen navigate={navigate} switchTab={switchTab} />
          </motion.div>
        );
      case 'home':
        return (
          <motion.div key="home" {...fadeIn} className="absolute inset-0 flex flex-col" style={{ paddingBottom: 68 }}>
            <HomeScreen navigate={navigate} darkMode={darkMode} toggleDark={() => setDarkMode(!darkMode)} notificationCount={2} />
          </motion.div>
        );
      case 'wallet':
        return (
          <motion.div key="wallet" {...fadeIn} className="absolute inset-0 flex flex-col" style={{ paddingBottom: 68 }}>
            <WalletScreen navigate={navigate} />
          </motion.div>
        );
      case 'trade':
        return (
          <motion.div key="trade" {...fadeIn} className="absolute inset-0 flex flex-col" style={{ paddingBottom: 68 }}>
            <TradeScreen navigate={navigate} />
          </motion.div>
        );
      case 'social':
        return (
          <motion.div key="social" {...fadeIn} className="absolute inset-0 flex flex-col" style={{ paddingBottom: 68 }}>
            <SocialScreen navigate={navigate} />
          </motion.div>
        );
      case 'profile':
        return (
          <motion.div key="profile" {...fadeIn} className="absolute inset-0 flex flex-col" style={{ paddingBottom: 68 }}>
            <ProfileScreen navigate={navigate} darkMode={darkMode} toggleDark={() => setDarkMode(!darkMode)} />
          </motion.div>
        );

      // Sub-screens (slide up)
      case 'send':
        return (
          <motion.div key="send" {...slideRight} className="absolute inset-0">
            <SendScreen navigate={navigate} goBack={goBack} />
          </motion.div>
        );
      case 'receive':
        return (
          <motion.div key="receive" {...slideRight} className="absolute inset-0">
            <DepositScreen goBack={goBack} />
          </motion.div>
        );
      case 'swap':
        return (
          <motion.div key="swap" {...slideRight} className="absolute inset-0">
            <SwapScreen goBack={goBack} />
          </motion.div>
        );
      case 'offramp':
        return (
          <motion.div key="offramp" {...slideRight} className="absolute inset-0">
            <OffRampScreen goBack={goBack} />
          </motion.div>
        );
      case 'onramp':
        return (
          <motion.div key="onramp" {...slideRight} className="absolute inset-0">
            <OnRampScreen goBack={goBack} />
          </motion.div>
        );
      case 'deposit':
        return (
          <motion.div key="deposit" {...slideRight} className="absolute inset-0">
            <DepositScreen goBack={goBack} />
          </motion.div>
        );
      case 'withdraw':
        return (
          <motion.div key="withdraw" {...slideRight} className="absolute inset-0">
            <WithdrawScreen goBack={goBack} />
          </motion.div>
        );
      case 'otc':
        return (
          <motion.div key="otc" {...slideRight} className="absolute inset-0">
            <OTCScreen goBack={goBack} navigate={navigate} />
          </motion.div>
        );
      case 'notifications':
        return (
          <motion.div key="notifications" {...slideRight} className="absolute inset-0">
            <NotificationsScreen goBack={goBack} />
          </motion.div>
        );
      case 'rewards':
        return (
          <motion.div key="rewards" {...slideRight} className="absolute inset-0">
            <RewardsScreen goBack={goBack} />
          </motion.div>
        );
      case 'settings':
        return (
          <motion.div key="settings" {...slideRight} className="absolute inset-0">
            <SettingsScreen goBack={goBack} navigate={navigate} darkMode={darkMode} toggleDark={() => setDarkMode(!darkMode)} />
          </motion.div>
        );
      case 'security':
        return (
          <motion.div key="security" {...slideRight} className="absolute inset-0">
            <SecurityScreen goBack={goBack} />
          </motion.div>
        );
      case 'kyc':
        return (
          <motion.div key="kyc" {...slideRight} className="absolute inset-0">
            <KYCScreen goBack={goBack} />
          </motion.div>
        );
      case 'chat':
        return (
          <motion.div key="chat" {...slideRight} className="absolute inset-0">
            <ChatScreen goBack={goBack} />
          </motion.div>
        );
      case 'portfolio':
        return (
          <motion.div key="portfolio" {...slideRight} className="absolute inset-0">
            <PortfolioScreen goBack={goBack} />
          </motion.div>
        );
      case 'login':
        return (
          <motion.div key="login" {...fadeIn} className="absolute inset-0">
            <AuthScreen mode="login" navigate={navigate} goBack={goBack} switchTab={switchTab} />
          </motion.div>
        );
      case 'signup':
        return (
          <motion.div key="signup" {...fadeIn} className="absolute inset-0">
            <AuthScreen mode="signup" navigate={navigate} goBack={goBack} switchTab={switchTab} />
          </motion.div>
        );
      case 'forgot-password':
        return (
          <motion.div key="forgot-password" {...fadeIn} className="absolute inset-0">
            <AuthScreen mode="forgot-password" navigate={navigate} goBack={goBack} switchTab={switchTab} />
          </motion.div>
        );
      case 'help-center':
        return (
          <motion.div key="help-center" {...slideRight} className="absolute inset-0">
            <HelpCenterScreen goBack={goBack} />
          </motion.div>
        );
      case 'about':
        return (
          <motion.div key="about" {...slideRight} className="absolute inset-0">
            <AboutScreen goBack={goBack} />
          </motion.div>
        );
      case 'payment-methods':
        return (
          <motion.div key="payment-methods" {...slideRight} className="absolute inset-0">
            <PaymentMethodsScreen goBack={goBack} />
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={darkMode ? 'dark' : ''} style={{ width: '100%', height: '100%' }}>
      <CurrencyProvider>
      {/* Desktop wrapper with phone frame */}
      <div
        className="flex items-center justify-center"
        style={{
          minHeight: '100vh',
          minWidth: '100vw',
          background: darkMode
            ? 'linear-gradient(135deg, #0B0F19 0%, #131826 40%, #0B0F19 60%, #1A1F2E 100%)'
            : 'linear-gradient(135deg, #F1F5F9 0%, #E0E7F0 50%, #F8FAFC 100%)',
        }}
      >
        {/* Phone frame */}
        <div
          className="relative flex flex-col overflow-hidden"
          style={{
            width: 390,
            height: 844,
            borderRadius: 44,
            flexShrink: 0,
            boxShadow: darkMode
              ? '0 0 0 10px #111827, 0 0 0 12px #0a0f1e, 0 40px 120px rgba(99,102,241,0.3), 0 20px 80px rgba(0,0,0,0.9)'
              : '0 0 0 10px #D1D5DB, 0 0 0 12px #9CA3AF, 0 40px 80px rgba(99,102,241,0.15)',
            background: 'var(--background)',
          }}
        >
          {/* Dynamic Island */}
          <div
            className="absolute z-50"
            style={{
              top: 12,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 120,
              height: 34,
              background: '#000',
              borderRadius: 20,
            }}
          />

          {/* Screen content */}
          <div className="relative flex-1 overflow-hidden" style={{ background: 'var(--background)' }}>
            <AnimatePresence mode="wait">
              {renderScreen()}
            </AnimatePresence>
          </div>

          {/* Bottom Nav */}
          {isMainTab && (
            <div className="absolute bottom-0 left-0 right-0 z-40">
              <BottomNav
                activeTab={activeTab as Screen}
                onNavigate={switchTab}
                onSend={() => navigate('send')}
              />
            </div>
          )}
        </div>

        {/* Desktop label */}
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full"
          style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <ConviaLogo size={14} color="#6366F1" />
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 500 }}>
            Convia — Africa's Financial Universe
          </span>
        </div>
      </div>
      </CurrencyProvider>
    </div>
  );
}
