import { queryClient, queryKeys } from './queryClient';
import { fetchPortfolio } from '../api/portfolio';
import { fetchTransactions } from '../api/transactions';
import { fetchNotifications } from '../api/notifications';
import { fetchTokenCatalog, fetchChainCatalog, fetchTokensInfo } from '../api/tokens';
import * as profileApi from '../api/profile';
import { cacheSet } from '../cache/queryCache';

/**
 * Speculative warm-up after auth / on Home.
 * Fire high-priority first; do not await in UI path.
 */
export function prefetchAppData(userId: string) {
  if (!userId) return;

  // 1) Portfolio (dashboard total + assets) — highest priority
  void queryClient.prefetchQuery({
    queryKey: queryKeys.portfolio(userId),
    queryFn: async () => {
      const data = await fetchPortfolio(userId);
      cacheSet(`portfolio-summary:${userId}`, data, { persist: 'local' });
      return data;
    },
    staleTime: 30_000,
  });

  // 2) Notifications badge / list
  void queryClient.prefetchQuery({
    queryKey: queryKeys.notifications(userId, 30),
    queryFn: () => fetchNotifications(userId, 30),
    staleTime: 15_000,
  });

  // 3) Recent activity (history)
  void queryClient.prefetchQuery({
    queryKey: queryKeys.transactions(userId, 50),
    queryFn: async () => {
      const res = await fetchTransactions(userId, { limit: 50 });
      return res.transactions || [];
    },
    staleTime: 30_000,
  });

  // 4) Profile (profile tab)
  void queryClient.prefetchQuery({
    queryKey: queryKeys.profileMe(userId),
    queryFn: () => profileApi.getMyProfile(),
    staleTime: 60_000,
  });

  // 5) Token + chain catalogs (swap / deposit pickers)
  void queryClient.prefetchQuery({
    queryKey: queryKeys.tokens(),
    queryFn: () => fetchTokenCatalog(),
    staleTime: 5 * 60_000,
  });
  void queryClient.prefetchQuery({
    queryKey: queryKeys.chains(),
    queryFn: () => fetchChainCatalog().catch(() => ({ chains: [] })),
    staleTime: 5 * 60_000,
  });
}

/** After portfolio is known, warm market prices for held + catalog symbols. */
export function prefetchMarketPrices(symbols: string[]) {
  const list = [...new Set(symbols.map((s) => s.toUpperCase()).filter(Boolean))].sort();
  if (!list.length) return;
  const key = list.join(',');
  void queryClient.prefetchQuery({
    queryKey: queryKeys.tokenMarket(key),
    queryFn: async () => {
      const res = await fetchTokensInfo(list);
      return res;
    },
    staleTime: 60_000,
  });
}

/**
 * Prefetch only what the next tab likely needs (call from navigate handlers).
 */
export function prefetchForScreen(screen: string, userId: string | null | undefined) {
  if (!userId) return;
  switch (screen) {
    case 'home':
    case 'wallet':
      void queryClient.prefetchQuery({
        queryKey: queryKeys.portfolio(userId),
        queryFn: () => fetchPortfolio(userId),
        staleTime: 30_000,
      });
      break;
    case 'history':
      void queryClient.prefetchQuery({
        queryKey: queryKeys.transactions(userId, 50),
        queryFn: async () => (await fetchTransactions(userId, { limit: 50 })).transactions || [],
        staleTime: 30_000,
      });
      break;
    case 'notifications':
      void queryClient.prefetchQuery({
        queryKey: queryKeys.notifications(userId, 30),
        queryFn: () => fetchNotifications(userId, 30),
        staleTime: 15_000,
      });
      break;
    case 'profile':
    case 'edit-profile':
    case 'settings':
      void queryClient.prefetchQuery({
        queryKey: queryKeys.profileMe(userId),
        queryFn: () => profileApi.getMyProfile(),
        staleTime: 60_000,
      });
      break;
    case 'swap':
    case 'deposit':
    case 'withdraw':
    case 'onramp':
    case 'offramp':
      void queryClient.prefetchQuery({
        queryKey: queryKeys.portfolio(userId),
        queryFn: () => fetchPortfolio(userId),
        staleTime: 30_000,
      });
      void queryClient.prefetchQuery({
        queryKey: queryKeys.tokens(),
        queryFn: () => fetchTokenCatalog(),
        staleTime: 5 * 60_000,
      });
      break;
    default:
      break;
  }
}
