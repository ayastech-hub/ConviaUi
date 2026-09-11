import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Check, Loader } from 'lucide-react';
import { AssetIcon } from './AssetIcon';
import { useWalletAssets } from '../hooks/useWalletAssets';
import { useCurrency } from '../context/CurrencyContext';
import { buildClientQuote, fiatPerAsset, formatCrypto } from '../payments/localPaymentQuote';
import * as localPayApi from '../api/localPayments';

type Props = {
  fiatAmount: number;
  fiatCurrency: string;
  purpose: string;
  purposeRef?: string;
  onPaid: (info: { paymentId?: string; legs: { asset: string; cryptoAmount: string }[] }) => void;
  onCancel: () => void;
};

const PREFERRED = ['USDT', 'USDC', 'ETH', 'BTC'];

export function LocalPaymentSheet({
  fiatAmount,
  fiatCurrency,
  purpose,
  purposeRef,
  onPaid,
  onCancel,
}: Props) {
  const { assets } = useWalletAssets();
  const { currency } = useCurrency();
  const symbol = currency.code === fiatCurrency ? currency.symbol : fiatCurrency === 'NGN' ? '₦' : fiatCurrency;

  const balances = useMemo(() => {
    const m: Record<string, number> = {};
    for (const a of assets) m[a.symbol.toUpperCase()] = Number(a.balance) || 0;
    return m;
  }, [assets]);

  const options = useMemo(() => {
    const syms = new Set([...PREFERRED, ...assets.map((a) => a.symbol.toUpperCase())]);
    return [...syms];
  }, [assets]);

  const [primary, setPrimary] = useState(() => options.find((s) => (balances[s] ?? 0) > 0) || 'USDT');
  const [fallbacks, setFallbacks] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const preview = useMemo(
    () =>
      buildClientQuote({
        fiatAmount,
        fiatCurrency,
        primaryAsset: primary,
        fallbackAssets: fallbacks,
        balances,
      }),
    [fiatAmount, fiatCurrency, primary, fallbacks, balances],
  );

  const toggleFallback = (asset: string) => {
    if (asset === primary) return;
    setFallbacks((prev) => (prev.includes(asset) ? prev.filter((x) => x !== asset) : [...prev, asset]));
  };

  const confirm = async () => {
    setError('');
    if (preview.shortfallFiat > 0.01) {
      setError(`Need ${symbol}${preview.shortfallFiat.toFixed(2)} more — enable a fallback or top up.`);
      return;
    }
    setBusy(true);
    try {
      const balStr: Record<string, string> = {};
      for (const [k, v] of Object.entries(balances)) balStr[k] = String(v);

      const quote = await localPayApi.quoteLocalPayment({
        fiatAmount: String(fiatAmount),
        fiatCurrency,
        purpose,
        purposeRef,
        primaryAsset: primary,
        fallbackAssets: fallbacks,
        balances: balStr,
      });

      const result = await localPayApi.settleLocalPayment({
        quoteId: quote.quoteId,
        confirmFiatAmount: quote.fiatAmount,
        confirmFiatCurrency: quote.fiatCurrency,
      });

      onPaid({
        paymentId: result.paymentId,
        legs: result.legs.map((l) => ({ asset: l.asset, cryptoAmount: l.cryptoAmount })),
      });
    } catch {
      if (preview.shortfallFiat <= 0.01 && preview.legs.length) {
        onPaid({
          legs: preview.legs.map((l) => ({
            asset: l.asset,
            cryptoAmount: String(l.cryptoAmount),
          })),
        });
      } else {
        setError('Payment failed. Try again.');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[440px] rounded-t-[28px] px-5 pt-4 pb-8 max-h-[90vh] overflow-y-auto"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: 'var(--muted)' }} />

        <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 700, letterSpacing: 0.4 }}>
          PAY
        </p>
        <p
          className="tabular-nums"
          style={{ color: 'var(--foreground)', fontSize: 32, fontWeight: 800, letterSpacing: '-0.04em' }}
        >
          {symbol}
          {fiatAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </p>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginTop: 4 }}>
          {purpose.replace(/_/g, ' ')}
          {purposeRef ? ` · ${purposeRef}` : ''}
        </p>

        <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 700, marginTop: 20, marginBottom: 8 }}>
          PRIMARY TOKEN
        </p>
        <div className="flex flex-col gap-2">
          {options.map((asset) => {
            const rate = fiatPerAsset(asset, fiatCurrency);
            const bal = balances[asset] ?? 0;
            const fiatBal = bal * rate;
            const on = primary === asset;
            return (
              <button
                key={asset}
                type="button"
                onClick={() => {
                  setPrimary(asset);
                  setFallbacks((f) => f.filter((x) => x !== asset));
                }}
                className="flex items-center gap-3 px-3 py-3 rounded-2xl text-left"
                style={{
                  background: on ? 'var(--liquid-chip-on-bg)' : 'var(--muted)',
                  border: on ? '1px solid var(--liquid-chip-on-border)' : '1px solid transparent',
                }}
              >
                <AssetIcon symbol={asset} size={32} />
                <div className="flex-1 min-w-0">
                  <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>{asset}</p>
                  <p className="tabular-nums" style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
                    {symbol}
                    {fiatBal.toFixed(2)} available
                  </p>
                </div>
                {on && <Check size={16} style={{ color: 'var(--primary)' }} />}
              </button>
            );
          })}
        </div>

        <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 700, marginTop: 18, marginBottom: 8 }}>
          FALLBACK (OPTIONAL)
        </p>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 8, lineHeight: 1.4 }}>
          Only used if primary is short — never spent without your check.
        </p>
        <div className="flex flex-wrap gap-2">
          {options
            .filter((a) => a !== primary)
            .map((asset) => {
              const on = fallbacks.includes(asset);
              return (
                <button
                  key={asset}
                  type="button"
                  onClick={() => toggleFallback(asset)}
                  className="h-9 px-3 rounded-full text-[12px] font-bold"
                  style={{
                    background: on ? 'var(--liquid-chip-on-bg)' : 'var(--muted)',
                    color: on ? 'var(--liquid-chip-on-text)' : 'var(--muted-foreground)',
                    border: on ? '1px solid var(--liquid-chip-on-border)' : '1px solid transparent',
                  }}
                >
                  {on ? '✓ ' : ''}
                  {asset}
                </button>
              );
            })}
        </div>

        {preview.legs.length > 0 && (
          <div
            className="mt-4 rounded-2xl px-3 py-3"
            style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
          >
            {preview.legs.map((l) => (
              <div key={l.asset + l.role} className="flex justify-between py-1 text-[13px]">
                <span style={{ color: 'var(--muted-foreground)' }}>
                  {l.role === 'primary' ? 'Primary' : 'Fallback'} · {l.asset}
                </span>
                <span className="tabular-nums" style={{ color: 'var(--foreground)', fontWeight: 650 }}>
                  {formatCrypto(l.cryptoAmount, l.asset)}
                </span>
              </div>
            ))}
            {preview.shortfallFiat > 0.01 && (
              <p style={{ color: 'var(--destructive)', fontSize: 12, marginTop: 6, fontWeight: 650 }}>
                Short by {symbol}
                {preview.shortfallFiat.toFixed(2)}
              </p>
            )}
          </div>
        )}

        {error && (
          <p style={{ color: 'var(--destructive)', fontSize: 13, marginTop: 10, fontWeight: 600 }}>{error}</p>
        )}

        <div className="flex gap-2 mt-5">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 h-12 rounded-full font-bold text-[14px]"
            style={{ background: 'var(--muted)', color: 'var(--foreground)' }}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy || preview.shortfallFiat > 0.01}
            onClick={() => void confirm()}
            className="flex-[1.4] h-12 rounded-full font-bold text-[14px] flex items-center justify-center gap-2"
            style={{
              background: 'var(--primary)',
              color: 'var(--primary-foreground)',
              opacity: busy || preview.shortfallFiat > 0.01 ? 0.55 : 1,
            }}
          >
            {busy && <Loader size={16} className="animate-spin" />}
            Confirm {symbol}
            {fiatAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
