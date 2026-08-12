import { useKycStatus } from './useKycStatus';
import { useMyProfile } from './useMyProfile';
import { useAuth } from '../context/AuthContext';

/**
 * Central place for UI gating: KYC + frozen account.
 * Use to show banners and disable money-moving controls.
 */
export function useAccountGates() {
  const { status } = useAuth();
  const kyc = useKycStatus();
  const { profile, loading: profileLoading } = useMyProfile();

  const isFrozen = Boolean(profile?.isFrozen);
  const frozenReason = (profile?.frozenReason as string | null | undefined) || null;

  const authenticated = status === 'authenticated';
  const loading = authenticated && (kyc.loading || profileLoading);

  /** High-risk: withdraw / off-ramp should require approved KYC and not frozen */
  const canWithdraw = authenticated && !isFrozen && kyc.isApproved;
  /** Internal send (username) — block if frozen; KYC optional for small internal transfers */
  const canInternalSend = authenticated && !isFrozen;
  /** On-chain external send — same as withdraw policy */
  const canExternalSend = canWithdraw;
  const canSwap = authenticated && !isFrozen;
  const canBills = authenticated && !isFrozen && kyc.isApproved;

  let blockReason: 'frozen' | 'kyc' | 'kyc_pending' | null = null;
  if (isFrozen) blockReason = 'frozen';
  else if (kyc.isPending) blockReason = 'kyc_pending';
  else if (kyc.needsKyc) blockReason = 'kyc';

  return {
    loading,
    isFrozen,
    frozenReason,
    needsKyc: kyc.needsKyc,
    isApproved: kyc.isApproved,
    isPending: kyc.isPending,
    canWithdraw,
    canInternalSend,
    canExternalSend,
    canSwap,
    canBills,
    blockReason,
  };
}
