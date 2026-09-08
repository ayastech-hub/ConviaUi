import { useState, useMemo, type CSSProperties } from 'react';

type SvgProps = { size?: number; className?: string; style?: CSSProperties };

type AssetIconProps = SvgProps & {
  /** Token ticker symbol (e.g. 'USDC', 'ETH', 'WBTC') */
  symbol: string;
  /** Numerical EVM or non-EVM Chain ID (e.g., 1 = Ethereum, 8453 = Base, 137 = Polygon) */
  chainId?: number;
  /** Smart contract address for ERC-20 / SPL tokens */
  contractAddress?: string;
};

type ChainIconProps = SvgProps & {
  /** Chain key string or Chain ID (e.g., 'ethereum', 'base', 1, 8453) */
  chainKey: string | number;
};

// TrustWallet multi-chain identifier mapping
const TRUSTWALLET_CHAIN_SLUGS: Record<number | string, string> = {
  // EVM Chain IDs
  1: 'ethereum',
  10: 'optimism',
  56: 'smartchain',
  137: 'polygon',
  8453: 'base',
  42161: 'arbitrum',
  43114: 'avalanchec',
  // String keys mapped to TrustWallet directory names
  ethereum: 'ethereum',
  sepolia: 'ethereum',
  bitcoin: 'bitcoin',
  solana: 'solana',
  tron: 'tron',
  bnb: 'smartchain',
  bsc: 'smartchain',
  polygon: 'polygon',
  base: 'base',
  arbitrum: 'arbitrum',
  optimism: 'optimism',
};

// Canonical native asset identifiers mapped to TrustWallet asset directories
const TRUSTWALLET_NATIVE_MAP: Record<string, string> = {
  BTC: 'bitcoin',
  WBTC: 'bitcoin',
  ETH: 'ethereum',
  WETH: 'ethereum',
  BNB: 'smartchain',
  SOL: 'solana',
  TRX: 'tron',
  MATIC: 'polygon',
  POL: 'polygon',
};

/**
 * Returns the TrustWallet Asset CDN URL
 */
function getAssetUrl(symbol: string, chainId?: number, address?: string): string | null {
  const sym = symbol.toUpperCase();

  // 1. Fetch by Contract Address & Chain ID (Most reliable for tokens)
  if (chainId && address && address.toLowerCase() !== 'native') {
    const chainSlug = TRUSTWALLET_CHAIN_SLUGS[chainId];
    if (chainSlug) {
      return `https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/${chainSlug}/assets/${address}/logo.png`;
    }
  }

  // 2. Fetch Native Mainnet Coin Logo
  const nativeSlug = TRUSTWALLET_NATIVE_MAP[sym];
  if (nativeSlug) {
    return `https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/${nativeSlug}/info/logo.png`;
  }

  return null;
}

/**
 * Returns the TrustWallet Chain/Network Logo URL
 */
function getChainUrl(chainKey: string | number): string | null {
  const slug = TRUSTWALLET_CHAIN_SLUGS[chainKey] || TRUSTWALLET_CHAIN_SLUGS[String(chainKey).toLowerCase()];
  if (!slug) return null;
  return `https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/${slug}/info/logo.png`;
}

function LetterFallback({ label, size }: { label: string; size: number }) {
  const displayChar = (label || '?').slice(0, 1).toUpperCase();
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#475569',
        color: '#FFFFFF',
        fontSize: size * 0.38,
        fontWeight: 700,
        userSelect: 'none',
        flexShrink: 0,
      }}
      title={label}
    >
      {displayChar}
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
}: {
  src: string;
  alt: string;
  size: number;
  className?: string;
  style?: CSSProperties;
  fallbackLabel: string;
}) {
  const [errored, setErrored] = useState(false);

  if (errored) return <LetterFallback label={fallbackLabel} size={size} />;

  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={className}
      loading="lazy"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        objectFit: 'cover',
        flexShrink: 0,
        ...style,
      }}
      onError={() => setErrored(true)}
    />
  );
}

export function AssetIcon({
  symbol,
  chainId,
  contractAddress,
  size = 32,
  className,
  style,
}: AssetIconProps) {
  const imageUrl = useMemo(
    () => getAssetUrl(symbol, chainId, contractAddress),
    [symbol, chainId, contractAddress]
  );

  if (!imageUrl) return <LetterFallback label={symbol} size={size} />;

  return (
    <LogoImg
      src={imageUrl}
      alt={symbol}
      size={size}
      className={className}
      style={style}
      fallbackLabel={symbol}
    />
  );
}

export function ChainIcon({ chainKey, size = 28, className, style }: ChainIconProps) {
  const imageUrl = useMemo(() => getChainUrl(chainKey), [chainKey]);

  if (!imageUrl) return <LetterFallback label={String(chainKey)} size={size} />;

  return (
    <LogoImg
      src={imageUrl}
      alt={String(chainKey)}
      size={size}
      className={className}
      style={style}
      fallbackLabel={String(chainKey)}
    />
  );
}

export const KNOWN_TOKEN_SYMBOLS = Object.keys(TRUSTWALLET_NATIVE_MAP);
export const KNOWN_CHAIN_KEYS = Object.keys(TRUSTWALLET_CHAIN_SLUGS);
