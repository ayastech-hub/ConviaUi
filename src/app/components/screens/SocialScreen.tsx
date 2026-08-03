import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart, MessageCircle, Share2, Search, Bell, Plus, Zap,
  TrendingUp, TrendingDown, Hash, ArrowUpRight, X, ChevronDown, Loader, CheckCircle2,
} from 'lucide-react';
import { socialPosts, chatContacts, type Screen } from '../../data/mockData';

interface SocialScreenProps {
  navigate: (s: Screen) => void;
}

const stories = [
  { name: 'You', initials: 'U', color: '#6366F1', isYou: true },
  { name: 'Kwame', initials: 'KA', color: '#6366F1', active: true },
  { name: 'Amara', initials: 'AD', color: '#EC4899', active: true },
  { name: 'Chidera', initials: 'CO', color: 'var(--primary)', active: false },
  { name: 'Fatima', initials: 'FH', color: '#F59E0B', active: false },
  { name: 'Emeka', initials: 'EN', color: '#8B5CF6', active: false },
];

const trending = ['#DeFiAfrica', '#BTC2026', '#Web3Lagos', '#SOLana', '#USDTNGNRate'];

const assets = [
  { symbol: 'USDT', name: 'Tether', balance: '12,450.00', icon: '$', color: '#26A17B' },
  { symbol: 'BTC', name: 'Bitcoin', balance: '0.4821', icon: '₿', color: '#F7931A' },
  { symbol: 'ETH', name: 'Ethereum', balance: '3.214', icon: 'Ξ', color: '#627EEA' },
  { symbol: 'SOL', name: 'Solana', balance: '45.6', icon: '◎', color: '#14F195' },
  { symbol: 'USDC', name: 'USD Coin', balance: '8,200.00', icon: '$', color: '#2775CA' },
];

interface SentPayment {
  contactId: string;
  amount: string;
  asset: string;
  time: string;
}

export function SocialScreen({ navigate }: SocialScreenProps) {
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set(['p2']));
  const [activeTab, setActiveTab] = useState<'feed' | 'discover' | 'messages'>('feed');
  const [showPayment, setShowPayment] = useState(false);
  const [paymentContact, setPaymentContact] = useState<typeof chatContacts[0] | null>(null);
  const [selectedAsset, setSelectedAsset] = useState(assets[0]);
  const [showAssetPicker, setShowAssetPicker] = useState(false);
  const [amount, setAmount] = useState('');
  const [sending, setSending] = useState(false);
  const [sentPayments, setSentPayments] = useState<SentPayment[]>([]);
  const [toast, setToast] = useState('');

  const toggleLike = (id: string) => {
    setLikedPosts(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const postTypeIcon = (type: string) => {
    if (type === 'trade') return <TrendingUp size={12} style={{ color: 'var(--primary)' }} />;
    if (type === 'market') return <TrendingUp size={12} style={{ color: '#818CF8' }} />;
    if (type === 'achievement') return <Zap size={12} style={{ color: '#F59E0B' }} />;
    return null;
  };

  const openPayment = (contact: typeof chatContacts[0]) => {
    setPaymentContact(contact);
    setAmount('');
    setSelectedAsset(assets[0]);
    setShowPayment(true);
  };

  const sendPayment = () => {
    if (!amount || parseFloat(amount) <= 0 || !paymentContact) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSentPayments(prev => [...prev, {
        contactId: paymentContact.id,
        amount,
        asset: selectedAsset.symbol,
        time: new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
      }]);
      setToast(`Sent ${amount} ${selectedAsset.symbol} to ${paymentContact.name}`);
      setAmount('');
      setShowPayment(false);
      setTimeout(() => setToast(''), 3000);
    }, 1800);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />

      {/* Header */}
      <div className="flex items-center justify-between px-5 mb-4">
        <h2 style={{ color: 'var(--foreground)', fontWeight: 800 }}>Community</h2>
        <div className="flex gap-2">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate('notifications')} className="w-10 h-10 rounded-2xl flex items-center justify-center glass-card" style={{ border: '1px solid var(--border)' }}>
            <Bell size={16} style={{ color: 'var(--muted-foreground)' }} />
          </motion.button>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate('chat')} className="w-10 h-10 rounded-2xl flex items-center justify-center glass-card" style={{ border: '1px solid var(--border)' }}>
            <MessageCircle size={16} style={{ color: 'var(--muted-foreground)' }} />
          </motion.button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 mb-4">
        <div className="flex gap-1 p-1 rounded-[14px] glass-card" style={{ border: '1px solid var(--border)' }}>
          {(['feed', 'discover', 'messages'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className="flex-1 py-2 rounded-[10px] capitalize" style={{ background: activeTab === tab ? 'var(--card)' : 'transparent', color: activeTab === tab ? 'var(--foreground)' : 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'feed' && (
        <>
          {/* Stories */}
          <div className="mb-4">
            <div className="flex gap-3 px-5 overflow-x-auto pb-1">
              {stories.map((story, i) => (
                <motion.div key={i} whileTap={{ scale: 0.93 }} className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center text-white" style={{ background: story.isYou ? 'var(--muted)' : story.color, fontSize: story.isYou ? 22 : 16, fontWeight: 700, boxShadow: story.active && !story.isYou ? `0 0 0 2px var(--background), 0 0 0 4px #6366F1` : 'none' }}>
                      {story.initials}
                    </div>
                    {story.isYou && <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#6366F1', border: '2px solid var(--background)' }}><Plus size={10} className="text-white" /></div>}
                    {story.active && !story.isYou && <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full" style={{ background: 'var(--primary)', border: '2px solid var(--background)' }} />}
                  </div>
                  <span style={{ color: 'var(--muted-foreground)', fontSize: 10, fontWeight: 500 }}>{story.isYou ? 'Your Story' : story.name}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Trending tags */}
          <div className="px-5 mb-4">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {trending.map(tag => (
                <div key={tag} className="flex items-center gap-1 px-3 py-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}>
                  <Hash size={10} style={{ color: 'var(--primary)' }} />
                  <span style={{ color: 'var(--primary)', fontSize: 12, fontWeight: 600 }}>{tag.slice(1)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Feed */}
          <div className="px-5 flex flex-col gap-4">
            {socialPosts.map((post, i) => {
              const isLiked = likedPosts.has(post.id);
              return (
                <motion.div key={post.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="rounded-[20px] p-4 glass-card" style={{ border: '1px solid var(--border)' }}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white" style={{ background: post.user.color, fontSize: 12, fontWeight: 700 }}>{post.user.initials}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <span style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>{post.user.name}</span>
                        {post.user.verified && <Zap size={13} style={{ color: '#818CF8' }} />}
                        {postTypeIcon(post.type)}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>@{post.user.username}</span>
                        <span style={{ color: 'var(--border)', fontSize: 12 }}>·</span>
                        <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{post.time}</span>
                      </div>
                    </div>
                  </div>
                  <p style={{ color: 'var(--foreground)', fontSize: 14, lineHeight: 1.55, marginBottom: 10 }}>{post.content}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {post.tags.map(tag => <span key={tag} style={{ color: 'var(--primary)', fontSize: 12, fontWeight: 500 }}>{tag}</span>)}
                  </div>
                  <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                    <motion.button whileTap={{ scale: 0.85 }} onClick={() => toggleLike(post.id)} className="flex items-center gap-1.5">
                      <Heart size={17} style={{ color: isLiked ? '#EF4444' : 'var(--muted-foreground)' }} fill={isLiked ? '#EF4444' : 'none'} />
                      <span style={{ color: isLiked ? '#EF4444' : 'var(--muted-foreground)', fontSize: 13, fontWeight: 500 }}>{post.likes + (isLiked && !post.liked ? 1 : 0)}</span>
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.85 }} className="flex items-center gap-1.5">
                      <MessageCircle size={17} style={{ color: 'var(--muted-foreground)' }} />
                      <span style={{ color: 'var(--muted-foreground)', fontSize: 13, fontWeight: 500 }}>{post.comments}</span>
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.85 }} className="flex items-center gap-1.5">
                      <Share2 size={17} style={{ color: 'var(--muted-foreground)' }} />
                      <span style={{ color: 'var(--muted-foreground)', fontSize: 13, fontWeight: 500 }}>{post.shares}</span>
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      )}

      {activeTab === 'discover' && (
        <div className="px-5">
          <div className="flex items-center gap-2 px-4 py-3 rounded-[14px] mb-4 glass-card" style={{ border: '1px solid var(--border)' }}>
            <Search size={16} style={{ color: 'var(--muted-foreground)' }} />
            <input placeholder="Search users, topics..." className="flex-1 bg-transparent outline-none" style={{ color: 'var(--foreground)', fontSize: 14 }} />
          </div>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginBottom: 16 }}>Top Traders</p>
          <div className="flex flex-col gap-3">
            {socialPosts.map((post, i) => (
              <motion.div key={post.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="flex items-center justify-between p-3 rounded-[16px] glass-card" style={{ border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-white" style={{ background: post.user.color, fontSize: 13, fontWeight: 700 }}>{post.user.initials}</div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>{post.user.name}</span>
                      {post.user.verified && <Zap size={12} style={{ color: '#818CF8' }} />}
                    </div>
                    <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>@{post.user.username} · {(i + 1) * 234 + 100} followers</span>
                  </div>
                </div>
                <motion.button whileTap={{ scale: 0.92 }} className="px-3 py-1.5 rounded-[10px]" style={{ background: 'var(--primary)', color: '#FFF', fontSize: 12, fontWeight: 700 }}>Follow</motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="px-5">
          <div className="flex items-center gap-2 px-4 py-3 rounded-[14px] mb-4 glass-card" style={{ border: '1px solid var(--border)' }}>
            <Search size={16} style={{ color: 'var(--muted-foreground)' }} />
            <input placeholder="Search messages..." className="flex-1 bg-transparent outline-none" style={{ color: 'var(--foreground)', fontSize: 14 }} />
          </div>
          <div className="flex flex-col gap-2">
            {chatContacts.map((contact, i) => {
              const payment = sentPayments.find(p => p.contactId === contact.id);
              return (
                <motion.div key={contact.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }} className="flex items-center gap-3 p-3 rounded-[16px]" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                  <motion.div whileTap={{ scale: 0.98 }} onClick={() => navigate('chat')} className="flex items-center gap-3 flex-1 cursor-pointer min-w-0">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-white" style={{ background: contact.color, fontSize: 13, fontWeight: 700 }}>{contact.initials}</div>
                      {contact.online && <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full" style={{ background: 'var(--primary)', border: '2px solid var(--background)' }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <span style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>{contact.name}</span>
                        <span style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{payment ? payment.time : contact.time}</span>
                      </div>
                      <p style={{ color: payment ? 'var(--primary)' : 'var(--muted-foreground)', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {payment ? `Sent ${payment.amount} ${payment.asset}` : contact.lastMessage}
                      </p>
                    </div>
                  </motion.div>
                  {contact.unread > 0 && !payment && (
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-white" style={{ background: 'var(--primary)', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{contact.unread}</div>
                  )}
                  {payment && <CheckCircle2 size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />}
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => openPayment(contact)} className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(99,102,241,0.15)' }}>
                    <ArrowUpRight size={16} style={{ color: 'var(--primary)' }} />
                  </motion.button>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ height: 100 }} />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="absolute bottom-24 left-1/2 z-50 px-4 py-3 rounded-[14px] flex items-center gap-2"
            style={{ background: 'var(--card)', border: '1px solid var(--primary)', boxShadow: '0 8px 32px rgba(99,102,241,0.3)' }}
          >
            <CheckCircle2 size={16} style={{ color: 'var(--primary)' }} />
            <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Sheet */}
      <AnimatePresence>
        {showPayment && paymentContact && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setShowPayment(false); setShowAssetPicker(false); }} className="absolute inset-0 z-40" style={{ background: 'rgba(0,0,0,0.5)' }} />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 300 }} className="absolute bottom-0 left-0 right-0 z-50 rounded-t-[28px] p-6 pb-8" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderTop: '1px solid rgba(99,102,241,0.2)' }}>
              <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: 'var(--border)' }} />
              <div className="flex items-center justify-between mb-6">
                <h3 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 18 }}>Send Payment</h3>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => { setShowPayment(false); setShowAssetPicker(false); }} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--muted)' }}>
                  <X size={16} style={{ color: 'var(--muted-foreground)' }} />
                </motion.button>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-[14px] mb-4" style={{ background: 'var(--muted)' }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white" style={{ background: paymentContact.color, fontSize: 11, fontWeight: 700 }}>{paymentContact.initials}</div>
                <div>
                  <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13 }}>{paymentContact.name}</p>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>@{paymentContact.username}</p>
                </div>
              </div>

              <div className="rounded-[16px] p-5 mb-4" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 8 }}>Amount</p>
                <div className="flex items-center gap-2">
                  <input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} className="flex-1 bg-transparent outline-none" style={{ color: 'var(--foreground)', fontSize: 32, fontWeight: 800 }} />
                  <button onClick={() => setShowAssetPicker(!showAssetPicker)} className="flex items-center gap-1.5 px-3 py-2 rounded-[12px]" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                    <span style={{ color: selectedAsset.color, fontSize: 16, fontWeight: 700 }}>{selectedAsset.icon}</span>
                    <span style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>{selectedAsset.symbol}</span>
                    <ChevronDown size={14} style={{ color: 'var(--muted-foreground)' }} />
                  </button>
                </div>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 11, marginTop: 8 }}>Balance: {selectedAsset.balance} {selectedAsset.symbol}</p>
              </div>

              <AnimatePresence>
                {showAssetPicker && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-4">
                    <div className="rounded-[14px] overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                      {assets.map(asset => (
                        <button key={asset.symbol} onClick={() => { setSelectedAsset(asset); setShowAssetPicker(false); }} className="flex items-center gap-3 px-4 py-3 w-full" style={{ background: selectedAsset.symbol === asset.symbol ? 'rgba(99,102,241,0.1)' : 'var(--card)', borderBottom: '1px solid var(--border)' }}>
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

              <motion.button whileTap={{ scale: 0.97 }} onClick={sendPayment} disabled={!amount || sending} className="w-full h-[52px] rounded-[16px] flex items-center justify-center gap-2 text-white" style={{ background: amount && !sending ? 'var(--primary)' : 'var(--muted)', fontWeight: 700, fontSize: 16, boxShadow: amount && !sending ? '0 8px 24px rgba(99,102,241,0.4)' : 'none' }}>
                {sending ? (<><Loader size={18} className="animate-spin" />Sending...</>) : (<><ArrowUpRight size={18} />Send {amount || '0'} {selectedAsset.symbol}</>)}
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
