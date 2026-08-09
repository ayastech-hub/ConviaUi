import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Smartphone, Wifi, Zap, Receipt, Trophy,
  ChevronRight, Check, Phone, CreditCard, Landmark, Gift,
  RefreshCw, ArrowRightLeft, TrendingUp, Users, Shield,
  type LucideIcon,
} from 'lucide-react';
import type { Screen, Transaction } from '../../../shared/data/mockData';
import { TransactionReceipt } from '../../../shared/components/TransactionReceipt';

interface ServicesScreenProps {
  navigate: (s: Screen) => void;
  goBack: () => void;
  switchTab: (s: Screen) => void;
}

interface ServiceItem {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
}

interface ServiceGroup {
  title: string;
  subtitle: string;
  items: ServiceItem[];
}

const serviceGroups: ServiceGroup[] = [
  {
    title: 'Bills & Utilities',
    subtitle: 'Pay everyday essentials',
    items: [
      { id: 'data', label: 'Data Bundles', icon: Wifi, description: 'Buy internet data' },
      { id: 'airtime', label: 'Airtime', icon: Smartphone, description: 'Top up phone credit' },
      { id: 'electricity', label: 'Electricity', icon: Zap, description: 'Pay power bills' },
      { id: 'bills', label: 'TV & Water', icon: Receipt, description: 'DSTV, GOtv, water' },
    ],
  },
  {
    title: 'Trading',
    subtitle: 'Markets & exchange',
    items: [
      { id: 'trade', label: 'Trade', icon: TrendingUp, description: 'Spot & futures' },
      { id: 'swap', label: 'Swap', icon: RefreshCw, description: 'Instant token swap' },
      { id: 'otc', label: 'OTC Desk', icon: ArrowRightLeft, description: 'Large block trades' },
    ],
  },
  {
    title: 'Rewards',
    subtitle: 'Earn points and complete missions',
    items: [
      { id: 'rewards', label: 'Rewards', icon: Gift, description: 'Points & missions' },
    ],
  },
  {
    title: 'Finance',
    subtitle: 'Money in & out',
    items: [
      { id: 'onramp', label: 'Buy Crypto', icon: CreditCard, description: 'Card & bank deposit' },
      { id: 'offramp', label: 'Sell Crypto', icon: Landmark, description: 'Withdraw to bank' },
      { id: 'send', label: 'Send', icon: ArrowRightLeft, description: 'Transfer crypto' },
      { id: 'receive', label: 'Receive', icon: ArrowRightLeft, description: 'Get paid' },
    ],
  },
  {
    title: 'Gaming',
    subtitle: 'Fund & play',
    items: [
      { id: 'betting', label: 'Betting', icon: Trophy, description: 'Fund betting wallet' },
    ],
  },
];

const providers: Record<string, { name: string; logo: string; color: string }[]> = {
  data: [
    { name: 'MTN', logo: 'MTN', color: 'var(--muted-foreground)' },
    { name: 'Vodafone', logo: 'VDF', color: '#E60000' },
    { name: 'AirtelTigo', logo: 'AT', color: 'var(--muted-foreground)' },
  ],
  airtime: [
    { name: 'MTN', logo: 'MTN', color: 'var(--muted-foreground)' },
    { name: 'Vodafone', logo: 'VDF', color: '#E60000' },
    { name: 'AirtelTigo', logo: 'AT', color: 'var(--muted-foreground)' },
  ],
  electricity: [
    { name: 'ECG', logo: 'ECG', color: 'var(--muted-foreground)' },
    { name: 'VRA', logo: 'VRA', color: 'var(--muted-foreground)' },
  ],
  bills: [
    { name: 'DSTV', logo: 'DSTV', color: 'var(--muted-foreground)' },
    { name: 'GOtv', logo: 'GO', color: 'var(--muted-foreground)' },
    { name: 'Ghana Water', logo: 'GW', color: 'var(--muted-foreground)' },
  ],
  betting: [
    { name: 'SportyBet', logo: 'SB', color: 'var(--muted-foreground)' },
    { name: 'Betway', logo: 'BW', color: 'var(--muted-foreground)' },
    { name: '1xBet', logo: '1X', color: 'var(--muted-foreground)' },
  ],
};

const dataBundles = [
  { label: '500 MB', value: 2, popular: false },
  { label: '1 GB', value: 5, popular: false },
  { label: '5 GB', value: 15, popular: true },
  { label: '10 GB', value: 30, popular: false },
  { label: '20 GB', value: 50, popular: false },
  { label: 'Unlimited', value: 100, popular: false },
];

const airtimeAmounts = [1, 2, 5, 10, 20, 50];

const isBillService = (id: string) => ['data', 'airtime', 'electricity', 'bills', 'betting'].includes(id);

export function ServicesScreen({ navigate, goBack, switchTab }: ServicesScreenProps) {
  const [activeService, setActiveService] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [meterNumber, setMeterNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [step, setStep] = useState<'hub' | 'detail' | 'success'>('hub');
  const [successInfo, setSuccessInfo] = useState<{ label: string; amount: number; provider: string } | null>(null);
  const [receiptTx, setReceiptTx] = useState<Transaction | null>(null);

  const handleServiceClick = (item: ServiceItem) => {
    if (isBillService(item.id)) {
      setActiveService(item.id);
      setSelectedProvider(null);
      setSelectedAmount(null);
      setCustomAmount('');
      setMeterNumber('');
      setPhoneNumber('');
      setStep('detail');
    } else {
      navigate(item.id as Screen);
    }
  };

  const handlePay = () => {
    const amount = selectedAmount ?? parseFloat(customAmount);
    if (!amount || !selectedProvider) return;
    const allItems = serviceGroups.flatMap(g => g.items);
    const item = allItems.find(i => i.id === activeService);
    setSuccessInfo({ label: item?.label ?? '', amount, provider: selectedProvider });
    setReceiptTx({
      id: 'svc_' + Date.now(),
      type: 'send',
      asset: 'USD',
      amount,
      valueUSD: amount,
      status: 'confirmed',
      time: 'Just now',
      username: selectedProvider,
    });
    setStep('success');
  };

  const canPay = () => {
    const amount = selectedAmount ?? parseFloat(customAmount);
    if (!amount || amount <= 0 || !selectedProvider) return false;
    if (activeService === 'electricity' && meterNumber.length < 8) return false;
    if ((activeService === 'data' || activeService === 'airtime') && phoneNumber.length < 9) return false;
    return true;
  };

  const reset = () => {
    setActiveService(null);
    setSelectedProvider(null);
    setSelectedAmount(null);
    setCustomAmount('');
    setMeterNumber('');
    setPhoneNumber('');
    setStep('hub');
    setSuccessInfo(null);
  };

  const activeItem = serviceGroups.flatMap(g => g.items).find(i => i.id === activeService);

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />

      {/* Header */}
      <div className="flex items-center gap-3 px-5 mb-6">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => { if (step === 'hub') switchTab('home'); else reset(); }}
          aria-label="Back"
          className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <ArrowLeft size={18} style={{ color: 'var(--foreground)' }} />
        </motion.button>
        <div>
          <h1 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 24, letterSpacing: -0.5, lineHeight: 1.1 }}>
            {step === 'hub' ? 'Service Hub' : activeItem?.label ?? ''}
          </h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginTop: 2 }}>
            {step === 'hub' ? 'Everything you need in one place' : step === 'success' ? 'Payment complete' : 'Choose provider & amount'}
          </p>
        </div>
      </div>

      {/* Hub View */}
      {step === 'hub' && (
        <div className="px-5 pb-5">
          {serviceGroups.map((group, gi) => (
            <motion.div
              key={group.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: gi * 0.08 }}
              className="mb-6"
            >
              <div className="flex items-baseline justify-between mb-3">
                <div>
                  <h2 style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 16 }}>{group.title}</h2>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{group.subtitle}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {group.items.map((item, ii) => {
                  const Icon = item.icon;
                  return (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: gi * 0.08 + ii * 0.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleServiceClick(item)}
                      className="flex flex-col gap-3 p-4 rounded-[20px] text-left"
                      style={{
                        background: 'var(--card)',
                        border: '1px solid var(--border)',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                      }}
                    >
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center glass-card glass-refraction"
                        style={{ background: 'var(--muted)' }}
                      >
                        <Icon size={20} style={{ color: 'var(--foreground)' }} strokeWidth={2} />
                      </div>
                      <div>
                        <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>{item.label}</p>
                        <p style={{ color: 'var(--muted-foreground)', fontSize: 11, marginTop: 2 }}>{item.description}</p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          ))}

          {/* Security note */}
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-[14px] mt-2" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <Shield size={16} style={{ color: 'var(--muted-foreground)' }} />
            <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
              All payments are secured with bank-grade encryption
            </p>
          </div>
        </div>
      )}

      {/* Detail Flow */}
      {step === 'detail' && activeItem && (
        <div className="px-5 pb-5">
          {/* Service header */}
          <div className="flex items-center gap-3 mb-5 p-4 rounded-[16px]" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center glass-card glass-refraction" style={{ background: 'var(--muted)' }}>
              <activeItem.icon size={20} style={{ color: 'var(--foreground)' }} />
            </div>
            <div>
              <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>{activeItem.label}</p>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{activeItem.description}</p>
            </div>
          </div>

          {/* Provider Selection */}
          {!selectedProvider && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-3">
              <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14, marginBottom: 2 }}>Select Provider</p>
              {providers[activeService]?.map((p, i) => (
                <motion.button
                  key={p.name}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedProvider(p.name)}
                  className="flex items-center gap-3 p-3.5 rounded-[14px] text-left"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--muted)' }}>
                    <span style={{ color: 'var(--foreground)', fontSize: 10, fontWeight: 800 }}>{p.logo}</span>
                  </div>
                  <span style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14, flex: 1 }}>{p.name}</span>
                  <ChevronRight size={16} style={{ color: 'var(--muted-foreground)' }} />
                </motion.button>
              ))}
            </motion.div>
          )}

          {/* Amount + Details */}
          {selectedProvider && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-5">
              {(activeService === 'data' || activeService === 'airtime') && (
                <div>
                  <label style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13, marginBottom: 8, display: 'block' }}>Phone Number</label>
                  <div className="flex items-center gap-3 p-3.5 rounded-[14px]" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                    <Phone size={18} style={{ color: 'var(--muted-foreground)' }} />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 11))}
                      placeholder="024 123 4567"
                      className="flex-1 bg-transparent outline-none"
                      style={{ color: 'var(--foreground)', fontSize: 15 }}
                    />
                  </div>
                </div>
              )}

              {activeService === 'electricity' && (
                <div>
                  <label style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13, marginBottom: 8, display: 'block' }}>Meter Number</label>
                  <div className="flex items-center gap-3 p-3.5 rounded-[14px]" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                    <Zap size={18} style={{ color: 'var(--muted-foreground)' }} />
                    <input
                      type="tel"
                      value={meterNumber}
                      onChange={(e) => setMeterNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                      placeholder="Enter meter number"
                      className="flex-1 bg-transparent outline-none"
                      style={{ color: 'var(--foreground)', fontSize: 15 }}
                    />
                  </div>
                </div>
              )}

              {activeService === 'data' && (
                <div>
                  <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Choose Bundle</p>
                  <div className="grid grid-cols-3 gap-2.5">
                    {dataBundles.map((bundle) => (
                      <motion.button
                        key={bundle.label}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { setSelectedAmount(bundle.value); setCustomAmount(''); }}
                        className="relative p-3 rounded-[14px] text-center"
                        style={{
                          background: selectedAmount === bundle.value ? 'var(--primary)' : 'var(--card)',
                          border: `1px solid ${selectedAmount === bundle.value ? 'var(--primary)' : 'var(--border)'}`,
                        }}
                      >
                        {bundle.popular && (
                          <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-white" style={{ background: 'var(--positive)', fontSize: 8, fontWeight: 700 }}>POPULAR</span>
                        )}
                        <p style={{ color: selectedAmount === bundle.value ? '#fff' : 'var(--foreground)', fontWeight: 700, fontSize: 13 }}>{bundle.label}</p>
                        <p style={{ color: selectedAmount === bundle.value ? 'var(--foreground)' : 'var(--muted-foreground)', fontSize: 11 }}>${bundle.value}</p>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {activeService === 'airtime' && (
                <div>
                  <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Select Amount</p>
                  <div className="grid grid-cols-3 gap-2.5">
                    {airtimeAmounts.map((amt) => (
                      <motion.button
                        key={amt}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { setSelectedAmount(amt); setCustomAmount(''); }}
                        className="p-3 rounded-[14px] text-center"
                        style={{
                          background: selectedAmount === amt ? 'var(--primary)' : 'var(--card)',
                          border: `1px solid ${selectedAmount === amt ? 'var(--primary)' : 'var(--border)'}`,
                        }}
                      >
                        <p style={{ color: selectedAmount === amt ? '#fff' : 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>${amt}</p>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {(activeService === 'electricity' || activeService === 'bills' || activeService === 'betting') && (
                <div>
                  <label style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13, marginBottom: 8, display: 'block' }}>Amount</label>
                  <div className="flex items-center gap-3 p-3.5 rounded-[14px]" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--muted-foreground)', fontSize: 18, fontWeight: 700 }}>$</span>
                    <input
                      type="number"
                      value={customAmount}
                      onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
                      placeholder="0.00"
                      className="flex-1 bg-transparent outline-none"
                      style={{ color: 'var(--foreground)', fontSize: 18, fontWeight: 700 }}
                    />
                  </div>
                  {activeService === 'electricity' && (
                    <div className="flex gap-2 mt-3">
                      {[10, 20, 50, 100, 200].map(amt => (
                        <button
                          key={amt}
                          onClick={() => { setCustomAmount(String(amt)); setSelectedAmount(null); }}
                          className="px-3 py-1.5 rounded-lg"
                          style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)', fontWeight: 600, fontSize: 13 }}
                        >
                          ${amt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Summary */}
              <div className="rounded-[16px] p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="flex justify-between py-1.5">
                  <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Provider</span>
                  <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}>{selectedProvider}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Service</span>
                  <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}>{activeItem.label}</span>
                </div>
                <div className="flex justify-between pt-2.5" style={{ borderTop: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--foreground)', fontSize: 14, fontWeight: 700 }}>Total</span>
                  <span style={{ color: 'var(--foreground)', fontSize: 18, fontWeight: 800 }}>
                    ${selectedAmount ?? (customAmount || '0')}
                  </span>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handlePay}
                disabled={!canPay()}
                className="w-full py-4 rounded-[16px] text-white"
                style={{
                  background: canPay() ? 'var(--primary)' : 'var(--muted)',
                  fontWeight: 700,
                  fontSize: 15,
                  boxShadow: canPay() ? 'none' : 'none',
                  opacity: canPay() ? 1 : 0.5,
                }}
              >
                {canPay() ? `Pay $${selectedAmount ?? customAmount}` : 'Enter details to continue'}
              </motion.button>
            </motion.div>
          )}
        </div>
      )}

      {/* Success */}
      {step === 'success' && successInfo && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-5 flex flex-col items-center justify-center"
          style={{ minHeight: '65%' }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.1 }}
            className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
            style={{ background: 'var(--muted)', border: '2px solid var(--positive)' }}
          >
            <Check size={40} style={{ color: 'var(--positive)' }} strokeWidth={3} />
          </motion.div>
          <h2 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 20, marginBottom: 6 }}>Payment Successful</h2>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 14, textAlign: 'center', marginBottom: 24 }}>
            {successInfo.label} payment of ${successInfo.amount} to {successInfo.provider} completed
          </p>
          <div className="w-full rounded-[16px] p-4 mb-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="flex justify-between py-2">
              <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Service</span>
              <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}>{successInfo.label}</span>
            </div>
            <div className="flex justify-between py-2">
              <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Provider</span>
              <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}>{successInfo.provider}</span>
            </div>
            <div className="flex justify-between py-2" style={{ borderTop: '1px solid var(--border)', marginTop: 4 }}>
              <span style={{ color: 'var(--foreground)', fontSize: 14, fontWeight: 700 }}>Amount Paid</span>
              <span style={{ color: 'var(--foreground)', fontSize: 18, fontWeight: 800 }}>${successInfo.amount}</span>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={reset}
            className="w-full py-3.5 rounded-[16px] text-white mb-3"
            style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 15, boxShadow: 'none' }}
          >
            New Payment
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setReceiptTx(receiptTx)}
            className="w-full py-3.5 rounded-[16px] flex items-center justify-center gap-2 mb-3"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)', fontWeight: 600, fontSize: 15 }}
          >
            <Receipt size={18} style={{ color: 'var(--foreground)' }} />
            View Receipt
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => switchTab('home')}
            className="w-full py-3.5 rounded-[16px]"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)', fontWeight: 600, fontSize: 15 }}
          >
            Back to Home
          </motion.button>
        </motion.div>
      )}

      <TransactionReceipt tx={receiptTx} open={!!receiptTx} onClose={() => setReceiptTx(null)} />

      <div style={{ height: 100 }} />
    </div>
  );
}
