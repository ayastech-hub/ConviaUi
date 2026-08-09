import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Copy,
  Share2,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Search,
  Check,
  Clock,
  Info,
  Wallet,
} from 'lucide-react';
import { cryptoAssets, type Asset } from '../../../shared/data/mockData';
import { AssetIcon } from '../../../shared/components/AssetIcon';
import { useCurrency } from '../../../shared/context/CurrencyContext';
import { QRCodeDisplay } from '../../../shared/components/QRCodeDisplay';
import { encodeQRPayload } from '../../../shared/utils/qrPayload';

interface ReceiveScreenProps {
  goBack: () => void;
}

/* ------------------------------------------------------------------ */
/*  Network metadata                                                    */
/* ------------------------------------------------------------------ */

interface NetworkInfo {
  name: string;
  label: string;
  color: string;
  estTime: string;
}

const NETWORKS: Record<string, NetworkInfo> = {
  Bitcoin: { name: 'Bitcoin', label: 'BTC', color: 'var(--muted-foreground)', estTime: '10–30 min' },
  Ethereum: { name: 'Ethereum', label: 'ERC-20', color: 'var(--muted-foreground)', estTime: '3–5 min' },
  BASE: { name: 'BASE', label: 'Base', color: 'var(--muted-foreground)', estTime: '2–4 min' },
  BSC: { name: 'BNB Smart Chain', label: 'BEP-20', color: 'var(--muted-foreground)', estTime: '1–3 min' },
  Solana: { name: 'Solana', label: 'SPL', color: 'var(--muted-foreground)', estTime: '1–10 sec' },
  Tron: { name: 'Tron', label: 'TRC-20', color: 'var(--muted-foreground)', estTime: '1–2 min' },
};

/* ------------------------------------------------------------------ */
/*  Deterministic address generator (mock)                             */
/* ------------------------------------------------------------------ */

function generateAddress(asset: Asset, network: string): string {
  const seed = asset.id + network;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;

  const charset =
    network === 'Bitcoin'
      ? 'qpzry9x8gf2tvdw0s3jn74li6eughk1mca'
      : network === 'Solana'
      ? '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
      : '0123456789abcdef';

  const len = network === 'Bitcoin' ? 42 : network === 'Solana' ? 44 : 40;
  let s = '';
  let x = h;
  for (let i = 0; i < len; i++) {
    x = (x * 1103515245 + 12345 + i * 7) & 0x7fffffff;
    s += charset[x % charset.length];
  }
  const prefix = network === 'Bitcoin' ? 'bc1q' : network === 'Solana' ? '' : '0x';
  return prefix + s;
}

/* ------------------------------------------------------------------ */
/*  Asset dropdown                                                      */
/* ------------------------------------------------------------------ */

function AssetDropdown({
  open,
  assets,
  selected,
  onSelect,
  onClose,
}: {
  open: boolean;
  assets: Asset[];
  selected: Asset;
  onSelect: (a: Asset) => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState('');
  const filtered = assets.filter(
    a =>
      a.symbol.toLowerCase().includes(q.toLowerCase()) ||
      a.name.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(6px)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'flex-end',
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              background: 'var(--card)',
              borderRadius: '24px 24px 0 0',
              padding: '20px 16px 28px',
              border: '1px solid var(--border)',
              maxHeight: '78%',
              overflowY: 'auto',
            }}
          >
            <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--border)', margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 16, marginBottom: 12 }}>
              Select asset to receive
            </p>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 14px',
                borderRadius: 12,
                background: 'var(--muted)',
                border: '1px solid var(--border)',
                marginBottom: 12,
              }}
            >
              <Search size={16} style={{ color: 'var(--muted-foreground)' }} />
              <input
                placeholder="Search asset..."
                value={q}
                onChange={e => setQ(e.target.value)}
                autoFocus
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--foreground)',
                  fontSize: 14,
                }}
              />
            </div>
            {filtered.map(a => (
              <motion.button
                key={a.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onSelect(a);
                  onClose();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  width: '100%',
                  padding: '12px 10px',
                  borderRadius: 14,
                  background: selected.id === a.id ? 'var(--muted)' : 'transparent',
                  border: '1px solid transparent',
                  marginBottom: 2,
                }}
              >
                <AssetIcon symbol={a.symbol} size={38} />
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>{a.symbol}</p>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{a.name}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13 }}>
                    ${a.price < 1 ? a.price.toFixed(4) : a.price.toLocaleString('en', { maximumFractionDigits: 2 })}
                  </p>
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: a.change24h >= 0 ? 'var(--positive)' : 'var(--destructive)',
                    }}
                  >
                    {a.change24h >= 0 ? '+' : ''}
                    {a.change24h.toFixed(2)}%
                  </p>
                </div>
                {selected.id === a.id && <Check size={18} style={{ color: 'var(--foreground)' }} />}
              </motion.button>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                      */
/* ------------------------------------------------------------------ */

export function ReceiveScreen({ goBack }: ReceiveScreenProps) {
  const { format } = useCurrency();
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [asset, setAsset] = useState<Asset>(cryptoAssets.find(a => a.id === 'usdt')!);
  const [network, setNetwork] = useState<string>(asset.chains[0]);
  const [networkOpen, setNetworkOpen] = useState(false);
  const [assetOpen, setAssetOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [requestEnabled, setRequestEnabled] = useState(false);
  const [requestAmount, setRequestAmount] = useState('');

  const address = useMemo(() => generateAddress(asset, network), [asset, network]);
  const netInfo = NETWORKS[network];

  const handleAssetChange = useCallback((a: Asset) => {
    setAsset(a);
    setNetwork(a.chains[0]);
  }, []);

  const handleCopy = useCallback(() => {
    try {
      navigator.clipboard?.writeText(address);
    } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [address]);

  const handleShare = useCallback(() => {
    setShared(true);
    try {
      navigator.share?.({ title: `Convia ${asset.symbol} address`, text: address });
    } catch {}
    setTimeout(() => setShared(false), 2000);
  }, [address, asset.symbol]);

  const amountNum = parseFloat(requestAmount) || 0;
  const usdValue = amountNum * asset.price;

  // Token selection screen
  if (!selectedAsset) {
    return (
      <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--background)' }}>
        <div style={{ height: 50 }} />
        <div className="flex items-center gap-3 px-5 mb-6">
          <motion.button whileTap={{ scale: 0.9 }} onClick={goBack} aria-label="Go back" className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <ChevronLeft size={20} style={{ color: 'var(--foreground)' }} />
          </motion.button>
          <div>
            <h2 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 22, lineHeight: 1.1 }}>Receive</h2>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginTop: 2 }}>Select a token to receive</p>
          </div>
        </div>
        <div className="px-5 pb-5">
          {cryptoAssets.map((a, i) => (
            <motion.button
              key={a.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { setAsset(a); setNetwork(a.chains[0]); setSelectedAsset(a); }}
              className="flex items-center gap-3 p-4 rounded-[16px] mb-3 w-full text-left"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <AssetIcon symbol={a.symbol} size={40} />
              <div className="flex-1">
                <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>{a.symbol}</p>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{a.name}</p>
              </div>
              <div className="text-right">
                <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{a.chains.length} networks</p>
              </div>
              <ChevronRight size={16} style={{ color: 'var(--muted-foreground)' }} />
            </motion.button>
          ))}
        </div>
        <div style={{ height: 60 }} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />

      {/* Header */}
      <div className="flex items-center gap-3 px-5 mb-5">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setSelectedAsset(null)}
          aria-label="Go back"
          className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
        >
          <ChevronLeft size={20} style={{ color: 'var(--foreground)' }} />
        </motion.button>
        <div>
          <h2 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 20, lineHeight: 1.1 }}>Receive {asset.symbol}</h2>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Get paid in crypto from anyone</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        {/* Asset selector */}
        <motion.button
          whileTap={{ scale: 0.99 }}
          onClick={() => setAssetOpen(true)}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-[18px] mb-3"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <AssetIcon symbol={asset.symbol} size={44} />
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>{asset.symbol}</p>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: asset.change24h >= 0 ? 'var(--positive)' : 'var(--destructive)',
                  background: asset.change24h >= 0 ? 'var(--muted)' : 'var(--muted)',
                  padding: '1px 6px',
                  borderRadius: 6,
                }}
              >
                {asset.change24h >= 0 ? '+' : ''}
                {asset.change24h.toFixed(2)}%
              </span>
            </div>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
              {asset.name} · ${asset.price < 1 ? asset.price.toFixed(4) : asset.price.toLocaleString('en', { maximumFractionDigits: 2 })}
            </p>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '6px 10px',
              borderRadius: 10,
              background: 'var(--muted)',
            }}
          >
            <span style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}>Change</span>
            <ChevronDown size={14} style={{ color: 'var(--muted-foreground)' }} />
          </div>
        </motion.button>

        {/* Change token link */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setSelectedAsset(null)}
          className="flex items-center gap-2 mb-4"
        >
          <ChevronLeft size={16} style={{ color: 'var(--muted-foreground)' }} />
          <span style={{ color: 'var(--muted-foreground)', fontSize: 13, fontWeight: 500 }}>Change token</span>
        </motion.button>

        {/* Network selector */}
        <motion.button
          whileTap={{ scale: 0.99 }}
          onClick={() => setNetworkOpen(true)}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-[18px] mb-5"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: netInfo.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: network === 'BSC' || network === 'BASE' ? '#000' : '#FFF',
              fontWeight: 800,
              fontSize: 12,
              flexShrink: 0,
            }}
          >
            {netInfo.label.slice(0, 3)}
          </div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>{netInfo.name}</p>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
              {netInfo.label} · ~{netInfo.estTime}
            </p>
          </div>
          <ChevronDown size={16} style={{ color: 'var(--muted-foreground)' }} />
        </motion.button>

        {/* QR code card */}
        <div
          className="rounded-[22px] p-5 mb-5 flex flex-col items-center"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
            <QrCode size={15} style={{ color: 'var(--foreground)' }} />
            <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 13 }}>
              {requestEnabled && amountNum > 0
                ? `Request ${amountNum} ${asset.symbol}`
                : `Receive ${asset.symbol}`}
            </p>
          </div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 22 }}
            style={{
              padding: 16,
              background: '#FFFFFF',
              borderRadius: 18,
              boxShadow: '0 8px 28px rgba(0,0,0,0.18)',
              position: 'relative',
            }}
          >
            <QRCodeDisplay value={encodeQRPayload({ address, asset: asset.symbol, chain: network, amount: requestEnabled && amountNum > 0 ? requestAmount : undefined })} size={200} />
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 42,
                height: 42,
                borderRadius: 12,
                background: 'var(--foreground)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '3px solid #FFFFFF',
                boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
              }}
            >
              <span style={{ color: '#FFF', fontWeight: 800, fontSize: 17 }}>C</span>
            </div>
          </motion.div>

          <p style={{ color: 'var(--muted-foreground)', fontSize: 11, marginTop: 12, textAlign: 'center' }}>
            {netInfo.name} network · {netInfo.label}
          </p>
        </div>

        {/* Request specific amount toggle */}
        <motion.div
          className="rounded-[18px] mb-4 overflow-hidden"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <button
            onClick={() => setRequestEnabled(v => !v)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '14px 16px',
              background: 'transparent',
              border: 'none',
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: requestEnabled ? 'var(--muted)' : 'var(--muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s',
              }}
            >
              <Wallet size={18} style={{ color: requestEnabled ? 'var(--primary)' : 'var(--muted-foreground)' }} />
            </div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>Request specific amount</p>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
                {requestEnabled ? 'Amount included in QR code' : 'Generate QR with a set amount'}
              </p>
            </div>
            {/* Toggle */}
            <div
              style={{
                width: 44,
                height: 26,
                borderRadius: 13,
                background: requestEnabled ? 'var(--primary)' : 'var(--muted)',
                border: requestEnabled ? 'none' : '1px solid var(--border)',
                position: 'relative',
                transition: 'background 0.2s',
                flexShrink: 0,
              }}
            >
              <motion.div
                animate={{ x: requestEnabled ? 18 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                style={{
                  position: 'absolute',
                  top: 2,
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: '#FFFFFF',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }}
              />
            </div>
          </button>

          <AnimatePresence>
            {requestEnabled && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ padding: '0 16px 16px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '12px 14px',
                      borderRadius: 14,
                      background: 'var(--muted)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <input
                      type="number"
                      inputMode="decimal"
                      placeholder="0.00"
                      value={requestAmount}
                      onChange={e => setRequestAmount(e.target.value)}
                      autoFocus
                      style={{
                        flex: 1,
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        color: 'var(--foreground)',
                        fontSize: 18,
                        fontWeight: 700,
                        fontFamily: 'ui-monospace, monospace',
                      }}
                    />
                    <span style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>{asset.symbol}</span>
                  </div>
                  {amountNum > 0 && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{ color: 'var(--muted-foreground)', fontSize: 12, marginTop: 8, textAlign: 'right' }}
                    >
                      ≈ {format(usdValue)}
                    </motion.p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Address card */}
        <div
          className="rounded-[18px] p-4 mb-4"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {asset.symbol} Address
            </p>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleCopy}
              style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'transparent', border: 'none' }}
            >
              {copied ? (
                <CheckCircle2 size={14} style={{ color: 'var(--positive)' }} />
              ) : (
                <Copy size={14} style={{ color: 'var(--muted-foreground)' }} />
              )}
            </motion.button>
          </div>
          <p
            style={{
              color: 'var(--foreground)',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontSize: 13,
              wordBreak: 'break-all',
              lineHeight: 1.5,
              letterSpacing: -0.2,
            }}
          >
            {address}
          </p>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 5 }}>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[16px]"
            style={{
              background: copied ? 'var(--muted)' : 'var(--primary)',
              color: copied ? 'var(--positive)' : '#FFF',
              fontWeight: 700,
              fontSize: 14,
              border: copied ? '1px solid var(--positive)' : 'none',
            }}
          >
            {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
            {copied ? 'Copied!' : 'Copy Address'}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleShare}
            className="w-14 flex items-center justify-center rounded-[16px]"
            style={{
              background: shared ? 'var(--muted)' : 'var(--muted)',
              border: shared ? '1px solid var(--primary)' : '1px solid var(--border)',
            }}
          >
            {shared ? <Check size={18} style={{ color: 'var(--foreground)' }} /> : <Share2 size={18} style={{ color: 'var(--foreground)' }} />}
          </motion.button>
        </div>

        {/* Warning banner */}
        <div
          className="rounded-[14px] p-3.5 mb-4"
          style={{ background: 'var(--muted)', border: '1px solid var(--muted)' }}
        >
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <AlertTriangle size={18} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: 1 }} />
            <p style={{ color: 'var(--warning)', fontSize: 12, lineHeight: 1.5, fontWeight: 500 }}>
              Only send <strong>{asset.symbol}</strong> ({netInfo.label}) to this address. Sending other assets or using a different network may result in <strong>permanent loss</strong>.
            </p>
          </div>
        </div>

        {/* Info row */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="rounded-[14px] p-3.5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <Clock size={13} style={{ color: 'var(--muted-foreground)' }} />
              <p style={{ color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600 }}>Est. Arrival</p>
            </div>
            <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>{netInfo.estTime}</p>
          </div>
          <div className="rounded-[14px] p-3.5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <Info size={13} style={{ color: 'var(--muted-foreground)' }} />
              <p style={{ color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600 }}>Network</p>
            </div>
            <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>{netInfo.label}</p>
          </div>
        </div>

        <p style={{ color: 'var(--muted-foreground)', fontSize: 10, textAlign: 'center', lineHeight: 1.5 }}>
          Convia wallet addresses are unique per asset and network. Need help?{' '}
          <span style={{ color: 'var(--foreground)', fontWeight: 600 }}>Contact support</span>
        </p>
      </div>

      {/* Network dropdown */}
      <AnimatePresence>
        {networkOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(6px)',
              zIndex: 50,
              display: 'flex',
              alignItems: 'flex-end',
            }}
            onClick={() => setNetworkOpen(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              onClick={e => e.stopPropagation()}
              style={{
                width: '100%',
                background: 'var(--card)',
                borderRadius: '24px 24px 0 0',
                padding: '20px 16px 28px',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--border)', margin: '0 auto 16px' }} />
              <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 16, marginBottom: 12 }}>Select network</p>
              {asset.chains.map(n => {
                const info = NETWORKS[n];
                const active = network === n;
                return (
                  <motion.button
                    key={n}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setNetwork(n);
                      setNetworkOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      width: '100%',
                      padding: '14px 12px',
                      borderRadius: 14,
                      background: active ? 'var(--muted)' : 'transparent',
                      border: '1px solid transparent',
                      marginBottom: 4,
                    }}
                  >
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 10,
                        background: info.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: n === 'BSC' || n === 'BASE' ? '#000' : '#FFF',
                        fontWeight: 800,
                        fontSize: 13,
                        flexShrink: 0,
                      }}
                    >
                      {info.label.slice(0, 3)}
                    </div>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>{info.name}</p>
                      <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
                        {info.label} · ~{info.estTime}
                      </p>
                    </div>
                    {active && <Check size={18} style={{ color: 'var(--foreground)' }} />}
                  </motion.button>
                );
              })}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Asset dropdown */}
      <AssetDropdown
        open={assetOpen}
        assets={cryptoAssets}
        selected={asset}
        onSelect={handleAssetChange}
        onClose={() => setAssetOpen(false)}
      />
    </div>
  );
}
