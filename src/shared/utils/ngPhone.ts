/**
 * Nigerian mobile prefixes (NCC allocation).
 * Note: MNP means prefix ≠ current network always — user can still change provider.
 */
const PREFIXES: Record<string, string[]> = {
  MTN: [
    '0703', '0704', '0706', '0707', '0803', '0806', '0810', '0813', '0814', '0816', '0903', '0906',
    '0913', '0916',
  ],
  AIRTEL: ['0701', '0708', '0802', '0808', '0812', '0901', '0902', '0904', '0907', '0911', '0912'],
  GLO: ['0705', '0805', '0807', '0811', '0815', '0905', '0915'],
  '9MOBILE': ['0809', '0817', '0818', '0908', '0909'],
};

/** Map operator → VTPass airtime serviceID */
export const AIRTIME_BILLER: Record<string, { code: string; name: string }> = {
  MTN: { code: 'mtn', name: 'MTN' },
  AIRTEL: { code: 'airtel', name: 'Airtel' },
  GLO: { code: 'glo', name: 'Glo' },
  '9MOBILE': { code: 'etisalat', name: '9mobile' },
};

/** Map operator → VTPass data serviceID */
export const DATA_BILLER: Record<string, { code: string; name: string }> = {
  MTN: { code: 'mtn-data', name: 'MTN Data' },
  AIRTEL: { code: 'airtel-data', name: 'Airtel Data' },
  GLO: { code: 'glo-data', name: 'Glo Data' },
  '9MOBILE': { code: 'etisalat-data', name: '9mobile Data' },
};

export type NgOperator = keyof typeof PREFIXES;

export function digitsOnly(v: string): string {
  return v.replace(/\D/g, '');
}

/** Normalize to local 11-digit form starting with 0 when possible. */
export function normalizeNgMobile(raw: string): string {
  let d = digitsOnly(raw);
  if (d.startsWith('234') && d.length >= 13) d = `0${d.slice(3)}`;
  return d.slice(0, 11);
}

export function detectNgOperator(phone: string): NgOperator | null {
  const d = normalizeNgMobile(phone);
  if (d.length < 4) return null;
  const prefix = d.slice(0, 4);
  for (const [op, list] of Object.entries(PREFIXES)) {
    if (list.includes(prefix)) return op as NgOperator;
  }
  return null;
}

export function isValidNgMobile(phone: string): boolean {
  const d = normalizeNgMobile(phone);
  return /^0\d{10}$/.test(d);
}

export function formatNgMobileDisplay(phone: string): string {
  const d = normalizeNgMobile(phone);
  return [d.slice(0, 4), d.slice(4, 7), d.slice(7, 11)].filter(Boolean).join(' ');
}
