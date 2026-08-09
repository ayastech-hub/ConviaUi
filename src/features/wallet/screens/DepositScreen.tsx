import { useState, useMemo, useCallback } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import { cryptoAssets, type Asset } from '../../../shared/data/mockData';
import { NETWORKS, generateAddress } from '../components/deposit/types';
import { AssetDropdown } from '../components/deposit/AssetDropdown';
import { NetworkDropdown } from '../components/deposit/NetworkDropdown';
import { TokenSelectionList } from '../components/deposit/TokenSelectionList';
import { DepositSelectors } from '../components/deposit/DepositSelectors';
import { DepositAddressCard } from '../components/deposit/DepositAddressCard';
import { DepositInfoAndHistory } from '../components/deposit/DepositInfoAndHistory';
import { WalletFeatureBanner } from '../../../shared/components/WalletFeatureBanner';
import { FeatureAlert, mapApiCodeToReason } from '../../../shared/components/FeatureAlert';

interface DepositScreenProps {
  goBack: () => void;
}

export function DepositScreen({ goBack }: DepositScreenProps) {
  const [asset, setAsset] = useState<Asset | null>(null);
  const [network, setNetwork] = useState<string>('');
  const [assetOpen, setAssetOpen] = useState(false);
  const [networkOpen, setNetworkOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const address = useMemo(() => (asset ? generateAddress(asset, network || asset.chains[0]) : ''), [asset, network]);
  const netInfo = NETWORKS[network];

  const handleAssetSelect = useCallback((a: Asset) => {
    setAsset(a);
    setNetwork(a.chains[0]);
  }, []);

  const handleCopy = useCallback(() => {
    if (!address) return;
    try { navigator.clipboard?.writeText(address); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [address]);

  const handleShare = useCallback(() => {
    if (!address || !asset) return;
    setShared(true);
    try { navigator.share?.({ title: `Convia ${asset.symbol} address`, text: address }); } catch {}
    setTimeout(() => setShared(false), 2000);
  }, [address, asset]);

  if (!asset) {
    return <TokenSelectionList assets={cryptoAssets} goBack={goBack} onSelect={handleAssetSelect} />;
  }

  return (
    <div className="flex flex-col h-full relative" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />
      <div className="px-5 pt-2"><WalletFeatureBanner feature="deposit" /></div>

      <div className="flex items-center gap-3 px-5 mb-5">
        <motion.button whileTap={{ scale: 0.9 }} onClick={goBack} aria-label="Go back" className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
          <ChevronLeft size={20} style={{ color: 'var(--foreground)' }} />
        </motion.button>
        <div>
          <h2 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 20, lineHeight: 1.1 }}>Deposit</h2>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Receive crypto into your Convia wallet</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => setAsset(null)} className="flex items-center gap-2 mb-4">
          <ChevronLeft size={16} style={{ color: 'var(--muted-foreground)' }} />
          <span style={{ color: 'var(--muted-foreground)', fontSize: 13, fontWeight: 500 }}>Change token</span>
        </motion.button>

        <DepositSelectors
          asset={asset} network={network} netInfo={netInfo}
          onOpenAsset={() => setAssetOpen(true)} onOpenNetwork={() => setNetworkOpen(true)}
        />

        <DepositAddressCard
          asset={asset} network={network} netInfo={netInfo} address={address}
          copied={copied} shared={shared} onCopy={handleCopy} onShare={handleShare}
        />

        <DepositInfoAndHistory asset={asset} netInfo={netInfo} />
      </div>

      <AssetDropdown open={assetOpen} assets={cryptoAssets} selected={asset} onSelect={handleAssetSelect} onClose={() => setAssetOpen(false)} />
      <NetworkDropdown open={networkOpen} networks={asset.chains} selected={network} onSelect={setNetwork} onClose={() => setNetworkOpen(false)} />
    </div>
  );
}
