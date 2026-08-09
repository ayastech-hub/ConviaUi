import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { fetchPortfolio, type PortfolioSummary } from '../api/portfolio';
import { queryKeys } from '../query/queryClient';

export function usePortfolio() {
  const { userId, status } = useAuth();
  const enabled = status === 'authenticated' && !!userId;

  const q = useQuery({
    queryKey: queryKeys.portfolio(userId || '_'),
    queryFn: () => fetchPortfolio(userId!),
    enabled,
  });

  return {
    data: (q.data as PortfolioSummary | undefined) ?? null,
    loading: enabled && q.isLoading,
    error: q.error ? String((q.error as { code?: string }).code || (q.error as Error).message) : null,
    source: q.data ? ('live' as const) : ('none' as const),
    isFetching: q.isFetching,
    refresh: () => q.refetch(),
  };
}
