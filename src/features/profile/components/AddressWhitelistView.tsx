import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Loader2,
  Plus,
  Trash2,
  ShieldCheck,
  Link2,
  Check,
  AlertCircle,
  WalletCards,
  X,
} from 'lucide-react';
import { ScreenHeader } from '../../../shared/components/ScreenHeader';
import { useAuth } from '../../../shared/context/AuthContext';
import * as securityApi from '../../../shared/api/security';
import { ApiError } from '../../../shared/api/types';
import {
  FeatureAlert,
  mapApiCodeToReason,
} from '../../../shared/components/FeatureAlert';

interface Props {
  onBack: () => void;
}

type ChainId = 'evm' | 'solana' | 'bitcoin' | 'tron';

const CHAINS: { id: ChainId; label: string; short: string }[] = [
  { id: 'evm', label: 'EVM', short: 'EVM' },
  { id: 'solana', label: 'Solana', short: 'SOL' },
  { id: 'tron', label: 'TRON', short: 'TRX' },
  { id: 'bitcoin', label: 'Bitcoin', short: 'BTC' },
];

export function AddressWhitelistView({ onBack }: Props) {
  const { userId } = useAuth();

  const [rows, setRows] = useState<securityApi.WhitelistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<{
    code?: string;
    message?: string;
  } | null>(null);

  const [chain, setChain] = useState<ChainId>('evm');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [removeTarget, setRemoveTarget] =
    useState<securityApi.WhitelistEntry | null>(null);

  const selectedChain = useMemo(
    () => CHAINS.find((item) => item.id === chain) || CHAINS[0],
    [chain],
  );

  const load = async (silent = false) => {
    if (!userId) {
      setRows([]);
      setLoading(false);
      return;
    }

    if (silent) setRefreshing(true);
    else setLoading(true);

    try {
      const list = await securityApi.listWhitelist(userId);
      setRows(Array.isArray(list) ? list : []);
      setError(null);
    } catch (err) {
      if (err instanceof ApiError) {
        setError({
          code: err.code,
          message: err.message,
        });
      } else {
        setError({
          message: 'Could not load your withdrawal whitelist.',
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void load();
  }, [userId]);

  const add = async () => {
    const value = address.trim();

    if (!userId || !value || saving) return;

    setSaving(true);
    setError(null);

    try {
      await securityApi.addWhitelist(userId, chain, value);

      setAddress('');
      await load(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setError({
          code: err.code,
          message: err.message,
        });
      } else {
        setError({
          message: 'Could not add this address.',
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const remove = async (entry: securityApi.WhitelistEntry) => {
    if (!userId || removing) return;

    const key = `${entry.chainType}:${entry.address}`;

    setRemoving(key);
    setError(null);

    try {
      await securityApi.removeWhitelist(
        userId,
        entry.chainType,
        entry.address,
      );

      setRows((current) =>
        current.filter(
          (item) =>
            `${item.chainType}:${item.address}` !== key,
        ),
      );

      setRemoveTarget(null);
    } catch (err) {
      if (err instanceof ApiError) {
        setError({
          code: err.code,
          message: err.message,
        });
      } else {
        setError({
          message: 'Could not remove this address.',
        });
      }
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: 'var(--background)' }}
    >
      <ScreenHeader title="Withdrawal whitelist" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-5 pb-12">
        <div className="pt-1 pb-5">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-[15px] flex items-center justify-center"
              style={{
                background:
                  'color-mix(in oklab, var(--primary) 10%, var(--card))',
                border: '1px solid var(--border)',
              }}
            >
              <ShieldCheck
                size={20}
                style={{ color: 'var(--primary)' }}
              />
            </div>

            <div className="min-w-0">
              <h1
                style={{
                  color: 'var(--foreground)',
                  fontSize: 19,
                  fontWeight: 800,
                  letterSpacing: -0.35,
                }}
              >
                Trusted addresses
              </h1>

              <p
                className="mt-0.5"
                style={{
                  color: 'var(--muted-foreground)',
                  fontSize: 11.5,
                  lineHeight: 1.4,
                }}
              >
                Manage where your withdrawals can be sent.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-5">
            <FeatureAlert
              reason={mapApiCodeToReason(error.code)}
              message={error.message}
              detail={error.code}
            />
          </div>
        )}

        <section
          className="rounded-[24px] overflow-hidden"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
          }}
        >
          <div className="px-4 pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <p
                  style={{
                    color: 'var(--foreground)',
                    fontSize: 14,
                    fontWeight: 750,
                  }}
                >
                  Add trusted address
                </p>

                <p
                  className="mt-1"
                  style={{
                    color: 'var(--muted-foreground)',
                    fontSize: 11.5,
                  }}
                >
                  Select the network before adding the address.
                </p>
              </div>

              <WalletCards
                size={18}
                style={{ color: 'var(--muted-foreground)' }}
              />
            </div>

            <div className="grid grid-cols-4 gap-1.5 mt-5">
              {CHAINS.map((item) => {
                const active = chain === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setChain(item.id)}
                    className="h-10 rounded-xl text-[11px] font-bold transition-all"
                    style={{
                      background: active
                        ? 'var(--primary)'
                        : 'var(--muted)',
                      color: active
                        ? 'var(--primary-foreground)'
                        : 'var(--muted-foreground)',
                      border: active
                        ? '1px solid transparent'
                        : '1px solid var(--border)',
                    }}
                  >
                    {item.short}
                  </button>
                );
              })}
            </div>

            <div
              className="mt-3 rounded-2xl overflow-hidden"
              style={{
                background: 'var(--muted)',
                border: '1px solid var(--border)',
              }}
            >
              <div className="flex items-center gap-2.5 px-3.5 h-[52px]">
                <div
                  className="w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0"
                  style={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <Link2
                    size={15}
                    style={{ color: 'var(--muted-foreground)' }}
                  />
                </div>

                <input
                  value={address}
                  onChange={(event) =>
                    setAddress(event.target.value)
                  }
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      void add();
                    }
                  }}
                  placeholder={`${selectedChain.label} wallet address`}
                  spellCheck={false}
                  autoCapitalize="none"
                  autoCorrect="off"
                  className="flex-1 min-w-0 bg-transparent outline-none"
                  style={{
                    color: 'var(--foreground)',
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                />

                {address && (
                  <button
                    type="button"
                    onClick={() => setAddress('')}
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      background: 'var(--card)',
                    }}
                    aria-label="Clear address"
                  >
                    <X
                      size={14}
                      style={{
                        color: 'var(--muted-foreground)',
                      }}
                    />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 mt-3">
              <ShieldCheck
                size={14}
                style={{
                  color: 'var(--primary)',
                  flexShrink: 0,
                }}
              />

              <p
                style={{
                  color: 'var(--muted-foreground)',
                  fontSize: 10.5,
                  lineHeight: 1.4,
                }}
              >
                Confirm the network and address carefully before saving.
              </p>
            </div>

            <motion.button
              type="button"
              whileTap={{
                scale: saving || !address.trim() ? 1 : 0.985,
              }}
              disabled={saving || !address.trim()}
              onClick={() => void add()}
              className="w-full h-[50px] rounded-2xl mt-4 flex items-center justify-center gap-2 font-bold text-[13px]"
              style={{
                background: address.trim()
                  ? 'var(--primary)'
                  : 'var(--muted)',
                color: address.trim()
                  ? 'var(--primary-foreground)'
                  : 'var(--muted-foreground)',
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? (
                <>
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                  Saving address...
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Add trusted address
                </>
              )}
            </motion.button>
          </div>
        </section>

        <section className="mt-7">
          <div className="flex items-center justify-between px-0.5 mb-2.5">
            <div>
              <p
                style={{
                  color: 'var(--foreground)',
                  fontSize: 13,
                  fontWeight: 750,
                }}
              >
                Saved addresses
              </p>

              <p
                className="mt-0.5"
                style={{
                  color: 'var(--muted-foreground)',
                  fontSize: 10.5,
                }}
              >
                {rows.length === 0
                  ? 'No trusted destinations'
                  : `${rows.length} trusted ${
                      rows.length === 1
                        ? 'destination'
                        : 'destinations'
                    }`}
              </p>
            </div>

            {refreshing && (
              <Loader2
                size={15}
                className="animate-spin"
                style={{ color: 'var(--muted-foreground)' }}
              />
            )}
          </div>

          {loading ? (
            <WhitelistSkeleton />
          ) : rows.length === 0 ? (
            <EmptyWhitelist />
          ) : (
            <div className="space-y-2">
              {rows.map((entry) => {
                const key = `${entry.chainType}:${entry.address}`;
                const chainInfo = CHAINS.find(
                  (item) => item.id === entry.chainType,
                );

                return (
                  <motion.div
                    key={key}
                    layout
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-[20px] px-3.5 py-3.5 flex items-center gap-3"
                    style={{
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-[13px] flex items-center justify-center shrink-0"
                      style={{
                        background: 'var(--muted)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <span
                        style={{
                          color: 'var(--foreground)',
                          fontSize: 9.5,
                          fontWeight: 800,
                          letterSpacing: 0.3,
                        }}
                      >
                        {chainInfo?.short ||
                          String(entry.chainType)
                            .slice(0, 3)
                            .toUpperCase()}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          style={{
                            color: 'var(--foreground)',
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          {chainInfo?.label ||
                            entry.chainType}
                        </span>

                        <span
                          className="w-1 h-1 rounded-full"
                          style={{
                            background:
                              'var(--muted-foreground)',
                          }}
                        />

                        <span
                          className="flex items-center gap-1"
                          style={{
                            color: 'var(--primary)',
                            fontSize: 9.5,
                            fontWeight: 700,
                          }}
                        >
                          <Check size={11} />
                          Trusted
                        </span>
                      </div>

                      <p
                        className="truncate mt-1"
                        title={entry.address}
                        style={{
                          color: 'var(--muted-foreground)',
                          fontSize: 11.5,
                          fontWeight: 550,
                          fontFamily:
                            'ui-monospace, SFMono-Regular, Menlo, monospace',
                        }}
                      >
                        {entry.address}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={removing === key}
                      onClick={() => setRemoveTarget(entry)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        background:
                          'color-mix(in oklab, var(--destructive, #ef4444) 8%, var(--card))',
                        border:
                          '1px solid color-mix(in oklab, var(--destructive, #ef4444) 16%, var(--border))',
                      }}
                      aria-label={`Remove ${chainInfo?.label || entry.chainType} address`}
                    >
                      {removing === key ? (
                        <Loader2
                          size={14}
                          className="animate-spin"
                          style={{
                            color:
                              'var(--destructive, #ef4444)',
                          }}
                        />
                      ) : (
                        <Trash2
                          size={14}
                          style={{
                            color:
                              'var(--destructive, #ef4444)',
                          }}
                        />
                      )}
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        <div
          className="flex items-start gap-2.5 mt-5 px-1"
          style={{
            color: 'var(--muted-foreground)',
          }}
        >
          <AlertCircle
            size={14}
            className="mt-0.5 shrink-0"
          />

          <p
            style={{
              fontSize: 10.5,
              lineHeight: 1.45,
            }}
          >
            A whitelist restricts withdrawals to approved destinations
            when whitelist enforcement is enabled for your account.
          </p>
        </div>
      </div>

      <AnimatePresence>
        {removeTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end"
            style={{
              background: 'rgba(0,0,0,.55)',
            }}
          >
            <motion.div
              initial={{ y: 40 }}
              animate={{ y: 0 }}
              exit={{ y: 40 }}
              className="w-full rounded-t-[28px] p-5 pb-8"
              style={{
                background: 'var(--card)',
                borderTop: '1px solid var(--border)',
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p
                    style={{
                      color: 'var(--foreground)',
                      fontSize: 17,
                      fontWeight: 800,
                    }}
                  >
                    Remove trusted address?
                  </p>

                  <p
                    className="mt-1"
                    style={{
                      color: 'var(--muted-foreground)',
                      fontSize: 12,
                      lineHeight: 1.45,
                    }}
                  >
                    This destination will no longer be available
                    for whitelisted withdrawals.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setRemoveTarget(null)}
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: 'var(--muted)',
                  }}
                >
                  <X
                    size={17}
                    style={{
                      color: 'var(--muted-foreground)',
                    }}
                  />
                </button>
              </div>

              <div
                className="mt-5 rounded-2xl p-3.5"
                style={{
                  background: 'var(--muted)',
                  border: '1px solid var(--border)',
                }}
              >
                <p
                  style={{
                    color: 'var(--muted-foreground)',
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  {String(
                    removeTarget.chainType,
                  ).toUpperCase()}
                </p>

                <p
                  className="mt-1.5 break-all"
                  style={{
                    color: 'var(--foreground)',
                    fontSize: 11.5,
                    lineHeight: 1.5,
                    fontFamily:
                      'ui-monospace, SFMono-Regular, Menlo, monospace',
                  }}
                >
                  {removeTarget.address}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-5">
                <button
                  type="button"
                  onClick={() => setRemoveTarget(null)}
                  className="h-[50px] rounded-2xl font-bold text-[13px]"
                  style={{
                    background: 'var(--muted)',
                    color: 'var(--foreground)',
                    border: '1px solid var(--border)',
                  }}
                >
                  Keep address
                </button>

                <motion.button
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  disabled={!!removing}
                  onClick={() =>
                    void remove(removeTarget)
                  }
                  className="h-[50px] rounded-2xl font-bold text-[13px] flex items-center justify-center gap-2"
                  style={{
                    background:
                      'var(--destructive, #ef4444)',
                    color: '#fff',
                    opacity: removing ? 0.65 : 1,
                  }}
                >
                  {removing ? (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  ) : (
                    <Trash2 size={16} />
                  )}
                  Remove
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function WhitelistSkeleton() {
  return (
    <div className="space-y-2">
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="rounded-[20px] px-3.5 py-3.5 flex items-center gap-3"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
          }}
        >
          <div
            className="w-10 h-10 rounded-[13px] animate-pulse"
            style={{
              background: 'var(--muted)',
            }}
          />

          <div className="flex-1">
            <div
              className="w-24 h-3 rounded animate-pulse"
              style={{
                background: 'var(--muted)',
              }}
            />

            <div
              className="w-40 max-w-full h-2.5 rounded mt-2 animate-pulse"
              style={{
                background: 'var(--muted)',
              }}
            />
          </div>

          <div
            className="w-9 h-9 rounded-xl animate-pulse"
            style={{
              background: 'var(--muted)',
            }}
          />
        </div>
      ))}
    </div>
  );
}

function EmptyWhitelist() {
  return (
    <div
      className="rounded-[22px] px-5 py-10 text-center"
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
      }}
    >
      <div
        className="mx-auto w-11 h-11 rounded-[14px] flex items-center justify-center"
        style={{
          background: 'var(--muted)',
          border: '1px solid var(--border)',
        }}
      >
        <Link2
          size={19}
          style={{
            color: 'var(--muted-foreground)',
          }}
        />
      </div>

      <p
        className="mt-3"
        style={{
          color: 'var(--foreground)',
          fontSize: 14,
          fontWeight: 750,
        }}
      >
        No trusted addresses
      </p>

      <p
        className="mt-1.5"
        style={{
          color: 'var(--muted-foreground)',
          fontSize: 11.5,
          lineHeight: 1.45,
        }}
      >
        Add a withdrawal destination above to keep it available
        for whitelist-protected withdrawals.
      </p>
    </div>
  );
}