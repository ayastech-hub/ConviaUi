import { motion, AnimatePresence } from 'motion/react';
import { Wallet } from 'lucide-react';

interface RequestAmountToggleProps {
  enabled: boolean;
  onToggle: () => void;
  requestAmount: string;
  setRequestAmount: (v: string) => void;
  assetSymbol: string;
  amountNum: number;
  usdValue: number;
  format: (n: number) => string;
}

/** "Request specific amount" collapsible toggle, embeds an amount into the receive QR code. */
export function RequestAmountToggle({
  enabled, onToggle, requestAmount, setRequestAmount, assetSymbol, amountNum, usdValue, format,
}: RequestAmountToggleProps) {
  return (
    <motion.div className="rounded-[18px] mb-4 overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
      <button onClick={onToggle} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'transparent', border: 'none' }}>
        <div style={{ width: 38, height: 38, borderRadius: 12, background: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>
          <Wallet size={18} style={{ color: enabled ? 'var(--primary)' : 'var(--muted-foreground)' }} />
        </div>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>Request specific amount</p>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{enabled ? 'Amount included in QR code' : 'Generate QR with a set amount'}</p>
        </div>
        <div style={{ width: 44, height: 26, borderRadius: 13, background: enabled ? 'var(--primary)' : 'var(--muted)', border: enabled ? 'none' : '1px solid var(--border)', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
          <motion.div
            animate={{ x: enabled ? 18 : 2 }}
            transition={{ type: 'spring', stiffness: 500, damping: 32 }}
            style={{ position: 'absolute', top: 2, width: 22, height: 22, borderRadius: '50%', background: '#FFFFFF', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
          />
        </div>
      </button>

      <AnimatePresence>
        {enabled && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} style={{ overflow: 'hidden' }}>
            <div style={{ padding: '0 16px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 14, background: 'var(--muted)', border: '1px solid var(--border)' }}>
                <input
                  type="number" inputMode="decimal" placeholder="0.00" value={requestAmount}
                  onChange={(e) => setRequestAmount(e.target.value)}
                  autoFocus
                  style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--foreground)', fontSize: 18, fontWeight: 700, fontFamily: 'ui-monospace, monospace' }}
                />
                <span style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>{assetSymbol}</span>
              </div>
              {amountNum > 0 && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} style={{ color: 'var(--muted-foreground)', fontSize: 12, marginTop: 8, textAlign: 'right' }}>
                  ≈ {format(usdValue)}
                </motion.p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
