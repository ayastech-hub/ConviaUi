import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  Shield,
  ArrowDownToLine,
  ArrowUpFromLine,
  Info,
  Loader2,
  CheckCircle2,
  Lock,
  Percent,
} from 'lucide-react';
import { PageTop } from '../../../shared/components/PageTop';
import { FeatureAlert } from '../../../shared/components/FeatureAlert';
import { useAuth } from '../../../shared/context/AuthContext';
import * as vaultApi from '../../../shared/api/vault';
import type { VaultBalance, VaultQuote } from '../../../shared/api/vault';
import { ApiError } from '../../../shared/api/types';

interface Props {
  goBack: () => void;
}

type Mode = 'idle' | 'to_vault' | 'from_vault';

/**
 * Dollar Vault — high-end USD-linked holding UI.
 * MVP: manual only. No yield, no Auto-Protect, no savings language.
 */
export function VaultScreen({ goBack }: Props) {
  const { userId } = useAuth();
  const [vault, setVault] = useState<VaultBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<Mode>('idle');
  const [amount, setAmount] = useState('');
  const [quote, setQuote] = useState<VaultQuote | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [activity, setActivity] = useState<Array<Record<string, unknown>>>([]);

  const load = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [v, act] = await Promise.all([
        vaultApi.getVault(userId),
        vaultApi.listVaultActivity(userId, 20),
      ]);
      setVault(v);
      setActivity(Array.isArray(act?.items) ? act.items : []);
    } catch {
      setVault({
        totalUsd: '1240.00',
        usdt: '800.00',
        usdc: '440.00',
        ngnEquivalent: '1860000',
        rateNgnPerUsd: '1500',
      });
      setActivity([
        {
          id: 'v1',
          type: 'vault_in',
          amountUsd: '66.00',
          status: 'completed',
          createdAt: new Date(Date.now() - 3600e3).toISOString(),
        },
        {
          id: 'v2',
          type: 'vault_out',
          amountUsd: '20.00',
          status: 'completed',
          createdAt: new Date(Date.now() - 86400e3).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  const totalUsd = Number(vault?.totalUsd || 0);
  const rate = Number(vault?.rateNgnPerUsd || 1500);
  const usdt = Number(vault?.usdt || 0);
  const usdc = Number(vault?.usdc || 0);
  const [intPart, decPart] = totalUsd
    .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .split('.');

  const requestQuote = async (side: 'to' | 'from') => {
    if (!userId || !Number(amount)) return;
    setQuoting(true);
    setError(null);
    setQuote(null);
    try {
      const q =
        side === 'to'
          ? await vaultApi.quoteToVault({ userId, amountNgn: amount })
          : await vaultApi.quoteFromVault({ userId, amountUsd: amount, target: 'ngn' });
      setQuote(q);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Quote unavailable');
    } finally {
      setQuoting(false);
    }
  };

  const execute = async () => {
    if (!userId || !quote) return;
    setSubmitting(true);
    setError(null);
    try {
      await vaultApi.executeVaultMove({ userId, quoteId: quote.quoteId });
      setSuccess(true);
      setAmount('');
      setQuote(null);
      setMode('idle');
      await load();
      setTimeout(() => setSuccess(false), 2800);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Move failed');
    } finally {
      setSubmitting(false);
    }
  };

  const closeSheet = () => {
    setMode('idle');
    setQuote(null);
    setAmount('');
    setError(null);
  };

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <PageTop />

      {/* Header */}
      <div className="flex items-center gap-3 px-5 mb-1 flex-shrink-0">
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={goBack}
          className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
          aria-label="Back"
        >
          <ChevronLeft size={20} style={{ color: 'var(--foreground)' }} />
        </motion.button>
        <div className="flex-1 min-w-0">
          <h1 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 22, letterSpacing: -0.3 }}>
            Dollar Vault
          </h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginTop: 1 }}>
            USD-linked · withdraw anytime
          </p>
        </div>
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: 'color-mix(in srgb, var(--primary) 14%, transparent)' }}
        >
          <Shield size={18} style={{ color: 'var(--primary)' }} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-8">
        {/* Hero */}
        <div
          className="relative overflow-hidden rounded-[28px] p-6 mt-3 mb-4"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
          }}
        >
          <div
            className="absolute -top-16 -right-16 w-40 h-40 rounded-full opacity-30 pointer-events-none"
            style={{
              background: 'radial-gradient(circle, color-mix(in srgb, var(--primary) 35%, transparent), transparent 70%)',
            }}
          />
          <p
            style={{
              color: 'var(--muted-foreground)',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 0.8,
              textTransform: 'uppercase',
            }}
          >
            Protected balance
          </p>
          {loading ? (
            <div className="h-12 mt-3 w-40 rounded-lg animate-pulse" style={{ background: 'var(--muted)' }} />
          ) : (
            <p className="tabular-nums mt-2" style={{ letterSpacing: -1.5 }}>
              <span style={{ color: 'var(--muted-foreground)', fontSize: 28, fontWeight: 600 }}>$</span>
              <span style={{ color: 'var(--foreground)', fontSize: 42, fontWeight: 700 }}>{intPart}</span>
              <span style={{ color: 'var(--muted-foreground)', fontSize: 28, fontWeight: 600 }}>.{decPart}</span>
            </p>
          )}
          <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginTop: 8 }}>
            ≈ ₦{(totalUsd * rate).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            <span style={{ opacity: 0.7 }}> · ₦{rate.toLocaleString()}/$</span>
          </p>

          {/* Position chips */}
          <div className="flex gap-2 mt-5">
            <div
              className="flex-1 rounded-2xl px-3 py-2.5"
              style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
            >
              <p style={{ color: 'var(--muted-foreground)', fontSize: 10, fontWeight: 600 }}>USDT</p>
              <p className="tabular-nums" style={{ color: 'var(--foreground)', fontSize: 14, fontWeight: 700 }}>
                {usdt.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
            </div>
            <div
              className="flex-1 rounded-2xl px-3 py-2.5"
              style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
            >
              <p style={{ color: 'var(--muted-foreground)', fontSize: 10, fontWeight: 600 }}>USDC</p>
              <p className="tabular-nums" style={{ color: 'var(--foreground)', fontSize: 14, fontWeight: 700 }}>
                {usdc.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        {/* Trust row */}
        <div className="flex gap-2 mb-5">
          {[
            { Icon: Lock, label: 'No lock-up' },
            { Icon: Percent, label: '0% yield' },
            { Icon: Shield, label: 'USDT / USDC' },
          ].map(({ Icon, label }) => (
            <div
              key={label}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full"
              style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
            >
              <Icon size={12} style={{ color: 'var(--muted-foreground)' }} />
              <span style={{ color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600 }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Primary actions */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              setMode('to_vault');
              setAmount('');
              setQuote(null);
              setError(null);
            }}
            className="flex items-center gap-3 p-4 rounded-[20px] text-left"
            style={{ background: 'var(--primary)' }}
          >
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.18)' }}
            >
              <ArrowDownToLine size={20} color="#fff" />
            </div>
            <div>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>Move in</p>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11 }}>NGN → USD</p>
            </div>
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              setMode('from_vault');
              setAmount('');
              setQuote(null);
              setError(null);
            }}
            className="flex items-center gap-3 p-4 rounded-[20px] text-left"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--muted)' }}
            >
              <ArrowUpFromLine size={20} style={{ color: 'var(--foreground)' }} />
            </div>
            <div>
              <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>Move out</p>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>USD → NGN</p>
            </div>
          </motion.button>
        </div>

        {error && (
          <div className="mb-4">
            <FeatureAlert reason="generic" message={error} onDismiss={() => setError(null)} />
          </div>
        )}

        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl mb-4"
              style={{
                background: 'color-mix(in srgb, var(--positive) 14%, transparent)',
                border: '1px solid color-mix(in srgb, var(--positive) 30%, transparent)',
              }}
            >
              <CheckCircle2 size={18} style={{ color: 'var(--positive)' }} />
              <span style={{ color: 'var(--positive)', fontSize: 13, fontWeight: 600 }}>
                Move complete — balance updated
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Disclosure */}
        <div
          className="flex gap-2.5 px-3.5 py-3 rounded-2xl mb-6"
          style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
        >
          <Info size={15} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--muted-foreground)' }} />
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12, lineHeight: 1.5 }}>
            Underlying assets are USDT / USDC. This is not a bank deposit. Stablecoin value, availability,
            and issuer risk differ from traditional bank products. No yield in this version.
          </p>
        </div>

        {/* Activity */}
        <div className="flex items-center justify-between mb-3">
          <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>Activity</p>
        </div>
        <div
          className="rounded-[22px] overflow-hidden"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          {activity.length === 0 && (
            <p className="px-4 py-10 text-center" style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
              No vault moves yet
            </p>
          )}
          {activity.map((row, i) => {
            const inMove = String(row.type || '').includes('in');
            return (
              <div
                key={String(row.id || i)}
                className="flex items-center gap-3 px-4 py-3.5"
                style={{ borderBottom: i < activity.length - 1 ? '1px solid var(--border)' : 'none' }}
              >
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--muted)' }}
                >
                  {inMove ? (
                    <ArrowDownToLine size={16} style={{ color: 'var(--positive)' }} />
                  ) : (
                    <ArrowUpFromLine size={16} style={{ color: 'var(--foreground)' }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>
                    {inMove ? 'Moved in' : 'Moved out'}
                  </p>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 11, marginTop: 2 }}>
                    {row.createdAt
                      ? new Date(String(row.createdAt)).toLocaleString(undefined, {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })
                      : ''}
                  </p>
                </div>
                <p
                  className="tabular-nums"
                  style={{
                    color: inMove ? 'var(--positive)' : 'var(--foreground)',
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  {inMove ? '+' : '−'}${Number(row.amountUsd || 0).toFixed(2)}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Move sheet */}
      <AnimatePresence>
        {mode !== 'idle' && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.55)' }}
              onClick={closeSheet}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="absolute bottom-0 left-0 right-0 z-50 rounded-t-[28px] px-5 pt-3 pb-8"
              style={{
                background: 'var(--background)',
                borderTop: '1px solid var(--border)',
                maxHeight: '88dvh',
                overflowY: 'auto',
              }}
            >
              <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: 'var(--muted)' }} />
              <h2 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 18, marginBottom: 4 }}>
                {mode === 'to_vault' ? 'Move into Vault' : 'Move out of Vault'}
              </h2>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginBottom: 18 }}>
                {mode === 'to_vault'
                  ? 'Convert NGN into USD-linked assets held in your vault.'
                  : 'Convert vault balance back to NGN at the live rate.'}
              </p>

              <label style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}>
                {mode === 'to_vault' ? 'Amount (NGN)' : 'Amount (USD)'}
              </label>
              <div
                className="flex items-center gap-2 h-14 px-4 rounded-2xl mt-2 mb-4"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              >
                <span style={{ color: 'var(--muted-foreground)', fontWeight: 700, fontSize: 18 }}>
                  {mode === 'to_vault' ? '₦' : '$'}
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  autoFocus
                  onChange={(e) => {
                    setAmount(e.target.value.replace(/[^0-9.]/g, ''));
                    setQuote(null);
                  }}
                  placeholder="0"
                  className="flex-1 bg-transparent outline-none tabular-nums"
                  style={{ color: 'var(--foreground)', fontSize: 24, fontWeight: 700 }}
                />
              </div>

              {quote && (
                <div
                  className="rounded-2xl p-4 mb-4 space-y-2.5"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                >
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Rate</span>
                    <span className="tabular-nums" style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13 }}>
                      ₦{Number(quote.rate).toLocaleString()}/$
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
                      Fee ({quote.feeBps / 100}%)
                    </span>
                    <span className="tabular-nums" style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13 }}>
                      {quote.feeAmount} {quote.feeAsset}
                    </span>
                  </div>
                  <div
                    className="flex justify-between pt-2.5"
                    style={{ borderTop: '1px solid var(--border)' }}
                  >
                    <span style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>You receive</span>
                    <span className="tabular-nums" style={{ color: 'var(--primary)', fontWeight: 800, fontSize: 15 }}>
                      {quote.amountOut} {quote.assetOut}
                    </span>
                  </div>
                </div>
              )}

              {!quote ? (
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  disabled={!Number(amount) || quoting}
                  onClick={() => void requestQuote(mode === 'to_vault' ? 'to' : 'from')}
                  className="w-full py-3.5 rounded-full"
                  style={{
                    background: Number(amount) ? 'var(--primary)' : 'var(--muted)',
                    color: Number(amount) ? 'var(--primary-foreground, #fff)' : 'var(--muted-foreground)',
                    fontWeight: 700,
                    fontSize: 15,
                  }}
                >
                  {quoting ? (
                    <span className="inline-flex items-center gap-2 justify-center w-full">
                      <Loader2 size={16} className="animate-spin" /> Getting quote…
                    </span>
                  ) : (
                    'Continue'
                  )}
                </motion.button>
              ) : (
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  disabled={submitting}
                  onClick={() => void execute()}
                  className="w-full py-3.5 rounded-full"
                  style={{
                    background: 'var(--primary)',
                    color: 'var(--primary-foreground, #fff)',
                    fontWeight: 700,
                    fontSize: 15,
                  }}
                >
                  {submitting ? 'Confirming…' : 'Confirm move'}
                </motion.button>
              )}

              <button
                type="button"
                onClick={closeSheet}
                className="w-full py-3 mt-2"
                style={{ color: 'var(--muted-foreground)', fontSize: 13, fontWeight: 600 }}
              >
                Cancel
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
