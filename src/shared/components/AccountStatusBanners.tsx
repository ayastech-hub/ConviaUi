import { useState } from 'react';
import { useAccountGates } from '../hooks/useAccountGates';
import { useAuth } from '../context/AuthContext';
import { FeatureAlert } from './FeatureAlert';

/**
 * Home / wallet status alerts — fixed overlay, dismissible, does not push layout.
 */
export function AccountStatusBanners({ onKyc }: { onKyc?: () => void }) {
  const { status } = useAuth();
  const g = useAccountGates();
  const [hideFrozen, setHideFrozen] = useState(false);
  const [hideKyc, setHideKyc] = useState(false);

  if (status !== 'authenticated' || g.loading) return null;

  return (
    <>
      {g.isFrozen && !hideFrozen && (
        <FeatureAlert
          reason="account_frozen"
          message={g.frozenReason || 'Transfers and withdrawals are blocked. Contact support.'}
          floating
          dismissible
          onDismiss={() => setHideFrozen(true)}
        />
      )}
      {!g.isFrozen && g.needsKyc && !hideKyc && (
        <FeatureAlert
          reason={g.isPending ? 'kyc_pending' : 'kyc_required'}
          message={
            g.isPending
              ? 'Some features stay limited until KYC is approved'
              : 'Required for withdrawals, off-ramp, and bills'
          }
          floating
          dismissible
          onDismiss={() => setHideKyc(true)}
          onAction={g.isPending ? undefined : onKyc}
          actionLabel="Verify"
        />
      )}
    </>
  );
}

/** Floating gate message under blocked actions — never shifts page content. */
export function GateHint({
  mode,
}: {
  mode: 'withdraw' | 'external_send' | 'internal_send' | 'swap' | 'bills' | 'onramp' | 'offramp';
}) {
  const g = useAccountGates();
  const [dismissed, setDismissed] = useState(false);
  if (g.loading || dismissed) return null;

  if (g.isFrozen) {
    return (
      <FeatureAlert
        reason="account_frozen"
        message="Account frozen — this action is disabled."
        floating
        dismissible
        onDismiss={() => setDismissed(true)}
      />
    );
  }
  if (g.countryUnsupported) {
    return (
      <FeatureAlert
        reason="country_feature_suspended"
        message={`Your country (${g.country || '—'}) is not supported for this feature.`}
        floating
        dismissible
        onDismiss={() => setDismissed(true)}
      />
    );
  }
  const needsKyc =
    (mode === 'withdraw' || mode === 'external_send' || mode === 'bills' || mode === 'offramp') &&
    g.needsKyc;
  if (needsKyc) {
    return (
      <FeatureAlert
        reason={g.isPending ? 'kyc_pending' : 'kyc_required'}
        message={
          g.isPending
            ? 'KYC still in review — try again after approval.'
            : 'Complete identity verification to continue.'
        }
        floating
        dismissible
        onDismiss={() => setDismissed(true)}
      />
    );
  }
  return null;
}
