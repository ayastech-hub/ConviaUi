import type { ReactNode } from 'react';
import { CurrencyProvider } from '../../shared/context/CurrencyContext';
import { PaymentMethodsProvider } from '../../shared/context/PaymentMethodsContext';
import { AuthProvider } from '../../shared/context/AuthContext';

/**
 * Single composition point for every app-wide context provider.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <PaymentMethodsProvider>{children}</PaymentMethodsProvider>
      </CurrencyProvider>
    </AuthProvider>
  );
}
