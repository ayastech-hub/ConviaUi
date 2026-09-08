import type { Asset } from '../../../../shared/data/mockData';
import { AssetIcon } from '../../../../shared/components/AssetIcon';
import { ChevronDown } from 'lucide-react';
import type { NetworkInfo } from './types';

interface DepositSelectorsProps {
  asset: Asset;
  network: string;
  netInfo: NetworkInfo;
  onOpenAsset: () => void;
  onOpenNetwork: () => void;
}

/** Asset + network rows — same pattern as withdraw. */
export function DepositSelectors({
  asset,
  network,
  netInfo,
  onOpenAsset,
  onOpenNetwork,
}: DepositSelectorsProps) {
  return (
    <>
      <button
        type="button"
        onClick={onOpenAsset}
        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-[20px] mb-3 text-left"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <AssetIcon symbol={asset.symbol} size={40} />
        <div className="flex-1 min-w-0">
          <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>{asset.symbol}</p>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{asset.name}</p>
        </div>
        <span style={{ color: 'var(--primary)', fontSize: 13, fontWeight: 600 }}>Change</span>
      </button>

      <button
        type="button"
        onClick={onOpenNetwork}
        className="w-full flex items-center justify-between px-4 py-3.5 rounded-[20px] mb-4 text-left"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <div>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600 }}>Network</p>
          <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14, marginTop: 2 }}>
            {netInfo.name || netInfo.label || network}
          </p>
        </div>
        <ChevronDown size={16} style={{ color: 'var(--muted-foreground)' }} />
      </button>
    </>
  );
}
