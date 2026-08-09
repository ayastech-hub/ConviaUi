import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

/** Local card draft only — real payout rails use API bank accounts, not mocks. */
export type SavedCard = {
  id: string;
  brand: string;
  last4: string;
  expiry: string;
  name: string;
};

type PaymentMethodsContextValue = {
  cards: SavedCard[];
  kycName: string;
  addCard: (card: Omit<SavedCard, 'id'>) => void;
  removeCard: (id: string) => void;
};

const PaymentMethodsContext = createContext<PaymentMethodsContextValue | null>(null);

export function PaymentMethodsProvider({ children }: { children: ReactNode }) {
  const [cards, setCards] = useState<SavedCard[]>([]);

  const addCard = useCallback((card: Omit<SavedCard, 'id'>) => {
    setCards((prev) => [...prev, { ...card, id: `card_${Date.now()}` }]);
  }, []);

  const removeCard = useCallback((id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      cards,
      kycName: '',
      addCard,
      removeCard,
    }),
    [cards, addCard, removeCard],
  );

  return (
    <PaymentMethodsContext.Provider value={value}>{children}</PaymentMethodsContext.Provider>
  );
}

export function usePaymentMethods() {
  const ctx = useContext(PaymentMethodsContext);
  if (!ctx) throw new Error('usePaymentMethods must be used within PaymentMethodsProvider');
  return ctx;
}
