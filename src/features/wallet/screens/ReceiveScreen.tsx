import { useState, useCallback, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Loader } from 'lucide-react';
import { type Asset } from '../../../shared/data/mockData';
import { useWalletAssets } from '../../../shared/hooks/useWalletAssets';
import { useTokenRegistry } from '../../../shared/hooks/useTokenRegistry';
import { useCurrency } from '../../../shared/context/CurrencyContext';
import { useAuth } from '../../../shared/context/AuthContext';
import { NETWORKS } from '../components/receive/types';
import { ReceiveTokenList } from '../components/receive/ReceiveTokenList';
import { ReceiveSelectors } from '../components/receive/ReceiveSelectors';
import { ReceiveQRCard } from '../components/receive/ReceiveQRCard';
import { RequestAmountToggle } from '../components/receive/RequestAmountToggle';
import { ReceiveAddressCard } from '../components/receive/ReceiveAddressCard';
import { ReceiveInfoGrid } from '../components/receive/ReceiveInfoGrid';
import { AssetDropdown } from '../components/receive/AssetDropdown';
import { NetworkDropdown } from '../components/receive/NetworkDropdown';
import { fetchDepositInfo, fetchAddresses } from '../../../shared/api/wallet';
import { resolveChain } from '../../../shared/utils/chains';
import { ApiError } from '../../../shared/api/types';
import { FeatureAlert, mapApiCodeToReason } from '../../../shared/components/FeatureAlert';

interface ReceiveScreenProps {
  goBack: () => void;
}

export function ReceiveScreen({ goBack }: ReceiveScreenProps) {
  const { format } = useCurrency();
  const { assets: tokenList, loading: regLoading, chainKeysForSymbol } = useWalletAssets();
  const { chains } = useTokenRegistry();
  const { userId, status } = useAuth();
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [asset, setAsset] = useState<Asset | null>(null);
  const [network, setNetwork] = useState('');
  const [networkOpen, setNetworkOpen] = useState(false);
  const [assetOpen, setAssetOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [requestEnabled, setRequestEnabled] = useState(false);
  const [requestAmount, setRequestAmount] = useState('');
  const [address, setAddress] = useState('');
  const [loadingAddr, setLoadingAddr] = useState(false);
  const [error, setError] = useState<{ code?: string; message?: string } | null>(null);

  const netInfo = NETWORKS[network] || {
    name: network || 'Network',
    label: network || '—',
    color: 'var(--muted-foreground)',
    estTime: '—',
  };

  const loadAddress = useCallback(async () => {
    if (!userId || !selectedAsset || !asset) return;
    setLoadingAddr(true);
    setError(null);
    const { chainKey, chainFamily } = resolveChain(network);
    try {
      const info = await fetchDepositInfo(userId, asset.symbol, chainKey);
      setAddress(info.address);
    } catch (err) {
      try {
        const addrs = await fetchAddresses(userId);
        const row = addrs.find((a) => a.chainFamily === chainFamily);
        if (row) setAddress(row.address);
        else {
          setAddress('');
          if (err instanceof ApiError) setError({ code: err.code, message: err.body.message || err.message });
          else setError({ message: 'No deposit address for this network' });
        }
      } catch (err2) {
        setAddress('');
        const e = err2 instanceof ApiError ? err2 : err instanceof ApiError ? err : null;
        setError(e ? { code: e.code, message: e.message } : { message: 'Could not load deposit address' });
      }
    } finally {
      setLoadingAddr(false);
    }
  }, [userId, selectedAsset, asset, network]);

  useEffect(() => {
    void loadAddress();
  }, [loadAddress]);

  const handleAssetChange = useCallback((a: Asset) => {
    setAsset(a);
    setNetwork(a.chains[0] || '');
  }, []);

  const handleCopy = useCallback(() => {
    if (!address) return;
    try {
      navigator.clipboard?.writeText(address);
    } catch {
      /* ignore */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [address]);

  const handleShare = useCallback(() => {
    if (!address || !asset) return;
    setShared(true);
    try {
      navigator.share?.({ title: `Convia ${asset.symbol} address`, text: address });
    } catch {
      /* ignore */
    }
    setTimeout(() => setShared(false), 2000);
  }, [address, asset]);

  const amountNum = parseFloat(requestAmount) || 0;
  const usdValue = amountNum * (asset?.price || 0);

  if (!selectedAsset || !asset) {
    if (regLoading && tokenList.length === 0) {
      return (
        <div className="flex flex-col h-full items-center justify-center" style={{ background: 'var(--background)' }}>
          <Loader className="animate-spin mb-3" style={{ color: 'var(--muted-foreground)' }} />
          <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Loading supported tokens…</p>
        </div>
      );
    }
    return (
      <ReceiveTokenList
        assets={tokenList}
        goBack={goBack}
        onSelect={(a) => {
          setAsset(a);
          setNetwork(a.chains[0] || '');
          setSelectedAsset(a);
        }}
      />
    );
  }

  return (
    <div className="flex flex-col h-full relative" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />

      <div className="flex items-center gap-3 px-5 mb-5">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            setSelectedAsset(null);
            setAddress('');
          }}
          aria-label="Go back"
          className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
        >
          <ChevronLeft size={20} style={{ color: 'var(--foreground)' }} />
        </motion.button>
        <div>
          <h2 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 20, lineHeight: 1.1 }}>
            Receive {asset.symbol}
          </h2>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
            {address ? 'Live custodial address · QR on device' : 'Select network'}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        {status === 'anonymous' && (
          <FeatureAlert reason="generic" message="Sign in to load your real deposit address." />
        )}
        {error && <FeatureAlert reason={mapApiCodeToReason(error.code)} message={error.message} detail={error.code} />}

        <ReceiveSelectors
          asset={asset}
          network={network}
          netInfo={netInfo}
          onOpenAsset={() => setAssetOpen(true)}
          onOpenNetwork={() => setNetworkOpen(true)}
          onChangeToken={() => setSelectedAsset(null)}
        />

        {loadingAddr ? (
          <div className="flex justify-center py-12">
            <Loader className="animate-spin" style={{ color: 'var(--muted-foreground)' }} />
          </div>
        ) : (
          <>
            <ReceiveQRCard
              asset={asset}
              network={network}
              netInfo={netInfo}
              address={address || ' '}
              requestEnabled={requestEnabled}
              requestAmount={requestAmount}
              amountNum={amountNum}
            />
            <RequestAmountToggle
              enabled={requestEnabled}
              onToggle={() => setRequestEnabled((v) => !v)}
              requestAmount={requestAmount}
              setRequestAmount={setRequestAmount}
              assetSymbol={asset.symbol}
              amountNum={amountNum}
              usdValue={usdValue}
              format={format}
            />
            {address ? (
              <ReceiveAddressCard
                asset={asset}
                address={address}
                netInfo={netInfo}
                copied={copied}
                shared={shared}
                onCopy={handleCopy}
                onShare={handleShare}
              />
            ) : null}
            <ReceiveInfoGrid netInfo={netInfo} />
          </>
        )}
      </div>

      <NetworkDropdown
        open={networkOpen}
        networks={asset.chains}
        selected={network}
        onSelect={setNetwork}
        onClose={() => setNetworkOpen(false)}
      />
      <AssetDropdown
        open={assetOpen}
        assets={tokenList}
        selected={asset}
        onSelect={handleAssetChange}
        onClose={() => setAssetOpen(false)}
      />
    </div>
  );
}
