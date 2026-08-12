import { api } from './client';

export type BankAccount = {
  id: string;
  userId?: string;
  country?: string;
  bankCode?: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  last4?: string;
  currency?: string;
  status?: string;
  [key: string]: unknown;
};

export type DirectoryBank = {
  code: string;
  name: string;
};

export type SupportedCountryRow = {
  code: string;
  name?: string;
  currency?: string;
  [key: string]: unknown;
};

export function listBankAccounts(userId: string) {
  return api.get<BankAccount[]>(`/users/${userId}/bank-accounts`);
}

export function addBankAccount(
  userId: string,
  body: { country: string; bankCode: string; accountNumber: string },
) {
  return api.post<BankAccount>(`/users/${userId}/bank-accounts`, body);
}

export function removeBankAccount(userId: string, id: string) {
  return api.delete<void>(`/users/${userId}/bank-accounts/${id}`);
}

/** GET /banks/countries — supported operating markets (not hardcoded). */
export async function listSupportedCountries(): Promise<SupportedCountryRow[]> {
  const res = await api.get<{ countries?: SupportedCountryRow[] } | SupportedCountryRow[]>(
    '/banks/countries',
    { auth: false },
  );
  if (Array.isArray(res)) return res;
  return res.countries || [];
}

/** GET /banks?country=XX — bank directory for that market. */
export async function listBanks(country: string): Promise<{
  country: string;
  currency?: string;
  banks: DirectoryBank[];
}> {
  const res = await api.get<
    | DirectoryBank[]
    | {
        country?: string;
        currency?: string;
        banks?: DirectoryBank[];
      }
  >(`/banks?country=${encodeURIComponent(country)}`, { auth: false });
  // Backend may return { banks } or a bare array
  if (Array.isArray(res)) {
    return { country, banks: res };
  }
  return {
    country: res.country || country,
    currency: res.currency,
    banks: Array.isArray(res.banks) ? res.banks : [],
  };
}
