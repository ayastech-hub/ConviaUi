import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchTransactions, type ApiTransaction } from '../api/transactions';
import { ApiError } from '../api/types';

type State = {
  data: ApiTransaction[];
  loading: boolean;
  error: string | null;
  source: 'live' | 'none';
};

export function useTransactions(limit = 20) {
  const { userId, status } = useAuth();
  const [state, setState] = useState<State>({ data: [], loading: false, error: null, source: 'none' });

  const refresh = useCallback(async () => {
    if (!userId) {
      setState({ data: [], loading: false, error: null, source: 'none' });
      return;
    }
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await fetchTransactions(userId, { limit });
      setState({ data: res.transactions || [], loading: false, error: null, source: 'live' });
    } catch (err) {
      const msg = err instanceof ApiError ? err.code : 'transactions_unavailable';
      setState({ data: [], loading: false, error: String(msg), source: 'none' });
    }
  }, [userId, limit]);

  useEffect(() => {
    if (status === 'loading') return;
    void refresh();
  }, [status, refresh]);

  return { ...state, refresh };
}
