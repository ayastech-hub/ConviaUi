import { useMemo, useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Gift,
  ScanLine,
  ChevronDown,
  Copy,
  Check,
  Share2,
  Sparkles,
  Users,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
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
  { id: '7d', label: '7d', ms: 7 * 864e5 },
  { id: '30d', label: '30d', ms: 30 * 864e5 },
];

export function GiveawayScreen({ goBack }: Props) {
  const [mode, setMode] = useState<Mode>('hub');
  const [detailId, setDetailId] = useState('');
  const [hubKey, setHubKey] = useState(0);
  const detail = detailId ? getGift(detailId) : null;

  const back = () => {
    if (mode === 'hub') goBack();
    else {
      setMode('hub');
      setDetailId('');
      setHubKey((k) => k + 1);
    }
  };

  const title =
    mode === 'create' ? 'Create' : mode === 'join' ? 'Join' : mode === 'detail' ? 'Card' : 'Giveaway';

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <PageTop />
      <div className="flex items-center gap-3 px-5 mb-3">
        <BackButton onClick={back} />
        <h1 className="flex-1 text-center pr-10" style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 17 }}>
          {title}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col">
        <AnimatePresence mode="wait">
          {mode === 'hub' && (
            <motion.div
              key={`hub-${hubKey}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <Hub
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
            <motion.div
              key="create"
              className="flex-1 flex flex-col"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <CreateForm
                onDone={(id) => {
                  setDetailId(id);
                  setMode('detail');
                }}
              />
            </motion.div>
          )}
          {mode === 'join' && (
            <motion.div
              key="join"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <JoinForm />
            </motion.div>
          )}
          {mode === 'detail' && detail && (
            <motion.div
              key="detail"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <Detail gift={detail} onRefresh={(g) => setDetailId(g.id)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ───────── Hub ───────── */

function Hub({
  onCreate,
  onJoin,
  onOpen,
}: {
  onCreate: () => void;
  onJoin: () => void;
  onOpen: (id: string) => void;
}) {
  const mine = useMemo(() => listGifts('giveaway').slice(0, 8), []);

  return (
    <div className="px-5 pb-14">
      {/* Hero */}
      <div
        className="relative overflow-hidden rounded-[28px] px-5 pt-8 pb-6 mb-5 text-center"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
        }}
      >
        <div
          className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full"
          style={{ background: 'radial-gradient(circle, color-mix(in oklab, var(--primary) 28%, transparent), transparent 70%)' }}
        />
        <div
          className="relative mx-auto mb-4 w-[72px] h-[72px] rounded-[22px] flex items-center justify-center"
          style={{
            background: 'linear-gradient(145deg, color-mix(in oklab, var(--primary) 22%, var(--muted)), var(--muted))',
            border: '1px solid var(--border)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
        >
          <Gift size={32} style={{ color: 'var(--primary)' }} strokeWidth={1.6} />
        </div>
        <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 16, lineHeight: 1.4 }}>
          Share crypto with friends
        </p>
        <p className="mt-1.5 mx-auto" style={{ color: 'var(--muted-foreground)', fontSize: 13, lineHeight: 1.45, maxWidth: 260 }}>
          Create a passcode pool. They claim equal or random amounts.
        </p>

        <div className="grid grid-cols-2 gap-2.5 mt-6">
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={onCreate}
            className="flex items-center justify-center gap-2 h-12 rounded-2xl"
            style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', fontWeight: 700, fontSize: 14 }}
          >
            <ArrowUpRight size={16} strokeWidth={2.4} />
            Create
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={onJoin}
            className="flex items-center justify-center gap-2 h-12 rounded-2xl"
            style={{
              background: 'var(--muted)',
              color: 'var(--foreground)',
              fontWeight: 700,
              fontSize: 14,
              border: '1px solid var(--border)',
            }}
          >
            <ArrowDownLeft size={16} strokeWidth={2.4} />
            Join
          </motion.button>
        </div>
      </div>

      {/* Your giveaways */}
      {mine.length > 0 && (
        <section className="mb-6">
          <SectionLabel>Your giveaways</SectionLabel>
          <div
            className="rounded-[22px] overflow-hidden"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            {mine.map((g, i) => (
              <button
                key={g.id}
                type="button"
                onClick={() => onOpen(g.id)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
                style={{ borderTop: i ? '1px solid var(--border)' : undefined }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--muted)' }}
                >
                  <AssetIcon symbol={g.asset} size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ color: 'var(--foreground)', fontWeight: 650, fontSize: 14 }}>
                    {formatAmt(g.totalAmount)} {g.asset}
                  </p>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginTop: 2 }}>
                    {g.code}
                    {g.status === 'open' ? ` · ${remainingSlots(g)} left` : ` · ${g.status}`}
                  </p>
                </div>
                <StatusDot status={g.status} />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      <section>
        <SectionLabel>FAQ</SectionLabel>
        <div
          className="rounded-[22px] overflow-hidden"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          {[
            ['What is a giveaway?', 'You lock a crypto pool and share a passcode. Friends claim until slots run out or it expires.'],
            ['Equal vs random?', 'Equal splits the pool evenly. Random gives varied amounts from the remaining pool.'],
            ['How do friends join?', 'They open Join, paste the passcode, or scan the QR on your card.'],
            ['Unclaimed funds?', 'Cancel anytime — only remaining unclaimed amount returns. Expired pools return the rest automatically.'],
          ].map(([q, a], i) => (
            <FaqRow key={q} q={q} a={a} first={!i} />
          ))}
        </div>
      </section>
    </div>
  );
}

function FaqRow({ q, a, first }: { q: string; a: string; first?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className="w-full text-left px-4 py-3.5"
      style={{ borderTop: first ? undefined : '1px solid var(--border)' }}
    >
      <div className="flex items-center justify-between gap-3">
        <span style={{ color: 'var(--foreground)', fontSize: 14, fontWeight: 550 }}>{q}</span>
        <ChevronDown
          size={16}
          style={{
            color: 'var(--muted-foreground)',
            transform: open ? 'rotate(180deg)' : undefined,
            transition: 'transform 0.15s ease',
            flexShrink: 0,
          }}
        />
      </div>
      <AnimatePresence>
        {open && (
          <motion.p
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
            style={{ color: 'var(--muted-foreground)', fontSize: 13, lineHeight: 1.5, marginTop: 8 }}
          >
            {a}
          </motion.p>
        )}
      </AnimatePresence>
    </button>
  );
}

/* ───────── Create ───────── */

function CreateForm({ onDone }: { onDone: (id: string) => void }) {
  const { assets } = useWalletAssets();
  const { userId } = useAuth();
  const tokens = useMemo(() => {
    const list = assets.length ? assets : [];
    const prefer = list.filter((a) => a.balance > 0 || ['USDT', 'USDC', 'BTC', 'ETH'].includes(a.symbol));
    return prefer.length ? prefer : [{ symbol: 'USDT', balance: 0, name: 'Tether' } as any];
  }, [assets]);

  const [split, setSplit] = useState<SplitMode>('equal');
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
    <div className="flex flex-col flex-1 min-h-0">
      <div className="px-5 pb-4 space-y-4 flex-1">
        {/* Split segmented control */}
        <div
          className="grid grid-cols-2 p-1 rounded-2xl gap-1"
          style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
        >
          {([
            ['equal', 'Equal'],
            ['random', 'Random'],
          ] as const).map(([id, label]) => {
            const on = split === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSplit(id)}
                className="h-10 rounded-[14px] text-[13px] font-bold"
                style={{
                  background: on ? 'var(--card)' : 'transparent',
                  color: on ? 'var(--foreground)' : 'var(--muted-foreground)',
                  boxShadow: on ? '0 1px 3px rgba(0,0,0,0.12)' : undefined,
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        <Field
          label="Max participants"
          icon={<Users size={14} style={{ color: 'var(--muted-foreground)' }} />}
        >
          <input
            value={slots}
            onChange={(e) => {
              setSlots(e.target.value.replace(/\D/g, ''));
              setError('');
            }}
            inputMode="numeric"
            placeholder="e.g. 10"
            className="w-full bg-transparent outline-none"
            style={{ color: 'var(--foreground)', fontSize: 16, fontWeight: 600 }}
          />
        </Field>

        <Field
          label="Total amount"
          right={
            selected ? (
              <span style={{ color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 500 }}>
                Avail {formatAmt(Number(selected.balance || 0))}
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
              style={{ color: 'var(--foreground)', fontSize: 20, fontWeight: 700 }}
            />
            <TokenPicker
              asset={asset}
              tokens={tokens}
              open={showToken}
              setOpen={setShowToken}
              onPick={setAsset}
            />
          </div>
        </Field>

        {nSlots >= 2 && nTotal > 0 && (
          <div
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl"
            style={{ background: 'color-mix(in oklab, var(--primary) 12%, transparent)' }}
          >
            <Sparkles size={14} style={{ color: 'var(--primary)' }} />
            <p style={{ color: 'var(--foreground)', fontSize: 12, fontWeight: 550 }}>
              {split === 'equal'
                ? `Each gets ${formatAmt(per)} ${asset}`
                : `Random shares from ${formatAmt(nTotal)} ${asset}`}
            </p>
          </div>
        )}

        <Field label="Message">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, 80))}
            placeholder="Optional note for claimers"
            className="w-full bg-transparent outline-none"
            style={{ color: 'var(--foreground)', fontSize: 15 }}
          />
        </Field>

        <div>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Expires</p>
          <div className="flex gap-2 mb-2">
            {EXPIRY.map((o) => {
              const on = expiry === o.id && !customDate;
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => {
                    setExpiry(o.id);
                    setCustomDate('');
                  }}
                  className="flex-1 h-10 rounded-full text-[12px] font-bold"
                  style={{
                    background: on ? 'var(--foreground)' : 'var(--muted)',
                    color: on ? 'var(--background)' : 'var(--foreground)',
                    border: on ? undefined : '1px solid var(--border)',
                  }}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
          <div
            className="rounded-2xl px-3.5 h-11 flex items-center"
            style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
          >
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
          </div>
        </div>

        {error && (
          <p style={{ color: 'var(--destructive, #ef4444)', fontSize: 13, fontWeight: 500 }}>{error}</p>
        )}
      </div>

      {/* Footer */}
      <div
        className="mt-auto px-5 pt-3 pb-6"
        style={{ background: 'var(--background)', borderTop: '1px solid var(--border)' }}
      >
        <div className="flex justify-between mb-3" style={{ fontSize: 13 }}>
          <span style={{ color: 'var(--muted-foreground)', fontWeight: 500 }}>Total</span>
          <span className="tabular-nums" style={{ color: 'var(--foreground)', fontWeight: 700 }}>
            {nTotal > 0 ? `${formatAmt(nTotal)} ${asset}` : `— ${asset}`}
          </span>
        </div>
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={submit}
          className="w-full h-13 py-4 rounded-full font-bold text-[15px]"
          style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
        >
          Create now
        </motion.button>
        <p className="text-center mt-2.5" style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>
          Unclaimed balance after expiry returns to you
        </p>
      </div>
    </div>
  );
}

/* ───────── Join ───────── */

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
      setCode(extractCode(t));
      setError('');
      setSuccess(null);
    } catch {
      setError('Paste not available');
    }
  };

  const confirm = () => {
    setError('');
    setSuccess(null);
    if (!code.trim()) return setError('Enter a passcode');
    const res = claimGift(code, userId || 'claimer_local');
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setSuccess({ amount: res.amount, asset: res.gift.asset });
  };

  return (
    <div className="px-5 pb-14 space-y-5">
      <div>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Passcode</p>
        <div
          className="flex items-center gap-2 px-4 h-13 rounded-2xl"
          style={{ background: 'var(--muted)', border: '1px solid var(--border)', height: 52 }}
        >
          <input
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12));
              setError('');
              setSuccess(null);
            }}
            placeholder="Enter passcode"
            className="flex-1 bg-transparent outline-none tabular-nums"
            style={{ color: 'var(--foreground)', fontSize: 16, fontWeight: 650, letterSpacing: 2 }}
          />
          <button
            type="button"
            onClick={() => void paste()}
            className="px-2 py-1 rounded-lg"
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
        <div
          className="rounded-2xl px-4 py-3.5"
          style={{
            background: 'color-mix(in oklab, var(--primary) 14%, transparent)',
            border: '1px solid color-mix(in oklab, var(--primary) 30%, transparent)',
          }}
        >
          <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>
            Claimed {formatAmt(success.amount)} {success.asset}
          </p>
        </div>
      )}

      <div className="flex items-center gap-3 py-1">
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>or scan QR</span>
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
      </div>

      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={() => setScanning(true)}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl"
        style={{
          background: 'var(--card)',
          color: 'var(--foreground)',
          fontWeight: 650,
          fontSize: 14,
          border: '1px solid var(--border)',
        }}
      >
        <ScanLine size={18} />
        Scan passcode
      </motion.button>

      {scanning && (
        <QRScanner
          onScan={(text) => {
            setCode(extractCode(text));
            setScanning(false);
            setError('');
            setSuccess(null);
          }}
          onClose={() => setScanning(false)}
          onManualEntry={() => setScanning(false)}
        />
      )}

      {recent.length > 0 && (
        <div className="pt-2">
          <SectionLabel>Recently joined</SectionLabel>
          <div className="space-y-2">
            {recent.map((r, i) => (
              <div
                key={`${r.at}-${i}`}
                className="rounded-[18px] px-4 py-3.5"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              >
                <p className="tabular-nums" style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>
                  {formatAmt(r.amount)} {r.gift.asset}
                </p>
                {r.note && (
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginTop: 3 }}>{r.note}</p>
                )}
                <div className="flex justify-between mt-2.5" style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>
                  <span>{new Date(r.at).toLocaleString()}</span>
                  <span>{r.claimerMask}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────── Detail ───────── */

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
    if (!window.confirm(`Cancel and return ${formatAmt(left)} ${gift.asset} remaining?`)) return;
    const u = cancelGift(gift.id);
    if (u) {
      setGift(u);
      onRefresh(u);
    }
  };

  return (
    <div className="px-5 pb-14 space-y-4">
      <GiftCard gift={gift} />
      <div className="grid grid-cols-2 gap-2.5">
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={() => void copy()}
          className="flex items-center justify-center gap-2 h-12 rounded-full"
          style={{
            background: 'var(--muted)',
            color: 'var(--foreground)',
            fontWeight: 650,
            fontSize: 13,
            border: '1px solid var(--border)',
          }}
        >
          {copied ? <Check size={15} /> : <Copy size={15} />}
          {copied ? 'Copied' : 'Copy'}
        </motion.button>
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={() => void share()}
          className="flex items-center justify-center gap-2 h-12 rounded-full"
          style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', fontWeight: 700, fontSize: 13 }}
        >
          <Share2 size={15} />
          Share
        </motion.button>
      </div>
      {gift.status === 'open' && (
        <button
          type="button"
          onClick={onCancel}
          className="w-full h-12 rounded-full"
          style={{
            border: '1px solid var(--border)',
            color: 'var(--muted-foreground)',
            fontWeight: 600,
            fontSize: 13,
            background: 'transparent',
          }}
        >
          Cancel · return remaining
        </button>
      )}
    </div>
  );
}

/* ───────── shared bits ───────── */

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p
      className="mb-2.5 px-0.5"
      style={{
        color: 'var(--muted-foreground)',
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 0.6,
        textTransform: 'uppercase',
      }}
    >
      {children}
    </p>
  );
}

function StatusDot({ status }: { status: Gift['status'] }) {
  const color =
    status === 'open' ? 'var(--primary)' : status === 'claimed' ? '#22c55e' : 'var(--muted-foreground)';
  return (
    <span
      className="w-2 h-2 rounded-full flex-shrink-0"
      style={{ background: color }}
      title={status}
    />
  );
}

function Field({
  label,
  right,
  icon,
  children,
}: {
  label: string;
  right?: ReactNode;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          {icon}
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}>{label}</p>
        </div>
        {right}
      </div>
      <div
        className="rounded-2xl px-3.5 py-3.5"
        style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
      >
        {children}
      </div>
    </div>
  );
}

function TokenPicker({
  asset,
  tokens,
  open,
  setOpen,
  onPick,
}: {
  asset: string;
  tokens: any[];
  open: boolean;
  setOpen: (v: boolean) => void;
  onPick: (s: string) => void;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full"
        style={{ background: 'var(--card)', fontSize: 13, fontWeight: 700, color: 'var(--foreground)', border: '1px solid var(--border)' }}
      >
        <AssetIcon symbol={asset} size={16} />
        {asset}
        <ChevronDown size={14} style={{ opacity: 0.6 }} />
      </button>
      {open && (
        <div
          className="absolute right-0 top-full mt-1.5 z-20 rounded-2xl overflow-hidden max-h-52 overflow-y-auto"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', minWidth: 148, boxShadow: '0 12px 32px rgba(0,0,0,0.2)' }}
        >
          {tokens.slice(0, 12).map((t: any) => (
            <button
              key={t.symbol}
              type="button"
              onClick={() => {
                onPick(t.symbol);
                setOpen(false);
              }}
              className="flex items-center gap-2 w-full px-3 py-2.5"
              style={{
                color: 'var(--foreground)',
                fontSize: 13,
                fontWeight: 600,
                background: t.symbol === asset ? 'var(--muted)' : undefined,
              }}
            >
              <AssetIcon symbol={t.symbol} size={16} />
              {t.symbol}
            </button>
          ))}
        </div>
      )}
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

function formatAmt(n: number) {
  if (!Number.isFinite(n)) return '0';
  return n.toLocaleString(undefined, { maximumFractionDigits: 8 });
}
