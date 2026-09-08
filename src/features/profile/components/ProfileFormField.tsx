import type { ReactNode } from 'react';

interface ProfileFormFieldProps {
  label: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  hint?: string;
  trailing?: ReactNode;
  borderColor?: string;
  readOnly?: boolean;
  disabled?: boolean;
  multiline?: boolean;
  maxLength?: number;
}

/** Labeled input used on Edit Profile. */
export function ProfileFormField({
  label,
  icon: Icon,
  value,
  onChange,
  type = 'text',
  placeholder,
  hint,
  trailing,
  borderColor,
  readOnly,
  disabled,
  multiline,
  maxLength,
}: ProfileFormFieldProps) {
  const locked = readOnly || disabled;
  return (
    <div>
      <label style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600, marginBottom: 8, display: 'block' }}>
        {label}
      </label>
      <div
        className={`flex gap-3 p-3.5 rounded-[14px] ${multiline ? 'items-start' : 'items-center'}`}
        style={{
          background: locked ? 'var(--muted)' : 'var(--card)',
          border: `1px solid ${borderColor ?? 'var(--border)'}`,
        }}
      >
        <Icon size={18} style={{ color: 'var(--muted-foreground)', marginTop: multiline ? 2 : 0, flexShrink: 0 }} />
        {multiline ? (
          <textarea
            value={value}
            readOnly={locked}
            maxLength={maxLength}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={3}
            className="flex-1 bg-transparent outline-none resize-none"
            style={{ color: 'var(--foreground)', fontSize: 15, fontWeight: 500, lineHeight: 1.45 }}
          />
        ) : (
          <input
            type={type}
            value={value}
            readOnly={locked}
            maxLength={maxLength}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-transparent outline-none"
            style={{ color: 'var(--foreground)', fontSize: 15, fontWeight: 500 }}
          />
        )}
        {trailing}
      </div>
      {hint && (
        <p style={{ color: 'var(--muted-foreground)', fontSize: 11, marginTop: 6, marginLeft: 4 }}>{hint}</p>
      )}
    </div>
  );
}
