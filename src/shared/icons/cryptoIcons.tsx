/**
 * Canonical token + chain logos for Convia.
 * Import AssetIcon / ChainIcon everywhere — no blank letter badges for known assets.
 *
 * Real, official brand marks are pulled from CDN sources rather than hand-drawn,
 * so the icons stay pixel-accurate to each project's actual logo:
 *   - Coins:  cryptocurrency-icons (CC0)  → https://github.com/atomiclabs/cryptocurrency-icons
 *   - Chains: simple-icons (CC0)          → https://simpleicons.org
 * Both are widely used, license-clean icon sets — no reverse-engineered paths.
 */
import { useState, type CSSProperties } from 'react';

type SvgProps = { size?: number; className?: string; style?: CSSProperties };

const CRYPTO_ICONS_VERSION = '0.18.1';
const cryptoIconUrl = (slug: string) =>
  `https://cdn.jsdelivr.net/npm/cryptocurrency-icons@${CRYPTO_ICONS_VERSION}/svg/color/${slug}.svg`;

// simple-icons CDN recolors the mark to the given hex — used for chains that
// aren't "coins" (L2s, etc.) so they don't exist in cryptocurrency-icons.
const simpleIconUrl = (slug: string, hex: string) => `https://cdn.simpleicons.org/${slug}/${hex}`;

/** symbol (as used in-app) -> cryptocurrency-icons slug */
const TOKEN_SLUG: Record<string, string> = {
  ETH: 'eth',
  WETH: 'eth',
  BTC: 'btc',
  WBTC: 'btc',
  USDT: 'usdt',
  USDC: 'usdc',
  SOL: 'sol',
  TRX: 'trx',
  BNB: 'bnb',
  POL: 'matic', // POL is MATIC's rebrand; icon set hasn't caught up yet
  MATIC: 'matic',
  BUSD: 'busd',
};

/** chainKey (lowercase, as used in-app) -> { source, slug/hex } */
type ChainEntry = { kind: 'crypto'; slug: string } | { kind: 'simple'; slug: string; hex: string };

const CHAIN_ENTRY: Record<string, ChainEntry> = {
  ethereum: { kind: 'crypto', slug: 'eth' },
  sepolia: { kind: 'crypto', slug: 'eth' },
  bitcoin: { kind: 'crypto', slug: 'btc' },
  solana: { kind: 'crypto', slug: 'sol' },
  tron: { kind: 'crypto', slug: 'trx' },
  bnb: { kind: 'crypto', slug: 'bnb' },
  bsc: { kind: 'crypto', slug: 'bnb' },
  polygon: { kind: 'crypto', slug: 'matic' },
  base: { kind: 'simple', slug: 'base', hex: '0052FF' },
  arbitrum: { kind: 'simple', slug: 'arbitrum', hex: '12AAFF' },
};

function letterFallback(label: string, size: number, bg: string) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: bg,
        color: '#fff',
        fontSize: size * 0.36,
        fontWeight: 800,
        flexShrink: 0,
      }}
    >
      {(label || '?').slice(0, 1).toUpperCase()}
    </span>
  );
}

function LogoImg({
  src,
  alt,
  size,
  className,
  style,
  fallbackLabel,
  fallbackBg,
}: {
  src: string;
  alt: string;
  size: number;
  className?: string;
  style?: CSSProperties;
  fallbackLabel: string;
  fallbackBg: string;
}) {
  const [errored, setErrored] = useState(false);

  if (errored) return letterFallback(fallbackLabel, size, fallbackBg);

  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, ...style }}
      onError={() => setErrored(true)}
    />
  );
}

export function AssetIcon({ symbol, size = 32, className, style }: SvgProps & { symbol: string }) {
  const key = (symbol || '').toUpperCase();
  const slug = TOKEN_SLUG[key] ?? TOKEN_SLUG[key.replace(/^W/, '')]; // WETH/WBTC fallback

  if (!slug) return letterFallback(symbol || '?', size, '#64748b');

  return (
    <LogoImg
      src={cryptoIconUrl(slug)}
      alt={symbol}
      size={size}
      className={className}
      style={style}
      fallbackLabel={symbol}
      fallbackBg="#64748b"
    />
  );
}

export function ChainIcon({ chainKey, size = 28, className, style }: SvgProps & { chainKey: string }) {
  const key = (chainKey || '').toLowerCase().replace(/\s+/g, '');
  const entry = CHAIN_ENTRY[key];

  if (!entry) return letterFallback(chainKey || '?', size, '#475569');

  const src = entry.kind === 'crypto' ? cryptoIconUrl(entry.slug) : simpleIconUrl(entry.slug, entry.hex);

  return (
    <LogoImg
      src={src}
      alt={chainKey}
      size={size}
      className={className}
      style={style}
      fallbackLabel={chainKey}
      fallbackBg="#475569"
    />
  );
}

export const KNOWN_TOKEN_SYMBOLS = Object.keys(TOKEN_SLUG);
export const KNOWN_CHAIN_KEYS = Object.keys(CHAIN_ENTRY);
