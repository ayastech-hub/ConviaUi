import { motion, AnimatePresence } from 'motion/react';
import { Settings2, ChevronDown, Shield } from 'lucide-react';
import { PRESET_SLIPPAGE } from './utils';

interface SlippageSelectorProps {
  open: boolean;
  onToggle: () => void;
  effectiveSlippage: string;
  slippage: string;
  customSlippage: string;
  onSetPreset: (v: string) => void;
  onSetCustom: (v: string) => void;
}

/** Collapsible "Slippage tolerance" card with preset buttons and a custom % input. */
export function SlippageSelector({ open, onToggle, effectiveSlippage, slippage, customSlippage, onSetPreset, onSetCustom }: SlippageSelectorProps) {
  return (
    <motion.div className="rounded-[16px] mb-3 overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
      <button onClick={onToggle} className="w-full flex items-center justify-between px-3.5 py-3">
        <div className="flex items-center gap-2">
          <Settings2 size={14} style={{ color: 'var(--muted-foreground)' }} />
          <span style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}>Slippage tolerance</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 700 }}>{effectiveSlippage}</span>
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={14} style={{ color: 'var(--muted-foreground)' }} />
          </motion.div>
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
            <div className="px-3.5 pb-3.5 pt-1" style={{ borderTop: '1px solid var(--border)' }}>
              <div className="flex gap-2 mt-3">
                {PRESET_SLIPPAGE.map((v) => {
                  const active = !customSlippage && slippage === v;
                  return (
                    <motion.button key={v} whileTap={{ scale: 0.95 }} onClick={() => onSetPreset(v)} className="flex-1 py-2 rounded-[10px]" style={{ background: active ? 'var(--primary)' : 'var(--muted)', color: active ? '#FFF' : 'var(--foreground)', fontSize: 12, fontWeight: 700 }}>
                      {v}
                    </motion.button>
                  );
                })}
                <div className="flex-1 flex items-center px-2.5 py-2 rounded-[10px]" style={{ background: 'var(--muted)', border: customSlippage ? '1px solid var(--primary)' : '1px solid transparent' }}>
                  <input
                    type="text" inputMode="decimal" placeholder="Custom" value={customSlippage}
                    onChange={(e) => onSetCustom(e.target.value)}
                    className="w-full bg-transparent outline-none text-center"
                    style={{ color: 'var(--foreground)', fontSize: 12, fontWeight: 700 }}
                  />
                  <span style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}>%</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-2.5">
                <Shield size={11} style={{ color: 'var(--muted-foreground)' }} />
                <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>Your swap reverses if price moves more than {effectiveSlippage}.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
