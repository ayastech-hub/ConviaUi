import { FeatureAlert } from './FeatureAlert';
import { useKycStatus } from '../hooks/useKycStatus';
import { useAuth } from '../context/AuthContext';

type FeatureKey = 'withdraw' | 'transfer' | 'swap' | 'onramp' | 'offramp' | 'deposit';

/**
 * Preemptive UI gate: shows KYC / sign-in banners on money features.
 * Backend still enforces; this matches server policy so users aren't surprised.
 */
export function WalletFeatureBanner({
  feature,
  onGoKyc,
}: {
  feature: FeatureKey;
  onGoKyc?: () => void;
}) {
  const { status } = useAuth();
  const { needsKyc, isPending, isApproved } = useKycStatus();

  if (status === 'anonymous') {
    return <FeatureAlert reason="generic" message="Sign in to use this feature against the live API." />;
  }

  // Off-ramp / higher-risk surfaces require approved KYC (matches offramp eligibility).
  if ((feature === 'offramp' || feature === 'withdraw') && needsKyc) {
    return (
      <FeatureAlert
        reason={isPending ? 'kyc_pending' : 'kyc_required'}
        onAction={onGoKyc}
        actionLabel="Complete verification"
      />
    );
  }

  if (!isApproved && (feature === 'onramp' || feature === 'transfer')) {
    // Soft notice — some tiers may still work; backend remains source of truth
    return (
      <FeatureAlert
        reason="kyc_required"
        message="Higher limits and some fiat rails require KYC. The API will return kyc_required if this action is blocked."
        onAction={onGoKyc}
        actionLabel="Verify identity"
        compact
      />
    );
  }

  return null;
}
