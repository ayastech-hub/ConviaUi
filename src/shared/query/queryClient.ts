import { QueryClient } from '@tanstack/react-query';

/**
 * Shared QueryClient — stale-while-revalidate defaults.
 * Screens read cache first; background refetch keeps data fresh.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 15 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      // Show previous data while key changes / refetch
      placeholderData: (previousData: unknown) => previousData,
    },
  },
});

/** Central query key factory — prefetch + invalidation must use these. */
export const queryKeys = {
  portfolio: (userId: string) => ['portfolio', userId] as const,
  transactions: (userId: string, limit: number) => ['transactions', userId, limit] as const,
  notifications: (userId: string, limit?: number) =>
    limit != null ? (['notifications', userId, limit] as const) : (['notifications', userId] as const),
  kyc: (userId: string) => ['kyc', userId] as const,
  profileMe: (userId: string) => ['profile', 'me', userId] as const,
  tokens: () => ['registry', 'tokens'] as const,
  chains: () => ['registry', 'chains'] as const,
  tokenMarket: (symbolsKey: string) => ['registry', 'tokens', 'market', symbolsKey] as const,
  countries: () => ['directory', 'countries'] as const,
  banks: (country: string) => ['directory', 'banks', country] as const,
  rates: () => ['rates', 'fx'] as const,
  billers: (country: string, category: string) => ['bills', 'billers', country, category] as const,
  variations: (serviceId: string, country: string) => ['bills', 'variations', country, serviceId] as const,
};
