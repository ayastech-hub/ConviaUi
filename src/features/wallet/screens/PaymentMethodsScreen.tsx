import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Plus, Building, Trash2, Check, X, Loader } from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import * as banksApi from '../../../shared/api/banks';
import type { BankAccount } from '../../../shared/api/banks';
import { ApiError } from '../../../shared/api/types';
import { FeatureAlert, mapApiCodeToReason } from '../../../shared/components/FeatureAlert';
import { useSupportedCountries, useBanksForCountry } from '../../../shared/hooks/useSupportedCountries';

interface PaymentMethodsScreenProps {
  goBack: () => void;
}

/** Bank accounts from API; country + bank list from GET /banks/countries and GET /banks. */
export function PaymentMethodsScreen({ goBack }: PaymentMethodsScreenProps) {
  const { userId, status } = useAuth();
  const { countries, loading: countriesLoading } = useSupportedCountries();
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [country, setCountry] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState<{ code?: string; message?: string } | null>(null);

  const { banks, currency: countryCurrency, loading: banksLoading } = useBanksForCountry(country || null);

  useEffect(() => {
    if (countries.length && !country) setCountry(countries[0].code);
  }, [countries, country]);

  useEffect(() => {
    setBankCode('');
  }, [country]);

  const load = async () => {
    if (!userId) return;
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
    if (!userId || !country || !bankCode || !accountNumber) return;
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

  const selectedBank = banks.find((b) => b.code === bankCode);

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />
      <div className="flex items-center gap-3 px-5 mb-5">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={goBack}
          className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
        >
          <ChevronLeft size={20} style={{ color: 'var(--foreground)' }} />
        </motion.button>
        <div className="flex-1">
          <h2 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 20 }}>Payment methods</h2>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Banks for supported countries</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowAdd(true)}
          className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: 'var(--primary)' }}
        >
          <Plus size={18} color="#fff" />
        </motion.button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-8">
        {status === 'anonymous' && (
          <FeatureAlert reason="generic" message="Sign in to manage bank accounts for off-ramp." />
        )}
        {apiError && (
          <FeatureAlert reason={mapApiCodeToReason(apiError.code)} message={apiError.message} detail={apiError.code} />
        )}

        {loadingList && (
          <div className="flex justify-center py-8">
            <Loader className="animate-spin" style={{ color: 'var(--muted-foreground)' }} />
          </div>
        )}

        {!loadingList && bankAccounts.length === 0 && (
          <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginBottom: 16 }}>
            No bank accounts yet. Add one from a supported country.
          </p>
        )}

        <div className="flex flex-col gap-2">
          {bankAccounts.map((b) => (
            <div
              key={b.id}
              className="flex items-center gap-3 p-4 rounded-[16px]"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--muted)' }}>
                <Building size={18} style={{ color: 'var(--foreground)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }} className="truncate">
                  {b.bankName || b.bankCode || 'Bank'}
                </p>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
                  {b.country} · {b.accountName || b.last4 || b.accountNumber || '—'}
                  {b.currency ? ` · ${b.currency}` : ''}
                </p>
              </div>
              <button type="button" onClick={() => void handleRemove(b.id)} aria-label="Remove">
                <Trash2 size={16} style={{ color: 'var(--destructive)' }} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex flex-col"
            style={{ background: 'var(--background)' }}
          >
            <div style={{ height: 50 }} />
            <div className="flex items-center gap-3 px-5 mb-4">
              <button type="button" onClick={() => setShowAdd(false)} aria-label="Close">
                <X size={22} style={{ color: 'var(--foreground)' }} />
              </button>
              <h3 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 18 }}>Add bank account</h3>
            </div>
            <div className="flex-1 overflow-y-auto px-5 pb-8">
              <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 8 }}>Country</p>
              {countriesLoading && <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Loading countries…</p>}
              <div className="flex flex-wrap gap-2 mb-4">
                {countries.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => setCountry(c.code)}
                    className="px-3 py-2 rounded-full"
                    style={{
                      background: country === c.code ? 'var(--primary)' : 'var(--muted)',
                      color: country === c.code ? '#fff' : 'var(--foreground)',
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {c.name} ({c.code})
                  </button>
                ))}
              </div>

              <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 8 }}>
                Bank {countryCurrency ? `· ${countryCurrency}` : ''}
              </p>
              {banksLoading && <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Loading banks…</p>}
              <div className="rounded-[16px] overflow-hidden mb-4" style={{ border: '1px solid var(--border)' }}>
                {banks.map((b, i) => (
                  <button
                    key={b.code}
                    type="button"
                    onClick={() => setBankCode(b.code)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left"
                    style={{
                      background: bankCode === b.code ? 'var(--muted)' : 'var(--card)',
                      borderBottom: i < banks.length - 1 ? '1px solid var(--border)' : 'none',
                    }}
                  >
                    <div className="flex-1">
                      <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13 }}>{b.name}</p>
                      <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{b.code}</p>
                    </div>
                    {bankCode === b.code && <Check size={16} style={{ color: 'var(--primary)' }} />}
                  </button>
                ))}
                {!banksLoading && banks.length === 0 && (
                  <p className="p-4" style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
                    No banks for this country.
                  </p>
                )}
              </div>

              <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 8 }}>Account number</p>
              <input
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Account number"
                className="w-full px-3 py-3 rounded-[12px] mb-4 outline-none"
                style={{ background: 'var(--muted)', color: 'var(--foreground)', border: '1px solid var(--border)' }}
              />

              {selectedBank && (
                <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 12 }}>
                  Adding {selectedBank.name} in {country}
                </p>
              )}

              <button
                type="button"
                disabled={saving || !bankCode || !accountNumber}
                onClick={() => void handleAdd()}
                className="w-full py-3.5 rounded-[16px] text-white"
                style={{
                  background: 'var(--primary)',
                  fontWeight: 700,
                  opacity: saving || !bankCode || !accountNumber ? 0.5 : 1,
                }}
              >
                {saving ? 'Saving…' : 'Save bank account'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
