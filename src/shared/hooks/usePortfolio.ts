import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { fetchPortfolio, type PortfolioSummary } from '../api/portfolio';
import { queryKeys } from '../query/queryClient';
import { cacheGet, cacheSet } from '../cache/queryCache';

const PORTFOLIO_CACHE = 'portfolio-summary';

export function usePortfolio() {
  const { userId, status } = useAuth();
  const enabled = status === 'authenticated' && !!userId;
  const cacheKey = `${PORTFOLIO_CACHE}:${userId || '_'}`;

  const q = useQuery({
    queryKey: queryKeys.portfolio(userId || '_'),
    queryFn: async () => {
      const data = await fetchPortfolio(userId!);
      cacheSet(cacheKey, data, { persist: 'local' });
      return data;
    },
    enabled,
    staleTime: 30_000,
    gcTime: 10 * 60_000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    placeholderData: () =>
      cacheGet<PortfolioSummary>(cacheKey, 24 * 60 * 60_000, { allowStale: true, preferLocal: true }) || undefined,
  });

  return {
    data: (q.data as PortfolioSummary | undefined) ?? null,
    loading: enabled && q.isLoading && !q.data,
    error: q.error ? String((q.error as { code?: string }).code || (q.error as Error).message) : null,
    source: q.data ? ('live' as const) : ('none' as const),
    isFetching: q.isFetching,
    refresh: () => q.refetch(),
  };
}
