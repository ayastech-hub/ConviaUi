import { motion } from 'motion/react';
import { Building, Phone, CreditCard, Plus, Check, Lock } from 'lucide-react';
import type { SavedCard } from '../../../../shared/context/PaymentMethodsContext';

export type PaymentMethod = 'bank' | 'mobile' | 'card';

export interface NewCardDraft {
  number: string;
  expiry: string;
  cvc: string;
}

interface PaymentMethodSelectorProps {
  method: PaymentMethod;
  setMethod: (m: PaymentMethod) => void;
  cards: SavedCard[];
  selectedCardId: string | null;
  setSelectedCardId: (id: string | null) => void;
  showNewCard: boolean;
  setShowNewCard: (v: boolean) => void;
  newCard: NewCardDraft;
  setNewCard: (c: NewCardDraft) => void;
  onAddCard: () => void;
}

/** Bank/Mobile/Card payment method tabs, with saved-card selection and a new-card form. */
export function PaymentMethodSelector({
  method, setMethod, cards, selectedCardId, setSelectedCardId,
  showNewCard, setShowNewCard, newCard, setNewCard, onAddCard,
}: PaymentMethodSelectorProps) {
  return (
    <div className="mb-4">
      <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 8 }}>Payment Method</p>
      <div className="flex gap-2 mb-3 flex-wrap">
        {(['bank', 'mobile', 'card'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMethod(m)}
            className="flex-1 min-w-[80px] flex items-center justify-center gap-1.5 py-2.5 rounded-[12px]"
            style={{ background: method === m ? 'var(--primary)' : 'var(--card)', border: `1px solid ${method === m ? 'transparent' : 'var(--border)'}`, color: method === m ? '#FFF' : 'var(--muted-foreground)', fontSize: 13, fontWeight: 600 }}
          >
            {m === 'bank' ? <Building size={14} /> : m === 'mobile' ? <Phone size={14} /> : <CreditCard size={14} />}
            {m === 'bank' ? 'Bank' : m === 'mobile' ? 'Mobile' : 'Card'}
          </button>
        ))}
      </div>

      {method === 'card' && (
        <div className="flex flex-col gap-2">
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => { setSelectedCardId(card.id); setShowNewCard(false); }}
              className="flex items-center gap-3 p-3.5 rounded-[14px]"
              style={{ background: selectedCardId === card.id && !showNewCard ? 'var(--muted)' : 'var(--card)', border: `1.5px solid ${selectedCardId === card.id && !showNewCard ? 'var(--primary)' : 'var(--border)'}` }}
            >
              <CreditCard size={18} style={{ color: 'var(--foreground)' }} />
              <div className="flex-1 text-left">
                <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13 }}>{card.brand} •••• {card.last4}</p>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>Expires {card.expiry}</p>
              </div>
              {selectedCardId === card.id && !showNewCard && <Check size={16} style={{ color: 'var(--primary)' }} />}
            </button>
          ))}
          <button
            onClick={() => { setShowNewCard(!showNewCard); setSelectedCardId(null); }}
            className="flex items-center gap-3 p-3.5 rounded-[14px]"
            style={{ background: showNewCard ? 'var(--muted)' : 'var(--card)', border: `1.5px solid ${showNewCard ? 'var(--primary)' : 'var(--border)'}` }}
          >
            <Plus size={18} style={{ color: 'var(--primary)' }} />
            <span style={{ color: 'var(--primary)', fontWeight: 600, fontSize: 13 }}>Use a new card</span>
          </button>
          {showNewCard && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
              <div className="p-4 rounded-[14px] glass-card" style={{ border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <Lock size={14} style={{ color: 'var(--muted-foreground)' }} />
                  <span style={{ color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600 }}>SECURE CARD INPUT</span>
                </div>
                <input placeholder="Card number" value={newCard.number} onChange={(e) => setNewCard({ ...newCard, number: e.target.value })} className="w-full px-3 py-2.5 rounded-[10px] mb-2 bg-transparent outline-none" style={{ background: 'var(--muted)', color: 'var(--foreground)', fontSize: 13, border: '1px solid var(--border)' }} />
                <div className="flex gap-2 mb-3">
                  <input placeholder="MM/YY" value={newCard.expiry} onChange={(e) => setNewCard({ ...newCard, expiry: e.target.value })} className="flex-1 px-3 py-2.5 rounded-[10px] bg-transparent outline-none" style={{ background: 'var(--muted)', color: 'var(--foreground)', fontSize: 13, border: '1px solid var(--border)' }} />
                  <input placeholder="CVC" value={newCard.cvc} onChange={(e) => setNewCard({ ...newCard, cvc: e.target.value })} className="flex-1 px-3 py-2.5 rounded-[10px] bg-transparent outline-none" style={{ background: 'var(--muted)', color: 'var(--foreground)', fontSize: 13, border: '1px solid var(--border)' }} />
                </div>
                <motion.button whileTap={{ scale: 0.97 }} onClick={onAddCard} className="w-full py-2.5 rounded-[10px] text-white" style={{ background: 'var(--primary)', fontSize: 13, fontWeight: 700 }}>
                  Save Card and Use
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
