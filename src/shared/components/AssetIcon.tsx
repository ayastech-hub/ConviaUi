interface AssetIconProps {
  symbol: string;
  size?: number;
}

/**
 * Generic fallback avatar for a crypto asset, rendered as the asset's
 * first letter inside a circular badge. Used across wallet, trade and
 * home screens wherever a dedicated asset logo isn't available.
 */
export function AssetIcon({ symbol, size = 40 }: AssetIconProps) {
  return (
    <div
      className="rounded-full flex items-center justify-center"
      style={{ width: size, height: size, background: 'var(--muted)', flexShrink: 0, border: '1px solid var(--border)' }}
    >
      <span style={{ color: 'var(--foreground)', fontSize: size * 0.3, fontWeight: 800 }}>
        {symbol.charAt(0)}
      </span>
    </div>
  );
}
