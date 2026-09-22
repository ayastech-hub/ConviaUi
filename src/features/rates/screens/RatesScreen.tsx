import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeftRight, ChevronDown } from 'lucide-react';
import { PageTop } from '../../../shared/components/PageTop';
import { BackButton } from '../../../shared/components/BackButton';
import { useCurrency } from '../../../shared/context/CurrencyContext';
import { convertRate } from '../../../shared/api/rates';
import { getRate, hasLiveRate, getAllRates } from '../../../shared/rates/fx';
import { CountryFlag } from '../../../shared/components/CountryFlag';

type Props = {
  goBack: () => void;
};

const SYMBOLS: Record<string, string> = {
  USD: '$',
  NGN: '₦',
  GHS: 'GH₵',
  KES: 'KSh',
  ZAR: 'R',
  UGX: 'USh',
  TZS: 'TSh',
  EGP: 'E£',
  EUR: '€',
  GBP: '£',
};

export function RatesScreen({ goBack }: Props) {
  const { currencies } = useCurrency();
  const [, bump] = useState(0);

  const list = useMemo(() => {
    const codes = new Set<string>(['USD']);
    for (const c of currencies || []) codes.add(c.code.toUpperCase());
    // also any live rates already synced
    for (const k of Object.keys(getAllRates())) codes.add(k.toUpperCase());
    return [...codes].map((code) => ({
      code,
      symbol: SYMBOLS[code] || code,
      rate: getRate(code),
      available: hasLiveRate(code),
    }));
    // eslint-depend on currencies + bump when rates update
  }, [currencies, bump]);

  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('NGN');
  const [amount, setAmount] = useState('1');
  const [picking, setPicking] = useState<'from' | 'to' | null>(null);
  const [out, setOut] = useState<string>('');
  const [rateLabel, setRateLabel] = useState('');
  const [loading, setLoading] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  const amountNum = parseFloat(amount.replace(/,/g, '')) || 0;

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!from || !to || amountNum <= 0) {
        setOut('');
        setRateLabel('');
        setUnavailable(false);
        return;
      }
      if (from === to) {
        setOut(String(amountNum));
        setRateLabel(`1 ${from} = 1 ${to}`);
        setUnavailable(false);
        return;
      }
      setLoading(true);
      setUnavailable(false);
      try {
        const res = await convertRate({
          from,
          to,
          amount: String(amountNum),
        });
        if (cancelled) return;
        const ao = res?.amountOut;
        const r = Number(res?.rate);
        if (ao != null && ao !== '' && Number.isFinite(Number(ao))) {
          setOut(String(ao));
          if (Number.isFinite(r) && r > 0) {
            setRateLabel(`1 ${from} = ${formatNum(r)} ${to}`);
          } else {
            setRateLabel('');
          }
          setUnavailable(false);
        } else {
          setOut('');
          setRateLabel('');
          setUnavailable(true);
        }
      } catch {
        if (cancelled) return;
        setOut('');
        setRateLabel('');
        setUnavailable(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    const t = window.setTimeout(run, 180);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [from, to, amountNum]);

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  const pick = (code: string) => {
    if (picking === 'from') {
      setFrom(code);
      if (code === to) setTo(from);
    } else if (picking === 'to') {
      setTo(code);
      if (code === from) setFrom(to);
    }
    setPicking(null);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--background)' }}>
      <PageTop />
      <div className="flex items-center gap-3 px-4 pb-3">
        <BackButton onClick={goBack} />
        <div>
          <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 18 }}>Rates</p>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12.5 }}>Live currency calculator</p>
        </div>
      </div>

      <div className="px-4 flex flex-col gap-3">
        <div
          className="rounded-2xl p-4"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <p
            style={{
              color: 'var(--muted-foreground)',
              fontSize: 11,
              fontWeight: 650,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              marginBottom: 10,
            }}
          >
            You send
          </p>
          <div className="flex items-center gap-3">
            <CurrencyChip code={from} onClick={() => setPicking('from')} />
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
              className="flex-1 bg-transparent outline-none text-right tabular-nums min-w-0"
              style={{
                color: 'var(--foreground)',
                fontSize: 28,
                fontWeight: 700,
                letterSpacing: -0.5,
              }}
              placeholder="0"
            />
          </div>
        </div>

        <div className="flex justify-center -my-1">
          <motion.button
            type="button"
            whileTap={{ scale: 0.92 }}
            onClick={swap}
            aria-label="Swap currencies"
            className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{
              background: 'var(--muted)',
              border: '1px solid var(--border)',
            }}
          >
            <ArrowLeftRight size={18} style={{ color: 'var(--foreground)' }} />
          </motion.button>
        </div>

        <div
          className="rounded-2xl p-4"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <p
            style={{
              color: 'var(--muted-foreground)',
              fontSize: 11,
              fontWeight: 650,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              marginBottom: 10,
            }}
          >
            You get
          </p>
          <div className="flex items-center gap-3">
            <CurrencyChip code={to} onClick={() => setPicking('to')} />
            <p
              className="flex-1 text-right tabular-nums truncate"
              style={{
                color: unavailable
                  ? 'var(--muted-foreground)'
                  : loading
                    ? 'var(--muted-foreground)'
                    : 'var(--foreground)',
                fontSize: unavailable ? 16 : 28,
                fontWeight: 700,
                letterSpacing: -0.5,
              }}
            >
              {loading ? '…' : unavailable ? 'Unavailable' : out ? formatNum(parseFloat(out)) : '0'}
            </p>
          </div>
        </div>

        {rateLabel ? (
          <p className="text-center tabular-nums" style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
            {rateLabel}
          </p>
        ) : unavailable ? (
          <p className="text-center" style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
            Rate unavailable for this pair
          </p>
        ) : null}
      </div>

      <div className="px-4 mt-6 pb-28">
        <p
          className="mb-2.5"
          style={{
            color: 'var(--muted-foreground)',
            fontSize: 12,
            fontWeight: 650,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          1 USD equals
        </p>
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          {list
            .filter((c) => c.code !== 'USD')
            .map((c, i) => (
              <button
                key={c.code}
                type="button"
                onClick={() => {
                  setFrom('USD');
                  setTo(c.code);
                  setAmount('1');
                }}
                className="w-full flex items-center justify-between px-4 py-3.5 text-left"
                style={{
                  borderTop:
                    i === 0 ? undefined : '1px solid color-mix(in oklab, var(--border) 85%, transparent)',
                }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden"
                    style={{ background: 'var(--muted)' }}
                  >
                    <CountryFlag code={c.code} size={22} />
                  </span>
                  <span style={{ color: 'var(--foreground)', fontWeight: 650, fontSize: 14.5 }}>
                    {c.code}
                  </span>
                </div>
                <span
                  className="tabular-nums"
                  style={{
                    color: c.available ? 'var(--foreground)' : 'var(--muted-foreground)',
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  {c.available ? `${c.symbol}${formatNum(c.rate)}` : 'Unavailable'}
                </span>
              </button>
            ))}
        </div>
      </div>

      {picking && (
        <div className="fixed inset-0 z-[80] flex flex-col justify-end">
          <button
            type="button"
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setPicking(null)}
            aria-label="Close"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            className="relative rounded-t-[22px] max-h-[70vh] overflow-y-auto"
            style={{
              background: 'var(--background)',
              border: '1px solid var(--border)',
              paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
            }}
          >
            <div className="flex justify-center pt-3 pb-2">
              <div
                className="w-10 h-1 rounded-full"
                style={{ background: 'var(--muted-foreground)', opacity: 0.35 }}
              />
            </div>
            <p className="px-5 pb-3" style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 16 }}>
              {picking === 'from' ? 'From currency' : 'To currency'}
            </p>
            {list.map((c) => {
              const active = (picking === 'from' ? from : to) === c.code;
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => pick(c.code)}
                  className="w-full flex items-center gap-3 px-5 py-3.5 text-left"
                  style={{
                    background: active
                      ? 'color-mix(in oklab, var(--primary) 12%, transparent)'
                      : 'transparent',
                  }}
                >
                  <span
                    className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden"
                    style={{ background: 'var(--muted)' }}
                  >
                    <CountryFlag code={c.code} size={22} />
                  </span>
                  <span style={{ color: 'var(--foreground)', fontWeight: 650 }}>{c.code}</span>
                  <span
                    className="ml-auto tabular-nums"
                    style={{ color: 'var(--muted-foreground)', fontSize: 13 }}
                  >
                    {c.available ? `${c.symbol}${formatNum(c.rate)}` : '—'}
                  </span>
                </button>
              );
            })}
          </motion.div>
        </div>
      )}
    </div>
  );
}

function CurrencyChip({ code, onClick }: { code: string; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className="flex items-center gap-1.5 shrink-0 rounded-full pl-2 pr-2.5 py-1.5"
      style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
    >
      <CountryFlag code={code} size={18} />
      <span style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>{code}</span>
      <ChevronDown size={14} style={{ color: 'var(--muted-foreground)' }} />
    </motion.button>
  );
}

function formatNum(n: number): string {
  if (!Number.isFinite(n)) return '0';
  if (n >= 100) return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  if (n >= 1) return n.toLocaleString(undefined, { maximumFractionDigits: 4 });
  return n.toLocaleString(undefined, { maximumFractionDigits: 6 });
}
