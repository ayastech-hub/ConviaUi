import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Building, Phone, Clock, CheckCircle2, Loader, ArrowDownToLine, ChevronDown, Search } from 'lucide-react';
import { cryptoAssets, type Screen } from '../../data/mockData';
import { AssetIcon } from './HomeScreen';
import { useCurrency } from '../../context/CurrencyContext';

interface OnRampScreenProps {
  goBack: () => void;
}

export function OnRampScreen({ goBack }: OnRampScreenProps) {
  const { currency, format } = useCurrency();
  const [selectedAsset, setSelectedAsset] = useState(cryptoAssets.find(a => a.id === 'usdt')!);
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'mobile' | 'card'>('bank');
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<'form' | 'review' | 'processing' | 'done'>('form');
  const [showTokenDropdown, setShowTokenDropdown] = useState(false);

  const rampAssets = cryptoAssets.filter(a => ['usdt', 'usdc', 'btc', 'eth', 'sol'].includes(a.id));

  const usdAmount = Number(amount) / currency.rate;
  const fee = usdAmount * 0.015;
  const youGet = (usdAmount - fee) / selectedAsset.price;

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />

      <div className="flex items-center gap-3 px-5 mb-5">
        <motion.button whileTap={{ scale: 0.9 }} onClick={step === 'form' ? goBack : () => setStep('form')} className="w-10 h-10 rounded-2xl flex items-center justify-center glass-card" style={{ border: '1px solid var(--border)' }}>
          <ChevronLeft size={20} style={{ color: 'var(--foreground)' }} />
        </motion.button>
        <h2 style={{ color: 'var(--foreground)', fontWeight: 800 }}>On-Ramp from Cash</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-5">
        <AnimatePresence mode="wait">
          {step === 'form' && (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Pay with — shows user's default currency, no selector */}
              <div className="rounded-[20px] p-4 mb-4 glass-card" style={{ border: '1px solid var(--border)' }}>
                <div className="flex justify-between mb-2">
                  <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Pay With</span>
                  <span style={{ color: 'var(--primary)', fontSize: 12, fontWeight: 600 }}>{currency.name}</span>
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <span style={{ color: 'var(--muted-foreground)', fontSize: 28, fontWeight: 800 }}>{currency.symbol}</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="flex-1 bg-transparent outline-none"
                    style={{ color: 'var(--foreground)', fontSize: 28, fontWeight: 800 }}
                    autoFocus
                  />
                </div>
                {amount && (
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
                    ≈ {format(usdAmount)}
                  </p>
                )}
                <div className="flex gap-2 mt-2 flex-wrap">
                  {[1000, 5000, 10000, 50000].map(v => (
                    <button key={v} onClick={() => setAmount(String(v))} className="px-3 py-1.5 rounded-xl" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 500 }}>
                      {currency.symbol}{v.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Receive — token dropdown */}
              <div className="mb-4">
                <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 8 }}>Receive</p>
                <div className="relative">
                  <button
                    onClick={() => setShowTokenDropdown(!showTokenDropdown)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-[16px] glass-card"
                    style={{ border: '1px solid var(--border)' }}
                  >
                    <AssetIcon symbol={selectedAsset.symbol} size={28} />
                    <div className="flex-1 text-left">
                      <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>{selectedAsset.symbol}</p>
                      <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{selectedAsset.name}</p>
                    </div>
                    <ChevronDown size={18} style={{ color: 'var(--muted-foreground)' }} />
                  </button>

                  <AnimatePresence>
                    {showTokenDropdown && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowTokenDropdown(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="absolute top-full left-0 right-0 mt-1 rounded-[16px] overflow-hidden glass-card z-50"
                          style={{ border: '1px solid var(--border)', boxShadow: '0 12px 40px rgba(0,0,0,0.4)' }}
                        >
                          {rampAssets.map(asset => (
                            <button
                              key={asset.id}
                              onClick={() => { setSelectedAsset(asset); setShowTokenDropdown(false); }}
                              className="w-full flex items-center gap-3 px-4 py-3"
                              style={{ borderBottom: asset.id !== rampAssets[rampAssets.length - 1].id ? '1px solid var(--border)' : 'none' }}
                            >
                              <AssetIcon symbol={asset.symbol} size={24} />
                              <div className="flex-1 text-left">
                                <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13 }}>{asset.symbol}</p>
                                <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{asset.name}</p>
                              </div>
                              {selectedAsset.id === asset.id && <CheckCircle2 size={16} style={{ color: 'var(--primary)' }} />}
                            </button>
                          ))}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-4">
                <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 8 }}>Payment Method</p>
                <div className="flex gap-2 mb-3">
                  {(['bank', 'mobile', 'card'] as const).map(m => (
                    <button
                      key={m}
                      onClick={() => setPaymentMethod(m)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[12px]"
                      style={{
                        background: paymentMethod === m ? 'var(--primary)' : 'var(--card)',
                        border: `1px solid ${paymentMethod === m ? 'transparent' : 'var(--border)'}`,
                        color: paymentMethod === m ? '#FFF' : 'var(--muted-foreground)',
                        fontSize: 13, fontWeight: 600,
                      }}
                    >
                      {m === 'bank' ? <Building size={14} /> : m === 'mobile' ? <Phone size={14} /> : <ArrowDownToLine size={14} />}
                      {m === 'bank' ? 'Bank' : m === 'mobile' ? 'Mobile' : 'Card'}
                    </button>
                  ))}
                </div>
              </div>

              {amount && Number(amount) > 0 && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-[16px] mb-4" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
                  <div className="flex justify-between mb-2">
                    <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Live Rate</span>
                    <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}>
                      1 {selectedAsset.symbol} = {currency.symbol}{(selectedAsset.price * currency.rate).toLocaleString('en', { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Fee (1.5%)</span>
                    <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>{format(fee)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Settlement</span>
                    <div className="flex items-center gap-1">
                      <Clock size={11} style={{ color: 'var(--primary)' }} />
                      <span style={{ color: 'var(--primary)', fontSize: 13, fontWeight: 600 }}>~ 5 minutes</span>
                    </div>
                  </div>
                  <div className="h-px mb-2" style={{ background: 'var(--border)' }} />
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>You Receive</span>
                    <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: 18 }}>
                      {youGet.toFixed(6)} {selectedAsset.symbol}
                    </span>
                  </div>
                </motion.div>
              )}

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => { if (Number(amount) > 0) setStep('review'); }}
                className="w-full py-3.5 rounded-[16px] text-white"
                style={{
                  background: Number(amount) > 0 ? 'var(--primary)' : 'var(--muted)',
                  fontWeight: 700, fontSize: 15,
                  boxShadow: Number(amount) > 0 ? '0 8px 24px rgba(99,102,241,0.4)' : 'none',
                }}
              >
                Preview On-Ramp
              </motion.button>
            </motion.div>
          )}

          {step === 'review' && (
            <motion.div key="review" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div className="rounded-[20px] p-5 mb-4 glass-card" style={{ border: '1px solid var(--border)' }}>
                <div className="text-center mb-6">
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Paying</p>
                  <p style={{ color: 'var(--foreground)', fontSize: 32, fontWeight: 800, letterSpacing: -1 }}>
                    {currency.symbol}{Number(amount).toLocaleString()}
                  </p>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>{currency.name}</p>
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <div style={{ height: 1, width: 40, background: 'var(--border)' }} />
                    <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>to</span>
                    <div style={{ height: 1, width: 40, background: 'var(--border)' }} />
                  </div>
                  <p style={{ color: 'var(--primary)', fontSize: 32, fontWeight: 800, letterSpacing: -1, marginTop: 8 }}>
                    {youGet.toFixed(6)} {selectedAsset.symbol}
                  </p>
                </div>
                {[
                  { l: 'Method', v: paymentMethod === 'bank' ? 'Bank Transfer' : paymentMethod === 'mobile' ? 'Mobile Money' : 'Card' },
                  { l: 'Fee', v: format(fee) },
                  { l: 'Settlement', v: '~ 5 minutes' },
                ].map(row => (
                  <div key={row.l} className="flex justify-between py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>{row.l}</span>
                    <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}>{row.v}</span>
                  </div>
                ))}
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => { setStep('processing'); setTimeout(() => setStep('done'), 3000); }}
                className="w-full py-3.5 rounded-[16px] text-white"
                style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 15, boxShadow: '0 8px 24px rgba(99,102,241,0.4)' }}
              >
                Confirm On-Ramp
              </motion.button>
            </motion.div>
          )}

          {step === 'processing' && (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20">
              <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.15)' }}>
                <Loader size={44} style={{ color: 'var(--primary)' }} className="animate-spin" />
              </div>
              <h3 style={{ color: 'var(--foreground)', fontWeight: 700, marginBottom: 8, marginTop: 24 }}>Processing...</h3>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 13, textAlign: 'center' }}>
                Converting {currency.symbol}{Number(amount).toLocaleString()} to {youGet.toFixed(6)} {selectedAsset.symbol}
              </p>
            </motion.div>
          )}

          {step === 'done' && (
            <motion.div key="done" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center py-12 text-center">
              <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ background: 'rgba(99,102,241,0.15)' }}>
                <CheckCircle2 size={52} style={{ color: 'var(--primary)' }} />
              </div>
              <h2 style={{ color: 'var(--foreground)', fontWeight: 800, marginBottom: 8 }}>On-Ramp Successful!</h2>
              <p style={{ color: 'var(--primary)', fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
                {youGet.toFixed(6)} {selectedAsset.symbol}
              </p>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginBottom: 6 }}>
                Credited to your wallet
              </p>
              <div className="flex items-center gap-1.5 mb-10 px-3 py-1.5 rounded-full" style={{ background: 'rgba(99,102,241,0.12)' }}>
                <Clock size={12} style={{ color: 'var(--primary)' }} />
                <span style={{ color: 'var(--primary)', fontSize: 12, fontWeight: 600 }}>Completed</span>
              </div>
              <motion.button whileTap={{ scale: 0.97 }} onClick={goBack} className="w-full py-3.5 rounded-[16px] text-white" style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 15 }}>
                Done
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
