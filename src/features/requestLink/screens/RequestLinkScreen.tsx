import { useMemo, useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link2, Copy, Check, Share2, ChevronDown, ChevronRight } from 'lucide-react';
import { PageTop } from '../../../shared/components/PageTop';
import { BackButton } from '../../../shared/components/BackButton';
import { AssetIcon } from '../../../shared/components/AssetIcon';
import { QRCodeDisplay } from '../../../shared/components/QRCodeDisplay';
import { useWalletAssets } from '../../../shared/hooks/useWalletAssets';
import { useAuth } from '../../../shared/context/AuthContext';
import { cancelRequest, createRequest, getRequest, listRequests } from '../store';
import { payUrl, type PaymentRequest } from '../types';
import { ConfirmSheet } from '../../../shared/components/ConfirmSheet';

type Mode = 'hub' | 'create' | 'detail';

interface Props {
  goBack: () => void;
}

const EXPIRY = [
  { id: '1d', label: '24h', ms: 864e5 },
  { id: '7d', label: '7d', ms: 7 * 864e5 },
  { id: '30d', label: '30d', ms: 30 * 864e5 },
];

export function RequestLinkScreen({ goBack }: Props) {
  const [mode, setMode] = useState<Mode>('hub');
  const [detailId, setDetailId] = useState('');
  const [hubKey, setHubKey] = useState(0);
  const detail = detailId ? getRequest(detailId) : null;

  const back = () => {
    if (mode === 'hub') goBack();
    else {
      setMode('hub');
      setDetailId('');
      setHubKey((k) => k + 1);
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <PageTop />
      <div className="flex items-center gap-3 px-5 mb-3">
        <BackButton onClick={back} />
        <h1 className="flex-1 text-center pr-10" style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 17 }}>
          {mode === 'create' ? 'Create request' : mode === 'detail' ? 'Payment link' : 'Request link'}
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
              <Hero onCreate={() => setMode('create')} />
              <Mine
                onOpen={(id) => {
                  setDetailId(id);
                  setMode('detail');
                }}
              />
            </motion.div>
          )}
          {mode === 'create' && (
            <motion.div key="create" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <CreateForm
                onDone={(id) => {
                  setDetailId(id);
                  setMode('detail');
                }}
              />
            </motion.div>
          )}
          {mode === 'detail' && detail && (
            <motion.div key="detail" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <Detail req={detail} onUpdate={(r) => setDetailId(r.id)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Hero({ onCreate }: { onCreate: () => void }) {
  return (
    <div
      className="relative overflow-hidden rounded-[28px] px-5 pt-9 pb-7 mb-6 text-center"
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
    >
      <div
        className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full"
        style={{ background: 'radial-gradient(circle, color-mix(in oklab, var(--primary) 30%, transparent), transparent 70%)' }}
      />
      <div
        className="relative mx-auto mb-5 w-16 h-16 rounded-[20px] flex items-center justify-center"
        style={{
          background: 'linear-gradient(145deg, color-mix(in oklab, var(--primary) 28%, var(--muted)), var(--muted))',
          border: '1px solid var(--border)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
      >
        <Link2 size={26} style={{ color: 'var(--primary)' }} strokeWidth={1.7} />
      </div>
      <p style={{ color: 'var(--foreground)', fontWeight: 750, fontSize: 18, letterSpacing: -0.2 }}>Request payment</p>
      <p className="mt-2 mx-auto" style={{ color: 'var(--muted-foreground)', fontSize: 13.5, maxWidth: 280, lineHeight: 1.5 }}>
        Choose a token and amount. Share the link — they pay from their Convia balance.
      </p>
      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        onClick={onCreate}
        className="w-full h-[52px] rounded-2xl mt-7 font-bold text-[15px]"
        style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
      >
        Create payment link
      </motion.button>
    </div>
  );
}

function Mine({ onOpen }: { onOpen: (id: string) => void }) {
  const { userId } = useAuth();
  const list = useMemo(() => listRequests(userId || undefined).slice(0, 12), [userId]);
  if (!list.length) return null;
  return (
    <div>
      <p
        className="mb-2.5 px-0.5"
        style={{ color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase' }}
      >
        Your requests
      </p>
      <div className="rounded-[22px] overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        {list.map((r, i) => (
          <button
            key={r.id}
            type="button"
            onClick={() => onOpen(r.id)}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
            style={{ borderTop: i ? '1px solid var(--border)' : undefined }}
          >
            <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: 'var(--muted)' }}>
              <AssetIcon symbol={r.asset} size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <p style={{ color: 'var(--foreground)', fontWeight: 650, fontSize: 15 }}>
                {fmt(r.amount)} {r.asset}
              </p>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginTop: 2 }}>
                {r.status === 'open' ? 'Awaiting payment' : r.status}
              </p>
            </div>
            <ChevronRight size={16} style={{ color: 'var(--muted-foreground)' }} />
          </button>
        ))}
      </div>
    </div>
  );
}

function CreateForm({ onDone }: { onDone: (id: string) => void }) {
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
  const n = Number(amount) || 0;

  const submit = () => {
    if (!(n > 0)) return setError('Enter an amount');
    let expiresAt: string;
    if (customDate) {
      expiresAt = new Date(customDate + 'T23:59:59').toISOString();
    } else {
      const opt = EXPIRY.find((e) => e.id === expiry) || EXPIRY[1];
      expiresAt = new Date(Date.now() + opt.ms).toISOString();
    }
    const req = createRequest({
      asset,
      amount: n,
      note,
      expiresAt,
      creatorId: userId || 'local',
      creatorLabel: userId ? `user ${userId.slice(0, 6)}` : 'Convia user',
    });
    onDone(req.id);
  };

  return (
    <div className="px-5 pb-14 space-y-5">
      {/* Amount hero */}
      <div
        className="rounded-[28px] px-5 pt-6 pb-5 text-center"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600, letterSpacing: 0.4 }}>AMOUNT</p>
        <input
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value.replace(/[^0-9.]/g, ''));
            setError('');
          }}
          inputMode="decimal"
          placeholder="0.00"
          className="w-full bg-transparent outline-none text-center tabular-nums mt-2"
          style={{ color: 'var(--foreground)', fontSize: 40, fontWeight: 800, letterSpacing: -1.2 }}
        />
        <button
          type="button"
          onClick={() => setShowToken(!showToken)}
          className="inline-flex items-center gap-2 mx-auto mt-3 px-3.5 py-2 rounded-full"
          style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
        >
          <AssetIcon symbol={asset} size={18} />
          <span style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>{asset}</span>
          <ChevronDown size={14} style={{ color: 'var(--muted-foreground)' }} />
        </button>
        {showToken && (
          <div
            className="mt-3 rounded-2xl overflow-hidden text-left max-h-44 overflow-y-auto"
            style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
          >
            {tokens.slice(0, 12).map((t: any) => (
              <button
                key={t.symbol}
                type="button"
                onClick={() => {
                  setAsset(t.symbol);
                  setShowToken(false);
                }}
                className="flex items-center gap-2 w-full px-4 py-3"
                style={{
                  color: 'var(--foreground)',
                  fontWeight: 600,
                  fontSize: 14,
                  background: t.symbol === asset ? 'var(--card)' : undefined,
                }}
              >
                <AssetIcon symbol={t.symbol} size={18} />
                {t.symbol}
              </button>
            ))}
          </div>
        )}
      </div>

      <Field label="Note">
        <input
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, 80))}
          placeholder="What is this for?"
          className="w-full bg-transparent outline-none"
          style={{ color: 'var(--foreground)', fontSize: 15 }}
        />
      </Field>

      <div>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Link expires</p>
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
        className="w-full py-4 rounded-full font-bold text-[15px]"
        style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
      >
        Create link
      </motion.button>
    </div>
  );
}

function Detail({ req: initial, onUpdate }: { req: PaymentRequest; onUpdate: (r: PaymentRequest) => void }) {
  const [req, setReq] = useState(initial);
  const [copied, setCopied] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const url = payUrl(req.code);

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
    const text = `Pay ${fmt(req.amount)} ${req.asset} on Convia\n${url}`;
    try {
      if (navigator.share) await navigator.share({ title: 'Convia payment request', text, url });
      else await copy();
    } catch {
      /* cancel */
    }
  };

  const doCancel = () => {
    const u = cancelRequest(req.id);
    if (u) {
      setReq(u);
      onUpdate(u);
    }
  };

  return (
    <div className="px-5 pb-14 space-y-4">
      <div
        className="relative overflow-hidden rounded-[28px] p-6"
        style={{
          background: 'linear-gradient(155deg, #1a2220 0%, #101614 50%, #0a100e 100%)',
          border: '1px solid color-mix(in oklab, var(--primary) 35%, transparent)',
          color: '#fff',
          boxShadow: '0 20px 48px rgba(0,0,0,0.3)',
        }}
      >
        <div
          className="pointer-events-none absolute -top-16 right-0 w-40 h-40 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(74,155,146,0.35), transparent 70%)' }}
        />
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.3, opacity: 0.45 }}>CONVIA · PAYMENT REQUEST</p>
        <div className="flex items-center gap-2.5 mt-4">
          <AssetIcon symbol={req.asset} size={28} />
          <p className="tabular-nums" style={{ fontSize: 36, fontWeight: 800, letterSpacing: -1.2 }}>
            {fmt(req.amount)}
          </p>
        </div>
        <p style={{ fontSize: 14, opacity: 0.55, marginTop: 2, fontWeight: 600 }}>{req.asset}</p>
        {req.note && <p style={{ fontSize: 13, opacity: 0.7, marginTop: 10 }}>{req.note}</p>}
        <div className="flex gap-4 items-center mt-6">
          <div className="rounded-[16px] p-2.5" style={{ background: '#fff' }}>
            <QRCodeDisplay value={url} size={108} fgColor="#0A0A0A" bgColor="#FFFFFF" />
          </div>
          <div className="min-w-0">
            <p style={{ fontSize: 10, opacity: 0.4, fontWeight: 700, letterSpacing: 0.8 }}>STATUS</p>
            <p style={{ fontSize: 15, fontWeight: 700, marginTop: 4, textTransform: 'capitalize' }}>{req.status}</p>
            <p style={{ fontSize: 11, opacity: 0.4, marginTop: 10, lineHeight: 1.4 }}>
              Expires {new Date(req.expiresAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

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

      {req.status === 'open' && (
        <button
          type="button"
          onClick={() => setConfirmCancel(true)}
          className="w-full h-12 rounded-full"
          style={{
            border: '1px solid color-mix(in oklab, var(--destructive, #ef4444) 35%, var(--border))',
            color: 'var(--destructive, #ef4444)',
            fontWeight: 650,
            fontSize: 13,
          }}
        >
          Cancel request
        </button>
      )}

      <ConfirmSheet
        open={confirmCancel}
        title="Cancel request?"
        body="This payment link will stop working. Anyone with the link will no longer be able to pay."
        confirmLabel="Cancel request"
        cancelLabel="Keep open"
        destructive
        onConfirm={doCancel}
        onClose={() => setConfirmCancel(false)}
      />
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>{label}</p>
      <div className="rounded-2xl px-3.5 py-3.5" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
        {children}
      </div>
    </div>
  );
}

function fmt(n: number) {
  return Number.isFinite(n) ? n.toLocaleString(undefined, { maximumFractionDigits: 8 }) : '0';
}
