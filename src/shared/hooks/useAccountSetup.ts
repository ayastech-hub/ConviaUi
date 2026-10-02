import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { useKycStatus } from './useKycStatus';
import { getTransactionPinStatus } from '../api/security';
import { listBankAccounts } from '../api/banks';
import { queryKeys } from '../query/queryClient';

export type SetupStepId = 'kyc' | 'bank' | 'pin';

export type SetupStep = {
  id: SetupStepId;
  title: string;
  description: string;
  done: boolean;
  pending?: boolean;
};

/**
 * Account setup order: identity verification → bank account → transaction PIN.
 */
export function useAccountSetup() {
  const { userId, status } = useAuth();
  const enabled = status === 'authenticated' && !!userId;
  const kyc = useKycStatus();

  const pinQ = useQuery({
    queryKey: [...queryKeys.kyc(userId || '_'), 'pin-status'],
    queryFn: async () => {
      const s = await getTransactionPinStatus(userId!);
      return Boolean(s.hasPin || s.isSet || s.set);
    },
    enabled,
    staleTime: 15_000,
  });

  const banksQ = useQuery({
    queryKey: [...queryKeys.kyc(userId || '_'), 'bank-accounts'],
    queryFn: async () => {
      const rows = await listBankAccounts(userId!);
      return Array.isArray(rows) ? rows : [];
    },
    enabled,
    staleTime: 15_000,
  });

  const hasPin = pinQ.data === true;
  const hasBank = (banksQ.data?.length ?? 0) > 0;

  const steps: SetupStep[] = [
    {
      id: 'kyc',
      title: 'Identity verification',
      description: kyc.isPending
        ? 'Your documents are under review'
        : kyc.isApproved
          ? 'Identity verified'
          : 'Required to access withdrawals and cash-out',
      done: kyc.isApproved,
      pending: kyc.isPending,
    },
    {
      id: 'bank',
      title: 'Bank account',
      description: 'Required to receive local currency payouts',
      done: hasBank,
    },
    {
      id: 'pin',
      title: 'Transaction PIN',
      description: 'Used to authorize payments and withdrawals',
      done: hasPin,
    },
  ];

  const doneCount = steps.filter((s) => s.done).length;
  const total = steps.length;
  const percent = total === 0 ? 100 : Math.round((doneCount / total) * 100);
  const allDone = doneCount === total;
  const nextIncomplete = steps.find((s) => !s.done) ?? null;
  const loading = enabled && (kyc.loading || pinQ.isLoading || banksQ.isLoading);

  return {
    loading,
    steps,
    doneCount,
    total,
    percent,
    allDone,
    nextIncomplete,
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
