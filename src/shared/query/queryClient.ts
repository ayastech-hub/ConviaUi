import { QueryClient } from '@tanstack/react-query';

/**
 * Shared QueryClient — server state cache for Convia UI.
 * Stale-while-revalidate defaults cut redundant API traffic on tab switches.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
  },
});

/** Central query key factory — keeps invalidation consistent. */
export const queryKeys = {
  portfolio: (userId: string) => ['portfolio', userId] as const,
  transactions: (userId: string, limit: number) => ['transactions', userId, limit] as const,
  kyc: (userId: string) => ['kyc', userId] as const,
  profileMe: (userId: string) => ['profile', 'me', userId] as const,
  tokens: () => ['registry', 'tokens'] as const,
  chains: () => ['registry', 'chains'] as const,
  countries: () => ['directory', 'countries'] as const,
  banks: (country: string) => ['directory', 'banks', country] as const,
};
