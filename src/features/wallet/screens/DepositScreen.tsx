import { useState, useCallback, useEffect, useMemo } from 'react';
import { Loader, Coins, CreditCard, HandCoins, Link2 } from 'lucide-react';
import { MethodOptionRow, MethodOrDivider } from '../components/MethodOptionRow';
import { type Asset, type Screen } from '../../../shared/data/mockData';
import { NETWORKS, ASSET_MIN_DEPOSIT, type NetworkInfo } from '../components/deposit/types';
import { AssetDropdown } from '../components/deposit/AssetDropdown';
import { NetworkDropdown } from '../components/deposit/NetworkDropdown';
import { TokenSelectionList } from '../components/deposit/TokenSelectionList';
import { DepositSelectors } from '../components/deposit/DepositSelectors';
import { DepositAddressCard } from '../components/deposit/DepositAddressCard';
import { DepositInfoAndHistory } from '../components/deposit/DepositInfoAndHistory';
import { FeatureAlert, mapApiCodeToReason } from '../../../shared/components/FeatureAlert';
import { useAuth } from '../../../shared/context/AuthContext';
import { fetchDepositInfo, fetchAddresses } from '../../../shared/api/wallet';
import { resolveChain } from '../../../shared/utils/chains';
import { ApiError } from '../../../shared/api/types';
import { useWalletAssets } from '../../../shared/hooks/useWalletAssets';
import { PageTop } from '../../../shared/components/PageTop';
import { BackButton } from '../../../shared/components/BackButton';

interface DepositScreenProps {
  goBack: () => void;
  navigate: (s: Screen, param?: string) => void;
  presetSymbol?: string;
}

function estTimeForConfirmations(n: number): string {
  if (n <= 1) return '~1 min';
  if (n <= 3) return '2–5 min';
  if (n <= 12) return '3–8 min';
  if (n <= 20) return '5–15 min';
  return '10–30 min';
}

/** Deposit hub → crypto address flow or buy / request. */
export function DepositScreen({ goBack, navigate, presetSymbol }: DepositScreenProps) {
  const { assets: cryptoAssets } = useWalletAssets();
  const { userId, status } = useAuth();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [network, setNetwork] = useState<string>('');
  const [assetOpen, setAssetOpen] = useState(false);
  const [networkOpen, setNetworkOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ code?: string; message?: string } | null>(null);
  const [mode, setMode] = useState<'hub' | 'crypto'>('crypto');
  const [liveMin, setLiveMin] = useState<{ native: number; usd: number; conf: number } | null>(null);

  const fallbackNet = NETWORKS[network] || NETWORKS.Ethereum || Object.values(NETWORKS)[0];

  const netInfo: NetworkInfo = useMemo(() => {
    const base = fallbackNet || {
      name: network || 'Network',
      label: network || '—',
      color: 'var(--muted-foreground)',
      confirmations: 12,
      estTime: '3–5 min',
      minDeposit: 0,
      explorer: '',
    };
    const assetFloor = asset ? (ASSET_MIN_DEPOSIT[asset.symbol.toUpperCase()] ?? 0) : 0;
    if (!liveMin) {
      return {
        ...base,
        minDeposit: assetFloor > 0 ? assetFloor : base.minDeposit,
      };
    }
    return {
      ...base,
      confirmations: liveMin.conf || base.confirmations,
      estTime: estTimeForConfirmations(liveMin.conf || base.confirmations),
      minDeposit:
        liveMin.native > 0
          ? liveMin.native
          : assetFloor > 0
            ? assetFloor
            : base.minDeposit,
      minDepositUsd: liveMin.usd > 0 ? liveMin.usd : base.minDepositUsd,
    };
  }, [fallbackNet, liveMin, network]);

  const loadAddress = useCallback(async () => {
    if (!userId || !asset) return;
    setLoading(true);
    setError(null);
    setLiveMin(null);
    const { chainKey, chainFamily } = resolveChain(network || asset.chains[0] || 'Ethereum');
    try {
      const info = await fetchDepositInfo(userId, asset.symbol, chainKey);
      setAddress(info.address);
      const native = Number(info.minimumDeposit);
      const usd = Number(info.minimumDepositUsd);
      setLiveMin({
        native: Number.isFinite(native) && native > 0 ? native : 0,
        usd: Number.isFinite(usd) && usd > 0 ? usd : 0,
        conf: Number(info.requiredConfirmations) || 0,
      });
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
    setMode('crypto');
  };

  useEffect(() => {
    if (!presetSymbol || !cryptoAssets.length) return;
    const hit = cryptoAssets.find((a) => a.symbol.toUpperCase() === presetSymbol.toUpperCase());
    if (hit && (!asset || asset.symbol !== hit.symbol)) {
      handleAssetSelect(hit);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetSymbol, cryptoAssets]);

  const handleCopy = useCallback(() => {
    if (!address) return;
    try {
      void navigator.clipboard?.writeText(address);
    } catch {
      /* ignore */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [address]);

  const go = (screen: Screen) => {
    try {
      navigate(screen);
    } catch {
      goBack();
    }
  };

  // Hub removed — fund sheet already chose on-chain vs buy.

if (!asset) {
    if (presetSymbol) {
      return (
        <div className="flex flex-col h-full items-center justify-center" style={{ background: 'var(--background)' }}>
          <Loader className="animate-spin" style={{ color: 'var(--muted-foreground)' }} />
        </div>
      );
    }
    return (
      <TokenSelectionList
        assets={cryptoAssets.length ? cryptoAssets : []}
        goBack={goBack}
        onSelect={handleAssetSelect}
      />
    );
  }

  return (
    <div className="flex flex-col h-full relative" style={{ background: 'var(--background)' }}>
      <PageTop />
      <div className="px-5">
        {status === 'anonymous' && (
          <FeatureAlert reason="generic" message="Sign in to show your deposit address." />
        )}
        {error && (
          <FeatureAlert reason={mapApiCodeToReason(error.code)} message={error.message} detail={error.code} />
        )}
      </div>

      <div className="flex items-center gap-3 px-5 mb-4">
        <BackButton onClick={() => (presetSymbol ? goBack() : setAsset(null))} />
        <h2 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 20 }}>{asset.symbol}</h2>
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
              onCopy={handleCopy}
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
