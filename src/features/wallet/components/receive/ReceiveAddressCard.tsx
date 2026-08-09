import { motion } from 'motion/react';
import { Copy, CheckCircle2, Share2, Check, AlertTriangle } from 'lucide-react';
import type { Asset } from '../../../../shared/data/mockData';
import type { NetworkInfo } from './types';

interface ReceiveAddressCardProps {
  asset: Asset;
  address: string;
  netInfo: NetworkInfo;
  copied: boolean;
  shared: boolean;
  onCopy: () => void;
  onShare: () => void;
}

/** Address text card, copy/share action row, and the "only send this asset" warning banner. */
export function ReceiveAddressCard({ asset, address, netInfo, copied, shared, onCopy, onShare }: ReceiveAddressCardProps) {
  return (
    <>
      <div className="rounded-[18px] p-4 mb-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{asset.symbol} Address</p>
          <motion.button whileTap={{ scale: 0.9 }} onClick={onCopy} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'transparent', border: 'none' }}>
            {copied ? <CheckCircle2 size={14} style={{ color: 'var(--positive)' }} /> : <Copy size={14} style={{ color: 'var(--muted-foreground)' }} />}
          </motion.button>
        </div>
        <p style={{ color: 'var(--foreground)', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 13, wordBreak: 'break-all', lineHeight: 1.5, letterSpacing: -0.2 }}>
          {address}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 5 }}>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onCopy}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[16px]"
          style={{ background: copied ? 'var(--muted)' : 'var(--primary)', color: copied ? 'var(--positive)' : '#FFF', fontWeight: 700, fontSize: 14, border: copied ? '1px solid var(--positive)' : 'none' }}
        >
          {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
          {copied ? 'Copied!' : 'Copy Address'}
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onShare}
          className="w-14 flex items-center justify-center rounded-[16px]"
          style={{ background: 'var(--muted)', border: shared ? '1px solid var(--primary)' : '1px solid var(--border)' }}
        >
          {shared ? <Check size={18} style={{ color: 'var(--foreground)' }} /> : <Share2 size={18} style={{ color: 'var(--foreground)' }} />}
        </motion.button>
      </div>

      <div className="rounded-[14px] p-3.5 mb-4" style={{ background: 'var(--muted)', border: '1px solid var(--muted)' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <AlertTriangle size={18} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: 1 }} />
          <p style={{ color: 'var(--warning)', fontSize: 12, lineHeight: 1.5, fontWeight: 500 }}>
            Only send <strong>{asset.symbol}</strong> ({netInfo.label}) to this address. Sending other assets or using a different network may result in <strong>permanent loss</strong>.
          </p>
        </div>
      </div>
    </>
  );
}
