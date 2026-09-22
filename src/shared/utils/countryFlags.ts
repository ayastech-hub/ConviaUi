/** Country / currency → flagcdn helpers (shared across Pay, Explore, Rates, KYC). */

const CURRENCY_TO_COUNTRY: Record<string, string> = {
  USD: 'us',
  NGN: 'ng',
  GHS: 'gh',
  KES: 'ke',
  ZAR: 'za',
  UGX: 'ug',
  TZS: 'tz',
  EGP: 'eg',
  EUR: 'eu',
  GBP: 'gb',
};

/** ISO 3166-1 alpha-2 (or eu) for flagcdn. */
export function countryCodeForCurrency(currencyCode: string): string {
  const c = (currencyCode || '').toUpperCase();
  return CURRENCY_TO_COUNTRY[c] || c.slice(0, 2).toLowerCase();
}

export function flagUrl(countryOrCurrency: string, width: 20 | 40 | 80 | 160 = 40): string {
  let code = (countryOrCurrency || '').toLowerCase();
  if (code.length === 3) code = countryCodeForCurrency(code);
  if (!code || code.length < 2) code = 'un';
  return `https://flagcdn.com/w${width}/${code}.png`;
}

export function flagSrc2x(countryOrCurrency: string, width: 20 | 40 | 80 = 40): string {
  const w2 = (width * 2) as 40 | 80 | 160;
  return flagUrl(countryOrCurrency, w2);
}
