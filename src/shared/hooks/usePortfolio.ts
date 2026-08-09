import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchPortfolio, type PortfolioSummary } from '../api/portfolio';
import { ApiError } from '../api/types';
import { cacheGet, cacheSet } from '../cache/queryCache';

type State = {
  data: PortfolioSummary | null;
  loading: boolean;
  error: string | null;
  source: 'live' | 'none';
};

export function usePortfolio() {
  const { userId, status } = useAuth();
  const cacheKey = userId ? `portfolio:${userId}` : '';
  const cached = cacheKey ? cacheGet<PortfolioSummary>(cacheKey) : undefined;

  const [state, setState] = useState<State>({
    data: cached ?? null,
    loading: !cached && !!userId,
    error: null,
    source: cached ? 'live' : 'none',
  });

  const refresh = useCallback(async () => {
    if (!userId) {
      setState({ data: null, loading: false, error: null, source: 'none' });
      return;
    }
    const key = `portfolio:${userId}`;
    const existing = cacheGet<PortfolioSummary>(key);
    // Keep showing previous data while refetching
    setState((s) => ({
      ...s,
      loading: !s.data && !existing,
      error: null,
      data: s.data ?? existing ?? null,
      source: s.data || existing ? 'live' : s.source,
    }));
    try {
      const data = await fetchPortfolio(userId);
      cacheSet(key, data);
      setState({ data, loading: false, error: null, source: 'live' });
    } catch (err) {
      const msg = err instanceof ApiError ? err.code : 'portfolio_unavailable';
      setState((s) => ({
        data: s.data,
        loading: false,
        error: String(msg),
        source: s.data ? 'live' : 'none',
      }));
    }
  }, [userId]);

  useEffect(() => {
    if (status === 'loading') return;
    void refresh();
  }, [status, refresh]);

  return { ...state, refresh };
}
