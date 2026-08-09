import { useState } from 'react';
import { cryptoAssets, type Screen, type Transaction } from '../../../shared/data/mockData';
import { TransactionReceipt } from '../../../shared/components/TransactionReceipt';
import { BalanceSummaryCard } from '../components/BalanceSummaryCard';
import { WalletQuickActions } from '../components/WalletQuickActions';
import { ChainFilter } from '../components/ChainFilter';
import { AssetsHistoryTabs } from '../components/AssetsHistoryTabs';
import { AssetsList } from '../components/AssetsList';
import { WalletHistoryList } from '../components/WalletHistoryList';

interface WalletScreenProps {
  navigate: (s: Screen) => void;
}

export function WalletScreen({ navigate }: WalletScreenProps) {
  const [activeChain, setActiveChain] = useState('All');
  const [activeTab, setActiveTab] = useState<'assets' | 'history'>('assets');
  const [receiptTx, setReceiptTx] = useState<Transaction | null>(null);

  const filteredAssets = activeChain === 'All'
    ? cryptoAssets
    : cryptoAssets.filter((a) => a.chains.includes(activeChain));

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />

      <div className="px-5 mb-4">
        <h2 style={{ color: 'var(--foreground)', fontWeight: 800 }}>Wallet</h2>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Manage your digital assets</p>
      </div>

      <BalanceSummaryCard />
      <WalletQuickActions onNavigate={navigate} />
      <ChainFilter activeChain={activeChain} onSelect={setActiveChain} />
      <AssetsHistoryTabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'assets' ? (
        <AssetsList assets={filteredAssets} />
      ) : (
        <WalletHistoryList onSelectTransaction={setReceiptTx} />
      )}

      <div style={{ height: 100 }} />

      <TransactionReceipt tx={receiptTx} open={!!receiptTx} onClose={() => setReceiptTx(null)} />
    </div>
  );
}
