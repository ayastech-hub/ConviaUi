import { useMemo, useRef } from 'react';
import { Calendar } from 'lucide-react';

export type ExpiryPreset = { id: string; label: string; ms: number };

interface ExpiryPickerProps {
  presets: ExpiryPreset[];
  presetId: string;
  customDate: string;
  onPreset: (id: string) => void;
  onCustomDate: (isoDate: string) => void;
  label?: string;
}

/** Enterprise expiry control — preset chips + polished date field. */
export function ExpiryPicker({
  presets,
  presetId,
  customDate,
  onPreset,
  onCustomDate,
  label = 'Expires',
}: ExpiryPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const min = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const usingCustom = !!customDate;

  const display = usingCustom
    ? formatDisplay(customDate)
    : presets.find((p) => p.id === presetId)?.label || presetId;

  return (
    <div>
      <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>{label}</p>

      <div className="flex gap-2 mb-2.5">
        {presets.map((o) => {
          const on = presetId === o.id && !usingCustom;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => {
                onPreset(o.id);
                onCustomDate('');
              }}
              className="flex-1 h-10 rounded-full text-[12px] font-bold"
              style={{
                background: on ? 'var(--liquid-pill-bg)' : 'var(--muted)',
                color: on ? 'var(--liquid-icon-active)' : 'var(--foreground)',
                border: on ? '1px solid var(--liquid-pill-border)' : '1px solid var(--border)',
                boxShadow: on ? 'var(--liquid-pill-shadow)' : undefined,
                backdropFilter: on ? 'blur(12px)' : undefined,
                WebkitBackdropFilter: on ? 'blur(12px)' : undefined,
                border: on ? undefined : '1px solid var(--border)',
              }}
            >
              {o.label}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.showPicker?.() ?? inputRef.current?.click()}
        className="w-full flex items-center gap-3 px-3.5 h-12 rounded-2xl text-left"
        style={{
          background: usingCustom ? 'var(--card)' : 'var(--muted)',
          border: usingCustom
            ? '1.5px solid color-mix(in oklab, var(--primary) 45%, var(--border))'
            : '1px solid var(--border)',
        }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: usingCustom
              ? 'color-mix(in oklab, var(--primary) 16%, transparent)'
              : 'var(--card)',
            border: '1px solid var(--border)',
          }}
        >
          <Calendar size={16} style={{ color: usingCustom ? 'var(--primary)' : 'var(--muted-foreground)' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p style={{ color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600 }}>
            {usingCustom ? 'Custom date' : 'Or pick a date'}
          </p>
          <p style={{ color: 'var(--foreground)', fontSize: 14, fontWeight: 650 }}>
            {usingCustom ? display : 'Choose calendar date'}
          </p>
        </div>
        {usingCustom && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onCustomDate('');
            }}
            style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600, padding: '4px 8px' }}
          >
            Clear
          </span>
        )}
        <input
          ref={inputRef}
          type="date"
          min={min}
          value={customDate}
          onChange={(e) => {
            if (e.target.value) onCustomDate(e.target.value);
          }}
          className="sr-only"
          aria-label="Pick expiry date"
        />
      </button>
    </div>
  );
}

function formatDisplay(iso: string) {
  try {
    return new Date(iso + 'T12:00:00').toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}
