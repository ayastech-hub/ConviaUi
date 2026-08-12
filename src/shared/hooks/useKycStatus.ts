import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { fetchKyc, type KycRecord } from '../api/compliance';
import { ApiError } from '../api/types';
import { queryKeys } from '../query/queryClient';

export function useKycStatus() {
  const { userId, status } = useAuth();
  const qc = useQueryClient();
  const enabled = status === 'authenticated' && !!userId;

  const q = useQuery({
    queryKey: queryKeys.kyc(userId || '_'),
    queryFn: async (): Promise<KycRecord | null> => {
      try {
        return await fetchKyc(userId!);
      } catch (err) {
        if (err instanceof ApiError && (err.status === 404 || err.code === 'not_found')) {
          return null;
        }
        throw err;
      }
    },
    enabled,
    staleTime: 15_000,
  });

  const kyc = q.data ?? null;
  const raw = (kyc?.status || 'none').toString().toLowerCase();
  const isApproved =
    raw === 'approved' || raw === 'verified' || raw === 'complete' || raw === 'completed';
  const isPending =
    raw === 'pending' || raw === 'in_review' || raw === 'submitted' || raw === 'processing';
  const isRejected = raw === 'rejected' || raw === 'failed' || raw === 'denied';
  /** Show banners / lock high-risk actions when not fully approved. */
  const needsKyc = enabled && !isApproved;

  return {
    kyc,
    kycStatus: raw,
    loading: enabled && q.isLoading,
    fetched: !enabled || q.isFetched,
    isApproved,
    isPending,
    isRejected,
    needsKyc,
    isFetching: q.isFetching,
    refresh: () => q.refetch(),
    invalidate: () => {
      if (userId) void qc.invalidateQueries({ queryKey: queryKeys.kyc(userId) });
    },
  };
}
