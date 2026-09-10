import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { IdCard, BadgeCheck, AlertCircle, Sparkles, ArrowLeft } from 'lucide-react';

type IdKind = 'nin' | 'bvn';

interface NigeriaIdStepProps {
  nin: string;
  setNin: (v: string) => void;
  bvn: string;
  setBvn: (v: string) => void;
  errors: Record<string, string>;
  clearError: (field: string) => void;
  onContinue: () => void;
}

/** Tier-1 Nigeria: choose NIN and/or BVN, enter digits, continue — no face. */
export function NigeriaIdStep({
  nin,
  setNin,
  bvn,
  setBvn,
  errors,
  clearError,
  onContinue,
}: NigeriaIdStepProps) {
  const [focus, setFocus] = useState<IdKind | null>(null);

  const ninOk = nin.length === 11;
  const bvnOk = bvn.length === 11;
  const canContinue = ninOk; // NIN required; BVN optional but recommended

  const open = (k: IdKind) => setFocus(k);

  return (
    <div className="pb-8">
      <div className="mb-6">
        <p
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-3"
          style={{
            background: 'color-mix(in oklab, var(--primary) 12%, transparent)',
            color: 'var(--primary)',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 0.3,
          }}
        >
          Nigeria · Tier 1
        </p>
        <h2 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 24, letterSpacing: '-0.04em', lineHeight: 1.15 }}>
          Confirm your identity
        </h2>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 14, marginTop: 8, lineHeight: 1.5 }}>
          Select an ID type, enter the number, then continue. No selfie needed for Tier 1.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!focus ? (
          <motion.div
            key="pick"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-3"
          >
            {/* NIN */}
            <IdCardBtn
              title="National ID (NIN)"
              desc={ninOk ? `•••• ${nin.slice(-4)} · Added` : '11-digit National Identity Number'}
              icon={IdCard}
              required
              done={ninOk}
              onClick={() => open('nin')}
            />
            {/* BVN recommended */}
            <IdCardBtn
              title="Bank Verification (BVN)"
              desc={bvnOk ? `•••• ${bvn.slice(-4)} · Added` : 'Unlocks higher limits'}
              icon={BadgeCheck}
              recommended
              done={bvnOk}
              onClick={() => open('bvn')}
            />

            <p style={{ color: 'var(--muted-foreground)', fontSize: 12, lineHeight: 1.45, padding: '4px 2px' }}>
              NIN is required. BVN is optional but recommended for withdrawals and bills.
            </p>

            {(errors.nin || errors.bvn) && (
              <p className="flex items-center gap-1.5" style={{ color: 'var(--destructive)', fontSize: 12 }}>
                <AlertCircle size={13} />
                {errors.nin || errors.bvn}
              </p>
            )}

            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              disabled={!canContinue}
              onClick={onContinue}
              className="w-full h-12 rounded-full mt-4"
              style={{
                background: canContinue ? 'var(--primary)' : 'var(--muted)',
                color: canContinue ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                fontWeight: 700,
                fontSize: 15,
              }}
            >
              Continue
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key={focus}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
          >
            <button
              type="button"
              onClick={() => setFocus(null)}
              className="flex items-center gap-1.5 mb-5"
              style={{ color: 'var(--muted-foreground)', fontSize: 13, fontWeight: 600 }}
            >
              <ArrowLeft size={15} />
              Back
            </button>

            <h3 style={{ color: 'var(--foreground)', fontWeight: 750, fontSize: 18, marginBottom: 6 }}>
              {focus === 'nin' ? 'Enter your NIN' : 'Enter your BVN'}
            </h3>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginBottom: 18, lineHeight: 1.45 }}>
              {focus === 'nin'
                ? 'Your 11-digit National Identity Number from NIMC.'
                : 'Your 11-digit Bank Verification Number. Recommended for higher limits.'}
            </p>

            <div
              className="rounded-2xl px-4 py-1 mb-3"
              style={{
                background: 'var(--muted)',
                border: `1.5px solid ${errors[focus] ? 'var(--destructive)' : 'var(--border)'}`,
              }}
            >
              <input
                autoFocus
                value={focus === 'nin' ? nin : bvn}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '').slice(0, 11);
                  if (focus === 'nin') {
                    setNin(v);
                    clearError('nin');
                  } else {
                    setBvn(v);
                    clearError('bvn');
                  }
                }}
                placeholder="00000000000"
                inputMode="numeric"
                className="w-full bg-transparent outline-none py-3.5 tabular-nums"
                style={{
                  color: 'var(--foreground)',
                  fontSize: 22,
                  fontWeight: 700,
                  letterSpacing: 3,
                }}
              />
            </div>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 20 }}>
              {(focus === 'nin' ? nin : bvn).length}/11 digits
            </p>

            {errors[focus] && (
              <p className="flex items-center gap-1.5 mb-3" style={{ color: 'var(--destructive)', fontSize: 12 }}>
                <AlertCircle size={13} />
                {errors[focus]}
              </p>
            )}

            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                const val = focus === 'nin' ? nin : bvn;
                if (val.length !== 11) {
                  if (focus === 'nin') clearError('nin');
                  // set via parent on continue only; local guard:
                  return;
                }
                setFocus(null);
              }}
              disabled={(focus === 'nin' ? nin : bvn).length !== 11}
              className="w-full h-12 rounded-full"
              style={{
                background: (focus === 'nin' ? nin : bvn).length === 11 ? 'var(--primary)' : 'var(--muted)',
                color:
                  (focus === 'nin' ? nin : bvn).length === 11
                    ? 'var(--primary-foreground)'
                    : 'var(--muted-foreground)',
                fontWeight: 700,
                fontSize: 15,
              }}
            >
              Save
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function IdCardBtn({
  title,
  desc,
  icon: Icon,
  required,
  recommended,
  done,
  onClick,
}: {
  title: string;
  desc: string;
  icon: typeof IdCard;
  required?: boolean;
  recommended?: boolean;
  done?: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full flex items-center gap-3.5 px-4 py-4 rounded-[22px] text-left relative"
      style={{
        background: done
          ? 'color-mix(in oklab, var(--positive) 10%, var(--card))'
          : recommended
            ? 'var(--liquid-chip-on-bg)'
            : 'var(--card)',
        border: done
          ? '1.5px solid color-mix(in oklab, var(--positive) 35%, var(--border))'
          : recommended
            ? '1.5px solid var(--liquid-chip-on-border)'
            : '1px solid var(--border)',
        boxShadow: recommended && !done ? 'var(--liquid-chip-on-shadow)' : 'none',
      }}
    >
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{
          background: done
            ? 'color-mix(in oklab, var(--positive) 18%, transparent)'
            : 'var(--muted)',
        }}
      >
        <Icon size={20} style={{ color: done ? 'var(--positive)' : 'var(--foreground)' }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>{title}</span>
          {required && (
            <span style={{ color: 'var(--muted-foreground)', fontSize: 10, fontWeight: 700 }}>REQUIRED</span>
          )}
          {recommended && (
            <span
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md"
              style={{
                background: 'color-mix(in oklab, var(--primary) 16%, transparent)',
                color: 'var(--primary)',
                fontSize: 10,
                fontWeight: 750,
              }}
            >
              <Sparkles size={10} />
              RECOMMENDED
            </span>
          )}
        </div>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginTop: 3 }}>{desc}</p>
      </div>
      {done && <BadgeCheck size={18} style={{ color: 'var(--positive)', flexShrink: 0 }} />}
    </motion.button>
  );
}
