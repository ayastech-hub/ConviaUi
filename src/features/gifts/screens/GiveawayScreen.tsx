import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gift, ScanLine, ChevronDown, Copy, Check, Share2 } from 'lucide-react';
import { PageTop } from '../../../shared/components/PageTop';
import { BackButton } from '../../../shared/components/BackButton';
import { AssetIcon } from '../../../shared/components/AssetIcon';
import { useWalletAssets } from '../../../shared/hooks/useWalletAssets';
import { useAuth } from '../../../shared/context/AuthContext';
import { GiftCard } from '../components/GiftCard';
import { QRScanner } from '../../../shared/components/QRScanner';
import {
  cancelGift,
  claimGift,
  createGift,
  getGift,
  listGifts,
  listRecentClaims,
} from '../store';
import { claimUrl, remainingAmount, remainingSlots, type Gift, type SplitMode } from '../types';

type Mode = 'hub' | 'create' | 'join' | 'detail';

interface Props {
  goBack: () => void;
}

const EXPIRY = [
  { id: '1d', label: '24h', ms: 864e5 },
  { id: '7d', label: '7 days', ms: 7 * 864e5 },
  { id: '30d', label: '30 days', ms: 30 * 864e5 },
];

export function GiveawayScreen({ goBack }: Props) {
  const [mode, setMode] = useState<Mode>('hub');
  const [detailId, setDetailId] = useState('');
  const [hubKey, setHubKey] = useState(0);
  const detail = detailId ? getGift(detailId) : null;

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <PageTop />
      <div className="flex items-center gap-3 px-5 mb-1">
        <BackButton
          onClick={() => {
            if (mode === 'hub') goBack();
            else {
              setMode('hub');
              setDetailId('');
              setHubKey((k) => k + 1);
            }
          }}
        />
        <h1 className="flex-1 text-center pr-10" style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 17 }}>
          {mode === 'create' ? 'Create' : mode === 'join' ? 'Join' : mode === 'detail' ? 'Passcode card' : 'Giveaway'}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col">
        <AnimatePresence mode="wait">
          {mode === 'hub' && (
            <motion.div key="hub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Hub
                key={hubKey}
                onCreate={() => setMode('create')}
                onJoin={() => setMode('join')}
                onOpen={(id) => {
                  setDetailId(id);
                  setMode('detail');
                }}
              />
            </motion.div>
          )}
          {mode === 'create' && (
            <motion.div key="create" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col" style={{ minHeight: '100%' }}>
              <CreateForm
                onDone={(id) => {
                  setDetailId(id);
                  setMode('detail');
                }}
              />
            </motion.div>
          )}
          {mode === 'join' && (
            <motion.div key="join" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <JoinForm />
            </motion.div>
          )}
          {mode === 'detail' && detail && (
            <motion.div key="detail" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Detail gift={detail} onRefresh={(g) => setDetailId(g.id)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Hub({
  onCreate,
  onJoin,
  onOpen,
}: {
  onCreate: () => void;
  onJoin: () => void;
  onOpen: (id: string) => void;
}) {
  const mine = useMemo(() => listGifts('giveaway').slice(0, 6), []);

  return (
    <div className="px-5 pb-12">
      <div className="flex flex-col items-center text-center pt-6 pb-8">
        <div
          className="w-20 h-20 rounded-[22px] flex items-center justify-center mb-4"
          style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
        >
          <Gift size={36} style={{ color: 'var(--primary)' }} strokeWidth={1.5} />
        </div>
        <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 15, lineHeight: 1.45 }}>
          Share crypto with friends.
          <br />
          Create a giveaway today.
        </p>
        <div className="flex gap-3 w-full mt-6">
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={onCreate}
            className="flex-1 py-3.5 rounded-2xl font-bold text-[14px]"
            style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            Create
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={onJoin}
            className="flex-1 py-3.5 rounded-2xl font-bold text-[14px]"
            style={{ background: 'var(--muted)', color: 'var(--foreground)', border: '1px solid var(--border)' }}
          >
            Join
          </motion.button>
        </div>
      </div>

      {mine.length > 0 && (
        <div className="mb-6">
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 700, marginBottom: 10 }}>
            YOUR GIVEAWAYS
          </p>
          {mine.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => onOpen(g.id)}
              className="w-full flex items-center justify-between py-3.5 text-left"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <div>
                <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>
                  {g.totalAmount} {g.asset}
                </p>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
                  {g.code} · {g.status}
                  {g.status === 'open' ? ` · ${remainingSlots(g)} left` : ''}
                </p>
              </div>
              <span style={{ color: 'var(--primary)', fontSize: 12, fontWeight: 600 }}>Open</span>
            </button>
          ))}
        </div>
      )}

      <div
        className="rounded-[20px] overflow-hidden"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <p className="px-4 pt-4 pb-2" style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 700 }}>
          FAQ
        </p>
        {[
          ['What is a giveaway?', 'Lock a crypto pool and share a passcode. Friends claim equal or random amounts until slots run out.'],
          ['How to create?', 'Tap Create, choose token, total, participants, equal or random, then share the card.'],
          ['How to join?', 'Tap Join, enter or paste the passcode, or scan the QR on the card.'],
          ['Unclaimed funds?', 'Cancel anytime — only the remaining unclaimed amount returns. Expired pools auto-return remaining.'],
        ].map(([q, a]) => (
          <FaqRow key={q} q={q} a={a} />
        ))}
      </div>
    </div>
  );
}

function FaqRow({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className="w-full text-left px-4 py-3.5"
      style={{ borderTop: '1px solid var(--border)' }}
    >
      <div className="flex items-center justify-between gap-3">
        <span style={{ color: 'var(--foreground)', fontSize: 14, fontWeight: 500 }}>{q}</span>
        <ChevronDown
          size={16}
          style={{
            color: 'var(--muted-foreground)',
            transform: open ? 'rotate(180deg)' : undefined,
            transition: 'transform 0.15s',
          }}
        />
      </div>
      {open && (
        <p className="mt-2" style={{ color: 'var(--muted-foreground)', fontSize: 13, lineHeight: 1.5 }}>
          {a}
        </p>
      )}
    </button>
  );
}

function CreateForm({ onDone }: { onDone: (id: string) => void }) {
  const { assets } = useWalletAssets();
  const { userId } = useAuth();
  const tokens = useMemo(() => {
    const list = assets.length ? assets : [];
    const prefer = list.filter((a) => a.balance > 0 || ['USDT', 'USDC', 'BTC', 'ETH'].includes(a.symbol));
    return prefer.length ? prefer : [{ symbol: 'USDT', balance: 0, name: 'Tether' } as any];
  }, [assets]);

  const [split, setSplit] = useState<SplitMode>('equal');
  const [showSplit, setShowSplit] = useState(false);
  const [slots, setSlots] = useState('');
  const [total, setTotal] = useState('');
  const [asset, setAsset] = useState(tokens[0]?.symbol || 'USDT');
  const [showToken, setShowToken] = useState(false);
  const [note, setNote] = useState('');
  const [expiry, setExpiry] = useState('1d');
  const [customDate, setCustomDate] = useState('');
  const [error, setError] = useState('');
  const selected = tokens.find((t: any) => t.symbol === asset);

  const nSlots = Math.max(0, Math.floor(Number(slots) || 0));
  const nTotal = Number(total) || 0;
  const per = nSlots > 0 && nTotal > 0 ? nTotal / nSlots : 0;

  const submit = () => {
    if (!(nTotal > 0)) return setError('Enter total amount');
    if (nSlots < 2) return setError('At least 2 participants');
    if (selected && selected.balance > 0 && nTotal > selected.balance) {
      return setError(`Available ${selected.balance} ${asset}`);
    }
    let expiresAt: string;
    if (customDate) {
      expiresAt = new Date(customDate + 'T23:59:59').toISOString();
      if (new Date(expiresAt).getTime() <= Date.now()) return setError('Pick a future date');
    } else {
      const opt = EXPIRY.find((e) => e.id === expiry) || EXPIRY[0];
      expiresAt = new Date(Date.now() + opt.ms).toISOString();
    }
    const gift = createGift({
      kind: 'giveaway',
      asset,
      totalAmount: nTotal,
      slots: nSlots,
      note,
      expiresAt,
      creatorId: userId || 'local',
      splitMode: split,
    });
    onDone(gift.id);
  };

  return (
    <div className="flex flex-col" style={{ minHeight: '100%' }}>
      <div className="px-5 space-y-4 flex-1">
        {/* Split mode */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowSplit(!showSplit)}
            className="flex items-center gap-1"
            style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 14 }}
          >
            {split === 'equal' ? 'Equal amount' : 'Random amount'}
            <ChevronDown size={16} />
          </button>
          {showSplit && (
            <div
              className="absolute z-10 mt-2 rounded-2xl overflow-hidden"
              style={{ background: 'var(--card)', border: '1px solid var(--border)', minWidth: 180 }}
            >
              {(['equal', 'random'] as SplitMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setSplit(m);
                    setShowSplit(false);
                  }}
                  className="block w-full text-left px-4 py-3"
                  style={{
                    color: split === m ? 'var(--primary)' : 'var(--foreground)',
                    fontWeight: 600,
                    fontSize: 14,
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  {m === 'equal' ? 'Equal amount' : 'Random amount'}
                </button>
              ))}
            </div>
          )}
        </div>

        <Field label="Max participants">
          <input
            value={slots}
            onChange={(e) => {
              setSlots(e.target.value.replace(/\D/g, ''));
              setError('');
            }}
            inputMode="numeric"
            placeholder="Number of people"
            className="w-full bg-transparent outline-none"
            style={{ color: 'var(--foreground)', fontSize: 15 }}
          />
        </Field>

        <Field
          label="Total amount"
          right={
            selected ? (
              <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
                Available {Number(selected.balance || 0).toLocaleString()}
              </span>
            ) : null
          }
        >
          <div className="flex items-center gap-2">
            <input
              value={total}
              onChange={(e) => {
                setTotal(e.target.value.replace(/[^0-9.]/g, ''));
                setError('');
              }}
              inputMode="decimal"
              placeholder="0.00"
              className="flex-1 bg-transparent outline-none tabular-nums"
              style={{ color: 'var(--foreground)', fontSize: 16, fontWeight: 600 }}
            />
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full"
                style={{ background: 'var(--muted)', fontSize: 13, fontWeight: 700, color: 'var(--foreground)' }}
              >
                <AssetIcon symbol={asset} size={16} />
                {asset}
                <ChevronDown size={14} />
              </button>
              {showToken && (
                <div
                  className="absolute right-0 top-full mt-1 z-10 rounded-2xl overflow-hidden max-h-48 overflow-y-auto"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)', minWidth: 140 }}
                >
                  {tokens.slice(0, 10).map((t: any) => (
                    <button
                      key={t.symbol}
                      type="button"
                      onClick={() => {
                        setAsset(t.symbol);
                        setShowToken(false);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2.5"
                      style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}
                    >
                      <AssetIcon symbol={t.symbol} size={16} />
                      {t.symbol}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Field>

        {nSlots >= 2 && nTotal > 0 && (
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
            {split === 'equal'
              ? `Each receives ${per.toLocaleString(undefined, { maximumFractionDigits: 8 })} ${asset}`
              : `Random share of ${nTotal} ${asset} across ${nSlots} people`}
          </p>
        )}

        <Field label="Custom message">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, 80))}
            placeholder="Optional message for claimers"
            className="w-full bg-transparent outline-none"
            style={{ color: 'var(--foreground)', fontSize: 15 }}
          />
        </Field>

        <Field label="Expires">
          <div className="flex gap-2 mb-2">
            {EXPIRY.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => {
                  setExpiry(o.id);
                  setCustomDate('');
                }}
                className="flex-1 py-2 rounded-full"
                style={{
                  background: expiry === o.id && !customDate ? 'var(--foreground)' : 'var(--muted)',
                  color: expiry === o.id && !customDate ? 'var(--background)' : 'var(--foreground)',
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {o.label}
              </button>
            ))}
          </div>
          <input
            type="date"
            value={customDate}
            min={new Date().toISOString().slice(0, 10)}
            onChange={(e) => {
              setCustomDate(e.target.value);
              if (e.target.value) setExpiry('custom');
            }}
            className="w-full bg-transparent outline-none"
            style={{ color: 'var(--foreground)', fontSize: 14 }}
          />
        </Field>

        {error && <p style={{ color: 'var(--destructive, #ef4444)', fontSize: 13 }}>{error}</p>}
      </div>

      <div
        className="mt-auto px-5 pt-3 pb-6"
        style={{
          background: 'var(--background)',
          borderTop: '1px solid var(--border)',
        }}
      >
        <div className="flex justify-between mb-3" style={{ fontSize: 13 }}>
          <span style={{ color: 'var(--muted-foreground)' }}>Total</span>
          <span className="tabular-nums" style={{ color: 'var(--foreground)', fontWeight: 700 }}>
            {nTotal > 0 ? `${nTotal} ${asset}` : `— ${asset}`}
          </span>
        </div>
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={submit}
          className="w-full py-4 rounded-full font-bold text-[15px]"
          style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
        >
          Create now
        </motion.button>
        <p className="text-center mt-2" style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>
          Unclaimed balance after expiry returns to you.
        </p>
      </div>
    </div>
  );
}

function extractCode(raw: string): string {
  const s = raw.trim();
  try {
    const u = new URL(s);
    const q = u.searchParams.get('claim') || u.pathname.split('/').filter(Boolean).pop() || '';
    return q.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);
  } catch {
    return s.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);
  }
}

function JoinForm() {
  const { userId } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ amount: number; asset: string } | null>(null);
  const [scanning, setScanning] = useState(false);
  const recent = useMemo(() => listRecentClaims(6), [success]);

  const paste = async () => {
    try {
      const t = await navigator.clipboard.readText();
      setCode(t.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12));
      setError('');
    } catch {
      setError('Paste not available');
    }
  };

  const confirm = () => {
    setError('');
    setSuccess(null);
    const res = claimGift(code, userId || 'claimer_local');
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setSuccess({ amount: res.amount, asset: res.gift.asset });
  };

  return (
    <div className="px-5 pb-12 space-y-5">
      <div>
        <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14, marginBottom: 10 }}>Passcode</p>
        <div
          className="flex items-center gap-2 px-3.5 h-12 rounded-2xl"
          style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
        >
          <input
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12));
              setError('');
              setSuccess(null);
            }}
            placeholder="Enter passcode"
            className="flex-1 bg-transparent outline-none tabular-nums tracking-widest"
            style={{ color: 'var(--foreground)', fontSize: 15, fontWeight: 600 }}
          />
          <button
            type="button"
            onClick={() => void paste()}
            style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 13 }}
          >
            Paste
          </button>
        </div>
      </div>

      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={confirm}
        className="w-full py-4 rounded-full font-bold text-[15px]"
        style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
      >
        Confirm
      </motion.button>

      {error && <p style={{ color: 'var(--destructive, #ef4444)', fontSize: 13 }}>{error}</p>}
      {success && (
        <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>
          Claimed {success.amount} {success.asset}
        </p>
      )}

      <div className="pt-2">
        <p className="text-center mb-3" style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
          Or scan the passcode QR on the card
        </p>
        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl"
          style={{ background: 'var(--muted)', color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}
          onClick={() => {
            setError('');
            setScanning(true);
          }}
        >
          <ScanLine size={18} />
          Scan
        </button>
      </div>

      {scanning && (
        <div className="fixed inset-0 z-50" style={{ background: 'var(--background)' }}>
          <QRScanner
            onScan={(text) => {
              const c = extractCode(text);
              if (c) setCode(c);
              setScanning(false);
            }}
            onClose={() => setScanning(false)}
            onManualEntry={() => setScanning(false)}
          />
        </div>
      )}

      {recent.length > 0 && (
        <div className="pt-4">
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 700, marginBottom: 10 }}>
            RECENTLY JOINED
          </p>
          <div className="space-y-2">
            {recent.map((r, i) => (
              <div
                key={`${r.at}-${i}`}
                className="rounded-2xl px-4 py-3"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              >
                <p className="tabular-nums" style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>
                  {r.amount} {r.gift.asset}
                </p>
                {r.note && (
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginTop: 2 }}>{r.note}</p>
                )}
                <div className="flex justify-between mt-2" style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>
                  <span>{new Date(r.at).toLocaleString()}</span>
                  <span>from {r.claimerMask}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ gift: initial, onRefresh }: { gift: Gift; onRefresh: (g: Gift) => void }) {
  const [gift, setGift] = useState(initial);
  const [copied, setCopied] = useState(false);
  const url = claimUrl(gift.code);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${gift.code}\n${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  const share = async () => {
    const text = `Convia giveaway passcode: ${gift.code}\n${url}`;
    try {
      if (navigator.share) await navigator.share({ title: 'Convia Giveaway', text, url });
      else await copy();
    } catch {
      /* cancel */
    }
  };

  const onCancel = () => {
    if (gift.status !== 'open') return;
    const left = remainingAmount(gift);
    if (!window.confirm(`Cancel and return ${left} ${gift.asset} remaining?`)) return;
    const u = cancelGift(gift.id);
    if (u) {
      setGift(u);
      onRefresh(u);
    }
  };

  return (
    <div className="px-5 pb-12 space-y-4">
      <GiftCard gift={gift} />
      <div className="flex gap-2">
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={() => void copy()}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full"
          style={{ background: 'var(--muted)', color: 'var(--foreground)', fontWeight: 600, fontSize: 13 }}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied' : 'Copy'}
        </motion.button>
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={() => void share()}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full"
          style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', fontWeight: 700, fontSize: 13 }}
        >
          <Share2 size={14} />
          Share
        </motion.button>
      </div>
      {gift.status === 'open' && (
        <button
          type="button"
          onClick={onCancel}
          className="w-full py-3.5 rounded-full"
          style={{ border: '1px solid var(--border)', color: 'var(--muted-foreground)', fontWeight: 600, fontSize: 13 }}
        >
          Cancel · return remaining
        </button>
      )}
    </div>
  );
}

function Field({
  label,
  right,
  children,
}: {
  label: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p style={{ color: 'var(--muted-foreground)', fontSize: 13, fontWeight: 500 }}>{label}</p>
        {right}
      </div>
      <div
        className="rounded-2xl px-3.5 py-3"
        style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
      >
        {children}
      </div>
    </div>
  );
}
