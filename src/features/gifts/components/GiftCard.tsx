import { QRCodeDisplay } from '../../../shared/components/QRCodeDisplay';
import type { CardTheme, Gift } from '../types';
import { claimUrl, remainingAmount, remainingSlots } from '../types';

interface GiftCardProps {
  gift: Gift;
  mode?: 'public' | 'private';
  compact?: boolean;
}

type ThemeStyle = {
  bg: string;
  accent: string;
  accent2: string;
  text: string;
  muted: string;
  frame: string;
  panel: string;
  tag: string;
};

export const THEMES: Record<CardTheme, ThemeStyle> = {
  classic: {
    bg: '#101918',
    accent: '#96D6CD',
    accent2: '#DDF8F3',
    text: '#F4FFFC',
    muted: 'rgba(244,255,252,.56)',
    frame: 'rgba(150,214,205,.28)',
    panel: 'rgba(255,255,255,.055)',
    tag: 'CLASSIC',
  },

  gift: {
    bg: '#19130D',
    accent: '#E7BD7A',
    accent2: '#FFF0C9',
    text: '#FFF8E9',
    muted: 'rgba(255,248,233,.55)',
    frame: 'rgba(231,189,122,.30)',
    panel: 'rgba(231,189,122,.075)',
    tag: 'GIFT',
  },

  midnight: {
    bg: '#070B17',
    accent: '#7DD3FC',
    accent2: '#C4B5FD',
    text: '#F3F8FF',
    muted: 'rgba(243,248,255,.52)',
    frame: 'rgba(125,211,252,.28)',
    panel: 'rgba(125,211,252,.065)',
    tag: 'MIDNIGHT',
  },

  aurora: {
    bg: '#071412',
    accent: '#75E6C8',
    accent2: '#A7F3D0',
    text: '#EEFFFA',
    muted: 'rgba(238,255,250,.52)',
    frame: 'rgba(117,230,200,.27)',
    panel: 'rgba(117,230,200,.065)',
    tag: 'AURORA',
  },

  lovers: {
    bg: '#1B0C16',
    accent: '#FB8DB8',
    accent2: '#FFD1E2',
    text: '#FFF5F9',
    muted: 'rgba(255,245,249,.55)',
    frame: 'rgba(251,141,184,.28)',
    panel: 'rgba(251,141,184,.065)',
    tag: 'LOVERS',
  },

  anniversary: {
    bg: '#171208',
    accent: '#F5C96A',
    accent2: '#FFF1B8',
    text: '#FFFCF1',
    muted: 'rgba(255,252,241,.53)',
    frame: 'rgba(245,201,106,.28)',
    panel: 'rgba(245,201,106,.065)',
    tag: 'ANNIVERSARY',
  },

  birthday: {
    bg: '#110C1D',
    accent: '#B8A0FF',
    accent2: '#F0ABFC',
    text: '#FAF7FF',
    muted: 'rgba(250,247,255,.55)',
    frame: 'rgba(184,160,255,.28)',
    panel: 'rgba(184,160,255,.07)',
    tag: 'BIRTHDAY',
  },

  celebration: {
    bg: '#160D08',
    accent: '#FFAA66',
    accent2: '#FFD166',
    text: '#FFF9F2',
    muted: 'rgba(255,249,242,.55)',
    frame: 'rgba(255,170,102,.28)',
    panel: 'rgba(255,170,102,.065)',
    tag: 'CELEBRATION',
  },
};

export const CARD_THEME_OPTIONS: {
  id: CardTheme;
  label: string;
  swatch: string;
}[] = [
  { id: 'classic', label: 'Classic', swatch: '#96D6CD' },
  { id: 'gift', label: 'Gift', swatch: '#E7BD7A' },
  { id: 'lovers', label: 'Lovers', swatch: '#FB8DB8' },
  { id: 'anniversary', label: 'Anniversary', swatch: '#F5C96A' },
  { id: 'birthday', label: 'Birthday', swatch: '#B8A0FF' },
  { id: 'celebration', label: 'Celebration', swatch: '#FFAA66' },
  { id: 'midnight', label: 'Midnight', swatch: '#7DD3FC' },
  { id: 'aurora', label: 'Aurora', swatch: '#75E6C8' },
];

export function GiftCard({
  gift,
  mode = 'public',
  compact = false,
}: GiftCardProps) {
  const theme =
    THEMES[gift.cardTheme || 'classic'] || THEMES.classic;

  const url = claimUrl(gift.code);
  const isGw = gift.kind === 'giveaway';

  const title = `${gift.creatorMask || 'user'}'s ${
    isGw ? 'Giveaway' : 'Gift'
  }`;

  const message =
    gift.note?.trim() ||
    (isGw ? 'A little something for you.' : 'Scan to open');

  const qr = compact ? 92 : 142;

  return (
    <div
      className="relative overflow-hidden"
      style={{
        minHeight: compact ? 300 : 470,
        borderRadius: compact ? 24 : 32,
        background: theme.bg,
        border: `1px solid ${theme.frame}`,
        color: theme.text,
        boxShadow:
          '0 30px 80px rgba(0,0,0,.42), inset 0 1px 0 rgba(255,255,255,.055)',
        padding: compact ? 16 : 22,
      }}
    >
      <ThemeArtwork
        theme={gift.cardTheme || 'classic'}
        accent={theme.accent}
        accent2={theme.accent2}
      />

      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CreatorMark
              creator={gift.creatorMask}
              accent={theme.accent}
              compact={compact}
            />

            <div>
              <p
                style={{
                  fontSize: compact ? 10 : 11,
                  fontWeight: 700,
                  color: theme.muted,
                  letterSpacing: '.02em',
                }}
              >
                {title}
              </p>

              <p
                style={{
                  fontSize: 9,
                  color: theme.muted,
                  marginTop: 2,
                  opacity: .7,
                }}
              >
                PRIVATE DIGITAL GIFT
              </p>
            </div>
          </div>

          <div
            className="px-2.5 py-1.5 rounded-full"
            style={{
              background: theme.panel,
              border: `1px solid ${theme.frame}`,
              color: theme.accent,
              fontSize: 8,
              fontWeight: 800,
              letterSpacing: '.13em',
            }}
          >
            {theme.tag}
          </div>
        </div>

        {/* Main message */}
        <div
          className="flex flex-col items-center text-center"
          style={{
            paddingTop: compact ? 20 : 28,
          }}
        >
          <div
            style={{
              fontSize: compact ? 10 : 11,
              fontWeight: 700,
              color: theme.muted,
              letterSpacing: '.18em',
              textTransform: 'uppercase',
            }}
          >
            You received something special
          </div>

          <h2
            className="max-w-[330px]"
            style={{
              marginTop: 8,
              fontSize: compact ? 19 : 27,
              lineHeight: 1.12,
              fontWeight: 800,
              letterSpacing: '-.035em',
              color: theme.text,
            }}
          >
            {message}
          </h2>
        </div>

        {/* QR centerpiece */}
        <div
          className="flex justify-center"
          style={{
            marginTop: compact ? 20 : 26,
          }}
        >
          <QRFrame
            theme={theme}
            url={url}
            qr={qr}
            compact={compact}
            variant={gift.cardTheme || 'classic'}
          />
        </div>

        <div className="text-center" style={{ marginTop: 10 }}>
          <p
            style={{
              color: theme.muted,
              fontSize: 10,
              fontWeight: 600,
            }}
          >
            Scan to claim
          </p>

          <p
            style={{
              color: theme.text,
              fontSize: 9,
              opacity: .5,
              marginTop: 3,
            }}
          >
            Secure Convia claim
          </p>
        </div>

        {/* Bottom value panel */}
        {mode === 'private' && !compact ? (
          <PrivateFooter gift={gift} theme={theme} />
        ) : (
          <div
            className="mt-auto pt-5 text-center"
            style={{
              marginTop: 18,
              borderTop: `1px solid ${theme.frame}`,
            }}
          >
            <span
              style={{
                color: theme.muted,
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: '.14em',
              }}
            >
              CONVIA
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Theme artwork
───────────────────────────────────────────── */

function ThemeArtwork({
  theme,
  accent,
  accent2,
}: {
  theme: CardTheme;
  accent: string;
  accent2: string;
}) {
  if (theme === 'gift') {
    return (
      <>
        <div
          className="absolute -right-20 -top-20 w-56 h-56 rounded-full"
          style={{
            background: `radial-gradient(circle, ${accent}25, transparent 68%)`,
          }}
        />

        <div
          className="absolute right-7 top-16 w-20 h-20"
          style={{
            border: `1px solid ${accent}55`,
            transform: 'rotate(12deg)',
            borderRadius: 10,
          }}
        />

        <div
          className="absolute right-[42px] top-[78px] w-12 h-12"
          style={{
            border: `1px solid ${accent}35`,
            transform: 'rotate(12deg)',
            borderRadius: 7,
          }}
        />

        <Ribbon
          className="absolute"
          color={accent}
          style={{ right: 34, top: 65 }}
        />
      </>
    );
  }

  if (theme === 'midnight') {
    return (
      <>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(circle at 12% 22%, ${accent}55 0 1px, transparent 2px),
              radial-gradient(circle at 82% 15%, ${accent2}45 0 1px, transparent 2px),
              radial-gradient(circle at 68% 47%, ${accent}40 0 1px, transparent 2px),
              radial-gradient(circle at 20% 74%, ${accent2}35 0 1px, transparent 2px),
              radial-gradient(circle at 88% 82%, ${accent}35 0 1px, transparent 2px)
            `,
          }}
        />

        <div
          className="absolute -right-24 -top-24 w-80 h-80 rounded-full"
          style={{
            background: `radial-gradient(circle, ${accent}1c, transparent 65%)`,
          }}
        />

        <div
          className="absolute left-8 top-28 w-32 h-32 rounded-full"
          style={{
            border: `1px solid ${accent}18`,
          }}
        />
      </>
    );
  }

  if (theme === 'aurora') {
    return (
      <>
        <div
          className="absolute -top-20 -left-20 w-[125%] h-52"
          style={{
            background: `linear-gradient(
              105deg,
              transparent 15%,
              ${accent}20 38%,
              ${accent2}18 52%,
              transparent 75%
            )`,
            filter: 'blur(16px)',
            transform: 'rotate(-7deg)',
          }}
        />

        <div
          className="absolute -right-20 bottom-20 w-64 h-64 rounded-full"
          style={{
            background: `radial-gradient(circle, ${accent}1b, transparent 68%)`,
          }}
        />

        <div
          className="absolute left-[-40px] bottom-10 w-72 h-28"
          style={{
            borderTop: `1px solid ${accent}35`,
            borderRadius: '50%',
            transform: 'rotate(-10deg)',
          }}
        />
      </>
    );
  }

  if (theme === 'lovers') {
    return (
      <>
        <HeartOutline
          color={accent}
          className="absolute right-7 top-16"
        />

        <HeartOutline
          color={accent2}
          small
          className="absolute right-20 top-10"
        />

        <div
          className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full"
          style={{
            background: `radial-gradient(circle, ${accent}1c, transparent 68%)`,
          }}
        />

        <div
          className="absolute left-8 top-24 w-16 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${accent}70)`,
            transform: 'rotate(-25deg)',
          }}
        />
      </>
    );
  }

  if (theme === 'anniversary') {
    return (
      <>
        <div
          className="absolute left-1/2 -translate-x-1/2 top-12 w-32 h-32 rounded-full"
          style={{
            border: `1px solid ${accent}28`,
          }}
        />

        <div
          className="absolute left-1/2 -translate-x-1/2 top-[58px] w-20 h-20 rounded-full"
          style={{
            border: `1px solid ${accent}22`,
          }}
        />

        <div
          className="absolute left-1/2 -translate-x-1/2 top-[76px]"
          style={{
            color: accent,
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: '.22em',
          }}
        >
          EST. • 2026
        </div>

        <div
          className="absolute -right-24 -bottom-24 w-72 h-72 rounded-full"
          style={{
            background: `radial-gradient(circle, ${accent}16, transparent 68%)`,
          }}
        />
      </>
    );
  }

  if (theme === 'birthday') {
    return (
      <>
        <Confetti color={accent} />

        <div
          className="absolute -right-16 -top-14 w-44 h-44 rounded-full"
          style={{
            background: `radial-gradient(circle, ${accent}1c, transparent 68%)`,
          }}
        />

        <Balloon
          color={accent}
          className="absolute right-8 top-12"
        />

        <Balloon
          color={accent2}
          small
          className="absolute right-20 top-20"
        />
      </>
    );
  }

  if (theme === 'celebration') {
    return (
      <>
        <div
          className="absolute left-1/2 -translate-x-1/2 -top-16 w-52 h-52 rounded-full"
          style={{
            border: `1px solid ${accent}20`,
            boxShadow: `
              0 0 0 18px ${accent}08,
              0 0 0 38px ${accent}05
            `,
          }}
        />

        <div
          className="absolute left-1/2 top-[70px] -translate-x-1/2"
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: accent,
            boxShadow: `
              -32px 8px 0 ${accent2},
              32px 8px 0 ${accent},
              -54px 28px 0 ${accent2},
              54px 28px 0 ${accent2}
            `,
          }}
        />

        <div
          className="absolute -left-16 -bottom-20 w-64 h-64 rounded-full"
          style={{
            background: `radial-gradient(circle, ${accent}18, transparent 68%)`,
          }}
        />
      </>
    );
  }

  /* Classic */
  return (
    <>
      <div
        className="absolute inset-x-0 top-0 h-36"
        style={{
          background: `
            linear-gradient(
              115deg,
              transparent 20%,
              ${accent}10 48%,
              transparent 75%
            )
          `,
        }}
      />

      <div
        className="absolute right-[-45px] top-[-45px] w-44 h-44 rounded-full"
        style={{
          border: `1px solid ${accent}20`,
        }}
      />

      <div
        className="absolute right-[-20px] top-[-20px] w-32 h-32 rounded-full"
        style={{
          border: `1px solid ${accent}14`,
        }}
      />
    </>
  );
}

/* ─────────────────────────────────────────────
   QR compositions
───────────────────────────────────────────── */

function QRFrame({
  theme,
  url,
  qr,
  compact,
  variant,
}: {
  theme: ThemeStyle;
  url: string;
  qr: number;
  compact: boolean;
  variant: CardTheme;
}) {
  const size = compact ? 126 : 176;

  if (variant === 'gift') {
    return (
      <div className="relative">
        <div
          className="absolute -top-5 left-1/2 -translate-x-1/2"
          style={{
            color: theme.accent,
            fontSize: 22,
          }}
        >
          ✦
        </div>

        <div
          className="p-2.5"
          style={{
            background: '#F7EFE0',
            borderRadius: 20,
            boxShadow: '0 18px 42px rgba(0,0,0,.38)',
            transform: 'rotate(-1deg)',
          }}
        >
          <QRCodeDisplay
            value={url}
            size={qr}
            fgColor="#15110C"
            bgColor="#F7EFE0"
          />
        </div>
      </div>
    );
  }

  if (variant === 'midnight') {
    return (
      <div
        className="relative p-3 rounded-[26px]"
        style={{
          background: 'rgba(255,255,255,.035)',
          border: `1px solid ${theme.accent}38`,
          boxShadow: `0 0 45px ${theme.accent}12`,
          backdropFilter: 'blur(18px)',
        }}
      >
        <div
          className="p-2.5 rounded-[18px]"
          style={{
            background: '#F8FBFF',
          }}
        >
          <QRCodeDisplay
            value={url}
            size={qr}
            fgColor="#07101B"
            bgColor="#F8FBFF"
          />
        </div>
      </div>
    );
  }

  if (variant === 'anniversary') {
    return (
      <div className="relative">
        <div
          className="absolute inset-[-13px] rounded-full"
          style={{
            border: `1px solid ${theme.accent}30`,
          }}
        />

        <div
          className="p-3"
          style={{
            background: '#FFFDF5',
            borderRadius: '50%',
            boxShadow: '0 18px 42px rgba(0,0,0,.32)',
          }}
        >
          <QRCodeDisplay
            value={url}
            size={qr}
            fgColor="#171208"
            bgColor="#FFFDF5"
          />
        </div>
      </div>
    );
  }

  if (variant === 'lovers') {
    return (
      <div
        className="relative"
        style={{
          transform: 'rotate(-2deg)',
        }}
      >
        <div
          className="absolute -inset-2 rounded-[22px]"
          style={{
            border: `1px solid ${theme.accent}38`,
          }}
        />

        <div
          className="p-3 rounded-[20px]"
          style={{
            background: '#FFF7FA',
            boxShadow: '0 20px 45px rgba(0,0,0,.32)',
          }}
        >
          <QRCodeDisplay
            value={url}
            size={qr}
            fgColor="#190B13"
            bgColor="#FFF7FA"
          />
        </div>
      </div>
    );
  }

  if (variant === 'birthday') {
    return (
      <div className="relative">
        <div
          className="absolute -inset-3"
          style={{
            border: `1px dashed ${theme.accent}65`,
            borderRadius: 24,
          }}
        />

        <div
          className="p-3 rounded-[20px]"
          style={{
            background: '#FCFAFF',
            boxShadow: '0 18px 42px rgba(0,0,0,.36)',
          }}
        >
          <QRCodeDisplay
            value={url}
            size={qr}
            fgColor="#120D1E"
            bgColor="#FCFAFF"
          />
        </div>
      </div>
    );
  }

  if (variant === 'celebration') {
    return (
      <div
        className="p-3 rounded-[24px]"
        style={{
          background: `
            linear-gradient(
              135deg,
              rgba(255,255,255,.08),
              rgba(255,255,255,.025)
            )
          `,
          border: `1px solid ${theme.accent}40`,
          boxShadow: '0 20px 50px rgba(0,0,0,.35)',
        }}
      >
        <div
          className="p-2.5 rounded-[17px]"
          style={{
            background: '#FFFDF9',
          }}
        >
          <QRCodeDisplay
            value={url}
            size={qr}
            fgColor="#160D08"
            bgColor="#FFFDF9"
          />
        </div>
      </div>
    );
  }

  if (variant === 'aurora') {
    return (
      <div
        className="relative p-3 rounded-[26px]"
        style={{
          background: 'rgba(255,255,255,.045)',
          border: `1px solid ${theme.accent}35`,
          boxShadow: `0 0 55px ${theme.accent}12`,
        }}
      >
        <div
          className="absolute inset-0 rounded-[26px] pointer-events-none"
          style={{
            background: `
              linear-gradient(
                125deg,
                ${theme.accent}12,
                transparent 45%,
                ${theme.accent2}10
              )
            `,
          }}
        />

        <div
          className="relative p-2.5 rounded-[18px]"
          style={{
            background: '#F8FFFC',
          }}
        >
          <QRCodeDisplay
            value={url}
            size={qr}
            fgColor="#071411"
            bgColor="#F8FFFC"
          />
        </div>
      </div>
    );
  }

  /* Classic */
  return (
    <div
      className="p-3 rounded-[24px]"
      style={{
        background: '#F7FCFA',
        border: `1px solid ${theme.accent}45`,
        boxShadow: '0 18px 44px rgba(0,0,0,.34)',
      }}
    >
      <QRCodeDisplay
        value={url}
        size={qr}
        fgColor="#08110F"
        bgColor="#F7FCFA"
      />
    </div>
  );
}

/* ─────────────────────────────────────────────
   Private footer
───────────────────────────────────────────── */

function PrivateFooter({
  gift,
  theme,
}: {
  gift: Gift;
  theme: ThemeStyle;
}) {
  const isGw = gift.kind === 'giveaway';

  return (
    <div
      className="mt-auto"
      style={{
        marginTop: 22,
        paddingTop: 17,
        borderTop: `1px solid ${theme.frame}`,
      }}
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          <p
            style={{
              color: theme.muted,
              fontSize: 8,
              fontWeight: 800,
              letterSpacing: '.16em',
            }}
          >
            GIFT VALUE
          </p>

          <p
            className="tabular-nums"
            style={{
              marginTop: 4,
              fontSize: 23,
              lineHeight: 1,
              fontWeight: 850,
              letterSpacing: '-.035em',
            }}
          >
            {fmt(gift.totalAmount)}
            <span
              style={{
                fontSize: 11,
                marginLeft: 5,
                opacity: .58,
                fontWeight: 700,
              }}
            >
              {gift.asset}
            </span>
          </p>

          {isGw && (
            <p
              style={{
                marginTop: 7,
                color: theme.muted,
                fontSize: 9,
              }}
            >
              {gift.splitMode === 'random' ? 'Random' : 'Equal'} ·{' '}
              {remainingSlots(gift)}/{gift.slots} remaining
            </p>
          )}
        </div>

        <div
          className="text-right"
          style={{
            minWidth: 76,
          }}
        >
          <p
            style={{
              color: theme.muted,
              fontSize: 8,
              fontWeight: 800,
              letterSpacing: '.14em',
            }}
          >
            STATUS
          </p>

          <p
            style={{
              marginTop: 4,
              color: theme.accent,
              fontSize: 11,
              fontWeight: 800,
              textTransform: 'uppercase',
            }}
          >
            {gift.status}
          </p>
        </div>
      </div>

      {isGw && (
        <div
          className="flex items-center justify-between mt-4 px-3 py-2.5 rounded-xl"
          style={{
            background: theme.panel,
            border: `1px solid ${theme.frame}`,
          }}
        >
          <span
            style={{
              color: theme.muted,
              fontSize: 9,
              fontWeight: 600,
            }}
          >
            Remaining pool
          </span>

          <span
            className="tabular-nums"
            style={{
              color: theme.text,
              fontSize: 10,
              fontWeight: 800,
            }}
          >
            {fmt(remainingAmount(gift))} {gift.asset}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between mt-3">
        <span
          style={{
            color: theme.muted,
            fontSize: 8,
            fontWeight: 700,
            letterSpacing: '.12em',
          }}
        >
          CONVIA SECURE GIFT
        </span>

        <span
          className="tabular-nums"
          style={{
            color: theme.text,
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: '.14em',
          }}
        >
          {gift.code}
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Small decorative components
───────────────────────────────────────────── */

function CreatorMark({
  creator,
  accent,
  compact,
}: {
  creator?: string;
  accent: string;
  compact: boolean;
}) {
  return (
    <div
      className="flex items-center justify-center rounded-full"
      style={{
        width: compact ? 27 : 31,
        height: compact ? 27 : 31,
        background: `linear-gradient(145deg, ${accent}, rgba(255,255,255,.16))`,
        color: '#07100E',
        fontSize: 10,
        fontWeight: 900,
        boxShadow: `0 0 22px ${accent}22`,
      }}
    >
      {(creator || 'U')[0].toUpperCase()}
    </div>
  );
}

function Ribbon({
  color,
  className,
  style,
}: {
  color: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      width="65"
      height="65"
      viewBox="0 0 65 65"
      fill="none"
      className={className}
      style={style}
    >
      <path
        d="M32.5 58C32.5 58 22 42 10 34C1 28 5 19 14 23C23 27 32.5 42 32.5 42C32.5 42 42 27 51 23C60 19 64 28 55 34C43 42 32.5 58 32.5 58Z"
        fill={color}
        opacity=".75"
      />
      <circle cx="32.5" cy="45" r="7" fill={color} />
    </svg>
  );
}

function HeartOutline({
  color,
  small,
  className,
}: {
  color: string;
  small?: boolean;
  className?: string;
}) {
  const size = small ? 24 : 40;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      className={className}
      style={{
        opacity: small ? .45 : .7,
        transform: 'rotate(-10deg)',
      }}
    >
      <path
        d="M20 34S5 25 5 14.5C5 8 13 5 20 12C27 5 35 8 35 14.5C35 25 20 34 20 34Z"
        stroke={color}
        strokeWidth="1.5"
      />
    </svg>
  );
}

function Balloon({
  color,
  small,
  className,
}: {
  color: string;
  small?: boolean;
  className?: string;
}) {
  const scale = small ? .7 : 1;

  return (
    <div
      className={className}
      style={{
        width: 27 * scale,
        height: 36 * scale,
        borderRadius: '50% 50% 48% 48%',
        background: `linear-gradient(145deg, ${color}80, ${color}18)`,
        border: `1px solid ${color}55`,
        transform: `rotate(${small ? 12 : -8}deg)`,
      }}
    />
  );
}

function Confetti({ color }: { color: string }) {
  const pieces = [
    [24, 42, 12],
    [54, 25, -20],
    [82, 62, 25],
    [91, 34, -35],
    [12, 74, 30],
    [38, 88, -15],
  ];

  return (
    <>
      {pieces.map(([left, top, rotate], i) => (
        <span
          key={i}
          className="absolute"
          style={{
            left: `${left}%`,
            top: `${top}px`,
            width: i % 2 ? 5 : 3,
            height: i % 2 ? 10 : 6,
            borderRadius: 2,
            background: color,
            opacity: .55,
            transform: `rotate(${rotate}deg)`,
          }}
        />
      ))}
    </>
  );
}

function fmt(n: number) {
  return Number.isFinite(n)
    ? n.toLocaleString(undefined, {
        maximumFractionDigits: 8,
      })
    : '0';
}