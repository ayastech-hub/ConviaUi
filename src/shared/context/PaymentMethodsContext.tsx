import { createContext, useContext, useState, type ReactNode } from 'react';

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  currency: string;
  type: 'bank' | 'mobile';
}

export interface SavedCard {
  id: string;
  brand: string;
  last4: string;
  expiry: string;
  color: string;
}

interface PaymentMethodsContextValue {
  bankAccounts: BankAccount[];
  cards: SavedCard[];
  kycName: string;
  addBankAccount: (acct: Omit<BankAccount, 'id' | 'accountName'>) => void;
  removeBankAccount: (id: string) => void;
  addCard: (card: Omit<SavedCard, 'id'>) => void;
  removeCard: (id: string) => void;
}

const PaymentMethodsContext = createContext<PaymentMethodsContextValue | null>(null);

const KYC_NAME = 'Adeola Okonkwo';

const INITIAL_BANKS: BankAccount[] = [
  { id: 'b1', bankName: 'GTBank', accountNumber: '0123456789', accountName: KYC_NAME, currency: 'NGN', type: 'bank' },
  { id: 'b2', bankName: 'M-Pesa', accountNumber: '+254712345678', accountName: KYC_NAME, currency: 'KES', type: 'mobile' },
  { id: 'b3', bankName: 'MTN MoMo', accountNumber: '+23324123456', accountName: KYC_NAME, currency: 'GHS', type: 'mobile' },
];

const INITIAL_CARDS: SavedCard[] = [
  { id: 'c1', brand: 'Visa', last4: '4242', expiry: '12/26', color: 'var(--card)' },
];

export function PaymentMethodsProvider({ children }: { children: ReactNode }) {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(INITIAL_BANKS);
  const [cards, setCards] = useState<SavedCard[]>(INITIAL_CARDS);

  const addBankAccount = (acct: Omit<BankAccount, 'id' | 'accountName'>) => {
    setBankAccounts(prev => [...prev, { ...acct, id: `b${Date.now()}`, accountName: KYC_NAME }]);
  };

  const removeBankAccount = (id: string) => {
    setBankAccounts(prev => prev.filter(b => b.id !== id));
  };

  const addCard = (card: Omit<SavedCard, 'id'>) => {
    setCards(prev => [...prev, { ...card, id: `c${Date.now()}` }]);
  };

  const removeCard = (id: string) => {
    setCards(prev => prev.filter(c => c.id !== id));
  };

  return (
    <PaymentMethodsContext.Provider value={{ bankAccounts, cards, kycName: KYC_NAME, addBankAccount, removeBankAccount, addCard, removeCard }}>
      {children}
    </PaymentMethodsContext.Provider>
  );
}

export function usePaymentMethods() {
  const ctx = useContext(PaymentMethodsContext);
  if (!ctx) throw new Error('usePaymentMethods must be used within PaymentMethodsProvider');
  return ctx;
}
