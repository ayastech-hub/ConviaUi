import { useState, useCallback, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Loader } from 'lucide-react';
import { type Asset } from '../../../shared/data/mockData';
import { NETWORKS } from '../components/deposit/types';
import { AssetDropdown } from '../components/deposit/AssetDropdown';
import { NetworkDropdown } from '../components/deposit/NetworkDropdown';
import { TokenSelectionList } from '../components/deposit/TokenSelectionList';
import { DepositSelectors } from '../components/deposit/DepositSelectors';
import { DepositAddressCard } from '../components/deposit/DepositAddressCard';
import { DepositInfoAndHistory } from '../components/deposit/DepositInfoAndHistory';
import { WalletFeatureBanner } from '../../../shared/components/WalletFeatureBanner';
import { FeatureAlert, mapApiCodeToReason } from '../../../shared/components/FeatureAlert';
import { useAuth } from '../../../shared/context/AuthContext';
import { fetchDepositInfo, fetchAddresses } from '../../../shared/api/wallet';
import { resolveChain } from '../../../shared/utils/chains';
import { ApiError } from '../../../shared/api/types';
import { useTokenRegistry } from '../../../shared/hooks/useTokenRegistry';

interface DepositScreenProps {
  goBack: () => void;
}

/** Deposit crypto to custodial address — same live source as Receive. */
export function DepositScreen({ goBack }: DepositScreenProps) {
  const { assets: registryAssets, loading: registryLoading } = useTokenRegistry();
  const cryptoAssets = registryAssets.length ? registryAssets : [];
  const { userId, status } = useAuth();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [network, setNetwork] = useState<string>('');
  const [assetOpen, setAssetOpen] = useState(false);
  const [networkOpen, setNetworkOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ code?: string; message?: string } | null>(null);

  const netInfo = NETWORKS[network] || NETWORKS.Ethereum;

  const loadAddress = useCallback(async () => {
    if (!userId || !asset) return;
    setLoading(true);
    setError(null);
    const { chainKey, chainFamily } = resolveChain(network || asset.chains[0] || 'Ethereum');
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
          else setError({ message: 'No deposit address' });
        }
      } catch (err2) {
        setAddress('');
        const e = err2 instanceof ApiError ? err2 : err instanceof ApiError ? err : null;
        setError(e ? { code: e.code, message: e.message } : { message: 'Failed to load address' });
      }
    } finally {
      setLoading(false);
    }
  }, [userId, asset, network]);

  useEffect(() => {
    void loadAddress();
  }, [loadAddress]);

  const handleAssetSelect = (a: Asset) => {
    setAsset(a);
    setNetwork(a.chains[0] || 'Ethereum');
  };

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

  if (!asset) {
    return <TokenSelectionList assets={cryptoAssets.length ? cryptoAssets : []} goBack={goBack} onSelect={handleAssetSelect} />;
  }

  return (
    <div className="flex flex-col h-full relative" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />
      <div className="px-5 pt-2">
        <WalletFeatureBanner feature="deposit" />
        {status === 'anonymous' && (
          <FeatureAlert reason="generic" message="Sign in to show your custodial deposit address." />
        )}
        {error && <FeatureAlert reason={mapApiCodeToReason(error.code)} message={error.message} detail={error.code} />}
      </div>

      <div className="flex items-center gap-3 px-5 mb-5">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={goBack}
          aria-label="Go back"
          className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
        >
          <ChevronLeft size={20} style={{ color: 'var(--foreground)' }} />
        </motion.button>
        <div>
          <h2 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 20 }}>Deposit {asset.symbol}</h2>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
            {address ? 'Live address from API' : 'Select network'}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <DepositSelectors
          asset={asset}
          network={network}
          netInfo={netInfo}
          onOpenAsset={() => setAssetOpen(true)}
          onOpenNetwork={() => setNetworkOpen(true)}
        />

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader className="animate-spin" style={{ color: 'var(--muted-foreground)' }} />
          </div>
        ) : (
          <>
            <DepositAddressCard
              asset={asset}
              network={network}
              netInfo={netInfo}
              address={address || '—'}
              copied={copied}
              shared={shared}
              onCopy={handleCopy}
              onShare={handleShare}
            />
            <DepositInfoAndHistory asset={asset} netInfo={netInfo} />
          </>
        )}
      </div>

      <AssetDropdown
        open={assetOpen}
        assets={cryptoAssets.length ? cryptoAssets : []}
        selected={asset}
        onSelect={handleAssetSelect}
        onClose={() => setAssetOpen(false)}
      />
      <NetworkDropdown
        open={networkOpen}
        networks={asset.chains}
        selected={network}
        onSelect={setNetwork}
        onClose={() => setNetworkOpen(false)}
      />
    </div>
  );
}
