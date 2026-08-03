import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  rate: number; // 1 USD = rate * currency
  flag: string; // country code for display
}

export const CURRENCIES: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1, flag: 'US' },
  { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.92, flag: 'EU' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', rate: 1634, flag: 'NG' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', rate: 135.2, flag: 'KE' },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: 'GH₵', rate: 16.45, flag: 'GH' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', rate: 18.72, flag: 'ZA' },
  { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh', rate: 3780, flag: 'UG' },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh', rate: 2530, flag: 'TZ' },
  { code: 'RWF', name: 'Rwandan Franc', symbol: 'RF', rate: 1280, flag: 'RW' },
  { code: 'XOF', name: 'West African CFA', symbol: 'CFA', rate: 605, flag: 'XOF' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£', rate: 48.6, flag: 'EG' },
  { code: 'MAD', name: 'Moroccan Dirham', symbol: 'DH', rate: 9.95, flag: 'MA' },
];

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  format: (usdAmount: number) => string;
  convert: (usdAmount: number) => number;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

const STORAGE_KEY = 'convex_currency';

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const found = CURRENCIES.find(c => c.code === saved);
        if (found) return found;
      }
    } catch {}
    return CURRENCIES[0];
  });

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    try { localStorage.setItem(STORAGE_KEY, c.code); } catch {}
  };

  const convert = (usdAmount: number) => usdAmount * currency.rate;

  const format = (usdAmount: number) => {
    const converted = usdAmount * currency.rate;
    const decimals = currency.rate > 100 ? 0 : 2;
    return `${currency.symbol}${converted.toLocaleString('en', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, format, convert }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}
