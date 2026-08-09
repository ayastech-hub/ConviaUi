import { AlertTriangle, ShieldAlert, Ban, Snowflake, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

export type FeatureBlockReason =
  | 'kyc_required'
  | 'kyc_pending'
  | 'country_feature_suspended'
  | 'account_frozen'
  | 'address_not_whitelisted'
  | 'limit_exceeded'
  | 'generic';

const COPY: Record<
  FeatureBlockReason,
  { title: string; body: string; icon: typeof AlertTriangle; tone: 'warn' | 'danger' | 'info' }
> = {
  kyc_required: {
    title: 'Verification required',
    body: 'Complete identity verification (KYC) to unlock this feature. Backend will reject the request until you are approved.',
    icon: ShieldAlert,
    tone: 'warn',
  },
  kyc_pending: {
    title: 'Verification in review',
    body: 'Your KYC is pending. This feature stays locked until approval.',
    icon: ShieldAlert,
    tone: 'info',
  },
  country_feature_suspended: {
    title: 'Feature unavailable in your region',
    body: 'This product surface is suspended for your country. Try again later or contact support.',
    icon: Ban,
    tone: 'danger',
  },
  account_frozen: {
    title: 'Account frozen',
    body: 'Your account is frozen. Contact support before initiating transfers or withdrawals.',
    icon: Snowflake,
    tone: 'danger',
  },
  address_not_whitelisted: {
    title: 'Address not whitelisted',
    body: 'Add this destination under Security → Withdrawal whitelist, wait for the cooldown, then retry.',
    icon: AlertTriangle,
    tone: 'warn',
  },
  limit_exceeded: {
    title: 'Limit exceeded',
    body: 'This amount exceeds your tier limit. Lower the amount or complete higher KYC tier.',
    icon: AlertTriangle,
    tone: 'warn',
  },
  generic: {
    title: 'Action blocked',
    body: 'The server refused this action. Check the details below or try again later.',
    icon: AlertTriangle,
    tone: 'warn',
  },
};

const TONE_BG: Record<string, string> = {
  warn: 'rgba(245, 158, 11, 0.12)',
  danger: 'rgba(239, 68, 68, 0.12)',
  info: 'rgba(74, 155, 146, 0.12)',
};
const TONE_FG: Record<string, string> = {
  warn: '#D97706',
  danger: '#EF4444',
  info: 'var(--primary)',
};

export function mapApiCodeToReason(code?: string): FeatureBlockReason {
  if (!code) return 'generic';
  const c = code.toLowerCase();
  if (c.includes('kyc') && c.includes('pend')) return 'kyc_pending';
  if (c.includes('kyc') || c === 'complete_kyc') return 'kyc_required';
  if (c.includes('country') || c.includes('suspended')) return 'country_feature_suspended';
  if (c.includes('freeze') || c.includes('frozen')) return 'account_frozen';
  if (c.includes('whitelist')) return 'address_not_whitelisted';
  if (c.includes('limit')) return 'limit_exceeded';
  return 'generic';
}

interface FeatureAlertProps {
  reason: FeatureBlockReason;
  message?: string;
  detail?: string;
  onAction?: () => void;
  actionLabel?: string;
  compact?: boolean;
}

/** Blocking / informational banner for KYC, regional suspension, freeze, whitelist, limits. */
export function FeatureAlert({
  reason,
  message,
  detail,
  onAction,
  actionLabel,
  compact,
}: FeatureAlertProps) {
  const meta = COPY[reason] || COPY.generic;
  const Icon = meta.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[16px] p-3.5 flex gap-3"
      style={{
        background: TONE_BG[meta.tone],
        border: `1px solid ${TONE_FG[meta.tone]}33`,
        marginBottom: compact ? 8 : 12,
      }}
    >
      <Icon size={18} style={{ color: TONE_FG[meta.tone], flexShrink: 0, marginTop: 2 }} />
      <div className="flex-1 min-w-0">
        <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 13 }}>{meta.title}</p>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 12, lineHeight: 1.45, marginTop: 2 }}>
          {message || meta.body}
        </p>
        {detail && (
          <p style={{ color: 'var(--muted-foreground)', fontSize: 11, marginTop: 4, opacity: 0.85 }}>{detail}</p>
        )}
        {onAction && (
          <button
            type="button"
            onClick={onAction}
            className="flex items-center gap-1 mt-2"
            style={{ color: TONE_FG[meta.tone], fontSize: 12, fontWeight: 700 }}
          >
            {actionLabel || 'Resolve'} <ChevronRight size={14} />
          </button>
        )}
      </div>
    </motion.div>
  );
}
