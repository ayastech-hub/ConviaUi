import { useState, useMemo, useCallback } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import { cryptoAssets, type Asset } from '../../../shared/data/mockData';
import { useCurrency } from '../../../shared/context/CurrencyContext';
import { NETWORKS, generateAddress } from '../components/receive/types';
import { ReceiveTokenList } from '../components/receive/ReceiveTokenList';
import { ReceiveSelectors } from '../components/receive/ReceiveSelectors';
import { ReceiveQRCard } from '../components/receive/ReceiveQRCard';
import { RequestAmountToggle } from '../components/receive/RequestAmountToggle';
import { ReceiveAddressCard } from '../components/receive/ReceiveAddressCard';
import { ReceiveInfoGrid } from '../components/receive/ReceiveInfoGrid';
import { AssetDropdown } from '../components/receive/AssetDropdown';
import { NetworkDropdown } from '../components/receive/NetworkDropdown';

interface ReceiveScreenProps {
  goBack: () => void;
}

export function ReceiveScreen({ goBack }: ReceiveScreenProps) {
  const { format } = useCurrency();
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [asset, setAsset] = useState<Asset>(cryptoAssets.find((a) => a.id === 'usdt')!);
  const [network, setNetwork] = useState<string>(asset.chains[0]);
  const [networkOpen, setNetworkOpen] = useState(false);
  const [assetOpen, setAssetOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [requestEnabled, setRequestEnabled] = useState(false);
  const [requestAmount, setRequestAmount] = useState('');

  const address = useMemo(() => generateAddress(asset, network), [asset, network]);
  const netInfo = NETWORKS[network];

  const handleAssetChange = useCallback((a: Asset) => {
    setAsset(a);
    setNetwork(a.chains[0]);
  }, []);

  const handleCopy = useCallback(() => {
    try { navigator.clipboard?.writeText(address); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [address]);

  const handleShare = useCallback(() => {
    setShared(true);
    try { navigator.share?.({ title: `Convia ${asset.symbol} address`, text: address }); } catch {}
    setTimeout(() => setShared(false), 2000);
  }, [address, asset.symbol]);

  const amountNum = parseFloat(requestAmount) || 0;
  const usdValue = amountNum * asset.price;

  if (!selectedAsset) {
    return (
      <ReceiveTokenList
        assets={cryptoAssets}
        goBack={goBack}
        onSelect={(a) => { setAsset(a); setNetwork(a.chains[0]); setSelectedAsset(a); }}
      />
    );
  }

  return (
    <div className="flex flex-col h-full relative" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />

      <div className="flex items-center gap-3 px-5 mb-5">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setSelectedAsset(null)} aria-label="Go back" className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
          <ChevronLeft size={20} style={{ color: 'var(--foreground)' }} />
        </motion.button>
        <div>
          <h2 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 20, lineHeight: 1.1 }}>Receive {asset.symbol}</h2>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Get paid in crypto from anyone</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <ReceiveSelectors
          asset={asset} network={network} netInfo={netInfo}
          onOpenAsset={() => setAssetOpen(true)} onOpenNetwork={() => setNetworkOpen(true)}
          onChangeToken={() => setSelectedAsset(null)}
        />

        <ReceiveQRCard asset={asset} network={network} netInfo={netInfo} address={address} requestEnabled={requestEnabled} requestAmount={requestAmount} amountNum={amountNum} />

        <RequestAmountToggle
          enabled={requestEnabled} onToggle={() => setRequestEnabled((v) => !v)}
          requestAmount={requestAmount} setRequestAmount={setRequestAmount}
          assetSymbol={asset.symbol} amountNum={amountNum} usdValue={usdValue} format={format}
        />

        <ReceiveAddressCard asset={asset} address={address} netInfo={netInfo} copied={copied} shared={shared} onCopy={handleCopy} onShare={handleShare} />

        <ReceiveInfoGrid netInfo={netInfo} />
      </div>

      <NetworkDropdown open={networkOpen} networks={asset.chains} selected={network} onSelect={setNetwork} onClose={() => setNetworkOpen(false)} />
      <AssetDropdown open={assetOpen} assets={cryptoAssets} selected={asset} onSelect={handleAssetChange} onClose={() => setAssetOpen(false)} />
    </div>
  );
}
