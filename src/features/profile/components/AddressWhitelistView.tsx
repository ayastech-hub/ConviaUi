import { motion } from 'motion/react';
import { CheckCircle2, Globe } from 'lucide-react';
import { ScreenHeader } from '../../../shared/components/ScreenHeader';
import { ToggleSwitch } from '../../../shared/components/ToggleSwitch';

const WHITELISTED_ADDRESSES = [
  { label: 'Cold Wallet', address: '0x4f3a...B2E', asset: 'ETH' },
  { label: 'Hardware', address: 'bc1q...8x2f', asset: 'BTC' },
];

interface AddressWhitelistViewProps {
  onBack: () => void;
  enabled: boolean;
  onToggle: () => void;
}

/** "Address Whitelist" view: toggle whitelist mode and manage whitelisted withdrawal addresses. */
export function AddressWhitelistView({ onBack, enabled, onToggle }: AddressWhitelistViewProps) {
  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />
      <ScreenHeader title="Address Whitelist" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-5">
        <div className="flex items-center justify-between p-4 rounded-[16px] mb-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div>
            <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>Whitelist Mode</p>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Only allow withdrawals to whitelisted addresses</p>
          </div>
          <ToggleSwitch checked={enabled} onChange={onToggle} />
        </div>

        {enabled ? (
          <>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 10 }}>Whitelisted Addresses</p>
            {WHITELISTED_ADDRESSES.map((addr, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-[16px] mb-3" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--muted)' }}>
                  <CheckCircle2 size={18} style={{ color: 'var(--foreground)' }} />
                </div>
                <div className="flex-1">
                  <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13 }}>{addr.label}</p>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontFamily: 'monospace' }}>{addr.address}</p>
                </div>
                <span className="px-2 py-1 rounded-lg" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600 }}>{addr.asset}</span>
              </div>
            ))}
            <motion.button whileTap={{ scale: 0.97 }} className="w-full py-3.5 rounded-[16px] text-white" style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 15 }}>
              Add Address
            </motion.button>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--muted)' }}>
              <Globe size={28} style={{ color: 'var(--muted-foreground)' }} />
            </div>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Whitelist is off. Withdrawals allowed to any address.</p>
          </div>
        )}
      </div>
    </div>
  );
}
