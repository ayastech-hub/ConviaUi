import { motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import type { Asset } from '../../../../shared/data/mockData';
import { AssetIcon } from '../../../../shared/components/AssetIcon';
import type { NetworkInfo } from './types';

interface DepositSelectorsProps {
  asset: Asset;
  network: string;
  netInfo: NetworkInfo;
  onOpenAsset: () => void;
  onOpenNetwork: () => void;
}

/** The two tappable cards above the QR code: "asset" and "network". */
export function DepositSelectors({ asset, network, netInfo, onOpenAsset, onOpenNetwork }: DepositSelectorsProps) {
  return (
    <>
      <motion.button
        whileTap={{ scale: 0.99 }}
        onClick={onOpenAsset}
        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-[18px] mb-3"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <AssetIcon symbol={asset.symbol} size={44} />
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>{asset.symbol}</p>
            <span style={{ fontSize: 10, fontWeight: 700, color: asset.change24h >= 0 ? 'var(--positive)' : 'var(--destructive)', background: 'var(--muted)', padding: '1px 6px', borderRadius: 6 }}>
              {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
            </span>
          </div>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
            {asset.name} · ${asset.price < 1 ? asset.price.toFixed(4) : asset.price.toLocaleString('en', { maximumFractionDigits: 2 })}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', borderRadius: 10, background: 'var(--muted)' }}>
          <span style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}>Change</span>
          <ChevronDown size={14} style={{ color: 'var(--muted-foreground)' }} />
        </div>
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.99 }}
        onClick={onOpenNetwork}
        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-[18px] mb-5"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <div style={{ width: 38, height: 38, borderRadius: 10, background: netInfo.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: network === 'BSC' || network === 'BASE' ? '#000' : '#FFF', fontWeight: 800, fontSize: 12, flexShrink: 0 }}>
          {netInfo.label.slice(0, 3)}
        </div>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>{netInfo.name}</p>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
            {netInfo.label} · {asset.chains.length} network{asset.chains.length > 1 ? 's' : ''} available
          </p>
        </div>
        <ChevronDown size={16} style={{ color: 'var(--muted-foreground)' }} />
      </motion.button>
    </>
  );
}
