import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { fetchTransactions, type ApiTransaction } from '../api/transactions';
import { queryKeys } from '../query/queryClient';
import { cacheGet, cacheSet } from '../cache/queryCache';

export function useTransactions(limit = 20) {
  const { userId, status } = useAuth();
  const enabled = status === 'authenticated' && !!userId;
  const cacheKey = `tx:${userId || '_'}:${limit}`;

  const q = useQuery({
    queryKey: queryKeys.transactions(userId || '_', limit),
    queryFn: async () => {
      const res = await fetchTransactions(userId!, { limit });
      const list = res.transactions || [];
      cacheSet(cacheKey, list, { persist: 'local' });
      return list;
    },
    enabled,
    staleTime: 30_000,
    gcTime: 15 * 60_000,
    placeholderData: () =>
      cacheGet<ApiTransaction[]>(cacheKey, 24 * 60 * 60_000, { allowStale: true, preferLocal: true }) ||
      undefined,
  });

  return {
    data: (q.data as ApiTransaction[] | undefined) ?? [],
    loading: enabled && q.isLoading && !q.data,
    error: q.error ? String((q.error as { code?: string }).code || (q.error as Error).message) : null,
    source: q.data ? ('live' as const) : ('none' as const),
    isFetching: q.isFetching,
    refresh: () => q.refetch(),
  };
}
