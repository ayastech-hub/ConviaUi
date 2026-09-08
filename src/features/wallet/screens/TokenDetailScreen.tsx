import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ArrowDownToLine, ArrowUpFromLine, RefreshCw, CreditCard } from 'lucide-react';
import type { Screen } from '../../../shared/data/mockData';
import { AssetIcon } from '../../../shared/components/AssetIcon';
import { PageTop } from '../../../shared/components/PageTop';
import { useWalletAssets } from '../../../shared/hooks/useWalletAssets';
import { useCurrency } from '../../../shared/context/CurrencyContext';
import { PriceChart } from '../components/token/PriceChart';

type Range = '24H' | '7D' | '30D';

interface TokenDetailScreenProps {
  symbol: string;
  goBack: () => void;
  navigate: (s: Screen, param?: string) => void;
}

function buildSeries(price: number, changePct: number, points: number, rangeScale: number): number[] {
  const p = price > 0 ? price : 1;
  const drift = (changePct / 100) * rangeScale;
  const start = p / (1 + drift);
  const out: number[] = [];
  let v = start;
  for (let i = 0; i < points; i++) {
    const t = i / Math.max(points - 1, 1);
    const trend = start + (p - start) * t;
    const wobble = Math.sin(i * 0.55) * p * 0.012 * rangeScale + Math.cos(i * 0.19) * p * 0.008 * rangeScale;
    v = Math.max(p * 0.4, trend + wobble);
    out.push(v);
  }
  out[out.length - 1] = p;
  return out;
}

const ACTIONS: { label: string; screen: Screen; Icon: typeof ArrowDownToLine }[] = [
  { label: 'Deposit', screen: 'deposit', Icon: ArrowDownToLine },
  { label: 'Withdraw', screen: 'withdraw', Icon: ArrowUpFromLine },
  { label: 'Swap', screen: 'swap', Icon: RefreshCw },
  { label: 'Buy', screen: 'onramp', Icon: CreditCard },
];

/** Token detail — price, chart, balance, actions. */
export function TokenDetailScreen({ symbol, goBack, navigate }: TokenDetailScreenProps) {
  const { assets } = useWalletAssets();
  const { format } = useCurrency();
  const [range, setRange] = useState<Range>('24H');

  const asset = assets.find((a) => a.symbol.toUpperCase() === (symbol || '').toUpperCase()) || assets[0];
  const up = (asset?.change24h || 0) >= 0;

  const series = useMemo(() => {
    if (!asset) return [];
    if (asset.sparkline?.length > 4 && range === '24H') return asset.sparkline;
    const scale = range === '24H' ? 1 : range === '7D' ? 1.8 : 3.2;
    const points = range === '24H' ? 48 : range === '7D' ? 64 : 80;
    return buildSeries(asset.price || 1, asset.change24h || 0, points, scale);
  }, [asset, range]);

  if (!asset) {
    return (
      <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
        <PageTop />
        <div className="px-5">
          <button type="button" onClick={goBack} style={{ color: 'var(--foreground)' }}>
            Back
          </button>
          <p className="mt-8 text-center" style={{ color: 'var(--muted-foreground)' }}>
            Token not found
          </p>
        </div>
      </div>
    );
  }

  const priceLabel =
    asset.price >= 1
      ? `$${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : `$${asset.price.toLocaleString(undefined, { maximumFractionDigits: 6 })}`;

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--background)' }}>
      <PageTop />
      <div className="flex items-center gap-3 px-5 mb-4">
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={goBack}
          aria-label="Back"
          className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
        >
          <ChevronLeft size={20} style={{ color: 'var(--foreground)' }} />
        </motion.button>
        <div className="flex items-center gap-2.5 min-w-0">
          <AssetIcon symbol={asset.symbol} size={28} />
          <div className="min-w-0">
            <h1 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 18, lineHeight: 1.1 }}>
              {asset.symbol}
            </h1>
            <p className="truncate" style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
              {asset.name}
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 mb-2">
        <p className="tabular-nums" style={{ color: 'var(--foreground)', fontSize: 34, fontWeight: 800, letterSpacing: -1 }}>
          {priceLabel}
        </p>
        <p style={{ fontSize: 14, fontWeight: 600, marginTop: 4, color: up ? 'var(--positive, #22c55e)' : 'var(--destructive)' }}>
          {up ? '+' : ''}
          {asset.change24h.toFixed(2)}% <span style={{ color: 'var(--muted-foreground)', fontWeight: 500 }}>24h</span>
        </p>
      </div>

      <div className="px-2 mb-3">
        <PriceChart series={series} up={up} height={168} />
      </div>

      <div className="flex gap-2 px-5 mb-5">
        {(['24H', '7D', '30D'] as Range[]).map((r) => {
          const active = range === r;
          return (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className="flex-1 py-2 rounded-full"
              style={{
                background: active ? 'var(--foreground)' : 'var(--muted)',
                color: active ? 'var(--background)' : 'var(--foreground)',
                fontSize: 12,
                fontWeight: 700,
                border: active ? 'none' : '1px solid var(--border)',
              }}
            >
              {r}
            </button>
          );
        })}
      </div>

      <div className="flex justify-center gap-5 px-5 mb-6">
        {ACTIONS.map((a) => (
          <motion.button
            key={a.label}
            type="button"
            whileTap={{ scale: 0.92 }}
            onClick={() => navigate(a.screen)}
            className="flex flex-col items-center gap-2"
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
            >
              <a.Icon size={18} style={{ color: 'var(--foreground)' }} />
            </div>
            <span style={{ color: 'var(--foreground)', fontSize: 11, fontWeight: 600 }}>{a.label}</span>
          </motion.button>
        ))}
      </div>

      <div className="px-5 pb-10">
        <div
          className="rounded-[20px] px-4 py-3.5 mb-3"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}>Your balance</p>
          <p className="tabular-nums mt-1" style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 20 }}>
            {Number(asset.balance).toLocaleString(undefined, { maximumFractionDigits: 8 })} {asset.symbol}
          </p>
          <p className="tabular-nums" style={{ color: 'var(--muted-foreground)', fontSize: 13, marginTop: 2 }}>
            {format(Number(asset.valueUSD) || 0)}
          </p>
        </div>

        {!!asset.chains?.length && (
          <div
            className="rounded-[20px] overflow-hidden"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <p className="px-4 pt-3 pb-1" style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}>
              Networks
            </p>
            {asset.chains.map((c, i) => (
              <div
                key={c}
                className="px-4 py-3"
                style={{
                  borderTop: i === 0 ? '1px solid var(--border)' : undefined,
                  borderBottom: i < asset.chains.length - 1 ? '1px solid var(--border)' : undefined,
                }}
              >
                <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>{c}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
