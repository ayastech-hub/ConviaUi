import React, { useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft, Search, SlidersHorizontal, MessageSquare, Star, Shield, X,
  CheckCircle2, Clock, Lock, Upload, Flag, AlertTriangle, ArrowLeft,
  Send, Paperclip, ShieldCheck, Wallet, TrendingUp, TrendingDown, Filter, ChevronDown,
  FileText, MessageCircle, Dot, Loader, ArrowRight, Plus, Zap, BarChart3,
  Users, Globe, ChevronRight, Sparkles,
} from 'lucide-react';
import { otcListings, type OTCListing, type Screen } from '../../../shared/data/mockData';

interface OTCScreenProps {
  goBack: () => void;
  navigate: (s: Screen) => void;
}

const CURRENCIES = ['All', 'NGN', 'KES', 'GHS', 'ZAR'] as const;
const PAYMENT_METHODS = [
  'All Methods', 'Bank Transfer', 'M-Pesa', 'OPay', 'Palmpay',
  'MTN MoMo', 'Flutterwave',
] as const;
const AMOUNT_RANGES = [
  { id: 'any', label: 'Any Amount', min: 0, max: Infinity },
  { id: 'small', label: '≤ 500', min: 0, max: 500 },
  { id: 'mid', label: '500 – 2K', min: 500, max: 2000 },
  { id: 'large', label: '2K – 10K', min: 2000, max: 10000 },
  { id: 'xl', label: '10K+', min: 10000, max: Infinity },
] as const;

const DISPUTE_CATEGORIES = [
  'Payment Not Received',
  'Wrong Amount',
  'Seller Unresponsive',
  'Fraud Suspected',
  'Other',
] as const;

type EscrowStage = 0 | 1 | 2 | 3;
const ESCROW_STAGES = [
  { id: 0, label: 'Payment Pending', icon: Clock, color: 'var(--warning)' },
  { id: 1, label: 'Payment Made', icon: CheckCircle2, color: 'var(--primary)' },
  { id: 2, label: 'Crypto Released', icon: ShieldCheck, color: 'var(--primary)' },
  { id: 3, label: 'Completed', icon: CheckCircle2, color: 'var(--positive)' },
] as const;

type TradeStatus = 'pending' | 'payment_made' | 'released' | 'completed' | 'disputed' | 'cancelled';

type MerchantStatus = 'none' | 'pending' | 'approved';

interface MerchantApplication {
  businessName: string;
  country: string;
  volume: string;
  paymentMethods: string[];
  docName: string | null;
  submittedAt: string;
  status: 'pending' | 'approved';
}

interface ChatMessage {
  id: string;
  from: 'me' | 'seller';
  text: string;
  time: string;
}

interface ActiveTrade {
  id: string;
  listing: OTCListing;
  amount: number;
  total: number;
  payMethod: string;
  status: TradeStatus;
  escrowStage: EscrowStage;
  createdAt: string;
  stageTimestamps: Record<number, string | null>;
  chat: ChatMessage[];
  dispute?: { caseNumber: string; category: string; description: string; evidence: string[]; filedAt: string } | null;
}

const nowTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const stageFromStatus = (s: TradeStatus): EscrowStage => { switch (s) { case 'pending': return 0; case 'payment_made': return 1; case 'released': return 2; case 'completed': return 3; default: return 0; } };
const fmtNum = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 2 });

const seedTrades: ActiveTrade[] = [
  {
    id: 'tr-1001', listing: otcListings[1], amount: 200, total: 200 * otcListings[1].rate,
    payMethod: 'M-Pesa', status: 'payment_made', escrowStage: 1, createdAt: 'Today, 09:12',
    stageTimestamps: { 0: '09:12', 1: '09:24', 2: null, 3: null },
    chat: [
      { id: 'm1', from: 'seller', text: 'Hello! I see your order for 200 USDT. Ready when you are.', time: '09:13' },
      { id: 'm2', from: 'me', text: 'Sending via M-Pesa now, one moment.', time: '09:20' },
      { id: 'm3', from: 'seller', text: 'Got it, thanks. Confirming receipt.', time: '09:24' },
    ],
  },
  {
    id: 'tr-1002', listing: otcListings[3], amount: 500, total: 500 * otcListings[3].rate,
    payMethod: 'Bank Transfer', status: 'pending', escrowStage: 0, createdAt: 'Today, 10:45',
    stageTimestamps: { 0: '10:45', 1: null, 2: null, 3: null },
    chat: [{ id: 'm1', from: 'seller', text: 'Order received. Awaiting your bank transfer.', time: '10:46' }],
  },
];

export function OTCScreen({ goBack, navigate }: OTCScreenProps) {
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [currency, setCurrency] = useState<string>('All');
  const [payMethod, setPayMethod] = useState<string>('All Methods');
  const [rangeId, setRangeId] = useState<string>('any');
  const [searchAmount, setSearchAmount] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [view, setView] = useState<'browse' | 'trade' | 'active'>('browse');
  const [activeTradeListing, setActiveTradeListing] = useState<OTCListing | null>(null);
  const [tradeAmount, setTradeAmount] = useState('');
  const [tradePayMethod, setTradePayMethod] = useState('');
  const [tradeStep, setTradeStep] = useState<'form' | 'processing' | 'active'>('form');
  const [trades, setTrades] = useState<ActiveTrade[]>(seedTrades);
  const [selectedTradeId, setSelectedTradeId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [disputeCategory, setDisputeCategory] = useState<string>(DISPUTE_CATEGORIES[0]);
  const [disputeDesc, setDisputeDesc] = useState('');
  const [disputeEvidence, setDisputeEvidence] = useState<string[]>([]);
  const [disputeSubmitting, setDisputeSubmitting] = useState(false);
  const [disputeFiled, setDisputeFiled] = useState<{ caseNumber: string; eta: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [toast, setToast] = useState('');
  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(''), 2600); };
  const [otcTab, setOtcTab] = useState<'listings' | 'active' | 'orders' | 'disputes' | 'profile'>('listings');
  const [showCreateListing, setShowCreateListing] = useState(false);
  const [userListings, setUserListings] = useState<OTCListing[]>([]);
  const [merchantStatus, setMerchantStatus] = useState<MerchantStatus>('none');
  const [showMerchantApp, setShowMerchantApp] = useState(false);
  const [merchantApp, setMerchantApp] = useState<MerchantApplication | null>(null);

  const selectedTrade = useMemo(() => trades.find(t => t.id === selectedTradeId) ?? null, [trades, selectedTradeId]);



  const tradeNum = Number(tradeAmount);
  const tradeTotal = activeTradeListing ? tradeNum * activeTradeListing.rate : 0;
  const tradeWithin = activeTradeListing ? tradeNum >= activeTradeListing.minOrder && tradeNum <= activeTradeListing.maxOrder : false;

  const openTrade = (listing: OTCListing) => {
    setActiveTradeListing(listing); setTradeAmount(''); setTradePayMethod(listing.payMethods[0]); setTradeStep('form'); setView('trade');
  };

  const startTrade = () => {
    if (!activeTradeListing || !tradeAmount || !tradePayMethod || !tradeWithin) return;
    setTradeStep('processing');
    const listing = activeTradeListing; const amt = tradeNum; const total = amt * listing.rate;
    setTimeout(() => {
      const newTrade: ActiveTrade = {
        id: 'tr-' + Date.now(), listing, amount: amt, total, payMethod: tradePayMethod,
        status: 'pending', escrowStage: 0, createdAt: 'Today, ' + nowTime(),
        stageTimestamps: { 0: nowTime(), 1: null, 2: null, 3: null },
        chat: [{ id: 'm' + Date.now(), from: 'seller', text: `Hi! I've escrowed ${amt} ${listing.asset}. Please make payment via ${tradePayMethod} and confirm here.`, time: nowTime() }],
      };
      setTrades(prev => [newTrade, ...prev]); setSelectedTradeId(newTrade.id); setTradeStep('active'); showToast('Trade created — crypto in escrow');
    }, 2200);
  };

  const markPaymentMade = (id: string) => {
    setTrades(prev => prev.map(t => t.id === id ? { ...t, status: 'payment_made', escrowStage: 1, stageTimestamps: { ...t.stageTimestamps, 1: nowTime() }, chat: [...t.chat, { id: 'm' + Date.now(), from: 'me', text: 'Payment made. Please confirm and release.', time: nowTime() }] } : t));
    showToast('Payment marked as made');
  };
  const releaseCrypto = (id: string) => {
    setTrades(prev => prev.map(t => t.id === id ? { ...t, status: 'released', escrowStage: 2, stageTimestamps: { ...t.stageTimestamps, 2: nowTime() }, chat: [...t.chat, { id: 'm' + Date.now(), from: 'seller', text: 'Payment confirmed. Releasing crypto from escrow now.', time: nowTime() }] } : t));
    showToast('Crypto released from escrow');
  };
  const completeTrade = (id: string) => {
    setTrades(prev => prev.map(t => t.id === id ? { ...t, status: 'completed', escrowStage: 3, stageTimestamps: { ...t.stageTimestamps, 3: nowTime() } } : t));
    showToast('Trade completed');
  };
  const cancelTrade = (id: string) => { setTrades(prev => prev.map(t => t.id === id ? { ...t, status: 'cancelled' } : t)); showToast('Trade cancelled'); };

  const sendChat = () => {
    if (!chatInput.trim() || !selectedTrade) return;
    const msg: ChatMessage = { id: 'm' + Date.now(), from: 'me', text: chatInput.trim(), time: nowTime() };
    setTrades(prev => prev.map(t => t.id === selectedTrade.id ? { ...t, chat: [...t.chat, msg] } : t));
    setChatInput('');
    setTimeout(() => {
      const reply: ChatMessage = { id: 'm' + (Date.now() + 1), from: 'seller', text: "Thanks for the update. I'll action this shortly.", time: nowTime() };
      setTrades(prev => prev.map(t => t.id === selectedTrade.id ? { ...t, chat: [...t.chat, reply] } : t));
    }, 1600);
  };

  const openDispute = () => { setDisputeCategory(DISPUTE_CATEGORIES[0]); setDisputeDesc(''); setDisputeEvidence([]); setDisputeFiled(null); setDisputeOpen(true); };
  const handleEvidencePick = () => {
    const names = ['payment-screenshot.png', 'bank-receipt.pdf', 'chat-log.txt'];
    setDisputeEvidence(prev => [...prev, names[disputeEvidence.length % names.length]]);
  };
  const submitDispute = () => {
    if (!selectedTrade) return;
    setDisputeSubmitting(true);
    setTimeout(() => {
      const caseNumber = 'CNV-DSP-' + Math.floor(100000 + Math.random() * 900000);
      setDisputeSubmitting(false); setDisputeFiled({ caseNumber, eta: '24 hours' });
      setTrades(prev => prev.map(t => t.id === selectedTrade.id ? { ...t, status: 'disputed', dispute: { caseNumber, category: disputeCategory, description: disputeDesc, evidence: disputeEvidence, filedAt: nowTime() } } : t));
      showToast('Dispute submitted to admin');
    }, 1800);
  };

  const activeTrades = trades.filter(t => t.status !== 'cancelled' && t.status !== 'completed');
  const completedTrades = trades.filter(t => t.status === 'completed');
  const disputedTrades = trades.filter(t => t.status === 'disputed');
  const allOrders = trades.filter(t => t.status === 'completed' || t.status === 'cancelled');

  const totalVolume = otcListings.reduce((s, l) => s + l.amount * l.rate, 0);

  const allListings = useMemo(() => [...userListings, ...otcListings], [userListings]);
  const filteredListings = useMemo(() => {
    const range = AMOUNT_RANGES.find(r => r.id === rangeId) ?? AMOUNT_RANGES[0];
    const amt = Number(searchAmount);
    return allListings.filter(l => {
      if (l.type !== orderType) return false;
      if (currency !== 'All' && l.currency !== currency) return false;
      if (payMethod !== 'All Methods' && !l.payMethods.includes(payMethod)) return false;
      if (amt) { if (amt < l.minOrder || amt > l.maxOrder) return false; }
      else { if (l.maxOrder < range.min || l.minOrder > range.max) return false; }
      return true;
    });
  }, [allListings, orderType, currency, payMethod, rangeId, searchAmount]);

  return (
    <div className="flex flex-col h-full relative" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />

      {/* Header */}
      <div className="flex items-center gap-3 px-5 mb-4">
        <motion.button whileTap={{ scale: 0.9 }} onClick={view === 'browse' ? goBack : () => { setView('browse'); setSelectedTradeId(null); setActiveTradeListing(null); }} className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'var(--muted)' }}>
          <ChevronLeft size={20} style={{ color: 'var(--foreground)' }} />
        </motion.button>
        <div className="flex-1">
          <h2 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 18 }}>
            {view === 'browse' && 'OTC Marketplace'}
            {view === 'trade' && (tradeStep === 'active' ? 'Active Trade' : 'Start Trade')}
          </h2>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
            {view === 'browse' && 'Peer-to-peer crypto trading'}
            {view === 'trade' && 'Escrow-protected transaction'}
          </p>
        </div>
        {view === 'browse' && (
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setOtcTab('active')} className="relative w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'var(--muted)' }}>
            <Wallet size={18} style={{ color: 'var(--foreground)' }} />
            {activeTrades.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: 'var(--primary)', color: '#fff', fontSize: 9, fontWeight: 700 }}>{activeTrades.length}</span>}
          </motion.button>
        )}
      </div>

      {/* BROWSE VIEW (with tabs) */}
      {view === 'browse' && (
        <div className="flex-1 overflow-y-auto">
          {otcTab === 'listings' && (<>
          {/* Hero stats bar */}
          <div className="px-5 mb-4">
            <div className="rounded-[20px] p-4 flex items-center justify-between" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--primary)' }}>
                  <BarChart3 size={20} className="text-white" />
                </div>
                <div>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>24h Volume</p>
                  <p style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 16 }}>${(totalVolume / 1000).toFixed(1)}K+</p>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: 'var(--muted)' }}>
                  <Shield size={11} style={{ color: 'var(--positive)' }} />
                  <span style={{ color: 'var(--positive)', fontSize: 10, fontWeight: 700 }}>ESCROW</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: 'var(--muted)' }}>
                  <Users size={11} style={{ color: 'var(--foreground)' }} />
                  <span style={{ color: 'var(--foreground)', fontSize: 10, fontWeight: 700 }}>12.4K USERS</span>
                </div>
              </div>
            </div>
          </div>

          {/* Buy/Sell toggle + Create Listing */}
          <div className="px-5 mb-3 flex items-center gap-2">
            <div className="flex gap-1 p-1 rounded-[16px] flex-1" style={{ background: 'var(--muted)' }}>
              {(['buy', 'sell'] as const).map(t => (
                <button key={t} onClick={() => setOrderType(t)} className="flex-1 py-3 rounded-[12px] flex items-center justify-center gap-2 transition-all" style={{ background: orderType === t ? (t === 'buy' ? 'var(--primary)' : 'var(--destructive)') : 'transparent', color: orderType === t ? '#FFF' : 'var(--muted-foreground)', fontSize: 14, fontWeight: 700 }}>
                  {t === 'buy' ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
                  {t === 'buy' ? 'Buy' : 'Sell'} Crypto
                </button>
              ))}
            </div>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowCreateListing(true)} className="w-12 h-12 rounded-[16px] flex items-center justify-center flex-shrink-0" style={{ background: 'var(--primary)' }}>
              <Plus size={22} className="text-white" />
            </motion.button>
          </div>

          {/* Search + filter */}
          <div className="px-5 mb-3">
            <div className="flex items-center gap-2 px-4 py-3 rounded-[14px] mb-2" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <Search size={15} style={{ color: 'var(--muted-foreground)' }} />
              <input type="number" placeholder="Search by amount..." value={searchAmount} onChange={e => setSearchAmount(e.target.value)} className="flex-1 bg-transparent outline-none" style={{ color: 'var(--foreground)', fontSize: 14 }} />
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowFilters(s => !s)}>
                <SlidersHorizontal size={15} style={{ color: showFilters ? 'var(--primary)' : 'var(--muted-foreground)' }} />
              </motion.button>
            </div>

            {showFilters && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="overflow-hidden">
                <div className="rounded-[14px] p-4 flex flex-col gap-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                  <div>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600, marginBottom: 8 }}>CURRENCY</p>
                    <div className="flex gap-2 flex-wrap">{CURRENCIES.map(c => <button key={c} onClick={() => setCurrency(c)} className="px-3 py-1.5 rounded-full" style={{ background: currency === c ? 'var(--primary)' : 'var(--muted)', color: currency === c ? '#FFF' : 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}>{c}</button>)}</div>
                  </div>
                  <div>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600, marginBottom: 8 }}>PAYMENT METHOD</p>
                    <div className="flex gap-2 flex-wrap">{PAYMENT_METHODS.map(m => <button key={m} onClick={() => setPayMethod(m)} className="px-3 py-1.5 rounded-full" style={{ background: payMethod === m ? 'var(--primary)' : 'var(--muted)', color: payMethod === m ? '#FFF' : 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}>{m}</button>)}</div>
                  </div>
                  <div>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600, marginBottom: 8 }}>AMOUNT RANGE</p>
                    <div className="flex gap-2 flex-wrap">{AMOUNT_RANGES.map(r => <button key={r.id} onClick={() => setRangeId(r.id)} className="px-3 py-1.5 rounded-full" style={{ background: rangeId === r.id ? 'var(--primary)' : 'var(--muted)', color: rangeId === r.id ? '#FFF' : 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}>{r.label}</button>)}</div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Results */}
          <div className="px-5 mb-2 flex items-center justify-between">
            <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{filteredListings.length} {orderType} listing{filteredListings.length === 1 ? '' : 's'}</p>
            <div className="flex items-center gap-1" style={{ color: 'var(--positive)', fontSize: 11, fontWeight: 600 }}><Shield size={12} /> Escrow Protected</div>
          </div>

          {/* Listing cards */}
          <div className="px-5 flex flex-col gap-3">
            {filteredListings.length > 0 ? filteredListings.map((listing, i) => (
              <motion.div key={listing.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="rounded-[20px] overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                {/* Top: seller + price */}
                <div className="p-4 pb-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ background: listing.seller.color, fontSize: 11, fontWeight: 700 }}>{listing.seller.initials}</div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full" style={{ background: listing.seller.online ? 'var(--positive)' : 'var(--muted-foreground)', border: '2px solid var(--card)' }} />
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <span style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 13 }}>{listing.seller.name}</span>
                          <ShieldCheck size={12} style={{ color: 'var(--primary)' }} />
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="flex">{[1, 2, 3, 4, 5].map(n => <Star key={n} size={9} style={{ color: 'var(--muted-foreground)' }} fill={n <= Math.round(listing.seller.rating) ? 'var(--muted-foreground)' : 'none'} />)}</div>
                          <span style={{ color: 'var(--muted-foreground)', fontSize: 10 }}>{listing.seller.rating} · {listing.seller.trades.toLocaleString()} trades</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 18 }}>{listing.currencySymbol}{fmtNum(listing.rate)}</p>
                      <p style={{ color: 'var(--muted-foreground)', fontSize: 10 }}>per {listing.asset}</p>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="flex items-center gap-3 py-2.5 px-3 rounded-[12px]" style={{ background: 'var(--muted)' }}>
                    <div className="flex-1">
                      <p style={{ color: 'var(--muted-foreground)', fontSize: 9 }}>AVAILABLE</p>
                      <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 13 }}>{fmtNum(listing.amount)} <span style={{ fontSize: 10, fontWeight: 500 }}>{listing.asset}</span></p>
                    </div>
                    <div className="w-px h-8" style={{ background: 'var(--border)' }} />
                    <div className="flex-1">
                      <p style={{ color: 'var(--muted-foreground)', fontSize: 9 }}>LIMITS</p>
                      <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 13 }}>{listing.minOrder}–{fmtNum(listing.maxOrder)}</p>
                    </div>
                    <div className="w-px h-8" style={{ background: 'var(--border)' }} />
                    <div className="flex-1">
                      <p style={{ color: 'var(--muted-foreground)', fontSize: 9 }}>STATUS</p>
                      <p style={{ color: listing.seller.online ? 'var(--positive)' : 'var(--muted-foreground)', fontWeight: 700, fontSize: 13 }}>{listing.seller.online ? 'Online' : 'Offline'}</p>
                    </div>
                  </div>
                </div>

                {/* Payment methods */}
                <div className="px-4 pb-3 flex gap-1.5 flex-wrap">
                  {listing.payMethods.map(m => <span key={m} className="px-2 py-1 rounded-lg flex items-center gap-1" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', fontSize: 10, fontWeight: 500 }}><Wallet size={9} /> {m}</span>)}
                </div>

                {/* CTA */}
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => openTrade(listing)} className="w-full py-3.5 flex items-center justify-center gap-2 text-white" style={{ background: orderType === 'buy' ? 'var(--primary)' : 'var(--destructive)', fontSize: 14, fontWeight: 700 }}>
                  {orderType === 'buy' ? 'Buy' : 'Sell'} {listing.asset} <ArrowRight size={15} />
                </motion.button>
              </motion.div>
            )) : (
              <div className="text-center py-16">
                <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: 'var(--muted)' }}><Search size={26} style={{ color: 'var(--foreground)' }} /></div>
                <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 15 }}>No listings match your filters</p>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginTop: 4 }}>Try adjusting currency, payment method, or amount</p>
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setCurrency('All'); setPayMethod('All Methods'); setRangeId('any'); setSearchAmount(''); }} className="mt-4 px-4 py-2 rounded-xl text-white" style={{ background: 'var(--primary)', fontSize: 13, fontWeight: 700 }}>Reset Filters</motion.button>
              </div>
            )}
          </div>
          <div style={{ height: 32 }} />
        </>
      )}

      {otcTab === 'active' && (
        <div className="flex-1 overflow-y-auto px-5">
              {activeTrades.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {activeTrades.map((t, i) => (
                    <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-[18px] p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ background: t.listing.seller.color, fontSize: 11, fontWeight: 700 }}>{t.listing.seller.initials}</div>
                          <div><p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13 }}>{t.listing.seller.name}</p><p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{t.createdAt}</p></div>
                        </div>
                        <StatusPill status={t.status} />
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div><p style={{ color: 'var(--muted-foreground)', fontSize: 10 }}>Amount</p><p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>{fmtNum(t.amount)} {t.listing.asset}</p></div>
                        <div><p style={{ color: 'var(--muted-foreground)', fontSize: 10 }}>Total</p><p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>{t.listing.currencySymbol}{fmtNum(t.total)}</p></div>
                      </div>
                      <MiniEscrowTracker stage={t.escrowStage} timestamps={t.stageTimestamps} />
                      <div className="flex gap-2 mt-3">
                        <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setSelectedTradeId(t.id); setActiveTradeListing(t.listing); setTradeStep('active'); setView('trade'); }} className="flex-1 py-2.5 rounded-[12px] text-white" style={{ background: 'var(--primary)', fontSize: 13, fontWeight: 700 }}>Open Trade</motion.button>
                        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate('chat')} className="w-11 flex items-center justify-center rounded-[12px]" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}><MessageCircle size={16} style={{ color: 'var(--muted-foreground)' }} /></motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: 'var(--muted)' }}><Clock size={28} style={{ color: 'var(--foreground)' }} /></div>
                  <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 15 }}>No active trades</p>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginTop: 4 }}>In-progress trades will appear here</p>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => setOtcTab('listings')} className="mt-4 px-4 py-2 rounded-xl text-white" style={{ background: 'var(--primary)', fontSize: 13, fontWeight: 700 }}>Browse Listings</motion.button>
                </div>
              )}
              <div style={{ height: 32 }} />
            </div>
          )}

          {otcTab === 'orders' && (
            <div className="flex-1 overflow-y-auto px-5">
              {allOrders.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {allOrders.map(t => (
                    <div key={t.id} className="rounded-[16px] p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white" style={{ background: t.listing.seller.color, fontSize: 10, fontWeight: 700 }}>{t.listing.seller.initials}</div>
                          <div><p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13 }}>{t.listing.seller.name}</p><p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{t.createdAt}</p></div>
                        </div>
                        <StatusPill status={t.status} />
                      </div>
                      <div className="flex justify-between"><span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{fmtNum(t.amount)} {t.listing.asset}</span><span style={{ color: 'var(--foreground)', fontSize: 12, fontWeight: 600 }}>{t.listing.currencySymbol}{fmtNum(t.total)}</span></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: 'var(--muted)' }}><FileText size={28} style={{ color: 'var(--foreground)' }} /></div>
                  <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 15 }}>No order history</p>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginTop: 4 }}>Completed and cancelled orders will appear here</p>
                </div>
              )}
              <div style={{ height: 32 }} />
            </div>
          )}

          {otcTab === 'disputes' && (
            <div className="flex-1 overflow-y-auto px-5">
              {disputedTrades.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {disputedTrades.map(t => (
                    <div key={t.id} className="rounded-[16px] p-4" style={{ background: 'var(--card)', border: '1px solid var(--destructive)' }}>
                      <div className="flex items-center gap-2 mb-3"><AlertTriangle size={16} style={{ color: 'var(--destructive)' }} /><span style={{ color: 'var(--destructive)', fontSize: 13, fontWeight: 700 }}>Dispute Filed</span></div>
                      <div className="flex justify-between mb-2"><span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Case</span><span style={{ color: 'var(--foreground)', fontSize: 12, fontWeight: 700, fontFamily: 'monospace' }}>{t.dispute?.caseNumber}</span></div>
                      <div className="flex justify-between mb-2"><span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Category</span><span style={{ color: 'var(--foreground)', fontSize: 12 }}>{t.dispute?.category}</span></div>
                      <div className="flex justify-between mb-2"><span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Trade</span><span style={{ color: 'var(--foreground)', fontSize: 12 }}>{fmtNum(t.amount)} {t.listing.asset}</span></div>
                      <div className="flex justify-between"><span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Filed</span><span style={{ color: 'var(--foreground)', fontSize: 12 }}>{t.dispute?.filedAt}</span></div>
                      <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setSelectedTradeId(t.id); setActiveTradeListing(t.listing); setTradeStep('active'); setView('trade'); }} className="w-full py-2.5 rounded-[12px] text-white mt-3" style={{ background: 'var(--primary)', fontSize: 13, fontWeight: 700 }}>View Trade</motion.button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: 'var(--muted)' }}><Shield size={28} style={{ color: 'var(--foreground)' }} /></div>
                  <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 15 }}>No disputes</p>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginTop: 4 }}>Active disputes will appear here</p>
                </div>
              )}
              <div style={{ height: 32 }} />
            </div>
          )}

          {otcTab === 'profile' && (
            <div className="flex-1 overflow-y-auto px-5">
              <div className="flex flex-col items-center py-6">
                <div className="w-20 h-20 rounded-full flex items-center justify-center text-white mb-3" style={{ background: 'var(--primary)', fontSize: 24, fontWeight: 800 }}>CN</div>
                <p style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 18 }}>Convia User</p>
                <div className="flex items-center gap-1 mt-1"><Star size={12} style={{ color: 'var(--muted-foreground)' }} fill="var(--muted-foreground)" /><span style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}>4.9 · 127 trades</span></div>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="rounded-[14px] p-3 text-center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}><p style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 20 }}>{completedTrades.length}</p><p style={{ color: 'var(--muted-foreground)', fontSize: 10 }}>Completed</p></div>
                <div className="rounded-[14px] p-3 text-center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}><p style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 20 }}>{activeTrades.length}</p><p style={{ color: 'var(--muted-foreground)', fontSize: 10 }}>Active</p></div>
                <div className="rounded-[14px] p-3 text-center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}><p style={{ color: 'var(--destructive)', fontWeight: 800, fontSize: 20 }}>{disputedTrades.length}</p><p style={{ color: 'var(--muted-foreground)', fontSize: 10 }}>Disputes</p></div>
              </div>
              <div className="rounded-[16px] p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600, marginBottom: 10 }}>VERIFICATION</p>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between"><span style={{ color: 'var(--foreground)', fontSize: 13 }}>Identity Verified</span><div className="flex items-center gap-1"><CheckCircle2 size={14} style={{ color: 'var(--positive)' }} /><span style={{ color: 'var(--positive)', fontSize: 12, fontWeight: 600 }}>Verified</span></div></div>
                  <div className="flex items-center justify-between"><span style={{ color: 'var(--foreground)', fontSize: 13 }}>Phone</span><div className="flex items-center gap-1"><CheckCircle2 size={14} style={{ color: 'var(--positive)' }} /><span style={{ color: 'var(--positive)', fontSize: 12, fontWeight: 600 }}>Verified</span></div></div>
                  <div className="flex items-center justify-between"><span style={{ color: 'var(--foreground)', fontSize: 13 }}>KYC Level 2</span><div className="flex items-center gap-1"><Clock size={14} style={{ color: 'var(--warning)' }} /><span style={{ color: 'var(--warning)', fontSize: 12, fontWeight: 600 }}>Pending</span></div></div>
                </div>
              </div>
              {/* Merchant status / application */}
              <div className="rounded-[16px] p-4 mb-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--primary)' }}>
                    <Sparkles size={17} className="text-white" />
                  </div>
                  <div>
                    <p style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 15 }}>Merchant Account</p>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>List your own offers and earn fees</p>
                  </div>
                </div>
                {merchantStatus === 'none' && (
                  <>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 12, lineHeight: 1.5 }}>Become a verified merchant to create OTC listings, set custom rates, and trade at higher volumes with lower fees.</p>
                    <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowMerchantApp(true)} className="w-full py-3 rounded-[14px] text-white flex items-center justify-center gap-2" style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 14 }}>
                      <Shield size={16} /> Apply for Merchant
                    </motion.button>
                  </>
                )}
                {merchantStatus === 'pending' && merchantApp && (
                  <div className="flex items-center gap-3 p-3 rounded-[12px]" style={{ background: 'var(--muted)' }}>
                    <Clock size={18} style={{ color: 'var(--warning)' }} />
                    <div className="flex-1">
                      <p style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 700 }}>Application Under Review</p>
                      <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>Submitted {merchantApp.submittedAt} · We'll notify you within 48h</p>
                    </div>
                  </div>
                )}
                {merchantStatus === 'approved' && (
                  <div className="flex items-center gap-3 p-3 rounded-[12px]" style={{ background: 'var(--muted)' }}>
                    <CheckCircle2 size={18} style={{ color: 'var(--positive)' }} />
                    <div className="flex-1">
                      <p style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 700 }}>Verified Merchant</p>
                      <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>You can create listings with custom rates</p>
                    </div>
                  </div>
                )}
              </div>

              {/* My Listings */}
              {userListings.length > 0 && (
                <div className="mb-4">
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600, marginBottom: 10 }}>MY LISTINGS</p>
                  <div className="flex flex-col gap-2">
                    {userListings.map(l => (
                      <div key={l.id} className="rounded-[14px] p-3 flex items-center gap-3" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: l.type === 'buy' ? 'var(--positive)' : 'var(--destructive)' }}>
                          {l.type === 'buy' ? <TrendingDown size={16} className="text-white" /> : <TrendingUp size={16} className="text-white" />}
                        </div>
                        <div className="flex-1">
                          <p style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 700 }}>{l.type === 'buy' ? 'Buy' : 'Sell'} {l.asset}</p>
                          <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{l.currencySymbol}{fmtNum(l.rate)} · {fmtNum(l.amount)} {l.asset} available</p>
                        </div>
                        <button onClick={() => setUserListings(prev => prev.filter(x => x.id !== l.id))} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--muted)' }}>
                          <X size={14} style={{ color: 'var(--muted-foreground)' }} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ height: 32 }} />
            </div>
          )}
        </div>
      )}

      {/* OTC TAB BAR */}
      {view === 'browse' && (
        <div className="flex gap-1 px-3 py-2" style={{ borderTop: '1px solid var(--border)', background: 'var(--card)' }}>
          {([
            { id: 'listings', label: 'Listings', icon: BarChart3 },
            { id: 'active', label: 'Active', icon: Clock, badge: activeTrades.length },
            { id: 'orders', label: 'Orders', icon: FileText },
            { id: 'disputes', label: 'Disputes', icon: AlertTriangle, badge: disputedTrades.length },
            { id: 'profile', label: 'Profile', icon: Users },
          ] as const).map(tab => {
            const Icon = tab.icon;
            const active = otcTab === tab.id;
            return (
              <motion.button key={tab.id} whileTap={{ scale: 0.95 }} onClick={() => setOtcTab(tab.id)} className="flex-1 flex flex-col items-center gap-1 py-2 relative" style={{ opacity: active ? 1 : 0.5 }}>
                <div className="relative">
                  <Icon size={18} style={{ color: active ? 'var(--primary)' : 'var(--muted-foreground)' }} />
                  {'badge' in tab && tab.badge > 0 ? <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full flex items-center justify-center" style={{ background: 'var(--primary)', color: '#fff', fontSize: 8, fontWeight: 700 }}>{tab.badge}</span> : null}
                </div>
                <span style={{ color: active ? 'var(--primary)' : 'var(--muted-foreground)', fontSize: 9, fontWeight: 600 }}>{tab.label}</span>
                {active && <motion.div layoutId="otcTab" className="absolute -bottom-0.5 left-2 right-2 h-0.5 rounded-full" style={{ background: 'var(--primary)' }} />}
              </motion.button>
            );
          })}
        </div>
      )}

      {/* TRADE VIEW */}
      {view === 'trade' && activeTradeListing && (
        <div className="flex-1 overflow-y-auto">
          {tradeStep === 'form' && (
            <div className="px-5">
              <div className="flex items-center gap-3 p-4 rounded-[16px] mb-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="relative">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white" style={{ background: activeTradeListing.seller.color, fontSize: 13, fontWeight: 700 }}>{activeTradeListing.seller.initials}</div>
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full" style={{ background: activeTradeListing.seller.online ? 'var(--positive)' : 'var(--muted-foreground)', border: '2px solid var(--card)' }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5"><span style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>{activeTradeListing.seller.name}</span><ShieldCheck size={12} style={{ color: 'var(--primary)' }} /></div>
                  <div className="flex items-center gap-1"><Star size={10} style={{ color: 'var(--muted-foreground)' }} fill="var(--muted-foreground)" /><span style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{activeTradeListing.seller.rating} · {activeTradeListing.seller.trades.toLocaleString()} trades</span></div>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: 'var(--muted)' }}><Lock size={11} style={{ color: 'var(--positive)' }} /><span style={{ color: 'var(--positive)', fontSize: 10, fontWeight: 700 }}>ESCROW</span></div>
              </div>
              <div className="rounded-[16px] p-4 mb-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600, marginBottom: 10 }}>TRADE TERMS</p>
                <div className="flex flex-col gap-2.5">
                  <Row label="Asset" value={activeTradeListing.asset} />
                  <Row label="Rate" value={`${activeTradeListing.currencySymbol}${fmtNum(activeTradeListing.rate)} / ${activeTradeListing.asset}`} />
                  <Row label="Available" value={`${fmtNum(activeTradeListing.amount)} ${activeTradeListing.asset}`} />
                  <Row label="Limits" value={`${activeTradeListing.minOrder} – ${fmtNum(activeTradeListing.maxOrder)} ${activeTradeListing.asset}`} />
                  <Row label="Currency" value={`${activeTradeListing.currency} (${activeTradeListing.currencySymbol})`} />
                </div>
              </div>
              <div className="rounded-[16px] p-5 mb-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 8 }}>Amount ({activeTradeListing.asset})</p>
                <input type="number" placeholder="0.00" value={tradeAmount} onChange={e => setTradeAmount(e.target.value)} autoFocus className="w-full bg-transparent outline-none" style={{ color: 'var(--foreground)', fontSize: 34, fontWeight: 800 }} />
                <div className="flex justify-between mt-2">
                  <span style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>Min: {activeTradeListing.minOrder} · Max: {fmtNum(activeTradeListing.maxOrder)}</span>
                  <span style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>Rate: {activeTradeListing.currencySymbol}{fmtNum(activeTradeListing.rate)}</span>
                </div>
              </div>
              {tradeAmount && tradeWithin && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-[16px] p-4 mb-4" style={{ background: 'var(--muted)' }}>
                  <div className="flex justify-between mb-2"><span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>You {orderType === 'buy' ? 'pay' : 'send'}</span><span style={{ color: 'var(--foreground)', fontSize: 14, fontWeight: 700 }}>{activeTradeListing.currencySymbol}{fmtNum(tradeTotal)} {activeTradeListing.currency}</span></div>
                  <div className="flex justify-between"><span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>You {orderType === 'buy' ? 'receive' : 'pay'}</span><span style={{ color: 'var(--foreground)', fontSize: 14, fontWeight: 700 }}>{fmtNum(tradeNum)} {activeTradeListing.asset}</span></div>
                </motion.div>
              )}
              {tradeAmount && !tradeWithin && (
                <div className="rounded-[12px] p-3 mb-4 flex items-center gap-2" style={{ background: 'var(--muted)' }}><AlertTriangle size={14} style={{ color: 'var(--destructive)' }} /><p style={{ color: 'var(--destructive)', fontSize: 12 }}>Amount must be between {activeTradeListing.minOrder} and {fmtNum(activeTradeListing.maxOrder)} {activeTradeListing.asset}</p></div>
              )}
              <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 8 }}>Payment Method</p>
              <div className="flex gap-2 flex-wrap mb-4">
                {activeTradeListing.payMethods.map(m => <motion.button key={m} whileTap={{ scale: 0.95 }} onClick={() => setTradePayMethod(m)} className="px-3 py-2 rounded-xl" style={{ background: tradePayMethod === m ? 'var(--primary)' : 'var(--muted)', color: tradePayMethod === m ? '#FFF' : 'var(--foreground)', fontSize: 13, fontWeight: 600, border: `1px solid ${tradePayMethod === m ? 'transparent' : 'var(--border)'}` }}>{m}</motion.button>)}
              </div>
              <div className="flex items-start gap-2 p-3 rounded-[12px] mb-4" style={{ background: 'var(--muted)' }}>
                <Shield size={15} style={{ color: 'var(--positive)', marginTop: 1 }} />
                <p style={{ color: 'var(--foreground)', fontSize: 11, fontWeight: 600, lineHeight: 1.5 }}>Crypto is locked in escrow before you pay. It's only released to the seller once you confirm payment.</p>
              </div>
              <motion.button whileTap={{ scale: 0.97 }} onClick={startTrade} disabled={!tradeAmount || !tradeWithin || !tradePayMethod} className="w-full py-3.5 rounded-[16px] text-white flex items-center justify-center gap-2" style={{ background: tradeAmount && tradeWithin && tradePayMethod ? 'var(--primary)' : 'var(--muted)', fontWeight: 700, fontSize: 15 }}>Start Trade <ArrowRight size={18} /></motion.button>
            </div>
          )}
          {tradeStep === 'processing' && (
            <div className="flex flex-col items-center py-20">
              <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'var(--muted)' }}><Loader size={40} className="animate-spin" style={{ color: 'var(--foreground)' }} /></div>
              <h3 style={{ color: 'var(--foreground)', fontWeight: 700, marginTop: 20, marginBottom: 4 }}>Creating Trade...</h3>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Escrowing {tradeNum} {activeTradeListing.asset}</p>
            </div>
          )}
          {tradeStep === 'active' && selectedTrade && (
            <ActiveTradeDetail trade={selectedTrade} onPayMade={() => markPaymentMade(selectedTrade.id)} onRelease={() => releaseCrypto(selectedTrade.id)} onComplete={() => completeTrade(selectedTrade.id)} onCancel={() => { cancelTrade(selectedTrade.id); setView('browse'); }} onOpenDispute={openDispute} chatInput={chatInput} setChatInput={setChatInput} onSendChat={sendChat} />
          )}
          <div style={{ height: 32 }} />
        </div>
      )}

      {/* DISPUTE MODAL */}
      <AnimatePresence>
        {disputeOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !disputeSubmitting && setDisputeOpen(false)} className="absolute inset-0 z-40" style={{ background: 'rgba(0,0,0,0.55)' }} />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 300 }} className="absolute bottom-0 left-0 right-0 z-50 rounded-t-[28px] p-6 pb-8 max-h-[88%] overflow-y-auto" style={{ background: 'var(--card)' }}>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2"><div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--muted)' }}><Flag size={17} style={{ color: 'var(--destructive)' }} /></div><div><h3 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 17 }}>{disputeFiled ? 'Dispute Filed' : 'Open a Dispute'}</h3><p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{disputeFiled ? 'Your case is under review' : 'Our team will mediate this trade'}</p></div></div>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => !disputeSubmitting && setDisputeOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--muted)' }}><X size={16} style={{ color: 'var(--muted-foreground)' }} /></motion.button>
              </div>
              {!disputeFiled ? (
                <>
                  {selectedTrade && <div className="flex items-center gap-2 p-3 rounded-[12px] mb-4" style={{ background: 'var(--muted)' }}><FileText size={14} style={{ color: 'var(--muted-foreground)' }} /><span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Trade #{selectedTrade.id} · {fmtNum(selectedTrade.amount)} {selectedTrade.listing.asset}</span></div>}
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 8 }}>Dispute Category</p>
                  <div className="relative mb-4">
                    <select value={disputeCategory} onChange={e => setDisputeCategory(e.target.value)} className="w-full px-4 py-3 rounded-[12px] outline-none appearance-none pr-10" style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', fontSize: 14, fontWeight: 600 }}>{DISPUTE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select>
                    <ChevronDown size={16} style={{ color: 'var(--muted-foreground)', position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  </div>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 8 }}>Description</p>
                  <textarea value={disputeDesc} onChange={e => setDisputeDesc(e.target.value)} placeholder="Describe what happened. Include dates, amounts, and any communication details..." rows={4} className="w-full px-4 py-3 rounded-[12px] outline-none resize-none mb-4 bg-transparent" style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', fontSize: 13, lineHeight: 1.5 }} />
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 8 }}>Evidence Upload</p>
                  <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleEvidencePick} />
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => fileInputRef.current?.click()} className="w-full py-6 rounded-[12px] flex flex-col items-center justify-center gap-2 mb-3" style={{ background: 'var(--muted)', border: '2px dashed var(--border)' }}><Upload size={22} style={{ color: 'var(--muted-foreground)' }} /><span style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}>Tap to upload evidence</span><span style={{ color: 'var(--muted-foreground)', fontSize: 10 }}>Screenshots, receipts, chat logs</span></motion.button>
                  {disputeEvidence.length > 0 && <div className="flex flex-col gap-2 mb-4">{disputeEvidence.map((f, idx) => <motion.div key={f + idx} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 p-2.5 rounded-[10px]" style={{ background: 'var(--muted)' }}><Paperclip size={13} style={{ color: 'var(--foreground)' }} /><span style={{ color: 'var(--foreground)', fontSize: 12, flex: 1 }}>{f}</span><button onClick={() => setDisputeEvidence(prev => prev.filter((_, i) => i !== idx))}><X size={14} style={{ color: 'var(--muted-foreground)' }} /></button></motion.div>)}</div>}
                  <div className="flex items-start gap-2 p-3 rounded-[12px] mb-4" style={{ background: 'var(--muted)' }}><AlertTriangle size={14} style={{ color: 'var(--warning)', marginTop: 1 }} /><p style={{ color: 'var(--warning)', fontSize: 11, lineHeight: 1.5 }}>Filing a false dispute may result in account restrictions. Only file if you genuinely cannot resolve the issue with the counterparty.</p></div>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={submitDispute} disabled={disputeSubmitting || !disputeDesc.trim()} className="w-full py-3.5 rounded-[16px] text-white flex items-center justify-center gap-2" style={{ background: disputeDesc.trim() && !disputeSubmitting ? 'var(--destructive)' : 'var(--muted)', fontWeight: 700, fontSize: 15 }}>{disputeSubmitting ? <Loader size={18} className="animate-spin" /> : <Flag size={17} />}{disputeSubmitting ? 'Submitting...' : 'Submit to Admin'}</motion.button>
                </>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center text-center py-6">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }} className="w-20 h-20 rounded-full flex items-center justify-center mb-5" style={{ background: 'var(--muted)' }}><Flag size={40} style={{ color: 'var(--destructive)' }} /></motion.div>
                  <h2 style={{ color: 'var(--foreground)', fontWeight: 800, marginBottom: 4 }}>Dispute Filed</h2>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 14, marginBottom: 20 }}>Your case has been submitted to our admin team</p>
                  <div className="w-full rounded-[16px] p-4 mb-5" style={{ background: 'var(--muted)' }}>
                    <div className="flex justify-between mb-3"><span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Case Number</span><span style={{ color: 'var(--foreground)', fontSize: 14, fontWeight: 800, fontFamily: 'monospace' }}>{disputeFiled.caseNumber}</span></div>
                    <div className="flex justify-between mb-3"><span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Category</span><span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}>{disputeCategory}</span></div>
                    <div className="flex justify-between"><span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Admin Response ETA</span><span style={{ color: 'var(--warning)', fontSize: 13, fontWeight: 700 }}>Within {disputeFiled.eta}</span></div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-[12px] mb-5" style={{ background: 'var(--muted)' }}><Shield size={14} style={{ color: 'var(--foreground)' }} /><span style={{ color: 'var(--foreground)', fontSize: 11, fontWeight: 600, textAlign: 'left' }}>Escrow funds are frozen during the investigation. No crypto will be released until resolved.</span></div>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => setDisputeOpen(false)} className="w-full py-3.5 rounded-[16px] text-white" style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 15 }}>Back to Trade</motion.button>
                </motion.div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* CREATE LISTING MODAL */}
      <CreateListingModal
        open={showCreateListing}
        onClose={() => setShowCreateListing(false)}
        onCreate={(listing) => {
          setUserListings(prev => [listing, ...prev]);
          setShowCreateListing(false);
          showToast('Listing created successfully');
        }}
      />

      {/* MERCHANT APPLICATION MODAL */}
      <MerchantAppModal
        open={showMerchantApp}
        onClose={() => setShowMerchantApp(false)}
        onSubmit={(app) => {
          setMerchantApp(app);
          setMerchantStatus('pending');
          setShowMerchantApp(false);
          showToast('Application submitted — under review');
          setTimeout(() => {
            setMerchantStatus('approved');
            showToast('Merchant application approved!');
          }, 4000);
        }}
      />

      {/* TOAST */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 20, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: 20, x: '-50%' }} className="absolute bottom-8 left-1/2 z-[60] px-4 py-3 rounded-[14px] flex items-center gap-2" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <CheckCircle2 size={16} style={{ color: 'var(--positive)' }} /><span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between items-center"><span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{label}</span><span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}>{value}</span></div>;
}

function StatusPill({ status }: { status: TradeStatus }) {
  const map: Record<TradeStatus, { label: string; color: string; icon: typeof Clock }> = {
    pending: { label: 'PAYMENT PENDING', color: 'var(--warning)', icon: Clock },
    payment_made: { label: 'PAYMENT MADE', color: 'var(--primary)', icon: CheckCircle2 },
    released: { label: 'CRYPTO RELEASED', color: 'var(--primary)', icon: ShieldCheck },
    completed: { label: 'COMPLETED', color: 'var(--positive)', icon: CheckCircle2 },
    disputed: { label: 'DISPUTED', color: 'var(--destructive)', icon: AlertTriangle },
    cancelled: { label: 'CANCELLED', color: 'var(--muted-foreground)', icon: X },
  };
  const s = map[status]; const Icon = s.icon;
  return <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: 'var(--muted)' }}><Icon size={11} style={{ color: s.color }} /><span style={{ color: s.color, fontSize: 10, fontWeight: 700 }}>{s.label}</span></div>;
}

function EscrowTracker({ stage, timestamps }: { stage: EscrowStage; timestamps: Record<number, string | null> }) {
  return (
    <div className="rounded-[16px] p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-2 mb-4"><ShieldCheck size={15} style={{ color: 'var(--positive)' }} /><p style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 700 }}>Escrow Status</p></div>
      <div className="flex flex-col gap-0">
        {ESCROW_STAGES.map((s, i) => {
          const done = i < stage; const current = i === stage; const Icon = s.icon; const ts = timestamps[i];
          return (
            <div key={s.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <motion.div initial={{ scale: 0.6 }} animate={{ scale: 1 }} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: done || current ? s.color : 'var(--muted)', border: current ? `2px solid ${s.color}` : 'none' }}><Icon size={16} color={done || current ? '#FFF' : 'var(--muted-foreground)'} /></motion.div>
                {i < ESCROW_STAGES.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 24, background: i < stage ? s.color : 'var(--border)', transition: 'background 0.3s' }} />}
              </div>
              <div className="flex-1 pb-4 pt-1">
                <div className="flex items-center gap-2"><span style={{ color: done || current ? 'var(--foreground)' : 'var(--muted-foreground)', fontSize: 13, fontWeight: current ? 700 : 600 }}>{s.label}</span>{current && <span className="px-2 py-0.5 rounded-full" style={{ background: s.color, color: '#FFF', fontSize: 9, fontWeight: 700 }}>IN PROGRESS</span>}</div>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 11, marginTop: 2 }}>{ts ? `Updated at ${ts}` : done ? 'Completed' : 'Awaiting...'}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MiniEscrowTracker({ stage, timestamps }: { stage: EscrowStage; timestamps: Record<number, string | null> }) {
  return (
    <div className="flex items-center justify-between px-1">
      {ESCROW_STAGES.map((s, i) => {
        const done = i < stage; const current = i === stage; const Icon = s.icon;
        return (
          <div key={s.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: done || current ? s.color : 'var(--muted)' }}><Icon size={12} color={done || current ? '#FFF' : 'var(--muted-foreground)'} /></div>
              <span style={{ color: done || current ? 'var(--foreground)' : 'var(--muted-foreground)', fontSize: 8, fontWeight: 600, textAlign: 'center', maxWidth: 56 }}>{s.label}</span>
              {timestamps[i] && <span style={{ color: 'var(--muted-foreground)', fontSize: 8 }}>{timestamps[i]}</span>}
            </div>
            {i < ESCROW_STAGES.length - 1 && <div style={{ flex: 1, height: 2, margin: '0 4px', marginBottom: 18, background: i < stage ? s.color : 'var(--border)', transition: 'background 0.3s' }} />}
          </div>
        );
      })}
    </div>
  );
}

interface ActiveTradeDetailProps {
  trade: ActiveTrade; onPayMade: () => void; onRelease: () => void; onComplete: () => void; onCancel: () => void; onOpenDispute: () => void; chatInput: string; setChatInput: (s: string) => void; onSendChat: () => void;
}

function ActiveTradeDetail({ trade, onPayMade, onRelease, onComplete, onCancel, onOpenDispute, chatInput, setChatInput, onSendChat }: ActiveTradeDetailProps) {
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  React.useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [trade.chat.length]);
  const isDisputed = trade.status === 'disputed';
  return (
    <div className="px-5 flex flex-col gap-4">
      <div className="flex items-center gap-3 p-4 rounded-[16px]" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="relative"><div className="w-11 h-11 rounded-full flex items-center justify-center text-white" style={{ background: trade.listing.seller.color, fontSize: 12, fontWeight: 700 }}>{trade.listing.seller.initials}</div><div className="absolute bottom-0 right-0 w-3 h-3 rounded-full" style={{ background: trade.listing.seller.online ? 'var(--positive)' : 'var(--muted-foreground)', border: '2px solid var(--card)' }} /></div>
        <div className="flex-1"><p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>{trade.listing.seller.name}</p><p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{trade.listing.seller.rating} · {trade.listing.seller.trades.toLocaleString()} trades · {trade.createdAt}</p></div>
        <StatusPill status={trade.status} />
      </div>
      <div className="rounded-[16px] p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600, marginBottom: 10 }}>TRADE DETAILS</p>
        <div className="flex flex-col gap-2.5"><Row label="Amount" value={`${fmtNum(trade.amount)} ${trade.listing.asset}`} /><Row label="Rate" value={`${trade.listing.currencySymbol}${fmtNum(trade.listing.rate)}`} /><Row label="Total" value={`${trade.listing.currencySymbol}${fmtNum(trade.total)} ${trade.listing.currency}`} /><Row label="Payment" value={trade.payMethod} /><Row label="Trade ID" value={trade.id} /></div>
      </div>
      <EscrowTracker stage={trade.escrowStage} timestamps={trade.stageTimestamps} />
      {isDisputed && trade.dispute && <div className="rounded-[14px] p-4" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}><div className="flex items-center gap-2 mb-2"><AlertTriangle size={15} style={{ color: 'var(--destructive)' }} /><span style={{ color: 'var(--destructive)', fontSize: 13, fontWeight: 700 }}>Dispute Filed</span></div><p style={{ color: 'var(--foreground)', fontSize: 12, marginBottom: 4 }}>Case <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{trade.dispute.caseNumber}</span> · {trade.dispute.category}</p><p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>Filed at {trade.dispute.filedAt}. Admin will respond within 24 hours. Escrow is frozen.</p></div>}
      {!isDisputed && (
        <div className="flex flex-col gap-2">
          {trade.status === 'pending' && <motion.button whileTap={{ scale: 0.97 }} onClick={onPayMade} className="w-full py-3.5 rounded-[16px] text-white flex items-center justify-center gap-2" style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 15 }}><CheckCircle2 size={18} /> Pay Now — Mark Payment Made</motion.button>}
          {trade.status === 'payment_made' && <div className="rounded-[14px] p-4 flex items-center gap-2" style={{ background: 'var(--muted)' }}><Clock size={15} style={{ color: 'var(--foreground)' }} /><span style={{ color: 'var(--foreground)', fontSize: 12, fontWeight: 600 }}>Waiting for seller to confirm payment and release crypto...</span></div>}
          {trade.status === 'released' && <motion.button whileTap={{ scale: 0.97 }} onClick={onComplete} className="w-full py-3.5 rounded-[16px] text-white flex items-center justify-center gap-2" style={{ background: 'var(--positive)', fontWeight: 700, fontSize: 15 }}><CheckCircle2 size={18} /> Confirm Receipt — Complete Trade</motion.button>}
          <div className="flex gap-2">
            <motion.button whileTap={{ scale: 0.97 }} onClick={onOpenDispute} className="flex-1 py-3 rounded-[14px] flex items-center justify-center gap-2" style={{ background: 'var(--muted)', color: 'var(--destructive)', fontSize: 13, fontWeight: 700 }}><Flag size={15} /> Open Dispute</motion.button>
            <motion.button whileTap={{ scale: 0.97 }} onClick={onCancel} className="flex-1 py-3 rounded-[14px]" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', fontSize: 13, fontWeight: 700 }}>Cancel Trade</motion.button>
          </div>
        </div>
      )}
      <div className="rounded-[16px] overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}><MessageSquare size={15} style={{ color: 'var(--foreground)' }} /><span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 700 }}>Chat with Seller</span><span className="ml-auto flex items-center gap-1" style={{ color: 'var(--positive)', fontSize: 11, fontWeight: 600 }}><Dot size={14} />{trade.listing.seller.online ? 'Online' : 'Offline'}</span></div>
        <div className="px-4 py-3 flex flex-col gap-2.5" style={{ maxHeight: 260, overflowY: 'auto' }}>
          {trade.chat.map(m => <div key={m.id} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}><div className="max-w-[78%] px-3.5 py-2.5 rounded-[14px]" style={{ background: m.from === 'me' ? 'var(--primary)' : 'var(--muted)', color: m.from === 'me' ? '#FFF' : 'var(--foreground)', fontSize: 13, borderBottomRightRadius: m.from === 'me' ? 4 : 14, borderBottomLeftRadius: m.from === 'me' ? 14 : 4 }}><p style={{ lineHeight: 1.4 }}>{m.text}</p><p style={{ fontSize: 9, marginTop: 4, opacity: 0.7, textAlign: m.from === 'me' ? 'right' : 'left' }}>{m.time}</p></div></div>)}
          <div ref={chatEndRef} />
        </div>
        <div className="flex items-center gap-2 px-3 py-3" style={{ borderTop: '1px solid var(--border)' }}>
          <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') onSendChat(); }} placeholder="Type a message..." className="flex-1 px-3 py-2.5 rounded-[12px] bg-transparent outline-none" style={{ background: 'var(--muted)', color: 'var(--foreground)', fontSize: 13 }} />
          <motion.button whileTap={{ scale: 0.9 }} onClick={onSendChat} className="w-10 h-10 rounded-[12px] flex items-center justify-center text-white" style={{ background: chatInput.trim() ? 'var(--primary)' : 'var(--muted)' }}><Send size={16} /></motion.button>
        </div>
      </div>
    </div>
  );
}

function CreateListingModal({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (l: OTCListing) => void }) {
  const [type, setType] = useState<'buy' | 'sell'>('sell');
  const [asset, setAsset] = useState<'USDT' | 'USDC'>('USDT');
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState('');
  const [currency, setCurrency] = useState('NGN');
  const [payMethods, setPayMethods] = useState<string[]>(['Bank Transfer']);
  const [minOrder, setMinOrder] = useState('');
  const [maxOrder, setMaxOrder] = useState('');
  const [step, setStep] = useState<0 | 1 | 2>(0);

  const currencySymbols: Record<string, string> = { NGN: '₦', KES: 'KSh', GHS: '₵', ZAR: 'R' };
  const allPayMethods = ['Bank Transfer', 'M-Pesa', 'OPay', 'Palmpay', 'MTN MoMo', 'Flutterwave'];

  const amt = Number(amount) || 0;
  const r = Number(rate) || 0;
  const min = Number(minOrder) || 0;
  const max = Number(maxOrder) || 0;
  const valid = amt > 0 && r > 0 && min > 0 && max > 0 && max >= min && payMethods.length > 0;

  const reset = () => { setType('sell'); setAsset('USDT'); setAmount(''); setRate(''); setCurrency('NGN'); setPayMethods(['Bank Transfer']); setMinOrder(''); setMaxOrder(''); setStep(0); };

  const handleCreate = () => {
    if (!valid) return;
    onCreate({
      id: 'my-' + Date.now(),
      seller: { name: 'You', initials: 'ME', color: 'var(--primary)', trades: 0, rating: 5.0, online: true },
      asset, amount: amt, rate: r, currency, currencySymbol: currencySymbols[currency] ?? '$',
      payMethods, minOrder: min, maxOrder: max, type,
    });
    reset();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 z-50" style={{ background: 'rgba(0,0,0,0.6)' }} />
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 320 }} className="absolute bottom-0 left-0 right-0 z-50 rounded-t-[28px] overflow-hidden" style={{ background: 'var(--card)', borderTop: '1px solid var(--border)', maxHeight: '90%', overflowY: 'auto' }}>
            <div className="w-12 h-1 rounded-full mx-auto mt-3" style={{ background: 'var(--muted)' }} />
            <div className="flex items-center justify-between px-5 mt-3 mb-4">
              <h3 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 18 }}>Create Listing</h3>
              <button onClick={() => { onClose(); reset(); }} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'var(--muted)' }}><X size={18} style={{ color: 'var(--foreground)' }} /></button>
            </div>

            <div className="flex items-center gap-2 px-5 mb-4">
              {[0, 1, 2].map(s => (
                <div key={s} className="h-1.5 rounded-full transition-all" style={{ background: s <= step ? 'var(--primary)' : 'var(--muted)', flex: s === step ? 2 : 1 }} />
              ))}
            </div>

            {step === 0 && (
              <div className="px-5 pb-8">
                <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 8 }}>I want to</p>
                <div className="flex gap-2 mb-4">
                  {(['buy', 'sell'] as const).map(t => (
                    <button key={t} onClick={() => setType(t)} className="flex-1 py-3.5 rounded-[14px] flex items-center justify-center gap-2" style={{ background: type === t ? (t === 'buy' ? 'var(--positive)' : 'var(--destructive)') : 'var(--muted)', color: type === t ? '#FFF' : 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>
                      {t === 'buy' ? <TrendingDown size={16} /> : <TrendingUp size={16} />}
                      {t === 'buy' ? 'Buy' : 'Sell'} Crypto
                    </button>
                  ))}
                </div>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 8 }}>Asset</p>
                <div className="flex gap-2 mb-4">
                  {(['USDT', 'USDC'] as const).map(a => (
                    <button key={a} onClick={() => setAsset(a)} className="flex-1 py-3.5 rounded-[14px]" style={{ background: asset === a ? 'var(--primary)' : 'var(--muted)', color: asset === a ? '#FFF' : 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>{a}</button>
                  ))}
                </div>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 8 }}>Amount of {asset}</p>
                <input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-4 py-3.5 rounded-[14px] bg-transparent outline-none mb-4" style={{ background: 'var(--muted)', color: 'var(--foreground)', fontSize: 16, fontWeight: 700 }} />
                <motion.button whileTap={{ scale: 0.97 }} disabled={!amt} onClick={() => setStep(1)} className="w-full py-3.5 rounded-[16px] text-white" style={{ background: amt ? 'var(--primary)' : 'var(--muted)', color: amt ? '#FFF' : 'var(--muted-foreground)', fontWeight: 700, fontSize: 15 }}>Continue</motion.button>
              </div>
            )}

            {step === 1 && (
              <div className="px-5 pb-8">
                <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 8 }}>Currency</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {['NGN', 'KES', 'GHS', 'ZAR'].map(c => (
                    <button key={c} onClick={() => setCurrency(c)} className="px-4 py-2.5 rounded-[12px]" style={{ background: currency === c ? 'var(--primary)' : 'var(--muted)', color: currency === c ? '#FFF' : 'var(--foreground)', fontWeight: 600, fontSize: 13 }}>{c}</button>
                  ))}
                </div>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 8 }}>Rate per {asset} ({currencySymbols[currency]})</p>
                <input type="number" placeholder="0.00" value={rate} onChange={e => setRate(e.target.value)} className="w-full px-4 py-3.5 rounded-[14px] bg-transparent outline-none mb-2" style={{ background: 'var(--muted)', color: 'var(--foreground)', fontSize: 16, fontWeight: 700 }} />
                {r > 0 && <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 16 }}>Total: {currencySymbols[currency]}{fmtNum(amt * r)}</p>}
                <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 8 }}>Payment Methods</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {allPayMethods.map(m => {
                    const sel = payMethods.includes(m);
                    return <button key={m} onClick={() => setPayMethods(prev => sel ? prev.filter(x => x !== m) : [...prev, m])} className="px-3 py-2 rounded-[10px] flex items-center gap-1.5" style={{ background: sel ? 'var(--primary)' : 'var(--muted)', color: sel ? '#FFF' : 'var(--foreground)', fontWeight: 600, fontSize: 12 }}>{sel && <CheckCircle2 size={12} />}{m}</button>;
                  })}
                </div>
                <div className="flex gap-2 mb-4">
                  <div className="flex-1">
                    <p style={{ color: 'var(--muted-foreground)', fontSize: 11, marginBottom: 6 }}>Min Order</p>
                    <input type="number" placeholder="0" value={minOrder} onChange={e => setMinOrder(e.target.value)} className="w-full px-3 py-3 rounded-[12px] bg-transparent outline-none" style={{ background: 'var(--muted)', color: 'var(--foreground)', fontSize: 14, fontWeight: 600 }} />
                  </div>
                  <div className="flex-1">
                    <p style={{ color: 'var(--muted-foreground)', fontSize: 11, marginBottom: 6 }}>Max Order</p>
                    <input type="number" placeholder="0" value={maxOrder} onChange={e => setMaxOrder(e.target.value)} className="w-full px-3 py-3 rounded-[12px] bg-transparent outline-none" style={{ background: 'var(--muted)', color: 'var(--foreground)', fontSize: 14, fontWeight: 600 }} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep(0)} className="flex-1 py-3.5 rounded-[16px]" style={{ background: 'var(--muted)', color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>Back</motion.button>
                  <motion.button whileTap={{ scale: 0.97 }} disabled={!valid} onClick={() => setStep(2)} className="flex-1 py-3.5 rounded-[16px] text-white" style={{ background: valid ? 'var(--primary)' : 'var(--muted)', color: valid ? '#FFF' : 'var(--muted-foreground)', fontWeight: 700, fontSize: 15 }}>Review</motion.button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="px-5 pb-8">
                <div className="rounded-[16px] p-4 mb-4" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
                  {[
                    { l: 'Type', v: type === 'buy' ? 'Buy Crypto' : 'Sell Crypto' },
                    { l: 'Asset', v: asset },
                    { l: 'Amount', v: `${fmtNum(amt)} ${asset}` },
                    { l: 'Rate', v: `${currencySymbols[currency]}${fmtNum(r)} / ${asset}` },
                    { l: 'Total Value', v: `${currencySymbols[currency]}${fmtNum(amt * r)}` },
                    { l: 'Min Order', v: `${currencySymbols[currency]}${fmtNum(min)}` },
                    { l: 'Max Order', v: `${currencySymbols[currency]}${fmtNum(max)}` },
                    { l: 'Payment Methods', v: payMethods.join(', ') },
                  ].map((row, i, arr) => (
                    <div key={row.l} className="flex justify-between items-center py-2.5" style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>{row.l}</span>
                      <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600, textAlign: 'right' }}>{row.v}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep(1)} className="flex-1 py-3.5 rounded-[16px]" style={{ background: 'var(--muted)', color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>Back</motion.button>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={handleCreate} className="flex-1 py-3.5 rounded-[16px] text-white flex items-center justify-center gap-2" style={{ background: 'var(--positive)', fontWeight: 700, fontSize: 15 }}><CheckCircle2 size={18} /> Publish</motion.button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function MerchantAppModal({ open, onClose, onSubmit }: { open: boolean; onClose: () => void; onSubmit: (app: MerchantApplication) => void }) {
  const [businessName, setBusinessName] = useState('');
  const [country, setCountry] = useState('Nigeria');
  const [volume, setVolume] = useState('');
  const [payMethods, setPayMethods] = useState<string[]>(['Bank Transfer']);
  const [docName, setDocName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const allPayMethods = ['Bank Transfer', 'M-Pesa', 'OPay', 'Palmpay', 'MTN MoMo', 'Flutterwave'];
  const countries = ['Nigeria', 'Kenya', 'Ghana', 'South Africa', 'Uganda', 'Tanzania'];
  const valid = businessName.trim().length > 1 && volume.trim().length > 0 && payMethods.length > 0;

  const handleSubmit = () => {
    if (!valid) return;
    setSubmitting(true);
    setTimeout(() => {
      onSubmit({
        businessName: businessName.trim(),
        country, volume: volume.trim(),
        paymentMethods: payMethods,
        docName,
        submittedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        status: 'pending',
      });
      setSubmitting(false);
      setBusinessName(''); setCountry('Nigeria'); setVolume(''); setPayMethods(['Bank Transfer']); setDocName(null);
    }, 1800);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 z-50" style={{ background: 'rgba(0,0,0,0.6)' }} />
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 320 }} className="absolute bottom-0 left-0 right-0 z-50 rounded-t-[28px] overflow-hidden" style={{ background: 'var(--card)', borderTop: '1px solid var(--border)', maxHeight: '90%', overflowY: 'auto' }}>
            <div className="w-12 h-1 rounded-full mx-auto mt-3" style={{ background: 'var(--muted)' }} />
            <div className="flex items-center justify-between px-5 mt-3 mb-4">
              <h3 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 18 }}>Merchant Application</h3>
              <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'var(--muted)' }}><X size={18} style={{ color: 'var(--foreground)' }} /></button>
            </div>

            <div className="px-5 pb-8">
              <div className="flex items-center gap-2 p-3 rounded-[12px] mb-4" style={{ background: 'var(--muted)' }}>
                <ShieldCheck size={18} style={{ color: 'var(--primary)' }} />
                <p style={{ color: 'var(--muted-foreground)', fontSize: 12, lineHeight: 1.4 }}>Verified merchants can publish listings, set custom rates, and access higher trading limits.</p>
              </div>

              <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 6 }}>Business Name</p>
              <input value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="e.g. Convia Exchange Ltd" className="w-full px-4 py-3.5 rounded-[14px] bg-transparent outline-none mb-4" style={{ background: 'var(--muted)', color: 'var(--foreground)', fontSize: 14 }} />

              <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 6 }}>Country</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {countries.map(c => (
                  <button key={c} onClick={() => setCountry(c)} className="px-3 py-2 rounded-[10px]" style={{ background: country === c ? 'var(--primary)' : 'var(--muted)', color: country === c ? '#FFF' : 'var(--foreground)', fontWeight: 600, fontSize: 12 }}>{c}</button>
                ))}
              </div>

              <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 6 }}>Estimated Monthly Volume (USD)</p>
              <input type="number" value={volume} onChange={e => setVolume(e.target.value)} placeholder="e.g. 50000" className="w-full px-4 py-3.5 rounded-[14px] bg-transparent outline-none mb-4" style={{ background: 'var(--muted)', color: 'var(--foreground)', fontSize: 14, fontWeight: 600 }} />

              <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 6 }}>Supported Payment Methods</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {allPayMethods.map(m => {
                  const sel = payMethods.includes(m);
                  return <button key={m} onClick={() => setPayMethods(prev => sel ? prev.filter(x => x !== m) : [...prev, m])} className="px-3 py-2 rounded-[10px] flex items-center gap-1.5" style={{ background: sel ? 'var(--primary)' : 'var(--muted)', color: sel ? '#FFF' : 'var(--foreground)', fontWeight: 600, fontSize: 12 }}>{sel && <CheckCircle2 size={12} />}{m}</button>;
                })}
              </div>

              <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 6 }}>Business Document (optional)</p>
              <button onClick={() => setDocName(docName ? null : 'business-registration.pdf')} className="w-full px-4 py-3.5 rounded-[14px] flex items-center gap-3 mb-6" style={{ background: 'var(--muted)', border: '1px dashed var(--border)' }}>
                <Upload size={18} style={{ color: docName ? 'var(--positive)' : 'var(--muted-foreground)' }} />
                <span style={{ color: docName ? 'var(--foreground)' : 'var(--muted-foreground)', fontSize: 13, fontWeight: 600 }}>{docName ?? 'Upload business registration document'}</span>
                {docName && <CheckCircle2 size={16} style={{ color: 'var(--positive)', marginLeft: 'auto' }} />}
              </button>

              <motion.button whileTap={{ scale: 0.97 }} disabled={!valid || submitting} onClick={handleSubmit} className="w-full py-3.5 rounded-[16px] text-white flex items-center justify-center gap-2" style={{ background: valid && !submitting ? 'var(--primary)' : 'var(--muted)', color: valid && !submitting ? '#FFF' : 'var(--muted-foreground)', fontWeight: 700, fontSize: 15 }}>
                {submitting ? <><Loader size={18} className="animate-spin" /> Submitting...</> : <><Shield size={18} /> Submit Application</>}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
