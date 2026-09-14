import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { prefetchAppData } from '../query/prefetchAppData';

/**
 * When session becomes authenticated, warm caches for Home → Wallet / History /
 * Notifications / Profile / Swap without blocking UI.
 */
export function usePrefetchAppData() {
  const { userId, status } = useAuth();
  const last = useRef<string | null>(null);

  useEffect(() => {
    if (status !== 'authenticated' || !userId) {
      last.current = null;
      return;
    }
    if (last.current === userId) return;
    last.current = userId;

    // Yield to first paint, then prefetch in priority order (handled inside)
    const t = window.setTimeout(() => prefetchAppData(userId), 50);
    return () => window.clearTimeout(t);
  }, [status, userId]);
}
