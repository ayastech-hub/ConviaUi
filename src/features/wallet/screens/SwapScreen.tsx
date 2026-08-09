import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ArrowDownUp,
  ChevronDown,
  Info,
  Check,
  RefreshCw,
  Settings2,
  Zap,
  CheckCircle2,
  Loader,
  X,
  Shield,
  AlertTriangle,
  Route,
  ArrowRight,
  FileText,
} from 'lucide-react';
import { cryptoAssets, type Asset, type Transaction } from '../../../shared/data/mockData';
import { AssetIcon } from '../../../shared/components/AssetIcon';
import { useCurrency } from '../../../shared/context/CurrencyContext';
import { AssetPicker } from '../../../shared/components/AssetPicker';
import { TransactionReceipt } from '../../../shared/components/TransactionReceipt';

interface SwapScreenProps {
  /** When omitted, Swap is shown as a root bottom-nav tab (no back button). */
  goBack?: () => void;
}

type SwapPhase = 'idle' | 'review' | 'swapping' | 'success';
type ImpactLevel = 'low' | 'medium' | 'high';

const STABLE_SYMBOLS = new Set(['USDT', 'USDC', 'DAI', 'BUSD']);

function decimalsFor(symbol: string, max = 6): number {
  return STABLE_SYMBOLS.has(symbol) ? Math.min(2, max) : max;
}

function formatRate(n: number): string {
  if (n >= 1000) return n.toLocaleString('en', { maximumFractionDigits: 0 });
  if (n >= 1) return n.toLocaleString('en', { maximumFractionDigits: 2 });
  if (n >= 0.01) return n.toFixed(4);
  return n.toFixed(6);
}

function formatAmount(n: number, symbol: string): string {
  const d = decimalsFor(symbol);
  return n.toLocaleString('en', { minimumFractionDigits: 0, maximumFractionDigits: d });
}

const PRESET_SLIPPAGE = ['0.5%', '1.0%', '3.0%'];

export function SwapScreen({ goBack }: SwapScreenProps) {
  const { format, currency } = useCurrency();

  const [fromAsset, setFromAsset] = useState<Asset>(
    cryptoAssets.find(a => a.id === 'eth') ?? cryptoAssets[0],
  );
  const [toAsset, setToAsset] = useState<Asset>(
    cryptoAssets.find(a => a.id === 'usdt') ?? cryptoAssets[1],
  );
  const [fromAmount, setFromAmount] = useState<string>('');
  const [slippage, setSlippage] = useState<string>('0.5%');
  const [customSlippage, setCustomSlippage] = useState<string>('');
  const [showSlippage, setShowSlippage] = useState(false);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [error, setError] = useState('');
  const [phase, setPhase] = useState<SwapPhase>('idle');
  const [rateRefreshing, setRateRefreshing] = useState(false);
  const [ratePulse, setRatePulse] = useState(0);
  const [receiptTx, setReceiptTx] = useState<Transaction | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  const effectiveSlippage = useMemo(() => {
    if (customSlippage) return `${customSlippage}%`;
    return slippage;
  }, [customSlippage, slippage]);

  const slippageNum = useMemo(() => {
    const n = parseFloat(effectiveSlippage);
    return Number.isFinite(n) ? n / 100 : 0.005;
  }, [effectiveSlippage]);

  const fromNum = useMemo(() => {
    const n = Number(fromAmount);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [fromAmount]);

  const rate = useMemo(() => {
    if (toAsset.price === 0) return 0;
    return fromAsset.price / toAsset.price;
  }, [fromAsset, toAsset]);

  const toAmount = useMemo(() => {
    if (fromNum <= 0) return 0;
    return (fromNum * fromAsset.price) / toAsset.price;
  }, [fromNum, fromAsset, toAsset]);

  const toAmountStr = useMemo(() => {
    if (toAmount <= 0) return '';
    return toAmount.toFixed(decimalsFor(toAsset.symbol));
  }, [toAmount, toAsset.symbol]);

  const priceImpactPct = useMemo(() => {
    if (fromNum <= 0) return 0;
    // Simulated impact scaling with USD value of the swap
    const usdValue = fromNum * fromAsset.price;
    return Math.min((usdValue / 50000) * 3 + 0.05, 3);
  }, [fromNum, fromAsset]);

  const impactLevel: ImpactLevel = useMemo(() => {
    if (priceImpactPct < 0.5) return 'low';
    if (priceImpactPct < 1.5) return 'medium';
    return 'high';
  }, [priceImpactPct]);

  const minReceived = useMemo(() => {
    if (toAmount <= 0) return 0;
    return toAmount * (1 - slippageNum);
  }, [toAmount, slippageNum]);

  const networkFeeUSD = useMemo(() => {
    if (fromNum <= 0) return 0;
    const baseFee = fromAsset.chains.includes('Solana') ? 0.0005 : 0.001;
    return fromNum * fromAsset.price * baseFee;
  }, [fromNum, fromAsset]);

  const route = useMemo(() => {
    if (fromAsset.id === toAsset.id) return [fromAsset.symbol];
    // Stablecoin intermediation for non-stable pairs
    const fromStable = STABLE_SYMBOLS.has(fromAsset.symbol);
    const toStable = STABLE_SYMBOLS.has(toAsset.symbol);
    if (fromStable && toStable) return [fromAsset.symbol, toAsset.symbol];
    if (fromStable) return [fromAsset.symbol, toAsset.symbol];
    if (toStable) return [fromAsset.symbol, toAsset.symbol];
    return [fromAsset.symbol, 'USDT', toAsset.symbol];
  }, [fromAsset, toAsset]);

  const fromUSD = useMemo(() => fromNum * fromAsset.price, [fromNum, fromAsset]);
  const toUSD = useMemo(() => toAmount * toAsset.price, [toAmount, toAsset]);

  const sameAsset = fromAsset.id === toAsset.id;
  const insufficientBalance = fromNum > fromAsset.balance;
  const hasInput = fromNum > 0;

  const canSwap = hasInput && !sameAsset && !insufficientBalance && !error;

  const handleFromAmount = useCallback(
    (val: string) => {
      // Allow only numeric + dot
      const cleaned = val.replace(/[^0-9.]/g, '');
      setFromAmount(cleaned);
      const n = Number(cleaned);
      if (cleaned && (!Number.isFinite(n) || n < 0)) {
        setError('Enter a valid amount');
        return;
      }
      if (sameAsset) {
        setError('Cannot swap to the same asset');
        return;
      }
      if (n > fromAsset.balance) {
        setError(`Insufficient balance. Max ${formatAmount(fromAsset.balance, fromAsset.symbol)} ${fromAsset.symbol}`);
        return;
      }
      setError('');
    },
    [fromAsset, sameAsset],
  );

  const setPercentage = useCallback(
    (pct: number) => {
      const amount = (fromAsset.balance * pct).toFixed(decimalsFor(fromAsset.symbol, 8));
      // Trim trailing zeros
      const trimmed = String(parseFloat(amount));
      handleFromAmount(trimmed);
    },
    [fromAsset, handleFromAmount],
  );

  const flipAssets = useCallback(() => {
    setFromAsset(toAsset);
    setToAsset(fromAsset);
    setFromAmount('');
    setError('');
    setRatePulse(p => p + 1);
  }, [fromAsset, toAsset]);

  const selectFromAsset = useCallback(
    (a: Asset) => {
      setFromAsset(a);
      setFromAmount('');
      if (a.id === toAsset.id) {
        setError('Cannot swap to the same asset');
      } else {
        setError('');
      }
    },
    [toAsset],
  );

  const selectToAsset = useCallback(
    (a: Asset) => {
      setToAsset(a);
      if (a.id === fromAsset.id) {
        setError('Cannot swap to the same asset');
      } else {
        setError('');
      }
    },
    [fromAsset],
  );

  const refreshRate = useCallback(() => {
    setRateRefreshing(true);
    setRatePulse(p => p + 1);
    setTimeout(() => setRateRefreshing(false), 700);
  }, []);

  const openReview = useCallback(() => {
    if (!canSwap) return;
    setPhase('review');
  }, [canSwap]);

  const confirmSwap = useCallback(() => {
    setPhase('swapping');
    setTimeout(() => {
      const hash = '0x' + Array.from({ length: 64 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');
      setReceiptTx({
        id: 'swap-' + Date.now(),
        type: 'swap',
        asset: fromAsset.symbol,
        assetTo: toAsset.symbol,
        amount: fromNum,
        amountTo: toAmount,
        valueUSD: fromUSD,
        status: 'confirmed',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        hash,
      });
      setPhase('success');
    }, 2200);
  }, [fromAsset, toAsset, fromNum, toAmount, fromUSD]);

  const resetSwap = useCallback(() => {
    setPhase('idle');
    setFromAmount('');
    setError('');
    setRatePulse(p => p + 1);
    setReceiptTx(null);
    setShowReceipt(false);
  }, []);

  const setSlippagePreset = useCallback((v: string) => {
    setSlippage(v);
    setCustomSlippage('');
  }, []);

  const setCustomSlippageValue = useCallback((v: string) => {
    const cleaned = v.replace(/[^0-9.]/g, '');
    setCustomSlippage(cleaned);
  }, []);

  // ---------- Success state ----------
  if (phase === 'success') {
    return (
      <div className="flex flex-col h-full items-center justify-center px-5" style={{ background: 'var(--background)' }}>
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 18, stiffness: 220 }}
          className="w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', damping: 12, stiffness: 200 }}
            className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center relative"
            style={{ background: 'var(--muted)' }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', damping: 14, stiffness: 180 }}
            >
              <Check size={52} style={{ color: 'var(--positive)' }} />
            </motion.div>
            <motion.div
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 1.8, opacity: 0 }}
              transition={{ duration: 1.2, repeat: Infinity, delay: 0.3 }}
              className="absolute inset-0 rounded-full"
              style={{ border: '2px solid var(--positive)' }}
            />
          </motion.div>

          <h2 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 22, marginBottom: 6 }}>
            Swap Complete
          </h2>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 14, marginBottom: 24 }}>
            Your swap has settled instantly
          </p>

          <div className="rounded-[20px] p-4 mb-8 text-left" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between py-2.5">
              <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>You paid</span>
              <span style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>
                {formatAmount(fromNum, fromAsset.symbol)} {fromAsset.symbol}
              </span>
            </div>
            <div className="flex items-center justify-center my-1">
              <ArrowRight size={14} style={{ color: 'var(--muted-foreground)' }} />
            </div>
            <div className="flex items-center justify-between py-2.5" style={{ borderTop: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>You received</span>
              <span style={{ color: 'var(--positive)', fontWeight: 700, fontSize: 15 }}>
                {formatAmount(toAmount, toAsset.symbol)} {toAsset.symbol}
              </span>
            </div>
            <div className="flex items-center justify-between py-2.5 mt-1" style={{ borderTop: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Rate</span>
              <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 500 }}>
                1 {fromAsset.symbol} = {formatRate(rate)} {toAsset.symbol}
              </span>
            </div>
            <div className="flex items-center justify-between py-2.5" style={{ borderTop: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Network fee</span>
              <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 500 }}>
                {format(networkFeeUSD)}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowReceipt(true)}
              className="flex-1 py-3.5 rounded-[16px] flex items-center justify-center gap-2"
              style={{ background: 'var(--muted)', color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}
            >
              <FileText size={16} />
              View Receipt
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={resetSwap}
              className="flex-1 py-3.5 rounded-[16px] flex items-center justify-center gap-2"
              style={{ background: 'var(--muted)', color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}
            >
              <RefreshCw size={16} />
              Swap Again
            </motion.button>
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => (goBack ? goBack() : resetSwap())}
            className="w-full py-3.5 rounded-[16px] text-white flex items-center justify-center gap-2 mt-3"
            style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 15, boxShadow: 'none' }}
          >
            <Check size={16} />
            Done
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // ---------- Main swap UI ----------
  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />

      {/* Header */}
      <div className="flex items-center gap-3 px-5 mb-5" style={{ paddingTop: goBack ? 0 : 12 }}>
        {goBack ? (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={goBack}
            aria-label="Go back"
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: 'var(--muted)' }}
          >
            <ChevronLeft size={20} style={{ color: 'var(--foreground)' }} />
          </motion.button>
        ) : null}
        <h2 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 20 }}>Swap</h2>
        <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1.5 rounded-full" style={{ background: 'var(--muted)' }}>
          <Zap size={12} style={{ color: 'var(--foreground)' }} />
          <span style={{ color: 'var(--foreground)', fontSize: 11, fontWeight: 700 }}>Best Rate</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        {/* ===== FROM card ===== */}
        <div className="relative">
          <div className="rounded-[20px] p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="flex justify-between items-center mb-3">
              <span style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}>You pay</span>
              <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
                Balance {formatAmount(fromAsset.balance, fromAsset.symbol)} {fromAsset.symbol}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFromPicker(true)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-[14px] flex-shrink-0"
                style={{ background: 'var(--muted)' }}
              >
                <AssetIcon symbol={fromAsset.symbol} size={24} />
                <span style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>{fromAsset.symbol}</span>
                <ChevronDown size={14} style={{ color: 'var(--muted-foreground)' }} />
              </motion.button>
              <input
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                value={fromAmount}
                onChange={e => handleFromAmount(e.target.value)}
                className="flex-1 bg-transparent outline-none text-right"
                style={{ color: 'var(--foreground)', fontSize: 26, fontWeight: 700, minWidth: 0 }}
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex gap-1.5">
                {[
                  { label: '25%', v: 0.25 },
                  { label: '50%', v: 0.5 },
                  { label: 'Max', v: 1 },
                ].map(p => (
                  <motion.button
                    key={p.label}
                    whileTap={{ scale: 0.93 }}
                    onClick={() => setPercentage(p.v)}
                    className="px-2.5 py-1 rounded-lg"
                    style={{ background: 'var(--muted)', color: 'var(--foreground)', fontSize: 11, fontWeight: 700 }}
                  >
                    {p.label}
                  </motion.button>
                ))}
              </div>
              {fromUSD > 0 && (
                <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
                  ≈ {format(fromUSD)}
                </p>
              )}
            </div>
          </div>

          {/* ===== Direction button ===== */}
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-5 z-10">
            <motion.button
              whileTap={{ scale: 0.85, rotate: 180 }}
              onClick={flipAssets}
              aria-label="Flip swap direction"
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: 'var(--secondary)',
                border: '3px solid var(--background)',
                boxShadow: '0 4px 14px var(--muted)',
              }}
            >
              <ArrowDownUp size={16} className="text-white" />
            </motion.button>
          </div>
        </div>

        {/* ===== TO card ===== */}
        <div className="rounded-[20px] p-4 mb-4 mt-3" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="flex justify-between items-center mb-3">
            <span style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}>You receive</span>
            <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
              Balance {formatAmount(toAsset.balance, toAsset.symbol)} {toAsset.symbol}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowToPicker(true)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-[14px] flex-shrink-0"
              style={{ background: 'var(--muted)' }}
            >
              <AssetIcon symbol={toAsset.symbol} size={24} />
              <span style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>{toAsset.symbol}</span>
              <ChevronDown size={14} style={{ color: 'var(--muted-foreground)' }} />
            </motion.button>
            <p
              className="flex-1 text-right truncate"
              style={{ color: toAmount > 0 ? 'var(--foreground)' : 'var(--muted-foreground)', fontSize: 26, fontWeight: 700 }}
            >
              {toAmount > 0 ? formatAmount(toAmount, toAsset.symbol) : '0.00'}
            </p>
          </div>
          <div className="flex justify-end mt-2">
            {toUSD > 0 && (
              <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
                ≈ {format(toUSD)}
              </p>
            )}
          </div>
        </div>

        {/* ===== Error ===== */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 12 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="overflow-hidden"
            >
              <div
                className="flex items-center gap-2 px-3 py-2.5 rounded-[12px]"
                style={{ background: 'var(--muted)', border: '1px solid var(--muted)' }}
              >
                <AlertTriangle size={14} style={{ color: 'var(--destructive)' }} />
                <p style={{ color: 'var(--destructive)', fontSize: 12, fontWeight: 500 }}>{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== Exchange rate + refresh ===== */}
        {hasInput && !error && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between px-1 mb-3"
          >
            <div className="flex items-center gap-2">
              <motion.span
                key={ratePulse}
                initial={{ opacity: 0.4 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}
              >
                1 {fromAsset.symbol} = {formatRate(rate)} {toAsset.symbol}
              </motion.span>
              <motion.button
                whileTap={{ scale: 0.85, rotate: 180 }}
                onClick={refreshRate}
                aria-label="Refresh rate"
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: 'var(--muted)' }}
              >
                <RefreshCw
                  size={11}
                  style={{ color: 'var(--muted-foreground)' }}
                  className={rateRefreshing ? 'animate-spin' : ''}
                />
              </motion.button>
            </div>
            <span style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>
              {rateRefreshing ? 'Updating…' : 'Updated just now'}
            </span>
          </motion.div>
        )}

        {/* ===== Price impact ===== */}
        {hasInput && !error && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between px-3 py-2.5 rounded-[12px] mb-3"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-2">
              <Info size={13} style={{ color: 'var(--muted-foreground)' }} />
              <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Price impact</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color:
                    impactLevel === 'low'
                      ? 'var(--positive)'
                      : impactLevel === 'medium'
                        ? 'var(--warning)'
                        : 'var(--destructive)',
                }}
              >
                {priceImpactPct.toFixed(2)}%
              </span>
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
                style={{
                  background:
                    impactLevel === 'low'
                      ? 'var(--muted)'
                      : impactLevel === 'medium'
                        ? 'var(--muted)'
                        : 'var(--muted)',
                  color:
                    impactLevel === 'low'
                      ? 'var(--positive)'
                      : impactLevel === 'medium'
                        ? 'var(--warning)'
                        : 'var(--destructive)',
                }}
              >
                {impactLevel === 'low' ? 'Low impact' : impactLevel === 'medium' ? 'Medium' : 'High'}
              </span>
            </div>
          </motion.div>
        )}

        {/* ===== Slippage tolerance ===== */}
        <motion.div
          className="rounded-[16px] mb-3 overflow-hidden"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <button
            onClick={() => setShowSlippage(s => !s)}
            className="w-full flex items-center justify-between px-3.5 py-3"
          >
            <div className="flex items-center gap-2">
              <Settings2 size={14} style={{ color: 'var(--muted-foreground)' }} />
              <span style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}>Slippage tolerance</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 700 }}>{effectiveSlippage}</span>
              <motion.div animate={{ rotate: showSlippage ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown size={14} style={{ color: 'var(--muted-foreground)' }} />
              </motion.div>
            </div>
          </button>
          <AnimatePresence initial={false}>
            {showSlippage && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="overflow-hidden"
              >
                <div className="px-3.5 pb-3.5 pt-1" style={{ borderTop: '1px solid var(--border)' }}>
                  <div className="flex gap-2 mt-3">
                    {PRESET_SLIPPAGE.map(v => {
                      const active = !customSlippage && slippage === v;
                      return (
                        <motion.button
                          key={v}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSlippagePreset(v)}
                          className="flex-1 py-2 rounded-[10px]"
                          style={{
                            background: active ? 'var(--primary)' : 'var(--muted)',
                            color: active ? '#FFF' : 'var(--foreground)',
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          {v}
                        </motion.button>
                      );
                    })}
                    <div
                      className="flex-1 flex items-center px-2.5 py-2 rounded-[10px]"
                      style={{
                        background: customSlippage ? 'var(--muted)' : 'var(--muted)',
                        border: customSlippage ? '1px solid var(--primary)' : '1px solid transparent',
                      }}
                    >
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder="Custom"
                        value={customSlippage}
                        onChange={e => setCustomSlippageValue(e.target.value)}
                        className="w-full bg-transparent outline-none text-center"
                        style={{ color: 'var(--foreground)', fontSize: 12, fontWeight: 700 }}
                      />
                      <span style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}>%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2.5">
                    <Shield size={11} style={{ color: 'var(--muted-foreground)' }} />
                    <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>
                      Your swap reverses if price moves more than {effectiveSlippage}.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ===== Route + min received + fee ===== */}
        {hasInput && !error && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-[16px] mb-4"
            style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
          >
            {/* Route */}
            <div className="flex justify-between items-center py-1.5">
              <div className="flex items-center gap-1.5">
                <Route size={13} style={{ color: 'var(--muted-foreground)' }} />
                <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Route</span>
              </div>
              <div className="flex items-center gap-1">
                {route.map((sym, i) => (
                  <React.Fragment key={`${sym}-${i}`}>
                    {i > 0 && <ArrowRight size={11} style={{ color: 'var(--muted-foreground)' }} />}
                    <span
                      style={{
                        color: i === 0 || i === route.length - 1 ? 'var(--foreground)' : 'var(--muted-foreground)',
                        fontSize: 12,
                        fontWeight: i === 0 || i === route.length - 1 ? 700 : 500,
                      }}
                    >
                      {sym}
                    </span>
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Min received */}
            <div className="flex justify-between items-center py-1.5" style={{ borderTop: '1px solid var(--border)' }}>
              <div className="flex items-center gap-1.5">
                <Info size={13} style={{ color: 'var(--muted-foreground)' }} />
                <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Minimum received</span>
              </div>
              <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}>
                {formatAmount(minReceived, toAsset.symbol)} {toAsset.symbol}
              </span>
            </div>

            {/* Network fee */}
            <div className="flex justify-between items-center py-1.5" style={{ borderTop: '1px solid var(--border)' }}>
              <div className="flex items-center gap-1.5">
                <Zap size={13} style={{ color: 'var(--muted-foreground)' }} />
                <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Network fee</span>
              </div>
              <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}>
                {format(networkFeeUSD)} · {fromAsset.chains[0]}
              </span>
            </div>
          </motion.div>
        )}

        {/* ===== Review Swap button ===== */}
        <motion.button
          whileTap={{ scale: canSwap ? 0.97 : 1 }}
          onClick={openReview}
          disabled={!canSwap}
          className="w-full py-4 rounded-[16px] text-white flex items-center justify-center gap-2"
          style={{
            background: canSwap
              ? 'var(--primary)'
              : 'var(--muted)',
            color: canSwap ? '#FFF' : 'var(--muted-foreground)',
            fontWeight: 700,
            fontSize: 15,
            boxShadow: canSwap ? 'none' : 'none',
          }}
        >
          {sameAsset
            ? 'Select different assets'
            : !hasInput
              ? 'Enter an amount'
              : insufficientBalance
                ? 'Insufficient balance'
                : 'Review Swap'}
        </motion.button>
      </div>

      {/* ===== Asset pickers ===== */}
      <AssetPicker
        open={showFromPicker}
        onClose={() => setShowFromPicker(false)}
        onSelect={selectFromAsset}
        excludeId={toAsset.id}
        title="Select token to pay"
      />
      <AssetPicker
        open={showToPicker}
        onClose={() => setShowToPicker(false)}
        onSelect={selectToAsset}
        excludeId={fromAsset.id}
        title="Select token to receive"
      />

      {/* ===== Review / Confirm modal ===== */}
      <AnimatePresence>
        {phase === 'review' && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPhase('idle')}
              className="absolute inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.55)' }}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="absolute bottom-0 left-0 right-0 z-50 rounded-t-[28px] overflow-hidden"
              style={{ background: 'var(--card)' }}
            >
              <div className="sticky top-0 px-5 pt-4 pb-3" style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }}>
                <div className="w-12 h-1 rounded-full mx-auto mb-4" style={{ background: 'var(--muted)' }} />
                <div className="flex items-center justify-between">
                  <h3 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 18 }}>Review Swap</h3>
                  <button
                    onClick={() => setPhase('idle')}
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--muted)' }}
                  >
                    <X size={18} style={{ color: 'var(--foreground)' }} />
                  </button>
                </div>
              </div>

              <div className="px-5 pb-6 overflow-y-auto" style={{ maxHeight: '60vh' }}>
                {/* Swap visual */}
                <div className="py-5">
                  <div className="flex items-center justify-between mb-3">
                    <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>You pay</span>
                    <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>≈ {format(fromUSD)}</span>
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <AssetIcon symbol={fromAsset.symbol} size={32} />
                    <div>
                      <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 18 }}>
                        {formatAmount(fromNum, fromAsset.symbol)} {fromAsset.symbol}
                      </p>
                      <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{fromAsset.name}</p>
                    </div>
                  </div>

                  <div className="flex justify-center -my-1">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center"
                      style={{ background: 'var(--muted)', border: '3px solid var(--card)' }}
                    >
                      <ArrowDownUp size={15} style={{ color: 'var(--foreground)' }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3 mt-1">
                    <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>You receive</span>
                    <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>≈ {format(toUSD)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <AssetIcon symbol={toAsset.symbol} size={32} />
                    <div>
                      <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 18 }}>
                        {formatAmount(toAmount, toAsset.symbol)} {toAsset.symbol}
                      </p>
                      <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{toAsset.name}</p>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="rounded-[16px] p-4 mb-5" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
                  <div className="flex justify-between py-1.5">
                    <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Exchange rate</span>
                    <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 500 }}>
                      1 {fromAsset.symbol} = {formatRate(rate)} {toAsset.symbol}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5" style={{ borderTop: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Price impact</span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color:
                          impactLevel === 'low'
                            ? 'var(--positive)'
                            : impactLevel === 'medium'
                              ? 'var(--warning)'
                              : 'var(--destructive)',
                      }}
                    >
                      {priceImpactPct.toFixed(2)}% · {impactLevel === 'low' ? 'Low' : impactLevel === 'medium' ? 'Medium' : 'High'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5" style={{ borderTop: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Slippage tolerance</span>
                    <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 500 }}>{effectiveSlippage}</span>
                  </div>
                  <div className="flex justify-between py-1.5" style={{ borderTop: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Minimum received</span>
                    <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 500 }}>
                      {formatAmount(minReceived, toAsset.symbol)} {toAsset.symbol}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5" style={{ borderTop: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Network fee</span>
                    <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 500 }}>
                      {format(networkFeeUSD)} · {fromAsset.chains[0]}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5" style={{ borderTop: '1px solid var(--border)' }}>
                    <div className="flex items-center gap-1.5">
                      <Route size={12} style={{ color: 'var(--muted-foreground)' }} />
                      <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Route</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {route.map((sym, i) => (
                        <React.Fragment key={`${sym}-r-${i}`}>
                          {i > 0 && <ArrowRight size={10} style={{ color: 'var(--muted-foreground)' }} />}
                          <span style={{ color: 'var(--foreground)', fontSize: 12, fontWeight: 500 }}>{sym}</span>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={confirmSwap}
                  className="w-full py-4 rounded-[16px] text-white flex items-center justify-center gap-2"
                  style={{
                    background: 'var(--primary)',
                    fontWeight: 700,
                    fontSize: 15,
                    boxShadow: 'none',
                  }}
                >
                  <Check size={18} />
                  Confirm Swap
                </motion.button>
                <p className="text-center mt-3" style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>
                  Output is estimated. You will receive at least {formatAmount(minReceived, toAsset.symbol)} {toAsset.symbol} or the transaction will revert.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ===== Swapping overlay ===== */}
      <AnimatePresence>
        {phase === 'swapping' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60] flex flex-col items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
              style={{ background: 'var(--muted)' }}
            >
              <ArrowDownUp size={28} style={{ color: 'var(--foreground)' }} />
            </motion.div>
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.4, repeat: Infinity }}
              style={{ color: '#FFF', fontSize: 15, fontWeight: 700 }}
            >
              Swapping {fromAsset.symbol} → {toAsset.symbol}
            </motion.p>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginTop: 6 }}>
              Finding the best route on {fromAsset.chains[0]}…
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <TransactionReceipt tx={receiptTx} open={showReceipt} onClose={() => setShowReceipt(false)} />
    </div>
  );
}
