import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import type { Country } from './types';

interface CountryPickStepProps {
  options: Country[];
  selected: Country | null;
  onSelect: (c: Country) => void;
  onContinue: () => void;
}

export function CountryPickStep({ options, selected, onSelect, onContinue }: CountryPickStepProps) {
  return (
    <div className="pb-6">
      <h2
        style={{
          color: 'var(--foreground)',
          fontWeight: 800,
          fontSize: 26,
          letterSpacing: '-0.04em',
          marginBottom: 20,
        }}
      >
        Country
      </h2>

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
              className="w-full flex items-center gap-3.5 px-4 h-[54px] rounded-2xl text-left"
              style={{
                background: on ? 'var(--liquid-chip-on-bg)' : 'var(--card)',
                border: on ? '1.5px solid var(--liquid-chip-on-border)' : '1px solid var(--border)',
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
        className="w-full h-12 rounded-full"
        style={{
          background: selected ? 'var(--primary)' : 'var(--muted)',
          color: selected ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
          fontWeight: 700,
          fontSize: 15,
        }}
      >
        Continue
      </motion.button>
    </div>
  );
}
