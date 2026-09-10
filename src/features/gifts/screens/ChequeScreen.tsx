import { useMemo, useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link2, Copy, Check, Share2, ChevronDown } from 'lucide-react';
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
  { id: '7d', label: '7 days', ms: 7 * 864e5 },
  { id: '30d', label: '30 days', ms: 30 * 864e5 },
];

export function ChequeScreen({ goBack }: Props) {
  const [mode, setMode] = useState<Mode>('hub');
  const [detailId, setDetailId] = useState('');
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
            }
          }}
        />
        <h1 className="flex-1 text-center pr-10" style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 17 }}>
          {mode === 'create' ? 'Create cheque' : mode === 'claim' ? 'Claim cheque' : mode === 'detail' ? 'Cheque' : 'Cheque link'}
        </h1>
      </div>
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {mode === 'hub' && (
            <motion.div key="hub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-5 pb-12">
              <div className="flex flex-col items-center text-center pt-6 pb-6">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3"
                  style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
                >
                  <Link2 size={28} style={{ color: 'var(--primary)' }} />
                </div>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 14, lineHeight: 1.45, maxWidth: 280 }}>
                  Lock an amount and send a one-time claim link. Recipient claims once; you can cancel before claim.
                </p>
              </div>
              <div className="flex gap-3 mb-6">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setMode('create')}
                  className="flex-1 py-3.5 rounded-2xl font-bold text-[14px]"
                  style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
                >
                  Create
                </motion.button>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setMode('claim')}
                  className="flex-1 py-3.5 rounded-2xl font-bold text-[14px]"
                  style={{ background: 'var(--muted)', color: 'var(--foreground)', border: '1px solid var(--border)' }}
                >
                  Claim
                </motion.button>
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
            <CreateCheque
              onDone={(id) => {
                setDetailId(id);
                setMode('detail');
              }}
            />
          )}
          {mode === 'claim' && <ClaimCheque />}
          {mode === 'detail' && detail && (
            <Detail
              gift={detail}
              onUpdate={(g) => {
                setDetailId(g.id);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function MineList({ onOpen }: { onOpen: (id: string) => void }) {
  const list = useMemo(() => listGifts('cheque').slice(0, 8), []);
  if (!list.length) return null;
  return (
    <div>
      <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>YOUR CHEQUES</p>
      {list.map((g) => (
        <button
          key={g.id}
          type="button"
          onClick={() => onOpen(g.id)}
          className="w-full flex justify-between py-3.5 text-left"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div>
            <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>
              {g.totalAmount} {g.asset}
            </p>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
              {g.code} · {g.status}
            </p>
          </div>
          <span style={{ color: 'var(--primary)', fontSize: 12, fontWeight: 600 }}>Open</span>
        </button>
      ))}
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
    <div className="px-5 pb-28 space-y-4">
      <Field
        label="Amount"
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
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value.replace(/[^0-9.]/g, ''));
              setError('');
            }}
            inputMode="decimal"
            placeholder="0.00"
            className="flex-1 bg-transparent outline-none tabular-nums"
            style={{ color: 'var(--foreground)', fontSize: 18, fontWeight: 700 }}
          />
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full"
              style={{ background: 'var(--card)', fontSize: 13, fontWeight: 700, color: 'var(--foreground)' }}
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

      <Field label="Note">
        <input
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, 80))}
          placeholder="Optional"
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
                background: expiry === o.id && !customDate ? 'var(--foreground)' : 'var(--card)',
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
          onChange={(e) => setCustomDate(e.target.value)}
          className="w-full bg-transparent outline-none"
          style={{ color: 'var(--foreground)', fontSize: 14 }}
        />
      </Field>

      {error && <p style={{ color: 'var(--destructive, #ef4444)', fontSize: 13 }}>{error}</p>}

      <div className="pt-2">
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={submit}
          className="w-full py-4 rounded-full font-bold text-[15px]"
          style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
        >
          Create cheque
        </motion.button>
      </div>
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
    const res = claimGift(code, userId || 'claimer_local');
    if (!res.ok) return setError(res.error);
    setOk(`Claimed ${res.amount} ${res.gift.asset}`);
    setError('');
  };

  return (
    <div className="px-5 pb-12 space-y-4">
      <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Enter the cheque passcode</p>
      <div
        className="flex items-center gap-2 px-3.5 h-12 rounded-2xl"
        style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
      >
        <input
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12));
            setError('');
            setOk('');
          }}
          placeholder="Passcode"
          className="flex-1 bg-transparent outline-none tracking-widest"
          style={{ color: 'var(--foreground)', fontSize: 15, fontWeight: 600 }}
        />
        <button type="button" onClick={() => void paste()} style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 13 }}>
          Paste
        </button>
      </div>
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={claim}
        className="w-full py-4 rounded-full font-bold"
        style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
      >
        Claim
      </motion.button>
      {error && <p style={{ color: 'var(--destructive, #ef4444)', fontSize: 13 }}>{error}</p>}
      {ok && <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>{ok}</p>}
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
      if (navigator.share) await navigator.share({ title: 'Convia Cheque', text: `Claim ${gift.totalAmount} ${gift.asset}`, url });
      else await copy();
    } catch {
      /* cancel */
    }
  };

  const onCancel = () => {
    if (gift.status !== 'open') return;
    const left = remainingAmount(gift);
    if (!window.confirm(`Cancel and return ${left} ${gift.asset}?`)) return;
    const u = cancelGift(gift.id);
    if (u) {
      setGift(u);
      onUpdate(u);
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
          {copied ? 'Copied' : 'Copy link'}
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
          Cancel · return funds
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
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p style={{ color: 'var(--muted-foreground)', fontSize: 13, fontWeight: 500 }}>{label}</p>
        {right}
      </div>
      <div className="rounded-2xl px-3.5 py-3" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
        {children}
      </div>
    </div>
  );
}
