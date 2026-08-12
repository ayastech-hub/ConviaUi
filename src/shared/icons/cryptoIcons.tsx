/**
 * Canonical token + chain SVG logos for Convia.
 * Import AssetIcon / ChainIcon everywhere — no blank letter badges for known assets.
 */
import type { CSSProperties } from 'react';

type SvgProps = { size?: number; className?: string; style?: CSSProperties };

const wrap = (size: number, className: string | undefined, style: CSSProperties | undefined, children: string) => (
  <span
    className={className}
    style={{
      width: size,
      height: size,
      display: 'inline-flex',
      flexShrink: 0,
      borderRadius: '50%',
      overflow: 'hidden',
      ...style,
    }}
    dangerouslySetInnerHTML={{ __html: children }}
  />
);

/** Brand SVGs (simplified official marks, viewBox-normalized). */
const TOKEN_SVG: Record<string, string> = {
  ETH: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="100%" height="100%"><circle cx="16" cy="16" r="16" fill="#627EEA"/><g fill="#fff" fill-opacity=".6"><path d="M16.5 4v8.87l7.5 3.35L16.5 4z"/><path d="M16.5 4L9 16.22l7.5-3.35V4z"/></g><g fill="#fff"><path d="M16.5 21.97v6.03L24 17.62l-7.5 4.35z"/><path d="M16.5 28V21.97L9 17.62 16.5 28z"/></g><g fill="#fff" fill-opacity=".6"><path d="M16.5 20.57l7.5-4.35-7.5-3.34v7.69z"/><path d="M9 16.22l7.5 4.35v-7.69L9 16.22z"/></g></svg>`,
  BTC: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="100%" height="100%"><circle cx="16" cy="16" r="16" fill="#F7931A"/><path fill="#fff" d="M22.5 14.2c.3-2-1.2-3.1-3.3-3.8l.7-2.7-1.6-.4-.6 2.6c-.4-.1-.9-.2-1.3-.3l.7-2.6-1.6-.4-.7 2.7c-.4-.1-.7-.2-1-.3v-.1l-2.3-.6-.4 1.8s1.2.3 1.2.3c.7.2.8.6.8 1l-.8 3.2c0 .1.1.1.1.2h-.1l-1.1 4.5c-.1.2-.3.5-.7.4 0 0-1.2-.3-1.2-.3l-.8 1.9 2.1.5c.4.1.8.2 1.2.3l-.7 2.8 1.6.4.7-2.7c.4.1.9.2 1.3.3l-.7 2.7 1.6.4.7-2.8c2.9.5 5 .3 5.9-2.3.7-2.1 0-3.3-1.5-4.1 1.1-.2 1.9-1 2.1-2.5zm-3.8 5.3c-.5 2.1-4 .9-5.1.7l.9-3.7c1.1.3 4.6.8 4.2 3zm.5-5.3c-.5 1.9-3.3.9-4.2.7l.8-3.3c.9.2 3.9.7 3.4 2.6z"/></svg>`,
  USDT: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="100%" height="100%"><circle cx="16" cy="16" r="16" fill="#26A17B"/><path fill="#fff" d="M17.9 17.6v-.1c0-2.2-1.3-3-3.9-3.4-1.9-.3-2.3-.6-2.3-1.4s.7-1.3 2-1.3c1.2 0 1.9.3 2.2 1 .1.2.2.2.4.1l1.1-.5c.1-.1.2-.2.1-.4-.4-1.1-1.5-1.7-3.1-1.9V8.3c0-.2-.1-.3-.3-.3h-1.1c-.2 0-.3.1-.3.3v1.3c-2 .3-3.3 1.5-3.3 3.2 0 2 1.3 2.9 3.9 3.3 1.7.3 2.3.7 2.3 1.5s-.8 1.4-2.1 1.4c-1.6 0-2.2-.7-2.4-1.5-.1-.2-.2-.3-.4-.2l-1.2.5c-.1.1-.2.2-.1.4.5 1.3 1.6 2 3.5 2.3v1.3c0 .2.1.3.3.3h1.1c.2 0 .3-.1.3-.3v-1.3c2-.3 3.4-1.5 3.4-3.3z"/><path fill="#fff" d="M13.2 7.5h5.6c.2 0 .3-.1.3-.3V6.2c0-.2-.1-.3-.3-.3h-5.6c-.2 0-.3.1-.3.3v1c0 .2.1.3.3.3z"/><path fill="#fff" d="M13.2 25.8h5.6c.2 0 .3-.1.3-.3v-1c0-.2-.1-.3-.3-.3h-5.6c-.2 0-.3.1-.3.3v1c0 .2.1.3.3.3z"/></svg>`,
  USDC: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="100%" height="100%"><circle cx="16" cy="16" r="16" fill="#2775CA"/><path fill="#fff" d="M20.7 18.5c0 2.1-1.3 3.4-3.9 3.8v1.5h-1.5v-1.5c-2.6-.4-4-1.9-4.1-4h1.9c.1 1.3.8 2.1 2.2 2.4v-4.1c-2.7-.6-4-1.6-4-3.7 0-2 1.3-3.4 3.7-3.8V7.6h1.5v1.5c2.3.3 3.7 1.7 3.8 3.7h-1.9c-.1-1.1-.7-1.9-1.9-2.1v3.9c2.8.7 4.2 1.6 4.2 3.9zm-5.4-5.6c-1.1.3-1.7.8-1.7 1.6s.6 1.3 1.7 1.6v-3.2zm3.7 5.9c0-.9-.6-1.4-1.9-1.7v3.5c1.3-.3 1.9-.9 1.9-1.8z"/></svg>`,
  SOL: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="100%" height="100%"><circle cx="16" cy="16" r="16" fill="#000"/><path fill="url(#solg)" d="M9.5 20.2c.2-.2.4-.3.7-.3h12.6c.4 0 .7.5.3.9l-2.5 2.5c-.2.2-.4.3-.7.3H7.3c-.4 0-.7-.5-.3-.9l2.5-2.5zm0-6.5c.2-.2.4-.3.7-.3h12.6c.4 0 .7.5.3.9l-2.5 2.5c-.2.2-.4.3-.7.3H7.3c-.4 0-.7-.5-.3-.9l2.5-2.5zm13.1-3.9l-2.5-2.5c-.2-.2-.4-.3-.7-.3H7.3c-.4 0-.7.5-.3.9l2.5 2.5c.2.2.4.3.7.3h12.6c.4 0 .7-.5.3-.9z"/><defs><linearGradient id="solg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#00FFA3"/><stop offset="100%" stop-color="#DC1FFF"/></linearGradient></defs></svg>`,
  TRX: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="100%" height="100%"><circle cx="16" cy="16" r="16" fill="#FF0013"/><path fill="#fff" d="M21.8 8.2L7.5 12.7l5.1 1.4 1.8 5.8 2.1-2.1 3.6 2.8 1.7-12.4zm-5.8 9.5l-1.3-4.1 6.7-3.7-5.4 7.8z"/></svg>`,
  BNB: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="100%" height="100%"><circle cx="16" cy="16" r="16" fill="#F3BA2F"/><path fill="#fff" d="M16 7.5l2.2 2.2-5.3 5.3-2.2-2.2L16 7.5zm5.5 5.5l2.2 2.2-7.7 7.7-2.2-2.2 7.7-7.7zM10.5 13l2.2 2.2-2.2 2.2-2.2-2.2 2.2-2.2zm11 0l2.2 2.2-2.2 2.2-2.2-2.2 2.2-2.2zM16 18.5l2.2 2.2-2.2 2.2-2.2-2.2 2.2-2.2z"/></svg>`,
  POL: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="100%" height="100%"><circle cx="16" cy="16" r="16" fill="#8247E5"/><path fill="#fff" d="M20.5 12.2c-.4-.2-.9-.2-1.3 0l-2.5 1.4-1.7 1-2.5 1.4c-.4.2-.9.2-1.3 0l-2-1.1c-.4-.2-.7-.7-.7-1.1v-2.3c0-.5.2-.9.7-1.1l2-1.2c.4-.2.9-.2 1.3 0l2 1.2c.4.2.7.7.7 1.1v1.4l1.7-1v-1.4c0-.5-.2-.9-.7-1.1l-3.6-2.1c-.4-.2-.9-.2-1.3 0L7.8 9.5c-.4.2-.7.7-.7 1.1v4.2c0 .5.2.9.7 1.1l3.7 2.1c.4.2.9.2 1.3 0l2.5-1.4 1.7-1 2.5-1.4c.4-.2.9-.2 1.3 0l2 1.1c.4.2.7.7.7 1.1v2.3c0 .5-.2.9-.7 1.1l-2 1.2c-.4.2-.9.2-1.3 0l-2-1.1c-.4-.2-.7-.7-.7-1.1v-1.4l-1.7 1v1.4c0 .5.2.9.7 1.1l3.7 2.1c.4.2.9.2 1.3 0l3.7-2.1c.4-.2.7-.7.7-1.1v-4.2c0-.5-.2-.9-.7-1.1l-3.7-2.1z"/></svg>`,
  MATIC: ``, // alias POL
  BUSD: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="100%" height="100%"><circle cx="16" cy="16" r="16" fill="#F0B90B"/><path fill="#fff" d="M16 8l2.5 2.5L16 13l-2.5-2.5L16 8zm0 11l2.5 2.5L16 24l-2.5-2.5L16 19zm5.5-5.5L24 16l-2.5 2.5L19 16l2.5-2.5zM8 16l2.5-2.5L13 16l-2.5 2.5L8 16z"/></svg>`,
};

TOKEN_SVG.MATIC = TOKEN_SVG.POL;

const CHAIN_SVG: Record<string, string> = {
  ethereum: TOKEN_SVG.ETH,
  sepolia: TOKEN_SVG.ETH,
  bitcoin: TOKEN_SVG.BTC,
  solana: TOKEN_SVG.SOL,
  tron: TOKEN_SVG.TRX,
  bnb: TOKEN_SVG.BNB,
  bsc: TOKEN_SVG.BNB,
  polygon: TOKEN_SVG.POL,
  base: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="100%" height="100%"><circle cx="16" cy="16" r="16" fill="#0052FF"/><path fill="#fff" d="M15.9 26.5c5.8 0 10.5-4.7 10.5-10.5S21.7 5.5 15.9 5.5c-5.2 0-9.5 3.8-10.3 8.8h13.6v3.4H5.6c.8 5 5.1 8.8 10.3 8.8z"/></svg>`,
  arbitrum: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="100%" height="100%"><circle cx="16" cy="16" r="16" fill="#2D374B"/><path fill="#28A0F0" d="M16.2 7.2l7.8 12.6h-3.2l-4.6-7.5-4.6 7.5H8.4L16.2 7.2z"/><path fill="#fff" d="M13.5 21.5l1.6-2.6h5.2l-1.5 2.6h-5.3z"/></svg>`,
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
      {label.slice(0, 1).toUpperCase()}
    </span>
  );
}

export function AssetIcon({ symbol, size = 32, className, style }: SvgProps & { symbol: string }) {
  const key = (symbol || '').toUpperCase().replace(/^W/, ''); // WETH → check ETH too
  const svg = TOKEN_SVG[key] || TOKEN_SVG[(symbol || '').toUpperCase()];
  if (svg) return wrap(size, className, style, svg);
  if (key === 'WETH' && TOKEN_SVG.ETH) return wrap(size, className, style, TOKEN_SVG.ETH);
  return letterFallback(symbol || '?', size, '#64748b');
}

export function ChainIcon({ chainKey, size = 28, className, style }: SvgProps & { chainKey: string }) {
  const key = (chainKey || '').toLowerCase().replace(/\s+/g, '');
  const svg = CHAIN_SVG[key];
  if (svg) return wrap(size, className, style, svg);
  return letterFallback(chainKey || '?', size, '#475569');
}

export const KNOWN_TOKEN_SYMBOLS = Object.keys(TOKEN_SVG);
export const KNOWN_CHAIN_KEYS = Object.keys(CHAIN_SVG);
