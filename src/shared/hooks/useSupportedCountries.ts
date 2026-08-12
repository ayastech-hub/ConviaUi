import { useQuery } from '@tanstack/react-query';
import {
  listSupportedCountries,
  listBanks,
  type SupportedCountryRow,
  type DirectoryBank,
} from '../api/banks';
import { queryKeys } from '../query/queryClient';

export type CountryOption = {
  code: string;
  name: string;
  currency: string;
};

const COUNTRY_NAMES: Record<string, string> = {
  NG: 'Nigeria',
  GH: 'Ghana',
  KE: 'Kenya',
  ZA: 'South Africa',
  UG: 'Uganda',
  TZ: 'Tanzania',
  EG: 'Egypt',
};

const CURRENCY_BY_COUNTRY: Record<string, string> = {
  NG: 'NGN',
  GH: 'GHS',
  KE: 'KES',
  ZA: 'ZAR',
  UG: 'UGX',
  TZ: 'TZS',
  EG: 'EGP',
};

function normalizeCountries(raw: SupportedCountryRow[]): CountryOption[] {
  return raw
    .map((c) => {
      if (typeof c === 'string') {
        const code = c.toUpperCase();
        return {
          code,
          name: COUNTRY_NAMES[code] || code,
          currency: CURRENCY_BY_COUNTRY[code] || '',
        };
      }
      const code = String(c.code || c.country || c.iso || '').toUpperCase();
      return {
        code,
        name: String(c.name || c.countryName || COUNTRY_NAMES[code] || code),
        currency: String(c.currency || CURRENCY_BY_COUNTRY[code] || '').toUpperCase(),
      };
    })
    .filter((c) => c.code);
}

export function useSupportedCountries() {
  const q = useQuery({
    queryKey: queryKeys.countries(),
    queryFn: async () => {
      const raw = await listSupportedCountries();
      return normalizeCountries(Array.isArray(raw) ? raw : []);
    },
    staleTime: 10 * 60_000,
  });

  return {
    countries: q.data || [],
    loading: q.isLoading,
    error: q.error ? String((q.error as Error).message) : null,
    isFetching: q.isFetching,
    refresh: () => q.refetch(),
  };
}

export function useBanksForCountry(country: string | null) {
  const code = (country || '').toUpperCase();
  const q = useQuery({
    queryKey: queryKeys.banks(code || '_'),
    queryFn: async () => {
      const res = await listBanks(code);
      if (Array.isArray(res)) return res as DirectoryBank[];
      return (res.banks || []) as DirectoryBank[];
    },
    enabled: code.length >= 2,
    staleTime: 10 * 60_000,
  });

  return {
    banks: q.data || [],
    currency: CURRENCY_BY_COUNTRY[code] || '',
    loading: code.length >= 2 && q.isLoading,
    isFetching: q.isFetching,
    refresh: () => q.refetch(),
  };
}
