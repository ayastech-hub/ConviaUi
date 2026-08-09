import { motion } from 'motion/react';
import { useMemo } from 'react';
import { useTokenRegistry } from '../../../shared/hooks/useTokenRegistry';

interface ChainFilterProps {
  activeChain: string;
  onSelect: (chain: string) => void;
  /** Optional override; defaults to live registry chain names */
  chains?: string[];
}

/** Horizontal chain filter pills — driven by GET /chains when available. */
export function ChainFilter({ activeChain, onSelect, chains: chainsProp }: ChainFilterProps) {
  const { chains: registryChains } = useTokenRegistry();
  const chains = useMemo(() => {
    if (chainsProp?.length) return chainsProp;
    const names = registryChains
      .map((c) => c.name || c.chainName || c.key || c.chainKey || '')
      .filter(Boolean);
    return ['All', ...(names.length ? names : ['Ethereum', 'Bitcoin', 'Solana'])];
  }, [chainsProp, registryChains]);

  return (
    <div className="mb-4">
      <div className="flex gap-2 px-5 overflow-x-auto pb-1">
        {chains.map((chain) => (
          <motion.button
            key={chain}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(chain)}
            className="flex-shrink-0 px-4 py-2 rounded-full"
            style={{
              background: activeChain === chain ? 'var(--primary)' : 'var(--muted)',
              color: activeChain === chain ? '#FFF' : 'var(--muted-foreground)',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {chain}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

/** @deprecated use live registry via ChainFilter */
export const CHAINS = ['All', 'Ethereum', 'Bitcoin', 'Solana', 'BSC', 'BASE'];
