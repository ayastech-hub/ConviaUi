import { useKycStatus } from './useKycStatus';
import { useMyProfile } from './useMyProfile';
import { useAuth } from '../context/AuthContext';
import { useSupportedCountries } from './useSupportedCountries';

/**
 * Central UI gating: KYC + frozen + supported country.
 * Money screens disable primary actions when blocked.
 */
export function useAccountGates() {
  const { status } = useAuth();
  const kyc = useKycStatus();
  const { profile, loading: profileLoading } = useMyProfile();
  const { countries, loading: countriesLoading } = useSupportedCountries();

  const isFrozen = Boolean(profile?.isFrozen);
  const frozenReason = (profile?.frozenReason as string | null | undefined) || null;
  const country = (profile?.country || '').toString().toUpperCase();

  const authenticated = status === 'authenticated';
  const loading = authenticated && (kyc.loading || profileLoading || countriesLoading);

  const supportedCodes = (countries || []).map((c) => String(c.code || '').toUpperCase()).filter(Boolean);
  const countryUnsupported =
    authenticated &&
    !!country &&
    supportedCodes.length > 0 &&
    !supportedCodes.includes(country);

  const canWithdraw = authenticated && !isFrozen && kyc.isApproved && !countryUnsupported;
  const canInternalSend = authenticated && !isFrozen && !countryUnsupported;
  const canExternalSend = canWithdraw;
  const canSwap = authenticated && !isFrozen && !countryUnsupported;
  const canBills = authenticated && !isFrozen && kyc.isApproved && !countryUnsupported;
  const canOnramp = authenticated && !isFrozen && !countryUnsupported;
  const canOfframp = authenticated && !isFrozen && kyc.isApproved && !countryUnsupported;

  let blockReason: 'frozen' | 'kyc' | 'kyc_pending' | 'country' | null = null;
  if (isFrozen) blockReason = 'frozen';
  else if (countryUnsupported) blockReason = 'country';
  else if (kyc.isPending) blockReason = 'kyc_pending';
  else if (kyc.needsKyc) blockReason = 'kyc';

  return {
    loading,
    isFrozen,
    frozenReason,
    country,
    countryUnsupported,
    needsKyc: kyc.needsKyc,
    isApproved: kyc.isApproved,
    isPending: kyc.isPending,
    canWithdraw,
    canInternalSend,
    canExternalSend,
    canSwap,
    canBills,
    canOnramp,
    canOfframp,
    blockReason,
  };
}
