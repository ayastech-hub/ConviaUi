import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchTransactions, type ApiTransaction } from '../api/transactions';
import { ApiError } from '../api/types';
import { cacheGet, cacheSet } from '../cache/queryCache';

type State = {
  data: ApiTransaction[];
  loading: boolean;
  error: string | null;
  source: 'live' | 'none';
};

export function useTransactions(limit = 20) {
  const { userId, status } = useAuth();
  const cacheKey = userId ? `tx:${userId}:${limit}` : '';
  const cached = cacheKey ? cacheGet<ApiTransaction[]>(cacheKey) : undefined;

  const [state, setState] = useState<State>({
    data: cached ?? [],
    loading: !cached && !!userId,
    error: null,
    source: cached ? 'live' : 'none',
  });

  const refresh = useCallback(async () => {
    if (!userId) {
      setState({ data: [], loading: false, error: null, source: 'none' });
      return;
    }
    const key = `tx:${userId}:${limit}`;
    const existing = cacheGet<ApiTransaction[]>(key);
    setState((s) => ({
      ...s,
      loading: s.data.length === 0 && !existing,
      error: null,
      data: s.data.length ? s.data : existing ?? [],
      source: s.data.length || existing ? 'live' : s.source,
    }));
    try {
      const res = await fetchTransactions(userId, { limit });
      const list = res.transactions || [];
      cacheSet(key, list);
      setState({ data: list, loading: false, error: null, source: 'live' });
    } catch (err) {
      const msg = err instanceof ApiError ? err.code : 'transactions_unavailable';
      setState((s) => ({
        data: s.data,
        loading: false,
        error: String(msg),
        source: s.data.length ? 'live' : 'none',
      }));
    }
  }, [userId, limit]);

  useEffect(() => {
    if (status === 'loading') return;
    void refresh();
  }, [status, refresh]);

  return { ...state, refresh };
}
