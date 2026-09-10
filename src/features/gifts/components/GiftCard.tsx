import { QRCodeDisplay } from '../../../shared/components/QRCodeDisplay';
import type { CardTheme, Gift } from '../types';
import { claimUrl, remainingAmount, remainingSlots } from '../types';

interface GiftCardProps {
  gift: Gift;
  /** public = share poster (amount hidden). private = creator view */
  mode?: 'public' | 'private';
}

const THEMES: Record<
  CardTheme,
  { bg: string; accent: string; text: string; muted: string; frame: string; giftBox: string }
> = {
  classic: {
    bg: 'linear-gradient(160deg, #1a1a22 0%, #101014 100%)',
    accent: '#4A9B92',
    text: '#F5F5F5',
    muted: 'rgba(255,255,255,0.5)',
    frame: 'rgba(74,155,146,0.45)',
    giftBox: '#2a2a32',
  },
  gift: {
    bg: 'linear-gradient(165deg, #1c1828 0%, #12101a 45%, #0c0a12 100%)',
    accent: '#D4A574',
    text: '#F0E6D8',
    muted: 'rgba(240,230,216,0.55)',
    frame: 'rgba(212,165,116,0.5)',
    giftBox: '#3d3428',
  },
  midnight: {
    bg: 'linear-gradient(160deg, #0f172a 0%, #020617 100%)',
    accent: '#60a5fa',
    text: '#E2E8F0',
    muted: 'rgba(226,232,240,0.5)',
    frame: 'rgba(96,165,250,0.4)',
    giftBox: '#1e293b',
  },
  aurora: {
    bg: 'linear-gradient(155deg, #14201c 0%, #0a1210 50%, #06100e 100%)',
    accent: '#34d399',
    text: '#ECFDF5',
    muted: 'rgba(236,253,245,0.5)',
    frame: 'rgba(52,211,153,0.4)',
    giftBox: '#1a2e28',
  },
};

/** Share poster — amount private on public mode (Bybit-style). */
export function GiftCard({ gift, mode = 'public' }: GiftCardProps) {
  const theme = THEMES[gift.cardTheme || 'classic'] || THEMES.classic;
  const url = claimUrl(gift.code);
  const isGw = gift.kind === 'giveaway';
  const title = `${gift.creatorMask || 'user'}'s ${isGw ? 'Giveaway' : 'Gift'}`;
  const message = gift.note?.trim() || (isGw ? 'Scan to claim your gift' : 'Scan to open');

  return (
    <div
      className="relative overflow-hidden rounded-[24px] px-5 pt-6 pb-5"
      style={{
        background: theme.bg,
        border: `1px solid ${theme.frame}`,
        boxShadow: '0 20px 48px rgba(0,0,0,0.35)',
        color: theme.text,
      }}
    >
      {/* decorative arcs */}
      <div
        className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-[120%] h-40 rounded-[100%]"
        style={{ border: `1px solid ${theme.frame}`, opacity: 0.35 }}
      />
      <div
        className="pointer-events-none absolute top-8 right-6 w-1.5 h-1.5 rounded-full"
        style={{ background: theme.accent, boxShadow: `0 0 12px ${theme.accent}` }}
      />
      <div
        className="pointer-events-none absolute bottom-16 left-8 w-1 h-1 rounded-full"
        style={{ background: theme.accent, boxShadow: `0 0 10px ${theme.accent}`, opacity: 0.7 }}
      />

      <div className="relative z-[1] flex items-center justify-center gap-2 mb-4">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
          style={{ background: theme.accent, color: '#0a0a0a' }}
        >
          {(gift.creatorMask || 'U')[0].toUpperCase()}
        </div>
        <p style={{ fontSize: 13, fontWeight: 600, color: theme.muted }}>{title}</p>
      </div>

      <p
        className="relative z-[1] text-center px-2 mb-5"
        style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.35, color: theme.accent }}
      >
        {message}
      </p>

      {/* Logo chip */}
      <div className="relative z-[1] flex justify-center mb-5">
        <div
          className="px-4 py-1.5 rounded-full text-[11px] font-extrabold tracking-[0.2em]"
          style={{
            background: 'rgba(0,0,0,0.45)',
            border: `1.5px solid ${theme.accent}`,
            color: theme.text,
          }}
        >
          CONVIA
        </div>
      </div>

      {/* Gift-box QR */}
      <div className="relative z-[1] flex justify-center mb-4">
        <div className="relative">
          {/* bow */}
          <div className="flex justify-center mb-[-6px] relative z-[2]">
            <svg width="56" height="28" viewBox="0 0 56 28" fill="none">
              <path
                d="M28 26C28 26 18 14 10 10C4 7 2 14 8 16C14 18 28 26 28 26Z"
                fill={theme.accent}
                opacity="0.85"
              />
              <path
                d="M28 26C28 26 38 14 46 10C52 7 54 14 48 16C42 18 28 26 28 26Z"
                fill={theme.accent}
                opacity="0.85"
              />
              <circle cx="28" cy="22" r="5" fill={theme.accent} />
            </svg>
          </div>
          <div
            className="rounded-[18px] p-3"
            style={{
              background: theme.giftBox,
              border: `2px solid ${theme.accent}`,
              boxShadow: `0 8px 28px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)`,
            }}
          >
            <div className="rounded-[12px] p-2" style={{ background: '#fff' }}>
              <QRCodeDisplay value={url} size={140} fgColor="#0A0A0A" bgColor="#FFFFFF" />
            </div>
          </div>
        </div>
      </div>

      <p className="relative z-[1] text-center" style={{ fontSize: 12, color: theme.muted, fontWeight: 500 }}>
        Scan the QR code to claim
      </p>

      {/* Private creator strip — amounts only for owner */}
      {mode === 'private' && (
        <div
          className="relative z-[1] mt-5 pt-4"
          style={{ borderTop: `1px solid ${theme.frame}` }}
        >
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

export const CARD_THEME_OPTIONS: { id: CardTheme; label: string; swatch: string }[] = [
  { id: 'classic', label: 'Classic', swatch: '#4A9B92' },
  { id: 'gift', label: 'Gift gold', swatch: '#D4A574' },
  { id: 'midnight', label: 'Midnight', swatch: '#60a5fa' },
  { id: 'aurora', label: 'Aurora', swatch: '#34d399' },
];

function fmt(n: number) {
  return Number.isFinite(n) ? n.toLocaleString(undefined, { maximumFractionDigits: 8 }) : '0';
}
