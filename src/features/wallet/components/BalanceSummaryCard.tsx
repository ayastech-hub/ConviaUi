import { usePortfolio } from '../../../shared/hooks/usePortfolio';
import { useCurrency } from '../../../shared/context/CurrencyContext';
import { useAuth } from '../../../shared/context/AuthContext';

/** Wallet header total — same live portfolio total as Home. */
export function BalanceSummaryCard() {
  const { format } = useCurrency();
  const { status } = useAuth();
  const { data, loading, source } = usePortfolio();
  const totalUSD = data ? Number(data.totalValueUsd) || 0 : 0;

  return (
    <div className="px-5 mb-4">
      <div
        className="rounded-[20px] p-4 glass-card"
        style={{ border: '1px solid var(--border)', background: 'var(--card)' }}
      >
        <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 4 }}>
          Total balance
          {source === 'live' && (
            <span style={{ marginLeft: 8, fontSize: 10, color: 'var(--positive)', fontWeight: 600 }}>LIVE</span>
          )}
        </p>
        <p style={{ color: 'var(--foreground)', fontSize: 28, fontWeight: 800, letterSpacing: -0.5 }}>
          {loading || status === 'loading' ? '…' : format(totalUSD)}
        </p>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginTop: 4 }}>
          {status === 'anonymous'
            ? 'Sign in to load ledger balances'
            : source === 'live'
              ? `${data?.holdings?.length ?? 0} holdings`
              : 'Waiting for API'}
        </p>
      </div>
    </div>
  );
}
