import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { fetchTransactions, type ApiTransaction } from '../api/transactions';
import { queryKeys } from '../query/queryClient';
import { cacheGet, cacheSet } from '../cache/queryCache';

export function useTransactions(
  limit = 200,
  opts?: { since?: string; until?: string },
) {
  const { userId, status } = useAuth();
  const since = opts?.since;
  const until = opts?.until;
  const cacheKey = `tx:${userId || '_'}:${limit}:${since || ''}:${until || ''}`;
  const enabled = status === 'authenticated' && !!userId;

  const q = useQuery({
    queryKey: [...queryKeys.transactions(userId || '_', limit), since || '', until || ''],
    queryFn: async () => {
      const res = await fetchTransactions(userId!, { limit, since, until });
      cacheSet(cacheKey, res.transactions, { persist: 'local' });
      return res.transactions as ApiTransaction[];
    },
    enabled,
    staleTime: 15_000,
    placeholderData: () =>
      cacheGet<ApiTransaction[]>(cacheKey, 24 * 60 * 60_000, { allowStale: true, preferLocal: true }) ||
      undefined,
  });

  return {
    data: (q.data as ApiTransaction[] | undefined) ?? [],
    loading: enabled && q.isLoading && !q.data,
    isFetching: q.isFetching,
    refresh: () => q.refetch(),
  };
}
