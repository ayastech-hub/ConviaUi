import type { Asset } from '../../../../shared/data/mockData';
import { useCurrency } from '../../../../shared/context/CurrencyContext';
import type { NetworkInfo } from './types';

interface DepositInfoAndHistoryProps {
  asset: Asset;
  netInfo: NetworkInfo;
}

/** Compact network facts under the address card. */
export function DepositInfoAndHistory({ asset, netInfo }: DepositInfoAndHistoryProps) {
  const { format } = useCurrency();

  return (
    <div
      className="rounded-[20px] overflow-hidden"
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
    >
      <div className="flex justify-between px-4 py-3.5" style={{ borderBottom: '1px solid var(--border)' }}>
        <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Min deposit</span>
        <span className="tabular-nums" style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13 }}>
          {netInfo.minDeposit} {asset.symbol}
          <span style={{ color: 'var(--muted-foreground)', fontWeight: 500 }}> · {format(netInfo.minDeposit * asset.price)}</span>
        </span>
      </div>
      <div className="flex justify-between px-4 py-3.5">
        <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Confirmations</span>
        <span style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13 }}>
          {netInfo.confirmations} · {netInfo.estTime}
        </span>
      </div>
    </div>
  );
}
