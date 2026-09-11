import { useState, useEffect } from 'react';
import { AlertTriangle, ShieldAlert, Ban, Snowflake, ChevronRight, X, Info, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
    body: 'Complete identity verification to unlock this feature.',
    icon: ShieldAlert,
    tone: 'warn',
  },
  kyc_pending: {
    title: 'Verification in review',
    body: 'Your KYC is pending. This feature unlocks after approval.',
    icon: Info,
    tone: 'info',
  },
  country_feature_suspended: {
    title: 'Unavailable in your region',
    body: 'This feature is suspended for your country.',
    icon: Ban,
    tone: 'danger',
  },
  account_frozen: {
    title: 'Account frozen',
    body: 'Contact support before transfers or withdrawals.',
    icon: Snowflake,
    tone: 'danger',
  },
  address_not_whitelisted: {
    title: 'Address not whitelisted',
    body: 'Add this destination under Security → Whitelist, then retry.',
    icon: AlertTriangle,
    tone: 'warn',
  },
  limit_exceeded: {
    title: 'Limit exceeded',
    body: 'Lower the amount or complete a higher KYC tier.',
    icon: AlertTriangle,
    tone: 'warn',
  },
  generic: {
    title: 'Action blocked',
    body: 'This action was refused. Check details or try again.',
    icon: XCircle,
    tone: 'warn',
  },
};

const TONE = {
  warn: {
    accent: 'var(--warning)',
    bg: 'color-mix(in oklab, var(--warning) 12%, var(--card))',
    border: 'color-mix(in oklab, var(--warning) 32%, var(--border))',
  },
  danger: {
    accent: 'var(--destructive)',
    bg: 'color-mix(in oklab, var(--destructive) 12%, var(--card))',
    border: 'color-mix(in oklab, var(--destructive) 32%, var(--border))',
  },
  info: {
    accent: 'var(--primary)',
    bg: 'color-mix(in oklab, var(--primary) 12%, var(--card))',
    border: 'color-mix(in oklab, var(--primary) 28%, var(--border))',
  },
};

export function mapApiCodeToReason(code?: string): FeatureBlockReason {
  if (!code) return 'generic';
  const c = code.toLowerCase();
  if (c.includes('kyc') && c.includes('pend')) return 'kyc_pending';
  if (c.includes('kyc') || c === 'complete_kyc') return 'kyc_required';
  if (c.includes('country') || c.includes('suspended')) return 'country_feature_suspended';
  if (c.includes('frozen')) return 'account_frozen';
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
  /** When true, sits as overlay-friendly fixed toast style — default inline */
  floating?: boolean;
}

/**
 * Enterprise feature-block / error banner.
 * Absolute-safe: dismiss does not reflow surrounding content when floating.
 * Inline mode uses reserved min-height so dismiss doesn't jump UI.
 */
export function FeatureAlert({
  reason,
  message,
  detail,
  onAction,
  actionLabel = 'Continue',
  floating = true,
}: FeatureAlertProps) {
  const [open, setOpen] = useState(true);
  const copy = COPY[reason] || COPY.generic;

  // Auto-hide even if user never taps X
  useEffect(() => {
    const t = window.setTimeout(() => setOpen(false), 4000);
    return () => window.clearTimeout(t);
  }, [reason, message, detail]);

  const tone = TONE[copy.tone];
  const Icon = copy.icon;
  const body = message || copy.body;

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: floating ? 12 : 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: floating ? 10 : -4, height: floating ? undefined : 0, marginBottom: 0 }}
          transition={{ duration: 0.22 }}
          className={floating ? '' : 'mb-3'}
          style={
            floating
              ? {
                  position: 'fixed',
                  bottom: 'max(96px, calc(env(safe-area-inset-bottom) + 80px))',
                  left: 16,
                  right: 16,
                  zIndex: 9998,
                  maxWidth: 420,
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  width: 'auto',
                }
              : undefined
          }
        >
          <div
            className="relative overflow-hidden rounded-[18px] px-3.5 py-3 flex gap-3 items-start"
            style={{
              background: tone.bg,
              border: `1px solid ${tone.border}`,
              boxShadow: floating ? '0 16px 40px rgba(0,0,0,0.35)' : '0 4px 16px rgba(0,0,0,0.08)',
            }}
            role="alert"
          >
            <span className="absolute left-0 top-0 bottom-0 w-1" style={{ background: tone.accent }} />
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'color-mix(in oklab, var(--background) 50%, transparent)' }}
            >
              <Icon size={17} style={{ color: tone.accent }} strokeWidth={2.25} />
            </div>
            <div className="flex-1 min-w-0">
              <p style={{ color: 'var(--foreground)', fontWeight: 750, fontSize: 13.5, letterSpacing: '-0.02em' }}>
                {copy.title}
              </p>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 12.5, marginTop: 3, lineHeight: 1.4 }}>
                {body}
              </p>
              {detail && (
                <p
                  style={{
                    color: 'var(--muted-foreground)',
                    fontSize: 11,
                    marginTop: 6,
                    fontFamily: 'ui-monospace, monospace',
                    opacity: 0.75,
                  }}
                >
                  {detail}
                </p>
              )}
              {onAction && (
                <button
                  type="button"
                  onClick={onAction}
                  className="inline-flex items-center gap-1 mt-2.5"
                  style={{ color: tone.accent, fontWeight: 700, fontSize: 12.5 }}
                >
                  {actionLabel}
                  <ChevronRight size={14} />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
