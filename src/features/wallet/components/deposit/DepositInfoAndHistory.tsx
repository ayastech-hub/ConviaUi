import type { Asset } from '../../../../shared/data/mockData';
import { useCurrency } from '../../../../shared/context/CurrencyContext';
import type { NetworkInfo } from './types';

interface DepositInfoAndHistoryProps {
  asset: Asset;
  netInfo: NetworkInfo;
}

function fmtMin(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return '—';
  if (n >= 1) return n.toLocaleString(undefined, { maximumFractionDigits: 4 });
  return n.toLocaleString(undefined, { maximumFractionDigits: 8 });
}

/** Network facts under the address card — min deposit from live backend when available. */
export function DepositInfoAndHistory({ asset, netInfo }: DepositInfoAndHistoryProps) {
  const { format } = useCurrency();
  const min = Number(netInfo.minDeposit) || 0;
  const usd = min > 0 && asset.price > 0 ? min * asset.price : netInfo.minDepositUsd || 0;

  return (
    <div
      className="rounded-[20px] overflow-hidden"
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
    >
      <div className="flex justify-between px-4 py-3.5" style={{ borderBottom: '1px solid var(--border)' }}>
        <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Min deposit</span>
        <span className="tabular-nums text-right" style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13 }}>
          {min > 0 ? (
            <>
              {fmtMin(min)} {asset.symbol}
              {usd > 0 && (
                <span style={{ color: 'var(--muted-foreground)', fontWeight: 500 }}> · {format(usd)}</span>
              )}
            </>
          ) : usd > 0 ? (
            <>≈ {format(usd)}</>
          ) : (
            '—'
          )}
        </span>
      </div>
      <div className="flex justify-between px-4 py-3.5">
        <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Confirmations</span>
        <span style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13 }}>
          {netInfo.confirmations}
          {netInfo.estTime ? ` · ${netInfo.estTime}` : ''}
        </span>
      </div>
    </div>
  );
}
