import { motion } from 'motion/react';
import { Pencil, CheckCircle2, Loader } from 'lucide-react';
import type { Asset, ChatContact } from '../../../../shared/data/mockData';

interface SendConfirmStepProps {
  format: (n: number) => string;
  selectedContact: ChatContact | null;
  recipient: string;
  amount: string;
  cryptoAmount: number;
  selectedAsset: Asset;
  fee: number;
  total: number;
  onEdit: () => void;
  canConfirm: boolean;
  holding: boolean;
  confirmProgress: number;
  onHoldStart: () => void;
  onHoldEnd: () => void;
}

/** Send step 3: transaction summary and the "hold to confirm" button. */
export function SendConfirmStep({
  format, selectedContact, recipient, amount, cryptoAmount, selectedAsset, fee, total,
  onEdit, canConfirm, holding, confirmProgress, onHoldStart, onHoldEnd,
}: SendConfirmStepProps) {
  const rows = [
    { label: 'From', value: 'My Wallet' },
    { label: 'Asset', value: selectedAsset.name },
    { label: 'Network', value: selectedAsset.chains[0] },
    { label: 'Network fee', value: format(fee) },
  ];

  return (
    <motion.div key="confirm" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
      <div className="rounded-[20px] p-5 mb-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-white" style={{ background: selectedContact?.color ?? 'var(--primary)', fontSize: 20, fontWeight: 700 }}>
            {selectedContact?.initials ?? recipient.charAt(0).toUpperCase()}
          </div>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 2 }}>Sending to</p>
          <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>{selectedContact?.name ?? recipient}</p>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 11, fontFamily: 'monospace', marginTop: 4, wordBreak: 'break-all' }}>
            {selectedContact ? `@${recipient}` : recipient}
          </p>
        </div>

        <div className="text-center mb-6">
          <p style={{ color: 'var(--foreground)', fontSize: 40, fontWeight: 800, letterSpacing: -2 }}>{format(Number(amount))}</p>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>≈ {cryptoAmount.toFixed(6)} {selectedAsset.symbol}</p>
        </div>

        <div className="space-y-0">
          {rows.map((row, i) => (
            <div key={row.label} className="flex justify-between items-center py-3" style={{ borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>{row.label}</span>
              <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 500 }}>{row.value}</span>
            </div>
          ))}
          <div className="flex justify-between items-center pt-3">
            <span style={{ color: 'var(--foreground)', fontSize: 14, fontWeight: 700 }}>Total deducted</span>
            <span style={{ color: 'var(--foreground)', fontSize: 16, fontWeight: 800 }}>{format(total)}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-center mb-4">
        <motion.button whileTap={{ scale: 0.95 }} onClick={onEdit} className="flex items-center gap-1.5 px-4 py-2 rounded-xl" style={{ background: 'var(--muted)' }}>
          <Pencil size={13} style={{ color: 'var(--foreground)' }} />
          <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}>Edit details</span>
        </motion.button>
      </div>

      <div className="relative">
        <motion.button
          onPointerDown={onHoldStart}
          onPointerUp={onHoldEnd}
          onPointerLeave={onHoldEnd}
          className="relative w-full py-4 rounded-[16px] text-white flex items-center justify-center gap-2 overflow-hidden select-none"
          style={{ background: canConfirm ? 'var(--primary)' : 'var(--muted)', color: canConfirm ? '#fff' : 'var(--muted-foreground)', fontWeight: 700, fontSize: 15, touchAction: 'none' }}
        >
          <motion.div className="absolute inset-0" style={{ background: 'var(--positive)' }} animate={{ width: `${confirmProgress * 100}%` }} transition={{ duration: 0.03 }} />
          <span className="relative z-10 flex items-center gap-2">
            {holding ? (
              <><Loader size={18} className="animate-spin" /> Hold to confirm… {Math.round(confirmProgress * 100)}%</>
            ) : (
              <><CheckCircle2 size={18} /> Hold to Confirm</>
            )}
          </span>
        </motion.button>
      </div>
      <p style={{ color: 'var(--muted-foreground)', fontSize: 11, textAlign: 'center', marginTop: 8 }}>Press and hold for 1.5 seconds to authorize</p>
    </motion.div>
  );
}
