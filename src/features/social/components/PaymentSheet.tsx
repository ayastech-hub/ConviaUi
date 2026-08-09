import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronDown, ArrowUpRight, Loader } from 'lucide-react';
import type { PaymentSheetProps } from './types';

const assets = [
  { symbol: 'USDT', name: 'Tether', balance: '12,450.00', icon: '$' },
  { symbol: 'BTC', name: 'Bitcoin', balance: '0.4821', icon: '₿' },
  { symbol: 'ETH', name: 'Ethereum', balance: '3.214', icon: 'Ξ' },
  { symbol: 'SOL', name: 'Solana', balance: '45.6', icon: '◎' },
  { symbol: 'USDC', name: 'USD Coin', balance: '8,200.00', icon: '$' },
];

export function PaymentSheet({ open, contact, onClose, onSend }: PaymentSheetProps) {
  const [selectedAsset, setSelectedAsset] = useState(assets[0]);
  const [showAssetPicker, setShowAssetPicker] = useState(false);
  const [amount, setAmount] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      onSend(amount, selectedAsset.symbol);
      setAmount('');
      setShowAssetPicker(false);
    }, 1800);
  };

  return (
    <AnimatePresence>
      {open && contact && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { onClose(); setShowAssetPicker(false); }}
            className="absolute inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.5)' }}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 z-50 rounded-t-[28px] p-6 pb-8"
            style={{ background: 'var(--card)', borderTop: '1px solid var(--border)' }}
          >
            <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: 'var(--border)' }} />

            <div className="flex items-center justify-between mb-6">
              <h3 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 18 }}>Send Payment</h3>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => { onClose(); setShowAssetPicker(false); }}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'var(--muted)' }}
              >
                <X size={16} style={{ color: 'var(--muted-foreground)' }} />
              </motion.button>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-[14px] mb-4" style={{ background: 'var(--muted)' }}>
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: 'var(--muted)', fontSize: 11, fontWeight: 700 }}
              >
                {contact.initials}
              </div>
              <div>
                <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13 }}>{contact.name}</p>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>@{contact.username}</p>
              </div>
            </div>

            <div className="rounded-[16px] p-5 mb-4" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 8 }}>Amount</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="flex-1 bg-transparent outline-none"
                  style={{ color: 'var(--foreground)', fontSize: 32, fontWeight: 800 }}
                />
                <button
                  onClick={() => setShowAssetPicker(!showAssetPicker)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-[12px]"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                >
                  <span style={{ color: 'var(--foreground)', fontSize: 16, fontWeight: 700 }}>
                    {selectedAsset.icon}
                  </span>
                  <span style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>
                    {selectedAsset.symbol}
                  </span>
                  <ChevronDown size={14} style={{ color: 'var(--muted-foreground)' }} />
                </button>
              </div>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 11, marginTop: 8 }}>
                Balance: {selectedAsset.balance} {selectedAsset.symbol}
              </p>
            </div>

            <AnimatePresence>
              {showAssetPicker && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mb-4"
                >
                  <div className="rounded-[14px] overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                    {assets.map(asset => (
                      <button
                        key={asset.symbol}
                        onClick={() => { setSelectedAsset(asset); setShowAssetPicker(false); }}
                        className="flex items-center gap-3 px-4 py-3 w-full"
                        style={{
                          background: selectedAsset.symbol === asset.symbol ? 'var(--muted)' : 'var(--card)',
                          borderBottom: '1px solid var(--border)',
                        }}
                      >
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ background: 'var(--muted)', color: 'var(--foreground)', fontSize: 13, fontWeight: 700 }}
                        >
                          {asset.icon}
                        </div>
                        <div className="flex-1 text-left">
                          <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13 }}>{asset.symbol}</p>
                          <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{asset.name}</p>
                        </div>
                        <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{asset.balance}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSend}
              disabled={!amount || sending}
              className="w-full h-[52px] rounded-[16px] flex items-center justify-center gap-2 text-white"
              style={{
                background: amount && !sending ? 'var(--primary)' : 'var(--muted)',
                fontWeight: 700,
                fontSize: 16,
              }}
            >
              {sending ? (
                <><Loader size={18} className="animate-spin" />Sending...</>
              ) : (
                <><ArrowUpRight size={18} />Send {amount || '0'} {selectedAsset.symbol}</>
              )}
            </motion.button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
