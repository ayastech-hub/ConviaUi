import { FeatureAlert } from './FeatureAlert';
import { useKycStatus } from '../hooks/useKycStatus';
import { useAuth } from '../context/AuthContext';

type FeatureKey = 'withdraw' | 'transfer' | 'swap' | 'onramp' | 'offramp' | 'deposit';

/**
 * Preemptive UI gate from live KYC status.
 * Never shows KYC banners when status is approved.
 */
export function WalletFeatureBanner({
  feature,
  onGoKyc,
}: {
  feature: FeatureKey;
  onGoKyc?: () => void;
}) {
  const { status } = useAuth();
  const { needsKyc, isPending, isApproved, loading } = useKycStatus();

  if (status === 'anonymous') {
    return <FeatureAlert reason="generic" message="Sign in to use this feature against the live API." />;
  }

  if (loading || isApproved || !needsKyc) return null;

  // Stricter surfaces
  if (feature === 'offramp' || feature === 'withdraw') {
    return (
      <FeatureAlert
        reason={isPending ? 'kyc_pending' : 'kyc_required'}
        onAction={onGoKyc}
        actionLabel={isPending ? 'View status' : 'Complete verification'}
      />
    );
  }

  // Soft notice for other money features only when not verified
  if (feature === 'onramp' || feature === 'transfer' || feature === 'swap' || feature === 'deposit') {
    return (
      <FeatureAlert
        reason={isPending ? 'kyc_pending' : 'kyc_required'}
        message={
          isPending
            ? 'Verification is in review. Some limits may still apply.'
            : 'Complete KYC for higher limits. The API enforces this server-side.'
        }
        onAction={onGoKyc}
        actionLabel={isPending ? 'View status' : 'Verify identity'}
        compact
      />
    );
  }

  return null;
}
