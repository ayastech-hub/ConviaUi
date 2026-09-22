import { queryClient, queryKeys } from './queryClient';
import { fetchPortfolio } from '../api/portfolio';
import { fetchTransactions } from '../api/transactions';
import { fetchNotifications } from '../api/notifications';
import { fetchTokensInfo } from '../api/tokens';
import { fetchTokenCatalog, fetchChainCatalog } from '../api/registry';
import * as profileApi from '../api/profile';
import { cacheSet } from '../cache/queryCache';
import * as billsApi from '../api/bills';
import { cacheProviderLogos } from '../utils/logoCache';

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

  // 6) Bills catalog — warm so Services opens instantly
  void prefetchBillsCatalog('NG');
}

/** Prefetch billers + top provider variation lists (idle-friendly). */
export function prefetchBillsCatalog(country = 'NG') {
  const categories = ['airtime', 'data', 'electricity', 'cable'] as const;
  for (const category of categories) {
    void queryClient.prefetchQuery({
      queryKey: queryKeys.billers(country, category),
      queryFn: async () => {
        const res = await billsApi.listBillers(country, category);
        cacheProviderLogos(
          (res.billers || []).map((b) => ({
            code: String(b.code || b.billerCode || ''),
            image: (b as { image?: string }).image,
          })),
        );
        return res;
      },
      staleTime: 10 * 60_000,
    });
  }

  // After a short delay, warm popular variation catalogs
  const warmPlans = () => {
    const services = [
      'mtn-data',
      'airtel-data',
      'glo-data',
      'etisalat-data',
      'dstv',
      'gotv',
      'startimes',
      'showmax',
    ];
    for (const serviceId of services) {
      void queryClient.prefetchQuery({
        queryKey: queryKeys.variations(serviceId, country),
        queryFn: () => billsApi.listVariations(serviceId, country),
        staleTime: 10 * 60_000,
      });
    }
  };
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(() => warmPlans(), { timeout: 4000 });
  } else {
    setTimeout(warmPlans, 1500);
  }
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
    case 'services':
    case 'airtime':
    case 'data':
    case 'electricity':
    case 'tv':
    case 'betting':
      void prefetchBillsCatalog('NG');
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
