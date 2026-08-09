import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Plus, Building, CreditCard, Trash2, Check, X, Phone, Shield, User } from 'lucide-react';
import { useCurrency, CURRENCIES } from '../../../shared/context/CurrencyContext';
import { usePaymentMethods } from '../../../shared/context/PaymentMethodsContext';
import { useAuth } from '../../../shared/context/AuthContext';
import * as banksApi from '../../../shared/api/banks';
import type { BankAccount } from '../../../shared/api/banks';
import { ApiError } from '../../../shared/api/types';
import { FeatureAlert, mapApiCodeToReason } from '../../../shared/components/FeatureAlert';

interface PaymentMethodsScreenProps {
  goBack: () => void;
}

export function PaymentMethodsScreen({ goBack }: PaymentMethodsScreenProps) {
  const { currency } = useCurrency();
  const { userId } = useAuth();
  const { cards, kycName, addCard, removeCard } = usePaymentMethods();
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [showAddBank, setShowAddBank] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [newBank, setNewBank] = useState({ bankName: '', bankCode: '', accountNumber: '', country: 'NG', currency: currency.code, type: 'bank' as 'bank' | 'mobile' });
  const [newCard, setNewCard] = useState({ number: '', expiry: '', cvc: '' });
  const [apiError, setApiError] = useState<{ code?: string; message?: string } | null>(null);
  const [loadingBanks, setLoadingBanks] = useState(false);

  const loadBanks = async () => {
    if (!userId) { setBankAccounts([]); return; }
    setLoadingBanks(true);
    try {
      const list = await banksApi.listBankAccounts(userId);
      setBankAccounts(Array.isArray(list) ? list : []);
    } catch {
      setBankAccounts([]);
    } finally {
      setLoadingBanks(false);
    }
  };

  useEffect(() => { void loadBanks(); }, [userId]);

  const handleAddBank = async () => {
    if (!userId) { setApiError({ message: 'Sign in required' }); return; }
    if (!newBank.bankCode || !newBank.accountNumber) return;
    setApiError(null);
    try {
      await banksApi.addBankAccount(userId, {
        country: newBank.country,
        bankCode: newBank.bankCode,
        accountNumber: newBank.accountNumber,
      });
      setNewBank({ bankName: '', bankCode: '', accountNumber: '', country: 'NG', currency: currency.code, type: 'bank' });
      setShowAddBank(false);
      await loadBanks();
    } catch (err) {
      if (err instanceof ApiError) setApiError({ code: err.code, message: err.body.message || err.message });
      else setApiError({ message: 'Could not add bank account' });
    }
  };

  const handleRemoveBank = async (id: string) => {
    if (!userId) return;
    try {
      await banksApi.removeBankAccount(userId, id);
      await loadBanks();
    } catch (err) {
      if (err instanceof ApiError) setApiError({ code: err.code, message: err.message });
    }
  };

  const handleAddCard = () => {
    if (!newCard.number || !newCard.expiry || !newCard.cvc) return;
    const last4 = newCard.number.replace(/\s/g, '').slice(-4);
    addCard({ brand: 'Visa', last4, expiry: newCard.expiry, color: 'var(--card)' });
    setNewCard({ number: '', expiry: '', cvc: '' });
    setShowAddCard(false);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />
      {apiError && (
        <div className="px-5">
          <FeatureAlert reason={mapApiCodeToReason(apiError.code)} message={apiError.message} detail={apiError.code} />
        </div>
      )}

      <div className="flex items-center gap-3 px-5 mb-6">
        <motion.button whileTap={{ scale: 0.9 }} onClick={goBack} className="w-10 h-10 rounded-2xl flex items-center justify-center glass-card" style={{ border: '1px solid var(--border)' }}>
          <ChevronLeft size={20} style={{ color: 'var(--foreground)' }} />
        </motion.button>
        <h2 style={{ color: 'var(--foreground)', fontWeight: 800 }}>Payment Methods</h2>
      </div>

      <div className="px-5">
        {/* KYC name notice */}
        <div className="flex items-start gap-2 p-3 rounded-[12px] mb-5" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
          <Shield size={14} style={{ color: 'var(--positive)', flexShrink: 0, marginTop: 1 }} />
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12, lineHeight: 1.5 }}>
            All accounts are registered under your KYC-verified name: <span style={{ color: 'var(--foreground)', fontWeight: 700 }}>{kycName}</span>. For security, the account holder name cannot be changed manually.
          </p>
        </div>

        {/* Bank Accounts & Mobile Money */}
        <div className="flex items-center justify-between mb-3">
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}>BANK ACCOUNTS & MOBILE MONEY</p>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowAddBank(!showAddBank)} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'var(--secondary)' }}>
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
                {/* Read-only KYC name display */}
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-[10px] mb-2" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
                  <User size={14} style={{ color: 'var(--muted-foreground)' }} />
                  <span style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>Account holder:</span>
                  <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}>{kycName}</span>
                </div>
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
          {bankAccounts.length > 0 ? bankAccounts.map((account, i) => (
            <div key={account.id} className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: i < bankAccounts.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--muted)' }}>
                {account.type === 'bank' ? <Building size={18} style={{ color: 'var(--foreground)' }} /> : <Phone size={18} style={{ color: 'var(--foreground)' }} />}
              </div>
              <div className="flex-1">
                <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>{account.bankName || account.bankCode || "Bank"}</p>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{account.accountNumber || (account.last4 ? `•••• ${account.last4}` : "—")} · {account.currency}</p>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 10 }}>{account.accountName}</p>
              </div>
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => void handleRemoveBank(account.id)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--muted)' }}>
                <Trash2 size={14} style={{ color: 'var(--destructive)' }} />
              </motion.button>
            </div>
          )) : (
            <div className="px-4 py-8 text-center">
              <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>No bank accounts added yet</p>
            </div>
          )}
        </div>

        {/* Cards */}
        <div className="flex items-center justify-between mb-3">
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}>CARDS</p>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowAddCard(!showAddCard)} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'var(--secondary)' }}>
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
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20" style={{ background: 'transparent', transform: 'translate(30%, -30%)' }} />
              <div className="flex items-start justify-between mb-8">
                <div>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600 }}>CONVIA CARD</p>
                  <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 16 }}>{card.brand}</p>
                </div>
                <CreditCard size={24} style={{ color: 'var(--muted-foreground)' }} />
              </div>
              <p style={{ color: 'var(--foreground)', fontSize: 16, fontFamily: 'monospace', letterSpacing: 2, marginBottom: 12 }}>•••• •••• •••• {card.last4}</p>
              <div className="flex items-center justify-between">
                <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Expires {card.expiry}</p>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => removeCard(card.id)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--muted)' }}>
                  <Trash2 size={14} style={{ color: 'var(--destructive)' }} />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex items-start gap-2 p-3 rounded-[12px] mb-6" style={{ background: 'var(--muted)', border: '1px solid var(--muted)' }}>
          <Check size={14} style={{ color: 'var(--foreground)', flexShrink: 0, marginTop: 1 }} />
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12, lineHeight: 1.5 }}>
            Your payment methods are encrypted and securely stored. We never share your banking details with third parties.
          </p>
        </div>
      </div>
    </div>
  );
}
