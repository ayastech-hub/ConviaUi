import { api } from './client';

export type SuspendedFeature = { feature: string; reason: string | null };

export function fetchFeatureGates(country: string) {
  const q = new URLSearchParams({ country: country.toUpperCase() });
  return api.get<{ country: string | null; suspended: SuspendedFeature[] }>(
    `/feature-gates?${q}`,
    { auth: false },
  );
}
