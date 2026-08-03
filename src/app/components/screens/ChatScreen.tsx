import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Send, ArrowUpRight, MoreVertical, CheckCircle2, X, ChevronDown, Loader } from 'lucide-react';

interface ChatScreenProps {
  goBack: () => void;
}

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'them';
  time: string;
  type?: 'text' | 'payment';
  payment?: { amount: string; asset: string; status: 'pending' | 'confirmed' };
}

const initialMessages: Message[] = [
  { id: '1', text: 'Hey! Can you send me that 0.1 ETH we talked about?', sender: 'them', time: '10:23 AM' },
  { id: '2', text: 'Sure, sending now! Give me a sec', sender: 'me', time: '10:25 AM' },
  { id: '3', text: 'Sent!', sender: 'me', time: '10:26 AM', type: 'payment', payment: { amount: '0.1', asset: 'ETH', status: 'confirmed' } },
  { id: '4', text: "Got it! Thanks man, you're the best", sender: 'them', time: '10:27 AM' },
  { id: '5', text: 'SOL looking bullish today, check that 4H', sender: 'them', time: '10:30 AM' },
  { id: '6', text: 'Yeah just bought more at $175', sender: 'me', time: '10:31 AM' },
];

const assets = [
  { symbol: 'USDT', name: 'Tether', balance: '12,450.00', icon: '$', color: '#26A17B' },
  { symbol: 'BTC', name: 'Bitcoin', balance: '0.4821', icon: '₿', color: '#F7931A' },
  { symbol: 'ETH', name: 'Ethereum', balance: '3.214', icon: 'Ξ', color: '#627EEA' },
  { symbol: 'SOL', name: 'Solana', balance: '45.6', icon: '◎', color: '#14F195' },
  { symbol: 'USDC', name: 'USD Coin', balance: '8,200.00', icon: '$', color: '#2775CA' },
];

export function ChatScreen({ goBack }: ChatScreenProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(assets[0]);
  const [showAssetPicker, setShowAssetPicker] = useState(false);
  const [amount, setAmount] = useState('');
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      text: input.trim(),
      sender: 'me',
      time: new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
    }]);
    setInput('');
  };

  const sendPayment = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: '',
        sender: 'me',
        time: new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
        type: 'payment',
        payment: { amount, asset: selectedAsset.symbol, status: 'confirmed' },
      }]);
      setAmount('');
      setShowPayment(false);
    }, 1800);
  };

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />

      {/* Chat header */}
      <div className="flex items-center gap-3 px-4 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={goBack} className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ background: 'var(--muted)' }}>
          <ChevronLeft size={18} style={{ color: 'var(--foreground)' }} />
        </motion.button>
        <div className="relative">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ background: '#6366F1', fontSize: 12, fontWeight: 700 }}>KA</div>
          <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full" style={{ background: 'var(--primary)', border: '2px solid var(--background)' }} />
        </div>
        <div className="flex-1">
          <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>Kwame Asante</p>
          <p style={{ color: 'var(--primary)', fontSize: 12 }}>@kwame_builds · Online</p>
        </div>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowPayment(true)} className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.15)' }}>
          <ArrowUpRight size={16} style={{ color: 'var(--primary)' }} />
        </motion.button>
        <motion.button whileTap={{ scale: 0.9 }} className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ background: 'var(--muted)' }}>
          <MoreVertical size={16} style={{ color: 'var(--muted-foreground)' }} />
        </motion.button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
            <div style={{ maxWidth: '75%' }}>
              {msg.type === 'payment' && msg.payment ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="rounded-[16px] p-3 mb-1 glass-card"
                  style={{
                    background: msg.sender === 'me'
                      ? 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(11,15,25,0.6))'
                      : 'var(--card)',
                    border: '1px solid rgba(99,102,241,0.15)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <ArrowUpRight size={14} style={{ color: '#818CF8' }} />
                    <span style={{ color: '#818CF8', fontSize: 11, fontWeight: 700 }}>Payment Sent</span>
                  </div>
                  <p style={{ color: '#FFF', fontWeight: 800, fontSize: 18 }}>{msg.payment.amount} {msg.payment.asset}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <CheckCircle2 size={12} style={{ color: 'var(--primary)' }} />
                    <span style={{ color: 'var(--primary)', fontSize: 11, fontWeight: 600 }}>Confirmed</span>
                  </div>
                </motion.div>
              ) : (
                <div
                  className="px-4 py-2.5 rounded-[18px]"
                  style={{
                    background: msg.sender === 'me' ? 'var(--primary)' : 'var(--card)',
                    border: msg.sender === 'them' ? '1px solid var(--border)' : 'none',
                    borderBottomRightRadius: msg.sender === 'me' ? 4 : 18,
                    borderBottomLeftRadius: msg.sender === 'them' ? 4 : 18,
                  }}
                >
                  <p style={{ color: msg.sender === 'me' ? '#FFF' : 'var(--foreground)', fontSize: 14, lineHeight: 1.4 }}>
                    {msg.text}
                  </p>
                </div>
              )}
              <p style={{ color: 'var(--muted-foreground)', fontSize: 10, textAlign: msg.sender === 'me' ? 'right' : 'left', marginTop: 2 }}>
                {msg.time}
              </p>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-2 glass-nav" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowPayment(true)} className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(99,102,241,0.15)' }}>
            <ArrowUpRight size={18} style={{ color: 'var(--primary)' }} />
          </motion.button>
          <div className="flex-1 flex items-center px-4 py-2.5 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Message..."
              className="flex-1 bg-transparent outline-none"
              style={{ color: 'var(--foreground)', fontSize: 14 }}
            />
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={sendMessage}
            className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: input.trim() ? 'var(--primary)' : 'var(--muted)' }}
          >
            <Send size={16} style={{ color: input.trim() ? '#FFF' : 'var(--muted-foreground)' }} />
          </motion.button>
        </div>
      </div>

      {/* Payment Sheet */}
      <AnimatePresence>
        {showPayment && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowPayment(false); setShowAssetPicker(false); }}
              className="absolute inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.5)' }}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 z-50 rounded-t-[28px] p-6 pb-8"
              style={{ background: 'var(--card)', border: '1px solid var(--border)', borderTop: '1px solid rgba(99,102,241,0.2)' }}
            >
              <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: 'var(--border)' }} />

              <div className="flex items-center justify-between mb-6">
                <h3 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 18 }}>Send Payment</h3>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => { setShowPayment(false); setShowAssetPicker(false); }} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--muted)' }}>
                  <X size={16} style={{ color: 'var(--muted-foreground)' }} />
                </motion.button>
              </div>

              {/* Recipient */}
              <div className="flex items-center gap-3 p-3 rounded-[14px] mb-4" style={{ background: 'var(--muted)' }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white" style={{ background: '#6366F1', fontSize: 11, fontWeight: 700 }}>KA</div>
                <div>
                  <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13 }}>Kwame Asante</p>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>@kwame_builds</p>
                </div>
              </div>

              {/* Amount input */}
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
                  <button onClick={() => setShowAssetPicker(!showAssetPicker)} className="flex items-center gap-1.5 px-3 py-2 rounded-[12px]" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                    <span style={{ color: selectedAsset.color, fontSize: 16, fontWeight: 700 }}>{selectedAsset.icon}</span>
                    <span style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>{selectedAsset.symbol}</span>
                    <ChevronDown size={14} style={{ color: 'var(--muted-foreground)' }} />
                  </button>
                </div>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 11, marginTop: 8 }}>Balance: {selectedAsset.balance} {selectedAsset.symbol}</p>
              </div>

              {/* Asset picker dropdown */}
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
                          style={{ background: selectedAsset.symbol === asset.symbol ? 'rgba(99,102,241,0.1)' : 'var(--card)', borderBottom: '1px solid var(--border)' }}
                        >
                          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: asset.color, color: '#FFF', fontSize: 13, fontWeight: 700 }}>{asset.icon}</div>
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

              {/* Send button */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={sendPayment}
                disabled={!amount || sending}
                className="w-full h-[52px] rounded-[16px] flex items-center justify-center gap-2 text-white"
                style={{
                  background: amount && !sending ? 'var(--primary)' : 'var(--muted)',
                  fontWeight: 700, fontSize: 16,
                  boxShadow: amount && !sending ? '0 8px 24px rgba(99,102,241,0.4)' : 'none',
                }}
              >
                {sending ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <ArrowUpRight size={18} />
                    Send {amount || '0'} {selectedAsset.symbol}
                  </>
                )}
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
