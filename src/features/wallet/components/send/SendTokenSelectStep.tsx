import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import type { Asset } from '../../../../shared/data/mockData';
import { AssetIcon } from '../../../../shared/components/AssetIcon';

interface SendTokenSelectStepProps {
  assets: Asset[];
  format: (n: number) => string;
  onSelect: (a: Asset) => void;
}

/** Send step 0: pick which token to send. */
export function SendTokenSelectStep({ assets, format, onSelect }: SendTokenSelectStepProps) {
  return (
    <motion.div key="select" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
      <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginBottom: 16 }}>Select a token to send</p>
      {assets.map((asset, i) => (
        <motion.button
          key={asset.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onSelect(asset)}
          className="flex items-center gap-3 p-4 rounded-[16px] mb-3 w-full text-left"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <AssetIcon symbol={asset.symbol} size={40} />
          <div className="flex-1">
            <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>{asset.symbol}</p>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{asset.name}</p>
          </div>
          <div className="text-right">
            <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13 }}>{asset.balance.toFixed(4)}</p>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{format(asset.valueUSD)}</p>
          </div>
          <ChevronRight size={16} style={{ color: 'var(--muted-foreground)' }} />
        </motion.button>
      ))}
    </motion.div>
  );
}
