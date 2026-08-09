import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { BadgeCheck, Loader } from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import { useKycStatus } from '../../../shared/hooks/useKycStatus';
import * as profileApi from '../../../shared/api/profile';
import type { UserProfile } from '../../../shared/api/profile';

/** Avatar, name, username, KYC badge — loaded from GET /profiles/:username when known. */
export function ProfileCard() {
  const { userId, username, status } = useAuth();
  const { isApproved, kycStatus } = useKycStatus();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!username) {
      setProfile(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    profileApi
      .getPublicProfile(username)
      .then((p) => {
        if (!cancelled) setProfile(p);
      })
      .catch(() => {
        if (!cancelled) setProfile({ username });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [username]);

  const displayName = profile?.displayName || username || 'Convia user';
  const handle = username ? `@${username}` : userId ? `ID ${userId.slice(0, 8)}…` : 'Not signed in';
  const initials = (displayName || 'C')
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="px-5 mb-5">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[24px] p-5 flex items-center gap-4"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden"
          style={{ background: 'var(--muted)' }}
        >
          {profile?.avatarUrl ? (
            <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <span style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 20 }}>{initials}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 18 }} className="truncate">
              {loading ? '…' : displayName}
            </p>
            {isApproved && <BadgeCheck size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />}
          </div>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }} className="truncate">
            {handle}
          </p>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 11, marginTop: 4 }}>
            {status === 'authenticated'
              ? isApproved
                ? 'Verified · KYC approved'
                : `KYC: ${kycStatus}`
              : 'Sign in to sync profile'}
          </p>
        </div>
        {loading && <Loader size={16} className="animate-spin" style={{ color: 'var(--muted-foreground)' }} />}
      </motion.div>
    </div>
  );
}
