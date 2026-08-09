import type { ReactNode } from 'react';
import { CurrencyProvider } from '../../shared/context/CurrencyContext';
import { PaymentMethodsProvider } from '../../shared/context/PaymentMethodsContext';

/**
 * Single composition point for every app-wide context provider.
 *
 * Adding a new global provider (auth, feature flags, theme, etc.)
 * should only ever require a change in this one file, not in App.tsx
 * or in every feature that needs it.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <CurrencyProvider>
      <PaymentMethodsProvider>{children}</PaymentMethodsProvider>
    </CurrencyProvider>
  );
}
