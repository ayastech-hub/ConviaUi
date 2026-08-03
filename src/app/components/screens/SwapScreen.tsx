import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ArrowUpDown, ChevronDown, Info, CheckCircle2, Loader } from 'lucide-react';
import { cryptoAssets, type Screen } from '../../data/mockData';
import { AssetIcon } from './HomeScreen';
import { useCurrency } from '../../context/CurrencyContext';

interface SwapScreenProps {
  goBack: () => void;
}

export function SwapScreen({ goBack }: SwapScreenProps) {
  const { format } = useCurrency();
  const [fromAsset, setFromAsset] = useState(cryptoAssets.find(a => a.id === 'eth')!);
  const [toAsset, setToAsset] = useState(cryptoAssets.find(a => a.id === 'usdt')!);
  const [fromAmount, setFromAmount] = useState('');
  const [swapping, setSwapping] = useState(false);
  const [done, setDone] = useState(false);

  const toAmount = fromAmount
    ? ((Number(fromAmount) * fromAsset.price) / toAsset.price).toFixed(toAsset.symbol === 'USDT' || toAsset.symbol === 'USDC' ? 2 : 6)
    : '';

  const rate = fromAsset.price / toAsset.price;

  const flipAssets = () => {
    const tmp = fromAsset;
    setFromAsset(toAsset);
    setToAsset(tmp);
    setFromAmount('');
  };

  const handleSwap = () => {
    setSwapping(true);
    setTimeout(() => { setSwapping(false); setDone(true); }, 2000);
  };

  if (done) {
    return (
      <div className="flex flex-col h-full items-center justify-center px-5" style={{ background: 'var(--background)' }}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <div className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.15)' }}>
            <CheckCircle2 size={52} style={{ color: 'var(--primary)' }} />
          </div>
          <h2 style={{ color: 'var(--foreground)', fontWeight: 800, marginBottom: 8 }}>Swap Complete!</h2>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 14, marginBottom: 4 }}>
            {fromAmount} {fromAsset.symbol} → {toAmount} {toAsset.symbol}
          </p>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 40 }}>Best rate · Instant settlement</p>
          <motion.button whileTap={{ scale: 0.97 }} onClick={goBack} className="w-full py-3.5 rounded-[16px] text-white" style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 15 }}>
            Done
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />

      <div className="flex items-center gap-3 px-5 mb-6">
        <motion.button whileTap={{ scale: 0.9 }} onClick={goBack} className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'var(--muted)' }}>
          <ChevronLeft size={20} style={{ color: 'var(--foreground)' }} />
        </motion.button>
        <h2 style={{ color: 'var(--foreground)', fontWeight: 800 }}>Swap</h2>
        <div className="ml-auto flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: 'rgba(99,102,241,0.15)' }}>
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--primary)' }} />
          <span style={{ color: 'var(--primary)', fontSize: 11, fontWeight: 600 }}>Best Rate</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5">
        {/* From */}
        <div className="relative mb-2">
          <div className="rounded-[20px] p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="flex justify-between mb-2">
              <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>You pay</span>
              <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
                Balance: {fromAsset.balance.toFixed(4)} {fromAsset.symbol}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <motion.button whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-3 py-2 rounded-[12px] flex-shrink-0" style={{ background: 'var(--muted)' }}>
                <AssetIcon symbol={fromAsset.symbol} size={22} />
                <span style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>{fromAsset.symbol}</span>
                <ChevronDown size={13} style={{ color: 'var(--muted-foreground)' }} />
              </motion.button>
              <input
                type="number"
                placeholder="0.00"
                value={fromAmount}
                onChange={e => setFromAmount(e.target.value)}
                className="flex-1 bg-transparent outline-none text-right"
                style={{ color: 'var(--foreground)', fontSize: 24, fontWeight: 700 }}
              />
            </div>
            {fromAmount && (
              <p style={{ color: 'var(--muted-foreground)', fontSize: 12, textAlign: 'right', marginTop: 4 }}>
                ≈ {format(Number(fromAmount) * fromAsset.price)}
              </p>
            )}
          </div>

          {/* Flip button */}
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-5 z-10">
            <motion.button
              whileTap={{ scale: 0.9, rotate: 180 }}
              onClick={flipAssets}
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: 'var(--primary)',
                border: '3px solid var(--background)',
                boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
              }}
            >
              <ArrowUpDown size={16} className="text-white" />
            </motion.button>
          </div>
        </div>

        {/* To */}
        <div className="rounded-[20px] p-4 mb-4 mt-2" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="flex justify-between mb-2">
            <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>You receive</span>
            <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
              Balance: {toAsset.balance.toFixed(2)} {toAsset.symbol}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <motion.button whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-3 py-2 rounded-[12px] flex-shrink-0" style={{ background: 'var(--muted)' }}>
              <AssetIcon symbol={toAsset.symbol} size={22} />
              <span style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>{toAsset.symbol}</span>
              <ChevronDown size={13} style={{ color: 'var(--muted-foreground)' }} />
            </motion.button>
            <p className="flex-1 text-right" style={{ color: toAmount ? 'var(--foreground)' : 'var(--muted-foreground)', fontSize: 24, fontWeight: 700 }}>
              {toAmount || '0.00'}
            </p>
          </div>
          {toAmount && (
            <p style={{ color: 'var(--muted-foreground)', fontSize: 12, textAlign: 'right', marginTop: 4 }}>
              ≈ {format(Number(toAmount) * toAsset.price)}
            </p>
          )}
        </div>

        {/* Rate info */}
        {fromAmount && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-[16px] mb-4"
            style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
          >
            {[
              { label: 'Rate', value: `1 ${fromAsset.symbol} = ${rate > 1 ? rate.toFixed(2) : rate.toFixed(6)} ${toAsset.symbol}` },
              { label: 'Slippage', value: '0.5%' },
              { label: 'Network fee', value: `$${(Number(fromAmount) * fromAsset.price * 0.001).toFixed(4)}` },
              { label: 'Route', value: `${fromAsset.symbol} → ${toAsset.symbol}` },
            ].map(row => (
              <div key={row.label} className="flex justify-between py-1.5">
                <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>{row.label}</span>
                <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 500 }}>{row.value}</span>
              </div>
            ))}
          </motion.div>
        )}

        <div className="flex gap-2 mb-5">
          {['0.5%', '1%', '2%'].map(v => (
            <button key={v} className="px-3 py-1.5 rounded-xl" style={{ background: v === '0.5%' ? 'var(--primary)' : 'var(--muted)', color: v === '0.5%' ? '#FFF' : 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}>
              {v} slippage
            </button>
          ))}
          <div className="flex items-center gap-1 ml-1">
            <Info size={13} style={{ color: 'var(--muted-foreground)' }} />
            <span style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>Max slippage</span>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSwap}
          disabled={!fromAmount || swapping}
          className="w-full py-3.5 rounded-[16px] text-white flex items-center justify-center gap-2"
          style={{
            background: fromAmount ? 'linear-gradient(135deg, #3B82F6, #2563EB)' : 'var(--muted)',
            fontWeight: 700, fontSize: 15,
            boxShadow: fromAmount ? '0 8px 24px rgba(59,130,246,0.4)' : 'none',
          }}
        >
          {swapping && <Loader size={18} className="animate-spin" />}
          {swapping ? 'Swapping...' : fromAmount ? `Swap ${fromAsset.symbol} → ${toAsset.symbol}` : 'Enter Amount'}
        </motion.button>
      </div>
    </div>
  );
}
