import { motion } from 'motion/react';
import { QrCode, Copy, Share2, CheckCircle2, Check, AlertTriangle } from 'lucide-react';
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
  shared: boolean;
  onCopy: () => void;
  onShare: () => void;
}

/** QR code, address display (with copy), and copy/share action buttons for the deposit address. */
export function DepositAddressCard({ asset, network, netInfo, address, copied, shared, onCopy, onShare }: DepositAddressCardProps) {
  return (
    <>
      <div className="rounded-[22px] p-5 mb-5 flex flex-col items-center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
          <QrCode size={15} style={{ color: 'var(--foreground)' }} />
          <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 13 }}>Scan to deposit {asset.symbol}</p>
        </div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 22 }}
          style={{ padding: 16, background: '#FFFFFF', borderRadius: 18, boxShadow: '0 8px 28px rgba(0,0,0,0.18)', position: 'relative' }}
        >
          <QRCodeDisplay value={encodeQRPayload({ address, asset: asset.symbol, chain: network })} size={196} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 40, height: 40, borderRadius: 12, background: 'var(--foreground)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.25)' }}>
            <span style={{ color: '#FFF', fontWeight: 800, fontSize: 16 }}>C</span>
          </div>
        </motion.div>

        <p style={{ color: 'var(--muted-foreground)', fontSize: 11, marginTop: 12, textAlign: 'center' }}>
          {netInfo.name} network · {netInfo.label}
        </p>
      </div>

      <div className="rounded-[18px] p-4 mb-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Deposit Address</p>
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
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[16px]"
          style={{ background: 'var(--muted)', color: shared ? 'var(--primary)' : 'var(--foreground)', fontWeight: 700, fontSize: 14, border: shared ? '1px solid var(--primary)' : '1px solid var(--border)' }}
        >
          {shared ? <Check size={18} /> : <Share2 size={18} />}
          {shared ? 'Shared!' : 'Share Address'}
        </motion.button>
      </div>

      <div className="rounded-[14px] p-3.5 mb-4" style={{ background: 'var(--muted)', border: '1px solid var(--muted)' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <AlertTriangle size={18} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: 1 }} />
          <p style={{ color: 'var(--warning)', fontSize: 12, lineHeight: 1.5, fontWeight: 500 }}>
            Only send <strong>{asset.symbol}</strong> ({netInfo.label}) to this address. Sending any other asset or using a different network may result in <strong>permanent loss</strong> of your funds.
          </p>
        </div>
      </div>
    </>
  );
}
