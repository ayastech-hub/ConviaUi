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
  return `https://flagcdn.com/w40/${c}.png`;
}

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

/**
 * Premium identity card — restrained, bank-grade hierarchy.
 */
export function ProfileCard({ onOpenProfile }: ProfileCardProps) {
  const { userId, username: sessionUsername, displayName: sessionDisplayName, email, status } = useAuth();
  const { isApproved, isPending, isRejected, loading: kycLoading } = useKycStatus();
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

  const statusLabel = !authenticated
    ? null
    : isFrozen
      ? 'Restricted'
      : isApproved
        ? 'Verified'
        : isPending
          ? 'In review'
          : isRejected
            ? 'Action needed'
            : null;

  const Wrapper = onOpenProfile ? motion.button : motion.div;
  const wrapperProps = onOpenProfile
    ? { type: 'button' as const, onClick: onOpenProfile, whileTap: { scale: 0.985 } }
    : {};

  return (
    <Wrapper
      {...wrapperProps}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="w-full text-left"
    >
      <div
        className="relative overflow-hidden rounded-[28px] px-5 pt-5 pb-4"
        style={{
          background:
            'linear-gradient(165deg, color-mix(in oklab, var(--card) 100%, transparent) 0%, var(--card) 100%)',
          border: '1px solid var(--border)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
        }}
      >
        {/* soft ambient */}
        <div
          className="pointer-events-none absolute -top-20 -right-16 w-48 h-48 rounded-full"
          style={{
            background: 'radial-gradient(circle, color-mix(in oklab, var(--primary) 22%, transparent), transparent 70%)',
          }}
        />

        <div className="relative flex items-center gap-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0" style={{ width: 72, height: 72 }}>
            <div
              className="absolute inset-0 rounded-full"
              style={{
                padding: 2,
                background:
                  'linear-gradient(135deg, color-mix(in oklab, var(--primary) 80%, #fff), transparent 55%, color-mix(in oklab, var(--primary) 40%, transparent))',
              }}
            >
              <div
                className="w-full h-full rounded-full overflow-hidden flex items-center justify-center"
                style={{
                  background: avatarUrl
                    ? 'var(--muted)'
                    : 'linear-gradient(160deg, #1c2422 0%, #0e1211 100%)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12)',
                }}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt=""
                    width={68}
                    height={68}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span
                    style={{
                      color: '#F4F7F6',
                      fontWeight: 750,
                      fontSize: 24,
                      letterSpacing: '-0.05em',
                    }}
                  >
                    {initials}
                  </span>
                )}
              </div>
            </div>
            {isApproved && !isFrozen && (
              <span
                className="absolute bottom-0 right-0 w-[22px] h-[22px] rounded-full flex items-center justify-center"
                style={{
                  background: 'var(--card)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
                }}
              >
                <BadgeCheck size={14} style={{ color: 'var(--primary)' }} strokeWidth={2.4} />
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p
                className="truncate"
                style={{
                  color: 'var(--foreground)',
                  fontWeight: 750,
                  fontSize: 20,
                  letterSpacing: '-0.035em',
                  lineHeight: 1.15,
                }}
              >
                {displayName}
              </p>
              {isFrozen && <Snowflake size={15} style={{ color: 'var(--destructive)', flexShrink: 0 }} />}
              {(loading || kycLoading) && !profile && (
                <Loader size={13} className="animate-spin" style={{ color: 'var(--muted-foreground)' }} />
              )}
            </div>
            <p
              className="truncate"
              style={{ color: 'var(--muted-foreground)', fontSize: 13, marginTop: 3, fontWeight: 500 }}
            >
              {handle ? `@${handle}` : email || (userId ? `ID ${userId.slice(0, 8)}…` : 'Not signed in')}
            </p>

            <div className="flex flex-wrap items-center gap-1.5 mt-3">
              {statusLabel && (
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full"
                  style={{
                    background:
                      isFrozen || isRejected
                        ? 'color-mix(in oklab, var(--destructive) 14%, transparent)'
                        : isApproved
                          ? 'color-mix(in oklab, var(--positive) 14%, transparent)'
                          : 'var(--muted)',
                    color:
                      isFrozen || isRejected
                        ? 'var(--destructive)'
                        : isApproved
                          ? 'var(--positive)'
                          : 'var(--muted-foreground)',
                    fontSize: 11,
                    fontWeight: 650,
                  }}
                >
                  {statusLabel}
                </span>
              )}
              
              
            </div>
          </div>

          {onOpenProfile && (
            <ChevronRight size={18} style={{ color: 'var(--muted-foreground)', flexShrink: 0, opacity: 0.55 }} />
          )}
        </div>
      </div>
    </Wrapper>
  );
}
