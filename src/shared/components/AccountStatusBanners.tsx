import { ShieldAlert, Snowflake } from 'lucide-react';
import { useAccountGates } from '../hooks/useAccountGates';
import { useAuth } from '../context/AuthContext';

/** Home / wallet top banners for freeze + incomplete KYC. */
export function AccountStatusBanners({ onKyc }: { onKyc?: () => void }) {
  const { status } = useAuth();
  const g = useAccountGates();

  if (status !== 'authenticated' || g.loading) return null;

  return (
    <div className="px-5 space-y-2 mb-3">
      {g.isFrozen && (
        <div
          className="rounded-[16px] p-3.5 flex items-center gap-3"
          style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.35)' }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--muted)' }}
          >
            <Snowflake size={20} style={{ color: '#EF4444' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 13 }}>Account frozen</p>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
              {g.frozenReason || 'Transfers and withdrawals are blocked. Contact support.'}
            </p>
          </div>
        </div>
      )}
      {!g.isFrozen && g.needsKyc && (
        <button
          type="button"
          onClick={onKyc}
          className="w-full text-left rounded-[16px] p-3.5 flex items-center gap-3"
          style={{ background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(217, 119, 6, 0.35)' }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--muted)' }}
          >
            <ShieldAlert size={20} style={{ color: '#D97706' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 13 }}>
              {g.isPending ? 'Verification in review' : 'Verify your identity'}
            </p>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
              {g.isPending
                ? 'Some features stay limited until KYC is approved'
                : 'Required for withdrawals, off-ramp, and bills'}
            </p>
          </div>
        </button>
      )}
    </div>
  );
}

/** Disable reason text under primary action buttons. */
export function GateHint({
  mode,
}: {
  mode: 'withdraw' | 'external_send' | 'internal_send' | 'swap' | 'bills' | 'onramp' | 'offramp';
}) {
  const g = useAccountGates();
  if (g.loading) return null;
  if (g.isFrozen) {
    return (
      <p className="text-center text-xs mt-2" style={{ color: '#EF4444' }}>
        Account frozen — this action is disabled.
      </p>
    );
  }
  if (g.countryUnsupported) {
    return (
      <p className="text-center text-xs mt-2" style={{ color: '#D97706' }}>
        Your country ({g.country || '—'}) is not supported for this feature.
      </p>
    );
  }
  const needsKyc =
    (mode === 'withdraw' || mode === 'external_send' || mode === 'bills' || mode === 'offramp') &&
    g.needsKyc;
  if (needsKyc) {
    return (
      <p className="text-center text-xs mt-2" style={{ color: '#D97706' }}>
        {g.isPending ? 'KYC still in review — try again after approval.' : 'Complete identity verification to continue.'}
      </p>
    );
  }
  return null;
}
