import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Building2, Trash2, Check, Loader, ChevronDown } from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import * as banksApi from '../../../shared/api/banks';
import type { BankAccount } from '../../../shared/api/banks';
import { ApiError } from '../../../shared/api/types';
import { FeatureAlert, mapApiCodeToReason } from '../../../shared/components/FeatureAlert';
import { ScreenHeader } from '../../../shared/components/ScreenHeader';
import { useSupportedCountries, useBanksForCountry } from '../../../shared/hooks/useSupportedCountries';
import { useLanguage } from '../../../shared/context/LanguageContext';

interface PaymentMethodsScreenProps {
  goBack: () => void;
}

/**
 * Bank accounts for off-ramp — same flow as before (list + sheet),
 * but country & bank directory come from the API.
 */
export function PaymentMethodsScreen({ goBack }: PaymentMethodsScreenProps) {
  const { t } = useLanguage();
  const { userId, status } = useAuth();
  const { countries, loading: countriesLoading } = useSupportedCountries();
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [country, setCountry] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankOpen, setBankOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState<{ code?: string; message?: string } | null>(null);

  const { banks, currency: countryCurrency, loading: banksLoading } = useBanksForCountry(country || null);
  const selectedBank = banks.find((b) => b.code === bankCode);

  useEffect(() => {
    if (countries.length && !country) setCountry(countries[0].code);
  }, [countries, country]);

  useEffect(() => {
    setBankCode('');
    setBankOpen(false);
  }, [country]);

  const load = async () => {
    if (!userId) {
      setBankAccounts([]);
      return;
    }
    setLoadingList(true);
    try {
      const list = await banksApi.listBankAccounts(userId);
      setBankAccounts(Array.isArray(list) ? list : []);
    } catch {
      setBankAccounts([]);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    void load();
  }, [userId]);

  const handleAdd = async () => {
    if (!userId || !country || !bankCode || accountNumber.trim().length < 8) return;
    setSaving(true);
    setApiError(null);
    try {
      await banksApi.addBankAccount(userId, {
        country,
        bankCode,
        accountNumber: accountNumber.trim(),
      });
      setShowAdd(false);
      setAccountNumber('');
      setBankCode('');
      await load();
    } catch (err) {
      if (err instanceof ApiError) setApiError({ code: err.code, message: err.body.message || err.message });
      else setApiError({ message: 'Could not add bank account' });
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (id: string) => {
    if (!userId) return;
    try {
      await banksApi.removeBankAccount(userId, id);
      setBankAccounts((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      if (err instanceof ApiError) setApiError({ code: err.code, message: err.message });
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />
      <ScreenHeader title={t('paymentMethods.title')} onBack={goBack} />

      <div className="flex-1 overflow-y-auto px-5 pb-28">
        {status === 'anonymous' && (
          <FeatureAlert reason="generic" message="Sign in to save bank accounts for off-ramp." />
        )}
        {apiError && (
          <FeatureAlert
            reason={mapApiCodeToReason(apiError.code)}
            message={apiError.message}
            detail={apiError.code}
          />
        )}

        <div className="flex items-center justify-between mb-3">
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600, letterSpacing: 0.4 }}>
            BANK ACCOUNTS
          </p>
          {loadingList && <Loader size={14} className="animate-spin" style={{ color: 'var(--muted-foreground)' }} />}
        </div>

        {!loadingList && bankAccounts.length === 0 && (
          <div
            className="rounded-[20px] p-6 mb-4 text-center"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <Building2 size={28} className="mx-auto mb-3" style={{ color: 'var(--muted-foreground)' }} />
            <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15, marginBottom: 6 }}>
              No banks linked
            </p>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 13, lineHeight: 1.45 }}>
              Add a bank in a supported country. Account name is set from your verified KYC identity on the server.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-2.5">
          {bankAccounts.map((b) => (
            <motion.div
              key={b.id}
              layout
              className="flex items-center gap-3 p-4 rounded-[18px]"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--muted)' }}
              >
                <Building2 size={18} style={{ color: 'var(--foreground)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }} className="truncate">
                  {b.bankName || b.bankCode || 'Bank'}
                </p>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }} className="truncate">
                  {[b.country, b.accountName || (b.accountNumber ? `••${String(b.accountNumber).slice(-4)}` : null), b.currency]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void handleRemove(b.id)}
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--muted)' }}
                aria-label="Remove bank"
              >
                <Trash2 size={15} style={{ color: 'var(--destructive)' }} />
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Sticky add CTA — matches prior bottom-action pattern */}
      <div
        className="absolute bottom-0 left-0 right-0 p-5"
        style={{ background: 'linear-gradient(transparent, var(--background) 30%)' }}
      >
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAdd(true)}
          className="w-full py-3.5 rounded-[16px] flex items-center justify-center gap-2 text-white"
          style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 15 }}
        >
          <Plus size={18} /> Add bank account
        </motion.button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="absolute inset-0 z-50 flex flex-col"
            style={{ background: 'var(--background)' }}
          >
            <div style={{ height: 50 }} />
            <ScreenHeader title="Add bank account" onBack={() => setShowAdd(false)} />

            <div className="flex-1 overflow-y-auto px-5 pb-10">
              <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginBottom: 16, lineHeight: 1.45 }}>
                Choose a supported market, then pick a bank from the live directory.
              </p>

              <label style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}>Country</label>
              <div className="flex flex-wrap gap-2 mt-2 mb-5">
                {countriesLoading && (
                  <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Loading markets…</span>
                )}
                {countries.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => setCountry(c.code)}
                    className="px-3.5 py-2 rounded-full"
                    style={{
                      background: country === c.code ? 'var(--primary)' : 'var(--muted)',
                      color: country === c.code ? '#fff' : 'var(--foreground)',
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {c.name}
                  </button>
                ))}
              </div>

              <label style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}>
                Bank{countryCurrency ? ` · ${countryCurrency}` : ''}
              </label>
              <button
                type="button"
                onClick={() => setBankOpen((v) => !v)}
                className="w-full mt-2 mb-2 px-4 py-3.5 rounded-[14px] flex items-center justify-between"
                style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
              >
                <span style={{ color: selectedBank ? 'var(--foreground)' : 'var(--muted-foreground)', fontSize: 14 }}>
                  {banksLoading ? 'Loading banks…' : selectedBank ? selectedBank.name : 'Select bank'}
                </span>
                <ChevronDown size={16} style={{ color: 'var(--muted-foreground)' }} />
              </button>

              <AnimatePresence>
                {bankOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mb-4 rounded-[14px]"
                    style={{ border: '1px solid var(--border)', maxHeight: 220, overflowY: 'auto' }}
                  >
                    {banks.map((b) => (
                      <button
                        key={b.code}
                        type="button"
                        onClick={() => {
                          setBankCode(b.code);
                          setBankOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-3 text-left"
                        style={{
                          background: bankCode === b.code ? 'var(--muted)' : 'var(--card)',
                          borderBottom: '1px solid var(--border)',
                        }}
                      >
                        <span className="flex-1" style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}>
                          {b.name}
                        </span>
                        {bankCode === b.code && <Check size={16} style={{ color: 'var(--primary)' }} />}
                      </button>
                    ))}
                    {!banksLoading && banks.length === 0 && (
                      <p className="p-4" style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
                        No banks returned for this country.
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <label style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}>Account number</label>
              <input
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\s/g, ''))}
                placeholder="Enter account number"
                inputMode="numeric"
                className="w-full mt-2 mb-6 px-4 py-3.5 rounded-[14px] outline-none"
                style={{ background: 'var(--muted)', color: 'var(--foreground)', border: '1px solid var(--border)', fontSize: 15 }}
              />

              <motion.button
                whileTap={{ scale: 0.98 }}
                disabled={saving || !bankCode || accountNumber.trim().length < 8}
                onClick={() => void handleAdd()}
                className="w-full py-3.5 rounded-[16px] text-white"
                style={{
                  background: 'var(--primary)',
                  fontWeight: 700,
                  opacity: saving || !bankCode || accountNumber.trim().length < 8 ? 0.45 : 1,
                }}
              >
                {saving ? 'Saving…' : 'Save bank account'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
