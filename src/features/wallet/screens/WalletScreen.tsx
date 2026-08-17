import { useState } from 'react';
import type { Screen, Transaction } from '../../../shared/data/mockData';
import { TransactionReceipt } from '../../../shared/components/TransactionReceipt';
import { BalanceSummaryCard } from '../components/BalanceSummaryCard';
import { WalletQuickActions } from '../components/WalletQuickActions';
import { AssetsHistoryTabs } from '../components/AssetsHistoryTabs';
import { AssetsList } from '../components/AssetsList';
import { WalletHistoryList } from '../components/WalletHistoryList';
import { useWalletAssets } from '../../../shared/hooks/useWalletAssets';

interface WalletScreenProps {
  navigate: (s: Screen) => void;
}

/**
 * Wallet — shows all supported + canonical tokens (even at zero balance).
 * No chain filter: omnibus balances are per asset, not per chain.
 * Chain selection remains on Deposit / Receive / Withdraw only.
 */
export function WalletScreen({ navigate }: WalletScreenProps) {
  const [activeTab, setActiveTab] = useState<'assets' | 'history'>('assets');
  const [receiptTx, setReceiptTx] = useState<Transaction | null>(null);
  const { assets, loading, registrySource, portfolioSource } = useWalletAssets();

  const live = portfolioSource === 'live' || registrySource === 'live' || registrySource === 'seed';

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />

      <div className="px-5 mb-4">
        <h2 style={{ color: 'var(--foreground)', fontWeight: 800 }}>Wallet</h2>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
          {live
            ? 'All supported assets · balances from your ledger'
            : 'Sign in to load balances'}
        </p>
      </div>

      <BalanceSummaryCard />
      <WalletQuickActions onNavigate={navigate} />
      <AssetsHistoryTabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'assets' ? (
        <AssetsList
          assets={assets}
          loading={loading}
          emptyMessage="No assets in catalog yet"
        />
      ) : (
        <WalletHistoryList onSelectTransaction={setReceiptTx} />
      )}

      <div style={{ height: 100 }} />

      <TransactionReceipt tx={receiptTx} open={!!receiptTx} onClose={() => setReceiptTx(null)} />
    </div>
  );
}
