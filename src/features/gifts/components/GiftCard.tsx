import { QRCodeDisplay } from '../../../shared/components/QRCodeDisplay';
import type { Gift } from '../types';
import { claimUrl, remainingAmount, remainingSlots } from '../types';

/** Shareable passcode card — QR + code. */
export function GiftCard({ gift }: { gift: Gift }) {
  const url = claimUrl(gift.code);
  const isGw = gift.kind === 'giveaway';

  return (
    <div
      className="relative overflow-hidden rounded-[24px] p-5"
      style={{
        background: 'linear-gradient(160deg, #1c1c20 0%, #121214 100%)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: '#fff',
      }}
    >
      <div
        className="pointer-events-none absolute -top-20 right-0 w-48 h-48 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(74,155,146,0.28) 0%, transparent 70%)' }}
      />
      <div className="relative z-[1] flex items-start justify-between mb-4">
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, opacity: 0.5 }}>
            CONVIA · {isGw ? 'GIVEAWAY' : 'CHEQUE'}
          </p>
          <p className="tabular-nums mt-2" style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.5 }}>
            {isGw ? gift.perClaimAmount : gift.totalAmount}{' '}
            <span style={{ fontSize: 14, fontWeight: 600, opacity: 0.65 }}>{gift.asset}</span>
          </p>
          {isGw && (
            <p style={{ fontSize: 12, opacity: 0.5, marginTop: 4 }}>
              {gift.splitMode === 'random' ? 'Random' : 'Equal'} · {remainingSlots(gift)}/{gift.slots} left · pool{' '}
              {gift.totalAmount} {gift.asset}
            </p>
          )}
        </div>
        <span
          className="px-2.5 py-1 rounded-full text-[11px] font-bold"
          style={{ background: 'rgba(74,155,146,0.2)', color: '#7dcdc4' }}
        >
          {gift.status}
        </span>
      </div>
      {gift.note ? (
        <p className="relative z-[1] mb-4" style={{ fontSize: 13, opacity: 0.75 }}>
          {gift.note}
        </p>
      ) : null}
      <div className="relative z-[1] flex gap-4 items-center">
        <div className="rounded-2xl p-2 flex-shrink-0" style={{ background: '#fff' }}>
          <QRCodeDisplay value={url} size={108} fgColor="#0A0A0A" bgColor="#FFFFFF" />
        </div>
        <div className="min-w-0">
          <p style={{ fontSize: 11, opacity: 0.45, fontWeight: 600 }}>PASSCODE</p>
          <p className="tabular-nums mt-1" style={{ fontSize: 20, fontWeight: 800, letterSpacing: 3 }}>
            {gift.code}
          </p>
          <p style={{ fontSize: 11, opacity: 0.4, marginTop: 8 }}>
            Expires {new Date(gift.expiresAt).toLocaleString()}
          </p>
          {isGw && gift.status === 'open' && (
            <p style={{ fontSize: 11, opacity: 0.4, marginTop: 2 }}>
              Remaining {remainingAmount(gift)} {gift.asset}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
