import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchFeatureGates } from '../api/featureGates';
import { useMyProfile } from './useMyProfile';
import { useAccountGates } from './useAccountGates';

/** Map UI screens / services → country-control feature keys. */
export const SCREEN_FEATURE: Record<string, string> = {
  swap: 'swap',
  onramp: 'onramp',
  offramp: 'offramp',
  withdraw: 'withdraw',
  send: 'transfer',
  airtime: 'airtime',
  data: 'data',
  electricity: 'electricity',
  tv: 'cable',
  bills: 'cable',
  betting: 'betting',
  services: 'bills',
};

/**
 * Country-level feature suspensions from admin + account-level gates.
 */
export function useFeatureGates() {
  const { profile } = useMyProfile();
  const account = useAccountGates();
  const country = (profile?.country || account.country || 'NG').toUpperCase();

  const q = useQuery({
    queryKey: ['feature-gates', country],
    queryFn: () => fetchFeatureGates(country),
    staleTime: 60_000,
    enabled: !!country,
  });

  const suspended = useMemo(() => {
    const map = new Map<string, string | null>();
    for (const row of q.data?.suspended || []) {
      map.set(String(row.feature).toLowerCase(), row.reason);
    }
    return map;
  }, [q.data]);

  const isSuspended = (feature: string): { blocked: boolean; reason: string | null } => {
    const f = feature.toLowerCase();
    if (suspended.has('all')) {
      return { blocked: true, reason: suspended.get('all') || 'This market is temporarily unavailable.' };
    }
    // utilities umbrella
    if (['airtime', 'data', 'electricity', 'cable', 'betting'].includes(f) && suspended.has('bills')) {
      return { blocked: true, reason: suspended.get('bills') || 'Bill payments are unavailable in your country.' };
    }
    if (suspended.has(f)) {
      return { blocked: true, reason: suspended.get(f) || 'This feature is unavailable in your country.' };
    }
    return { blocked: false, reason: null };
  };

  const isScreenBlocked = (screen: string) => {
    const feat = SCREEN_FEATURE[screen] || screen;
    return isSuspended(feat);
  };

  return {
    country,
    loading: q.isLoading,
    suspended,
    isSuspended,
    isScreenBlocked,
    refetch: q.refetch,
  };
}
