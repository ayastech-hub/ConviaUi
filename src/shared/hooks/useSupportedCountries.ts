import { useCallback, useEffect, useState } from 'react';
import {
  listSupportedCountries,
  listBanks,
  type SupportedCountryRow,
  type DirectoryBank,
} from '../api/banks';
import { cacheGet, cacheSet } from '../cache/queryCache';

const COUNTRIES_KEY = 'dir:countries';

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

function normalizeCountries(raw: SupportedCountryRow[]): CountryOption[] {
  return raw
    .map((c) => {
      if (typeof c === 'string') {
        const code = c.toUpperCase();
        return { code, name: COUNTRY_NAMES[code] || code, currency: '' };
      }
      const code = String(c.code || c.country || c.iso || '').toUpperCase();
      return {
        code,
        name: String(c.name || c.countryName || COUNTRY_NAMES[code] || code),
        currency: String(c.currency || '').toUpperCase(),
      };
    })
    .filter((c) => c.code.length === 2);
}

export function useSupportedCountries() {
  const cached = cacheGet<CountryOption[]>(COUNTRIES_KEY, 10 * 60_000);
  const [countries, setCountries] = useState<CountryOption[]>(cached || []);
  const [loading, setLoading] = useState(!cached);

  const refresh = useCallback(async () => {
    setLoading((prev) => (countries.length ? false : true));
    try {
      const raw = await listSupportedCountries();
      let list = normalizeCountries(raw);
      // If API returns only codes, enrich currency via /banks?country=
      if (list.length && list.every((c) => !c.currency)) {
        const enriched = await Promise.all(
          list.map(async (c) => {
            try {
              const dir = await listBanks(c.code);
              return {
                ...c,
                currency: dir.currency || c.currency,
                name: c.name || c.code,
              };
            } catch {
              return c;
            }
          }),
        );
        list = enriched;
      }
      cacheSet(COUNTRIES_KEY, list);
      setCountries(list);
    } catch {
      /* keep cache */
    } finally {
      setLoading(false);
    }
  }, [countries.length]);

  useEffect(() => {
    void refresh();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { countries, loading, refresh };
}

export function useBanksForCountry(country: string | null) {
  const [banks, setBanks] = useState<DirectoryBank[]>([]);
  const [currency, setCurrency] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!country) {
      setBanks([]);
      return;
    }
    const key = `dir:banks:${country}`;
    const cached = cacheGet<{ banks: DirectoryBank[]; currency?: string }>(key, 10 * 60_000);
    if (cached) {
      setBanks(cached.banks);
      setCurrency(cached.currency);
    }
    let cancelled = false;
    setLoading(!cached);
    listBanks(country)
      .then((dir) => {
        if (cancelled) return;
        cacheSet(key, { banks: dir.banks, currency: dir.currency });
        setBanks(dir.banks);
        setCurrency(dir.currency);
      })
      .catch(() => {
        if (!cancelled && !cached) setBanks([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [country]);

  return { banks, currency, loading };
}
