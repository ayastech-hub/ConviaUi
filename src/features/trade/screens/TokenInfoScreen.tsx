import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, TrendingUp, TrendingDown, Star, ChevronDown,
  Loader, CheckCircle2, Zap,
} from 'lucide-react';
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import type { Screen, TokenDetail } from '../../../shared/data/mockData';
import { tokenDetails, cryptoAssets } from '../../../shared/data/mockData';
import { useCurrency } from '../../../shared/context/CurrencyContext';

interface TokenInfoScreenProps {
  navigate: (s: Screen) => void;
  goBack: () => void;
  symbol: string;
}

const periods = ['1D', '1W', '1M', '3M', '1Y', 'All'];

export function TokenInfoScreen({ navigate, goBack, symbol }: TokenInfoScreenProps) {
  const { format } = useCurrency();
  const detail: TokenDetail | undefined = tokenDetails[symbol] ?? Object.values(tokenDetails)[0];
  const [period, setPeriod] = useState('1W');
  const [orderTab, setOrderTab] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [assetDropdownOpen, setAssetDropdownOpen] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState(symbol);
  const [step, setStep] = useState<'form' | 'review' | 'processing' | 'done'>('form');
  const [starred, setStarred] = useState(false);

  const currentDetail = tokenDetails[selectedSymbol] ?? detail;
  const chartData = currentDetail.chartData;
  const usdAmount = Number(amount);
  const cryptoAmount = usdAmount / currentDetail.price;
  const fee = usdAmount * 0.001;

  const handleTrade = () => {
    if (!amount || usdAmount <= 0) return;
    setStep('review');
  };

  const confirmTrade = () => {
    setStep('processing');
    setTimeout(() => setStep('done'), 2500);
  };

  const stats = [
    { label: 'Market Cap', value: currentDetail.marketCap },
    { label: '24h Volume', value: currentDetail.volume },
    { label: 'Circulating Supply', value: currentDetail.circulatingSupply },
    { label: 'Max Supply', value: currentDetail.maxSupply },
    { label: 'All-Time High', value: currentDetail.allTimeHigh },
    { label: 'All-Time Low', value: currentDetail.allTimeLow },
    { label: 'Rank', value: `#${currentDetail.rank}` },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />

      {/* Header */}
      <div className="flex items-center justify-between px-5 mb-4">
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={goBack}
            className="w-10 h-10 rounded-2xl flex items-center justify-center glass-card"
            style={{ border: '1px solid var(--border)' }}
          >
            <ArrowLeft size={18} style={{ color: 'var(--foreground)' }} />
          </motion.button>

          {/* Token selector */}
          <div className="relative">
            <button
              onClick={() => setAssetDropdownOpen(o => !o)}
              className="flex items-center gap-2 px-3 py-2 rounded-[14px] glass-card"
              style={{ border: '1px solid var(--border)' }}
            >
              <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'var(--muted)', fontSize: 10, fontWeight: 800 }}>
                {currentDetail.symbol.charAt(0)}
              </div>
              <span style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>{currentDetail.symbol}</span>
              <ChevronDown size={14} style={{ color: 'var(--muted-foreground)' }} />
            </button>
            <AnimatePresence>
              {assetDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setAssetDropdownOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute top-full left-0 z-50 mt-1 rounded-[14px] overflow-hidden"
                    style={{ background: 'var(--card)', border: '1px solid var(--border)', maxHeight: 280, overflowY: 'auto' }}
                  >
                    {Object.values(tokenDetails).map(t => (
                      <button
                        key={t.symbol}
                        onClick={() => { setSelectedSymbol(t.symbol); setAssetDropdownOpen(false); setAmount(''); setStep('form'); }}
                        className="w-full flex items-center justify-between px-4 py-3"
                        style={{ borderBottom: '1px solid var(--border)' }}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'var(--muted)', fontSize: 10, fontWeight: 800 }}>
                            {t.symbol.charAt(0)}
                          </div>
                          <div className="text-left">
                            <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13 }}>{t.symbol}</p>
                            <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{t.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13 }}>{format(t.price)}</p>
                          <p style={{ color: t.change >= 0 ? 'var(--positive)' : 'var(--destructive)', fontSize: 11, fontWeight: 600 }}>
                            {t.change >= 0 ? '+' : ''}{t.change}%
                          </p>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setStarred(s => !s)}
          className="w-10 h-10 rounded-2xl flex items-center justify-center glass-card"
          style={{ border: '1px solid var(--border)' }}
        >
          <Star size={18} style={{ color: starred ? 'var(--warning)' : 'var(--muted-foreground)' }} fill={starred ? 'var(--warning)' : 'none'} />
        </motion.button>
      </div>

      {/* Price + Change */}
      <div className="px-5 mb-4">
        <div className="flex items-end gap-3 mb-1">
          <p style={{ color: 'var(--foreground)', fontSize: 36, fontWeight: 800, letterSpacing: -1, lineHeight: 1 }}>
            {format(currentDetail.price)}
          </p>
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg mb-1.5" style={{ background: currentDetail.change >= 0 ? 'var(--positive)' : 'var(--destructive)' }}>
            {currentDetail.change >= 0
              ? <TrendingUp size={12} style={{ color: '#FFF' }} />
              : <TrendingDown size={12} style={{ color: '#FFF' }} />}
            <span style={{ color: '#FFF', fontSize: 12, fontWeight: 700 }}>
              {currentDetail.change >= 0 ? '+' : ''}{currentDetail.change}%
            </span>
          </div>
        </div>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{currentDetail.name} · Rank #{currentDetail.rank}</p>
      </div>

      {/* Chart */}
      <div className="px-5 mb-4">
        <div className="rounded-[20px] p-4 glass-card" style={{ border: '1px solid var(--border)' }}>
          <div className="flex gap-1 mb-3">
            {periods.map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className="px-2.5 py-1 rounded-lg"
                style={{
                  background: period === p ? 'var(--primary)' : 'transparent',
                  color: period === p ? '#FFF' : 'var(--muted-foreground)',
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                {p}
              </button>
            ))}
          </div>
          <div style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="tokenChartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={currentDetail.change >= 0 ? 'var(--positive)' : 'var(--destructive)'} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={currentDetail.change >= 0 ? 'var(--positive)' : 'var(--destructive)'} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" hide />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip
                  content={({ active, payload }) =>
                    active && payload?.length ? (
                      <div className="px-2 py-1 rounded-lg" style={{ background: 'rgba(0,0,0,0.85)', fontSize: 12, color: '#FFF' }}>
                        {format(payload[0].value as number)}
                      </div>
                    ) : null
                  }
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={currentDetail.change >= 0 ? 'var(--positive)' : 'var(--destructive)'}
                  strokeWidth={2}
                  fill="url(#tokenChartGrad)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="px-5 mb-4">
        <div className="grid grid-cols-2 gap-2">
          {stats.map(stat => (
            <div key={stat.label} className="rounded-[14px] p-3" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{stat.label}</p>
              <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* About */}
      <div className="px-5 mb-4">
        <h3 style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15, marginBottom: 8 }}>About {currentDetail.name}</h3>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 13, lineHeight: 1.6 }}>
          {currentDetail.description}
        </p>
      </div>

      {/* Buy/Sell Panel */}
      <div className="px-5 mb-6">
        <div className="rounded-[20px] p-4 glass-card" style={{ border: '1px solid var(--border)' }}>
          <AnimatePresence mode="wait">
            {step === 'form' && (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="flex gap-1 p-1 rounded-xl mb-4" style={{ background: 'var(--muted)' }}>
                  {(['buy', 'sell'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setOrderTab(t)}
                      className="flex-1 py-2.5 rounded-[10px] capitalize"
                      style={{
                        background: orderTab === t
                          ? (t === 'buy' ? 'var(--positive)' : 'var(--destructive)')
                          : 'transparent',
                        color: orderTab === t ? '#FFF' : 'var(--muted-foreground)',
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <div className="mb-3">
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 6 }}>Amount (USD)</p>
                  <div className="flex items-center px-4 py-3 rounded-[14px]" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--muted-foreground)', fontSize: 18, marginRight: 8 }}>$</span>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      className="flex-1 bg-transparent outline-none"
                      style={{ color: 'var(--foreground)', fontSize: 18, fontWeight: 600 }}
                    />
                  </div>
                  <div className="flex gap-2 mt-2">
                    {[25, 50, 100, 500].map(v => (
                      <button
                        key={v}
                        onClick={() => setAmount(String(v))}
                        className="px-3 py-1 rounded-lg"
                        style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 500 }}
                      >
                        ${v}
                      </button>
                    ))}
                  </div>
                </div>

                {amount && usdAmount > 0 && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-[12px] mb-3" style={{ background: 'var(--muted)' }}>
                    <div className="flex justify-between mb-1">
                      <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
                        {orderTab === 'buy' ? 'You get' : 'You sell'}
                      </span>
                      <span style={{ color: 'var(--foreground)', fontSize: 12, fontWeight: 600 }}>
                        {cryptoAmount.toFixed(6)} {currentDetail.symbol}
                      </span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Fee (0.1%)</span>
                      <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{format(fee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Price</span>
                      <span style={{ color: 'var(--foreground)', fontSize: 12, fontWeight: 600 }}>
                        {format(currentDetail.price)} / {currentDetail.symbol}
                      </span>
                    </div>
                  </motion.div>
                )}

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleTrade}
                  disabled={!amount || usdAmount <= 0}
                  className="w-full py-3.5 rounded-[14px] text-white"
                  style={{
                    background: amount && usdAmount > 0
                      ? (orderTab === 'buy' ? 'var(--positive)' : 'var(--destructive)')
                      : 'var(--muted)',
                    fontWeight: 700,
                    fontSize: 15,
                  }}
                >
                  {orderTab === 'buy' ? `Buy ${currentDetail.symbol}` : `Sell ${currentDetail.symbol}`}
                </motion.button>
              </motion.div>
            )}

            {step === 'review' && (
              <motion.div key="review" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <div className="text-center mb-6">
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
                    {orderTab === 'buy' ? 'Buying' : 'Selling'}
                  </p>
                  <p style={{ color: 'var(--foreground)', fontSize: 28, fontWeight: 800 }}>
                    {cryptoAmount.toFixed(6)} {currentDetail.symbol}
                  </p>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>for {format(usdAmount)}</p>
                </div>
                {[
                  { l: 'Price', v: `${format(currentDetail.price)} / ${currentDetail.symbol}` },
                  { l: 'Fee', v: format(fee) },
                  { l: 'Total', v: format(usdAmount + (orderTab === 'buy' ? fee : -fee)), bold: true },
                ].map(row => (
                  <div key={row.l} className="flex justify-between py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>{row.l}</span>
                    <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: row.bold ? 700 : 500 }}>{row.v}</span>
                  </div>
                ))}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={confirmTrade}
                  className="w-full py-3.5 rounded-[14px] text-white mt-4"
                  style={{ background: orderTab === 'buy' ? 'var(--positive)' : 'var(--destructive)', fontWeight: 700, fontSize: 15 }}
                >
                  Confirm {orderTab === 'buy' ? 'Buy' : 'Sell'}
                </motion.button>
                <button onClick={() => setStep('form')} className="w-full py-2 mt-2" style={{ color: 'var(--muted-foreground)', fontSize: 13, fontWeight: 500 }}>
                  Cancel
                </button>
              </motion.div>
            )}

            {step === 'processing' && (
              <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-12">
                <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'var(--muted)' }}>
                  <Loader size={40} style={{ color: 'var(--foreground)' }} className="animate-spin" />
                </div>
                <h3 style={{ color: 'var(--foreground)', fontWeight: 700, marginTop: 20, marginBottom: 4 }}>Processing...</h3>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
                  {orderTab === 'buy' ? 'Buying' : 'Selling'} {cryptoAmount.toFixed(6)} {currentDetail.symbol}
                </p>
              </motion.div>
            )}

            {step === 'done' && (
              <motion.div key="done" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center py-8 text-center">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5" style={{ background: 'var(--muted)' }}>
                  <CheckCircle2 size={44} style={{ color: 'var(--positive)' }} />
                </div>
                <h2 style={{ color: 'var(--foreground)', fontWeight: 800, marginBottom: 4 }}>Order Filled!</h2>
                <p style={{ color: 'var(--foreground)', fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
                  {cryptoAmount.toFixed(6)} {currentDetail.symbol}
                </p>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginBottom: 20 }}>
                  {orderTab === 'buy' ? 'Added to your wallet' : 'Sold from your wallet'}
                </p>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setStep('form'); setAmount(''); }}
                  className="w-full py-3.5 rounded-[14px] text-white"
                  style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 15 }}
                >
                  Done
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div style={{ height: 100 }} />
    </div>
  );
}
