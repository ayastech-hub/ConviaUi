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

export function listBankAccounts(userId: string) {
  return api.get<BankAccount[]>(`/users/${userId}/bank-accounts`);
}

export function addBankAccount(userId: string, body: { country: string; bankCode: string; accountNumber: string }) {
  return api.post<BankAccount>(`/users/${userId}/bank-accounts`, body);
}

export function removeBankAccount(userId: string, id: string) {
  return api.delete<void>(`/users/${userId}/bank-accounts/${id}`);
}

export function listBanks(country: string) {
  return api.get<{ banks?: Array<{ code: string; name: string; [k: string]: unknown }> } | Array<{ code: string; name: string }>>(
    `/banks?country=${encodeURIComponent(country)}`,
    { auth: false },
  );
}
