import { motion, AnimatePresence } from 'motion/react';
import { Building, Phone, ChevronDown, CheckCircle2, AlertCircle, Plus } from 'lucide-react';
import type { BankAccount } from '../../../../shared/context/PaymentMethodsContext';

interface PayoutAccountSelectorProps {
  currencyCode: string;
  compatibleAccounts: BankAccount[];
  selectedAccount?: BankAccount;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  onSelect: (id: string) => void;
  onAddAccount: () => void;
}

/** Payout bank/mobile-money account selector for the Off-Ramp form, from saved accounts only. */
export function PayoutAccountSelector({
  currencyCode, compatibleAccounts, selectedAccount, open, onToggle, onClose, onSelect, onAddAccount,
}: PayoutAccountSelectorProps) {
  return (
    <div className="mb-4">
      <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 8 }}>Payout Account</p>

      {compatibleAccounts.length === 0 ? (
        <div className="rounded-[16px] p-5 text-center" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
          <AlertCircle size={28} style={{ color: 'var(--warning)', margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>No {currencyCode} account found</p>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 16 }}>Add a bank account or mobile money wallet in {currencyCode} to receive payouts.</p>
          <motion.button whileTap={{ scale: 0.97 }} onClick={onAddAccount} className="w-full py-3 rounded-[12px] text-white flex items-center justify-center gap-2" style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 14 }}>
            <Plus size={16} /> Add Account
          </motion.button>
        </div>
      ) : (
        <div className="relative">
          <button onClick={onToggle} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-[16px] glass-card" style={{ border: '1px solid var(--border)' }}>
            {selectedAccount ? (
              <>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--muted)' }}>
                  {selectedAccount.type === 'bank' ? <Building size={18} style={{ color: 'var(--foreground)' }} /> : <Phone size={18} style={{ color: 'var(--foreground)' }} />}
                </div>
                <div className="flex-1 text-left">
                  <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>{selectedAccount.bankName}</p>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{selectedAccount.accountNumber} · {selectedAccount.currency}</p>
                </div>
              </>
            ) : (
              <span style={{ color: 'var(--muted-foreground)', fontSize: 14, flex: 1, textAlign: 'left' }}>Select payout account</span>
            )}
            <ChevronDown size={18} style={{ color: 'var(--muted-foreground)' }} />
          </button>
          <AnimatePresence>
            {open && (
              <>
                <div className="fixed inset-0 z-40" onClick={onClose} />
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="absolute top-full left-0 right-0 mt-1 rounded-[16px] overflow-hidden glass-card z-50" style={{ border: '1px solid var(--border)', boxShadow: '0 12px 40px rgba(0,0,0,0.4)' }}>
                  {compatibleAccounts.map((acct) => (
                    <button key={acct.id} onClick={() => onSelect(acct.id)} className="w-full flex items-center gap-3 px-4 py-3" style={{ borderBottom: acct.id !== compatibleAccounts[compatibleAccounts.length - 1].id ? '1px solid var(--border)' : 'none' }}>
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--muted)' }}>
                        {acct.type === 'bank' ? <Building size={16} style={{ color: 'var(--foreground)' }} /> : <Phone size={16} style={{ color: 'var(--foreground)' }} />}
                      </div>
                      <div className="flex-1 text-left">
                        <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13 }}>{acct.bankName}</p>
                        <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{acct.accountNumber}</p>
                      </div>
                      {selectedAccount?.id === acct.id && <CheckCircle2 size={16} style={{ color: 'var(--foreground)' }} />}
                    </button>
                  ))}
                  <button onClick={onAddAccount} className="w-full flex items-center gap-3 px-4 py-3" style={{ borderTop: '1px solid var(--border)' }}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--muted)' }}><Plus size={16} style={{ color: 'var(--primary)' }} /></div>
                    <span style={{ color: 'var(--primary)', fontWeight: 600, fontSize: 13 }}>Add new account</span>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
