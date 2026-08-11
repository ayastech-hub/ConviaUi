import { api } from './client';

export type PlatformStatus = {
  maintenance: boolean;
  message: string | null;
};

/** Public — no auth. Used for maintenance banner. */
export async function fetchPlatformStatus(): Promise<PlatformStatus> {
  try {
    return await api.get<PlatformStatus>('/public/status', { auth: false });
  } catch {
    return { maintenance: false, message: null };
  }
}
