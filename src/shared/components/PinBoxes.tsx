import { useEffect, useRef, type KeyboardEvent } from 'react';

interface PinBoxesProps {
  length?: number;
  value: string[];
  onChange: (next: string[]) => void;
  error?: string;
  autoFocus?: boolean;
}

/**
 * Continuous PIN entry — type digits without tapping each box.
 * Supports paste of full code and backspace across cells.
 */
export function PinBoxes({ length = 4, value, onChange, error, autoFocus = true }: PinBoxesProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const pin = Array.from({ length }, (_, i) => value[i] || '');

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus();
  }, [autoFocus]);

  const setAt = (index: number, digit: string) => {
    const next = [...pin];
    next[index] = digit;
    onChange(next);
  };

  const handleChange = (index: number, raw: string) => {
    const digits = raw.replace(/\D/g, '');
    if (!digits) {
      setAt(index, '');
      return;
    }
    // Paste or multi-digit: fill from this index
    if (digits.length > 1) {
      const next = [...pin];
      for (let i = 0; i < digits.length && index + i < length; i++) {
        next[index + i] = digits[i];
      }
      onChange(next);
      const focusIdx = Math.min(index + digits.length, length - 1);
      refs.current[focusIdx]?.focus();
      return;
    }
    setAt(index, digits.slice(-1));
    if (index < length - 1) refs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (pin[index]) {
        setAt(index, '');
      } else if (index > 0) {
        setAt(index - 1, '');
        refs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      refs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      refs.current[index + 1]?.focus();
    }
  };

  return (
    <div>
      <div className="flex gap-2.5 justify-center">
        {pin.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="password"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={length}
            value={d}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onFocus={(e) => e.target.select()}
            className="w-12 h-14 rounded-2xl text-center tabular-nums"
            style={{
              background: 'var(--card)',
              border: `1.5px solid ${error ? 'var(--destructive)' : d ? 'var(--foreground)' : 'var(--border)'}`,
              color: 'var(--foreground)',
              fontSize: 22,
              fontWeight: 700,
              outline: 'none',
            }}
          />
        ))}
      </div>
      {error ? (
        <p className="text-center mt-3" style={{ color: 'var(--destructive)', fontSize: 13 }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
