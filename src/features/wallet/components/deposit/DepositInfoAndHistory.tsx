import { Info, Clock, ShieldCheck, ArrowDownLeft, Zap } from 'lucide-react';
import type { Asset } from '../../../../shared/data/mockData';
import { cryptoAssets } from '../../../../shared/data/mockData';
import { useCurrency } from '../../../../shared/context/CurrencyContext';
import { AssetIcon } from '../../../../shared/components/AssetIcon';
import { NETWORKS, MOCK_DEPOSITS, type NetworkInfo } from './types';
import { StatusBadge } from './StatusBadge';

interface DepositInfoAndHistoryProps {
  asset: Asset;
  netInfo: NetworkInfo;
}

/** Min-deposit/est-arrival info grid, security note, and the recent deposits list, below the address card. */
export function DepositInfoAndHistory({ asset, netInfo }: DepositInfoAndHistoryProps) {
  const { format } = useCurrency();

  return (
    <>
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="rounded-[14px] p-3.5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <Info size={13} style={{ color: 'var(--muted-foreground)' }} />
            <p style={{ color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600 }}>Min Deposit</p>
          </div>
          <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15, fontFamily: 'ui-monospace, monospace' }}>
            {netInfo.minDeposit} {asset.symbol}
          </p>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 11, marginTop: 2 }}>≈ {format(netInfo.minDeposit * asset.price)}</p>
        </div>
        <div className="rounded-[14px] p-3.5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <Clock size={13} style={{ color: 'var(--muted-foreground)' }} />
            <p style={{ color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600 }}>Est. Arrival</p>
          </div>
          <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>{netInfo.estTime}</p>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 11, marginTop: 2 }}>
            {netInfo.confirmations} confirmation{netInfo.confirmations > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="rounded-[14px] p-3 mb-5 flex items-center gap-3" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
        <ShieldCheck size={18} style={{ color: 'var(--foreground)', flexShrink: 0 }} />
        <p style={{ color: 'var(--foreground)', fontSize: 11, lineHeight: 1.45, opacity: 0.85 }}>
          Convia generates a unique address for every deposit. Your funds are protected by multi-signature cold storage.
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <ArrowDownLeft size={16} style={{ color: 'var(--foreground)' }} />
          <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>Recent Deposits</p>
        </div>
        <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{MOCK_DEPOSITS.length} total</span>
      </div>

      <div className="rounded-[18px] overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        {MOCK_DEPOSITS.map((d, i) => {
          const a = cryptoAssets.find((x) => x.symbol === d.asset);
          return (
            <div key={d.id} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: i < MOCK_DEPOSITS.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: a ? a.bgColor : 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <AssetIcon symbol={d.asset} size={22} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 13 }}>+{d.amount} {d.asset}</p>
                  <StatusBadge status={d.status} />
                </div>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 11, marginTop: 1 }}>
                  {NETWORKS[d.network]?.name ?? d.network} · {d.time}
                  {d.status === 'pending' && ` · ${d.confirmations}/${d.needed} confs`}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 12 }}>{format(d.amountUSD)}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 3, marginTop: 2 }}>
                  <Zap size={10} style={{ color: d.status === 'confirmed' ? 'var(--positive)' : 'var(--muted-foreground)' }} />
                  <span style={{ color: 'var(--muted-foreground)', fontSize: 10 }}>
                    {d.status === 'confirmed' ? 'Credited' : d.status === 'pending' ? 'Processing' : 'Reverted'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p style={{ color: 'var(--muted-foreground)', fontSize: 10, textAlign: 'center', marginTop: 14, lineHeight: 1.5 }}>
        Deposits are processed automatically once the required network confirmations are reached. Need help?{' '}
        <span style={{ color: 'var(--foreground)', fontWeight: 600 }}>Contact support</span>
      </p>
    </>
  );
}
