import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchPortfolio, type PortfolioSummary } from '../api/portfolio';
import { ApiError } from '../api/types';

type State = {
  data: PortfolioSummary | null;
  loading: boolean;
  error: string | null;
  source: 'live' | 'none';
};

export function usePortfolio() {
  const { userId, status } = useAuth();
  const [state, setState] = useState<State>({ data: null, loading: false, error: null, source: 'none' });

  const refresh = useCallback(async () => {
    if (!userId) {
      setState({ data: null, loading: false, error: null, source: 'none' });
      return;
    }
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await fetchPortfolio(userId);
      setState({ data, loading: false, error: null, source: 'live' });
    } catch (err) {
      const msg = err instanceof ApiError ? err.code : 'portfolio_unavailable';
      setState({ data: null, loading: false, error: String(msg), source: 'none' });
    }
  }, [userId]);

  useEffect(() => {
    if (status === 'loading') return;
    void refresh();
  }, [status, refresh]);

  return { ...state, refresh };
}
