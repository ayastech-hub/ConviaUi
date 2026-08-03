import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronDown, AlertCircle, CheckCircle2, Loader, ChevronRight, Search } from 'lucide-react';
import { cryptoAssets, type Screen } from '../../data/mockData';
import { AssetIcon } from './HomeScreen';
import { useCurrency } from '../../context/CurrencyContext';

interface WithdrawScreenProps {
  goBack: () => void;
}

export function WithdrawScreen({ goBack }: WithdrawScreenProps) {
  const { format } = useCurrency();
  const [selectedAsset, setSelectedAsset] = useState<typeof cryptoAssets[0] | null>(null);
  const [selectedChain, setSelectedChain] = useState('');
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [search, setSearch] = useState('');

  const filteredAssets = cryptoAssets.filter(a =>
    a.symbol.toLowerCase().includes(search.toLowerCase()) || a.name.toLowerCase().includes(search.toLowerCase())
  );

  const fee = selectedAsset?.symbol === 'BTC' ? 0.00005 : selectedAsset?.symbol === 'ETH' ? 0.002 : 1.0;
  const feeUSD = selectedAsset ? fee * selectedAsset.price : 0;

  const handleSelectAsset = (asset: typeof cryptoAssets[0]) => {
    setSelectedAsset(asset);
    setSelectedChain(asset.chains[0]);
  };

  const handleWithdraw = () => {
    setSending(true);
    setTimeout(() => { setSending(false); setDone(true); }, 2500);
  };

  if (done && selectedAsset) {
    return (
      <div className="flex flex-col h-full items-center justify-center px-5" style={{ background: 'var(--background)' }}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center w-full">
          <div className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.15)' }}>
            <CheckCircle2 size={52} style={{ color: 'var(--primary)' }} />
          </div>
          <h2 style={{ color: 'var(--foreground)', fontWeight: 800, marginBottom: 8 }}>Withdrawal Submitted!</h2>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 14, marginBottom: 4 }}>{amount} {selectedAsset.symbol} sent to</p>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontFamily: 'monospace', marginBottom: 40 }}>{address.slice(0, 16)}...{address.slice(-8)}</p>
          <motion.button whileTap={{ scale: 0.97 }} onClick={goBack} className="w-full py-3.5 rounded-[16px] text-white" style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 15 }}>
            Done
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (selectedAsset) {
    return (
      <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
        <div style={{ height: 50 }} />
        <div className="flex items-center gap-3 px-5 mb-6">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setSelectedAsset(null)} className="w-10 h-10 rounded-2xl flex items-center justify-center glass-card" style={{ border: '1px solid var(--border)' }}>
            <ChevronLeft size={20} style={{ color: 'var(--foreground)' }} />
          </motion.button>
          <h2 style={{ color: 'var(--foreground)', fontWeight: 800 }}>Withdraw {selectedAsset.symbol}</h2>
        </div>

        <div className="flex-1 overflow-y-auto px-5">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-[12px] mb-4" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
            <AssetIcon symbol={selectedAsset.symbol} size={24} />
            <span style={{ color: 'var(--foreground)', fontSize: 13, flex: 1 }}>Available: {selectedAsset.balance.toFixed(4)} {selectedAsset.symbol}</span>
            <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{format(selectedAsset.valueUSD)}</span>
          </div>

          <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 6 }}>Network</p>
          <div className="flex gap-2 flex-wrap mb-4">
            {selectedAsset.chains.map(chain => (
              <motion.button
                key={chain}
                whileTap={{ scale: 0.93 }}
                onClick={() => setSelectedChain(chain)}
                className="px-3 py-2 rounded-[12px]"
                style={{
                  background: selectedChain === chain ? 'var(--primary)' : 'var(--muted)',
                  color: selectedChain === chain ? '#FFF' : 'var(--foreground)',
                  fontSize: 13, fontWeight: 600,
                  border: `1px solid ${selectedChain === chain ? 'transparent' : 'var(--border)'}`,
                }}
              >
                {chain}
              </motion.button>
            ))}
          </div>

          <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 6 }}>Destination Address</p>
          <div className="px-4 py-3 rounded-[14px] mb-4 glass-card" style={{ border: '1px solid var(--border)' }}>
            <input
              placeholder={`Paste ${selectedChain} address or ENS...`}
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full bg-transparent outline-none"
              style={{ color: 'var(--foreground)', fontSize: 13 }}
            />
          </div>

          <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 6 }}>Amount</p>
          <div className="rounded-[14px] p-4 mb-4 glass-card" style={{ border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3">
              <AssetIcon symbol={selectedAsset.symbol} size={28} />
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="flex-1 bg-transparent outline-none"
                style={{ color: 'var(--foreground)', fontSize: 24, fontWeight: 800 }}
              />
              <button onClick={() => setAmount(selectedAsset.balance.toFixed(4))} className="px-3 py-1 rounded-lg" style={{ background: 'var(--primary)', color: '#FFF', fontSize: 12, fontWeight: 700 }}>
                MAX
              </button>
            </div>
            {amount && <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginTop: 4 }}>≈ {format(Number(amount) * selectedAsset.price)}</p>}
          </div>

          {amount && address && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-[14px] mb-4" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
              {[
                { label: 'Amount', value: `${amount} ${selectedAsset.symbol}` },
                { label: 'Network fee', value: `${fee} ${selectedAsset.symbol} (~${format(feeUSD)})` },
                { label: 'Total', value: `${(Number(amount) + fee).toFixed(6)} ${selectedAsset.symbol}`, bold: true },
              ].map(row => (
                <div key={row.label} className="flex justify-between py-1.5">
                  <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>{row.label}</span>
                  <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: row.bold ? 700 : 500 }}>{row.value}</span>
                </div>
              ))}
            </motion.div>
          )}

          <div className="flex items-start gap-2 p-3 rounded-[12px] mb-4" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
            <AlertCircle size={14} style={{ color: '#EF4444', flexShrink: 0, marginTop: 1 }} />
            <p style={{ color: 'var(--muted-foreground)', fontSize: 12, lineHeight: 1.5 }}>
              Double-check the address. Withdrawals cannot be reversed once submitted.
            </p>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleWithdraw}
            disabled={!amount || !address || sending}
            className="w-full py-3.5 rounded-[16px] text-white flex items-center justify-center gap-2"
            style={{
              background: amount && address ? 'var(--primary)' : 'var(--muted)',
              fontWeight: 700, fontSize: 15,
              boxShadow: amount && address ? '0 8px 24px rgba(99,102,241,0.4)' : 'none',
            }}
          >
            {sending && <Loader size={18} className="animate-spin" />}
            {sending ? 'Processing...' : 'Withdraw'}
          </motion.button>

          <div style={{ height: 32 }} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />
      <div className="flex items-center gap-3 px-5 mb-6">
        <motion.button whileTap={{ scale: 0.9 }} onClick={goBack} className="w-10 h-10 rounded-2xl flex items-center justify-center glass-card" style={{ border: '1px solid var(--border)' }}>
          <ChevronLeft size={20} style={{ color: 'var(--foreground)' }} />
        </motion.button>
        <h2 style={{ color: 'var(--foreground)', fontWeight: 800 }}>Withdraw</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-5">
        <div className="flex items-center gap-2 px-4 py-3 rounded-[14px] mb-4 glass-card" style={{ border: '1px solid var(--border)' }}>
          <Search size={16} style={{ color: 'var(--muted-foreground)' }} />
          <input
            placeholder="Search token..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none"
            style={{ color: 'var(--foreground)', fontSize: 14 }}
          />
        </div>

        <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 10 }}>Select token to withdraw</p>

        <div className="rounded-[20px] overflow-hidden glass-card" style={{ border: '1px solid var(--border)' }}>
          {filteredAssets.map((asset, i) => (
            <motion.button
              key={asset.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelectAsset(asset)}
              className="flex items-center gap-3 px-4 py-3.5 w-full"
              style={{ borderBottom: i < filteredAssets.length - 1 ? '1px solid var(--border)' : 'none' }}
            >
              <AssetIcon symbol={asset.symbol} size={36} />
              <div className="flex-1 text-left">
                <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>{asset.symbol}</p>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{asset.name}</p>
              </div>
              <div className="text-right">
                <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>{asset.balance.toFixed(4)}</p>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{format(asset.valueUSD)}</p>
              </div>
              <ChevronRight size={16} style={{ color: 'var(--muted-foreground)' }} />
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
