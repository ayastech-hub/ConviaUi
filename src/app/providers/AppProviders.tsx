import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../../shared/query/queryClient';
import { CurrencyProvider } from '../../shared/context/CurrencyContext';
import { PaymentMethodsProvider } from '../../shared/context/PaymentMethodsContext';
import { AuthProvider } from '../../shared/context/AuthContext';
import { LanguageProvider } from '../../shared/context/LanguageContext';

/**
 * App-wide providers. QueryClient wraps everything so hooks can share cache.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <CurrencyProvider>
            <PaymentMethodsProvider>{children}</PaymentMethodsProvider>
          </CurrencyProvider>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
