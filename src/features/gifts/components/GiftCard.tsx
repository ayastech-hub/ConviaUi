import { QRCodeDisplay } from '../../../shared/components/QRCodeDisplay';
import type { CardTheme, Gift } from '../types';
import { claimUrl, remainingAmount, remainingSlots } from '../types';

interface GiftCardProps {
  gift: Gift;
  mode?: 'public' | 'private';
  /** Compact for carousel preview */
  compact?: boolean;
}

type ThemeStyle = {
  bg: string;
  accent: string;
  text: string;
  muted: string;
  frame: string;
  giftBox: string;
  tag: string;
};

export const THEMES: Record<CardTheme, ThemeStyle> = {
  classic: {
    bg: 'linear-gradient(160deg, #1a1a22 0%, #101014 100%)',
    accent: '#4A9B92',
    text: '#F5F5F5',
    muted: 'rgba(255,255,255,0.5)',
    frame: 'rgba(74,155,146,0.45)',
    giftBox: '#2a2a32',
    tag: 'Classic',
  },
  gift: {
    bg: 'linear-gradient(165deg, #1c1828 0%, #12101a 45%, #0c0a12 100%)',
    accent: '#D4A574',
    text: '#F0E6D8',
    muted: 'rgba(240,230,216,0.55)',
    frame: 'rgba(212,165,116,0.5)',
    giftBox: '#3d3428',
    tag: 'Gift gold',
  },
  midnight: {
    bg: 'linear-gradient(160deg, #0f172a 0%, #020617 100%)',
    accent: '#60a5fa',
    text: '#E2E8F0',
    muted: 'rgba(226,232,240,0.5)',
    frame: 'rgba(96,165,250,0.4)',
    giftBox: '#1e293b',
    tag: 'Midnight',
  },
  aurora: {
    bg: 'linear-gradient(155deg, #14201c 0%, #0a1210 50%, #06100e 100%)',
    accent: '#34d399',
    text: '#ECFDF5',
    muted: 'rgba(236,253,245,0.5)',
    frame: 'rgba(52,211,153,0.4)',
    giftBox: '#1a2e28',
    tag: 'Aurora',
  },
  lovers: {
    bg: 'linear-gradient(165deg, #2a1520 0%, #1a0c14 50%, #12080e 100%)',
    accent: '#F472B6',
    text: '#FDF2F8',
    muted: 'rgba(253,242,248,0.55)',
    frame: 'rgba(244,114,182,0.45)',
    giftBox: '#3b1a28',
    tag: 'Lovers',
  },
  anniversary: {
    bg: 'linear-gradient(160deg, #2a2418 0%, #1a160e 50%, #0f0d08 100%)',
    accent: '#FBBF24',
    text: '#FFFBEB',
    muted: 'rgba(255,251,235,0.55)',
    frame: 'rgba(251,191,36,0.45)',
    giftBox: '#3d3420',
    tag: 'Anniversary',
  },
  birthday: {
    bg: 'linear-gradient(155deg, #1e1a2e 0%, #14101f 50%, #0c0a14 100%)',
    accent: '#A78BFA',
    text: '#F5F3FF',
    muted: 'rgba(245,243,255,0.55)',
    frame: 'rgba(167,139,250,0.45)',
    giftBox: '#2a2440',
    tag: 'Birthday',
  },
  celebration: {
    bg: 'linear-gradient(160deg, #1a2420 0%, #0e1614 50%, #08100e 100%)',
    accent: '#F97316',
    text: '#FFF7ED',
    muted: 'rgba(255,247,237,0.55)',
    frame: 'rgba(249,115,22,0.45)',
    giftBox: '#2a2218',
    tag: 'Celebration',
  },
};

export const CARD_THEME_OPTIONS: { id: CardTheme; label: string; swatch: string }[] = [
  { id: 'classic', label: 'Classic', swatch: '#4A9B92' },
  { id: 'gift', label: 'Gift gold', swatch: '#D4A574' },
  { id: 'lovers', label: 'Lovers', swatch: '#F472B6' },
  { id: 'anniversary', label: 'Anniversary', swatch: '#FBBF24' },
  { id: 'birthday', label: 'Birthday', swatch: '#A78BFA' },
  { id: 'celebration', label: 'Celebration', swatch: '#F97316' },
  { id: 'midnight', label: 'Midnight', swatch: '#60a5fa' },
  { id: 'aurora', label: 'Aurora', swatch: '#34d399' },
];

export function GiftCard({ gift, mode = 'public', compact }: GiftCardProps) {
  const theme = THEMES[gift.cardTheme || 'classic'] || THEMES.classic;
  const url = claimUrl(gift.code);
  const isGw = gift.kind === 'giveaway';
  const title = `${gift.creatorMask || 'user'}'s ${isGw ? 'Giveaway' : 'Gift'}`;
  const message = gift.note?.trim() || (isGw ? 'All the Best — Claim Your Gift!' : 'Scan to open');
  const qr = compact ? 100 : 140;

  return (
    <div
      className="relative overflow-hidden rounded-[24px]"
      style={{
        background: theme.bg,
        border: `1px solid ${theme.frame}`,
        boxShadow: '0 20px 48px rgba(0,0,0,0.35)',
        color: theme.text,
        padding: compact ? '18px 16px 16px' : '24px 20px 20px',
      }}
    >
      <div
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[130%] h-44 rounded-[100%]"
        style={{ border: `1px solid ${theme.frame}`, opacity: 0.3 }}
      />
      <div
        className="pointer-events-none absolute top-10 right-5 w-1.5 h-1.5 rounded-full"
        style={{ background: theme.accent, boxShadow: `0 0 14px ${theme.accent}` }}
      />
      <div
        className="pointer-events-none absolute bottom-20 left-6 w-1 h-1 rounded-full"
        style={{ background: theme.accent, opacity: 0.7 }}
      />

      <div className="relative z-[1] flex items-center justify-center gap-2 mb-3">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
          style={{ background: theme.accent, color: '#0a0a0a' }}
        >
          {(gift.creatorMask || 'U')[0].toUpperCase()}
        </div>
        <p style={{ fontSize: compact ? 12 : 13, fontWeight: 600, color: theme.muted }}>{title}</p>
      </div>

      <p
        className="relative z-[1] text-center px-2 mb-4"
        style={{
          fontSize: compact ? 16 : 20,
          fontWeight: 700,
          lineHeight: 1.35,
          color: theme.accent,
        }}
      >
        {message}
      </p>

      <div className="relative z-[1] flex justify-center mb-4">
        <div
          className="px-3.5 py-1 rounded-full text-[10px] font-extrabold tracking-[0.18em]"
          style={{ background: 'rgba(0,0,0,0.4)', border: `1.5px solid ${theme.accent}`, color: theme.text }}
        >
          CONVIA
        </div>
      </div>

      <div className="relative z-[1] flex justify-center mb-3">
        <div className="relative">
          <div className="flex justify-center mb-[-5px] relative z-[2]">
            <svg width={compact ? 44 : 56} height={compact ? 22 : 28} viewBox="0 0 56 28" fill="none">
              <path d="M28 26C28 26 18 14 10 10C4 7 2 14 8 16C14 18 28 26 28 26Z" fill={theme.accent} opacity="0.85" />
              <path d="M28 26C28 26 38 14 46 10C52 7 54 14 48 16C42 18 28 26 28 26Z" fill={theme.accent} opacity="0.85" />
              <circle cx="28" cy="22" r="5" fill={theme.accent} />
            </svg>
          </div>
          <div
            className="rounded-[18px] p-2.5"
            style={{
              background: theme.giftBox,
              border: `2px solid ${theme.accent}`,
              boxShadow: '0 8px 28px rgba(0,0,0,0.35)',
            }}
          >
            <div className="rounded-[12px] p-1.5" style={{ background: '#fff' }}>
              <QRCodeDisplay value={url} size={qr} fgColor="#0A0A0A" bgColor="#FFFFFF" />
            </div>
          </div>
        </div>
      </div>

      <p className="relative z-[1] text-center" style={{ fontSize: 12, color: theme.muted, fontWeight: 500 }}>
        Scan the QR code to claim
      </p>

      {mode === 'private' && !compact && (
        <div className="relative z-[1] mt-5 pt-4" style={{ borderTop: `1px solid ${theme.frame}` }}>
          <div className="flex justify-between items-end">
            <div>
              <p style={{ fontSize: 10, color: theme.muted, fontWeight: 700, letterSpacing: 0.8 }}>POOL</p>
              <p className="tabular-nums mt-1" style={{ fontSize: 22, fontWeight: 800 }}>
                {fmt(gift.totalAmount)}{' '}
                <span style={{ fontSize: 13, fontWeight: 600, opacity: 0.65 }}>{gift.asset}</span>
              </p>
              {isGw && (
                <p style={{ fontSize: 11, color: theme.muted, marginTop: 4 }}>
                  {gift.splitMode === 'random' ? 'Random' : 'Equal'} · {remainingSlots(gift)}/{gift.slots} left · remaining{' '}
                  {fmt(remainingAmount(gift))}
                </p>
              )}
            </div>
            <span
              className="px-2.5 py-1 rounded-full text-[10px] font-bold capitalize"
              style={{ background: 'rgba(255,255,255,0.08)', color: theme.accent }}
            >
              {gift.status}
            </span>
          </div>
          <p className="tabular-nums mt-3" style={{ fontSize: 12, color: theme.muted }}>
            Passcode <span style={{ color: theme.text, fontWeight: 700, letterSpacing: 2 }}>{gift.code}</span>
          </p>
        </div>
      )}
    </div>
  );
}

function fmt(n: number) {
  return Number.isFinite(n) ? n.toLocaleString(undefined, { maximumFractionDigits: 8 }) : '0';
}
