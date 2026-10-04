import { api } from './client';

export type StatusBanner = {
  id: string;
  title: string;
  body: string;
  severity: string;
  tone?: string | null;
  expiresAt?: string | null;
};

export type PlatformStatus = {
  maintenance: boolean;
  message: string | null;
  banners?: StatusBanner[];
};

/** Public — no auth. Maintenance + active admin banners. */
export async function fetchPlatformStatus(): Promise<PlatformStatus> {
  try {
    return await api.get<PlatformStatus>('/public/status', { auth: false });
  } catch {
    return { maintenance: false, message: null, banners: [] };
  }
}
