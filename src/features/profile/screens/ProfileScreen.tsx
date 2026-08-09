import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Shield, Gift, Settings, TrendingUp, Bell, Moon, Sun,
  CreditCard, HelpCircle, User, FileCheck, ChevronRight,
} from 'lucide-react';
import type { Screen } from '../../../shared/data/mockData';
import { ReferralModal } from '../../../shared/components/ReferralModal';
import { ListSection } from '../../../shared/components/ListSection';
import { ListRow } from '../../../shared/components/ListRow';
import { ProfileCard } from '../components/ProfileCard';
import { ReferralBanner } from '../components/ReferralBanner';
import { SignOutButton } from '../components/SignOutButton';

interface ProfileScreenProps {
  navigate: (s: Screen) => void;
  darkMode: boolean;
  toggleDark: () => void;
}

const ACCOUNT_ITEMS = [
  { label: 'Edit Profile', icon: User, screen: 'edit-profile' as Screen, desc: 'Name, username, email, phone' },
  { label: 'Security Center', icon: Shield, screen: 'security' as Screen, desc: 'PIN, 2FA, devices' },
  { label: 'Payment Methods', icon: CreditCard, screen: 'payment-methods' as Screen, desc: 'Cards & bank accounts' },
  { label: 'KYC Verification', icon: FileCheck, screen: 'kyc' as Screen, desc: 'Identity verification' },
];

const ACTIVITY_ITEMS = [
  { label: 'Rewards & Points', icon: Gift, screen: 'rewards' as Screen, badge: '2,450 pts', badgeColor: 'var(--muted-foreground)' },
  { label: 'Portfolio', icon: TrendingUp, screen: 'portfolio' as Screen, badge: null, badgeColor: '' },
  { label: 'Notifications', icon: Bell, screen: 'notifications' as Screen, badge: '2', badgeColor: 'var(--destructive)' },
];

const SUPPORT_ITEMS = [
  { label: 'Help Center', icon: HelpCircle, screen: 'help-center' as Screen, desc: 'FAQs & guides' },
  { label: 'About Convia', icon: Settings, screen: 'about' as Screen, desc: 'Terms, privacy, licenses' },
];

export function ProfileScreen({ navigate, darkMode, toggleDark }: ProfileScreenProps) {
  const [avatar, setAvatar] = useState<string | null>(null);
  const [showReferral, setShowReferral] = useState(false);

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />

      <div className="flex items-center justify-between px-5 mb-6">
        <h2 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 24, letterSpacing: -0.5 }}>Profile</h2>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleDark}
          className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          {darkMode ? <Sun size={17} style={{ color: 'var(--muted-foreground)' }} /> : <Moon size={17} style={{ color: 'var(--muted-foreground)' }} />}
        </motion.button>
      </div>

      <ProfileCard avatar={avatar} onAvatarChange={setAvatar} />

      <div className="px-5">
        <ListSection title="ACCOUNT">
          {ACCOUNT_ITEMS.map((item) => (
            <ListRow key={item.label} icon={item.icon} label={item.label} desc={item.desc} onClick={() => navigate(item.screen)} />
          ))}
        </ListSection>

        <ListSection title="ACTIVITY">
          {ACTIVITY_ITEMS.map((item) => (
            <ListRow
              key={item.label}
              icon={item.icon}
              label={item.label}
              onClick={() => navigate(item.screen)}
              trailing={item.badge ? (
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-lg" style={{ background: 'var(--muted)', color: item.badgeColor, fontSize: 11, fontWeight: 600 }}>
                    {item.badge}
                  </span>
                  <ChevronRight size={16} style={{ color: 'var(--muted-foreground)' }} />
                </div>
              ) : undefined}
            />
          ))}
        </ListSection>

        <ListSection title="SUPPORT">
          {SUPPORT_ITEMS.map((item) => (
            <ListRow key={item.label} icon={item.icon} label={item.label} desc={item.desc} onClick={() => navigate(item.screen)} />
          ))}
        </ListSection>

        <ListSection>
          <ListRow icon={Settings} label="Settings" onClick={() => navigate('settings')} />
        </ListSection>
      </div>

      <ReferralBanner code="ADE2026" reward="$10 USDT" onOpen={() => setShowReferral(true)} />
      <ReferralModal open={showReferral} onClose={() => setShowReferral(false)} code="ADE2026" reward="$10 USDT" />

      <div className="px-5 mb-5">
        <SignOutButton />
      </div>

      <div style={{ height: 100 }} />
    </div>
  );
}
