interface PriceChartProps {
  series: number[];
  up: boolean;
  height?: number;
}

/** Lightweight SVG area chart — no extra chart library. */
export function PriceChart({ series, up, height = 160 }: PriceChartProps) {
  if (!series.length) {
    return (
      <div
        className="flex items-center justify-center rounded-[20px]"
        style={{ height, background: 'var(--muted)', border: '1px solid var(--border)' }}
      >
        <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>No chart data</span>
      </div>
    );
  }

  const w = 360;
  const h = height;
  const padX = 4;
  const padY = 10;
  const min = Math.min(...series);
  const max = Math.max(...series);
  const span = max - min || 1;
  const pts = series.map((v, i) => {
    const x = padX + (i / Math.max(series.length - 1, 1)) * (w - padX * 2);
    const y = padY + (1 - (v - min) / span) * (h - padY * 2);
    return `${x},${y}`;
  });
  const line = pts.join(' ');
  const area = `${padX},${h} ${line} ${w - padX},${h}`;
  const stroke = up ? 'var(--positive, #22c55e)' : 'var(--destructive)';
  const fillId = up ? 'chartUp' : 'chartDown';

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-full"
      style={{ height, display: 'block' }}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.22" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${fillId})`} />
      <polyline
        points={line}
        fill="none"
        stroke={stroke}
        strokeWidth="2.2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
