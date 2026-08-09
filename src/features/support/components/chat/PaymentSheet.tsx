import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronDown, Loader, ArrowUpRight } from 'lucide-react';
import { assets, type ChatAsset } from './types';

interface PaymentSheetProps {
  open: boolean;
  onClose: () => void;
  selectedAsset: ChatAsset;
  setSelectedAsset: (a: ChatAsset) => void;
  showAssetPicker: boolean;
  setShowAssetPicker: (v: boolean) => void;
  amount: string;
  setAmount: (v: string) => void;
  sending: boolean;
  onSend: () => void;
}

/** Bottom sheet for sending a quick in-chat crypto payment. */
export function PaymentSheet({ open, onClose, selectedAsset, setSelectedAsset, showAssetPicker, setShowAssetPicker, amount, setAmount, sending, onSend }: PaymentSheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 z-40" style={{ background: 'rgba(0,0,0,0.5)' }} />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 z-50 rounded-t-[28px] p-6 pb-8" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderTop: '1px solid var(--border)' }}
          >
            <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: 'var(--border)' }} />

            <div className="flex items-center justify-between mb-6">
              <h3 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 18 }}>Send Payment</h3>
              <motion.button whileTap={{ scale: 0.9 }} onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--muted)' }}>
                <X size={16} style={{ color: 'var(--muted-foreground)' }} />
              </motion.button>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-[14px] mb-4" style={{ background: 'var(--muted)' }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'var(--secondary)', color: 'var(--foreground)', fontSize: 11, fontWeight: 700 }}>KA</div>
              <div>
                <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13 }}>Kwame Asante</p>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>@kwame_builds</p>
              </div>
            </div>

            <div className="rounded-[16px] p-5 mb-4" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 8 }}>Amount</p>
              <div className="flex items-center gap-2">
                <input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="flex-1 bg-transparent outline-none" style={{ color: 'var(--foreground)', fontSize: 32, fontWeight: 800 }} />
                <button onClick={() => setShowAssetPicker(!showAssetPicker)} className="flex items-center gap-1.5 px-3 py-2 rounded-[12px]" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--foreground)', fontSize: 16, fontWeight: 700 }}>{selectedAsset.icon}</span>
                  <span style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>{selectedAsset.symbol}</span>
                  <ChevronDown size={14} style={{ color: 'var(--muted-foreground)' }} />
                </button>
              </div>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 11, marginTop: 8 }}>Balance: {selectedAsset.balance} {selectedAsset.symbol}</p>
            </div>

            <AnimatePresence>
              {showAssetPicker && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-4">
                  <div className="rounded-[14px] overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                    {assets.map((asset) => (
                      <button
                        key={asset.symbol}
                        onClick={() => { setSelectedAsset(asset); setShowAssetPicker(false); }}
                        className="flex items-center gap-3 px-4 py-3 w-full"
                        style={{ background: selectedAsset.symbol === asset.symbol ? 'var(--muted)' : 'var(--card)', borderBottom: '1px solid var(--border)' }}
                      >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--muted)', color: 'var(--foreground)', fontSize: 13, fontWeight: 700, border: '1px solid var(--border)' }}>{asset.icon}</div>
                        <div className="flex-1 text-left">
                          <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13 }}>{asset.symbol}</p>
                          <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{asset.name}</p>
                        </div>
                        <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{asset.balance}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onSend}
              disabled={!amount || sending}
              className="w-full h-[52px] rounded-[16px] flex items-center justify-center gap-2"
              style={{ background: amount && !sending ? 'var(--primary)' : 'var(--muted)', color: amount && !sending ? 'var(--primary-foreground)' : 'var(--muted-foreground)', fontWeight: 700, fontSize: 16 }}
            >
              {sending ? (<><Loader size={18} className="animate-spin" /> Sending...</>) : (<><ArrowUpRight size={18} /> Send {amount || '0'} {selectedAsset.symbol}</>)}
            </motion.button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
