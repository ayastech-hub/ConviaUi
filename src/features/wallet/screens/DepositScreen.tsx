import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronDown,
  Copy,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowDownLeft,
  QrCode,
  Search,
  Check,
  Zap,
  ShieldCheck,
  Info,
  ChevronRight,
} from 'lucide-react';
import { cryptoAssets, type Asset } from '../../../shared/data/mockData';
import { AssetIcon } from '../../../shared/components/AssetIcon';
import { useCurrency } from '../../../shared/context/CurrencyContext';
import { QRCodeDisplay } from '../../../shared/components/QRCodeDisplay';
import { encodeQRPayload } from '../../../shared/utils/qrPayload';

interface DepositScreenProps {
  goBack: () => void;
}

/* ------------------------------------------------------------------ */
/*  Network metadata                                                   */
/* ------------------------------------------------------------------ */

interface NetworkInfo {
  name: string;
  label: string;
  color: string;
  confirmations: number;
  estTime: string;
  minDeposit: number;
  explorer: string;
}

const NETWORKS: Record<string, NetworkInfo> = {
  Bitcoin: { name: 'Bitcoin', label: 'BTC', color: 'var(--muted-foreground)', confirmations: 3, estTime: '10–30 min', minDeposit: 0.0001, explorer: 'mempool.space' },
  Ethereum: { name: 'Ethereum', label: 'ERC-20', color: 'var(--muted-foreground)', confirmations: 12, estTime: '3–5 min', minDeposit: 0.005, explorer: 'etherscan.io' },
  BASE: { name: 'BASE', label: 'Base', color: 'var(--muted-foreground)', confirmations: 12, estTime: '2–4 min', minDeposit: 0.005, explorer: 'basescan.org' },
  BSC: { name: 'BNB Smart Chain', label: 'BEP-20', color: 'var(--muted-foreground)', confirmations: 15, estTime: '1–3 min', minDeposit: 0.01, explorer: 'bscscan.com' },
  Solana: { name: 'Solana', label: 'SPL', color: 'var(--muted-foreground)', confirmations: 1, estTime: '1–10 sec', minDeposit: 0.01, explorer: 'solscan.io' },
  Tron: { name: 'Tron', label: 'TRC-20', color: 'var(--muted-foreground)', confirmations: 19, estTime: '1–2 min', minDeposit: 1, explorer: 'tronscan.org' },
};

/* ------------------------------------------------------------------ */
/*  Deterministic address generator (mock)                             */
/* ------------------------------------------------------------------ */

function generateAddress(asset: Asset, network: string): string {
  const seed = asset.id + network;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h *  + seed.charCodeAt(i)) >>> 0;

  const charset =
    network === 'Bitcoin'
      ? 'qpzry9x8gf2tvdw0s3jn74li6eughk1mca'
      : network === 'Solana'
      ? '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
      : '0123456789abcdef';

  const len =
    network === 'Bitcoin' ? 42 : network === 'Solana' ? 44 : 40;
  let s = '';
  let x = h;
  for (let i = 0; i < len; i++) {
    x = (x * 1103515245 + 12345 + i * 7) & 0x7fffffff;
    s += charset[x % charset.length];
  }
  const prefix =
    network === 'Bitcoin' ? 'bc1q' : network === 'Solana' ? '' : '0x';
  return prefix + s;
}

/* ------------------------------------------------------------------ */
/*  Mock recent deposits                                                */
/* ------------------------------------------------------------------ */

interface DepositRecord {
  id: string;
  asset: string;
  network: string;
  amount: number;
  amountUSD: number;
  time: string;
  status: 'confirmed' | 'pending' | 'failed';
  confirmations: number;
  needed: number;
}

const MOCK_DEPOSITS: DepositRecord[] = [
  { id: 'd1', asset: 'USDT', network: 'Tron', amount: 500, amountUSD: 500, time: '2m ago', status: 'pending', confirmations: 7, needed: 19 },
  { id: 'd2', asset: 'ETH', network: 'Ethereum', amount: 0.42, amountUSD: 1379.36, time: '1h ago', status: 'confirmed', confirmations: 14, needed: 12 },
  { id: 'd3', asset: 'USDC', network: 'Solana', amount: 1200, amountUSD: 1200, time: '5h ago', status: 'confirmed', confirmations: 1, needed: 1 },
  { id: 'd4', asset: 'SOL', network: 'Solana', amount: 3.5, amountUSD: 624.58, time: '1d ago', status: 'confirmed', confirmations: 1, needed: 1 },
  { id: 'd5', asset: 'BTC', network: 'Bitcoin', amount: 0.008, amountUSD: 539.36, time: '2d ago', status: 'failed', confirmations: 1, needed: 3 },
];

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
              Select asset
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
/*  Network dropdown                                                    */
/* ------------------------------------------------------------------ */

function NetworkDropdown({
  open,
  networks,
  selected,
  onSelect,
  onClose,
}: {
  open: boolean;
  networks: string[];
  selected: string;
  onSelect: (n: string) => void;
  onClose: () => void;
}) {
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
            }}
          >
            <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--border)', margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 16, marginBottom: 12 }}>
              Select network
            </p>
            {networks.map(n => {
              const info = NETWORKS[n];
              const active = selected === n;
              return (
                <motion.button
                  key={n}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onSelect(n);
                    onClose();
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
            <div
              style={{
                marginTop: 10,
                padding: '10px 12px',
                borderRadius: 12,
                background: 'var(--muted)',
                border: '1px solid var(--muted)',
                display: 'flex',
                gap: 8,
                alignItems: 'flex-start',
              }}
            >
              <AlertTriangle size={14} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: 2 }} />
              <p style={{ color: 'var(--warning)', fontSize: 11, lineHeight: 1.45 }}>
                Make sure the sender uses the same network. Cross-network transfers will be lost.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/*  Status badge                                                        */
/* ------------------------------------------------------------------ */

function StatusBadge({ status }: { status: DepositRecord['status'] }) {
  const map = {
    confirmed: { bg: 'var(--muted)', color: 'var(--positive)', icon: CheckCircle2, label: 'Confirmed' },
    pending: { bg: 'var(--muted)', color: 'var(--warning)', icon: Clock, label: 'Pending' },
    failed: { bg: 'var(--muted)', color: 'var(--destructive)', icon: AlertTriangle, label: 'Failed' },
  }[status];
  const Icon = map.icon;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '3px 8px',
        borderRadius: 20,
        background: map.bg,
        color: map.color,
        fontSize: 10,
        fontWeight: 700,
      }}
    >
      <Icon size={11} />
      {map.label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                      */
/* ------------------------------------------------------------------ */

export function DepositScreen({ goBack }: DepositScreenProps) {
  const { format } = useCurrency();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [network, setNetwork] = useState<string>('');
  const [assetOpen, setAssetOpen] = useState(false);
  const [networkOpen, setNetworkOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const address = useMemo(() => asset ? generateAddress(asset, network || asset.chains[0]) : '', [asset, network]);
  const netInfo = NETWORKS[network];

  const handleAssetSelect = useCallback((a: Asset) => {
    setAsset(a);
    setNetwork(a.chains[0]);
  }, []);

  const handleCopy = useCallback(() => {
    if (!address) return;
    try {
      navigator.clipboard?.writeText(address);
    } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [address]);

  const handleShare = useCallback(() => {
    if (!address || !asset) return;
    setShared(true);
    try {
      navigator.share?.({ title: `Convia ${asset.symbol} address`, text: address });
    } catch {}
    setTimeout(() => setShared(false), 2000);
  }, [address, asset]);

  const shortAddr = address ? `${address.slice(0, 10)}...${address.slice(-8)}` : '';

  // Token selection screen
  if (!asset) {
    return (
      <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--background)' }}>
        <div style={{ height: 50 }} />
        <div className="flex items-center gap-3 px-5 mb-6">
          <motion.button whileTap={{ scale: 0.9 }} onClick={goBack} aria-label="Back" className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <ChevronLeft size={20} style={{ color: 'var(--foreground)' }} />
          </motion.button>
          <div>
            <h1 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 22, lineHeight: 1.1 }}>Deposit</h1>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginTop: 2 }}>Select a token to deposit</p>
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
              onClick={() => handleAssetSelect(a)}
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
          onClick={goBack}
          aria-label="Go back"
          className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
        >
          <ChevronLeft size={20} style={{ color: 'var(--foreground)' }} />
        </motion.button>
        <div>
          <h2 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 20, lineHeight: 1.1 }}>Deposit</h2>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Receive crypto into your Convia wallet</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        {/* Back to token selection */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setAsset(null)}
          className="flex items-center gap-2 mb-4"
        >
          <ChevronLeft size={16} style={{ color: 'var(--muted-foreground)' }} />
          <span style={{ color: 'var(--muted-foreground)', fontSize: 13, fontWeight: 500 }}>Change token</span>
        </motion.button>

        {/* Asset selector card */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', borderRadius: 10, background: 'var(--muted)' }}>
            <span style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}>Change</span>
            <ChevronDown size={14} style={{ color: 'var(--muted-foreground)' }} />
          </div>
        </motion.button>

        {/* Network selector card */}
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
              {netInfo.label} · {asset.chains.length} network{asset.chains.length > 1 ? 's' : ''} available
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
              Scan to deposit {asset.symbol}
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
            <QRCodeDisplay value={encodeQRPayload({ address, asset: asset.symbol, chain: network })} size={196} />
            {/* center logo overlay */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 40,
                height: 40,
                borderRadius: 12,
                background: 'var(--foreground)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '3px solid #FFFFFF',
                boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
              }}
            >
              <span style={{ color: '#FFF', fontWeight: 800, fontSize: 16 }}>C</span>
            </div>
          </motion.div>

          <p style={{ color: 'var(--muted-foreground)', fontSize: 11, marginTop: 12, textAlign: 'center' }}>
            {netInfo.name} network · {netInfo.label}
          </p>
        </div>

        {/* Address card */}
        <div
          className="rounded-[18px] p-4 mb-4"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Deposit Address
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
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[16px]"
            style={{
              background: shared ? 'var(--muted)' : 'var(--muted)',
              color: shared ? 'var(--primary)' : 'var(--foreground)',
              fontWeight: 700,
              fontSize: 14,
              border: shared ? '1px solid var(--primary)' : '1px solid var(--border)',
            }}
          >
            {shared ? <Check size={18} /> : <Share2 size={18} />}
            {shared ? 'Shared!' : 'Share Address'}
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
              Only send <strong>{asset.symbol}</strong> ({netInfo.label}) to this address. Sending any other asset or using a different network may result in <strong>permanent loss</strong> of your funds.
            </p>
          </div>
        </div>

        {/* Deposit details: min + est time */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="rounded-[14px] p-3.5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <Info size={13} style={{ color: 'var(--muted-foreground)' }} />
              <p style={{ color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600 }}>Min Deposit</p>
            </div>
            <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15, fontFamily: 'ui-monospace, monospace' }}>
              {netInfo.minDeposit} {asset.symbol}
            </p>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 11, marginTop: 2 }}>
              ≈ {format(netInfo.minDeposit * asset.price)}
            </p>
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

        {/* Security note */}
        <div
          className="rounded-[14px] p-3 mb-5 flex items-center gap-3"
          style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
        >
          <ShieldCheck size={18} style={{ color: 'var(--foreground)', flexShrink: 0 }} />
          <p style={{ color: 'var(--foreground)', fontSize: 11, lineHeight: 1.45, opacity: 0.85 }}>
            Convia generates a unique address for every deposit. Your funds are protected by multi-signature cold storage.
          </p>
        </div>

        {/* Recent deposits */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <ArrowDownLeft size={16} style={{ color: 'var(--foreground)' }} />
            <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>Recent Deposits</p>
          </div>
          <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{MOCK_DEPOSITS.length} total</span>
        </div>

        <div className="rounded-[18px] overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          {MOCK_DEPOSITS.map((d, i) => {
            const a = cryptoAssets.find(x => x.symbol === d.asset);
            return (
              <div
                key={d.id}
                className="flex items-center gap-3 px-4 py-3"
                style={{ borderBottom: i < MOCK_DEPOSITS.length - 1 ? '1px solid var(--border)' : 'none' }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    background: a ? a.bgColor : 'var(--muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <AssetIcon symbol={d.asset} size={22} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 13 }}>
                      +{d.amount} {d.asset}
                    </p>
                    <StatusBadge status={d.status} />
                  </div>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 11, marginTop: 1 }}>
                    {NETWORKS[d.network]?.name ?? d.network} · {d.time}
                    {d.status === 'pending' && ` · ${d.confirmations}/${d.needed} confs`}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 12 }}>
                    {format(d.amountUSD)}
                  </p>
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
      </div>

      {/* Dropdowns */}
      <AssetDropdown
        open={assetOpen}
        assets={cryptoAssets}
        selected={asset}
        onSelect={handleAssetSelect}
        onClose={() => setAssetOpen(false)}
      />
      <NetworkDropdown
        open={networkOpen}
        networks={asset.chains}
        selected={network}
        onSelect={setNetwork}
        onClose={() => setNetworkOpen(false)}
      />
    </div>
  );
}
