import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

import type { Screen } from '../shared/data/mockData';
import { BottomNav } from '../shared/components/BottomNav';
import { ConviaLogo } from '../shared/components/ConviaLogo';
import { AppProviders } from './providers/AppProviders';
import { useNavigation } from './navigation';

import { OnboardingScreen } from '../features/onboarding/screens/OnboardingScreen';
import { AuthScreen } from '../features/auth/screens/AuthScreen';
import { HomeScreen } from '../features/home/screens/HomeScreen';

import { WalletScreen } from '../features/wallet/screens/WalletScreen';
import { SendScreen } from '../features/wallet/screens/SendScreen';
import { ReceiveScreen } from '../features/wallet/screens/ReceiveScreen';
import { SwapScreen } from '../features/wallet/screens/SwapScreen';
import { OffRampScreen } from '../features/wallet/screens/OffRampScreen';
import { OnRampScreen } from '../features/wallet/screens/OnRampScreen';
import { DepositScreen } from '../features/wallet/screens/DepositScreen';
import { WithdrawScreen } from '../features/wallet/screens/WithdrawScreen';
import { PortfolioScreen } from '../features/wallet/screens/PortfolioScreen';
import { PaymentMethodsScreen } from '../features/wallet/screens/PaymentMethodsScreen';

import { TradeScreen } from '../features/trade/screens/TradeScreen';
import { OTCScreen } from '../features/trade/screens/OTCScreen';
import { TokenInfoScreen } from '../features/trade/screens/TokenInfoScreen';

import { SocialScreen } from '../features/social/screens/SocialScreen';

import { ProfileScreen } from '../features/profile/screens/ProfileScreen';
import { EditProfileScreen } from '../features/profile/screens/EditProfileScreen';
import { SettingsScreen } from '../features/profile/screens/SettingsScreen';
import { SecurityScreen } from '../features/profile/screens/SecurityScreen';
import { KYCScreen } from '../features/profile/screens/KYCScreen';

import { HelpCenterScreen } from '../features/support/screens/HelpCenterScreen';
import { AboutScreen } from '../features/support/screens/AboutScreen';
import { ChatScreen } from '../features/support/screens/ChatScreen';

import { NotificationsScreen } from '../features/notifications/screens/NotificationsScreen';
import { RewardsScreen } from '../features/rewards/screens/RewardsScreen';
import { ServicesScreen } from '../features/services/screens/ServicesScreen';

const MAIN_TABS: Screen[] = ['home', 'wallet', 'social', 'trade', 'profile'];

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
  const { current, navigate, goBack, switchTab, navParam } = useNavigation('onboarding');
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
            <ReceiveScreen goBack={goBack} />
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
      case 'services':
        return (
          <motion.div key="services" {...slideRight} className="absolute inset-0">
            <ServicesScreen navigate={navigate} goBack={goBack} switchTab={switchTab} />
          </motion.div>
        );
      case 'edit-profile':
        return (
          <motion.div key="edit-profile" {...slideRight} className="absolute inset-0">
            <EditProfileScreen goBack={goBack} />
          </motion.div>
        );
      case 'token-info':
        return (
          <motion.div key="token-info" {...slideRight} className="absolute inset-0">
            <TokenInfoScreen navigate={navigate} goBack={goBack} symbol={navParam ?? 'BTC'} />
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={darkMode ? 'dark' : ''} style={{ width: '100%', height: '100%' }}>
      <AppProviders>
      {/* Desktop wrapper with phone frame */}
      <div
        className="flex items-center justify-center"
        style={{
          minHeight: '100vh',
          minWidth: '100vw',
          background: darkMode ? '#050505' : '#F4F4F5',
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
              ? '0 0 0 10px #1C1C1F, 0 0 0 12px #050505, 0 40px 120px rgba(0,0,0,0.9), 0 20px 80px rgba(0,0,0,0.8)'
              : '0 0 0 10px #D4D4D8, 0 0 0 12px #A1A1AA, 0 40px 80px rgba(0,0,0,0.12)',
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
          style={{ background: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', backdropFilter: 'blur(12px)', border: '1px solid var(--border)' }}
        >
          <ConviaLogo size={14} color="var(--primary)" />
          <span style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 500 }}>
            Convia — Africa's Financial Universe
          </span>
        </div>
      </div>
      </AppProviders>
    </div>
  );
}
