import { motion } from 'motion/react';
import { ShieldCheck, ShieldAlert, Clock, Snowflake, ChevronRight } from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import { useKycStatus } from '../../../shared/hooks/useKycStatus';
import { useMyProfile } from '../../../shared/hooks/useMyProfile';

interface AccountHealthCardProps {
  onKyc: () => void;
  onSupport: () => void;
}

/**
 * First-class trust strip on the account face — KYC / freeze / access, not buried in a list row.
 */
export function AccountHealthCard({ onKyc, onSupport }: AccountHealthCardProps) {
  const { status } = useAuth();
  const { isApproved, isPending, isRejected, needsKyc, loading } = useKycStatus();
  const { profile } = useMyProfile();
  const frozen = Boolean(profile?.isFrozen);

  if (status !== 'authenticated' || loading) return null;

  let title = 'Full access';
  let body = 'Identity verified. Withdrawals, bills, and off-ramp are available.';
  let Icon = ShieldCheck;
  let iconColor = 'var(--positive)';
  let action: { label: string; onClick: () => void } | null = null;

  if (frozen) {
    title = 'Account frozen';
    body = profile?.frozenReason || 'Outgoing transfers are blocked. Contact support to restore access.';
    Icon = Snowflake;
    iconColor = 'var(--destructive)';
    action = { label: 'Contact support', onClick: onSupport };
  } else if (isRejected) {
    title = 'Verification failed';
    body = 'Resubmit your documents to restore withdrawals and bill payments.';
    Icon = ShieldAlert;
    iconColor = 'var(--destructive)';
    action = { label: 'Fix KYC', onClick: onKyc };
  } else if (isPending) {
    title = 'Identity in review';
    body = 'Some limits stay on until compliance approves your documents.';
    Icon = Clock;
    iconColor = 'var(--warning)';
    action = { label: 'View status', onClick: onKyc };
  } else if (needsKyc) {
    title = 'Verify to unlock';
    body = 'Required for withdrawals, off-ramp, and bill payments.';
    Icon = ShieldAlert;
    iconColor = 'var(--primary)';
    action = { label: 'Start KYC', onClick: onKyc };
  } else if (isApproved) {
    title = 'Verified account';
    body = 'Full access to withdrawals, bills, and off-ramp.';
    Icon = ShieldCheck;
    iconColor = 'var(--positive)';
  }

  return (
    <div className="px-5 mb-5">
      <motion.button
        type="button"
        whileTap={{ scale: 0.99 }}
        onClick={action?.onClick ?? onKyc}
        className="w-full text-left rounded-[20px] px-4 py-3.5 flex items-center gap-3"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--muted)' }}
        >
          <Icon size={18} style={{ color: iconColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14, letterSpacing: '-0.01em' }}>{title}</p>
          <p className="line-clamp-2" style={{ color: 'var(--muted-foreground)', fontSize: 12, marginTop: 2, lineHeight: 1.4 }}>
            {body}
          </p>
        </div>
        {action ? (
          <span
            className="flex-shrink-0 px-2.5 py-1.5 rounded-xl"
            style={{ background: 'var(--muted)', color: 'var(--foreground)', fontSize: 11, fontWeight: 600 }}
          >
            {action.label}
          </span>
        ) : (
          <ChevronRight size={16} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
        )}
      </motion.button>
    </div>
  );
}
