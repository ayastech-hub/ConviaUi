import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchKyc, type KycRecord } from '../api/compliance';
import { ApiError } from '../api/types';
import { cacheGet, cacheSet } from '../cache/queryCache';

export function useKycStatus() {
  const { userId, status } = useAuth();
  const cacheKey = userId ? `kyc:${userId}` : '';
  const cached = cacheKey ? cacheGet<KycRecord | null>(cacheKey) : undefined;

  const [kyc, setKyc] = useState<KycRecord | null>(cached !== undefined ? cached : null);
  const [loading, setLoading] = useState(cached === undefined && !!userId);

  const refresh = useCallback(async () => {
    if (!userId) {
      setKyc(null);
      setLoading(false);
      return;
    }
    const key = `kyc:${userId}`;
    const existing = cacheGet<KycRecord | null>(key);
    if (existing !== undefined) {
      setKyc(existing);
      setLoading(false);
    } else {
      setLoading(true);
    }
    try {
      const data = await fetchKyc(userId);
      cacheSet(key, data);
      setKyc(data);
    } catch (err) {
      if (!(err instanceof ApiError && err.status === 404)) {
        /* keep prior */
      } else {
        cacheSet(key, null);
        setKyc(null);
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (status === 'loading') return;
    void refresh();
  }, [status, refresh]);

  const kycStatus = (kyc?.status || 'none').toLowerCase();
  const isApproved = kycStatus === 'approved';
  const isPending = kycStatus === 'pending' || kycStatus === 'in_review';
  const needsKyc = !isApproved;

  return { kyc, loading, refresh, isApproved, isPending, needsKyc, kycStatus };
}
