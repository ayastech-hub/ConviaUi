import { motion } from 'motion/react';
import { QrCode } from 'lucide-react';
import type { Asset } from '../../../../shared/data/mockData';
import { QRCodeDisplay } from '../../../../shared/components/QRCodeDisplay';
import { encodeQRPayload } from '../../../../shared/utils/qrPayload';
import type { NetworkInfo } from './types';

interface ReceiveQRCardProps {
  asset: Asset;
  network: string;
  netInfo: NetworkInfo;
  address: string;
  requestEnabled: boolean;
  requestAmount: string;
  amountNum: number;
}

/** QR code card, showing either a plain receive QR or one with a requested amount embedded. */
export function ReceiveQRCard({ asset, network, netInfo, address, requestEnabled, requestAmount, amountNum }: ReceiveQRCardProps) {
  return (
    <div className="rounded-[22px] p-5 mb-5 flex flex-col items-center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
        <QrCode size={15} style={{ color: 'var(--foreground)' }} />
        <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 13 }}>
          {requestEnabled && amountNum > 0 ? `Request ${amountNum} ${asset.symbol}` : `Receive ${asset.symbol}`}
        </p>
      </div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 22 }}
        style={{ padding: 16, background: '#FFFFFF', borderRadius: 18, boxShadow: '0 8px 28px rgba(0,0,0,0.18)', position: 'relative' }}
      >
        <QRCodeDisplay value={encodeQRPayload({ address, asset: asset.symbol, chain: network, amount: requestEnabled && amountNum > 0 ? requestAmount : undefined })} size={200} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 42, height: 42, borderRadius: 12, background: 'var(--foreground)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.25)' }}>
          <span style={{ color: '#FFF', fontWeight: 800, fontSize: 17 }}>C</span>
        </div>
      </motion.div>

      <p style={{ color: 'var(--muted-foreground)', fontSize: 11, marginTop: 12, textAlign: 'center' }}>
        {netInfo.name} network · {netInfo.label}
      </p>
    </div>
  );
}
