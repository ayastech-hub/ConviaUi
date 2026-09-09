import { QRCodeDisplay } from '../../../shared/components/QRCodeDisplay';
import type { Gift } from '../types';
import { claimUrl, remainingAmount, remainingSlots } from '../types';

interface GiftCardProps {
  gift: Gift;
}

/** Binance-style share card: amount, QR, code, expiry. */
export function GiftCard({ gift }: GiftCardProps) {
  const url = claimUrl(gift.code);
  const isGiveaway = gift.kind === 'giveaway';
  const statusColor =
    gift.status === 'open'
      ? 'var(--primary)'
      : gift.status === 'claimed'
        ? 'var(--positive, #22c55e)'
        : 'var(--muted-foreground)';

  return (
    <div
      className="relative overflow-hidden rounded-[24px] p-5"
      style={{
        background: 'linear-gradient(145deg, #1a1a1e 0%, #121216 50%, #0c0c0e 100%)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 16px 48px rgba(0,0,0,0.35)',
        color: '#fff',
      }}
    >
      <div
        className="pointer-events-none absolute -top-16 -right-10 w-40 h-40 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(74,155,146,0.35) 0%, transparent 70%)' }}
      />
      <div className="flex items-center justify-between mb-4 relative z-[1]">
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, opacity: 0.55, textTransform: 'uppercase' }}>
            Convia · {isGiveaway ? 'Giveaway' : 'Cheque'}
          </p>
          <p style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>
            {gift.status === 'open'
              ? isGiveaway
                ? `${remainingSlots(gift)} of ${gift.slots} left`
                : 'Ready to claim'
              : gift.status.toUpperCase()}
          </p>
        </div>
        <span
          className="px-2.5 py-1 rounded-full text-[11px] font-bold"
          style={{ background: 'rgba(255,255,255,0.08)', color: statusColor }}
        >
          {gift.asset}
        </span>
      </div>

      <div className="relative z-[1] mb-4">
        <p className="tabular-nums" style={{ fontSize: 32, fontWeight: 800, letterSpacing: -1 }}>
          {isGiveaway ? gift.perClaimAmount : gift.totalAmount}{' '}
          <span style={{ fontSize: 16, fontWeight: 600, opacity: 0.7 }}>{gift.asset}</span>
        </p>
        {isGiveaway && (
          <p style={{ fontSize: 12, opacity: 0.55, marginTop: 4 }}>
            Pool {gift.totalAmount} {gift.asset} · equal split · remaining {remainingAmount(gift)} {gift.asset}
          </p>
        )}
        {gift.note ? (
          <p style={{ fontSize: 13, opacity: 0.75, marginTop: 8 }}>{gift.note}</p>
        ) : null}
      </div>

      <div className="flex gap-4 items-center relative z-[1]">
        <div
          className="rounded-2xl p-2 flex-shrink-0"
          style={{ background: '#fff' }}
        >
          <QRCodeDisplay value={url} size={112} fgColor="#0A0A0A" bgColor="#FFFFFF" />
        </div>
        <div className="min-w-0 flex-1">
          <p style={{ fontSize: 11, opacity: 0.5, fontWeight: 600, letterSpacing: 0.6 }}>CODE</p>
          <p
            className="tabular-nums tracking-[0.2em] mt-1"
            style={{ fontSize: 20, fontWeight: 800, letterSpacing: 3 }}
          >
            {gift.code}
          </p>
          <p style={{ fontSize: 11, opacity: 0.45, marginTop: 10 }}>
            Expires {new Date(gift.expiresAt).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
