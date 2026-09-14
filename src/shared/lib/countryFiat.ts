/** ISO country → local payment currency for on/off-ramp rails */
export const COUNTRY_TO_FIAT: Record<string, string> = {
  NG: 'NGN',
  GH: 'GHS',
  KE: 'KES',
  ZA: 'ZAR',
  UG: 'UGX',
};

export function localFiatForCountry(country?: string | null, fallback = 'NGN'): string {
  const c = (country || '').toUpperCase().trim();
  if (c && COUNTRY_TO_FIAT[c]) return COUNTRY_TO_FIAT[c];
  return fallback;
}
