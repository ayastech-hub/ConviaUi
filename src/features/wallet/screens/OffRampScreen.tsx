import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronDown, Clock, CheckCircle2, Loader, Building, Phone, Plus, AlertCircle, ArrowUpRight } from 'lucide-react';
import { cryptoAssets, type Screen } from '../../../shared/data/mockData';
import { AssetIcon } from '../../../shared/components/AssetIcon';
import { useCurrency } from '../../../shared/context/CurrencyContext';
import { usePaymentMethods, type BankAccount } from '../../../shared/context/PaymentMethodsContext';

interface OffRampScreenProps {
  goBack: () => void;
  navigate: (s: Screen) => void;
}

export function OffRampScreen({ goBack, navigate }: OffRampScreenProps) {
  const { currency, format } = useCurrency();
  const { bankAccounts } = usePaymentMethods();
  const [selectedAsset, setSelectedAsset] = useState(cryptoAssets.find(a => a.id === 'usdt')!);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(bankAccounts[0]?.id ?? null);
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<'form' | 'review' | 'processing' | 'done'>('form');
  const [showTokenDropdown, setShowTokenDropdown] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);

  const stablecoins = cryptoAssets.filter(a => ['usdt', 'usdc', 'eth', 'btc', 'sol', 'bnb'].includes(a.id));
  const fee = Number(amount) * selectedAsset.price * 0.015;
  const youGet = (Number(amount) * selectedAsset.price - fee) * currency.rate;

  const compatibleAccounts = bankAccounts.filter(a => a.currency === currency.code);
  const selectedAccount = bankAccounts.find(a => a.id === selectedAccountId);

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />

      <div className="flex items-center gap-3 px-5 mb-5">
        <motion.button whileTap={{ scale: 0.9 }} onClick={step === 'form' ? goBack : () => setStep('form')} className="w-10 h-10 rounded-2xl flex items-center justify-center glass-card" style={{ border: '1px solid var(--border)' }}>
          <ChevronLeft size={20} style={{ color: 'var(--foreground)' }} />
        </motion.button>
        <h2 style={{ color: 'var(--foreground)', fontWeight: 800 }}>Off-Ramp to Cash</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-5">
        <AnimatePresence mode="wait">
          {step === 'form' && (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Token dropdown */}
              <div className="mb-4">
                <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 8 }}>Convert</p>
                <div className="relative">
                  <button onClick={() => setShowTokenDropdown(!showTokenDropdown)} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-[16px] glass-card" style={{ border: '1px solid var(--border)' }}>
                    <AssetIcon symbol={selectedAsset.symbol} size={28} />
                    <div className="flex-1 text-left">
                      <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>{selectedAsset.symbol}</p>
                      <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Bal: {selectedAsset.balance.toFixed(2)} {selectedAsset.symbol}</p>
                    </div>
                    <ChevronDown size={18} style={{ color: 'var(--muted-foreground)' }} />
                  </button>
                  <AnimatePresence>
                    {showTokenDropdown && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowTokenDropdown(false)} />
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="absolute top-full left-0 right-0 mt-1 rounded-[16px] overflow-hidden glass-card z-50" style={{ border: '1px solid var(--border)', boxShadow: '0 12px 40px rgba(0,0,0,0.4)' }}>
                          {stablecoins.map(asset => (
                            <button key={asset.id} onClick={() => { setSelectedAsset(asset); setShowTokenDropdown(false); }} className="w-full flex items-center gap-3 px-4 py-3" style={{ borderBottom: asset.id !== stablecoins[stablecoins.length - 1].id ? '1px solid var(--border)' : 'none' }}>
                              <AssetIcon symbol={asset.symbol} size={24} />
                              <div className="flex-1 text-left">
                                <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13 }}>{asset.symbol}</p>
                                <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{asset.name}</p>
                              </div>
                              {selectedAsset.id === asset.id && <CheckCircle2 size={16} style={{ color: 'var(--foreground)' }} />}
                            </button>
                          ))}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Amount */}
              <div className="rounded-[20px] p-4 mb-4 glass-card" style={{ border: '1px solid var(--border)' }}>
                <div className="flex justify-between mb-2">
                  <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Amount ({selectedAsset.symbol})</span>
                  <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Bal: {selectedAsset.balance.toFixed(2)} {selectedAsset.symbol}</span>
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <AssetIcon symbol={selectedAsset.symbol} size={32} />
                  <input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} className="flex-1 bg-transparent outline-none" style={{ color: 'var(--foreground)', fontSize: 28, fontWeight: 800 }} autoFocus />
                </div>
                {amount && <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>≈ {format(Number(amount) * selectedAsset.price)}</p>}
                <div className="flex gap-2 mt-2 flex-wrap">
                  {['50', '100', '500', 'Max'].map(v => (
                    <button key={v} onClick={() => setAmount(v === 'Max' ? selectedAsset.balance.toFixed(2) : v)} className="px-3 py-1.5 rounded-xl" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap' }}>
                      {v === 'Max' ? 'Max' : `${v} ${selectedAsset.symbol}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payout currency */}
              <div className="rounded-[16px] p-4 mb-4 glass-card" style={{ border: '1px solid var(--border)' }}>
                <div className="flex justify-between items-center">
                  <div>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Payout Currency</p>
                    <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>{currency.code} · {currency.name}</p>
                  </div>
                  <span style={{ color: 'var(--foreground)', fontSize: 24, fontWeight: 800 }}>{currency.symbol}</span>
                </div>
              </div>

              {/* Payout Account Selection — from saved accounts only */}
              <div className="mb-4">
                <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 8 }}>Payout Account</p>

                {compatibleAccounts.length === 0 ? (
                  <div className="rounded-[16px] p-5 text-center" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
                    <AlertCircle size={28} style={{ color: 'var(--warning)', margin: '0 auto 12px' }} />
                    <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>No {currency.code} account found</p>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 16 }}>Add a bank account or mobile money wallet in {currency.code} to receive payouts.</p>
                    <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate('payment-methods')} className="w-full py-3 rounded-[12px] text-white flex items-center justify-center gap-2" style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 14 }}>
                      <Plus size={16} /> Add Account
                    </motion.button>
                  </div>
                ) : (
                  <div className="relative">
                    <button onClick={() => setShowAccountDropdown(!showAccountDropdown)} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-[16px] glass-card" style={{ border: '1px solid var(--border)' }}>
                      {selectedAccount ? (
                        <>
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--muted)' }}>
                            {selectedAccount.type === 'bank' ? <Building size={18} style={{ color: 'var(--foreground)' }} /> : <Phone size={18} style={{ color: 'var(--foreground)' }} />}
                          </div>
                          <div className="flex-1 text-left">
                            <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>{selectedAccount.bankName}</p>
                            <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{selectedAccount.accountNumber} · {selectedAccount.currency}</p>
                          </div>
                        </>
                      ) : (
                        <span style={{ color: 'var(--muted-foreground)', fontSize: 14, flex: 1, textAlign: 'left' }}>Select payout account</span>
                      )}
                      <ChevronDown size={18} style={{ color: 'var(--muted-foreground)' }} />
                    </button>
                    <AnimatePresence>
                      {showAccountDropdown && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setShowAccountDropdown(false)} />
                          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="absolute top-full left-0 right-0 mt-1 rounded-[16px] overflow-hidden glass-card z-50" style={{ border: '1px solid var(--border)', boxShadow: '0 12px 40px rgba(0,0,0,0.4)' }}>
                            {compatibleAccounts.map((acct: BankAccount) => (
                              <button key={acct.id} onClick={() => { setSelectedAccountId(acct.id); setShowAccountDropdown(false); }} className="w-full flex items-center gap-3 px-4 py-3" style={{ borderBottom: acct.id !== compatibleAccounts[compatibleAccounts.length - 1].id ? '1px solid var(--border)' : 'none' }}>
                                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--muted)' }}>
                                  {acct.type === 'bank' ? <Building size={16} style={{ color: 'var(--foreground)' }} /> : <Phone size={16} style={{ color: 'var(--foreground)' }} />}
                                </div>
                                <div className="flex-1 text-left">
                                  <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13 }}>{acct.bankName}</p>
                                  <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{acct.accountNumber}</p>
                                </div>
                                {selectedAccountId === acct.id && <CheckCircle2 size={16} style={{ color: 'var(--foreground)' }} />}
                              </button>
                            ))}
                            <button onClick={() => { setShowAccountDropdown(false); navigate('payment-methods'); }} className="w-full flex items-center gap-3 px-4 py-3" style={{ borderTop: '1px solid var(--border)' }}>
                              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--muted)' }}><Plus size={16} style={{ color: 'var(--primary)' }} /></div>
                              <span style={{ color: 'var(--primary)', fontWeight: 600, fontSize: 13 }}>Add new account</span>
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Rate summary */}
              {amount && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-[16px] mb-4" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
                  <div className="flex justify-between mb-2"><span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Live Rate</span><span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}>1 {selectedAsset.symbol} = {currency.symbol}{(selectedAsset.price * currency.rate).toLocaleString('en', { maximumFractionDigits: 2 })}</span></div>
                  <div className="flex justify-between mb-2"><span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Fee (1.5%)</span><span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>-{format(fee)}</span></div>
                  <div className="flex justify-between mb-2"><span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Settlement</span><div className="flex items-center gap-1"><Clock size={11} style={{ color: 'var(--foreground)' }} /><span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}>~ 5 minutes</span></div></div>
                  <div className="h-px mb-2" style={{ background: 'var(--border)' }} />
                  <div className="flex justify-between"><span style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>You Receive</span><span style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 18 }}>{currency.symbol}{youGet.toLocaleString('en', { maximumFractionDigits: 0 })}</span></div>
                </motion.div>
              )}

              <motion.button whileTap={{ scale: 0.97 }} onClick={() => { if (Number(amount) > 0 && selectedAccountId) setStep('review'); }} className="w-full py-3.5 rounded-[16px] text-white" style={{ background: Number(amount) > 0 && selectedAccountId ? 'var(--primary)' : 'var(--muted)', fontWeight: 700, fontSize: 15 }}>Preview Off-Ramp</motion.button>
            </motion.div>
          )}

          {step === 'review' && (
            <motion.div key="review" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div className="rounded-[20px] p-5 mb-4 glass-card" style={{ border: '1px solid var(--border)' }}>
                <div className="text-center mb-6">
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Converting</p>
                  <p style={{ color: 'var(--foreground)', fontSize: 32, fontWeight: 800, letterSpacing: -1 }}>{amount} {selectedAsset.symbol}</p>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>≈ {format(Number(amount) * selectedAsset.price)}</p>
                  <div className="flex items-center justify-center gap-2 mt-3"><div style={{ height: 1, width: 40, background: 'var(--border)' }} /><span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>to</span><div style={{ height: 1, width: 40, background: 'var(--border)' }} /></div>
                  <p style={{ color: 'var(--foreground)', fontSize: 32, fontWeight: 800, letterSpacing: -1, marginTop: 8 }}>{currency.symbol}{youGet.toLocaleString('en', { maximumFractionDigits: 0 })}</p>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>{currency.name}</p>
                </div>
                {[
                  { l: 'Account', v: selectedAccount ? `${selectedAccount.bankName} · ${selectedAccount.accountNumber}` : '' },
                  { l: 'Account Holder', v: selectedAccount?.accountName ?? '' },
                  { l: 'Fee', v: format(fee) },
                  { l: 'Settlement', v: '~ 5 minutes' },
                ].map(row => (
                  <div key={row.l} className="flex justify-between py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>{row.l}</span>
                    <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}>{row.v}</span>
                  </div>
                ))}
              </div>
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setStep('processing'); setTimeout(() => setStep('done'), 3000); }} className="w-full py-3.5 rounded-[16px] text-white flex items-center justify-center gap-2" style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 15 }}>Confirm Off-Ramp <ArrowUpRight size={18} /></motion.button>
            </motion.div>
          )}

          {step === 'processing' && (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20">
              <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ background: 'var(--muted)' }}><Loader size={44} style={{ color: 'var(--foreground)' }} className="animate-spin" /></div>
              <h3 style={{ color: 'var(--foreground)', fontWeight: 700, marginBottom: 8, marginTop: 24 }}>Processing...</h3>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 13, textAlign: 'center' }}>Converting {amount} {selectedAsset.symbol} to {currency.symbol}{youGet.toLocaleString('en', { maximumFractionDigits: 0 })} {currency.code}</p>
            </motion.div>
          )}

          {step === 'done' && (
            <motion.div key="done" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center py-12 text-center">
              <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ background: 'var(--muted)' }}><CheckCircle2 size={52} style={{ color: 'var(--positive)' }} /></div>
              <h2 style={{ color: 'var(--foreground)', fontWeight: 800, marginBottom: 8 }}>Off-Ramp Successful!</h2>
              <p style={{ color: 'var(--foreground)', fontSize: 28, fontWeight: 800, marginBottom: 4 }}>{currency.symbol}{youGet.toLocaleString('en', { maximumFractionDigits: 0 })}</p>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginBottom: 6 }}>Sent to {selectedAccount?.bankName}</p>
              <div className="flex items-center gap-1.5 mb-10 px-3 py-1.5 rounded-full" style={{ background: 'var(--muted)' }}><Clock size={12} style={{ color: 'var(--foreground)' }} /><span style={{ color: 'var(--foreground)', fontSize: 12, fontWeight: 600 }}>Expected in 2-5 minutes</span></div>
              <motion.button whileTap={{ scale: 0.97 }} onClick={goBack} className="w-full py-3.5 rounded-[16px] text-white" style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 15 }}>Done</motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
