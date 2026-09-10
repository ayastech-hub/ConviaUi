import { motion } from 'motion/react';
import { Check, Globe2 } from 'lucide-react';
import type { Country } from './types';

interface CountryPickStepProps {
  options: Country[];
  selected: Country | null;
  onSelect: (c: Country) => void;
  onContinue: () => void;
}

/** First KYC gate — choose operating country, then route to local flow. */
export function CountryPickStep({ options, selected, onSelect, onContinue }: CountryPickStepProps) {
  return (
    <div className="pb-6">
      <div className="mb-6">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
          style={{
            background: 'color-mix(in oklab, var(--primary) 14%, var(--muted))',
            border: '1px solid var(--border)',
          }}
        >
          <Globe2 size={22} style={{ color: 'var(--primary)' }} />
        </div>
        <h2 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 24, letterSpacing: '-0.04em', lineHeight: 1.15 }}>
          Where do you live?
        </h2>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 14, marginTop: 8, lineHeight: 1.5 }}>
          Verification requirements depend on your country. Pick the one that matches your ID.
        </p>
      </div>

      <div className="space-y-2 mb-8">
        {options.map((c) => {
          const on = selected?.code === c.code;
          const flag = `https://flagcdn.com/w40/${c.code.toLowerCase()}.png`;
          return (
            <motion.button
              key={c.code}
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(c)}
              className="w-full flex items-center gap-3.5 px-4 h-[56px] rounded-2xl text-left"
              style={{
                background: on ? 'var(--liquid-chip-on-bg)' : 'var(--card)',
                border: on
                  ? '1.5px solid var(--liquid-chip-on-border)'
                  : '1px solid var(--border)',
                boxShadow: on ? 'var(--liquid-chip-on-shadow)' : 'none',
              }}
            >
              <img
                src={flag}
                alt=""
                width={28}
                height={20}
                style={{ width: 28, height: 20, objectFit: 'cover', borderRadius: 4 }}
              />
              <span style={{ color: 'var(--foreground)', fontWeight: on ? 700 : 600, fontSize: 15, flex: 1 }}>
                {c.name}
              </span>
              {on && (
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--primary)' }}
                >
                  <Check size={14} style={{ color: 'var(--primary-foreground)' }} strokeWidth={3} />
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        disabled={!selected}
        onClick={onContinue}
        className="w-full h-13 rounded-full h-12"
        style={{
          background: selected ? 'var(--primary)' : 'var(--muted)',
          color: selected ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
          fontWeight: 700,
          fontSize: 15,
          opacity: selected ? 1 : 0.7,
        }}
      >
        Continue
      </motion.button>
    </div>
  );
}
