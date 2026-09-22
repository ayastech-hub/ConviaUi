import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Settings,
  Headphones,
  Share2,
  Bell,
  ChevronRight,
  Gift,
  CreditCard,
  ArrowDownLeft,
  History,
  FileCheck,
  Shield,
  type LucideIcon,
} from 'lucide-react';
import type { Screen } from '../../../shared/data/mockData';
import { useAuth } from '../../../shared/context/AuthContext';
import { useKycStatus } from '../../../shared/hooks/useKycStatus';
import { useMyProfile } from '../../../shared/hooks/useMyProfile';
import { useWalletAssets } from '../../../shared/hooks/useWalletAssets';
import { useCurrency } from '../../../shared/context/CurrencyContext';
import { useNotifications } from '../../../shared/hooks/useNotifications';
import { PageTop } from '../../../shared/components/PageTop';
import { SignOutButton } from '../components/SignOutButton';

interface ProfileScreenProps {
  navigate: (s: Screen, param?: string) => void;
  darkMode: boolean;
  toggleDark: () => void;
  goBack?: () => void;
}

function maskEmail(email?: string | null) {
  if (!email) return '—';
  const [u, d] = email.split('@');
  if (!d) return email;
  if (u.length <= 3) return `${u[0] || ''}***@${d}`;
  return `${u.slice(0, 3)}***${u.slice(-1)}@${d}`;
}

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'C';
}

const RECENT_SHORTCUTS: { label: string; Icon: LucideIcon; screen: Screen }[] = [
  { label: 'Rewards', Icon: Gift, screen: 'rewards' },
  { label: 'Buy crypto', Icon: CreditCard, screen: 'onramp' },
  { label: 'Deposit', Icon: ArrowDownLeft, screen: 'deposit' },
  { label: 'History', Icon: History, screen: 'history' },
];

/**
 * Account hub (profile tab) — Bitget-style overview.
 * Settings is a separate screen opened from the gear icon.
 */
export function ProfileScreen({ navigate, goBack }: ProfileScreenProps) {
  const { email, username: sessionUsername, displayName: sessionDisplayName, status } = useAuth();
  const { profile } = useMyProfile();
  const { isApproved, isPending, isRejected } = useKycStatus();
  const { totalValueUsd } = useWalletAssets();
  const { currency, convert } = useCurrency();
  const { data: notifItems, unread } = useNotifications(8);

  const displayName =
    profile?.displayName || sessionDisplayName || profile?.username || sessionUsername || 'Convia user';
  const handle = profile?.username || sessionUsername;
  const avatarUrl = profile?.avatarUrl || null;
  const initials = initialsOf(displayName);

  const bal = convert(Number(totalValueUsd) || 0);
  const balStr =
    status === 'authenticated'
      ? `${currency.symbol || ''}${bal.toLocaleString(undefined, {
          maximumFractionDigits: (currency.rate || 1) > 100 ? 0 : 2,
        })}`
      : '—';

  const kycLabel = isApproved
    ? 'Verified'
    : isPending
      ? 'In review'
      : isRejected
        ? 'Action needed'
        : 'Verify identity';

  const recentNotifs = useMemo(() => (notifItems || []).slice(0, 3), [notifItems]);

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--background)' }}>
      <PageTop />

      {/* Top bar: close · settings / support */}
      <div className="flex items-center justify-between px-4 pt-1 pb-3">
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={() => (goBack ? goBack() : navigate('home'))}
          aria-label="Close"
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
        >
          <X size={18} style={{ color: 'var(--foreground)' }} />
        </motion.button>
        <div className="flex items-center gap-2">
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('support-center')}
            aria-label="Support"
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
          >
            <Headphones size={18} style={{ color: 'var(--foreground)' }} />
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('settings')}
            aria-label="Settings"
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
          >
            <Settings size={18} style={{ color: 'var(--foreground)' }} />
          </motion.button>
        </div>
      </div>

      {/* Identity row */}
      <div className="px-4 mb-4">
        <div className="flex items-center gap-3">
          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('edit-profile')}
            className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden shrink-0"
            style={{
              background: 'color-mix(in oklab, var(--primary) 25%, var(--muted))',
              border: '1px solid color-mix(in oklab, var(--primary) 40%, var(--border))',
            }}
            aria-label="Edit profile"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 15 }}>{initials}</span>
            )}
          </motion.button>

          <div className="flex-1 min-w-0">
            <p
              className="truncate"
              style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 15 }}
            >
              {handle ? `@${handle}` : maskEmail(email || profile?.email)}
            </p>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginTop: 2 }}>{balStr}</p>
          </div>

          {/* KYC instead of “Add wallet” */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('kyc')}
            className="shrink-0 rounded-full px-3.5 py-2 flex items-center gap-1.5"
            style={{
              background: 'var(--muted)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            <FileCheck size={14} style={{ color: isApproved ? 'var(--positive)' : 'var(--primary)' }} />
            {kycLabel}
          </motion.button>
        </div>
      </div>

      <div className="px-4 flex flex-col gap-3 pb-28">
        {/* Notifications preview */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.99 }}
          onClick={() => navigate('notifications')}
          className="w-full rounded-2xl p-4 text-left"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>Notifications</p>
            <div className="flex items-center gap-1.5">
              {unread > 0 && (
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: 'var(--destructive)' }}
                />
              )}
              <ChevronRight size={16} style={{ color: 'var(--muted-foreground)' }} />
            </div>
          </div>
          {recentNotifs.length === 0 ? (
            <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>No notifications yet</p>
          ) : (
            <div className="flex flex-col gap-3">
              {recentNotifs.map((n) => (
                <div key={n.id} className="flex items-start gap-2.5">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: 'var(--muted)' }}
                  >
                    <Bell size={14} style={{ color: 'var(--muted-foreground)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="truncate"
                      style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 500 }}
                    >
                      {n.title || n.body || 'Update'}
                    </p>
                  </div>
                  <span
                    className="shrink-0 tabular-nums"
                    style={{ color: 'var(--muted-foreground)', fontSize: 11 }}
                  >
                    {n.createdAt
                      ? new Date(n.createdAt).toLocaleTimeString(undefined, {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.button>

        {/* Recently used */}
        <div
          className="rounded-2xl p-4"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15, marginBottom: 14 }}>
            Recently used
          </p>
          <div className="grid grid-cols-4 gap-2">
            {RECENT_SHORTCUTS.map((s) => (
              <motion.button
                key={s.label}
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={() => navigate(s.screen)}
                className="flex flex-col items-center gap-2"
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
                >
                  <s.Icon size={20} style={{ color: 'var(--primary)' }} />
                </div>
                <span
                  className="text-center leading-tight"
                  style={{ color: 'var(--foreground)', fontSize: 11, fontWeight: 500 }}
                >
                  {s.label}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Recent transactions teaser */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.99 }}
          onClick={() => navigate('history')}
          className="w-full rounded-2xl p-4 text-left"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>
              Recent transactions
            </p>
            <ChevronRight size={16} style={{ color: 'var(--muted-foreground)' }} />
          </div>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 13, textAlign: 'center', padding: '16px 0 8px' }}>
            View full history
          </p>
        </motion.button>

        {/* Quick links into settings areas */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <Row
            icon={Shield}
            label="Security"
            onClick={() => navigate('security')}
          />
          <Row
            icon={Settings}
            label="Settings"
            onClick={() => navigate('settings')}
            last
          />
        </div>

        <div className="pt-2">
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  onClick,
  last,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  last?: boolean;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
      style={{ borderBottom: last ? undefined : '1px solid var(--border)' }}
    >
      <Icon size={18} style={{ color: 'var(--foreground)' }} />
      <span className="flex-1" style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>
        {label}
      </span>
      <ChevronRight size={16} style={{ color: 'var(--muted-foreground)' }} />
    </motion.button>
  );
}
