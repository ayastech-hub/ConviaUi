import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { IdCard, BadgeCheck, AlertCircle, Sparkles, ArrowLeft, Check } from 'lucide-react';

type IdKind = 'nin' | 'bvn';

interface NigeriaIdStepProps {
  nin: string;
  setNin: (v: string) => void;
  bvn: string;
  setBvn: (v: string) => void;
  /** Which method the user chose — only one is used. */
  method: IdKind | null;
  setMethod: (m: IdKind | null) => void;
  errors: Record<string, string>;
  clearError: (field: string) => void;
  onContinue: () => void;
}

/**
 * Nigeria Tier-1: user picks **either** NIN **or** BVN (not both).
 * Enter 11 digits for the chosen method, then continue. No face.
 */
export function NigeriaIdStep({
  nin,
  setNin,
  bvn,
  setBvn,
  method,
  setMethod,
  errors,
  clearError,
  onContinue,
}: NigeriaIdStepProps) {
  const [entering, setEntering] = useState(false);

  const value = method === 'bvn' ? bvn : nin;
  const setValue = method === 'bvn' ? setBvn : setNin;
  const errKey = method === 'bvn' ? 'bvn' : 'nin';
  const valid = value.length === 11;
  const canContinue = Boolean(method && valid);

  const pick = (k: IdKind) => {
    setMethod(k);
    // Clear the other so only one is submitted
    if (k === 'nin') setBvn('');
    else setNin('');
    clearError('nin');
    clearError('bvn');
    setEntering(true);
  };

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
          Choose how to verify
        </h2>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 14, marginTop: 8, lineHeight: 1.5 }}>
          Pick <strong style={{ color: 'var(--foreground)', fontWeight: 650 }}>one</strong> — NIN or BVN. They are
          different systems; you only need either.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!entering ? (
          <motion.div
            key="pick"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-3"
          >
            <ChoiceCard
              title="National ID (NIN)"
              desc="11-digit number from NIMC"
              icon={IdCard}
              selected={method === 'nin' && valid}
              onClick={() => pick('nin')}
            />
            <ChoiceCard
              title="Bank Verification (BVN)"
              desc="11-digit number linked to your bank"
              icon={BadgeCheck}
              recommended
              selected={method === 'bvn' && valid}
              onClick={() => pick('bvn')}
            />

            {(errors.nin || errors.bvn || errors.method) && (
              <p className="flex items-center gap-1.5 pt-1" style={{ color: 'var(--destructive)', fontSize: 12 }}>
                <AlertCircle size={13} />
                {errors.method || errors.nin || errors.bvn}
              </p>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="enter"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
          >
            <button
              type="button"
              onClick={() => setEntering(false)}
              className="flex items-center gap-1.5 mb-5"
              style={{ color: 'var(--muted-foreground)', fontSize: 13, fontWeight: 600 }}
            >
              <ArrowLeft size={15} />
              Change method
            </button>

            <h3 style={{ color: 'var(--foreground)', fontWeight: 750, fontSize: 18, marginBottom: 6 }}>
              {method === 'bvn' ? 'Enter your BVN' : 'Enter your NIN'}
            </h3>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginBottom: 18, lineHeight: 1.45 }}>
              {method === 'bvn'
                ? 'Your 11-digit Bank Verification Number.'
                : 'Your 11-digit National Identity Number from NIMC.'}
            </p>

            <div
              className="rounded-2xl px-4 py-1 mb-3"
              style={{
                background: 'var(--muted)',
                border: `1.5px solid ${errors[errKey] ? 'var(--destructive)' : 'var(--border)'}`,
              }}
            >
              <input
                autoFocus
                value={value}
                onChange={(e) => {
                  setValue(e.target.value.replace(/\D/g, '').slice(0, 11));
                  clearError(errKey);
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
              {value.length}/11 digits
            </p>

            {errors[errKey] && (
              <p className="flex items-center gap-1.5 mb-3" style={{ color: 'var(--destructive)', fontSize: 12 }}>
                <AlertCircle size={13} />
                {errors[errKey]}
              </p>
            )}

            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              disabled={!canContinue}
              onClick={onContinue}
              className="w-full h-12 rounded-full"
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
        )}
      </AnimatePresence>
    </div>
  );
}

function ChoiceCard({
  title,
  desc,
  icon: Icon,
  recommended,
  selected,
  onClick,
}: {
  title: string;
  desc: string;
  icon: typeof IdCard;
  recommended?: boolean;
  selected?: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full flex items-center gap-3.5 px-4 py-4 rounded-[22px] text-left"
      style={{
        background: selected
          ? 'color-mix(in oklab, var(--positive) 10%, var(--card))'
          : recommended
            ? 'var(--liquid-chip-on-bg)'
            : 'var(--card)',
        border: selected
          ? '1.5px solid color-mix(in oklab, var(--positive) 35%, var(--border))'
          : recommended
            ? '1.5px solid var(--liquid-chip-on-border)'
            : '1px solid var(--border)',
        boxShadow: recommended && !selected ? 'var(--liquid-chip-on-shadow)' : 'none',
      }}
    >
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{
          background: selected ? 'color-mix(in oklab, var(--positive) 18%, transparent)' : 'var(--muted)',
        }}
      >
        <Icon size={20} style={{ color: selected ? 'var(--positive)' : 'var(--foreground)' }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>{title}</span>
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
      {selected ? (
        <Check size={18} style={{ color: 'var(--positive)', flexShrink: 0 }} strokeWidth={2.5} />
      ) : null}
    </motion.button>
  );
}
