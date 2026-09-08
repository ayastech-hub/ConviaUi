import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ChevronDown, Globe, Search, AlertCircle } from 'lucide-react';

export type CountryOption = { code: string; name: string };

function flagSrc(code: string) {
  return `https://flagcdn.com/w40/${code.toLowerCase()}.png`;
}

interface CountrySelectProps {
  value: CountryOption | null;
  options: CountryOption[];
  onChange: (c: CountryOption) => void;
  error?: string;
  disabled?: boolean;
  hint?: string;
  label?: string;
}

/** Searchable country picker — flagcdn marks, no emoji. */
export function CountrySelect({
  value,
  options,
  onChange,
  error,
  disabled,
  hint,
  label = 'Country',
}: CountrySelectProps) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return options;
    return options.filter(
      (c) => c.name.toLowerCase().includes(n) || c.code.toLowerCase().includes(n),
    );
  }, [options, q]);

  return (
    <div className="relative">
      <label
        style={{
          color: 'var(--muted-foreground)',
          fontSize: 12,
          fontWeight: 600,
          marginBottom: 6,
          display: 'block',
        }}
      >
        {label} {!disabled && <span style={{ color: 'var(--destructive)' }}>*</span>}
      </label>
      <motion.button
        type="button"
        whileTap={disabled ? undefined : { scale: 0.99 }}
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-3.5 py-3 rounded-[12px]"
        style={{
          background: 'var(--muted)',
          border: `1px solid ${error ? 'var(--destructive)' : open ? 'var(--primary)' : 'var(--border)'}`,
          opacity: disabled ? 0.7 : 1,
        }}
      >
        <Globe size={16} style={{ color: error ? 'var(--destructive)' : 'var(--muted-foreground)' }} />
        {value ? (
          <span className="flex items-center gap-2 flex-1 text-left min-w-0">
            <img src={flagSrc(value.code)} alt="" width={18} height={12} style={{ width: 18, height: 12, objectFit: 'cover', borderRadius: 2 }} />
            <span className="truncate" style={{ color: 'var(--foreground)', fontSize: 14 }}>
              {value.name}
            </span>
            <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{value.code}</span>
          </span>
        ) : (
          <span style={{ color: 'var(--muted-foreground)', fontSize: 14, flex: 1, textAlign: 'left' }}>
            Select country
          </span>
        )}
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.15 }}>
          <ChevronDown size={16} style={{ color: 'var(--muted-foreground)' }} />
        </motion.div>
      </motion.button>
      {error && !open && (
        <p className="flex items-center gap-1 mt-1.5" style={{ color: 'var(--destructive)', fontSize: 11 }}>
          <AlertCircle size={11} /> {error}
        </p>
      )}
      {hint && !error && (
        <p style={{ color: 'var(--muted-foreground)', fontSize: 11, marginTop: 6 }}>{hint}</p>
      )}
      <AnimatePresence>
        {open && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden rounded-[12px] mt-1.5 absolute left-0 right-0 z-20"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 12px 32px color-mix(in oklab, var(--foreground) 12%, transparent)' }}
          >
            <div className="p-2">
              <div className="flex items-center gap-2 px-3 py-2 rounded-[10px] mb-1" style={{ background: 'var(--muted)' }}>
                <Search size={14} style={{ color: 'var(--muted-foreground)' }} />
                <input
                  autoFocus
                  placeholder="Search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="flex-1 bg-transparent outline-none"
                  style={{ color: 'var(--foreground)', fontSize: 13 }}
                />
              </div>
              <div style={{ maxHeight: 220, overflowY: 'auto' }}>
                {filtered.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => {
                      onChange(c);
                      setOpen(false);
                      setQ('');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[10px]"
                    style={{ background: value?.code === c.code ? 'var(--muted)' : 'transparent' }}
                  >
                    <img src={flagSrc(c.code)} alt="" width={18} height={12} style={{ width: 18, height: 12, objectFit: 'cover', borderRadius: 2 }} />
                    <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 500 }}>{c.name}</span>
                    <span style={{ color: 'var(--muted-foreground)', fontSize: 11, marginLeft: 'auto' }}>{c.code}</span>
                    {value?.code === c.code && <Check size={14} style={{ color: 'var(--foreground)' }} />}
                  </button>
                ))}
                {filtered.length === 0 && (
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 12, textAlign: 'center', padding: '12px 0' }}>
                    No match
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
