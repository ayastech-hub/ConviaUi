import { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, HandCoins } from 'lucide-react';
import type { Screen } from '../../../shared/data/mockData';
import { useAuth } from '../../../shared/context/AuthContext';
import { useLanguage } from '../../../shared/context/LanguageContext';
import { useWalletAssets } from '../../../shared/hooks/useWalletAssets';
import {
  createMoneyRequest,
  listMoneyRequests,
  payMoneyRequest,
  declineMoneyRequest,
  cancelMoneyRequest,
  type MoneyRequestItem,
} from '../../../shared/api/moneyRequests';
import { ApiError } from '../../../shared/api/types';
import { queryClient, queryKeys } from '../../../shared/query/queryClient';

interface Props {
  goBack: () => void;
  navigate?: (s: Screen) => void;
}

export function RequestMoneyScreen({ goBack }: Props) {
  const { userId } = useAuth();
  const { t } = useLanguage();
  const { assets } = useWalletAssets();
  const [tab, setTab] = useState<'create' | 'incoming' | 'outgoing'>('create');
  const [payerUsername, setPayerUsername] = useState('');
  const [amount, setAmount] = useState('');
  const [asset, setAsset] = useState('USDT');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [incoming, setIncoming] = useState<MoneyRequestItem[]>([]);
  const [outgoing, setOutgoing] = useState<MoneyRequestItem[]>([]);

  const load = useCallback(async () => {
    try {
      const [inc, out] = await Promise.all([
        listMoneyRequests('incoming'),
        listMoneyRequests('outgoing'),
      ]);
      setIncoming(inc.items || []);
      setOutgoing(out.items || []);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const symbols = (assets?.length ? assets : [{ symbol: 'USDT' }]).map((a) => a.symbol);
  const uniqueSymbols = [...new Set(['USDT', 'ETH', ...symbols])];

  const submit = async () => {
    setErr(null);
    setMsg(null);
    if (!userId) {
      setErr('Sign in required');
      return;
    }
    const uname = payerUsername.trim().replace(/^@/, '');
    if (uname.length < 3) {
      setErr('Enter a valid @username');
      return;
    }
    if (/^\+?\d{8,}$/.test(uname)) {
      setErr('Use @username, not a phone number');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setErr('Enter an amount');
      return;
    }
    setBusy(true);
    try {
      const res = await createMoneyRequest({
        payerUsername: uname,
        asset,
        amount: String(amount),
        note: note || undefined,
      });
      setMsg(`${t('request.success')} · @${res.payerUsername}`);
      setPayerUsername('');
      setAmount('');
      setNote('');
      void load();
    } catch (e) {
      setErr(e instanceof ApiError ? e.body?.message || e.message : 'Request failed');
    } finally {
      setBusy(false);
    }
  };

  const onPay = async (id: string) => {
    setBusy(true);
    setErr(null);
    try {
      await payMoneyRequest(id);
      if (userId) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.portfolio(userId) });
      }
      void load();
    } catch (e) {
      setErr(e instanceof ApiError ? e.body?.message || e.message : 'Pay failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />
      <div className="flex items-center gap-3 px-5 mb-4">
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={goBack}
          className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: 'var(--muted)' }}
        >
          <ChevronLeft size={20} style={{ color: 'var(--foreground)' }} />
        </motion.button>
        <div>
          <h2 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 20 }}>{t('request.title')}</h2>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{t('request.subtitle')}</p>
        </div>
      </div>

      <div className="flex gap-2 px-5 mb-4">
        {(['create', 'incoming', 'outgoing'] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className="px-3 py-1.5 rounded-full text-xs font-bold"
            style={{
              background: tab === k ? 'var(--primary)' : 'var(--muted)',
              color: tab === k ? '#fff' : 'var(--foreground)',
            }}
          >
            {k === 'create' ? t('request.title') : k === 'incoming' ? t('request.incoming') : t('request.outgoing')}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-28">
        {err && (
          <p className="mb-3 text-sm" style={{ color: 'var(--destructive)' }}>
            {err}
          </p>
        )}
        {msg && (
          <p className="mb-3 text-sm" style={{ color: 'var(--positive)' }}>
            {msg}
          </p>
        )}

        {tab === 'create' && (
          <div className="flex flex-col gap-3">
            <label className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>
              {t('request.payer')}
            </label>
            <input
              value={payerUsername}
              onChange={(e) => setPayerUsername(e.target.value)}
              placeholder="@username"
              className="px-4 py-3 rounded-[14px] outline-none"
              style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
            />
            <label className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>
              {t('request.amount')}
            </label>
            <div className="flex gap-2">
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                placeholder="0.00"
                className="flex-1 px-4 py-3 rounded-[14px] outline-none"
                style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
              />
              <select
                value={asset}
                onChange={(e) => setAsset(e.target.value)}
                className="px-3 py-3 rounded-[14px]"
                style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
              >
                {uniqueSymbols.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <label className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>
              {t('request.note')}
            </label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional"
              className="px-4 py-3 rounded-[14px] outline-none"
              style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
            />
            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              disabled={busy}
              onClick={() => void submit()}
              className="mt-2 w-full py-3.5 rounded-[16px] font-bold flex items-center justify-center gap-2"
              style={{ background: 'var(--primary)', color: '#fff' }}
            >
              <HandCoins size={18} />
              {t('request.submit')}
            </motion.button>
          </div>
        )}

        {tab === 'incoming' && (
          <div className="flex flex-col gap-2">
            {!incoming.length && (
              <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>{t('request.empty')}</p>
            )}
            {incoming.map((r) => (
              <div
                key={r.id}
                className="p-4 rounded-[16px]"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              >
                <p style={{ color: 'var(--foreground)', fontWeight: 700 }}>
                  @{r.requesterUsername} · {r.amount} {r.asset}
                </p>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
                  {r.status}
                  {r.note ? ` · ${r.note}` : ''}
                </p>
                {r.status === 'pending' && (
                  <div className="flex gap-2 mt-3">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void onPay(r.id)}
                      className="flex-1 py-2 rounded-xl font-bold text-sm"
                      style={{ background: 'var(--primary)', color: '#fff' }}
                    >
                      {t('request.pay')}
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void declineMoneyRequest(r.id).then(load)}
                      className="flex-1 py-2 rounded-xl font-bold text-sm"
                      style={{ background: 'var(--muted)', color: 'var(--foreground)' }}
                    >
                      {t('request.decline')}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === 'outgoing' && (
          <div className="flex flex-col gap-2">
            {!outgoing.length && (
              <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>{t('request.empty')}</p>
            )}
            {outgoing.map((r) => (
              <div
                key={r.id}
                className="p-4 rounded-[16px]"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              >
                <p style={{ color: 'var(--foreground)', fontWeight: 700 }}>
                  → @{r.payerUsername} · {r.amount} {r.asset}
                </p>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{r.status}</p>
                {r.status === 'pending' && (
                  <button
                    type="button"
                    className="mt-2 text-sm font-semibold"
                    style={{ color: 'var(--destructive)' }}
                    onClick={() => void cancelMoneyRequest(r.id).then(load)}
                  >
                    {t('request.cancel')}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
