/**
 * Compact display for crypto / fiat amounts in lists and receipts.
 * Trims trailing zeros; uses max significant fraction digits.
 */
export function formatTokenAmount(
  value: number | string | null | undefined,
  opts?: { maxFrac?: number; minFrac?: number },
): string {
  const n = typeof value === 'string' ? Number(value) : Number(value);
  if (!Number.isFinite(n)) return '0';
  const abs = Math.abs(n);
  const maxFrac = opts?.maxFrac ?? (abs === 0 ? 2 : abs >= 1000 ? 2 : abs >= 1 ? 4 : abs >= 0.0001 ? 6 : 8);
  const minFrac = opts?.minFrac ?? 0;

  // Compact large figures: 12.4K / 1.2M
  if (abs >= 1_000_000) {
    return `${(n / 1_000_000).toLocaleString('en', { maximumFractionDigits: 2 })}M`;
  }
  if (abs >= 100_000) {
    return `${(n / 1_000).toLocaleString('en', { maximumFractionDigits: 1 })}K`;
  }

  return n.toLocaleString('en', {
    minimumFractionDigits: minFrac,
    maximumFractionDigits: maxFrac,
  });
}

/** Fiat / USD-style: 2 decimals, compact at large sizes. */
export function formatMoneyAmount(
  value: number | string | null | undefined,
  opts?: { maxFrac?: number },
): string {
  const n = typeof value === 'string' ? Number(value) : Number(value);
  if (!Number.isFinite(n)) return '0.00';
  const abs = Math.abs(n);
  if (abs >= 1_000_000) {
    return `${(n / 1_000_000).toLocaleString('en', { maximumFractionDigits: 2 })}M`;
  }
  if (abs >= 100_000) {
    return `${(n / 1_000).toLocaleString('en', { maximumFractionDigits: 1 })}K`;
  }
  return n.toLocaleString('en', {
    minimumFractionDigits: 2,
    maximumFractionDigits: opts?.maxFrac ?? 2,
  });
}

/** Signed token line e.g. "+0.0394 ETH" */
export function formatSignedToken(
  amount: number | string | null | undefined,
  asset: string,
  sign: string = '',
): string {
  return `${sign}${formatTokenAmount(amount)} ${asset}`.trim();
}
