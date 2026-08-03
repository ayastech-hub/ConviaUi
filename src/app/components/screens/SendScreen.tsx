import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Search, ChevronDown, CheckCircle2, Loader } from 'lucide-react';
import { cryptoAssets, chatContacts, type Screen } from '../../data/mockData';
import { AssetIcon } from './HomeScreen';
import { useCurrency } from '../../context/CurrencyContext';

interface SendScreenProps {
  navigate: (s: Screen) => void;
  goBack: () => void;
}

export function SendScreen({ navigate, goBack }: SendScreenProps) {
  const { format } = useCurrency();
  const [step, setStep] = useState<'to' | 'amount' | 'confirm' | 'success'>('to');
  const [recipient, setRecipient] = useState('');
  const [selectedContact, setSelectedContact] = useState<typeof chatContacts[0] | null>(null);
  const [selectedAsset, setSelectedAsset] = useState(cryptoAssets.find(a => a.id === 'usdt')!);
  const [amount, setAmount] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = () => {
    setSending(true);
    setTimeout(() => { setSending(false); setStep('success'); }, 2000);
  };

  const fee = Number(amount) * 0.001;
  const total = Number(amount) + fee;

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />

      {/* Header */}
      <div className="flex items-center gap-3 px-5 mb-6">
        <motion.button whileTap={{ scale: 0.9 }} onClick={goBack} className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'var(--muted)' }}>
          <ChevronLeft size={20} style={{ color: 'var(--foreground)' }} />
        </motion.button>
        <h2 style={{ color: 'var(--foreground)', fontWeight: 800 }}>
          {step === 'success' ? 'Sent!' : 'Send'}
        </h2>
      </div>

      {/* Step indicators */}
      {step !== 'success' && (
        <div className="flex items-center gap-2 px-5 mb-6">
          {(['to', 'amount', 'confirm'] as const).map((s, i) => (
            <React.Fragment key={s}>
              <div className="flex items-center gap-1">
                <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{
                  background: ['to', 'amount', 'confirm'].indexOf(step) >= i ? 'var(--primary)' : 'var(--muted)',
                }}>
                  <span className="text-white" style={{ fontSize: 10, fontWeight: 700 }}>{i + 1}</span>
                </div>
                <span style={{ fontSize: 11, color: ['to', 'amount', 'confirm'].indexOf(step) >= i ? 'var(--primary)' : 'var(--muted-foreground)', fontWeight: 500 }}>
                  {s === 'to' ? 'Recipient' : s === 'amount' ? 'Amount' : 'Confirm'}
                </span>
              </div>
              {i < 2 && <div className="flex-1 h-px" style={{ background: ['to', 'amount', 'confirm'].indexOf(step) > i ? 'var(--primary)' : 'var(--border)' }} />}
            </React.Fragment>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-5">
        <AnimatePresence mode="wait">
          {step === 'to' && (
            <motion.div key="to" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div className="flex items-center gap-2 px-4 py-3 rounded-[14px] mb-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <Search size={16} style={{ color: 'var(--muted-foreground)' }} />
                <input
                  placeholder="Username, address, or ENS..."
                  value={recipient}
                  onChange={e => setRecipient(e.target.value)}
                  className="flex-1 bg-transparent outline-none"
                  style={{ color: 'var(--foreground)', fontSize: 14 }}
                  autoFocus
                />
              </div>

              <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 12 }}>Recent contacts</p>
              <div className="flex flex-col gap-2">
                {chatContacts.map(contact => (
                  <motion.button
                    key={contact.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setSelectedContact(contact); setRecipient(contact.username); setStep('amount'); }}
                    className="flex items-center gap-3 p-3 rounded-[16px]"
                    style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                  >
                    <div className="w-11 h-11 rounded-full flex items-center justify-center text-white relative" style={{ background: contact.color, fontSize: 13, fontWeight: 700 }}>
                      {contact.initials}
                      {contact.online && <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full" style={{ background: 'var(--primary)', border: '2px solid var(--background)' }} />}
                    </div>
                    <div className="flex-1 text-left">
                      <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>{contact.name}</p>
                      <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>@{contact.username}</p>
                    </div>
                    {contact.online && <div className="w-2 h-2 rounded-full" style={{ background: 'var(--primary)' }} />}
                  </motion.button>
                ))}
              </div>

              {recipient && !selectedContact && (
                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setStep('amount')}
                  className="w-full mt-4 py-3.5 rounded-[16px] text-white"
                  style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 15 }}
                >
                  Continue with "{recipient}"
                </motion.button>
              )}
            </motion.div>
          )}

          {step === 'amount' && (
            <motion.div key="amount" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div className="flex items-center gap-3 p-3 rounded-[16px] mb-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                {selectedContact && (
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ background: selectedContact.color, fontSize: 12, fontWeight: 700 }}>
                    {selectedContact.initials}
                  </div>
                )}
                <div>
                  <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>{selectedContact?.name ?? recipient}</p>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>@{recipient}</p>
                </div>
              </div>

              {/* Asset selector */}
              <div className="flex justify-between items-center mb-3">
                <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Send</span>
                <motion.button whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'var(--muted)' }}>
                  <AssetIcon symbol={selectedAsset.symbol} size={20} />
                  <span style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>{selectedAsset.symbol}</span>
                  <ChevronDown size={14} style={{ color: 'var(--muted-foreground)' }} />
                </motion.button>
              </div>

              {/* Amount input */}
              <div className="text-center py-8">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span style={{ color: 'var(--muted-foreground)', fontSize: 24 }}>$</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="bg-transparent outline-none text-center"
                    style={{ color: 'var(--foreground)', fontSize: 48, fontWeight: 800, width: '100%', letterSpacing: -2 }}
                    autoFocus
                  />
                </div>
                {amount && (
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
                    ≈ {(Number(amount) / selectedAsset.price).toFixed(6)} {selectedAsset.symbol}
                  </p>
                )}
              </div>

              <div className="flex gap-2 justify-center mb-6">
                {['10', '25', '50', '100', '250'].map(v => (
                  <button key={v} onClick={() => setAmount(v)} className="px-3 py-1.5 rounded-xl" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', fontSize: 13, fontWeight: 500 }}>
                    ${v}
                  </button>
                ))}
              </div>

              <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 6 }}>
                Balance: {format(selectedAsset.valueUSD)}
              </p>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => { if (Number(amount) > 0) setStep('confirm'); }}
                className="w-full py-3.5 rounded-[16px] text-white"
                style={{ background: Number(amount) > 0 ? 'var(--primary)' : 'var(--muted)', fontWeight: 700, fontSize: 15 }}
              >
                Continue
              </motion.button>
            </motion.div>
          )}

          {step === 'confirm' && (
            <motion.div key="confirm" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div className="rounded-[20px] p-5 mb-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-white" style={{ background: selectedContact?.color ?? 'var(--primary)', fontSize: 20, fontWeight: 700 }}>
                    {selectedContact?.initials ?? '?'}
                  </div>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Sending to</p>
                  <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 16 }}>@{recipient}</p>
                </div>

                <div className="text-center mb-6">
                  <p style={{ color: 'var(--foreground)', fontSize: 40, fontWeight: 800, letterSpacing: -2 }}>${amount}</p>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
                    ≈ {(Number(amount) / selectedAsset.price).toFixed(6)} {selectedAsset.symbol}
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    { label: 'Asset', value: selectedAsset.name },
                    { label: 'Network', value: selectedAsset.chains[0] },
                    { label: 'Network fee', value: `$${fee.toFixed(4)}` },
                    { label: 'Total deducted', value: `$${total.toFixed(2)}`, bold: true },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                      <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>{row.label}</span>
                      <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: row.bold ? 700 : 500 }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSend}
                disabled={sending}
                className="w-full py-3.5 rounded-[16px] text-white flex items-center justify-center gap-2"
                style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 15, boxShadow: '0 8px 24px rgba(99,102,241,0.4)' }}
              >
                {sending ? <Loader size={18} className="animate-spin" /> : null}
                {sending ? 'Sending...' : 'Confirm & Send'}
              </motion.button>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center h-full text-center py-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
                style={{ background: 'rgba(99,102,241,0.15)' }}
              >
                <CheckCircle2 size={52} style={{ color: 'var(--primary)' }} />
              </motion.div>
              <h2 style={{ color: 'var(--foreground)', fontWeight: 800, marginBottom: 8 }}>Sent Successfully!</h2>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 14, marginBottom: 6 }}>
                ${amount} sent to @{recipient}
              </p>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 40 }}>
                {(Number(amount) / selectedAsset.price).toFixed(6)} {selectedAsset.symbol} • Confirmed
              </p>
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
