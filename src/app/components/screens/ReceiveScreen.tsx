import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Copy, Share2, CheckCircle2, ChevronDown, AlertTriangle } from 'lucide-react';
import { cryptoAssets, type Screen } from '../../data/mockData';
import { AssetIcon } from './HomeScreen';

interface ReceiveScreenProps {
  goBack: () => void;
}

const QR_SIZE = 200;

function QRCode({ address }: { address: string }) {
  // Simple visual QR-like pattern
  const cells = 21;
  const cell = QR_SIZE / cells;
  const pattern: boolean[][] = Array.from({ length: cells }, (_, r) =>
    Array.from({ length: cells }, (_, c) => {
      // Finder patterns corners
      if ((r < 7 && c < 7) || (r < 7 && c >= cells - 7) || (r >= cells - 7 && c < 7)) return true;
      // Timing patterns
      if (r === 6 || c === 6) return (r + c) % 2 === 0;
      // Data cells (pseudo-random from address)
      const seed = address.charCodeAt((r * cells + c) % address.length) + r * 17 + c * 13;
      return seed % 3 !== 0;
    })
  );

  return (
    <svg width={QR_SIZE} height={QR_SIZE} viewBox={`0 0 ${QR_SIZE} ${QR_SIZE}`}>
      <rect width={QR_SIZE} height={QR_SIZE} fill="white" rx="8" />
      {pattern.map((row, r) =>
        row.map((on, c) =>
          on ? (
            <rect
              key={`${r}-${c}`}
              x={c * cell + 1}
              y={r * cell + 1}
              width={cell - 1}
              height={cell - 1}
              fill="#0A0F1E"
              rx={1}
            />
          ) : null
        )
      )}
    </svg>
  );
}

export function ReceiveScreen({ goBack }: ReceiveScreenProps) {
  const [selectedAsset, setSelectedAsset] = useState(cryptoAssets.find(a => a.id === 'usdt')!);
  const [copied, setCopied] = useState(false);

  const address = '0x4f3a8b2c1d9e7f5a3b8c2d9e7f5a3b8c2d9e7B2E';
  const shortAddr = `${address.slice(0, 8)}...${address.slice(-6)}`;

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />

      {/* Header */}
      <div className="flex items-center gap-3 px-5 mb-6">
        <motion.button whileTap={{ scale: 0.9 }} onClick={goBack} className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'var(--muted)' }}>
          <ChevronLeft size={20} style={{ color: 'var(--foreground)' }} />
        </motion.button>
        <h2 style={{ color: 'var(--foreground)', fontWeight: 800 }}>Receive</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-5">
        {/* Asset selector */}
        <div className="mb-5">
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 8 }}>Receive</p>
          <div className="flex gap-2 flex-wrap">
            {cryptoAssets.map(asset => (
              <motion.button
                key={asset.id}
                whileTap={{ scale: 0.93 }}
                onClick={() => setSelectedAsset(asset)}
                className="flex items-center gap-2 px-3 py-2 rounded-[12px]"
                style={{
                  background: selectedAsset.id === asset.id ? 'var(--primary)' : 'var(--muted)',
                  border: selectedAsset.id === asset.id ? 'none' : '1px solid var(--border)',
                }}
              >
                <AssetIcon symbol={asset.symbol} size={18} />
                <span style={{ color: selectedAsset.id === asset.id ? '#FFF' : 'var(--foreground)', fontSize: 13, fontWeight: 600 }}>
                  {asset.symbol}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Chain selector */}
        <div className="mb-5">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-[12px]" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="w-2 h-2 rounded-full" style={{ background: 'var(--primary)' }} />
            <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 500, flex: 1 }}>
              {selectedAsset.chains[0]} Network
            </span>
            <ChevronDown size={14} style={{ color: 'var(--muted-foreground)' }} />
          </div>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center mb-5">
          <div
            className="p-4 rounded-[20px] mb-4"
            style={{ background: 'white', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}
          >
            <QRCode address={address} />
          </div>

          <div className="flex items-center gap-2 mb-1">
            <AssetIcon symbol={selectedAsset.symbol} size={20} />
            <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 16 }}>
              {selectedAsset.name}
            </p>
          </div>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 4 }}>
            {selectedAsset.chains[0]} Address
          </p>
          <p style={{ color: 'var(--foreground)', fontSize: 12, fontFamily: 'monospace', textAlign: 'center', lineHeight: 1.6 }}>
            {address}
          </p>
        </div>

        {/* Info box */}
        <div className="px-4 py-3 rounded-[14px] mb-5" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <p style={{ color: '#F59E0B', fontSize: 12, lineHeight: 1.5 }}>
            Only send {selectedAsset.symbol} on the {selectedAsset.chains[0]} network to this address. Sending other assets may result in permanent loss.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[16px]"
            style={{ background: 'var(--primary)', color: '#FFF', fontWeight: 700 }}
          >
            {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
            {copied ? 'Copied!' : 'Copy Address'}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="w-14 flex items-center justify-center rounded-[16px]"
            style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
          >
            <Share2 size={18} style={{ color: 'var(--foreground)' }} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
