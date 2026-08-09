import type { ReactNode } from 'react';

interface ProfileFormFieldProps {
  label: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  hint?: string;
  /** Custom trailing element inside the input row, e.g. a "Verified" badge or availability check. */
  trailing?: ReactNode;
  borderColor?: string;
}

/** A single labeled input row (icon + text field + optional trailing badge) used on the Edit Profile form. */
export function ProfileFormField({
  label, icon: Icon, value, onChange, type = 'text', placeholder, hint, trailing, borderColor,
}: ProfileFormFieldProps) {
  return (
    <div>
      <label style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600, marginBottom: 8, display: 'block' }}>
        {label}
      </label>
      <div
        className="flex items-center gap-3 p-3.5 rounded-[14px]"
        style={{ background: 'var(--card)', border: `1px solid ${borderColor ?? 'var(--border)'}` }}
      >
        <Icon size={18} style={{ color: 'var(--muted-foreground)' }} />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none"
          style={{ color: 'var(--foreground)', fontSize: 15, fontWeight: 500 }}
        />
        {trailing}
      </div>
      {hint && <p style={{ color: 'var(--muted-foreground)', fontSize: 11, marginTop: 6, marginLeft: 4 }}>{hint}</p>}
    </div>
  );
}
