import { motion } from 'motion/react';
import { BadgeCheck, ChevronRight, Snowflake, Loader } from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import { useKycStatus } from '../../../shared/hooks/useKycStatus';
import { useMyProfile } from '../../../shared/hooks/useMyProfile';
import { CurrencyIcon } from '../../../shared/icons/CurrencyIcon';

interface ProfileCardProps {
  onOpenProfile?: () => void;
}

function countryFlagUrl(code?: string | null) {
  const c = (code || '').trim().toLowerCase();
  if (c.length !== 2) return null;
  return `https://flagcdn.com/w80/${c}.png`;
}

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function kycChip(opts: {
  authenticated: boolean;
  frozen: boolean;
  approved: boolean;
  pending: boolean;
  rejected: boolean;
  status: string;
}) {
  if (!opts.authenticated) return { label: 'Guest', tone: 'muted' as const };
  if (opts.frozen) return { label: 'Frozen', tone: 'danger' as const };
  if (opts.approved) return { label: 'Verified', tone: 'ok' as const };
  if (opts.pending) return { label: 'In review', tone: 'warn' as const };
  if (opts.rejected) return { label: 'Action required', tone: 'danger' as const };
  return { label: opts.status === 'none' ? 'Unverified' : opts.status, tone: 'muted' as const };
}

const TONE: Record<'ok' | 'warn' | 'danger' | 'muted', { fg: string; bg: string }> = {
  ok: { fg: 'var(--positive)', bg: 'color-mix(in oklab, var(--positive) 14%, transparent)' },
  warn: { fg: 'var(--warning)', bg: 'color-mix(in oklab, var(--warning) 16%, transparent)' },
  danger: { fg: 'var(--destructive)', bg: 'color-mix(in oklab, var(--destructive) 14%, transparent)' },
  muted: { fg: 'var(--muted-foreground)', bg: 'var(--muted)' },
};

/**
 * Identity face of the account hub — live name, avatar, KYC, country, currency.
 * Tapping opens Edit Profile.
 */
export function ProfileCard({ onOpenProfile }: ProfileCardProps) {
  const { userId, username: sessionUsername, displayName: sessionDisplayName, email, status } = useAuth();
  const { isApproved, isPending, isRejected, kycStatus, loading: kycLoading } = useKycStatus();
  const { profile, loading } = useMyProfile();
  const isFrozen = Boolean(profile?.isFrozen);
  const authenticated = status === 'authenticated';

  const displayName =
    profile?.displayName || sessionDisplayName || profile?.username || sessionUsername || 'Convia user';
  const handle = profile?.username || sessionUsername;
  const country = profile?.country;
  const currency = profile?.preferredCurrency;
  const avatarUrl = profile?.avatarUrl || null;
  const initials = initialsOf(displayName || 'C');
  const flag = countryFlagUrl(country);
  const chip = kycChip({
    authenticated,
    frozen: isFrozen,
    approved: isApproved,
    pending: isPending,
    rejected: isRejected,
    status: kycStatus,
  });
  const tone = TONE[chip.tone];

  const checks = [
    Boolean(profile?.displayName || sessionDisplayName),
    Boolean(avatarUrl),
    Boolean(country),
    Boolean(currency),
    isApproved,
  ];
  const done = checks.filter(Boolean).length;
  const pct = Math.round((done / checks.length) * 100);
  const setupHint =
    !authenticated
      ? 'Sign in to sync your identity'
      : isFrozen
        ? profile?.frozenReason || 'Transfers and withdrawals are blocked'
        : !isApproved
          ? isPending
            ? 'Identity in review — full limits after approval'
            : 'Verify identity to unlock withdrawals and bills'
          : pct < 100
            ? 'Add a photo and country to complete your profile'
            : 'Account in good standing';

  const Wrapper = onOpenProfile ? motion.button : motion.div;
  const wrapperProps = onOpenProfile
    ? { type: 'button' as const, whileTap: { scale: 0.99 }, onClick: onOpenProfile }
    : {};

  return (
    <div className="px-5 mb-4">
      <Wrapper
        {...wrapperProps}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="w-full text-left rounded-[24px] p-4"
        style={{
          background: 'var(--card)',
          border: `1px solid ${isFrozen ? 'color-mix(in oklab, var(--destructive) 45%, var(--border))' : 'var(--border)'}`,
        }}
      >
        <div className="flex items-start gap-3.5">
          <div
            className="relative flex-shrink-0 rounded-[18px] overflow-hidden flex items-center justify-center"
            style={{
              width: 64,
              height: 64,
              background: avatarUrl ? 'var(--muted)' : 'color-mix(in oklab, var(--primary) 18%, var(--muted))',
            }}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="" width={64} height={64} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 22, letterSpacing: '-0.04em' }}>
                {initials}
              </span>
            )}
            {isApproved && !isFrozen && (
              <span
                className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: 'var(--card)', border: '2px solid var(--card)' }}
              >
                <BadgeCheck size={16} style={{ color: 'var(--primary)' }} />
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0 pt-0.5">
            <div className="flex items-center gap-1.5">
              <p
                className="truncate"
                style={{
                  color: 'var(--foreground)',
                  fontWeight: 700,
                  fontSize: 18,
                  letterSpacing: '-0.03em',
                  lineHeight: 1.2,
                }}
              >
                {displayName}
              </p>
              {isFrozen && <Snowflake size={16} style={{ color: 'var(--destructive)', flexShrink: 0 }} />}
              {(loading || kycLoading) && !profile && (
                <Loader size={13} className="animate-spin" style={{ color: 'var(--muted-foreground)' }} />
              )}
            </div>
            <p className="truncate" style={{ color: 'var(--muted-foreground)', fontSize: 13, marginTop: 2 }}>
              {handle ? `@${handle}` : email || (userId ? `ID ${userId.slice(0, 8)}…` : 'Not signed in')}
            </p>
            <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
              <span
                className="px-2 py-0.5 rounded-full"
                style={{
                  background: tone.bg,
                  color: tone.fg,
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.01em',
                }}
              >
                {chip.label}
              </span>
              {country && (
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
                  style={{ background: 'var(--muted)', color: 'var(--foreground)', fontSize: 11, fontWeight: 600 }}
                >
                  {flag && (
                    <img
                      src={flag}
                      alt=""
                      width={12}
                      height={9}
                      style={{ width: 12, height: 9, objectFit: 'cover', borderRadius: 1 }}
                    />
                  )}
                  {String(country).toUpperCase()}
                </span>
              )}
              {currency && (
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
                  style={{ background: 'var(--muted)', color: 'var(--foreground)', fontSize: 11, fontWeight: 600 }}
                >
                  <CurrencyIcon code={currency} size={12} />
                  {String(currency).toUpperCase()}
                </span>
              )}
            </div>
          </div>
          {onOpenProfile && (
            <ChevronRight size={16} style={{ color: 'var(--muted-foreground)', marginTop: 8, flexShrink: 0 }} />
          )}
        </div>

        <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-1.5">
            <p style={{ color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600, letterSpacing: '0.04em' }}>
              PROFILE
            </p>
            <p style={{ color: 'var(--foreground)', fontSize: 11, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
              {authenticated ? `${pct}%` : '—'}
            </p>
          </div>
          <div
            className="h-1 rounded-full overflow-hidden"
            style={{ background: 'var(--muted)' }}
            role="progressbar"
            aria-valuenow={authenticated ? pct : 0}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${authenticated ? pct : 0}%`,
                background: isFrozen ? 'var(--destructive)' : 'var(--primary)',
                transition: 'width 350ms cubic-bezier(0.22, 1, 0.36, 1)',
              }}
            />
          </div>
          <p style={{ color: isFrozen ? 'var(--destructive)' : 'var(--muted-foreground)', fontSize: 12, marginTop: 8, lineHeight: 1.4 }}>
            {setupHint}
          </p>
        </div>
      </Wrapper>
    </div>
  );
}
