import { useState, type CSSProperties } from 'react';

/**
 * Fiat / display-currency marks — same CDN philosophy as AssetIcon (external official art).
 * Flags: flagcdn.com (widely used, crisp SVG/PNG). Falls back to code initials.
 */
type Props = { code: string; size?: number; className?: string; style?: CSSProperties };

/** ISO currency → ISO country for flag */
const CURRENCY_COUNTRY: Record<string, string> = {
  USD: 'us',
  NGN: 'ng',
  GHS: 'gh',
  KES: 'ke',
  ZAR: 'za',
  UGX: 'ug',
  TZS: 'tz',
  EGP: 'eg',
  GBP: 'gb',
  EUR: 'eu',
  CAD: 'ca',
  AUD: 'au',
  CHF: 'ch',
  JPY: 'jp',
  CNY: 'cn',
  INR: 'in',
  XOF: 'sn',
  XAF: 'cm',
};

export function CurrencyIcon({ code, size = 40, className, style }: Props) {
  const [failed, setFailed] = useState(false);
  const c = (code || '').toUpperCase();
  const country = CURRENCY_COUNTRY[c];
  // flagcdn w40 / w80 retina
  const src = country
    ? `https://flagcdn.com/w80/${country}.png`
    : null;

  if (!src || failed) {
    return (
      <span
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--muted)',
          color: 'var(--foreground)',
          fontSize: size * 0.32,
          fontWeight: 700,
          flexShrink: 0,
          ...style,
        }}
      >
        {c.slice(0, 2)}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className={className}
      onError={() => setFailed(true)}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        objectFit: 'cover',
        flexShrink: 0,
        background: 'var(--muted)',
        ...style,
      }}
    />
  );
}
