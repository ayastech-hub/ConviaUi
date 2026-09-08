import { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  ChevronLeft,
  Shield,
  ArrowDownToLine,
  ArrowUpFromLine,
  Info,
  Loader2,
} from 'lucide-react';
import { PageTop } from '../../../shared/components/PageTop';
import { FeatureAlert } from '../../../shared/components/FeatureAlert';
import { useAuth } from '../../../shared/context/AuthContext';
import { useCurrency } from '../../../shared/context/CurrencyContext';
import * as vaultApi from '../../../shared/api/vault';
import type { VaultBalance, VaultQuote } from '../../../shared/api/vault';
import { ApiError } from '../../../shared/api/types';

interface Props {
  goBack: () => void;
}

type Mode = 'idle' | 'to_vault' | 'from_vault' | 'done';

/**
 * Dollar Vault — USD-linked holding (USDT/USDC).
 * MVP: manual move only. No yield, no Auto-Protect, no "savings" language.
 */
export function VaultScreen({ goBack }: Props) {
  const { userId } = useAuth();
  const { format } = useCurrency();
  const [vault, setVault] = useState<VaultBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<Mode>('idle');
  const [amount, setAmount] = useState('');
  const [quote, setQuote] = useState<VaultQuote | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      /* mock offline still ok */
      setVault({
        totalUsd: '1240.00',
        usdt: '800.00',
        usdc: '440.00',
        ngnEquivalent: '1860000',
        rateNgnPerUsd: '1500',
      });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  const totalUsd = Number(vault?.totalUsd || 0);
  const rate = Number(vault?.rateNgnPerUsd || 1500);

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
      setMode('done');
      setAmount('');
      setQuote(null);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Move failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--background)' }}>
      <PageTop />
      <div className="flex items-center gap-3 px-5 mb-4">
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
        <div className="flex-1">
          <h1 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 22 }}>Dollar Vault</h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginTop: 2 }}>
            USD-linked balance · no lock-up
          </p>
        </div>
      </div>

      <div className="px-5 pb-10">
        {/* Hero balance */}
        <div
          className="rounded-[24px] p-5 mb-4"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Shield size={14} style={{ color: 'var(--primary)' }} />
            <span style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}>
              Dollar Vault
            </span>
          </div>
          {loading ? (
            <p style={{ color: 'var(--muted-foreground)', fontSize: 28 }}>…</p>
          ) : (
            <>
              <p
                className="tabular-nums"
                style={{ color: 'var(--foreground)', fontSize: 36, fontWeight: 700, letterSpacing: -1 }}
              >
                <span style={{ color: 'var(--muted-foreground)', fontSize: 22, fontWeight: 600 }}>$</span>
                {totalUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginTop: 6 }}>
                ≈ ₦{(totalUsd * rate).toLocaleString(undefined, { maximumFractionDigits: 0 })} at ₦
                {rate.toLocaleString()}/$
              </p>
              <div className="flex gap-4 mt-4 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                <div>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>USDT</p>
                  <p style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}>
                    {Number(vault?.usdt || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>USDC</p>
                  <p style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}>
                    {Number(vault?.usdc || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Disclosure */}
        <div
          className="flex gap-2.5 px-3.5 py-3 rounded-2xl mb-5"
          style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
        >
          <Info size={16} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--muted-foreground)' }} />
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12, lineHeight: 1.45 }}>
            Underlying assets are USDT / USDC. This is not a bank deposit. Stablecoin value, availability,
            and issuer risk differ from traditional savings. No yield and no lock-up in this version —
            withdraw anytime.
          </p>
        </div>

        {error && (
          <div className="mb-4">
            <FeatureAlert reason="generic" message={error} onDismiss={() => setError(null)} />
          </div>
        )}

        {/* Actions */}
        {mode === 'idle' && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setMode('to_vault');
                setAmount('');
                setQuote(null);
              }}
              className="flex flex-col items-center gap-2 py-5 rounded-[20px]"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: 'var(--muted)' }}
              >
                <ArrowDownToLine size={22} style={{ color: 'var(--primary)' }} />
              </div>
              <span style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>Move to Vault</span>
              <span style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>NGN → USD</span>
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setMode('from_vault');
                setAmount('');
                setQuote(null);
              }}
              className="flex flex-col items-center gap-2 py-5 rounded-[20px]"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: 'var(--muted)' }}
              >
                <ArrowUpFromLine size={22} style={{ color: 'var(--foreground)' }} />
              </div>
              <span style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>Move out</span>
              <span style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>USD → NGN</span>
            </motion.button>
          </div>
        )}

        {(mode === 'to_vault' || mode === 'from_vault') && (
          <div
            className="rounded-[20px] p-4 mb-6"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15, marginBottom: 12 }}>
              {mode === 'to_vault' ? 'Move NGN into Dollar Vault' : 'Move out of Dollar Vault'}
            </p>
            <label style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}>
              {mode === 'to_vault' ? 'Amount (NGN)' : 'Amount (USD)'}
            </label>
            <div
              className="flex items-center gap-2 h-14 px-4 rounded-2xl mt-2 mb-3"
              style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
            >
              <span style={{ color: 'var(--muted-foreground)', fontWeight: 600 }}>
                {mode === 'to_vault' ? '₦' : '$'}
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value.replace(/[^0-9.]/g, ''));
                  setQuote(null);
                }}
                placeholder="0"
                className="flex-1 bg-transparent outline-none tabular-nums"
                style={{ color: 'var(--foreground)', fontSize: 22, fontWeight: 700 }}
              />
            </div>

            {!quote && (
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                disabled={!Number(amount) || quoting}
                onClick={() => void requestQuote(mode === 'to_vault' ? 'to' : 'from')}
                className="w-full py-3.5 rounded-full mb-2"
                style={{
                  background: Number(amount) ? 'var(--primary)' : 'var(--muted)',
                  color: Number(amount) ? 'var(--primary-foreground, #fff)' : 'var(--muted-foreground)',
                  fontWeight: 700,
                }}
              >
                {quoting ? (
                  <span className="inline-flex items-center gap-2 justify-center">
                    <Loader2 size={16} className="animate-spin" /> Getting quote…
                  </span>
                ) : (
                  'Get quote'
                )}
              </motion.button>
            )}

            {quote && (
              <div className="mb-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--muted-foreground)' }}>Rate</span>
                  <span style={{ color: 'var(--foreground)', fontWeight: 600 }}>
                    ₦{Number(quote.rate).toLocaleString()}/$
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--muted-foreground)' }}>Fee ({quote.feeBps / 100}%)</span>
                  <span style={{ color: 'var(--foreground)', fontWeight: 600 }}>
                    {quote.feeAmount} {quote.feeAsset}
                  </span>
                </div>
                <div
                  className="flex justify-between pt-2"
                  style={{ borderTop: '1px solid var(--border)' }}
                >
                  <span style={{ color: 'var(--foreground)', fontWeight: 600 }}>You receive</span>
                  <span style={{ color: 'var(--primary)', fontWeight: 700 }}>
                    {quote.amountOut} {quote.assetOut}
                  </span>
                </div>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  disabled={submitting}
                  onClick={() => void execute()}
                  className="w-full py-3.5 rounded-full mt-2"
                  style={{
                    background: 'var(--primary)',
                    color: 'var(--primary-foreground, #fff)',
                    fontWeight: 700,
                  }}
                >
                  {submitting ? 'Confirming…' : 'Confirm move'}
                </motion.button>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setMode('idle');
                setQuote(null);
                setAmount('');
              }}
              className="w-full py-2"
              style={{ color: 'var(--muted-foreground)', fontSize: 13, fontWeight: 600 }}
            >
              Cancel
            </button>
          </div>
        )}

        {mode === 'done' && (
          <div
            className="rounded-[20px] p-5 mb-6 text-center"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 16 }}>Move complete</p>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginTop: 6 }}>
              Your Dollar Vault balance has been updated.
            </p>
            <button
              type="button"
              onClick={() => setMode('idle')}
              className="mt-4 px-5 py-2.5 rounded-full"
              style={{ background: 'var(--primary)', color: '#fff', fontWeight: 700, fontSize: 14 }}
            >
              Done
            </button>
          </div>
        )}

        {/* Activity */}
        <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15, marginBottom: 10 }}>
          Recent vault activity
        </p>
        <div
          className="rounded-[20px] overflow-hidden"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          {activity.length === 0 && (
            <p className="px-4 py-8 text-center" style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
              No vault moves yet
            </p>
          )}
          {activity.map((row, i) => {
            const type = String(row.type || '');
            const inMove = type.includes('in') || type === 'vault_in';
            return (
              <div
                key={String(row.id || i)}
                className="flex justify-between px-4 py-3.5"
                style={{ borderBottom: i < activity.length - 1 ? '1px solid var(--border)' : 'none' }}
              >
                <div>
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
                    fontWeight: 600,
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
    </div>
  );
}
