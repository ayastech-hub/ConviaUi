/**
 * Dual-tone icons — primary = var(--foreground), accent = var(--primary).
 * Glyph cutouts use var(--background) so they stay visible on both themes.
 */
import type { ReactNode } from 'react';

const S = 28;

function Svg({ children }: { children: ReactNode }) {
  return (
    <svg
      width={S}
      height={S}
      viewBox="0 0 24 24"
      className="dual-icon"
      aria-hidden
      style={{ display: 'block', flexShrink: 0 }}
    >
      {children}
    </svg>
  );
}

export function DualIconBox({ children, size = 56 }: { children: ReactNode; size?: number }) {
  return (
    <div
      className="dual-icon-box relative flex items-center justify-center overflow-hidden"
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.28),
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
      <span className="relative z-[1] flex items-center justify-center">{children}</span>
    </div>
  );
}

/** Offset dual-tone: accent shadow behind, primary face in front (template style). */
export function IconSend() {
  return (
    <Svg>
      <circle cx="14" cy="12" r="8.2" style={{ fill: 'var(--primary)' }} />
      <circle cx="10.5" cy="12" r="8.2" style={{ fill: 'var(--foreground)' }} />
      <path
        d="M9.2 13.6 13.2 9.6M13 13.4V9.6H9.2"
        fill="none"
        stroke="var(--background)"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconReceive() {
  return (
    <Svg>
      <circle cx="14" cy="12" r="8.2" style={{ fill: 'var(--primary)' }} />
      <circle cx="10.5" cy="12" r="8.2" style={{ fill: 'var(--foreground)' }} />
      <path
        d="M13.2 10 9.2 14M10 10v4h4"
        fill="none"
        stroke="var(--background)"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconHistory() {
  return (
    <Svg>
      <path
        d="M8 5.5a3 3 0 0 1 3-3h7a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-7a3 3 0 0 1-3-3v-12z"
        style={{ fill: 'var(--primary)' }}
      />
      <path
        d="M5 6a3 3 0 0 1 3-3h7a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V6z"
        style={{ fill: 'var(--foreground)' }}
      />
      <path
        d="M9.2 8v4.2h3.6"
        fill="none"
        stroke="var(--background)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconMore() {
  return (
    <Svg>
      {/* accent offset squares */}
      <rect x="5.5" y="3.5" width="7" height="7" rx="1.6" style={{ fill: 'var(--primary)' }} />
      <rect x="13.5" y="5.5" width="7" height="7" rx="1.6" style={{ fill: 'var(--primary)' }} />
      <rect x="5.5" y="13.5" width="7" height="7" rx="1.6" style={{ fill: 'var(--primary)' }} />
      {/* primary front squares */}
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.6" style={{ fill: 'var(--foreground)' }} />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.6" style={{ fill: 'var(--foreground)' }} />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.6" style={{ fill: 'var(--foreground)' }} />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.6" style={{ fill: 'var(--foreground)' }} />
    </Svg>
  );
}

export function IconBuy() {
  return (
    <Svg>
      <rect x="3" y="5" width="18" height="14" rx="2.5" style={{ fill: 'var(--foreground)' }} />
      <path d="M3 5h18v4H3z" style={{ fill: 'var(--primary)' }} />
      <circle cx="8" cy="14" r="1.4" style={{ fill: 'var(--background)' }} />
    </Svg>
  );
}

export function IconSell() {
  return (
    <Svg>
      <circle cx="12" cy="12" r="9" style={{ fill: 'var(--foreground)' }} />
      <path d="M12 3a9 9 0 0 1 0 18V3z" style={{ fill: 'var(--primary)' }} />
      <path
        d="M12 7v10M9.6 9.2c0-.9 1.1-1.6 2.4-1.6s2.4.7 2.4 1.6c0 .9-.9 1.3-2.4 1.6-1.5.3-2.4.9-2.4 2s1.1 1.6 2.4 1.6 2.4-.7 2.4-1.6"
        fill="none"
        stroke="var(--background)"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function IconSwap() {
  return (
    <Svg>
      <path
        d="M7 8h10M14 5l3 3-3 3"
        fill="none"
        stroke="var(--foreground)"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17 16H7M10 13l-3 3 3 3"
        fill="none"
        stroke="var(--primary)"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconQr() {
  return (
    <Svg>
      <path
        style={{ fill: 'var(--foreground)' }}
        d="M3 3h8v8H3V3zm2 2v4h4V5H5zM13 3h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5z"
      />
      <path style={{ fill: 'var(--primary)' }} d="M13 13h4v4h-4v-4zm5 5h3v3h-3v-3z" />
    </Svg>
  );
}

export function IconBank() {
  return (
    <Svg>
      <path style={{ fill: 'var(--foreground)' }} d="M3 10l9-6 9 6v1.5H3V10z" />
      <path style={{ fill: 'var(--foreground)' }} d="M5 12.5h2.5V18H5v-5.5zm5.5 0H13V18h-2.5v-5.5zm5.5 0H19V18h-2.5v-5.5z" />
      <path style={{ fill: 'var(--primary)' }} d="M3 19h18v2H3z" />
    </Svg>
  );
}

export function IconPhone() {
  return (
    <Svg>
      <path
        style={{ fill: 'var(--foreground)' }}
        d="M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"
      />
      <path style={{ fill: 'var(--primary)' }} d="M8 2h8v3H8V2z" />
      <circle cx="12" cy="18" r="1.2" style={{ fill: 'var(--background)' }} />
    </Svg>
  );
}

export function IconData() {
  return (
    <Svg>
      <path
        d="M5 13a7 7 0 0 1 14 0"
        fill="none"
        stroke="var(--foreground)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M8 13a4 4 0 0 1 8 0"
        fill="none"
        stroke="var(--primary)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="13" r="1.5" style={{ fill: 'var(--primary)' }} />
    </Svg>
  );
}

export function IconPower() {
  return (
    <Svg>
      <path style={{ fill: 'var(--foreground)' }} d="M13 2 4 14h7l-1 8 10-14h-7z" />
      <path style={{ fill: 'var(--primary)' }} d="m11 14 1.2-1.6H18L13 2l-1 8H7.5L11 14z" opacity={0.9} />
    </Svg>
  );
}


export function IconBetting() {
  return (
    <Svg>
      <circle cx="14" cy="12" r="8" style={{ fill: 'var(--primary)' }} />
      <circle cx="10.5" cy="12" r="8" style={{ fill: 'var(--foreground)' }} />
      <path
        d="M8.5 12h4M10.5 10v4"
        fill="none"
        stroke="var(--background)"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
      <circle cx="10.5" cy="12" r="5.2" fill="none" stroke="var(--background)" strokeWidth="1.4" opacity={0.7} />
    </Svg>
  );
}

export function IconTv() {
  return (
    <Svg>
      <rect x="2" y="5" width="20" height="12" rx="2" style={{ fill: 'var(--foreground)' }} />
      <rect x="4" y="7" width="16" height="8" rx="1" style={{ fill: 'var(--primary)' }} />
      <path style={{ fill: 'var(--foreground)' }} d="M8 19h8v1.5H8z" />
    </Svg>
  );
}

export function IconRewards() {
  return (
    <Svg>
      <circle cx="12" cy="10" r="5.5" style={{ fill: 'var(--foreground)' }} />
      <path style={{ fill: 'var(--primary)' }} d="M8.2 14.2 6 21l6-2 6 2-2.2-6.8A6.4 6.4 0 0 1 12 16a6.4 6.4 0 0 1-3.8-1.8z" />
    </Svg>
  );
}

export function IconGift() {
  return (
    <Svg>
      <path style={{ fill: 'var(--foreground)' }} d="M4 10h16v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10z" />
      <path style={{ fill: 'var(--primary)' }} d="M2 6h20v4H2V6zm9 0h2v16h-2V6z" />
    </Svg>
  );
}

export function IconUsers() {
  return (
    <Svg>
      <path
        style={{ fill: 'var(--foreground)' }}
        d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-8 8v-1c0-2.7 5.3-4 8-4s8 1.3 8 4v1H4z"
      />
      <path style={{ fill: 'var(--primary)' }} d="M19 7h-2v2h-2V7h-2V5h2V3h2v2h2v2z" />
    </Svg>
  );
}

export function IconLink() {
  return (
    <Svg>
      <path
        d="M10 13a5 5 0 0 0 7.5.5l1.5-1.5a5 5 0 0 0-7-7L11 6"
        fill="none"
        stroke="var(--foreground)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M14 11a5 5 0 0 0-7.5-.5L5 12a5 5 0 0 0 7 7l1.1-1.1"
        fill="none"
        stroke="var(--primary)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function IconScan() {
  return (
    <Svg>
      <path
        d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"
        fill="none"
        stroke="var(--foreground)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M7 12h10" stroke="var(--primary)" strokeWidth="2.2" strokeLinecap="round" />
    </Svg>
  );
}

export function IconShield() {
  return (
    <Svg>
      <path
        style={{ fill: 'var(--foreground)' }}
        d="M12 2 4 5v6c0 5 3.4 9.4 8 10.5 4.6-1.1 8-5.5 8-10.5V5l-8-3z"
      />
      <path
        d="m9 12 2 2 4-4"
        fill="none"
        stroke="var(--background)"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconSupport() {
  return (
    <Svg>
      <path
        style={{ fill: 'var(--foreground)' }}
        d="M12 3a7 7 0 0 0-7 7v2a3 3 0 0 0 3 3h1v-4H7a5 5 0 0 1 10 0h-2v4h1a3 3 0 0 0 3-3v-2a7 7 0 0 0-7-7z"
      />
      <path style={{ fill: 'var(--primary)' }} d="M10 18h4v2a2 2 0 0 1-4 0v-2z" />
    </Svg>
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
  | 'betting'
  | 'rewards'
  | 'gifts'
  | 'request'
  | 'reqlink'
  | 'history'
  | 'scan'
  | 'security'
  | 'support'
  | 'more';

const MAP: Record<DualIconKey, () => ReactNode> = {
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
  betting: IconBetting,
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
  return <>{Comp()}</>;
}
