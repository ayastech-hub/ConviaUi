import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchKyc, type KycRecord } from '../api/compliance';
import { ApiError } from '../api/types';
import { cacheGet, cacheSet, cacheInvalidate } from '../cache/queryCache';

/**
 * Live KYC status from GET /compliance/:userId/kyc.
 * Cached briefly; always revalidated in background. Never invents "approved".
 */
export function useKycStatus() {
  const { userId, status } = useAuth();
  const cacheKey = userId ? `kyc:${userId}` : '';
  const cached = cacheKey ? cacheGet<KycRecord | null>(cacheKey, 30_000) : undefined;

  const [kyc, setKyc] = useState<KycRecord | null>(cached !== undefined ? cached : null);
  const [loading, setLoading] = useState(status === 'authenticated' && cached === undefined);
  const [fetched, setFetched] = useState(cached !== undefined);

  const refresh = useCallback(async () => {
    if (!userId || status !== 'authenticated') {
      setKyc(null);
      setLoading(false);
      setFetched(true);
      return;
    }
    const key = `kyc:${userId}`;
    const existing = cacheGet<KycRecord | null>(key, 30_000);
    if (existing !== undefined) {
      setKyc(existing);
      setLoading(false);
      setFetched(true);
    } else if (!fetched) {
      setLoading(true);
    }

    try {
      const data = await fetchKyc(userId);
      cacheSet(key, data);
      setKyc(data);
    } catch (err) {
      // 404 / none → no KYC record
      if (err instanceof ApiError && (err.status === 404 || err.code === 'not_found')) {
        cacheSet(key, null);
        setKyc(null);
      }
      // keep prior on network errors
    } finally {
      setLoading(false);
      setFetched(true);
    }
  }, [userId, status, fetched]);

  useEffect(() => {
    if (status === 'loading') return;
    void refresh();
  }, [status, userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const raw = (kyc?.status || 'none').toString().toLowerCase();
  const isApproved = raw === 'approved' || raw === 'verified' || raw === 'complete' || raw === 'completed';
  const isPending =
    raw === 'pending' || raw === 'in_review' || raw === 'submitted' || raw === 'processing' || raw === 'under_review';
  const needsKyc = status === 'authenticated' && fetched && !isApproved;

  return {
    kyc,
    loading: status === 'authenticated' && !fetched,
    refresh,
    isApproved,
    isPending,
    needsKyc,
    kycStatus: raw,
    invalidate: () => {
      if (userId) cacheInvalidate(`kyc:${userId}`);
    },
  };
}
