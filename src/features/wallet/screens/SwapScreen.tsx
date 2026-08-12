import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Zap, AlertTriangle } from 'lucide-react';
import { type Asset, type Transaction } from '../../../shared/data/mockData';
import { AssetPicker } from '../../../shared/components/AssetPicker';
import { useCurrency } from '../../../shared/context/CurrencyContext';
import { STABLE_SYMBOLS, decimalsFor } from '../components/swap/utils';
import { SwapAssetCard } from '../components/swap/SwapAssetCard';
import { SwapDirectionButton } from '../components/swap/SwapDirectionButton';
import { SwapRateRow, PriceImpactRow } from '../components/swap/SwapRateRow';
import { SlippageSelector } from '../components/swap/SlippageSelector';
import { SwapRouteSummary } from '../components/swap/SwapRouteSummary';
import { SwapReviewSheet } from '../components/swap/SwapReviewSheet';
import { SwapProcessingOverlay } from '../components/swap/SwapProcessingOverlay';
import { SwapSuccessView } from '../components/swap/SwapSuccessView';
import { EmptyCatalogBanner } from '../../../shared/components/EmptyCatalogBanner';
import { useWalletAssets } from '../../../shared/hooks/useWalletAssets';
import { useAuth } from '../../../shared/context/AuthContext';
import { useAccountGates } from '../../../shared/hooks/useAccountGates';
import { GateHint } from '../../../shared/components/AccountStatusBanners';
import { queryClient, queryKeys } from '../../../shared/query/queryClient';
import { FeatureAlert, mapApiCodeToReason } from '../../../shared/components/FeatureAlert';
import { WalletFeatureBanner } from '../../../shared/components/WalletFeatureBanner';
import { executeSwap, getSwapQuote } from '../../../shared/api/swap';
import { ApiError } from '../../../shared/api/types';

interface SwapScreenProps {
  goBack: () => void;
}

type SwapPhase = 'idle' | 'review' | 'swapping' | 'success';

export function SwapScreen({ goBack }: SwapScreenProps) {
  const { swapAssets: cryptoAssets, loading: registryLoading } = useWalletAssets();
  useEffect(() => {
    if (!cryptoAssets.length) return;
  }, [cryptoAssets]);
  const { userId } = useAuth();
  // Fresh balances every time user opens Swap
  useEffect(() => {
    if (!userId) return;
    void queryClient.invalidateQueries({ queryKey: queryKeys.portfolio(userId) });
  }, [userId]);
  const gates = useAccountGates();
  const [apiBlock, setApiBlock] = useState<{ code?: string; message?: string } | null>(null);
  const { format, currency } = useCurrency();

  const [fromAsset, setFromAsset] = useState<Asset>(cryptoAssets.find((a) => a.symbol === 'ETH') || cryptoAssets[0] || {
  id: 'loading',
  symbol: '…',
  name: 'Loading',
  price: 0,
  change24h: 0,
  balance: 0,
  valueUSD: 0,
  color: 'var(--muted-foreground)',
  bgColor: 'var(--muted)',
  chains: [],
  sparkline: [],
} as Asset);
  const [toAsset, setToAsset] = useState<Asset>(cryptoAssets.find((a) => a.symbol === 'USDT') || cryptoAssets[1] || cryptoAssets[0] || {
  id: 'loading',
  symbol: '…',
  name: 'Loading',
  price: 0,
  change24h: 0,
  balance: 0,
  valueUSD: 0,
  color: 'var(--muted-foreground)',
  bgColor: 'var(--muted)',
  chains: [],
  sparkline: [],
} as Asset);
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

  const effectiveSlippage = useMemo(() => (customSlippage ? `${customSlippage}%` : slippage), [customSlippage, slippage]);
  const slippageNum = useMemo(() => {
    const n = parseFloat(effectiveSlippage);
    return Number.isFinite(n) ? n / 100 : 0.005;
  }, [effectiveSlippage]);

  const fromNum = useMemo(() => {
    const n = Number(fromAmount);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [fromAmount]);


  // Keep selected tokens' balances in sync with live portfolio (fixes zero balance on open)
  useEffect(() => {
    if (!cryptoAssets.length) return;
    setFromAsset((prev) => {
      const hit = cryptoAssets.find((a) => a.symbol === prev.symbol);
      return hit ? { ...hit } : prev;
    });
    setToAsset((prev) => {
      const hit = cryptoAssets.find((a) => a.symbol === prev.symbol);
      return hit ? { ...hit } : prev;
    });
  }, [cryptoAssets]);

  const rate = useMemo(() => (toAsset.price === 0 ? 0 : fromAsset.price / toAsset.price), [fromAsset, toAsset]);

  const toAmount = useMemo(() => (fromNum <= 0 ? 0 : (fromNum * fromAsset.price) / toAsset.price), [fromNum, fromAsset, toAsset]);

  const priceImpactPct = useMemo(() => {
    if (fromNum <= 0) return 0;
    const usdValue = fromNum * fromAsset.price;
    return Math.min((usdValue / 50000) * 3 + 0.05, 3);
  }, [fromNum, fromAsset]);

  const minReceived = useMemo(() => (toAmount <= 0 ? 0 : toAmount * (1 - slippageNum)), [toAmount, slippageNum]);

  const networkFeeUSD = useMemo(() => {
    if (fromNum <= 0) return 0;
    const baseFee = fromAsset.chains.includes('Solana') ? 0.0005 : 0.001;
    return fromNum * fromAsset.price * baseFee;
  }, [fromNum, fromAsset]);

  const route = useMemo(() => {
    if (fromAsset.id === toAsset.id) return [fromAsset.symbol];
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

  const handleFromAmount = useCallback((val: string) => {
    const cleaned = val.replace(/[^0-9.]/g, '');
    setFromAmount(cleaned);
    const n = Number(cleaned);
    if (cleaned && (!Number.isFinite(n) || n < 0)) { setError('Enter a valid amount'); return; }
    if (sameAsset) { setError('Cannot swap to the same asset'); return; }
    if (n > fromAsset.balance) {
      setError(`Insufficient balance. Max ${fromAsset.balance.toLocaleString('en', { maximumFractionDigits: decimalsFor(fromAsset.symbol) })} ${fromAsset.symbol}`);
      return;
    }
    setError('');
  }, [fromAsset, sameAsset]);

  const setPercentage = useCallback((pct: number) => {
    const amount = (fromAsset.balance * pct).toFixed(decimalsFor(fromAsset.symbol, 8));
    handleFromAmount(String(parseFloat(amount)));
  }, [fromAsset, handleFromAmount]);

  const flipAssets = useCallback(() => {
    setFromAsset(toAsset);
    setToAsset(fromAsset);
    setFromAmount('');
    setError('');
    setRatePulse((p) => p + 1);
  }, [fromAsset, toAsset]);

  const selectFromAsset = useCallback((a: Asset) => {
    setFromAsset(a);
    setFromAmount('');
    setError(a.id === toAsset.id ? 'Cannot swap to the same asset' : '');
  }, [toAsset]);

  const selectToAsset = useCallback((a: Asset) => {
    setToAsset(a);
    setError(a.id === fromAsset.id ? 'Cannot swap to the same asset' : '');
  }, [fromAsset]);

  const refreshRate = useCallback(() => {
    setRateRefreshing(true);
    setRatePulse((p) => p + 1);
    setTimeout(() => setRateRefreshing(false), 700);
  }, []);


  const [quoteOut, setQuoteOut] = useState<string | null>(null);
  const [quoteRate, setQuoteRate] = useState<string | null>(null);
  const [quoteFee, setQuoteFee] = useState<string | null>(null);
  const [quoteFeeBps, setQuoteFeeBps] = useState<number | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);


  // Live quote — toAmount is NET after platform fee (do not re-apply fee on UI)
  useEffect(() => {
    if (!fromNum || sameAsset || !fromAsset.symbol || !toAsset.symbol) {
      setQuoteOut(null);
      setQuoteRate(null);
      setQuoteFee(null);
      setQuoteFeeBps(null);
      return;
    }
    let cancelled = false;
    setQuoteLoading(true);
    const timer = setTimeout(() => {
      void getSwapQuote({
        fromAsset: fromAsset.symbol,
        toAsset: toAsset.symbol,
        amount: String(fromNum),
      })
        .then((q) => {
          if (cancelled) return;
          setQuoteOut(q.toAmount);
          setQuoteRate(q.rate);
          setQuoteFee(q.fee);
          setQuoteFeeBps(typeof q.feeBps === 'number' ? q.feeBps : null);
          setError('');
        })
        .catch((err) => {
          if (cancelled) return;
          setQuoteOut(null);
          setQuoteFee(null);
          if (err instanceof ApiError) {
            setError(err.body.message || err.message || 'Quote unavailable');
          } else {
            setError('Quote unavailable');
          }
        })
        .finally(() => {
          if (!cancelled) setQuoteLoading(false);
        });
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      setQuoteLoading(false);
    };
  }, [fromNum, fromAsset.symbol, toAsset.symbol, sameAsset]);

  /** Amount user receives — always from API quote (fee already deducted). */
  const receiveAmount = quoteOut != null && Number(quoteOut) > 0 ? Number(quoteOut) : 0;
  const receiveUSD = receiveAmount * (toAsset.price || 0);
  const displayRate = quoteRate != null && Number(quoteRate) > 0 ? Number(quoteRate) : rate;
  const platformFee = quoteFee != null ? Number(quoteFee) : 0;
  const canConfirmSwap = canSwap && receiveAmount > 0 && !quoteLoading && gates.canSwap;
  const openReview = useCallback(() => {
    if (canConfirmSwap) setPhase('review');
  }, [canConfirmSwap]);

  const confirmSwap = useCallback(async () => {
    setApiBlock(null);
    setPhase('swapping');
    try {
      if (!userId) throw new ApiError(401, { code: 'unauthorized', message: 'Sign in required' });
      const res = await executeSwap({
        userId,
        fromAsset: fromAsset.symbol,
        toAsset: toAsset.symbol,
        amount: String(fromNum),
      });
      const out = Number(res.amountOut || quoteOut || receiveAmount || toAmount);
      setReceiptTx({
        id: res.ledgerTransactionId || 'swap-' + Date.now(),
        type: 'swap',
        asset: fromAsset.symbol,
        assetTo: toAsset.symbol,
        amount: fromNum,
        amountTo: out,
        valueUSD: fromUSD,
        status: 'confirmed',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        hash: res.ledgerTransactionId || 'internal',
      });
      if (userId) {
        // Optimistic: adjust cached portfolio so UI updates before round-trip
        queryClient.setQueryData(queryKeys.portfolio(userId), (prev: unknown) => {
          if (!prev || typeof prev !== 'object') return prev;
          const p = prev as {
            totalValueUsd?: string;
            holdings?: Array<{ asset: string; quantity: string; priceUsd: string; valueUsd: string }>;
          };
          const holdings = [...(p.holdings || [])];
          const bump = (sym: string, delta: number) => {
            const i = holdings.findIndex((h) => h.asset.toUpperCase() === sym.toUpperCase());
            if (i >= 0) {
              const qty = Math.max(0, (Number(holdings[i].quantity) || 0) + delta);
              const price = Number(holdings[i].priceUsd) || 0;
              holdings[i] = {
                ...holdings[i],
                quantity: String(qty),
                valueUsd: String(qty * price),
              };
            } else if (delta > 0) {
              holdings.push({
                asset: sym.toUpperCase(),
                quantity: String(delta),
                priceUsd: '0',
                valueUsd: '0',
              });
            }
          };
          bump(fromAsset.symbol, -fromNum);
          bump(toAsset.symbol, out);
          return { ...p, holdings };
        });
        await queryClient.invalidateQueries({ queryKey: queryKeys.portfolio(userId) });
        await queryClient.refetchQueries({ queryKey: queryKeys.portfolio(userId) });
        await queryClient.invalidateQueries({ queryKey: queryKeys.transactions(userId, 50) });
      }
      setPhase('success');
    } catch (err) {
      setPhase('idle');
      if (err instanceof ApiError) {
        setApiBlock({ code: err.code, message: err.body.message || err.message });
      } else {
        setApiBlock({ message: 'Swap failed — is the API running?' });
      }
    }
  }, [fromAsset, toAsset, fromNum, toAmount, fromUSD, userId, quoteOut, receiveAmount]);

  const resetSwap = useCallback(() => {
    setPhase('idle');
    setFromAmount('');
    setError('');
    setRatePulse((p) => p + 1);
    setReceiptTx(null);
    setShowReceipt(false);
  }, []);

  const setSlippagePreset = useCallback((v: string) => { setSlippage(v); setCustomSlippage(''); }, []);
  const setCustomSlippageValue = useCallback((v: string) => setCustomSlippage(v.replace(/[^0-9.]/g, '')), []);

  if (phase === 'success') {
    return (
      <SwapSuccessView
        fromAsset={fromAsset} toAsset={toAsset} fromNum={fromNum} toAmount={receiveAmount || Number(quoteOut) || toAmount}
        rate={displayRate || rate} networkFeeUSD={platformFee} format={format}
        receiptTx={receiptTx} showReceipt={showReceipt}
        onShowReceipt={() => setShowReceipt(true)} onCloseReceipt={() => setShowReceipt(false)}
        onSwapAgain={resetSwap} onDone={goBack}
      />
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />

      <div className="flex items-center gap-3 px-5 mb-3">
        {goBack ? (
          <motion.button whileTap={{ scale: 0.9 }} onClick={goBack} aria-label="Go back" className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'var(--muted)' }}>
            <ChevronLeft size={20} style={{ color: 'var(--foreground)' }} />
          </motion.button>
        ) : null}
        <h2 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 20 }}>Swap</h2>
        <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1.5 rounded-full" style={{ background: 'var(--muted)' }}>
          <Zap size={12} style={{ color: 'var(--foreground)' }} />
          <span style={{ color: 'var(--foreground)', fontSize: 11, fontWeight: 700 }}>Best Rate</span>
        </div>
      </div>
      <div className="px-5 mb-3">
        {!registryLoading && cryptoAssets.length === 0 && <EmptyCatalogBanner />}
        <GateHint mode="swap" />
        <WalletFeatureBanner feature="swap" />
        {apiBlock && <FeatureAlert reason={mapApiCodeToReason(apiBlock.code)} message={apiBlock.message} detail={apiBlock.code} />}
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <div className="relative">
          <SwapAssetCard
            variant="from" asset={fromAsset} amount={fromAmount} onAmountChange={handleFromAmount}
            onOpenPicker={() => setShowFromPicker(true)} usdValue={fromUSD} format={format} onSetPercentage={setPercentage}
          />
          <SwapDirectionButton onClick={flipAssets} />
        </div>

        <div className="mb-4 mt-3">
          <SwapAssetCard variant="to" asset={toAsset} amount={receiveAmount} onOpenPicker={() => setShowToPicker(true)} usdValue={receiveUSD} format={format} />
        </div>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, height: 0, marginBottom: 0 }} animate={{ opacity: 1, height: 'auto', marginBottom: 12 }} exit={{ opacity: 0, height: 0, marginBottom: 0 }} className="overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-[12px]" style={{ background: 'var(--muted)', border: '1px solid var(--muted)' }}>
                <AlertTriangle size={14} style={{ color: 'var(--destructive)' }} />
                <p style={{ color: 'var(--destructive)', fontSize: 12, fontWeight: 500 }}>{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {hasInput && !error && (
          <>
            <SwapRateRow
              fromAsset={fromAsset}
              toAsset={toAsset}
              rate={displayRate || rate}
              ratePulse={ratePulse}
              rateRefreshing={rateRefreshing || quoteLoading}
              onRefresh={refreshRate}
            />
            {platformFee > 0 && (
              <div className="flex justify-between items-center px-1 py-2 mb-1">
                <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
                  Platform fee{quoteFeeBps != null ? ` (${(quoteFeeBps / 100).toFixed(2)}%)` : ''}
                </span>
                <span style={{ color: 'var(--foreground)', fontSize: 12, fontWeight: 600 }}>
                  {platformFee.toFixed(6)} {toAsset.symbol}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center px-1 py-2 mb-2">
              <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>You receive</span>
              <span style={{ color: 'var(--positive)', fontSize: 13, fontWeight: 700 }}>
                {quoteLoading ? '…' : `${receiveAmount.toFixed(6)} ${toAsset.symbol}`}
              </span>
            </div>
          </>
        )}

        <motion.button
          whileTap={{ scale: canConfirmSwap ? 0.97 : 1 }}
          onClick={openReview}
          disabled={!canConfirmSwap}
          className="w-full py-4 rounded-[16px] text-white flex items-center justify-center gap-2"
          style={{
            background: canConfirmSwap ? 'var(--primary)' : 'var(--muted)',
            color: canConfirmSwap ? '#FFF' : 'var(--muted-foreground)',
            fontWeight: 700,
            fontSize: 15,
          }}
        >
          {sameAsset
            ? 'Select different assets'
            : !hasInput
              ? 'Enter an amount'
              : insufficientBalance
                ? 'Insufficient balance'
                : quoteLoading
                  ? 'Fetching quote…'
                  : !receiveAmount
                    ? 'Waiting for quote'
                    : 'Review Swap'}
        </motion.button>
      </div>

      <AssetPicker open={showFromPicker} onClose={() => setShowFromPicker(false)} onSelect={selectFromAsset} excludeId={toAsset.id} title="Select token to pay" />
      <AssetPicker open={showToPicker} onClose={() => setShowToPicker(false)} onSelect={selectToAsset} excludeId={fromAsset.id} title="Select token to receive" />

      <AnimatePresence>
        {phase === 'review' && (
          <SwapReviewSheet
            fromAsset={fromAsset} toAsset={toAsset} fromNum={fromNum} toAmount={receiveAmount}
            fromUSD={fromUSD} toUSD={receiveUSD} format={format} rate={displayRate}
            priceImpactPct={0} effectiveSlippage={0} minReceived={receiveAmount}
            networkFeeUSD={platformFee} route={[fromAsset.symbol, toAsset.symbol]}
            onClose={() => setPhase('idle')} onConfirm={confirmSwap}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === 'swapping' && (
          <SwapProcessingOverlay fromSymbol={fromAsset.symbol} toSymbol={toAsset.symbol} chainName={fromAsset.chains[0]} />
        )}
      </AnimatePresence>
    </div>
  );
}
