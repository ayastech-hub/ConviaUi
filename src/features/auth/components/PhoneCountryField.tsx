import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { PHONE_COUNTRIES, countryFromIso, buildE164, type PhoneCountry } from './phoneCountries';

interface Props {
  national: string;
  onNationalChange: (v: string) => void;
  country: PhoneCountry;
  onCountryChange: (c: PhoneCountry) => void;
  /** Combined E.164 pushed upward when national or country changes */
  onE164Change?: (e164: string) => void;
}

export function PhoneCountryField({
  national,
  onNationalChange,
  country,
  onCountryChange,
  onE164Change,
}: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onE164Change?.(buildE164(country.dial, national));
  }, [country.dial, national, onE164Change]);

  // Auto-detect country from IP (best effort, non-blocking)
  useEffect(() => {
    let cancelled = false;
    const detect = async () => {
      try {
        const r = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(4000) });
        if (!r.ok) throw new Error('geo');
        const data = (await r.json()) as { country_code?: string };
        if (cancelled || !data.country_code) return;
        onCountryChange(countryFromIso(data.country_code));
      } catch {
        try {
          const r2 = await fetch('https://ipwho.is/', { signal: AbortSignal.timeout(4000) });
          if (!r2.ok) return;
          const data2 = (await r2.json()) as { country_code?: string };
          if (!cancelled && data2.country_code) onCountryChange(countryFromIso(data2.country_code));
        } catch {
          /* keep default NG */
        }
      }
    };
    void detect();
    return () => {
      cancelled = true;
    };
    // only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return PHONE_COUNTRIES;
    return PHONE_COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(s) ||
        c.dial.includes(s) ||
        c.iso.toLowerCase().includes(s),
    );
  }, [q]);

  return (
    <div ref={rootRef} className="relative">
      <div
        className="flex items-center gap-2 rounded-2xl px-3 h-12"
        style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
      >
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1.5 shrink-0 pr-2 border-r"
          style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
        >
          <span className="text-base leading-none">{country.flag}</span>
          <span className="text-[13px] font-semibold tabular-nums">{country.dial}</span>
          <ChevronDown size={14} style={{ color: 'var(--muted-foreground)' }} />
        </button>
        <input
          type="tel"
          inputMode="tel"
          placeholder="Phone number"
          value={national}
          onChange={(e) => onNationalChange(e.target.value.replace(/[^\d\s-]/g, ''))}
          autoComplete="tel-national"
          className="flex-1 bg-transparent outline-none text-[15px] min-w-0"
          style={{ color: 'var(--foreground)' }}
        />
      </div>

      {open && (
        <div
          className="absolute z-50 left-0 right-0 mt-2 rounded-2xl overflow-hidden shadow-lg"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', maxHeight: 280 }}
        >
          <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: '1px solid var(--border)' }}>
            <Search size={14} style={{ color: 'var(--muted-foreground)' }} />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search country"
              className="flex-1 bg-transparent outline-none text-[13px]"
              style={{ color: 'var(--foreground)' }}
            />
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: 220 }}>
            {filtered.map((c) => {
              const on = c.iso === country.iso;
              return (
                <button
                  key={c.iso + c.dial}
                  type="button"
                  onClick={() => {
                    onCountryChange(c);
                    setOpen(false);
                    setQ('');
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-left"
                  style={{
                    background: on ? 'color-mix(in oklab, var(--primary) 12%, transparent)' : 'transparent',
                  }}
                >
                  <span className="text-base">{c.flag}</span>
                  <span className="flex-1 text-[13px] font-medium" style={{ color: 'var(--foreground)' }}>
                    {c.name}
                  </span>
                  <span className="text-[12px] tabular-nums" style={{ color: 'var(--muted-foreground)' }}>
                    {c.dial}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
