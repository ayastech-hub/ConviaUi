import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Building2, Trash2, Check, Loader, ChevronDown, Lock } from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import * as banksApi from '../../../shared/api/banks';
import type { BankAccount } from '../../../shared/api/banks';
import { ApiError } from '../../../shared/api/types';
import { FeatureAlert, mapApiCodeToReason } from '../../../shared/components/FeatureAlert';
import { ScreenHeader } from '../../../shared/components/ScreenHeader';
import { useBanksForCountry } from '../../../shared/hooks/useSupportedCountries';
import { useMyProfile } from '../../../shared/hooks/useMyProfile';
import { useLanguage } from '../../../shared/context/LanguageContext';

interface PaymentMethodsScreenProps {
  goBack: () => void;
}

/**
 * Bank accounts for off-ramp.
 * Country is taken from the user's profile / KYC (not a free picker).
 * Account name is the verified KYC name and is not editable.
 */
export function PaymentMethodsScreen({ goBack }: PaymentMethodsScreenProps) {
  const { t } = useLanguage();
  const { userId, status, displayName: sessionName } = useAuth();
  const { profile, loading: profileLoading } = useMyProfile();

  const country = (profile?.country || '').toUpperCase();
  const accountName = useMemo(() => {
    return (
      profile?.displayName?.trim() ||
      sessionName?.trim() ||
      profile?.username?.trim() ||
      ''
    );
  }, [profile, sessionName]);

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankOpen, setBankOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState<{ code?: string; message?: string } | null>(null);

  const { banks, currency: countryCurrency, loading: banksLoading } = useBanksForCountry(
    country || null,
  );
  const selectedBank = banks.find((b) => b.code === bankCode);

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

  const canAdd = Boolean(country && accountName && bankCode && accountNumber.trim().length >= 8);

  const handleAdd = async () => {
    if (!userId || !canAdd) return;
    setSaving(true);
    setApiError(null);
    try {
      await banksApi.addBankAccount(userId, {
        country,
        bankCode,
        accountNumber: accountNumber.trim(),
        accountName,
      });
      setShowAdd(false);
      setAccountNumber('');
      setBankCode('');
      await load();
    } catch (err) {
      if (err instanceof ApiError)
        setApiError({ code: err.code, message: err.body.message || err.message });
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
      <ScreenHeader title={t('paymentMethods.title') || 'Payment methods'} onBack={goBack} />

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
          <p
            style={{
              color: 'var(--muted-foreground)',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: 0.4,
            }}
          >
            BANK ACCOUNTS
          </p>
          {loadingList && (
            <Loader size={14} className="animate-spin" style={{ color: 'var(--muted-foreground)' }} />
          )}
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
              Add a local bank account to sell crypto to fiat.
            </p>
          </div>
        )}

        <div className="space-y-2.5 mb-6">
          {bankAccounts.map((b) => (
            <div
              key={b.id}
              className="flex items-center gap-3 rounded-[18px] px-4 py-3.5"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--muted)' }}
              >
                <Building2 size={18} style={{ color: 'var(--foreground)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ color: 'var(--foreground)', fontWeight: 650, fontSize: 14 }}>
                  {b.bankName || b.bankCode || 'Bank'}
                </p>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginTop: 2 }}>
                  {b.accountName ? `${b.accountName} · ` : ''}
                  •••• {b.last4 || (b.accountNumber || '').slice(-4)}
                  {b.country ? ` · ${b.country}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void handleRemove(b.id)}
                className="p-2 rounded-xl"
                style={{ color: 'var(--muted-foreground)' }}
                aria-label="Remove bank"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setApiError(null);
            setShowAdd(true);
          }}
          className="w-full flex items-center justify-center gap-2 h-12 rounded-full"
          style={{
            background: 'var(--primary)',
            color: 'var(--primary-foreground)',
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          <Plus size={18} />
          Add bank account
        </motion.button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div
            className="absolute inset-0 z-50 flex flex-col justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setShowAdd(false)} />
            <motion.div
              className="relative z-10 px-5 pt-4 pb-10 rounded-t-[28px]"
              style={{ background: 'var(--card)', borderTop: '1px solid var(--border)', maxHeight: '92%' }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            >
              <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: 'var(--border)' }} />
              <p style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 18, marginBottom: 16 }}>
                Add bank account
              </p>

              {(profileLoading || !country) && status === 'authenticated' && (
                <FeatureAlert
                  reason="generic"
                  message={
                    profileLoading
                      ? 'Loading your profile…'
                      : 'Set your country on your profile (KYC) before adding a bank.'
                  }
                />
              )}

              {/* Country — locked from profile */}
              <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
                Country
              </p>
              <div
                className="flex items-center gap-2.5 px-4 h-12 rounded-2xl mb-4"
                style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
              >
                <Lock size={14} style={{ color: 'var(--muted-foreground)' }} />
                <span style={{ color: 'var(--foreground)', fontWeight: 650, fontSize: 14 }}>
                  {country || '—'}
                  {countryCurrency ? ` · ${countryCurrency}` : ''}
                </span>
                <span style={{ color: 'var(--muted-foreground)', fontSize: 11, marginLeft: 'auto' }}>
                  From profile
                </span>
              </div>

              {/* Account name — KYC name, read-only */}
              <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
                Account name
              </p>
              <div
                className="flex items-center gap-2.5 px-4 h-12 rounded-2xl mb-4"
                style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
              >
                <Lock size={14} style={{ color: 'var(--muted-foreground)' }} />
                <span
                  className="truncate"
                  style={{ color: accountName ? 'var(--foreground)' : 'var(--muted-foreground)', fontWeight: 650, fontSize: 14 }}
                >
                  {accountName || 'Complete KYC to set legal name'}
                </span>
              </div>

              {/* Bank picker */}
              <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
                Bank
              </p>
              <button
                type="button"
                disabled={!country || banksLoading}
                onClick={() => setBankOpen((v) => !v)}
                className="w-full flex items-center justify-between px-4 h-12 rounded-2xl mb-2"
                style={{
                  background: 'var(--muted)',
                  border: '1px solid var(--border)',
                  color: 'var(--foreground)',
                  fontWeight: 600,
                  fontSize: 14,
                  opacity: !country ? 0.5 : 1,
                }}
              >
                <span>{selectedBank?.name || (banksLoading ? 'Loading banks…' : 'Select bank')}</span>
                <ChevronDown size={16} style={{ color: 'var(--muted-foreground)' }} />
              </button>

              {bankOpen && (
                <div
                  className="rounded-2xl overflow-hidden mb-4 max-h-40 overflow-y-auto"
                  style={{ border: '1px solid var(--border)' }}
                >
                  {banks.map((b) => (
                    <button
                      key={b.code}
                      type="button"
                      onClick={() => {
                        setBankCode(b.code);
                        setBankOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-4 py-3 text-left"
                      style={{
                        background: bankCode === b.code ? 'var(--muted)' : 'var(--card)',
                        borderBottom: '1px solid var(--border)',
                        color: 'var(--foreground)',
                        fontSize: 14,
                        fontWeight: bankCode === b.code ? 700 : 500,
                      }}
                    >
                      {b.name}
                      {bankCode === b.code && <Check size={14} style={{ color: 'var(--primary)' }} />}
                    </button>
                  ))}
                  {!banksLoading && banks.length === 0 && (
                    <p className="px-4 py-3" style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
                      No banks for this country
                    </p>
                  )}
                </div>
              )}

              {/* Account number */}
              <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
                Account number
              </p>
              <input
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\s/g, ''))}
                placeholder="Enter account number"
                inputMode="numeric"
                className="w-full mb-6 px-4 h-12 rounded-2xl outline-none"
                style={{
                  background: 'var(--muted)',
                  color: 'var(--foreground)',
                  border: '1px solid var(--border)',
                  fontSize: 15,
                }}
              />

              <motion.button
                whileTap={{ scale: 0.98 }}
                disabled={saving || !canAdd}
                onClick={() => void handleAdd()}
                className="w-full h-12 rounded-full"
                style={{
                  background: 'var(--primary)',
                  color: 'var(--primary-foreground)',
                  fontWeight: 700,
                  opacity: saving || !canAdd ? 0.45 : 1,
                }}
              >
                {saving ? 'Saving…' : 'Save bank account'}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
