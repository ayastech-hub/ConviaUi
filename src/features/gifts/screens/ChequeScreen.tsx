import { useMemo, useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link2, Copy, Check, Share2, ChevronDown, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { PageTop } from '../../../shared/components/PageTop';
import { BackButton } from '../../../shared/components/BackButton';
import { AssetIcon } from '../../../shared/components/AssetIcon';
import { useWalletAssets } from '../../../shared/hooks/useWalletAssets';
import { useAuth } from '../../../shared/context/AuthContext';
import { GiftCard } from '../components/GiftCard';
import { cancelGift, claimGift, createGift, getGift, listGifts } from '../store';
import { claimUrl, remainingAmount, type Gift } from '../types';

type Mode = 'hub' | 'create' | 'claim' | 'detail';

interface Props {
  goBack: () => void;
}

const EXPIRY = [
  { id: '1d', label: '24h', ms: 864e5 },
  { id: '7d', label: '7d', ms: 7 * 864e5 },
  { id: '30d', label: '30d', ms: 30 * 864e5 },
];

export function ChequeScreen({ goBack }: Props) {
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
    mode === 'create' ? 'Create' : mode === 'claim' ? 'Claim' : mode === 'detail' ? 'Cheque' : 'Cheque link';

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <PageTop />
      <div className="flex items-center gap-3 px-5 mb-3">
        <BackButton onClick={back} />
        <h1 className="flex-1 text-center pr-10" style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 17 }}>
          {title}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {mode === 'hub' && (
            <motion.div
              key={`hub-${hubKey}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="px-5 pb-14"
            >
              <div
                className="relative overflow-hidden rounded-[28px] px-5 pt-8 pb-6 mb-5 text-center"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              >
                <div
                  className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, color-mix(in oklab, var(--primary) 28%, transparent), transparent 70%)',
                  }}
                />
                <div
                  className="relative mx-auto mb-4 w-[72px] h-[72px] rounded-[22px] flex items-center justify-center"
                  style={{
                    background:
                      'linear-gradient(145deg, color-mix(in oklab, var(--primary) 22%, var(--muted)), var(--muted))',
                    border: '1px solid var(--border)',
                  }}
                >
                  <Link2 size={28} style={{ color: 'var(--primary)' }} strokeWidth={1.6} />
                </div>
                <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 16 }}>One-time claim link</p>
                <p className="mt-1.5 mx-auto" style={{ color: 'var(--muted-foreground)', fontSize: 13, maxWidth: 280, lineHeight: 1.45 }}>
                  Lock an amount, share the link. Recipient claims once. Cancel anytime before claim.
                </p>
                <div className="grid grid-cols-2 gap-2.5 mt-6">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setMode('create')}
                    className="flex items-center justify-center gap-2 h-12 rounded-2xl"
                    style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', fontWeight: 700, fontSize: 14 }}
                  >
                    <ArrowUpRight size={16} strokeWidth={2.4} />
                    Create
                  </motion.button>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setMode('claim')}
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
                    Claim
                  </motion.button>
                </div>
              </div>

              <MineList
                onOpen={(id) => {
                  setDetailId(id);
                  setMode('detail');
                }}
              />
            </motion.div>
          )}
          {mode === 'create' && (
            <motion.div key="create" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <CreateCheque
                onDone={(id) => {
                  setDetailId(id);
                  setMode('detail');
                }}
              />
            </motion.div>
          )}
          {mode === 'claim' && (
            <motion.div key="claim" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <ClaimCheque />
            </motion.div>
          )}
          {mode === 'detail' && detail && (
            <motion.div key="detail" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Detail gift={detail} onUpdate={(g) => setDetailId(g.id)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function MineList({ onOpen }: { onOpen: (id: string) => void }) {
  const list = useMemo(() => listGifts('cheque').slice(0, 10), []);
  if (!list.length) return null;
  return (
    <div>
      <p
        className="mb-2.5 px-0.5"
        style={{ color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase' }}
      >
        Your cheques
      </p>
      <div className="rounded-[22px] overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        {list.map((g, i) => (
          <button
            key={g.id}
            type="button"
            onClick={() => onOpen(g.id)}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
            style={{ borderTop: i ? '1px solid var(--border)' : undefined }}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--muted)' }}>
              <AssetIcon symbol={g.asset} size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p style={{ color: 'var(--foreground)', fontWeight: 650, fontSize: 14 }}>
                {fmt(g.totalAmount)} {g.asset}
              </p>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginTop: 2 }}>
                {g.code} · {g.status}
              </p>
            </div>
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: g.status === 'open' ? 'var(--primary)' : 'var(--muted-foreground)' }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

function CreateCheque({ onDone }: { onDone: (id: string) => void }) {
  const { assets } = useWalletAssets();
  const { userId } = useAuth();
  const tokens = useMemo(() => {
    const list = assets.length ? assets : [];
    const prefer = list.filter((a) => a.balance > 0 || ['USDT', 'USDC', 'BTC', 'ETH'].includes(a.symbol));
    return prefer.length ? prefer : [{ symbol: 'USDT', balance: 0 } as any];
  }, [assets]);
  const [asset, setAsset] = useState(tokens[0]?.symbol || 'USDT');
  const [showToken, setShowToken] = useState(false);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [expiry, setExpiry] = useState('7d');
  const [customDate, setCustomDate] = useState('');
  const [error, setError] = useState('');
  const selected = tokens.find((t: any) => t.symbol === asset);
  const n = Number(amount) || 0;

  const submit = () => {
    if (!(n > 0)) return setError('Enter amount');
    if (selected && selected.balance > 0 && n > selected.balance) {
      return setError(`Available ${selected.balance} ${asset}`);
    }
    let expiresAt: string;
    if (customDate) {
      expiresAt = new Date(customDate + 'T23:59:59').toISOString();
    } else {
      const opt = EXPIRY.find((e) => e.id === expiry) || EXPIRY[1];
      expiresAt = new Date(Date.now() + opt.ms).toISOString();
    }
    const gift = createGift({
      kind: 'cheque',
      asset,
      totalAmount: n,
      slots: 1,
      note,
      expiresAt,
      creatorId: userId || 'local',
      splitMode: 'equal',
    });
    onDone(gift.id);
  };

  return (
    <div className="px-5 pb-14 space-y-4">
      <Field
        label="Amount"
        right={
          selected ? (
            <span style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>
              Avail {fmt(Number(selected.balance || 0))}
            </span>
          ) : null
        }
      >
        <div className="flex items-center gap-2">
          <input
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value.replace(/[^0-9.]/g, ''));
              setError('');
            }}
            inputMode="decimal"
            placeholder="0.00"
            className="flex-1 bg-transparent outline-none tabular-nums"
            style={{ color: 'var(--foreground)', fontSize: 22, fontWeight: 700 }}
          />
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full"
              style={{
                background: 'var(--card)',
                fontSize: 13,
                fontWeight: 700,
                color: 'var(--foreground)',
                border: '1px solid var(--border)',
              }}
            >
              <AssetIcon symbol={asset} size={16} />
              {asset}
              <ChevronDown size={14} style={{ opacity: 0.6 }} />
            </button>
            {showToken && (
              <div
                className="absolute right-0 top-full mt-1.5 z-20 rounded-2xl overflow-hidden max-h-48 overflow-y-auto"
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  minWidth: 140,
                  boxShadow: '0 12px 32px rgba(0,0,0,0.2)',
                }}
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

      <Field label="Note">
        <input
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, 80))}
          placeholder="Optional"
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
            onChange={(e) => setCustomDate(e.target.value)}
            className="w-full bg-transparent outline-none"
            style={{ color: 'var(--foreground)', fontSize: 14 }}
          />
        </div>
      </div>

      {error && <p style={{ color: 'var(--destructive, #ef4444)', fontSize: 13 }}>{error}</p>}

      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={submit}
        className="w-full py-4 rounded-full font-bold text-[15px] mt-2"
        style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
      >
        Create cheque
      </motion.button>
    </div>
  );
}

function ClaimCheque() {
  const { userId } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  const paste = async () => {
    try {
      const t = await navigator.clipboard.readText();
      setCode(t.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12));
    } catch {
      /* ignore */
    }
  };

  const claim = () => {
    if (!code.trim()) return setError('Enter passcode');
    const res = claimGift(code, userId || 'claimer_local');
    if (!res.ok) return setError(res.error);
    setOk(`Claimed ${fmt(res.amount)} ${res.gift.asset}`);
    setError('');
  };

  return (
    <div className="px-5 pb-14 space-y-4">
      <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Enter the cheque passcode</p>
      <div
        className="flex items-center gap-2 px-4 rounded-2xl"
        style={{ background: 'var(--muted)', border: '1px solid var(--border)', height: 52 }}
      >
        <input
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12));
            setError('');
            setOk('');
          }}
          placeholder="Passcode"
          className="flex-1 bg-transparent outline-none"
          style={{ color: 'var(--foreground)', fontSize: 16, fontWeight: 650, letterSpacing: 2 }}
        />
        <button type="button" onClick={() => void paste()} style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 13 }}>
          Paste
        </button>
      </div>
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={claim}
        className="w-full py-4 rounded-full font-bold text-[15px]"
        style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
      >
        Claim
      </motion.button>
      {error && <p style={{ color: 'var(--destructive, #ef4444)', fontSize: 13 }}>{error}</p>}
      {ok && (
        <div
          className="rounded-2xl px-4 py-3.5"
          style={{ background: 'color-mix(in oklab, var(--primary) 14%, transparent)' }}
        >
          <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>{ok}</p>
        </div>
      )}
    </div>
  );
}

function Detail({ gift: initial, onUpdate }: { gift: Gift; onUpdate: (g: Gift) => void }) {
  const [gift, setGift] = useState(initial);
  const [copied, setCopied] = useState(false);
  const url = claimUrl(gift.code);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Convia Cheque', text: `Claim ${gift.totalAmount} ${gift.asset}`, url });
      } else await copy();
    } catch {
      /* cancel */
    }
  };

  const onCancel = () => {
    if (gift.status !== 'open') return;
    const left = remainingAmount(gift);
    if (!window.confirm(`Cancel and return ${fmt(left)} ${gift.asset}?`)) return;
    const u = cancelGift(gift.id);
    if (u) {
      setGift(u);
      onUpdate(u);
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
          {copied ? 'Copied' : 'Copy link'}
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
          style={{ border: '1px solid var(--border)', color: 'var(--muted-foreground)', fontWeight: 600, fontSize: 13 }}
        >
          Cancel · return funds
        </button>
      )}
    </div>
  );
}

function Field({ label, right, children }: { label: string; right?: ReactNode; children: ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}>{label}</p>
        {right}
      </div>
      <div className="rounded-2xl px-3.5 py-3.5" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
        {children}
      </div>
    </div>
  );
}

function fmt(n: number) {
  if (!Number.isFinite(n)) return '0';
  return n.toLocaleString(undefined, { maximumFractionDigits: 8 });
}
