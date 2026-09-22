/**
 * Dual-tone icons for the More panel only.
 * Primary path → var(--foreground)  (visible on light & dark)
 * Accent path  → var(--primary)     (Convia brand)
 */
import type { CSSProperties } from 'react';

const svgProps = {
  viewBox: '0 0 24 24',
  width: 26,
  height: 26,
  className: 'dual-icon',
  'aria-hidden': true as const,
};

const primary: CSSProperties = { fill: 'var(--foreground)' };
const accent: CSSProperties = { fill: 'var(--primary)' };

export function DualIconBox({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="dual-icon-box relative flex items-center justify-center overflow-hidden"
      style={{
        width: 56,
        height: 56,
        borderRadius: 16,
        background: 'var(--card)',
        border: '1px solid var(--border)',
        boxShadow: '0 4px 12px color-mix(in oklab, var(--foreground) 6%, transparent)',
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 dual-icon-glow"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, color-mix(in oklab, var(--primary) 28%, transparent), transparent 70%)',
        }}
      />
      <span className="relative z-[1]">{children}</span>
    </div>
  );
}

/** Dual-tone circle: left half foreground, right half primary + arrow cutout */
export function IconSend() {
  return (
    <svg {...svgProps} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" fill="var(--foreground)" />
      <path d="M12 2a10 10 0 010 20V2z" fill="var(--primary)" />
      <path
        d="M10.2 13.8L14.5 9.5M10.5 9.5h4v4"
        fill="none"
        stroke="var(--background)"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconReceive() {
  return (
    <svg {...svgProps} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" fill="var(--foreground)" />
      <path d="M12 2a10 10 0 010 20V2z" fill="var(--primary)" />
      <path
        d="M13.8 10.2L9.5 14.5M13.5 14.5h-4v-4"
        fill="none"
        stroke="var(--background)"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconBuy() {
  return (
    <svg {...svgProps}>
      <path
        style={primary}
        d="M4 6h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z"
        fill="none"
        stroke="var(--foreground)"
        strokeWidth="1.8"
      />
      <path style={accent} d="M4 6h16v3H4z" />
      <circle cx="8" cy="14" r="1.2" style={accent} />
    </svg>
  );
}

export function IconSell() {
  return (
    <svg {...svgProps}>
      <circle cx="12" cy="12" r="8" fill="none" stroke="var(--foreground)" strokeWidth="1.8" />
      <path
        style={accent}
        d="M12 7v10M9.5 9.5c0-1 1.2-1.8 2.5-1.8s2.5.8 2.5 1.8-1 1.5-2.5 1.8c-1.5.3-2.5 1-2.5 2.2s1.2 1.8 2.5 1.8 2.5-.8 2.5-1.8"
        fill="none"
        stroke="var(--primary)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconSwap() {
  return (
    <svg {...svgProps}>
      <path
        d="M7 8h11M15 5l3 3-3 3"
        fill="none"
        stroke="var(--foreground)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17 16H6M9 13l-3 3 3 3"
        fill="none"
        stroke="var(--primary)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconQr() {
  return (
    <svg {...svgProps}>
      <path style={primary} d="M3 3h8v8H3V3zm2 2v4h4V5H5zM13 3h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5z" />
      <path style={accent} d="M13 13h3v3h-3v-3zm5 0h3v2h-3v-2zm-2 5h2v3h-2v-3zm4 2h1v1h-1v-1z" />
    </svg>
  );
}

export function IconBank() {
  return (
    <svg {...svgProps}>
      <path style={primary} d="M3 10l9-6 9 6v2H3v-2zm2 4h2v5H5v-5zm5 0h2v5h-2v-5zm5 0h2v5h-2v-5z" />
      <path style={accent} d="M3 20h18v2H3z" />
    </svg>
  );
}

export function IconPhone() {
  return (
    <svg {...svgProps}>
      <path
        style={primary}
        d="M8 2h8a2 2 0 012 2v16a2 2 0 01-2 2H8a2 2 0 01-2-2V4a2 2 0 012-2zm0 2v14h8V4H8z"
      />
      <circle cx="12" cy="17.5" r="1" style={accent} />
    </svg>
  );
}

export function IconData() {
  return (
    <svg {...svgProps}>
      <path
        d="M5 12a7 7 0 0114 0"
        fill="none"
        stroke="var(--foreground)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M8 12a4 4 0 018 0"
        fill="none"
        stroke="var(--primary)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="1.4" style={accent} />
    </svg>
  );
}

export function IconPower() {
  return (
    <svg {...svgProps}>
      <path
        style={primary}
        d="M13 2L4 14h7l-1 8 10-14h-7l0-6z"
      />
      <path style={accent} d="M11 14h2l-.3 2.4-.7 5.6L11 14z" opacity={0.9} />
    </svg>
  );
}

export function IconTv() {
  return (
    <svg {...svgProps}>
      <path
        style={primary}
        d="M4 6h16a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z"
        fill="none"
        stroke="var(--foreground)"
        strokeWidth="1.8"
      />
      <path style={accent} d="M8 20h8v1.5H8z" />
      <path style={accent} d="M7 9h10v5H7z" opacity={0.85} />
    </svg>
  );
}

export function IconRewards() {
  return (
    <svg {...svgProps}>
      <path style={primary} d="M12 15c2.8 0 5-2.2 5-5s-2.2-5-5-5-5 2.2-5 5 2.2 5 5 5z" />
      <path style={accent} d="M8.5 14.5L6 21l6-2 6 2-2.5-6.5C14.3 15.4 13.2 16 12 16s-2.3-.6-3.5-1.5z" />
    </svg>
  );
}

export function IconGift() {
  return (
    <svg {...svgProps}>
      <path style={primary} d="M4 10h16v10a2 2 0 01-2 2H6a2 2 0 01-2-2V10z" />
      <path style={accent} d="M2 6h20v4H2V6zm9 0h2v16h-2V6z" />
    </svg>
  );
}

export function IconUsers() {
  return (
    <svg {...svgProps}>
      <path style={primary} d="M12 12a4 4 0 100-8 4 4 0 000 8zm-8 8v-1c0-2.7 5.3-4 8-4s8 1.3 8 4v1H4z" />
      <path style={accent} d="M19 8h-2v2h-2V8h-2V6h2V4h2v2h2v2z" />
    </svg>
  );
}

export function IconLink() {
  return (
    <svg {...svgProps}>
      <path
        d="M10 13a5 5 0 007.5.5l2-2a5 5 0 00-7-7l-1.2 1.2"
        fill="none"
        stroke="var(--foreground)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M14 11a5 5 0 00-7.5-.5l-2 2a5 5 0 007 7l1.2-1.2"
        fill="none"
        stroke="var(--primary)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconHistory() {
  return (
    <svg {...svgProps} viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="4" fill="var(--foreground)" />
      <rect x="12" y="3" width="9" height="18" rx="0" fill="var(--primary)" />
      <path
        d="M12 8v4.5l2.5 1.5"
        fill="none"
        stroke="var(--background)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconScan() {
  return (
    <svg {...svgProps}>
      <path
        d="M4 8V5a1 1 0 011-1h3M16 4h3a1 1 0 011 1v3M20 16v3a1 1 0 01-1 1h-3M8 20H5a1 1 0 01-1-1v-3"
        fill="none"
        stroke="var(--foreground)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path d="M7 12h10" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconShield() {
  return (
    <svg {...svgProps}>
      <path style={primary} d="M12 2L4 5v6c0 5 3.4 9.4 8 10.5 4.6-1.1 8-5.5 8-10.5V5l-8-3z" />
      <path
        d="M9 12l2 2 4-4"
        fill="none"
        stroke="var(--primary)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconSupport() {
  return (
    <svg {...svgProps}>
      <path
        style={primary}
        d="M12 3a7 7 0 00-7 7v2a3 3 0 003 3h1v-4H6a5 5 0 0110 0h-3v4h1a3 3 0 003-3v-2a7 7 0 00-7-7z"
      />
      <path style={accent} d="M10 18h4v2a2 2 0 01-2 2 2 2 0 01-2-2v-2z" />
    </svg>
  );
}

export function IconMore() {
  return (
    <svg {...svgProps} viewBox="0 0 24 24">
      <rect x="3" y="3" width="8" height="8" rx="2" fill="var(--foreground)" />
      <rect x="13" y="3" width="8" height="8" rx="2" fill="var(--primary)" />
      <rect x="3" y="13" width="8" height="8" rx="2" fill="var(--primary)" />
      <rect x="13" y="13" width="8" height="8" rx="2" fill="var(--foreground)" />
    </svg>
  );
}

export type DualIconKey =
  | 'send'
  | 'receive'
  | 'buy'
  | 'sell'
  | 'swap'
  | 'qr'
  | 'bank'
  | 'card'
  | 'airtime'
  | 'data'
  | 'power'
  | 'tv'
  | 'rewards'
  | 'gifts'
  | 'request'
  | 'reqlink'
  | 'history'
  | 'scan'
  | 'security'
  | 'support'
  | 'more';

const MAP: Record<DualIconKey, () => JSX.Element> = {
  send: IconSend,
  receive: IconReceive,
  buy: IconBuy,
  sell: IconSell,
  swap: IconSwap,
  qr: IconQr,
  bank: IconBank,
  card: IconBuy,
  airtime: IconPhone,
  data: IconData,
  power: IconPower,
  tv: IconTv,
  rewards: IconRewards,
  gifts: IconGift,
  request: IconUsers,
  reqlink: IconLink,
  history: IconHistory,
  scan: IconScan,
  security: IconShield,
  support: IconSupport,
  more: IconMore,
};

export function DualToneIcon({ name }: { name: DualIconKey }) {
  const Comp = MAP[name] || IconHistory;
  return <Comp />;
}
