import { useState, useEffect } from 'react';
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
import { useAuth } from '../../../shared/context/AuthContext';
import { useKycStatus } from '../../../shared/hooks/useKycStatus';
import * as rewardsApi from '../../../shared/api/rewards';

interface ProfileScreenProps {
  navigate: (s: Screen) => void;
  darkMode: boolean;
  toggleDark: () => void;
}

const SUPPORT_ITEMS = [
  { label: 'Help Center', icon: HelpCircle, screen: 'help-center' as Screen, desc: 'FAQs & guides' },
  { label: 'Support Centre', icon: HelpCircle, screen: 'support-center' as Screen, desc: 'Cases & live chat with agents' },
  { label: 'Support Desk', icon: Settings, screen: 'support-desk' as Screen, desc: 'Agent console (admin)' },
  { label: 'About Convia', icon: Settings, screen: 'about' as Screen, desc: 'Terms, privacy, licenses' },
];

export function ProfileScreen({ navigate, darkMode, toggleDark }: ProfileScreenProps) {
  const { userId, status } = useAuth();
  const { isApproved, isPending, kycStatus } = useKycStatus();
  const accountItems = [
    { label: 'Edit Profile', icon: User, screen: 'edit-profile' as Screen, desc: 'Name, username, bio, country' },
    { label: 'Security Center', icon: Shield, screen: 'security' as Screen, desc: 'PIN, sessions, whitelist' },
    { label: 'Payment Methods', icon: CreditCard, screen: 'payment-methods' as Screen, desc: 'Bank accounts' },
    {
      label: 'KYC Verification',
      icon: FileCheck,
      screen: 'kyc' as Screen,
      desc: isApproved ? 'Verified' : isPending ? `In review (${kycStatus})` : 'Identity verification',
    },
  ];
  const activityItems = [
    { label: 'Rewards & Points', icon: Gift, screen: 'rewards' as Screen, badge: null as string | null, badgeColor: '' },
    { label: 'Portfolio', icon: TrendingUp, screen: 'portfolio' as Screen, badge: null as string | null, badgeColor: '' },
    { label: 'Notifications', icon: Bell, screen: 'notifications' as Screen, badge: null as string | null, badgeColor: '' },
  ];
  const [showReferral, setShowReferral] = useState(false);
  const [refCode, setRefCode] = useState('');
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    if (!userId) return;
    rewardsApi
      .getReferralCode(userId)
      .then((r) => {
        setRefCode(r.code);
        setShareUrl(r.shareUrl || '');
      })
      .catch(() => setRefCode(''));
  }, [userId]);

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

      <ProfileCard />

      <div className="px-5">
        <ListSection title="ACCOUNT">
          {accountItems.map((item) => (
            <ListRow key={item.label} icon={item.icon} label={item.label} desc={item.desc} onClick={() => navigate(item.screen)} />
          ))}
        </ListSection>

        <ListSection title="ACTIVITY">
          {activityItems.map((item) => (
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

      <ReferralBanner code={refCode || '—'} reward="Rewards on referral" onOpen={() => setShowReferral(true)} />
      <ReferralModal open={showReferral} onClose={() => setShowReferral(false)} code={refCode || '—'} reward={shareUrl || 'Rewards on referral'} />

      <div className="px-5 mb-5">
        <SignOutButton onSignedOut={() => navigate('login')} />
      </div>

      <div style={{ height: 100 }} />
    </div>
  );
}
