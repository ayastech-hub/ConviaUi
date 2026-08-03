import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft, Search, SlidersHorizontal, MessageCircle, Star, Shield, X,
  CheckCircle2, Loader, Lock, Plus, Clock, History, ListOrdered, TrendingUp,
} from 'lucide-react';
import { otcListings, type Screen } from '../../data/mockData';

interface OTCScreenProps {
  goBack: () => void;
  navigate: (s: Screen) => void;
}

const currencies = ['All', 'NGN', 'KES', 'GHS', 'ZAR'];
const assetFilters = ['All', 'USDT', 'USDC'];
const payMethodsAll = ['Bank Transfer', 'M-Pesa', 'OPay', 'Palmpay', 'MTN MoMo', 'Flutterwave'];

interface OTCOrder {
  id: string;
  seller: { name: string; initials: string; color: string; rating: number; trades: number; online: boolean };
  asset: 'USDT' | 'USDC';
  amount: number;
  rate: number;
  currency: string;
  currencySymbol: string;
  payMethod: string;
  type: 'buy' | 'sell';
  status: 'pending' | 'completed' | 'cancelled';
  time: string;
}

interface CreatedListing {
  id: string;
  asset: 'USDT' | 'USDC';
  type: 'buy' | 'sell';
  amount: number;
  rate: number;
  currency: string;
  currencySymbol: string;
  payMethods: string[];
  minOrder: number;
  maxOrder: number;
  status: 'active' | 'paused';
  time: string;
}

const currencySymbols: Record<string, string> = { NGN: '₦', KES: 'KSh', GHS: 'GH₵', ZAR: 'R' };

const initialOrders: OTCOrder[] = [
  {
    id: 'o1', seller: otcListings[0].seller, asset: 'USDT', amount: 500, rate: 1634,
    currency: 'NGN', currencySymbol: '₦', payMethod: 'Bank Transfer',
    type: 'buy', status: 'completed', time: '2h ago',
  },
  {
    id: 'o2', seller: otcListings[1].seller, asset: 'USDT', amount: 200, rate: 135.20,
    currency: 'KES', currencySymbol: 'KSh', payMethod: 'M-Pesa',
    type: 'buy', status: 'pending', time: '30m ago',
  },
  {
    id: 'o3', seller: otcListings[3].seller, asset: 'USDC', amount: 1000, rate: 1632,
    currency: 'NGN', currencySymbol: '₦', payMethod: 'OPay',
    type: 'sell', status: 'completed', time: '1d ago',
  },
];

export function OTCScreen({ goBack, navigate }: OTCScreenProps) {
  const [mainTab, setMainTab] = useState<'browse' | 'create' | 'orders' | 'history'>('browse');
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [selectedCurrency, setSelectedCurrency] = useState('All');
  const [selectedAsset, setSelectedAsset] = useState('All');
  const [amount, setAmount] = useState('');
  const [orders, setOrders] = useState(initialOrders);

  // Create listing state
  const [createType, setCreateType] = useState<'buy' | 'sell'>('sell');
  const [createAsset, setCreateAsset] = useState<'USDT' | 'USDC'>('USDT');
  const [createAmount, setCreateAmount] = useState('');
  const [createRate, setCreateRate] = useState('');
  const [createCurrency, setCreateCurrency] = useState('NGN');
  const [createMin, setCreateMin] = useState('');
  const [createMax, setCreateMax] = useState('');
  const [createPayMethods, setCreatePayMethods] = useState<string[]>(['Bank Transfer']);
  const [creating, setCreating] = useState(false);
  const [createdListings, setCreatedListings] = useState<CreatedListing[]>([]);
  const [toast, setToast] = useState('');

  // Trade modal state
  const [tradeListing, setTradeListing] = useState<typeof otcListings[0] | null>(null);
  const [tradeStep, setTradeStep] = useState<'form' | 'processing' | 'done'>('form');
  const [tradeAmount, setTradeAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const filtered = otcListings.filter(l => {
    if (orderType === 'buy' && l.type !== 'buy') return false;
    if (orderType === 'sell' && l.type !== 'sell') return false;
    if (selectedCurrency !== 'All' && l.currency !== selectedCurrency) return false;
    if (selectedAsset !== 'All' && l.asset !== selectedAsset) return false;
    if (amount) {
      const amt = Number(amount);
      if (amt && (amt < l.minOrder || amt > l.maxOrder)) return false;
    }
    return true;
  });

  const openTrade = (listing: typeof otcListings[0]) => {
    setTradeListing(listing);
    setTradeStep('form');
    setTradeAmount('');
    setPaymentMethod(listing.payMethods[0]);
  };

  const startTrade = () => {
    if (!tradeAmount || !paymentMethod) return;
    setTradeStep('processing');
    setTimeout(() => {
      setTradeStep('done');
      setOrders(prev => [{
        id: 'o' + Date.now(),
        seller: tradeListing!.seller,
        asset: tradeListing!.asset,
        amount: Number(tradeAmount),
        rate: tradeListing!.rate,
        currency: tradeListing!.currency,
        currencySymbol: tradeListing!.currencySymbol,
        payMethod: paymentMethod,
        type: tradeListing!.type === 'buy' ? 'buy' : 'sell',
        status: 'pending',
        time: 'Just now',
      }, ...prev]);
    }, 2500);
  };

  const togglePayMethod = (m: string) => {
    setCreatePayMethods(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  };

  const handleCreateListing = () => {
    if (!createAmount || !createRate || createPayMethods.length === 0) return;
    setCreating(true);
    setTimeout(() => {
      setCreating(false);
      setCreatedListings(prev => [{
        id: 'l' + Date.now(),
        asset: createAsset,
        type: createType,
        amount: Number(createAmount),
        rate: Number(createRate),
        currency: createCurrency,
        currencySymbol: currencySymbols[createCurrency] ?? '$',
        payMethods: createPayMethods,
        minOrder: Number(createMin) || 10,
        maxOrder: Number(createMax) || Number(createAmount),
        status: 'active',
        time: 'Just now',
      }, ...prev]);
      setCreateAmount(''); setCreateRate(''); setCreateMin(''); setCreateMax('');
      showToast('Listing created successfully');
      setMainTab('orders');
    }, 2000);
  };

  const cancelOrder = (id: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'cancelled' } : o));
    showToast('Order cancelled');
  };

  const completeOrder = (id: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'completed' } : o));
    showToast('Order completed');
  };

  const toggleListing = (id: string) => {
    setCreatedListings(prev => prev.map(l => l.id === id ? { ...l, status: l.status === 'active' ? 'paused' : 'active' } : l));
  };

  const deleteListing = (id: string) => {
    setCreatedListings(prev => prev.filter(l => l.id !== id));
    showToast('Listing removed');
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const completedOrders = orders.filter(o => o.status === 'completed');
  const cancelledOrders = orders.filter(o => o.status === 'cancelled');

  const numTrade = Number(tradeAmount);
  const totalCost = tradeListing ? numTrade * tradeListing.rate : 0;
  const withinLimits = tradeListing && numTrade >= tradeListing.minOrder && numTrade <= tradeListing.maxOrder;

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />

      <div className="flex items-center gap-3 px-5 mb-4">
        <motion.button whileTap={{ scale: 0.9 }} onClick={goBack} className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'var(--muted)' }}>
          <ChevronLeft size={20} style={{ color: 'var(--foreground)' }} />
        </motion.button>
        <div>
          <h2 style={{ color: 'var(--foreground)', fontWeight: 800 }}>OTC Marketplace</h2>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Peer-to-Peer trading</p>
        </div>
      </div>

      {/* Main tabs */}
      <div className="px-5 mb-3">
        <div className="flex gap-1 p-1 rounded-[14px]" style={{ background: 'var(--muted)' }}>
          {([
            { id: 'browse', label: 'Browse', icon: Search },
            { id: 'create', label: 'Create', icon: Plus },
            { id: 'orders', label: 'Pending', icon: Clock, badge: pendingOrders.length },
            { id: 'history', label: 'History', icon: History },
          ] as const).map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setMainTab(tab.id)} className="flex-1 py-2 rounded-[10px] flex items-center justify-center gap-1 relative" style={{ background: mainTab === tab.id ? 'var(--card)' : 'transparent', color: mainTab === tab.id ? 'var(--foreground)' : 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}>
                <Icon size={13} />
                {tab.label}
                {'badge' in tab && tab.badge ? (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white" style={{ background: '#EF4444', fontSize: 9, fontWeight: 700 }}>{tab.badge}</span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* BROWSE TAB */}
        {mainTab === 'browse' && (
          <>
            <div className="px-5 mb-3">
              <div className="flex gap-1 p-1 rounded-[14px]" style={{ background: 'var(--muted)' }}>
                {(['buy', 'sell'] as const).map(t => (
                  <button key={t} onClick={() => setOrderType(t)} className="flex-1 py-2 rounded-[10px] capitalize" style={{ background: orderType === t ? (t === 'buy' ? 'var(--primary)' : '#EF4444') : 'transparent', color: orderType === t ? '#FFF' : 'var(--muted-foreground)', fontSize: 13, fontWeight: 700 }}>
                    {t === 'buy' ? 'Buy Crypto' : 'Sell Crypto'}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-5 mb-3">
              <div className="flex items-center gap-2 px-4 py-3 rounded-[14px]" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <Search size={15} style={{ color: 'var(--muted-foreground)' }} />
                <input type="number" placeholder="Enter amount..." value={amount} onChange={e => setAmount(e.target.value)} className="flex-1 bg-transparent outline-none" style={{ color: 'var(--foreground)', fontSize: 14 }} />
                <SlidersHorizontal size={15} style={{ color: 'var(--muted-foreground)' }} />
              </div>
            </div>

            <div className="mb-3">
              <div className="flex gap-2 px-5 overflow-x-auto pb-1">
                {currencies.map(c => (
                  <button key={c} onClick={() => setSelectedCurrency(c)} className="flex-shrink-0 px-3 py-1.5 rounded-full" style={{ background: selectedCurrency === c ? 'var(--primary)' : 'var(--muted)', color: selectedCurrency === c ? '#FFF' : 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}>{c}</button>
                ))}
                <div className="w-px flex-shrink-0 mx-1" style={{ background: 'var(--border)' }} />
                {assetFilters.map(a => (
                  <button key={a} onClick={() => setSelectedAsset(a)} className="flex-shrink-0 px-3 py-1.5 rounded-full" style={{ background: selectedAsset === a ? 'var(--secondary)' : 'var(--muted)', color: selectedAsset === a ? 'var(--primary)' : 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}>{a}</button>
                ))}
              </div>
            </div>

            <div className="px-5 flex flex-col gap-3">
              {filtered.length > 0 ? filtered.map((listing, i) => (
                <motion.div key={listing.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="rounded-[20px] p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ background: listing.seller.color, fontSize: 11, fontWeight: 700 }}>{listing.seller.initials}</div>
                        {listing.seller.online && <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full" style={{ background: 'var(--primary)', border: '2px solid var(--background)' }} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>{listing.seller.name}</span>
                          <Shield size={12} style={{ color: 'var(--primary)' }} />
                        </div>
                        <div className="flex items-center gap-1">
                          <Star size={10} style={{ color: '#F59E0B' }} fill="#F59E0B" />
                          <span style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{listing.seller.rating} · {listing.seller.trades.toLocaleString()} trades</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: listing.type === 'buy' ? 'rgba(99,102,241,0.15)' : 'rgba(239,68,68,0.15)' }}>
                      <span style={{ color: listing.type === 'buy' ? 'var(--primary)' : '#EF4444', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>{listing.type}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div>
                      <p style={{ color: 'var(--muted-foreground)', fontSize: 10 }}>Rate</p>
                      <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>{listing.currencySymbol}{listing.rate.toLocaleString()}</p>
                      <p style={{ color: 'var(--muted-foreground)', fontSize: 10 }}>per {listing.asset}</p>
                    </div>
                    <div>
                      <p style={{ color: 'var(--muted-foreground)', fontSize: 10 }}>Available</p>
                      <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>{listing.amount.toLocaleString()}</p>
                      <p style={{ color: 'var(--muted-foreground)', fontSize: 10 }}>{listing.asset}</p>
                    </div>
                    <div>
                      <p style={{ color: 'var(--muted-foreground)', fontSize: 10 }}>Limits</p>
                      <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>{listing.minOrder}-{listing.maxOrder.toLocaleString()}</p>
                      <p style={{ color: 'var(--muted-foreground)', fontSize: 10 }}>{listing.asset}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap mb-3">
                    {listing.payMethods.map(m => (
                      <span key={m} className="px-2 py-1 rounded-lg" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', fontSize: 11 }}>{m}</span>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <motion.button whileTap={{ scale: 0.97 }} onClick={() => openTrade(listing)} className="flex-1 py-2.5 rounded-[12px] text-white" style={{ background: 'var(--primary)', fontSize: 13, fontWeight: 700 }}>
                      {listing.type === 'buy' ? `Buy ${listing.asset}` : `Sell ${listing.asset}`}
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate('chat')} className="w-10 flex items-center justify-center rounded-[12px]" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
                      <MessageCircle size={16} style={{ color: 'var(--muted-foreground)' }} />
                    </motion.button>
                  </div>
                </motion.div>
              )) : (
                <div className="text-center py-12">
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 14 }}>No listings match your filters</p>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => setMainTab('create')} className="mt-3 px-4 py-2 rounded-xl text-white" style={{ background: 'var(--primary)', fontSize: 13, fontWeight: 700 }}>
                    Create a Listing
                  </motion.button>
                </div>
              )}
            </div>
          </>
        )}

        {/* CREATE TAB */}
        {mainTab === 'create' && (
          <div className="px-5">
            <div className="rounded-[20px] p-5 mb-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 8 }}>Order Type</p>
              <div className="flex gap-1 p-1 rounded-[14px] mb-4" style={{ background: 'var(--muted)' }}>
                {(['buy', 'sell'] as const).map(t => (
                  <button key={t} onClick={() => setCreateType(t)} className="flex-1 py-2 rounded-[10px] capitalize" style={{ background: createType === t ? 'var(--primary)' : 'transparent', color: createType === t ? '#FFF' : 'var(--muted-foreground)', fontSize: 13, fontWeight: 700 }}>
                    {t === 'buy' ? 'I want to buy' : 'I want to sell'}
                  </button>
                ))}
              </div>

              <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 8 }}>Asset</p>
              <div className="flex gap-2 mb-4">
                {(['USDT', 'USDC'] as const).map(a => (
                  <button key={a} onClick={() => setCreateAsset(a)} className="flex-1 py-2.5 rounded-[12px]" style={{ background: createAsset === a ? 'var(--primary)' : 'var(--muted)', color: createAsset === a ? '#FFF' : 'var(--foreground)', fontSize: 14, fontWeight: 700 }}>{a}</button>
                ))}
              </div>

              <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 8 }}>Amount ({createAsset})</p>
              <input type="number" placeholder="0.00" value={createAmount} onChange={e => setCreateAmount(e.target.value)} className="w-full px-4 py-3 rounded-[12px] mb-4 bg-transparent outline-none" style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', fontSize: 18, fontWeight: 700 }} />

              <div className="flex gap-3 mb-4">
                <div className="flex-1">
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 8 }}>Currency</p>
                  <select value={createCurrency} onChange={e => setCreateCurrency(e.target.value)} className="w-full px-3 py-3 rounded-[12px] outline-none" style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', fontSize: 14, fontWeight: 600 }}>
                    {Object.keys(currencySymbols).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex-1">
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 8 }}>Rate per {createAsset}</p>
                  <input type="number" placeholder="0.00" value={createRate} onChange={e => setCreateRate(e.target.value)} className="w-full px-3 py-3 rounded-[12px] bg-transparent outline-none" style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', fontSize: 14, fontWeight: 600 }} />
                </div>
              </div>

              <div className="flex gap-3 mb-4">
                <div className="flex-1">
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 8 }}>Min Order</p>
                  <input type="number" placeholder="10" value={createMin} onChange={e => setCreateMin(e.target.value)} className="w-full px-3 py-3 rounded-[12px] bg-transparent outline-none" style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', fontSize: 14 }} />
                </div>
                <div className="flex-1">
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 8 }}>Max Order</p>
                  <input type="number" placeholder={createAmount || '0'} value={createMax} onChange={e => setCreateMax(e.target.value)} className="w-full px-3 py-3 rounded-[12px] bg-transparent outline-none" style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', fontSize: 14 }} />
                </div>
              </div>

              <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 8 }}>Payment Methods</p>
              <div className="flex gap-2 flex-wrap mb-5">
                {payMethodsAll.map(m => (
                  <button key={m} onClick={() => togglePayMethod(m)} className="px-3 py-1.5 rounded-xl" style={{ background: createPayMethods.includes(m) ? 'var(--primary)' : 'var(--muted)', color: createPayMethods.includes(m) ? '#FFF' : 'var(--muted-foreground)', fontSize: 12, fontWeight: 600, border: `1px solid ${createPayMethods.includes(m) ? 'transparent' : 'var(--border)'}` }}>{m}</button>
                ))}
              </div>

              {createAmount && createRate && (
                <div className="p-3 rounded-[12px] mb-4" style={{ background: 'var(--muted)' }}>
                  <div className="flex justify-between mb-1">
                    <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Total value</span>
                    <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 700 }}>{currencySymbols[createCurrency]}{(Number(createAmount) * Number(createRate)).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>You {createType === 'buy' ? 'pay' : 'receive'}</span>
                    <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 700 }}>{currencySymbols[createCurrency]}{(Number(createAmount) * Number(createRate)).toLocaleString()} {createCurrency}</span>
                  </div>
                </div>
              )}

              <motion.button whileTap={{ scale: 0.97 }} onClick={handleCreateListing} disabled={!createAmount || !createRate || createPayMethods.length === 0 || creating} className="w-full py-3.5 rounded-[16px] text-white flex items-center justify-center gap-2" style={{ background: createAmount && createRate && createPayMethods.length > 0 && !creating ? 'var(--primary)' : 'var(--muted)', fontWeight: 700, fontSize: 15, boxShadow: createAmount && createRate && !creating ? '0 8px 24px rgba(99,102,241,0.4)' : 'none' }}>
                {creating ? <Loader size={18} className="animate-spin" /> : <Plus size={18} />}
                {creating ? 'Creating...' : 'Create Listing'}
              </motion.button>
            </div>

            {/* My active listings */}
            {createdListings.length > 0 && (
              <>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 10, fontWeight: 600 }}>MY ACTIVE LISTINGS</p>
                {createdListings.map(listing => (
                  <div key={listing.id} className="rounded-[16px] p-4 mb-3" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 rounded-lg" style={{ background: listing.type === 'buy' ? 'rgba(99,102,241,0.15)' : 'rgba(239,68,68,0.15)', color: listing.type === 'buy' ? 'var(--primary)' : '#EF4444', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>{listing.type}</span>
                        <span style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>{listing.amount} {listing.asset}</span>
                      </div>
                      <span className="px-2 py-1 rounded-lg" style={{ background: listing.status === 'active' ? 'rgba(16,185,129,0.12)' : 'var(--muted)', color: listing.status === 'active' ? 'var(--primary)' : 'var(--muted-foreground)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>{listing.status}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Rate: {listing.currencySymbol}{listing.rate.toLocaleString()}/{listing.asset}</span>
                      <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Limits: {listing.minOrder}-{listing.maxOrder}</span>
                    </div>
                    <div className="flex gap-2 mb-3">
                      {listing.payMethods.map(m => <span key={m} className="px-2 py-1 rounded-lg" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', fontSize: 11 }}>{m}</span>)}
                    </div>
                    <div className="flex gap-2">
                      <motion.button whileTap={{ scale: 0.95 }} onClick={() => toggleListing(listing.id)} className="flex-1 py-2 rounded-[10px]" style={{ background: 'var(--muted)', color: 'var(--foreground)', fontSize: 12, fontWeight: 600 }}>
                        {listing.status === 'active' ? 'Pause' : 'Activate'}
                      </motion.button>
                      <motion.button whileTap={{ scale: 0.95 }} onClick={() => deleteListing(listing.id)} className="px-3 py-2 rounded-[10px]" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', fontSize: 12, fontWeight: 600 }}>Remove</motion.button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* PENDING ORDERS TAB */}
        {mainTab === 'orders' && (
          <div className="px-5">
            {pendingOrders.length > 0 ? (
              <div className="flex flex-col gap-3">
                {pendingOrders.map(order => (
                  <motion.div key={order.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-[20px] p-4" style={{ background: 'var(--card)', border: '1px solid rgba(245,158,11,0.3)' }}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white" style={{ background: order.seller.color, fontSize: 10, fontWeight: 700 }}>{order.seller.initials}</div>
                        <div>
                          <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13 }}>{order.seller.name}</p>
                          <div className="flex items-center gap-1">
                            <Star size={9} style={{ color: '#F59E0B' }} fill="#F59E0B" />
                            <span style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{order.seller.rating}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: 'rgba(245,158,11,0.15)' }}>
                        <Clock size={11} style={{ color: '#F59E0B' }} />
                        <span style={{ color: '#F59E0B', fontSize: 10, fontWeight: 700 }}>PENDING</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <p style={{ color: 'var(--muted-foreground)', fontSize: 10 }}>Amount</p>
                        <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 16 }}>{order.amount} {order.asset}</p>
                      </div>
                      <div>
                        <p style={{ color: 'var(--muted-foreground)', fontSize: 10 }}>Total</p>
                        <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 16 }}>{order.currencySymbol}{(order.amount * order.rate).toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex justify-between mb-3">
                      <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Payment: {order.payMethod}</span>
                      <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{order.time}</span>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-2 rounded-[10px] mb-3" style={{ background: 'rgba(99,102,241,0.08)' }}>
                      <Lock size={13} style={{ color: 'var(--primary)' }} />
                      <span style={{ color: 'var(--primary)', fontSize: 11, fontWeight: 600 }}>Escrow holds {order.amount} {order.asset}</span>
                    </div>

                    <div className="flex gap-2">
                      <motion.button whileTap={{ scale: 0.97 }} onClick={() => completeOrder(order.id)} className="flex-1 py-2.5 rounded-[12px] text-white" style={{ background: 'var(--primary)', fontSize: 13, fontWeight: 700 }}>
                        Confirm Payment
                      </motion.button>
                      <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate('chat')} className="px-3 py-2.5 rounded-[12px]" style={{ background: 'var(--muted)', color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}>
                        <MessageCircle size={15} />
                      </motion.button>
                      <motion.button whileTap={{ scale: 0.97 }} onClick={() => cancelOrder(order.id)} className="px-3 py-2.5 rounded-[12px]" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', fontSize: 13, fontWeight: 600 }}>Cancel</motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.1)' }}>
                  <Clock size={28} style={{ color: 'var(--primary)' }} />
                </div>
                <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 15 }}>No pending orders</p>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginTop: 4 }}>Active trades will appear here</p>
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => setMainTab('browse')} className="mt-4 px-4 py-2 rounded-xl text-white" style={{ background: 'var(--primary)', fontSize: 13, fontWeight: 700 }}>Browse Listings</motion.button>
              </div>
            )}
          </div>
        )}

        {/* HISTORY TAB */}
        {mainTab === 'history' && (
          <div className="px-5">
            <div className="flex gap-2 mb-4">
              <button className="px-3 py-1.5 rounded-full" style={{ background: 'var(--primary)', color: '#FFF', fontSize: 12, fontWeight: 600 }}>All ({orders.length})</button>
              <button className="px-3 py-1.5 rounded-full" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}>Completed ({completedOrders.length})</button>
              <button className="px-3 py-1.5 rounded-full" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}>Cancelled ({cancelledOrders.length})</button>
            </div>

            {orders.length > 0 ? (
              <div className="flex flex-col gap-2">
                {orders.map(order => (
                  <div key={order.id} className="flex items-center gap-3 p-3.5 rounded-[16px]" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                    <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white" style={{ background: order.seller.color, fontSize: 11, fontWeight: 700 }}>{order.seller.initials}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13 }}>{order.amount} {order.asset}</span>
                        <span style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>·</span>
                        <span style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{order.seller.name}</span>
                      </div>
                      <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{order.currencySymbol}{(order.amount * order.rate).toLocaleString()} · {order.payMethod} · {order.time}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {order.status === 'completed' ? (
                        <><CheckCircle2 size={14} style={{ color: 'var(--primary)' }} /><span style={{ color: 'var(--primary)', fontSize: 11, fontWeight: 600 }}>Done</span></>
                      ) : order.status === 'pending' ? (
                        <><Clock size={14} style={{ color: '#F59E0B' }} /><span style={{ color: '#F59E0B', fontSize: 11, fontWeight: 600 }}>Pending</span></>
                      ) : (
                        <><X size={14} style={{ color: '#EF4444' }} /><span style={{ color: '#EF4444', fontSize: 11, fontWeight: 600 }}>Cancelled</span></>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.1)' }}>
                  <History size={28} style={{ color: 'var(--primary)' }} />
                </div>
                <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 15 }}>No trade history</p>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginTop: 4 }}>Your completed trades will appear here</p>
              </div>
            )}
          </div>
        )}

        <div style={{ height: 32 }} />
      </div>

      {/* Trade modal */}
      <AnimatePresence>
        {tradeListing && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => tradeStep !== 'processing' && setTradeListing(null)} className="absolute inset-0 z-40" style={{ background: 'rgba(0,0,0,0.5)' }} />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 300 }} className="absolute bottom-0 left-0 right-0 z-50 rounded-t-[28px] p-6 pb-8 max-h-[85%] overflow-y-auto" style={{ background: 'var(--card)' }}>
              {tradeStep === 'form' && (
                <>
                  <div className="flex items-center justify-between mb-5">
                    <h3 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 18 }}>{tradeListing.type === 'buy' ? 'Buy' : 'Sell'} {tradeListing.asset}</h3>
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => setTradeListing(null)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--muted)' }}><X size={16} style={{ color: 'var(--muted-foreground)' }} /></motion.button>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-[14px] mb-4" style={{ background: 'var(--muted)' }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ background: tradeListing.seller.color, fontSize: 11, fontWeight: 700 }}>{tradeListing.seller.initials}</div>
                    <div className="flex-1">
                      <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13 }}>{tradeListing.seller.name}</p>
                      <div className="flex items-center gap-1"><Star size={10} style={{ color: '#F59E0B' }} fill="#F59E0B" /><span style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{tradeListing.seller.rating} · {tradeListing.seller.trades} trades</span></div>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: 'rgba(16,185,129,0.12)' }}><Lock size={11} style={{ color: 'var(--primary)' }} /><span style={{ color: 'var(--primary)', fontSize: 10, fontWeight: 600 }}>Escrow</span></div>
                  </div>

                  <div className="rounded-[16px] p-5 mb-4" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 8 }}>Amount ({tradeListing.asset})</p>
                    <input type="number" placeholder="0.00" value={tradeAmount} onChange={e => setTradeAmount(e.target.value)} className="w-full bg-transparent outline-none" style={{ color: 'var(--foreground)', fontSize: 32, fontWeight: 800 }} autoFocus />
                    <div className="flex justify-between mt-2"><span style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>Min: {tradeListing.minOrder} · Max: {tradeListing.maxOrder.toLocaleString()}</span><span style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>Rate: {tradeListing.currencySymbol}{tradeListing.rate.toLocaleString()}</span></div>
                  </div>

                  {tradeAmount && withinLimits && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-[12px] mb-4" style={{ background: 'var(--muted)' }}>
                      <div className="flex justify-between mb-1"><span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>You {tradeListing.type === 'buy' ? 'pay' : 'receive'}</span><span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 700 }}>{tradeListing.currencySymbol}{totalCost.toLocaleString()} {tradeListing.currency}</span></div>
                      <div className="flex justify-between"><span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>You {tradeListing.type === 'buy' ? 'receive' : 'send'}</span><span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 700 }}>{numTrade} {tradeListing.asset}</span></div>
                    </motion.div>
                  )}

                  {tradeAmount && !withinLimits && (
                    <div className="p-3 rounded-[12px] mb-4" style={{ background: 'rgba(239,68,68,0.1)' }}><p style={{ color: '#EF4444', fontSize: 12 }}>Amount must be between {tradeListing.minOrder} and {tradeListing.maxOrder.toLocaleString()} {tradeListing.asset}</p></div>
                  )}

                  <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 8 }}>Payment Method</p>
                  <div className="flex gap-2 flex-wrap mb-4">
                    {tradeListing.payMethods.map(m => (
                      <motion.button key={m} whileTap={{ scale: 0.95 }} onClick={() => setPaymentMethod(m)} className="px-3 py-2 rounded-xl" style={{ background: paymentMethod === m ? 'var(--primary)' : 'var(--muted)', color: paymentMethod === m ? '#FFF' : 'var(--foreground)', fontSize: 13, fontWeight: 600, border: `1px solid ${paymentMethod === m ? 'transparent' : 'var(--border)'}` }}>{m}</motion.button>
                    ))}
                  </div>

                  <motion.button whileTap={{ scale: 0.97 }} onClick={startTrade} disabled={!tradeAmount || !withinLimits} className="w-full py-3.5 rounded-[16px] text-white" style={{ background: tradeAmount && withinLimits ? 'var(--primary)' : 'var(--muted)', fontWeight: 700, fontSize: 15, boxShadow: tradeAmount && withinLimits ? '0 8px 24px rgba(99,102,241,0.4)' : 'none' }}>Start Trade</motion.button>
                </>
              )}

              {tradeStep === 'processing' && (
                <div className="flex flex-col items-center py-12">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.15)' }}><Loader size={40} className="animate-spin" style={{ color: 'var(--primary)' }} /></div>
                  <h3 style={{ color: 'var(--foreground)', fontWeight: 700, marginTop: 20, marginBottom: 4 }}>Creating Trade...</h3>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Escrowing {tradeAmount} {tradeListing.asset}</p>
                </div>
              )}

              {tradeStep === 'done' && (
                <div className="flex flex-col items-center py-8 text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }} className="w-20 h-20 rounded-full flex items-center justify-center mb-5" style={{ background: 'rgba(99,102,241,0.15)' }}><CheckCircle2 size={44} style={{ color: 'var(--primary)' }} /></motion.div>
                  <h2 style={{ color: 'var(--foreground)', fontWeight: 800, marginBottom: 4 }}>Trade Created!</h2>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 14, marginBottom: 6 }}>{numTrade} {tradeListing.asset} escrowed</p>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginBottom: 20 }}>Pay {tradeListing.currencySymbol}{totalCost.toLocaleString()} {tradeListing.currency} via {paymentMethod}</p>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-4" style={{ background: 'rgba(245,158,11,0.1)' }}><Lock size={14} style={{ color: '#F59E0B' }} /><span style={{ color: '#F59E0B', fontSize: 12, fontWeight: 600 }}>Crypto is held in escrow until you confirm payment</span></div>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setTradeListing(null); setMainTab('orders'); }} className="w-full py-3.5 rounded-[16px] text-white mb-2" style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 15 }}>View Pending Orders</motion.button>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate('chat')} className="w-full py-3.5 rounded-[16px]" style={{ background: 'var(--muted)', color: 'var(--foreground)', fontWeight: 600, fontSize: 15 }}>Chat with Seller</motion.button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 20, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: 20, x: '-50%' }} className="absolute bottom-8 left-1/2 z-50 px-4 py-3 rounded-[14px] flex items-center gap-2" style={{ background: 'var(--card)', border: '1px solid var(--primary)', boxShadow: '0 8px 32px rgba(99,102,241,0.3)' }}>
            <CheckCircle2 size={16} style={{ color: 'var(--primary)' }} />
            <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
