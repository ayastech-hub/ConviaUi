export type PhoneCountry = {
  iso: string;
  name: string;
  dial: string;
  flag: string;
};

/** Common dial codes for signup (Africa-first + major markets). */
export const PHONE_COUNTRIES: PhoneCountry[] = [
  { iso: 'NG', name: 'Nigeria', dial: '+234', flag: '🇳🇬' },
  { iso: 'GH', name: 'Ghana', dial: '+233', flag: '🇬🇭' },
  { iso: 'KE', name: 'Kenya', dial: '+254', flag: '🇰🇪' },
  { iso: 'ZA', name: 'South Africa', dial: '+27', flag: '🇿🇦' },
  { iso: 'UG', name: 'Uganda', dial: '+256', flag: '🇺🇬' },
  { iso: 'TZ', name: 'Tanzania', dial: '+255', flag: '🇹🇿' },
  { iso: 'RW', name: 'Rwanda', dial: '+250', flag: '🇷🇼' },
  { iso: 'CI', name: "Côte d'Ivoire", dial: '+225', flag: '🇨🇮' },
  { iso: 'SN', name: 'Senegal', dial: '+221', flag: '🇸🇳' },
  { iso: 'CM', name: 'Cameroon', dial: '+237', flag: '🇨🇲' },
  { iso: 'EG', name: 'Egypt', dial: '+20', flag: '🇪🇬' },
  { iso: 'MA', name: 'Morocco', dial: '+212', flag: '🇲🇦' },
  { iso: 'US', name: 'United States', dial: '+1', flag: '🇺🇸' },
  { iso: 'GB', name: 'United Kingdom', dial: '+44', flag: '🇬🇧' },
  { iso: 'CA', name: 'Canada', dial: '+1', flag: '🇨🇦' },
  { iso: 'IN', name: 'India', dial: '+91', flag: '🇮🇳' },
  { iso: 'AE', name: 'UAE', dial: '+971', flag: '🇦🇪' },
  { iso: 'DE', name: 'Germany', dial: '+49', flag: '🇩🇪' },
  { iso: 'FR', name: 'France', dial: '+33', flag: '🇫🇷' },
  { iso: 'CN', name: 'China', dial: '+86', flag: '🇨🇳' },
];

export function countryFromIso(iso?: string | null): PhoneCountry {
  const hit = PHONE_COUNTRIES.find((c) => c.iso === (iso || '').toUpperCase());
  return hit || PHONE_COUNTRIES[0];
}

/** Strip leading 0 after country code for national numbers (common in NG/GH). */
export function buildE164(dial: string, national: string): string {
  let n = (national || '').replace(/\D/g, '');
  const d = dial.replace(/\D/g, '');
  if (n.startsWith(d)) n = n.slice(d.length);
  if (n.startsWith('0')) n = n.slice(1);
  return `+${d}${n}`;
}
