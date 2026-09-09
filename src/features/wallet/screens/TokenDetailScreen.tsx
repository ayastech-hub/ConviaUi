import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  RefreshCw,
  CreditCard,
  CircleDollarSign,
} from 'lucide-react';
import type { Screen } from '../../../shared/data/mockData';
import { AssetIcon } from '../../../shared/components/AssetIcon';
import { PageTop } from '../../../shared/components/PageTop';
import { useWalletAssets } from '../../../shared/hooks/useWalletAssets';
import { useCurrency } from '../../../shared/context/CurrencyContext';
import { PriceChart } from '../components/token/PriceChart';
import { BackButton } from '../../../shared/components/BackButton';

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
  for (let i = 0; i < points; i++) {
    const t = i / Math.max(points - 1, 1);
    const trend = start + (p - start) * t;
    const wobble =
      Math.sin(i * 0.55) * p * 0.012 * rangeScale + Math.cos(i * 0.19) * p * 0.008 * rangeScale;
    out.push(Math.max(p * 0.4, trend + wobble));
  }
  out[out.length - 1] = p;
  return out;
}

const ACTIONS: { label: string; screen: Screen; Icon: typeof ArrowDownToLine }[] = [
  { label: 'Deposit', screen: 'deposit', Icon: ArrowDownToLine },
  { label: 'Withdraw', screen: 'withdraw', Icon: ArrowUpFromLine },
  { label: 'Buy', screen: 'onramp', Icon: CreditCard },
  { label: 'Sell', screen: 'offramp', Icon: CircleDollarSign },
];

export function TokenDetailScreen({ symbol, goBack, navigate }: TokenDetailScreenProps) {
  const { assets } = useWalletAssets();
  const { format } = useCurrency();
  const [range, setRange] = useState<Range>('24H');

  const asset =
    assets.find((a) => a.symbol.toUpperCase() === (symbol || '').toUpperCase()) || assets[0];
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
          <BackButton onClick={goBack} />
        </div>
      </div>
    );
  }

  const go = (s: Screen) => navigate(s, asset.symbol);
  const intPart = Math.floor(asset.price);
  const decPart =
    asset.price >= 1
      ? asset.price.toFixed(2).split('.')[1]
      : asset.price.toFixed(6).replace(/^0\./, '');

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--background)' }}>
      <PageTop />
      <div className="flex items-center justify-between px-5 mb-5">
        <BackButton onClick={goBack} />
        <div className="text-center min-w-0 px-2">
          <p style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 16 }}>{asset.symbol}</p>
          <p className="truncate" style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>
            {asset.name}
          </p>
        </div>
        <div className="w-10" />
      </div>

      <div className="flex flex-col items-center px-5 mb-4">
        <AssetIcon symbol={asset.symbol} size={56} />
        <div className="mt-4 flex items-baseline justify-center gap-0.5 tabular-nums">
          <span style={{ color: 'var(--muted-foreground)', fontSize: 22, fontWeight: 600 }}>$</span>
          {asset.price >= 1 ? (
            <>
              <span
                style={{
                  color: 'var(--foreground)',
                  fontSize: 40,
                  fontWeight: 800,
                  letterSpacing: -1.2,
                }}
              >
                {intPart.toLocaleString()}
              </span>
              <span style={{ color: 'var(--muted-foreground)', fontSize: 22, fontWeight: 600 }}>
                .{decPart}
              </span>
            </>
          ) : (
            <span
              style={{
                color: 'var(--foreground)',
                fontSize: 36,
                fontWeight: 800,
                letterSpacing: -1,
              }}
            >
              {asset.price.toLocaleString(undefined, { maximumFractionDigits: 6 })}
            </span>
          )}
        </div>
        <span
          className="mt-2 px-2.5 py-1 rounded-full tabular-nums"
          style={{
            background: 'var(--muted)',
            color: up ? 'var(--positive, #22c55e)' : 'var(--destructive)',
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {up ? '+' : ''}
          {asset.change24h.toFixed(2)}% · 24h
        </span>
      </div>

      <div className="px-5 mb-3">
        <div
          className="rounded-[24px] overflow-hidden pt-3"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <PriceChart series={series} up={up} height={148} />
          <div className="flex gap-1.5 px-3 pb-3">
            {(['24H', '7D', '30D'] as Range[]).map((r) => {
              const active = range === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRange(r)}
                  className="flex-1 py-1.5 rounded-full"
                  style={{
                    background: active ? 'var(--foreground)' : 'transparent',
                    color: active ? 'var(--background)' : 'var(--muted-foreground)',
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {r}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 px-5 mb-5">
        {ACTIONS.map((a) => (
          <motion.button
            key={a.label}
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={() => go(a.screen)}
            className="flex flex-col items-center gap-1.5 py-3 rounded-[18px]"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <a.Icon size={18} style={{ color: 'var(--foreground)' }} />
            <span style={{ color: 'var(--foreground)', fontSize: 11, fontWeight: 600 }}>
              {a.label}
            </span>
          </motion.button>
        ))}
      </div>

      <div className="px-5 pb-10 space-y-3">
        <div
          className="rounded-[20px] px-4 py-4"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}>
                Balance
              </p>
              <p
                className="tabular-nums mt-1"
                style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 22 }}
              >
                {Number(asset.balance).toLocaleString(undefined, { maximumFractionDigits: 8 })}
              </p>
              <p
                className="tabular-nums"
                style={{ color: 'var(--muted-foreground)', fontSize: 13, marginTop: 2 }}
              >
                {asset.symbol} · {format(Number(asset.valueUSD) || 0)}
              </p>
            </div>
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => go('swap')}
              className="flex items-center gap-1.5 px-3.5 h-10 rounded-full"
              style={{
                background: 'var(--muted)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)',
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              <RefreshCw size={14} />
              Swap
            </motion.button>
          </div>
        </div>

        {!!asset.chains?.length && (
          <div
            className="rounded-[20px] overflow-hidden"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <p
              className="px-4 pt-3 pb-2"
              style={{
                color: 'var(--muted-foreground)',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 0.4,
                textTransform: 'uppercase',
              }}
            >
              Networks
            </p>
            {asset.chains.map((c) => (
              <div
                key={c}
                className="px-4 py-3 flex items-center justify-between"
                style={{ borderTop: '1px solid var(--border)' }}
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
