import { useState, type CSSProperties } from 'react';

/**
 * Provider / bill-service logos (MTN, Vodafone, DSTV, ECG, etc.).
 *
 * Temporary free CDN: Hunter Logo API (no key) — https://logos.hunter.io/{domain}
 * Later we can switch to self-hosted PNGs in /public/icons/providers/
 * or a paid service (logo.dev / Brandfetch) without changing call sites.
 *
 * Falls back to the same letter badge style used by CurrencyIcon.
 */
type Props = {
  name: string;
  /** Short label used for the letter fallback (e.g. "MTN", "VDF") */
  logo?: string;
  size?: number;
  className?: string;
  style?: CSSProperties;
  /** rounded-xl (default for list rows) or full circle */
  rounded?: 'xl' | 'full';
};

/** Provider display name → primary website domain */
const PROVIDER_DOMAIN: Record<string, string> = {
  // Telecom (Ghana + regional)
  MTN: 'mtn.com',
  Vodafone: 'vodafone.com',
  AirtelTigo: 'airteltigo.com.gh',
  Airtel: 'airtel.com',
  Telecel: 'telecel.com.gh', // Vodafone Ghana rebrand

  // Electricity
  ECG: 'ecg.com.gh',
  VRA: 'vra.com',

  // TV / bills
  DSTV: 'dstv.com',
  GOtv: 'gotv.com',
  'Ghana Water': 'gwcl.com.gh',

  // Betting
  SportyBet: 'sportybet.com',
  Betway: 'betway.com',
  '1xBet': '1xbet.com',
};

export function ProviderIcon({
  name,
  logo,
  size = 40,
  className,
  style,
  rounded = 'xl',
}: Props) {
  const [failed, setFailed] = useState(false);
  const key = (name || '').trim();
  const domain = PROVIDER_DOMAIN[key];
  const fallbackLabel = (logo || key).slice(0, 3).toUpperCase();

  const radius = rounded === 'full' ? '50%' : 12; // matches rounded-xl ≈ 12px

  // Free, no-key CDN for now. Swap this line later for self-hosted or paid.
  const src = domain ? `https://logos.hunter.io/${domain}` : null;

  if (!src || failed) {
    return (
      <span
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--muted)',
          color: 'var(--foreground)',
          fontSize: size * 0.28,
          fontWeight: 800,
          flexShrink: 0,
          letterSpacing: '-0.02em',
          ...style,
        }}
      >
        {fallbackLabel}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className={className}
      onError={() => setFailed(true)}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        objectFit: 'contain',
        flexShrink: 0,
        background: 'var(--muted)',
        padding: size * 0.12, // small inset so logos don't touch the edge
        ...style,
      }}
    />
  );
}

export const KNOWN_PROVIDER_NAMES = Object.keys(PROVIDER_DOMAIN);
