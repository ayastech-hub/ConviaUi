import { api } from './client';

export type KycRecord = {
  userId: string;
  status: 'none' | 'pending' | 'approved' | 'rejected' | string;
  tier?: number;
  [key: string]: unknown;
};

export async function fetchKyc(userId: string): Promise<KycRecord | null> {
  try {
    return await api.get<KycRecord>(`/compliance/${userId}/kyc`);
  } catch (err: unknown) {
    const e = err as { status?: number; code?: string };
    if (e.status === 404 || e.code === 'not_found') return null;
    throw err;
  }
}
