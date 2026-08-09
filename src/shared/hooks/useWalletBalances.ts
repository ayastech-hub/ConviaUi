import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchBalances, type ChainBalanceRow } from '../api/wallet';
import { ApiError } from '../api/types';

type State = {
  data: ChainBalanceRow[];
  loading: boolean;
  error: string | null;
  source: 'live' | 'none';
};

export function useWalletBalances() {
  const { userId, status } = useAuth();
  const [state, setState] = useState<State>({ data: [], loading: false, error: null, source: 'none' });

  const refresh = useCallback(async () => {
    if (!userId) {
      setState({ data: [], loading: false, error: null, source: 'none' });
      return;
    }
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await fetchBalances(userId);
      setState({ data: res.balances || [], loading: false, error: null, source: 'live' });
    } catch (err) {
      const msg = err instanceof ApiError ? err.code : 'balances_unavailable';
      setState({ data: [], loading: false, error: String(msg), source: 'none' });
    }
  }, [userId]);

  useEffect(() => {
    if (status === 'loading') return;
    void refresh();
  }, [status, refresh]);

  return { ...state, refresh };
}
