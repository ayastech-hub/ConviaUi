import { motion } from 'motion/react';
import { BadgeCheck, Loader, Snowflake } from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import { useKycStatus } from '../../../shared/hooks/useKycStatus';
import { useMyProfile } from '../../../shared/hooks/useMyProfile';

/** Avatar initials, display name, username, KYC + frozen badge — from GET /profiles/me. */
export function ProfileCard() {
  const { userId, username: sessionUsername, displayName: sessionDisplayName, status } = useAuth();
  const { isApproved, kycStatus } = useKycStatus();
  const { profile, loading } = useMyProfile();
  const isFrozen = Boolean(profile?.isFrozen);

  const displayName =
    profile?.displayName || sessionDisplayName || profile?.username || sessionUsername || 'Convia user';
  const handle = profile?.username || sessionUsername;
  const country = profile?.country;
  const currency = profile?.preferredCurrency;
  const bio = profile?.bio;

  const initials = (displayName || 'C')
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  let statusLine = 'Sign in to sync profile';
  if (status === 'authenticated') {
    if (isFrozen) statusLine = 'Account frozen';
    else if (isApproved) statusLine = 'Verified · KYC approved';
    else statusLine = `KYC: ${kycStatus}`;
  }

  return (
    <div className="px-5 mb-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[20px] p-4"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--muted)' }}
          >
            <span style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 20 }}>{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 18 }} className="truncate">
                {displayName}
              </p>
              {isApproved && !isFrozen && (
                <BadgeCheck size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              )}
              {isFrozen && <Snowflake size={18} style={{ color: '#EF4444', flexShrink: 0 }} />}
              {loading && !profile && (
                <Loader size={14} className="animate-spin" style={{ color: 'var(--muted-foreground)' }} />
              )}
            </div>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }} className="truncate">
              {handle ? `@${handle}` : userId ? `ID ${userId.slice(0, 8)}…` : 'Not signed in'}
            </p>
            <p
              style={{
                color: isFrozen ? '#EF4444' : 'var(--muted-foreground)',
                fontSize: 11,
                marginTop: 4,
                fontWeight: isFrozen ? 600 : 400,
              }}
            >
              {statusLine}
            </p>
          </div>
        </div>
        {(bio || country || currency) && (
          <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
            {bio && (
              <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 6 }} className="line-clamp-2">
                {bio}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {country && (
                <span
                  className="px-2 py-0.5 rounded-md"
                  style={{ background: 'var(--muted)', color: 'var(--foreground)', fontSize: 11, fontWeight: 600 }}
                >
                  {country}
                </span>
              )}
              {currency && (
                <span
                  className="px-2 py-0.5 rounded-md"
                  style={{ background: 'var(--muted)', color: 'var(--foreground)', fontSize: 11, fontWeight: 600 }}
                >
                  {currency}
                </span>
              )}
              {isFrozen && (
                <span
                  className="px-2 py-0.5 rounded-md"
                  style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', fontSize: 11, fontWeight: 700 }}
                >
                  Frozen
                </span>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
