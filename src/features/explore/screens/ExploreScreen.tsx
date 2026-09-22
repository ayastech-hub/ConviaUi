import { motion } from 'motion/react';
import type { Screen } from '../../../shared/data/mockData';
import { PageTop } from '../../../shared/components/PageTop';
import { DualIconBox, DualToneIcon, type DualIconKey } from '../../home/components/icons/DualToneIcons';
import { useWalletAssets } from '../../../shared/hooks/useWalletAssets';
import { AssetIcon } from '../../../shared/components/AssetIcon';
import { useCurrency } from '../../../shared/context/CurrencyContext';

type Props = {
  navigate: (s: Screen, param?: string) => void;
};

type Feat = { label: string; sub?: string; icon: DualIconKey; screen: Screen; param?: string };

const DISCOVER: Feat[] = [
  { label: 'Buy crypto', sub: 'Card or bank', icon: 'buy', screen: 'onramp' },
  { label: 'Sell crypto', sub: 'Cash out', icon: 'sell', screen: 'offramp' },
  { label: 'Swap', sub: 'Trade assets', icon: 'swap', screen: 'swap' },
  { label: 'Gifts', sub: 'Giveaways', icon: 'gifts', screen: 'giveaway' },
  { label: 'Rewards', sub: 'Earn points', icon: 'rewards', screen: 'rewards' },
  { label: 'Pay link', sub: 'Request payment', icon: 'reqlink', screen: 'request-link' },
  { label: 'QR pay', sub: 'Scan to pay', icon: 'qr', screen: 'scan' },
  { label: 'Support', sub: 'Get help', icon: 'support', screen: 'support-center' },
];

const BILLS: Feat[] = [
  { label: 'Airtime', icon: 'airtime', screen: 'services', param: 'airtime' },
  { label: 'Data', icon: 'data', screen: 'services', param: 'data' },
  { label: 'Electricity', icon: 'power', screen: 'services', param: 'electricity' },
  { label: 'TV & cable', icon: 'tv', screen: 'services', param: 'bills' },
  { label: 'Betting', icon: 'betting', screen: 'services', param: 'betting' },
];

/**
 * Explore — discovery hub (replaces account tab; account is via home avatar).
 */
export function ExploreScreen({ navigate }: Props) {
  const { assets, loading } = useWalletAssets();
  const { currency, convert } = useCurrency();

  const movers = (assets || [])
    .filter((a) => a.price > 0)
    .slice()
    .sort((a, b) => Math.abs(b.change24h || 0) - Math.abs(a.change24h || 0))
    .slice(0, 8);

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--background)' }}>
      <PageTop />

      <div className="px-5 pt-1 pb-3">
        <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 22, letterSpacing: -0.4 }}>
          Explore
        </p>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginTop: 4 }}>
          Markets, bills, and features
        </p>
      </div>

      {/* Market movers */}
      <div className="mb-5">
        <p
          className="px-5 mb-2.5"
          style={{
            color: 'var(--muted-foreground)',
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          Markets
        </p>
        <div
          className="flex gap-2.5 px-4 overflow-x-auto pb-1"
          style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          {loading && movers.length === 0
            ? [1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="shrink-0 rounded-2xl"
                  style={{ width: 128, height: 88, background: 'var(--muted)' }}
                />
              ))
            : movers.map((a) => {
                const up = (a.change24h || 0) >= 0;
                const local = convert(a.price || 0);
                return (
                  <motion.button
                    key={a.symbol}
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate('token', a.symbol)}
                    className="shrink-0 rounded-2xl p-3 text-left"
                    style={{
                      width: 132,
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <AssetIcon symbol={a.symbol} size={22} />
                      <span style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 13 }}>
                        {a.symbol}
                      </span>
                    </div>
                    <p className="tabular-nums" style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}>
                      {currency.symbol}
                      {local.toLocaleString(undefined, {
                        maximumFractionDigits: local >= 100 ? 2 : 6,
                      })}
                    </p>
                    <p
                      className="tabular-nums"
                      style={{
                        color: up ? 'var(--positive, #22c55e)' : 'var(--destructive)',
                        fontSize: 12,
                        fontWeight: 600,
                        marginTop: 2,
                      }}
                    >
                      {up ? '+' : ''}
                      {(a.change24h || 0).toFixed(2)}%
                    </p>
                  </motion.button>
                );
              })}
        </div>
      </div>

      {/* Discover */}
      <div className="px-4 mb-5">
        <p
          className="px-1 mb-2.5"
          style={{
            color: 'var(--muted-foreground)',
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          Discover
        </p>
        <div className="grid grid-cols-4 gap-y-4 gap-x-2">
          {DISCOVER.map((f) => (
            <motion.button
              key={f.label}
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={() => navigate(f.screen, f.param)}
              className="flex flex-col items-center gap-2"
            >
              <DualIconBox size={52}>
                <span style={{ transform: 'scale(0.9)', transformOrigin: 'center' }}>
                  <DualToneIcon name={f.icon} />
                </span>
              </DualIconBox>
              <span
                className="text-center leading-tight"
                style={{ color: 'var(--foreground)', fontSize: 11, fontWeight: 600 }}
              >
                {f.label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Bills */}
      <div className="px-4 pb-28">
        <p
          className="px-1 mb-2.5"
          style={{
            color: 'var(--muted-foreground)',
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          Bills & utilities
        </p>
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          {BILLS.map((row, i) => (
            <motion.button
              key={row.label}
              type="button"
              whileTap={{ scale: 0.99 }}
              onClick={() => navigate(row.screen, row.param)}
              className="w-full flex items-center gap-3 px-3.5 py-3.5 text-left"
              style={{
                borderTop:
                  i === 0 ? undefined : '1px solid color-mix(in oklab, var(--border) 85%, transparent)',
              }}
            >
              <DualIconBox size={42}>
                <span style={{ transform: 'scale(0.8)', transformOrigin: 'center' }}>
                  <DualToneIcon name={row.icon} />
                </span>
              </DualIconBox>
              <span style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14.5 }}>{row.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
