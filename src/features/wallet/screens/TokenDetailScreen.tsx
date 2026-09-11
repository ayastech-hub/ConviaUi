import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  CreditCard,
  CircleDollarSign,
  RefreshCw,
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
  { label: 'Swap', screen: 'swap', Icon: RefreshCw },
];

/** Token market + holdings detail. */
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
  const bal = Number(asset.balance) || 0;
  const value = Number(asset.valueUSD) || bal * (asset.price || 0);

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--background)' }}>
      <PageTop />
      <div className="flex items-center justify-between px-5 mb-4">
        <BackButton onClick={goBack} />
        <div className="text-center min-w-0 px-2">
          <p style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 16, letterSpacing: '-0.02em' }}>
            {asset.symbol}
          </p>
          <p className="truncate" style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
            {asset.name}
          </p>
        </div>
        <div className="w-10" />
      </div>

      {/* Hero price */}
      <div className="flex flex-col items-center px-5 mb-2">
        <div
          className="w-[64px] h-[64px] rounded-full flex items-center justify-center mb-4"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            boxShadow: '0 12px 32px rgba(0,0,0,0.18)',
          }}
        >
          <AssetIcon symbol={asset.symbol} size={40} />
        </div>
        <p
          className="tabular-nums"
          style={{
            color: 'var(--foreground)',
            fontSize: 36,
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 1,
          }}
        >
          $
          {asset.price >= 1
            ? asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : asset.price.toLocaleString(undefined, { maximumFractionDigits: 6 })}
        </p>
        <span
          className="mt-2.5 px-2.5 py-1 rounded-full tabular-nums"
          style={{
            background: up
              ? 'color-mix(in oklab, var(--positive) 14%, transparent)'
              : 'color-mix(in oklab, var(--destructive) 14%, transparent)',
            color: up ? 'var(--positive)' : 'var(--destructive)',
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {up ? '+' : ''}
          {(asset.change24h || 0).toFixed(2)}% · 24h
        </span>
      </div>

      {/* Chart card */}
      <div className="px-5 mb-4">
        <div
          className="rounded-[24px] overflow-hidden pt-3"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <div className="flex gap-1 px-3 mb-1">
            {(['24H', '7D', '30D'] as Range[]).map((r) => {
              const on = range === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRange(r)}
                  className="h-8 px-3 rounded-full text-[12px] font-bold"
                  style={{
                    background: on ? 'var(--liquid-chip-on-bg)' : 'transparent',
                    color: on ? 'var(--liquid-chip-on-text)' : 'var(--muted-foreground)',
                    border: on ? '1px solid var(--liquid-chip-on-border)' : '1px solid transparent',
                    boxShadow: on ? 'var(--liquid-chip-on-shadow)' : 'none',
                  }}
                >
                  {r}
                </button>
              );
            })}
          </div>
          <PriceChart series={series} up={up} height={168} />
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 mb-5">
        <div className="grid grid-cols-5 gap-2">
          {ACTIONS.map(({ label, screen, Icon }) => (
            <motion.button
              key={label}
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={() => go(screen)}
              className="flex flex-col items-center gap-1.5"
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
              >
                <Icon size={18} style={{ color: 'var(--foreground)' }} />
              </div>
              <span style={{ color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 650 }}>{label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Holdings */}
      <div className="px-5 mb-4">
        <p
          style={{
            color: 'var(--muted-foreground)',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 0.4,
            marginBottom: 8,
          }}
        >
          YOUR BALANCE
        </p>
        <div
          className="rounded-[22px] px-4 py-4 flex items-center justify-between"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <div>
            <p className="tabular-nums" style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 20, letterSpacing: '-0.03em' }}>
              {bal.toLocaleString(undefined, { maximumFractionDigits: 8 })} {asset.symbol}
            </p>
            <p className="tabular-nums" style={{ color: 'var(--muted-foreground)', fontSize: 13, marginTop: 4 }}>
              ≈ {format(value)}
            </p>
          </div>
          <AssetIcon symbol={asset.symbol} size={36} />
        </div>
      </div>

      {/* Stats */}
      <div className="px-5 mb-4">
        <p
          style={{
            color: 'var(--muted-foreground)',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 0.4,
            marginBottom: 8,
          }}
        >
          MARKET
        </p>
        <div
          className="rounded-[22px] overflow-hidden"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          {[
            {
              label: 'Price',
              value: `$${
                asset.price >= 1
                  ? asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  : asset.price.toLocaleString(undefined, { maximumFractionDigits: 6 })
              }`,
            },
            {
              label: '24h change',
              value: `${up ? '+' : ''}${(asset.change24h || 0).toFixed(2)}%`,
              tone: up ? 'var(--positive)' : 'var(--destructive)',
            },
          ].map((row, i) => (
            <div
              key={row.label}
              className="px-4 py-3.5 flex items-center justify-between"
              style={{ borderTop: i ? '1px solid var(--border)' : 'none' }}
            >
              <span style={{ color: 'var(--muted-foreground)', fontSize: 13, fontWeight: 600 }}>{row.label}</span>
              <span
                className="tabular-nums"
                style={{ color: row.tone || 'var(--foreground)', fontSize: 14, fontWeight: 700 }}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Networks */}
      {asset.chains && asset.chains.length > 0 && (
        <div className="px-5 pb-28">
          <p
            style={{
              color: 'var(--muted-foreground)',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 0.4,
              marginBottom: 8,
            }}
          >
            NETWORKS
          </p>
          <div
            className="rounded-[22px] overflow-hidden"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            {asset.chains.map((c, i) => (
              <div
                key={c}
                className="px-4 py-3.5 flex items-center justify-between"
                style={{ borderTop: i ? '1px solid var(--border)' : 'none' }}
              >
                <p style={{ color: 'var(--foreground)', fontWeight: 650, fontSize: 14 }}>{c}</p>
                <span
                  className="px-2 py-0.5 rounded-full"
                  style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 650 }}
                >
                  Supported
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
