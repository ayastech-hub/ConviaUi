import { useState, useCallback, useEffect, useMemo } from 'react';
import { ChevronDown, Copy, Check, Loader, Search } from 'lucide-react';
import { type Asset, type Screen } from '../../../shared/data/mockData';
import { ASSET_MIN_DEPOSIT, networkInfoForKey } from '../components/deposit/types';
import { DepositCoinList } from '../components/deposit/DepositCoinList';
import { DepositChainPicker, type DepositChainRow } from '../components/deposit/DepositChainPicker';
import { DepositNoticeSheet } from '../components/deposit/DepositNoticeSheet';
import { FeatureAlert, mapApiCodeToReason } from '../../../shared/components/FeatureAlert';
import { useAuth } from '../../../shared/context/AuthContext';
import { fetchDepositInfo, fetchAddresses } from '../../../shared/api/wallet';
import { resolveChain } from '../../../shared/utils/chains';
import { ApiError } from '../../../shared/api/types';
import { useWalletAssets } from '../../../shared/hooks/useWalletAssets';
import { PageTop } from '../../../shared/components/PageTop';
import { BackButton } from '../../../shared/components/BackButton';
import { AssetIcon } from '../../../shared/components/AssetIcon';
import { QRCodeDisplay } from '../../../shared/components/QRCodeDisplay';
import { encodeQRPayload } from '../../../shared/utils/qrPayload';

interface DepositScreenProps {
  goBack: () => void;
  navigate: (s: Screen, param?: string) => void;
  presetSymbol?: string;
}

type Step = 'select' | 'detail';

export function DepositScreen({ goBack, navigate, presetSymbol }: DepositScreenProps) {
  const { assets: cryptoAssets, chainKeysForSymbol } = useWalletAssets();
  const { userId } = useAuth();

  const [step, setStep] = useState<Step>('select');
  const [asset, setAsset] = useState<Asset | null>(null);
  const [network, setNetwork] = useState('');
  const [chainOpen, setChainOpen] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<{ code?: string; message?: string } | null>(null);
  const [liveMin, setLiveMin] = useState<{ native: number; usd: number; conf: number } | null>(null);
  const [pendingChain, setPendingChain] = useState('');

  const depositChains = useMemo(() => {
    if (!asset) return [] as string[];
    try {
      const keys = chainKeysForSymbol?.(asset.symbol, 'deposit') || [];
      if (keys.length) return keys;
    } catch {
      /* */
    }
    return (asset.chains || []).map((c) => resolveChain(c).chainKey);
  }, [asset, chainKeysForSymbol]);

  const chainRows: DepositChainRow[] = useMemo(() => {
    if (!asset) return [];
    const last = typeof localStorage !== 'undefined' ? localStorage.getItem('convia_last_deposit_chain') : null;
    return depositChains.map((k) => {
      const info = networkInfoForKey(k);
      const floor = ASSET_MIN_DEPOSIT[asset.symbol.toUpperCase()] ?? 0;
      return {
        chainKey: k,
        confirmations: liveMin && network === k && liveMin.conf > 0 ? liveMin.conf : info.confirmations,
        minDeposit:
          liveMin && network === k && liveMin.native > 0
            ? liveMin.native
            : floor > 0
              ? floor
              : info.minDeposit,
        recentlyUsed: last === k,
      };
    });
  }, [asset, depositChains, liveMin, network]);

  const netInfo = network ? networkInfoForKey(network) : null;
  const minShow =
    liveMin && liveMin.native > 0
      ? liveMin.native
      : asset
        ? ASSET_MIN_DEPOSIT[asset.symbol.toUpperCase()] ?? netInfo?.minDeposit ?? 0
        : 0;
  const confShow = liveMin && liveMin.conf > 0 ? liveMin.conf : netInfo?.confirmations ?? 0;

  const handleAssetSelect = (a: Asset) => {
    setAsset(a);
    setNetwork('');
    setAddress('');
    setLiveMin(null);
    setConfirmed(false);
    setError(null);
    setStep('detail');
  };

  useEffect(() => {
    if (!presetSymbol || !cryptoAssets.length) return;
    const hit = cryptoAssets.find((a) => a.symbol.toUpperCase() === presetSymbol.toUpperCase());
    if (hit && (!asset || asset.symbol !== hit.symbol)) handleAssetSelect(hit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetSymbol, cryptoAssets]);

  const loadAddress = useCallback(async () => {
    if (!userId || !asset || !network || !confirmed) return;
    setLoading(true);
    setError(null);
    setAddress('');
    const resolved = resolveChain(network);
    const chainKey = resolved.chainKey;
    const chainFamily = resolved.chainFamily;
    try {
      const depositSym = asset.symbol.toUpperCase() === 'USD' ? 'USDT' : asset.symbol;
      const info = await fetchDepositInfo(userId, depositSym, chainKey);
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
          if (err instanceof ApiError) setError({ code: err.code, message: err.body?.message || err.message });
          else setError({ message: 'No deposit address for this network' });
        }
      } catch (err2) {
        setAddress('');
        const e = err2 instanceof ApiError ? err2 : err instanceof ApiError ? err : null;
        setError(e ? { code: e.code, message: e.message } : { message: 'Failed to load address' });
      }
    } finally {
      setLoading(false);
    }
  }, [userId, asset, network, confirmed]);

  useEffect(() => {
    void loadAddress();
  }, [loadAddress]);

  const onPickChain = (key: string) => {
    setPendingChain(key);
    setNoticeOpen(true);
  };

  const onConfirmNotice = () => {
    setNoticeOpen(false);
    setNetwork(pendingChain);
    setConfirmed(true);
    setAddress('');
    setLiveMin(null);
    try {
      localStorage.setItem('convia_last_deposit_chain', pendingChain);
    } catch {
      /* */
    }
  };

  const copy = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* */
    }
  };

  if (step === 'select') {
    return (
      <DepositCoinList
        assets={cryptoAssets.length ? cryptoAssets : []}
        goBack={goBack}
        onSelect={handleAssetSelect}
        onHelp={() => navigate('help-center')}
      />
    );
  }

  if (!asset) return null;

  const showQr = confirmed && !!network && !!address && !loading;

  return (
    <div className="flex flex-col h-full relative" style={{ background: 'var(--background)' }}>
      <PageTop />
      <div className="flex items-center gap-2 px-4 mb-2">
        <BackButton
          onClick={() => {
            setStep('select');
            setAsset(null);
            setNetwork('');
            setConfirmed(false);
          }}
        />
        <div className="flex-1 flex items-center justify-center gap-2">
          <AssetIcon symbol={asset.symbol} size={22} />
          <h1 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 17 }}>
            {asset.symbol}-Deposit
          </h1>
        </div>
        <div style={{ width: 40 }} />
      </div>

      {error && (
        <div className="px-4 mb-2">
          <FeatureAlert reason={mapApiCodeToReason(error.code)} message={error.message} />
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-5 pb-28">
        <div className="flex items-center justify-center gap-1.5 mb-5">
          <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Network:</span>
          <button
            type="button"
            onClick={() => setChainOpen(true)}
            className="flex items-center gap-1"
            style={{ color: network ? 'var(--foreground)' : 'var(--muted-foreground)', fontWeight: 600, fontSize: 13 }}
          >
            {network && netInfo
              ? `${netInfo.name}${netInfo.label ? ` (${netInfo.label})` : ''}`
              : 'Please select'}
            <ChevronDown size={16} />
          </button>
        </div>

        {!network || !confirmed ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Search size={48} strokeWidth={1.25} style={{ color: 'var(--muted-foreground)', opacity: 0.5 }} />
            <p style={{ color: 'var(--muted-foreground)', fontSize: 14, marginTop: 16, marginBottom: 20 }}>
              No Results
            </p>
            <button
              type="button"
              onClick={() => setChainOpen(true)}
              className="rounded-full px-8"
              style={{
                height: 44,
                background: 'var(--primary)',
                color: 'var(--primary-foreground, #fff)',
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              Select chain
            </button>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center py-20">
            <Loader size={28} className="animate-spin" style={{ color: 'var(--primary)' }} />
            <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginTop: 12 }}>Loading address…</p>
          </div>
        ) : showQr ? (
          <>
            <div className="flex flex-col items-center mb-5">
              <div
                style={{
                  padding: 14,
                  background: '#fff',
                  borderRadius: 18,
                  boxShadow: '0 8px 28px rgba(0,0,0,0.16)',
                  position: 'relative',
                }}
              >
                <QRCodeDisplay
                  value={encodeQRPayload({ address, asset: asset.symbol, chain: network })}
                  size={200}
                />
                <div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  style={{ margin: 'auto' }}
                >
                  <div
                    className="rounded-full p-1.5"
                    style={{ background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
                  >
                    <AssetIcon symbol={asset.symbol} size={28} />
                  </div>
                </div>
              </div>
            </div>

            <div
              className="rounded-2xl px-3.5 py-3 mb-5 flex items-start gap-2"
              style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
            >
              <div className="flex-1 min-w-0">
                <p style={{ color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>
                  Wallet Address
                </p>
                <p
                  className="font-mono break-all"
                  style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600, lineHeight: 1.4 }}
                >
                  {address}
                </p>
              </div>
              <button type="button" onClick={() => void copy()} className="p-2 flex-shrink-0" aria-label="Copy">
                {copied ? (
                  <Check size={18} style={{ color: 'var(--positive)' }} />
                ) : (
                  <Copy size={18} style={{ color: 'var(--muted-foreground)' }} />
                )}
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between gap-3">
                <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Minimum Deposit Amount</span>
                <span className="tabular-nums" style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13 }}>
                  {minShow > 0 ? minShow : '—'} {asset.symbol}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Deposit Arrival</span>
                <span style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13 }}>
                  {confShow} confirmation{confShow === 1 ? '' : 's'}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Network</span>
                <span style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13 }}>
                  {netInfo?.name}
                  {netInfo?.label ? ` (${netInfo.label})` : ''}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center py-16">
            <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Could not load deposit address</p>
            <button
              type="button"
              onClick={() => void loadAddress()}
              className="mt-4 rounded-full px-6"
              style={{
                height: 40,
                background: 'var(--primary)',
                color: 'var(--primary-foreground, #fff)',
                fontWeight: 600,
              }}
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {showQr && (
        <div
          className="absolute bottom-0 left-0 right-0 px-5 pt-3 pb-8 flex gap-3"
          style={{ background: 'var(--background)', borderTop: '1px solid var(--border)' }}
        >
          <button
            type="button"
            onClick={() => void copy()}
            className="flex-1 rounded-full"
            style={{
              height: 48,
              border: '1px solid var(--border)',
              background: 'var(--card)',
              color: 'var(--foreground)',
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            {copied ? 'Copied' : 'Copy Address'}
          </button>
        </div>
      )}

      <DepositChainPicker
        open={chainOpen}
        symbol={asset.symbol}
        chains={chainRows}
        selected={network}
        onSelect={onPickChain}
        onClose={() => setChainOpen(false)}
      />
      <DepositNoticeSheet
        open={noticeOpen}
        symbol={asset.symbol}
        chainKey={pendingChain || network}
        minDeposit={
          asset
            ? ASSET_MIN_DEPOSIT[asset.symbol.toUpperCase()] ?? networkInfoForKey(pendingChain || network).minDeposit
            : 0
        }
        onConfirm={onConfirmNotice}
        onClose={() => setNoticeOpen(false)}
      />
    </div>
  );
}
