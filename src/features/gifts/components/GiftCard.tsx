import { QRCodeDisplay } from '../../../shared/components/QRCodeDisplay';
import type { Gift } from '../types';
import { claimUrl, remainingAmount, remainingSlots } from '../types';

/** Premium share card — QR + passcode. */
export function GiftCard({ gift }: { gift: Gift }) {
  const url = claimUrl(gift.code);
  const isGw = gift.kind === 'giveaway';
  const statusLabel =
    gift.status === 'open' ? 'Active' : gift.status === 'claimed' ? 'Completed' : gift.status === 'cancelled' ? 'Cancelled' : 'Expired';

  return (
    <div
      className="relative overflow-hidden rounded-[28px] p-6"
      style={{
        background:
          'linear-gradient(155deg, #222228 0%, #141418 48%, #0e0e12 100%)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)',
        color: '#fff',
      }}
    >
      <div
        className="pointer-events-none absolute -top-24 -right-16 w-56 h-56 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(74,155,146,0.32) 0%, transparent 68%)' }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-24"
        style={{ background: 'linear-gradient(to top, rgba(74,155,146,0.08), transparent)' }}
      />

      <div className="relative z-[1] flex items-start justify-between mb-5">
        <div>
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 1.4,
              opacity: 0.45,
              textTransform: 'uppercase',
            }}
          >
            Convia · {isGw ? 'Giveaway' : 'Cheque'}
          </p>
          <p className="tabular-nums mt-2.5" style={{ fontSize: 34, fontWeight: 800, letterSpacing: -1.2, lineHeight: 1 }}>
            {isGw ? formatAmt(gift.perClaimAmount) : formatAmt(gift.totalAmount)}
            <span style={{ fontSize: 15, fontWeight: 600, opacity: 0.55, marginLeft: 6 }}>{gift.asset}</span>
          </p>
          {isGw && (
            <p style={{ fontSize: 12, opacity: 0.48, marginTop: 8 }}>
              {gift.splitMode === 'random' ? 'Random split' : 'Equal split'}
              {' · '}
              {remainingSlots(gift)} of {gift.slots} left
              {' · '}
              pool {formatAmt(gift.totalAmount)}
            </p>
          )}
        </div>
        <span
          className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide"
          style={{
            background: gift.status === 'open' ? 'rgba(74,155,146,0.22)' : 'rgba(255,255,255,0.08)',
            color: gift.status === 'open' ? '#8ed9d0' : 'rgba(255,255,255,0.55)',
          }}
        >
          {statusLabel}
        </span>
      </div>

      {gift.note ? (
        <p className="relative z-[1] mb-5" style={{ fontSize: 13, opacity: 0.72, lineHeight: 1.4 }}>
          “{gift.note}”
        </p>
      ) : null}

      <div className="relative z-[1] flex gap-4 items-center">
        <div
          className="rounded-[18px] p-2.5 flex-shrink-0"
          style={{ background: '#fff', boxShadow: '0 8px 24px rgba(0,0,0,0.25)' }}
        >
          <QRCodeDisplay value={url} size={112} fgColor="#0A0A0A" bgColor="#FFFFFF" />
        </div>
        <div className="min-w-0 flex-1">
          <p style={{ fontSize: 10, opacity: 0.4, fontWeight: 700, letterSpacing: 1.2 }}>PASSCODE</p>
          <p className="tabular-nums mt-1.5" style={{ fontSize: 22, fontWeight: 800, letterSpacing: 3.5 }}>
            {gift.code}
          </p>
          <p style={{ fontSize: 11, opacity: 0.4, marginTop: 10, lineHeight: 1.35 }}>
            Expires {formatWhen(gift.expiresAt)}
          </p>
          {isGw && gift.status === 'open' && (
            <p style={{ fontSize: 11, opacity: 0.4, marginTop: 3 }}>
              Remaining {formatAmt(remainingAmount(gift))} {gift.asset}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function formatAmt(n: number) {
  if (!Number.isFinite(n)) return '0';
  return n.toLocaleString(undefined, { maximumFractionDigits: 8 });
}

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}
