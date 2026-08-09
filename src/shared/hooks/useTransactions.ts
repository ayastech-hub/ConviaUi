import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { fetchTransactions, type ApiTransaction } from '../api/transactions';
import { queryKeys } from '../query/queryClient';

export function useTransactions(limit = 20) {
  const { userId, status } = useAuth();
  const enabled = status === 'authenticated' && !!userId;

  const q = useQuery({
    queryKey: queryKeys.transactions(userId || '_', limit),
    queryFn: async () => {
      const res = await fetchTransactions(userId!, { limit });
      return res.transactions || [];
    },
    enabled,
  });

  return {
    data: (q.data as ApiTransaction[] | undefined) ?? [],
    loading: enabled && q.isLoading,
    error: q.error ? String((q.error as { code?: string }).code || (q.error as Error).message) : null,
    source: q.data ? ('live' as const) : ('none' as const),
    isFetching: q.isFetching,
    refresh: () => q.refetch(),
  };
}
