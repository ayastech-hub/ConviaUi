import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Copy, CheckCircle2, ChevronRight, Search } from 'lucide-react';
import { cryptoAssets, type Screen } from '../../data/mockData';
import { AssetIcon } from './HomeScreen';
import { useCurrency } from '../../context/CurrencyContext';

interface DepositScreenProps {
  goBack: () => void;
}

export function DepositScreen({ goBack }: DepositScreenProps) {
  const { format } = useCurrency();
  const [selectedAsset, setSelectedAsset] = useState<typeof cryptoAssets[0] | null>(null);
  const [selectedChain, setSelectedChain] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState('');

  const filteredAssets = cryptoAssets.filter(a =>
    a.symbol.toLowerCase().includes(search.toLowerCase()) || a.name.toLowerCase().includes(search.toLowerCase())
  );

  const address = '0x4f3a8b2c1d9e7f5a3b8c2d9e7f5a3b8c2d9e7B2E';

  const handleSelectAsset = (asset: typeof cryptoAssets[0]) => {
    setSelectedAsset(asset);
    setSelectedChain(asset.chains[0]);
  };

  if (selectedAsset) {
    return (
      <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
        <div style={{ height: 50 }} />
        <div className="flex items-center gap-3 px-5 mb-6">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setSelectedAsset(null)} className="w-10 h-10 rounded-2xl flex items-center justify-center glass-card" style={{ border: '1px solid var(--border)' }}>
            <ChevronLeft size={20} style={{ color: 'var(--foreground)' }} />
          </motion.button>
          <h2 style={{ color: 'var(--foreground)', fontWeight: 800 }}>Deposit {selectedAsset.symbol}</h2>
        </div>

        <div className="flex-1 overflow-y-auto px-5">
          <div className="rounded-[20px] p-5 mb-5 glass-card" style={{ border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2 mb-4">
              <AssetIcon symbol={selectedAsset.symbol} size={28} />
              <div>
                <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>Deposit {selectedAsset.symbol}</p>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{selectedChain} Network</p>
              </div>
            </div>

            <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 6 }}>Select Network</p>
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

            <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 6 }}>Deposit Address</p>
            <div className="flex items-center gap-2 p-3 rounded-[12px] mb-3" style={{ background: 'var(--muted)' }}>
              <span style={{ color: 'var(--foreground)', fontSize: 11, fontFamily: 'monospace', flex: 1, wordBreak: 'break-all', lineHeight: 1.4 }}>
                {address}
              </span>
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
                {copied ? <CheckCircle2 size={16} style={{ color: 'var(--primary)' }} /> : <Copy size={16} style={{ color: 'var(--muted-foreground)' }} />}
              </motion.button>
            </div>

            <div className="px-3 py-2.5 rounded-[12px]" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <p style={{ color: '#F59E0B', fontSize: 12, lineHeight: 1.5 }}>
                Only deposit {selectedAsset.symbol} ({selectedChain}) to this address. Minimum deposit: {format(10)}.
              </p>
            </div>
          </div>

          <div className="rounded-[16px] p-4 glass-card" style={{ border: '1px solid var(--border)' }}>
            <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14, marginBottom: 12 }}>How deposits work</p>
            {[
              { step: '1', label: 'Send to address above', desc: 'Copy and use the address from your external wallet' },
              { step: '2', label: 'Network confirmation', desc: `Usually 1-6 confirmations (5-20 min)` },
              { step: '3', label: 'Credited to wallet', desc: 'Balance updates instantly after confirmation' },
            ].map(s => (
              <div key={s.step} className="flex gap-3 mb-4">
                <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-white" style={{ background: 'var(--primary)', fontSize: 11, fontWeight: 700 }}>
                  {s.step}
                </div>
                <div>
                  <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13 }}>{s.label}</p>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
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
        <h2 style={{ color: 'var(--foreground)', fontWeight: 800 }}>Deposit</h2>
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

        <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 10 }}>Select token to deposit</p>

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
