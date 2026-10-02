import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { useKycStatus } from './useKycStatus';
import { useMyProfile } from './useMyProfile';
import { getTransactionPinStatus } from '../api/security';
import { listBankAccounts } from '../api/banks';
import { queryKeys } from '../query/queryClient';

export type SetupStepId = 'pin' | 'bank' | 'kyc_basic' | 'kyc_advanced' | 'profile';

export type SetupStep = {
  id: SetupStepId;
  title: string;
  description: string;
  done: boolean;
  /** Under review (e.g. KYC submitted) */
  pending?: boolean;
  /** Navigate target when user taps the step */
  screen: 'security' | 'payment-methods' | 'kyc' | 'edit-profile';
};

/**
 * Account setup checklist for home banner + setup list screen.
 * Uses live PIN, bank accounts, KYC, and profile name — not mock state.
 */
export function useAccountSetup() {
  const { userId, status } = useAuth();
  const enabled = status === 'authenticated' && !!userId;
  const kyc = useKycStatus();
  const { profile, loading: profileLoading } = useMyProfile();

  const pinQ = useQuery({
    queryKey: [...queryKeys.kyc(userId || '_'), 'pin-status'],
    queryFn: async () => {
      const s = await getTransactionPinStatus(userId!);
      return Boolean(s.hasPin || s.isSet || s.set);
    },
    enabled,
    staleTime: 30_000,
  });

  const banksQ = useQuery({
    queryKey: [...queryKeys.kyc(userId || '_'), 'bank-accounts'],
    queryFn: async () => {
      const rows = await listBankAccounts(userId!);
      return Array.isArray(rows) ? rows : [];
    },
    enabled,
    staleTime: 30_000,
  });

  const hasPin = pinQ.data === true;
  const hasBank = (banksQ.data?.length ?? 0) > 0;
  const profileComplete = Boolean(
    (profile?.firstName || profile?.displayName) && profile?.country,
  );

  const steps: SetupStep[] = [
    {
      id: 'pin',
      title: 'Set transaction PIN',
      description: 'Required to confirm payments and withdrawals',
      done: hasPin,
      screen: 'security',
    },
    {
      id: 'bank',
      title: 'Add bank account',
      description: 'Needed for cash-out and local payouts',
      done: hasBank,
      screen: 'payment-methods',
    },
    {
      id: 'profile',
      title: 'Complete your profile',
      description: 'Name and country for compliance',
      done: profileComplete,
      screen: 'edit-profile',
    },
    {
      id: 'kyc_basic',
      title: 'Complete basic verification',
      description: kyc.isPending
        ? 'Submitted — waiting for review'
        : kyc.isApproved
          ? 'Identity verified'
          : 'Verify your identity to unlock cash-out',
      done: kyc.isApproved,
      pending: kyc.isPending,
      screen: 'kyc',
    },
    {
      id: 'kyc_advanced',
      title: 'Complete advanced verification',
      description: kyc.isApproved
        ? 'Higher limits unlocked'
        : 'Optional extra checks for higher limits',
      done: kyc.isApproved,
      pending: kyc.isPending,
      screen: 'kyc',
    },
  ];

  const doneCount = steps.filter((s) => s.done).length;
  const total = steps.length;
  const percent = total === 0 ? 100 : Math.round((doneCount / total) * 100);
  const allDone = doneCount === total;
  const loading =
    enabled && (kyc.loading || profileLoading || pinQ.isLoading || banksQ.isLoading);

  return {
    loading,
    steps,
    doneCount,
    total,
    percent,
    allDone,
    isKycPending: kyc.isPending,
    isKycApproved: kyc.isApproved,
    needsSetup: enabled && !allDone,
    hasPin,
    hasBank,
    refresh: () => {
      void pinQ.refetch();
      void banksQ.refetch();
      void kyc.refresh();
    },
  };
}
