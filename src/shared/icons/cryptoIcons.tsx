import { useState, useMemo, type CSSProperties } from 'react';

type AssetIconProps = {
  /** Numerical Chain ID (e.g., 1 = Ethereum, 8453 = Base, 137 = Polygon) */
  chainId?: number;
  /** Smart contract address (0x...). Leave blank or use 'native' for native gas tokens (ETH, SOL, BTC) */
  contractAddress?: string;
  /** Ticker symbol used for local hardcoded SVG overrides and letter fallback */
  symbol: string;
  size?: number;
  className?: string;
  style?: CSSProperties;
};

// TrustWallet mapped blockchain slugs (uses Chain IDs for exact precision)
const CHAIN_SLUG_MAP: Record<number, string> = {
  1: 'ethereum',
  10: 'optimism',
  56: 'smartchain',
  137: 'polygon',
  8453: 'base',
  42161: 'arbitrum',
  43114: 'avalanchec',
};

// TrustWallet mapped native coin slugs
const NATIVE_COIN_MAP: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  BNB: 'binance',
  SOL: 'solana',
  TRX: 'tron',
  MATIC: 'polygon',
  POL: 'polygon',
};

/**
  Builds a CDN URL pointing to TrustWallet's official repo via jsDelivr CDN
 */
function getAssetUrl(symbol: string, chainId?: number, address?: string): string | null {
  const sym = symbol.toUpperCase();

  // 1. ERC-20 / SPL / BEP-20 Tokens (via Chain ID & Contract Address)
  if (chainId && address && address.toLowerCase() !== 'native') {
    const chainSlug = CHAIN_SLUG_MAP[chainId];
    if (chainSlug) {
      // TrustWallet expects checksummed addresses for EVM chains
      return `https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/${chainSlug}/assets/${address}/logo.png`;
    }
  }

  // 2. Native Coins (BTC, ETH, SOL, etc.)
  const nativeSlug = NATIVE_COIN_MAP[sym];
  if (nativeSlug) {
    return `https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/${nativeSlug}/info/logo.png`;
  }

  return null;
}

export function AssetIcon({
  symbol,
  chainId,
  contractAddress,
  size = 32,
  className,
  style,
}: AssetIconProps) {
  const [hasError, setHasError] = useState(false);

  // Compute image URL once per prop change
  const imageUrl = useMemo(() => {
    setHasError(false);
    return getAssetUrl(symbol, chainId, contractAddress);
  }, [symbol, chainId, contractAddress]);

  // Fallback state: Render styled letter badge
  if (!imageUrl || hasError) {
    const displayChar = (symbol || '?').slice(0, 1).toUpperCase();
    return (
      <span
        className={className}
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
          ...style,
        }}
        title={symbol}
      >
        {displayChar}
      </span>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={`${symbol} logo`}
      width={size}
      height={size}
      className={className}
      loading="lazy"
      onError={() => setHasError(true)}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        objectFit: 'cover',
        flexShrink: 0,
        ...style,
      }}
    />
  );
}
