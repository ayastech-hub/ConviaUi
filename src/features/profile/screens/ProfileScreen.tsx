import { useState, useEffect, type ReactNode } from 'react';
import {
  Shield,
  Gift,
  Settings,
  Bell,
  CreditCard,
  HelpCircle,
  User,
  FileCheck,
  Info,
  Headphones,
  ChevronRight,
} from 'lucide-react';
import type { Screen } from '../../../shared/data/mockData';
import { useLanguage } from '../../../shared/context/LanguageContext';
import { ReferralModal } from '../../../shared/components/ReferralModal';
import { ListSection } from '../../../shared/components/ListSection';
import { ListRow } from '../../../shared/components/ListRow';
import { ProfileCard } from '../components/ProfileCard';
import { AccountHealthCard } from '../components/AccountHealthCard';
import { ProfileQuickActions } from '../components/ProfileQuickActions';
import { ReferralBanner } from '../components/ReferralBanner';
import { SignOutButton } from '../components/SignOutButton';
import { useAuth } from '../../../shared/context/AuthContext';
import { useKycStatus } from '../../../shared/hooks/useKycStatus';
import * as rewardsApi from '../../../shared/api/rewards';
import * as notifApi from '../../../shared/api/notifications';
import { PageTop } from '../../../shared/components/PageTop';

interface ProfileScreenProps {
  navigate: (s: Screen) => void;
  darkMode: boolean;
  toggleDark: () => void;
}

function StatusPill({ label, tone }: { label: string; tone?: 'ok' | 'warn' | 'muted' }) {
  const color =
    tone === 'ok' ? 'var(--positive)' : tone === 'warn' ? 'var(--warning)' : 'var(--muted-foreground)';
  return (
    <span
      className="px-2 py-0.5 rounded-lg"
      style={{ background: 'var(--muted)', color, fontSize: 11, fontWeight: 600 }}
    >
      {label}
    </span>
  );
}

function RowTrail({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      {children}
      <ChevronRight size={16} style={{ color: 'var(--muted-foreground)' }} />
    </div>
  );
}

/**
 * Account hub — identity first, then security / preferences / support.
 * Portfolio removed (balances live on Home). Appearance lives in Settings.
 */
export function ProfileScreen({ navigate }: ProfileScreenProps) {
  const { t } = useLanguage();
  const { userId, status } = useAuth();
  const { isApproved, isPending, kycStatus } = useKycStatus();
  const [showReferral, setShowReferral] = useState(false);
  const [refCode, setRefCode] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [points, setPoints] = useState<number | null>(null);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!userId || status !== 'authenticated') return;
    let cancelled = false;
    rewardsApi
      .getRewardsProfile(userId)
      .then((r) => {
        if (!cancelled) setPoints(Number(r.balance ?? r.points ?? 0));
      })
      .catch(() => {});
    notifApi
      .listNotifications(userId)
      .then((r) => {
        if (!cancelled) {
          const items = Array.isArray(r) ? r : [];
          setUnread(items.filter((n) => !n.readAt && !(n as { read?: boolean }).read).length);
        }
      })
      .catch(() => {});
    rewardsApi
      .getReferralCode(userId)
      .then((r: any) => {
        if (cancelled || !r) return;
        setRefCode(r.code || r.referralCode || '');
        setShareUrl(r.shareUrl || r.url || '');
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [userId, status]);

  const kycTone = isApproved ? 'ok' : isPending ? 'warn' : 'muted';
  const kycLabel = isApproved ? 'Verified' : isPending ? 'In review' : kycStatus === 'rejected' ? 'Action needed' : 'Unverified';

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--background)' }}>
      <PageTop />

      <div className="px-5 mb-5">
        <h1 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 26, letterSpacing: '-0.04em' }}>
          Account
        </h1>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginTop: 4 }}>
          Identity, security, and preferences
        </p>
      </div>

      <div className="px-5 mb-4">
        <ProfileCard onOpenProfile={() => navigate('edit-profile')} />
      </div>

      <div className="px-5 mb-4">
        <AccountHealthCard
          onKyc={() => navigate('kyc')}
          onSupport={() => navigate('support-center')}
        />
      </div>

      <ProfileQuickActions onNavigate={navigate} kycDone={isApproved} />

      <div className="px-5 space-y-1">
        <ListSection title="Account">
          <ListRow
            icon={User}
            label="Edit profile"
            desc="Name, photo, country"
            onClick={() => navigate('edit-profile')}
          />
          <ListRow
            icon={FileCheck}
            label="Identity verification"
            desc="KYC status and documents"
            onClick={() => navigate('kyc')}
            trailing={
              <RowTrail>
                <StatusPill label={kycLabel} tone={kycTone} />
              </RowTrail>
            }
          />
          <ListRow
            icon={Shield}
            label="Security"
            desc="PIN, sessions, whitelist"
            onClick={() => navigate('security')}
          />
          <ListRow
            icon={CreditCard}
            label="Payment methods"
            desc="Cards and bank accounts"
            onClick={() => navigate('payment-methods')}
          />
        </ListSection>

        <ListSection title="Activity">
          <ListRow
            icon={Gift}
            label={t('profile.rewards') || 'Rewards'}
            desc="Points and referrals"
            onClick={() => navigate('rewards')}
            trailing={
              points != null && Number.isFinite(points) ? (
                <RowTrail>
                  <StatusPill label={`${Math.round(points).toLocaleString()} pts`} tone="ok" />
                </RowTrail>
              ) : undefined
            }
          />
          <ListRow
            icon={Bell}
            label={t('profile.notifications') || 'Notifications'}
            desc="Inbox"
            onClick={() => navigate('notifications')}
            trailing={
              unread > 0 ? (
                <RowTrail>
                  <StatusPill label={unread > 9 ? '9+' : String(unread)} tone="warn" />
                </RowTrail>
              ) : undefined
            }
          />
        </ListSection>

        <ListSection title="Preferences">
          <ListRow
            icon={Settings}
            label="Settings"
            desc="Appearance, currency, alerts"
            onClick={() => navigate('settings')}
          />
        </ListSection>

        <ListSection title="Support">
          <ListRow
            icon={HelpCircle}
            label={t('profile.help') || 'Help center'}
            desc={t('profile.helpDesc') || 'Guides and FAQs'}
            onClick={() => navigate('help-center')}
          />
          <ListRow
            icon={Headphones}
            label={t('profile.support') || 'Support'}
            desc={t('profile.supportDesc') || 'Contact us'}
            onClick={() => navigate('support-center')}
          />
          <ListRow
            icon={Info}
            label={t('profile.about') || 'About'}
            desc={t('profile.aboutDesc') || 'Version and legal'}
            onClick={() => navigate('about')}
          />
        </ListSection>
      </div>

      <div className="px-5 mt-2">
        <ReferralBanner
          code={refCode || '—'}
          reward="Earn when friends join and trade"
          onOpen={() => setShowReferral(true)}
        />
      </div>

      <ReferralModal
        open={showReferral}
        onClose={() => setShowReferral(false)}
        code={refCode || '—'}
        reward={shareUrl || 'Rewards on referral'}
        shareUrl={shareUrl}
      />

      <div className="px-5 mt-4 mb-2">
        <SignOutButton onSignedOut={() => navigate('login')} />
      </div>

      <div style={{ height: 110 }} />
    </div>
  );
}
