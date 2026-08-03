import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, TrendingDown, Search, SlidersHorizontal, ChevronRight, Zap, CheckCircle2, Loader, Star } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { marketData, otcListings, portfolioChartData, cryptoAssets, type Screen } from '../../data/mockData';
import { AssetIcon } from './HomeScreen';
import { useCurrency } from '../../context/CurrencyContext';

interface TradeScreenProps {
  navigate: (s: Screen) => void;
}

const periods = ['1D', '1W', '1M', '3M', '1Y', 'All'];

export function TradeScreen({ navigate }: TradeScreenProps) {
  const { currency, format } = useCurrency();
  const [period, setPeriod] = useState('1W');
  const [tradeTab, setTradeTab] = useState<'market' | 'otc'>('market');
  const [orderTab, setOrderTab] = useState<'buy' | 'sell'>('buy');
  const [selectedAsset, setSelectedAsset] = useState(cryptoAssets[0]);
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<'form' | 'review' | 'processing' | 'done'>('form');

  const chartData = portfolioChartData.slice(
    period === '1D' ? 27 : period === '1W' ? 23 : period === '1M' ? 0 : 0,
  );

  const usdAmount = Number(amount);
  const cryptoAmount = usdAmount / selectedAsset.price;
  const fee = usdAmount * 0.001;

  const handleTrade = () => {
    if (!amount || usdAmount <= 0) return;
    setStep('review');
  };

  const confirmTrade = () => {
    setStep('processing');
    setTimeout(() => setStep('done'), 2500);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />

      <div className="flex items-center justify-between px-5 mb-4">
        <div>
          <h2 style={{ color: 'var(--foreground)', fontWeight: 800 }}>Markets</h2>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Trade & Grow</p>
        </div>
        <div className="flex gap-2">
          <motion.button whileTap={{ scale: 0.9 }} className="w-10 h-10 rounded-2xl flex items-center justify-center glass-card" style={{ border: '1px solid var(--border)' }}>
            <Search size={16} style={{ color: 'var(--muted-foreground)' }} />
          </motion.button>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate('swap')} className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'var(--primary)' }}>
            <Zap size={16} className="text-white" />
          </motion.button>
        </div>
      </div>

      <div className="px-5 mb-4">
        <div className="rounded-[24px] p-4 glass-card glass-refraction" style={{ border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Portfolio Value</p>
              <p style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 22, letterSpacing: -0.5 }}>{format(9539.40)}</p>
              <div className="flex items-center gap-1">
                <TrendingUp size={13} style={{ color: 'var(--primary)' }} />
                <span style={{ color: 'var(--primary)', fontSize: 12, fontWeight: 600 }}>+2.52% this week</span>
              </div>
            </div>
            <div className="flex gap-1">
              {periods.map(p => (
                <button key={p} onClick={() => setPeriod(p)} className="px-2 py-1 rounded-lg" style={{ background: period === p ? 'var(--primary)' : 'transparent', color: period === p ? '#FFF' : 'var(--muted-foreground)', fontSize: 11, fontWeight: 600 }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div style={{ height: 120 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="tradeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#818CF8" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#818CF8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" hide />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip content={({ active, payload }) => active && payload?.length ? <div className="px-2 py-1 rounded-lg" style={{ background: 'rgba(0,0,0,0.85)', fontSize: 12, color: '#FFF' }}>{format(payload[0].value as number)}</div> : null} />
                <Area type="monotone" dataKey="value" stroke="#818CF8" strokeWidth={2} fill="url(#tradeGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="px-5 mb-3">
        <div className="flex gap-1 p-1 rounded-[14px] glass-card" style={{ border: '1px solid var(--border)' }}>
          {(['market', 'otc'] as const).map(tab => (
            <button key={tab} onClick={() => setTradeTab(tab)} className="flex-1 py-2 rounded-[10px]" style={{ background: tradeTab === tab ? 'var(--card)' : 'transparent', color: tradeTab === tab ? 'var(--foreground)' : 'var(--muted-foreground)', fontSize: 13, fontWeight: 600 }}>
              {tab === 'market' ? 'Market' : 'OTC P2P'}
            </button>
          ))}
        </div>
      </div>

      {tradeTab === 'market' ? (
        <>
          <div className="px-5 mb-4">
            <div className="rounded-[20px] p-4 glass-card" style={{ border: '1px solid var(--border)' }}>
              <AnimatePresence mode="wait">
                {step === 'form' && (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="flex gap-1 p-1 rounded-xl mb-4" style={{ background: 'var(--muted)' }}>
                      {(['buy', 'sell'] as const).map(t => (
                        <button key={t} onClick={() => setOrderTab(t)} className="flex-1 py-2 rounded-[10px] capitalize" style={{ background: orderTab === t ? 'var(--primary)' : 'transparent', color: orderTab === t ? '#FFF' : 'var(--muted-foreground)', fontSize: 13, fontWeight: 700 }}>
                          {t}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Asset</span>
                      <div className="flex gap-1 flex-wrap justify-end">
                        {cryptoAssets.slice(0, 5).map(asset => (
                          <motion.button key={asset.id} whileTap={{ scale: 0.93 }} onClick={() => setSelectedAsset(asset)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl" style={{ background: selectedAsset.id === asset.id ? 'var(--primary)' : 'var(--muted)' }}>
                            <AssetIcon symbol={asset.symbol} size={16} />
                            <span style={{ color: selectedAsset.id === asset.id ? '#FFF' : 'var(--foreground)', fontSize: 12, fontWeight: 600 }}>{asset.symbol}</span>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-3">
                      <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 6 }}>Amount ({currency.code})</p>
                      <div className="flex items-center px-4 py-3 rounded-[14px]" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
                        <span style={{ color: 'var(--muted-foreground)', fontSize: 18, marginRight: 8 }}>{currency.symbol}</span>
                        <input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} className="flex-1 bg-transparent outline-none" style={{ color: 'var(--foreground)', fontSize: 18, fontWeight: 600 }} />
                      </div>
                      <div className="flex gap-2 mt-2">
                        {[25, 50, 100, 500].map(v => (
                          <button key={v} onClick={() => setAmount(String(v * currency.rate))} className="px-3 py-1 rounded-lg" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 500 }}>
                            {currency.symbol}{(v * currency.rate).toLocaleString('en', { maximumFractionDigits: 0 })}
                          </button>
                        ))}
                      </div>
                    </div>

                    {amount && usdAmount > 0 && (
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-[12px] mb-3" style={{ background: 'var(--muted)' }}>
                        <div className="flex justify-between mb-1">
                          <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{orderTab === 'buy' ? 'You get' : 'You sell'}</span>
                          <span style={{ color: 'var(--foreground)', fontSize: 12, fontWeight: 600 }}>{cryptoAmount.toFixed(6)} {selectedAsset.symbol}</span>
                        </div>
                        <div className="flex justify-between mb-1">
                          <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Fee (0.1%)</span>
                          <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{format(fee)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Price</span>
                          <span style={{ color: 'var(--foreground)', fontSize: 12, fontWeight: 600 }}>{format(selectedAsset.price)} / {selectedAsset.symbol}</span>
                        </div>
                      </motion.div>
                    )}

                    <motion.button whileTap={{ scale: 0.97 }} onClick={handleTrade} className="w-full py-3.5 rounded-[14px] text-white" style={{ background: amount && usdAmount > 0 ? 'var(--primary)' : 'var(--muted)', fontWeight: 700, fontSize: 15, boxShadow: amount && usdAmount > 0 ? '0 8px 24px rgba(99,102,241,0.4)' : 'none' }}>
                      {orderTab === 'buy' ? `Buy ${selectedAsset.symbol}` : `Sell ${selectedAsset.symbol}`}
                    </motion.button>
                  </motion.div>
                )}

                {step === 'review' && (
                  <motion.div key="review" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                    <div className="text-center mb-6">
                      <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>{orderTab === 'buy' ? 'Buying' : 'Selling'}</p>
                      <p style={{ color: 'var(--foreground)', fontSize: 28, fontWeight: 800 }}>{cryptoAmount.toFixed(6)} {selectedAsset.symbol}</p>
                      <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>for {format(usdAmount)}</p>
                    </div>
                    {[
                      { l: 'Order Type', v: 'Market Order' },
                      { l: 'Price', v: `${format(selectedAsset.price)} / ${selectedAsset.symbol}` },
                      { l: 'Fee', v: format(fee) },
                      { l: 'Total', v: format(usdAmount + (orderTab === 'buy' ? fee : -fee)), bold: true },
                    ].map(row => (
                      <div key={row.l} className="flex justify-between py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
                        <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>{row.l}</span>
                        <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: row.bold ? 700 : 500 }}>{row.v}</span>
                      </div>
                    ))}
                    <motion.button whileTap={{ scale: 0.97 }} onClick={confirmTrade} className="w-full py-3.5 rounded-[14px] text-white mt-4" style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 15, boxShadow: '0 8px 24px rgba(99,102,241,0.4)' }}>
                      Confirm {orderTab === 'buy' ? 'Buy' : 'Sell'}
                    </motion.button>
                    <button onClick={() => setStep('form')} className="w-full py-2 mt-2" style={{ color: 'var(--muted-foreground)', fontSize: 13, fontWeight: 500 }}>Cancel</button>
                  </motion.div>
                )}

                {step === 'processing' && (
                  <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-12">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.15)' }}>
                      <Loader size={40} style={{ color: 'var(--primary)' }} className="animate-spin" />
                    </div>
                    <h3 style={{ color: 'var(--foreground)', fontWeight: 700, marginTop: 20, marginBottom: 4 }}>Processing...</h3>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>{orderTab === 'buy' ? 'Buying' : 'Selling'} {cryptoAmount.toFixed(6)} {selectedAsset.symbol}</p>
                  </motion.div>
                )}

                {step === 'done' && (
                  <motion.div key="done" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center py-8 text-center">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5" style={{ background: 'rgba(99,102,241,0.15)' }}>
                      <CheckCircle2 size={44} style={{ color: 'var(--primary)' }} />
                    </div>
                    <h2 style={{ color: 'var(--foreground)', fontWeight: 800, marginBottom: 4 }}>Order Filled!</h2>
                    <p style={{ color: 'var(--primary)', fontSize: 24, fontWeight: 800, marginBottom: 4 }}>{cryptoAmount.toFixed(6)} {selectedAsset.symbol}</p>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginBottom: 20 }}>
                      {orderTab === 'buy' ? 'Added to your wallet' : 'Sold from your wallet'}
                    </p>
                    <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setStep('form'); setAmount(''); }} className="w-full py-3.5 rounded-[14px] text-white" style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 15 }}>
                      Done
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="px-5 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 style={{ color: 'var(--foreground)', fontWeight: 700 }}>All Markets</h3>
              <button className="flex items-center gap-1" style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
                <SlidersHorizontal size={14} /> Filter
              </button>
            </div>
            <div className="rounded-[20px] overflow-hidden glass-card" style={{ border: '1px solid var(--border)' }}>
              <div className="flex px-4 py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                <span className="flex-1" style={{ color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600 }}>ASSET</span>
                <span style={{ color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600, width: 80, textAlign: 'center' }}>PRICE</span>
                <span style={{ color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600, width: 60, textAlign: 'right' }}>24H</span>
              </div>
              {marketData.map((asset, i) => (
                <motion.div key={asset.symbol} whileTap={{ scale: 0.99 }} onClick={() => setSelectedAsset(cryptoAssets.find(a => a.symbol === asset.symbol) || cryptoAssets[0])} className="flex items-center px-4 py-3" style={{ borderBottom: i < marketData.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div className="flex items-center gap-2 flex-1">
                    <AssetIcon symbol={asset.symbol} size={34} />
                    <div>
                      <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13 }}>{asset.symbol}</p>
                      <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>MCap {format(asset.mktCap * 1e9)}</p>
                    </div>
                  </div>
                  <div style={{ width: 80, textAlign: 'center' }}>
                    <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13 }}>{format(asset.price)}</p>
                  </div>
                  <div style={{ width: 60, textAlign: 'right' }}>
                    <div className="flex items-center justify-end gap-1">
                      {asset.change >= 0 ? <TrendingUp size={11} style={{ color: 'var(--primary)' }} /> : <TrendingDown size={11} style={{ color: '#EF4444' }} />}
                      <span style={{ color: asset.change >= 0 ? 'var(--primary)' : '#EF4444', fontSize: 12, fontWeight: 600 }}>{Math.abs(asset.change)}%</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="px-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Best rates · Updated live</p>
            <button onClick={() => navigate('otc')} className="flex items-center gap-1" style={{ color: 'var(--primary)', fontSize: 13, fontWeight: 600 }}>
              Full OTC <ChevronRight size={14} />
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {otcListings.map((listing, i) => (
              <motion.div key={listing.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} whileTap={{ scale: 0.98 }} className="p-4 rounded-[16px] glass-card" style={{ border: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white" style={{ background: listing.seller.color, fontSize: 11, fontWeight: 700 }}>{listing.seller.initials}</div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13 }}>{listing.seller.name}</span>
                        {listing.seller.online && <div className="w-2 h-2 rounded-full" style={{ background: 'var(--primary)' }} />}
                      </div>
                      <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>
                        <Star size={10} style={{ display: 'inline', color: 'var(--primary)' }} /> {listing.seller.rating} · {listing.seller.trades} trades
                      </p>
                    </div>
                  </div>
                  <div className="px-2 py-1 rounded-lg" style={{ background: listing.type === 'buy' ? 'rgba(99,102,241,0.15)' : 'rgba(239,68,68,0.15)' }}>
                    <span style={{ color: listing.type === 'buy' ? 'var(--primary)' : '#EF4444', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>{listing.type}</span>
                  </div>
                </div>
                <div className="flex justify-between mb-2">
                  <div>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>Rate</p>
                    <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 16 }}>{listing.currencySymbol}{listing.rate.toLocaleString()}/{listing.asset}</p>
                  </div>
                  <div className="text-right">
                    <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>Available</p>
                    <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>{listing.amount.toLocaleString()} {listing.asset}</p>
                  </div>
                </div>
                <div className="flex gap-2 mb-3 flex-wrap">
                  {listing.payMethods.map(m => (
                    <span key={m} className="px-2 py-1 rounded-lg" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', fontSize: 11 }}>{m}</span>
                  ))}
                </div>
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate('otc')} className="w-full py-2.5 rounded-[12px] text-white" style={{ background: 'var(--primary)', fontSize: 13, fontWeight: 700 }}>
                  {listing.type === 'buy' ? `Sell ${listing.asset}` : `Buy ${listing.asset}`}
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div style={{ height: 100 }} />
    </div>
  );
}
