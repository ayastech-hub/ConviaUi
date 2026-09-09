import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import type { Screen } from '../../../shared/data/mockData';
import { PageTop } from '../../../shared/components/PageTop';
import { BackButton } from '../../../shared/components/BackButton';
import { useWalletAssets } from '../../../shared/hooks/useWalletAssets';
import { useAuth } from '../../../shared/context/AuthContext';
import { AssetIcon } from '../../../shared/components/AssetIcon';
import { createGift } from '../store';

interface Props {
  goBack: () => void;
  navigate: (s: Screen, param?: string) => void;
}

const EXPIRY_OPTS = [
  { id: '1d', label: '24 hours', ms: 864e5 },
  { id: '7d', label: '7 days', ms: 7 * 864e5 },
  { id: '30d', label: '30 days', ms: 30 * 864e5 },
];

export function CreateGiveawayScreen({ goBack, navigate }: Props) {
  const { assets } = useWalletAssets();
  const { userId } = useAuth();
  const tokens = useMemo(
    () => (assets.length ? assets : []).filter((a) => a.balance > 0 || ['USDT', 'USDC', 'BTC', 'ETH'].includes(a.symbol)),
    [assets],
  );
  const [asset, setAsset] = useState(tokens[0]?.symbol || 'USDT');
  const [total, setTotal] = useState('');
  const [slots, setSlots] = useState('10');
  const [note, setNote] = useState('');
  const [expiry, setExpiry] = useState('7d');
  const [customDate, setCustomDate] = useState('');
  const [error, setError] = useState('');
  const selected = tokens.find((t) => t.symbol === asset) || tokens[0];
  const nSlots = Math.max(1, Math.min(100, Math.floor(Number(slots) || 0)));
  const nTotal = Number(total) || 0;
  const per = nSlots > 0 && nTotal > 0 ? nTotal / nSlots : 0;

  const submit = () => {
    if (!(nTotal > 0)) {
      setError('Enter total amount');
      return;
    }
    if (nSlots < 2) {
      setError('Giveaway needs at least 2 people');
      return;
    }
    if (selected && selected.balance > 0 && nTotal > selected.balance) {
      setError(`Insufficient balance (max ${selected.balance})`);
      return;
    }
    let expiresAt: string;
    if (customDate) {
      expiresAt = new Date(customDate + 'T23:59:59').toISOString();
      if (new Date(expiresAt).getTime() <= Date.now()) {
        setError('Pick a future date');
        return;
      }
    } else {
      const opt = EXPIRY_OPTS.find((e) => e.id === expiry) || EXPIRY_OPTS[1];
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
    });
    navigate('gift-detail', gift.id);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--background)' }}>
      <PageTop />
      <div className="flex items-center gap-3 px-5 mb-5">
        <BackButton onClick={goBack} />
        <h1 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 18 }}>Create giveaway</h1>
      </div>

      <div className="px-5 pb-10 space-y-4">
        <Field label="Token">
          <div className="flex flex-wrap gap-2">
            {(tokens.length ? tokens : [{ symbol: 'USDT' } as any]).slice(0, 8).map((t: any) => {
              const on = asset === t.symbol;
              return (
                <button
                  key={t.symbol}
                  type="button"
                  onClick={() => setAsset(t.symbol)}
                  className="flex items-center gap-2 px-3 py-2 rounded-full"
                  style={{
                    background: on ? 'var(--foreground)' : 'var(--muted)',
                    color: on ? 'var(--background)' : 'var(--foreground)',
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  <AssetIcon symbol={t.symbol} size={18} />
                  {t.symbol}
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="Total pool">
          <input
            value={total}
            onChange={(e) => {
              setTotal(e.target.value.replace(/[^0-9.]/g, ''));
              setError('');
            }}
            inputMode="decimal"
            placeholder="0.00"
            className="w-full bg-transparent outline-none tabular-nums"
            style={{ color: 'var(--foreground)', fontSize: 28, fontWeight: 700 }}
          />
        </Field>

        <Field label="Number of people">
          <input
            value={slots}
            onChange={(e) => setSlots(e.target.value.replace(/[^0-9]/g, ''))}
            inputMode="numeric"
            className="w-full bg-transparent outline-none tabular-nums"
            style={{ color: 'var(--foreground)', fontSize: 22, fontWeight: 700 }}
          />
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginTop: 8 }}>
            Equal split · each gets{' '}
            <strong style={{ color: 'var(--foreground)' }}>
              {per > 0 ? per.toLocaleString(undefined, { maximumFractionDigits: 8 }) : '—'} {asset}
            </strong>
          </p>
        </Field>

        <Field label="Note (optional)">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, 80))}
            placeholder="Community drop…"
            className="w-full bg-transparent outline-none"
            style={{ color: 'var(--foreground)', fontSize: 15 }}
          />
        </Field>

        <Field label="Expires">
          <div className="flex gap-2 mb-3">
            {EXPIRY_OPTS.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => { setExpiry(o.id); setCustomDate(''); }}
                className="flex-1 py-2.5 rounded-full"
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
          <p style={{ color: 'var(--muted-foreground)', fontSize: 11, marginBottom: 6 }}>Or pick a date</p>
          <input
            type="date"
            value={customDate}
            min={new Date().toISOString().slice(0, 10)}
            onChange={(e) => {
              setCustomDate(e.target.value);
              if (e.target.value) setExpiry('custom');
            }}
            className="w-full bg-transparent outline-none"
            style={{ color: 'var(--foreground)', fontSize: 15 }}
          />
        </Field>

        {error && <p style={{ color: 'var(--destructive)', fontSize: 13 }}>{error}</p>}

        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={submit}
          className="w-full py-4 rounded-full"
          style={{
            background: 'var(--primary)',
            color: 'var(--primary-foreground, #fff)',
            fontWeight: 700,
            fontSize: 16,
          }}
        >
          Create giveaway card
        </motion.button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-[20px] px-4 py-3.5"
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
    >
      <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>{label}</p>
      {children}
    </div>
  );
}
