import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HandCoins, Inbox, Send, Check, X, Loader2, ChevronDown } from 'lucide-react';
import type { Screen } from '../../../shared/data/mockData';
import { useAuth } from '../../../shared/context/AuthContext';
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
import { PageTop } from '../../../shared/components/PageTop';
import { BackButton } from '../../../shared/components/BackButton';
import { AssetIcon } from '../../../shared/components/AssetIcon';
import { SetTransactionPinSheet } from '../../../shared/components/SetTransactionPinSheet';
import { ensureTransactionPin } from '../../../shared/security/ensureTransactionPin';

interface Props {
  goBack: () => void;
  navigate?: (s: Screen, param?: string) => void;
}

type Tab = 'create' | 'incoming' | 'outgoing';

export function RequestMoneyScreen({ goBack }: Props) {
  const { userId } = useAuth();
  const { assets } = useWalletAssets();
  const stables = useMemo(
    () =>
      assets.filter((a) => ['USDT', 'USDC', 'USD'].includes(a.symbol.toUpperCase())).map((a) => a.symbol) ||
      ['USDT', 'USDC'],
    [assets],
  );
  const tokenChoices = stables.length ? stables : ['USDT', 'USDC'];

  const [tab, setTab] = useState<Tab>('create');
  const [payerUsername, setPayerUsername] = useState('');
  const [amount, setAmount] = useState('');
  const [asset, setAsset] = useState(tokenChoices[0] || 'USDT');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [incoming, setIncoming] = useState<MoneyRequestItem[]>([]);
  const [outgoing, setOutgoing] = useState<MoneyRequestItem[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [assetOpen, setAssetOpen] = useState(false);
  const [payTargetId, setPayTargetId] = useState<string | null>(null);
  const [payPin, setPayPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [showSetPin, setShowSetPin] = useState(false);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setLoadingList(true);
    try {
      const [inc, out] = await Promise.all([
        listMoneyRequests('incoming'),
        listMoneyRequests('outgoing'),
      ]);
      setIncoming(Array.isArray(inc.items) ? inc.items : []);
      setOutgoing(Array.isArray(out.items) ? out.items : []);
    } catch {
      /* keep previous */
    } finally {
      setLoadingList(false);
    }
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const submit = async () => {
    setErr(null);
    setMsg(null);
    const uname = payerUsername.trim().replace(/^@/, '');
    const amt = amount.trim();
    if (!uname || uname.length < 2) {
      setErr('Enter the username of the person who should pay');
      return;
    }
    if (!amt || Number(amt) <= 0) {
      setErr('Enter a valid amount');
      return;
    }
    setBusy(true);
    try {
      const res = await createMoneyRequest({
        payerUsername: uname,
        asset: asset.toUpperCase(),
        amount: amt,
        note: note.trim() || undefined,
      });
      setMsg(`Request sent to @${res.payerUsername || uname}`);
      setPayerUsername('');
      setAmount('');
      setNote('');
      setTab('outgoing');
      void refresh();
    } catch (e) {
      if (e instanceof ApiError) {
        const code = String(e.code || e.body?.code || '');
        if (code.includes('payer_not_found')) setErr('That username was not found');
        else if (code.includes('cannot_request_self')) setErr('You cannot request from yourself');
        else if (code.includes('too_many')) setErr('Too many open requests — cancel one first');
        else setErr(String(e.body?.message || e.message || 'Could not create request'));
      } else setErr('Could not create request');
    } finally {
      setBusy(false);
    }
  };

  const openPayPin = async (id: string) => {
    if (userId) {
      const gate = await ensureTransactionPin(userId);
      if (!gate.ok && gate.hasPin === false) {
        setShowSetPin(true);
        setPayTargetId(id);
        return;
      }
    }
    setPayTargetId(id);
    setPayPin('');
    setPinError(null);
  };

  const confirmPayWithPin = async () => {
    if (!payTargetId) return;
    if (!/^\d{6}$/.test(payPin)) {
      setPinError('Enter your 6-digit transaction PIN');
      return;
    }
    setBusy(true);
    setErr(null);
    setPinError(null);
    try {
      await payMoneyRequest(payTargetId, payPin);
      if (userId) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.portfolio(userId) });
      }
      setMsg('Paid successfully');
      setPayTargetId(null);
      setPayPin('');
      void refresh();
    } catch (e) {
      if (e instanceof ApiError) {
        const code = String(e.code || e.body?.code || '');
        if (code.includes('pin_not_set') || /not set/i.test(String(e.message))) {
          setPayTargetId(null);
          setShowSetPin(true);
        } else if (code.includes('pin')) setPinError(String(e.body?.message || e.message || 'Invalid PIN'));
        else setErr(String(e.body?.message || e.message));
      } else setErr('Payment failed');
    } finally {
      setBusy(false);
    }
  };

  const actDecline = async (id: string) => {
    setBusy(true);
    try {
      await declineMoneyRequest(id);
      void refresh();
    } finally {
      setBusy(false);
    }
  };

  const actCancel = async (id: string) => {
    setBusy(true);
    try {
      await cancelMoneyRequest(id);
      void refresh();
    } finally {
      setBusy(false);
    }
  };

  const list = tab === 'incoming' ? incoming : outgoing;

  return (
    <div className="flex flex-col h-full min-h-0" style={{ background: 'var(--background)' }}>
      <PageTop />
      <div className="flex items-center gap-3 px-5 mb-3">
        <BackButton onClick={goBack} />
        <div className="flex-1 min-w-0">
          <h1 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 20 }}>Request</h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12.5 }}>Ask a Convia user to pay you</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 mb-4">
        <div
          className="flex p-1 rounded-2xl gap-1"
          style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
        >
          {(
            [
              { id: 'create' as const, label: 'New', Icon: HandCoins },
              { id: 'incoming' as const, label: 'Incoming', Icon: Inbox },
              { id: 'outgoing' as const, label: 'Sent', Icon: Send },
            ] as const
          ).map(({ id, label, Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-semibold"
                style={{
                  background: active ? 'var(--card)' : 'transparent',
                  color: active ? 'var(--foreground)' : 'var(--muted-foreground)',
                  boxShadow: active ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
                }}
              >
                <Icon size={14} />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {(msg || err) && (
        <div className="px-5 mb-3">
          <div
            className="px-3.5 py-2.5 rounded-xl text-[13px]"
            style={{
              background: err
                ? 'color-mix(in oklab, var(--destructive) 12%, var(--card))'
                : 'color-mix(in oklab, var(--positive) 12%, var(--card))',
              color: err ? 'var(--destructive)' : 'var(--positive)',
              border: `1px solid ${err ? 'var(--destructive)' : 'var(--positive)'}`,
            }}
          >
            {err || msg}
          </div>
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-10">
        {tab === 'create' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <Field label="Username">
              <div
                className="flex items-center gap-2 px-3.5 h-12 rounded-2xl"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              >
                <span style={{ color: 'var(--muted-foreground)', fontWeight: 600 }}>@</span>
                <input
                  value={payerUsername}
                  onChange={(e) => setPayerUsername(e.target.value.replace(/\s/g, ''))}
                  placeholder="username"
                  className="flex-1 bg-transparent outline-none text-[15px]"
                  style={{ color: 'var(--foreground)' }}
                  autoCapitalize="none"
                  autoCorrect="off"
                />
              </div>
            </Field>

            <Field label="Amount">
              <div
                className="flex items-center gap-2 px-3 h-14 rounded-2xl"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              >
                <button
                  type="button"
                  onClick={() => setAssetOpen(true)}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-full shrink-0"
                  style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
                >
                  <AssetIcon symbol={asset} size={22} />
                  <span style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 13 }}>{asset}</span>
                  <ChevronDown size={14} style={{ color: 'var(--muted-foreground)' }} />
                </button>
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                  placeholder="0.00"
                  inputMode="decimal"
                  className="flex-1 bg-transparent outline-none text-right tabular-nums text-[22px] font-bold"
                  style={{ color: 'var(--foreground)' }}
                />
              </div>
            </Field>

            <Field label="Note (optional)">
              <input
                value={note}
                onChange={(e) => setNote(e.target.value.slice(0, 120))}
                placeholder="What’s this for?"
                className="w-full px-3.5 h-12 rounded-2xl outline-none text-[15px]"
                style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
              />
            </Field>

            <button
              type="button"
              disabled={busy}
              onClick={() => void submit()}
              className="w-full h-12 rounded-full font-bold text-[15px] mt-2"
              style={{
                background: 'var(--primary)',
                color: 'var(--primary-foreground, #fff)',
                opacity: busy ? 0.75 : 1,
              }}
            >
              {busy ? 'Sending…' : 'Send request'}
            </button>
          </motion.div>
        )}

        {(tab === 'incoming' || tab === 'outgoing') && (
          <div>
            {loadingList && list.length === 0 && (
              <div className="flex justify-center py-16">
                <Loader2 className="animate-spin" style={{ color: 'var(--muted-foreground)' }} />
              </div>
            )}
            {!loadingList && list.length === 0 && (
              <p className="text-center py-16" style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
                {tab === 'incoming' ? 'No incoming requests' : 'No requests sent yet'}
              </p>
            )}
            <div className="space-y-2.5">
              {list.map((r) => (
                <RequestCard
                  key={r.id}
                  item={r}
                  tab={tab}
                  busy={busy}
                  onPay={() => openPayPin(r.id)}
                  onDecline={() => void actDecline(r.id)}
                  onCancel={() => void actCancel(r.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {userId && (
        <SetTransactionPinSheet
          open={showSetPin}
          userId={userId}
          onClose={() => setShowSetPin(false)}
          onComplete={() => {
            setShowSetPin(false);
            if (payTargetId) {
              setPayPin('');
              setPinError(null);
            }
          }}
        />
      )}
      {/* PIN sheet for paying a request */}
      <AnimatePresence>
        {payTargetId && (
          <>
            <motion.div
              className="fixed inset-0 z-[70]"
              style={{ background: 'rgba(0,0,0,0.55)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !busy && setPayTargetId(null)}
            />
            <motion.div
              initial={{ y: 48 }}
              animate={{ y: 0 }}
              exit={{ y: 48 }}
              className="fixed bottom-0 left-0 right-0 z-[71] mx-auto max-w-md rounded-t-[24px] px-5 pt-4 pb-8"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: 'var(--border)' }} />
              <p style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 17, marginBottom: 4 }}>
                Confirm payment
              </p>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginBottom: 16 }}>
                Enter your 6-digit transaction PIN
              </p>
              <input
                type="password"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={payPin}
                onChange={(e) => setPayPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full h-14 rounded-2xl text-center text-[22px] font-bold tracking-[0.4em] outline-none mb-2"
                style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                placeholder="••••••"
                autoFocus
              />
              {pinError && (
                <p style={{ color: 'var(--destructive)', fontSize: 12.5, marginBottom: 8 }}>{pinError}</p>
              )}
              <button
                type="button"
                disabled={busy || payPin.length !== 6}
                onClick={() => void confirmPayWithPin()}
                className="w-full h-12 rounded-full font-bold text-[15px] mt-2"
                style={{
                  background: payPin.length === 6 ? 'var(--primary)' : 'var(--muted)',
                  color: payPin.length === 6 ? 'var(--primary-foreground, #fff)' : 'var(--muted-foreground)',
                }}
              >
                {busy ? 'Paying…' : 'Pay now'}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => setPayTargetId(null)}
                className="w-full h-11 rounded-full font-semibold text-[14px] mt-2"
                style={{ color: 'var(--muted-foreground)' }}
              >
                Cancel
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {assetOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[60]"
              style={{ background: 'rgba(0,0,0,0.5)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAssetOpen(false)}
            />
            <motion.div
              initial={{ y: 40 }}
              animate={{ y: 0 }}
              exit={{ y: 40 }}
              className="fixed bottom-0 left-0 right-0 z-[61] mx-auto max-w-md rounded-t-[24px] px-4 pt-3 pb-8"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <div className="w-10 h-1 rounded-full mx-auto mb-3" style={{ background: 'var(--border)' }} />
              <p style={{ color: 'var(--foreground)', fontWeight: 700, marginBottom: 8 }}>Token</p>
              {tokenChoices.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setAsset(s);
                    setAssetOpen(false);
                  }}
                  className="w-full flex items-center gap-3 py-3"
                  style={{ borderBottom: '1px solid var(--border)' }}
                >
                  <AssetIcon symbol={s} size={32} />
                  <span style={{ color: 'var(--foreground)', fontWeight: 700 }}>{s}</span>
                  {asset === s && <Check size={16} style={{ color: 'var(--primary)', marginLeft: 'auto' }} />}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p
        style={{
          color: 'var(--muted-foreground)',
          fontSize: 11,
          fontWeight: 650,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          marginBottom: 8,
        }}
      >
        {label}
      </p>
      {children}
    </div>
  );
}

function RequestCard({
  item,
  tab,
  busy,
  onPay,
  onDecline,
  onCancel,
}: {
  item: MoneyRequestItem;
  tab: Tab;
  busy: boolean;
  onPay: () => void;
  onDecline: () => void;
  onCancel: () => void;
}) {
  const pending = String(item.status).toLowerCase() === 'pending';
  const who =
    tab === 'incoming'
      ? item.requesterUsername || 'Someone'
      : item.payerUsername || 'User';

  return (
    <div
      className="rounded-[18px] px-4 py-3.5"
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-start gap-3">
        <AssetIcon symbol={item.asset} size={36} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="tabular-nums" style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 16 }}>
              {item.amount} {item.asset}
            </p>
            <StatusPill status={item.status} />
          </div>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12.5, marginTop: 2 }}>
            {tab === 'incoming' ? `From @${who}` : `To @${who}`}
          </p>
          {item.note && (
            <p className="truncate" style={{ color: 'var(--muted-foreground)', fontSize: 12, marginTop: 4 }}>
              {item.note}
            </p>
          )}
        </div>
      </div>
      {pending && tab === 'incoming' && (
        <div className="flex gap-2 mt-3">
          <button
            type="button"
            disabled={busy}
            onClick={onPay}
            className="flex-1 h-10 rounded-full font-semibold text-[13px]"
            style={{ background: 'var(--primary)', color: 'var(--primary-foreground, #fff)' }}
          >
            Pay
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onDecline}
            className="h-10 px-4 rounded-full font-semibold text-[13px]"
            style={{ background: 'var(--muted)', color: 'var(--foreground)', border: '1px solid var(--border)' }}
          >
            Decline
          </button>
        </div>
      )}
      {pending && tab === 'outgoing' && (
        <button
          type="button"
          disabled={busy}
          onClick={onCancel}
          className="w-full h-10 rounded-full font-semibold text-[13px] mt-3"
          style={{ background: 'var(--muted)', color: 'var(--foreground)', border: '1px solid var(--border)' }}
        >
          Cancel request
        </button>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const s = (status || '').toLowerCase();
  const color =
    s === 'pending'
      ? 'var(--warning, #f59e0b)'
      : s === 'paid' || s === 'completed'
        ? 'var(--positive)'
        : 'var(--muted-foreground)';
  return (
    <span
      className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
      style={{
        color,
        background: `color-mix(in oklab, ${color} 14%, transparent)`,
      }}
    >
      {status}
    </span>
  );
}
