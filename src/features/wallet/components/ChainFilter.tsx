import { motion } from 'motion/react';

export const CHAINS = ['All', 'Ethereum', 'Bitcoin', 'Solana', 'BSC', 'BASE'];

interface ChainFilterProps {
  activeChain: string;
  onSelect: (chain: string) => void;
}

/** Horizontal scroll of chain filter pills (All/Ethereum/Bitcoin/...) above the asset list. */
export function ChainFilter({ activeChain, onSelect }: ChainFilterProps) {
  return (
    <div className="mb-4">
      <div className="flex gap-2 px-5 overflow-x-auto pb-1">
        {CHAINS.map((chain) => (
          <motion.button
            key={chain}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(chain)}
            className="flex-shrink-0 px-4 py-2 rounded-full"
            style={{
              background: activeChain === chain ? 'var(--primary)' : 'var(--muted)',
              color: activeChain === chain ? '#FFF' : 'var(--muted-foreground)',
              fontSize: 12, fontWeight: 600,
            }}
          >
            {chain}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
