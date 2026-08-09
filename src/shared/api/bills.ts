import { api } from './client';

export type Biller = {
  code?: string;
  billerCode?: string;
  name?: string;
  id?: string;
  [key: string]: unknown;
};

export function getBillsMarkets() {
  return api.get<{
    countries: string[];
    categories: string[];
    settlement: string;
  }>('/bills/markets', { auth: false });
}

export function listBillers(country: string, category: string) {
  return api.get<{
    country: string;
    currency: string;
    category: string;
    billers: Biller[];
  }>(`/bills/billers?country=${encodeURIComponent(country)}&category=${encodeURIComponent(category)}`, {
    auth: false,
  });
}

export function validateCustomer(body: {
  country: string;
  category: string;
  billerCode: string;
  customerRef: string;
}) {
  return api.post<{ valid?: boolean; customerName?: string; [k: string]: unknown }>('/bills/validate-customer', body);
}

export function payBill(body: {
  userId: string;
  country: string;
  category: string;
  billerCode: string;
  customerRef: string;
  amount: string;
  asset: string;
  localAmount: string;
  localCurrency: string;
}) {
  return api.post('/bills/pay', body, { idempotent: true });
}
