import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchKyc, type KycRecord } from '../api/compliance';
import { ApiError } from '../api/types';

export function useKycStatus() {
  const { userId, status } = useAuth();
  const [kyc, setKyc] = useState<KycRecord | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!userId) {
      setKyc(null);
      return;
    }
    setLoading(true);
    try {
      setKyc(await fetchKyc(userId));
    } catch (err) {
      if (!(err instanceof ApiError && err.status === 404)) {
        setKyc(null);
      } else {
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
