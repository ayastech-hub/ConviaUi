import { api } from './client';

export type Biller = {
  code?: string;
  billerCode?: string;
  name?: string;
  id?: string;
  [key: string]: unknown;
};

export type BillPaymentResult = {
  id: string;
  status: string;
  amount?: string;
  asset?: string;
  localAmount?: string;
  localCurrency?: string;
  provider?: string;
  billerCode?: string;
  customerRef?: string;
  customerName?: string | null;
  externalRef?: string | null;
  failureReason?: string | null;
};

export function getBillsMarkets() {
  return api.get<{
    countries: string[];
    categories: string[];
    settlement: string;
    providers?: Record<string, unknown>;
  }>('/bills/markets', { auth: false });
}

export function listBillers(country: string, category: string) {
  return api.get<{
    country: string;
    currency: string;
    category: string;
    provider?: string;
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
  pin: string;
  country: string;
  category: string;
  billerCode: string;
  customerRef: string;
  amount: string;
  asset: string;
  localAmount: string;
  localCurrency: string;
  productCode?: string;
}) {
  return api.post<BillPaymentResult>('/bills/pay', body, { idempotent: true });
}

export function listVariations(serviceId: string, country = 'NG') {
  return api.get<{ serviceId: string; variations: Array<{ code: string; name: string; amount?: string }> }>(
    `/bills/variations?country=${encodeURIComponent(country)}&serviceId=${encodeURIComponent(serviceId)}`,
  );
}
