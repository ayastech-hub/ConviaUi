import { useState, useEffect, type ReactNode } from 'react';
import { motion } from 'motion/react';
import {
  Shield, Gift, Settings, TrendingUp, Bell, Moon, Sun,
  CreditCard, HelpCircle, User, FileCheck, Info, Headphones, ChevronRight,
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

export function ProfileScreen({ navigate, darkMode, toggleDark }: ProfileScreenProps) {
  const { t } = useLanguage();
  const { userId, status } = useAuth();
  const { isApproved, isPending, kycStatus } = useKycStatus();
  const [showReferral, setShowReferral] = useState(false);
  const [refCode, setRefCode] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [points, setPoints] = useState<number | null>(null);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!userId || status !== 'authenticated') {
      setRefCode('');
      setShareUrl('');
      setPoints(null);
      setUnread(0);
      return;
    }
    rewardsApi
      .getReferralCode(userId)
      .then((r) => {
        setRefCode(r.code);
        setShareUrl(r.shareUrl || '');
      })
      .catch(() => setRefCode(''));
    rewardsApi
      .getRewardsProfile(userId)
      .then((r) => {
        const n = r.points ?? r.balance ?? r.xp;
        setPoints(typeof n === 'number' ? n : n != null ? Number(n) : null);
      })
      .catch(() => setPoints(null));
    notifApi
      .listNotifications(userId, 30)
      .then((list) => {
        setUnread((Array.isArray(list) ? list : []).filter((n: { readAt?: string }) => !n.readAt).length);
      })
      .catch(() => setUnread(0));
  }, [userId, status]);

  const kycDesc = isApproved
    ? 'Documents approved'
    : isPending
      ? `In review · ${kycStatus}`
      : 'Required for withdrawals';

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--background)' }}>
      <PageTop />

      <div className="flex items-start justify-between px-5 mb-5">
        <div>
          <h2
            style={{
              color: 'var(--foreground)',
              fontWeight: 700,
              fontSize: 26,
              letterSpacing: '-0.04em',
              lineHeight: 1.1,
            }}
          >
            Account
          </h2>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginTop: 4 }}>
            Identity, security, and preferences
          </p>
        </div>
        <motion.button
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={toggleDark}
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
        >
          {darkMode ? (
            <Sun size={17} style={{ color: 'var(--foreground)' }} />
          ) : (
            <Moon size={17} style={{ color: 'var(--foreground)' }} />
          )}
        </motion.button>
      </div>

      <ProfileCard onOpenProfile={() => navigate('edit-profile')} />

      <AccountHealthCard onKyc={() => navigate('kyc')} onSupport={() => navigate('support-center')} />

      <ProfileQuickActions onNavigate={navigate} kycDone={isApproved} />

      <div className="px-5">
        <ListSection title="ACCOUNT">
          <ListRow
            icon={User}
            label={t('profile.edit')}
            desc={t('profile.editDesc')}
            onClick={() => navigate('edit-profile')}
          />
          <ListRow
            icon={Shield}
            label={t('profile.security')}
            desc={t('profile.securityDesc')}
            onClick={() => navigate('security')}
          />
          <ListRow
            icon={CreditCard}
            label={t('profile.payments')}
            desc={t('profile.paymentsDesc')}
            onClick={() => navigate('payment-methods')}
          />
          <ListRow
            icon={FileCheck}
            label={t('profile.kyc')}
            desc={kycDesc}
            onClick={() => navigate('kyc')}
            trailing={
              <RowTrail>
                <StatusPill
                  label={isApproved ? 'Verified' : isPending ? 'Review' : 'Required'}
                  tone={isApproved ? 'ok' : isPending ? 'warn' : 'muted'}
                />
              </RowTrail>
            }
          />
        </ListSection>

        <ListSection title="ACTIVITY">
          <ListRow
            icon={Gift}
            label={t('profile.rewards')}
            desc="Points, missions, streaks"
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
            icon={TrendingUp}
            label={t('profile.portfolio')}
            desc="Holdings and performance"
            onClick={() => navigate('portfolio')}
          />
          <ListRow
            icon={Bell}
            label={t('profile.notifications')}
            desc="Inbox and alerts"
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

        <ListSection title="SUPPORT">
          <ListRow
            icon={HelpCircle}
            label={t('profile.help')}
            desc={t('profile.helpDesc')}
            onClick={() => navigate('help-center')}
          />
          <ListRow
            icon={Headphones}
            label={t('profile.support')}
            desc={t('profile.supportDesc')}
            onClick={() => navigate('support-center')}
          />
          <ListRow
            icon={Info}
            label={t('profile.about')}
            desc={t('profile.aboutDesc')}
            onClick={() => navigate('about')}
          />
        </ListSection>

        <ListSection>
          <ListRow
            icon={Settings}
            label={t('profile.settings')}
            desc="Language, currency, appearance"
            onClick={() => navigate('settings')}
          />
        </ListSection>
      </div>

      <ReferralBanner
        code={refCode || '—'}
        reward="Rewards on every successful referral"
        onOpen={() => setShowReferral(true)}
      />
      <ReferralModal
        open={showReferral}
        onClose={() => setShowReferral(false)}
        code={refCode || '—'}
        reward={shareUrl || 'Rewards on referral'}
      />

      <div className="px-5 mb-2">
        <SignOutButton onSignedOut={() => navigate('login')} />
      </div>

      <div style={{ height: 100 }} />
    </div>
  );
}
