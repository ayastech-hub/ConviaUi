import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Plus, Building, CreditCard, Trash2, Check, X, Phone } from 'lucide-react';
import { useCurrency, CURRENCIES } from '../../context/CurrencyContext';

interface PaymentMethodsScreenProps {
  goBack: () => void;
}

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  currency: string;
  type: 'bank' | 'mobile';
}

interface Card {
  id: string;
  brand: string;
  last4: string;
  expiry: string;
  color: string;
}

export function PaymentMethodsScreen({ goBack }: PaymentMethodsScreenProps) {
  const { currency } = useCurrency();
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([
    { id: 'b1', bankName: 'GTBank', accountNumber: '0123456789', accountName: 'Kwame Mensah', currency: 'NGN', type: 'bank' },
    { id: 'b2', bankName: 'M-Pesa', accountNumber: '+254712345678', accountName: 'Kwame Mensah', currency: 'KES', type: 'mobile' },
  { id: 'b3', bankName: 'MTN MoMo', accountNumber: '+23324123456', accountName: 'Kwame Mensah', currency: 'GHS', type: 'mobile' },
  { id: 'b4', bankName: 'FNB', accountNumber: '9876543210', accountName: 'Kwame Mensah', currency: 'ZAR', type: 'bank' },
  { id: 'b5', bankName: 'Stanbic', accountNumber: '5544332211', accountName: 'Kwame Mensah', currency: 'UGX', type: 'bank' },
    { id: 'b6', bankName: 'CRDB Bank', accountNumber: '0152367890', accountName: 'Kwame Mensah', currency: 'TZS', type: 'bank' },
  ]);
  const [cards, setCards] = useState<Card[]>([
    { id: 'c1', brand: 'Visa', last4: '4242', expiry: '12/26', color: '#1A1F2E' },
  ]);
  const [showAddBank, setShowAddBank] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [newBank, setNewBank] = useState({ bankName: '', accountNumber: '', accountName: '', currency: currency.code, type: 'bank' as 'bank' | 'mobile' });
  const [newCard, setNewCard] = useState({ number: '', expiry: '', cvc: '' });

  const handleAddBank = () => {
    if (!newBank.bankName || !newBank.accountNumber || !newBank.accountName) return;
    setBankAccounts([...bankAccounts, { ...newBank, id: `b${Date.now()}` }]);
    setNewBank({ bankName: '', accountNumber: '', accountName: '', currency: currency.code, type: 'bank' });
    setShowAddBank(false);
  };

  const handleAddCard = () => {
    if (!newCard.number || !newCard.expiry || !newCard.cvc) return;
    const last4 = newCard.number.replace(/\s/g, '').slice(-4);
    setCards([...cards, { id: `c${Date.now()}`, brand: 'Visa', last4, expiry: newCard.expiry, color: '#1A1F2E' }]);
    setNewCard({ number: '', expiry: '', cvc: '' });
    setShowAddCard(false);
  };

  const removeBank = (id: string) => setBankAccounts(bankAccounts.filter(b => b.id !== id));
  const removeCard = (id: string) => setCards(cards.filter(c => c.id !== id));

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />

      <div className="flex items-center gap-3 px-5 mb-6">
        <motion.button whileTap={{ scale: 0.9 }} onClick={goBack} className="w-10 h-10 rounded-2xl flex items-center justify-center glass-card" style={{ border: '1px solid var(--border)' }}>
          <ChevronLeft size={20} style={{ color: 'var(--foreground)' }} />
        </motion.button>
        <h2 style={{ color: 'var(--foreground)', fontWeight: 800 }}>Payment Methods</h2>
      </div>

      <div className="px-5">
        {/* Bank Accounts & Mobile Money */}
        <div className="flex items-center justify-between mb-3">
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}>BANK ACCOUNTS & MOBILE MONEY</p>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowAddBank(!showAddBank)} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'var(--primary)' }}>
            <Plus size={16} className="text-white" />
          </motion.button>
        </div>

        <AnimatePresence>
          {showAddBank && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-3"
            >
              <div className="p-4 rounded-[16px] glass-card" style={{ border: '1px solid var(--border)' }}>
                <div className="flex gap-2 mb-3">
                  {(['bank', 'mobile'] as const).map(t => (
                    <button key={t} onClick={() => setNewBank({ ...newBank, type: t })} className="flex-1 py-2 rounded-[10px]" style={{ background: newBank.type === t ? 'var(--primary)' : 'var(--muted)', color: newBank.type === t ? '#FFF' : 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}>
                      {t === 'bank' ? 'Bank Account' : 'Mobile Money'}
                    </button>
                  ))}
                </div>
                <input placeholder={newBank.type === 'bank' ? 'Bank name' : 'Mobile money provider'} value={newBank.bankName} onChange={e => setNewBank({ ...newBank, bankName: e.target.value })} className="w-full px-3 py-2.5 rounded-[10px] mb-2 bg-transparent outline-none" style={{ background: 'var(--muted)', color: 'var(--foreground)', fontSize: 13, border: '1px solid var(--border)' }} />
                <input placeholder={newBank.type === 'bank' ? 'Account number' : 'Phone number'} value={newBank.accountNumber} onChange={e => setNewBank({ ...newBank, accountNumber: e.target.value })} className="w-full px-3 py-2.5 rounded-[10px] mb-2 bg-transparent outline-none" style={{ background: 'var(--muted)', color: 'var(--foreground)', fontSize: 13, border: '1px solid var(--border)' }} />
                <input placeholder="Account holder name" value={newBank.accountName} onChange={e => setNewBank({ ...newBank, accountName: e.target.value })} className="w-full px-3 py-2.5 rounded-[10px] mb-2 bg-transparent outline-none" style={{ background: 'var(--muted)', color: 'var(--foreground)', fontSize: 13, border: '1px solid var(--border)' }} />
                <select value={newBank.currency} onChange={e => setNewBank({ ...newBank, currency: e.target.value })} className="w-full px-3 py-2.5 rounded-[10px] mb-3 bg-transparent outline-none" style={{ background: 'var(--muted)', color: 'var(--foreground)', fontSize: 13, border: '1px solid var(--border)' }}>
                  {CURRENCIES.map(c => <option key={c.code} value={c.code} style={{ color: '#000' }}>{c.code} — {c.name}</option>)}
                </select>
                <div className="flex gap-2">
                  <motion.button whileTap={{ scale: 0.97 }} onClick={handleAddBank} className="flex-1 py-2.5 rounded-[10px] text-white" style={{ background: 'var(--primary)', fontSize: 13, fontWeight: 700 }}>Add</motion.button>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowAddBank(false)} className="px-4 py-2.5 rounded-[10px]" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', fontSize: 13, fontWeight: 600 }}><X size={16} /></motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="rounded-[20px] overflow-hidden glass-card mb-6" style={{ border: '1px solid var(--border)' }}>
          {bankAccounts.map((account, i) => (
            <div key={account.id} className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: i < bankAccounts.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.12)' }}>
                {account.type === 'bank' ? <Building size={18} style={{ color: 'var(--primary)' }} /> : <Phone size={18} style={{ color: 'var(--primary)' }} />}
              </div>
              <div className="flex-1">
                <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>{account.bankName}</p>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{account.accountNumber} · {account.currency}</p>
              </div>
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => removeBank(account.id)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)' }}>
                <Trash2 size={14} style={{ color: '#EF4444' }} />
              </motion.button>
            </div>
          ))}
        </div>

        {/* Cards */}
        <div className="flex items-center justify-between mb-3">
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}>CARDS</p>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowAddCard(!showAddCard)} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'var(--primary)' }}>
            <Plus size={16} className="text-white" />
          </motion.button>
        </div>

        <AnimatePresence>
          {showAddCard && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-3">
              <div className="p-4 rounded-[16px] glass-card" style={{ border: '1px solid var(--border)' }}>
                <input placeholder="Card number" value={newCard.number} onChange={e => setNewCard({ ...newCard, number: e.target.value })} className="w-full px-3 py-2.5 rounded-[10px] mb-2 bg-transparent outline-none" style={{ background: 'var(--muted)', color: 'var(--foreground)', fontSize: 13, border: '1px solid var(--border)' }} />
                <div className="flex gap-2 mb-3">
                  <input placeholder="MM/YY" value={newCard.expiry} onChange={e => setNewCard({ ...newCard, expiry: e.target.value })} className="flex-1 px-3 py-2.5 rounded-[10px] bg-transparent outline-none" style={{ background: 'var(--muted)', color: 'var(--foreground)', fontSize: 13, border: '1px solid var(--border)' }} />
                  <input placeholder="CVC" value={newCard.cvc} onChange={e => setNewCard({ ...newCard, cvc: e.target.value })} className="flex-1 px-3 py-2.5 rounded-[10px] bg-transparent outline-none" style={{ background: 'var(--muted)', color: 'var(--foreground)', fontSize: 13, border: '1px solid var(--border)' }} />
                </div>
                <div className="flex gap-2">
                  <motion.button whileTap={{ scale: 0.97 }} onClick={handleAddCard} className="flex-1 py-2.5 rounded-[10px] text-white" style={{ background: 'var(--primary)', fontSize: 13, fontWeight: 700 }}>Add Card</motion.button>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowAddCard(false)} className="px-4 py-2.5 rounded-[10px]" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', fontSize: 13, fontWeight: 600 }}><X size={16} /></motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col gap-3 mb-6">
          {cards.map(card => (
            <motion.div key={card.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative p-5 rounded-[20px] overflow-hidden" style={{ background: card.color, border: '1px solid var(--border)' }}>
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #6366F1, transparent)', transform: 'translate(30%, -30%)' }} />
              <div className="flex items-start justify-between mb-8">
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 600 }}>CONVIA CARD</p>
                  <p style={{ color: '#FFF', fontWeight: 700, fontSize: 16 }}>{card.brand}</p>
                </div>
                <CreditCard size={24} style={{ color: 'rgba(255,255,255,0.5)' }} />
              </div>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, fontFamily: 'monospace', letterSpacing: 2, marginBottom: 12 }}>•••• •••• •••• {card.last4}</p>
              <div className="flex items-center justify-between">
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Expires {card.expiry}</p>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => removeCard(card.id)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.2)' }}>
                  <Trash2 size={14} style={{ color: '#EF4444' }} />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex items-start gap-2 p-3 rounded-[12px] mb-6" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
          <Check size={14} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: 1 }} />
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12, lineHeight: 1.5 }}>
            Your payment methods are encrypted and securely stored. We never share your banking details with third parties.
          </p>
        </div>
      </div>
    </div>
  );
}
