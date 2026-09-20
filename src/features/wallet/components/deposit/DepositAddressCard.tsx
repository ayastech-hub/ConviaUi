import { motion } from 'motion/react';
import { QrCode, Copy, Check, AlertTriangle } from 'lucide-react';
import type { Asset } from '../../../../shared/data/mockData';
import { QRCodeDisplay } from '../../../../shared/components/QRCodeDisplay';
import { encodeQRPayload } from '../../../../shared/utils/qrPayload';
import type { NetworkInfo } from './types';

interface DepositAddressCardProps {
  asset: Asset;
  network: string;
  netInfo: NetworkInfo;
  address: string;
  copied: boolean;
  onCopy: () => void;
}

/** QR + tappable address (copy). No large share/copy CTAs. */
export function DepositAddressCard({ asset, network, netInfo, address, copied, onCopy }: DepositAddressCardProps) {
  return (
    <>
      <div
        className="rounded-[22px] p-5 mb-4 flex flex-col items-center"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-1.5 mb-4">
          <QrCode size={15} style={{ color: 'var(--foreground)' }} />
          <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 13 }}>
            Scan to deposit {asset.symbol}
          </p>
        </div>

        <motion.div
          initial={{ scale: 0.94, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 22 }}
          style={{
            padding: 14,
            background: '#FFFFFF',
            borderRadius: 18,
            boxShadow: '0 8px 28px rgba(0,0,0,0.16)',
          }}
        >
          <QRCodeDisplay
            value={encodeQRPayload({ address, asset: asset.symbol, chain: network })}
            size={180}
          />
        </motion.div>

        <p style={{ color: 'var(--muted-foreground)', fontSize: 11, marginTop: 14, marginBottom: 8 }}>
          {netInfo.label} · {netInfo.name}
        </p>

        <button
          type="button"
          onClick={onCopy}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left"
          style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
        >
          <p
            className="flex-1 min-w-0 truncate font-mono"
            style={{ color: 'var(--foreground)', fontSize: 12.5, fontWeight: 600 }}
          >
            {address}
          </p>
          {copied ? (
            <Check size={16} style={{ color: 'var(--positive)', flexShrink: 0 }} />
          ) : (
            <Copy size={16} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
          )}
        </button>
      </div>

      <div
        className="rounded-[14px] p-3.5 mb-4"
        style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
      >
        <div className="flex gap-2.5 items-start">
          <AlertTriangle size={16} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: 1 }} />
          <p style={{ color: 'var(--warning)', fontSize: 12, lineHeight: 1.5, fontWeight: 500 }}>
            Only send <strong>{asset.symbol}</strong> on <strong>{netInfo.label}</strong>. Wrong asset or
            network can mean permanent loss.
          </p>
        </div>
      </div>
    </>
  );
}
