import { Clock, Info } from 'lucide-react';
import type { NetworkInfo } from './types';

/** Est-arrival/network info cards and the footer note at the bottom of the Receive screen. */
export function ReceiveInfoGrid({ netInfo }: { netInfo: NetworkInfo }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="rounded-[14px] p-3.5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <Clock size={13} style={{ color: 'var(--muted-foreground)' }} />
            <p style={{ color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600 }}>Est. Arrival</p>
          </div>
          <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>{netInfo.estTime}</p>
        </div>
        <div className="rounded-[14px] p-3.5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <Info size={13} style={{ color: 'var(--muted-foreground)' }} />
            <p style={{ color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600 }}>Network</p>
          </div>
          <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>{netInfo.label}</p>
        </div>
      </div>

      <p style={{ color: 'var(--muted-foreground)', fontSize: 10, textAlign: 'center', lineHeight: 1.5 }}>
        Convia wallet addresses are unique per asset and network. Need help?{' '}
        <span style={{ color: 'var(--foreground)', fontWeight: 600 }}>Contact support</span>
      </p>
    </>
  );
}
