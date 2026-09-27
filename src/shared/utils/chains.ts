/** Map UI network labels / keys → backend chainKey + chainFamily. */

export type ResolvedChain = {
  chainKey: string;
  chainFamily: 'evm' | 'solana' | 'bitcoin' | 'tron' | 'ton';
};

const KEY_ALIASES: Record<string, string> = {
  eth: 'ethereum',
  ethereum: 'ethereum',
  mainnet: 'ethereum',
  sepolia: 'sepolia',
  ethereumsepolia: 'sepolia',
  ethsepolia: 'sepolia',
  'ethereum-sepolia': 'sepolia',
  polygon: 'polygon',
  matic: 'polygon',
  bsc: 'bnb',
  bnbsmartchain: 'bnb',
  bnb: 'bnb',
  base: 'base',
  basesepolia: 'base',
  arbitrum: 'arbitrum',
  optimism: 'optimism',
  sol: 'solana',
  solana: 'solana',
  bitcoin: 'bitcoin',
  btc: 'bitcoin',
  tron: 'tron',
  trx: 'tron',
  ton: 'ton',
  toncoin: 'ton',
  theopennetwork: 'ton',
};

function familyForKey(key: string): ResolvedChain['chainFamily'] {
  const k = key.toLowerCase();
  if (k === 'solana' || k === 'solana-devnet') return 'solana';
  if (k === 'bitcoin' || k === 'bitcoin-testnet') return 'bitcoin';
  if (k === 'tron' || k === 'nile' || k === 'shasta') return 'tron';
  if (k === 'ton' || k === 'ton-testnet') return 'ton';
  return 'evm';
}

/**
 * Prefer passing a real registry chainKey (sepolia, ethereum, bnb, ton…).
 * Labels like "Ethereum Sepolia" / "TON" are normalized too.
 */
export function resolveChain(networkOrKey: string): ResolvedChain {
  const raw = (networkOrKey || '').trim();
  const n = raw.toLowerCase().replace(/\s+/g, '');

  if (['ethereum', 'sepolia', 'bnb', 'base', 'polygon', 'solana', 'solana-devnet', 'tron', 'nile', 'bitcoin', 'bitcoin-testnet', 'ton', 'ton-testnet'].includes(n)) {
    return { chainKey: n, chainFamily: familyForKey(n) };
  }

  if (n.includes('sepolia')) {
    return { chainKey: 'sepolia', chainFamily: 'evm' };
  }
  if (n.includes('nile')) return { chainKey: 'nile', chainFamily: 'tron' };
  if (n.includes('devnet') && n.includes('sol')) return { chainKey: 'solana-devnet', chainFamily: 'solana' };
  if (n.includes('ton') && n.includes('test')) return { chainKey: 'ton-testnet', chainFamily: 'ton' };
  if (n.includes('bitcoin') && n.includes('test')) return { chainKey: 'bitcoin-testnet', chainFamily: 'bitcoin' };
  if (n.includes('ton') || n === 'gram') {
    return { chainKey: 'ton', chainFamily: 'ton' };
  }
  if (n.includes('sol')) return { chainKey: 'solana', chainFamily: 'solana' };
  if (n.includes('bitcoin') || n === 'btc') return { chainKey: 'bitcoin', chainFamily: 'bitcoin' };
  if (n.includes('tron') || n === 'trx') return { chainKey: 'tron', chainFamily: 'tron' };
  if (n.includes('polygon') || n === 'matic') return { chainKey: 'polygon', chainFamily: 'evm' };
  if (n.includes('bsc') || n.includes('bnb')) return { chainKey: 'bnb', chainFamily: 'evm' };
  if (n.includes('base')) return { chainKey: 'base', chainFamily: 'evm' };
  if (n.includes('arbitrum')) return { chainKey: 'arbitrum', chainFamily: 'evm' };

  const aliased = KEY_ALIASES[n];
  if (aliased) return { chainKey: aliased, chainFamily: familyForKey(aliased) };

  if (n.includes('eth')) return { chainKey: 'ethereum', chainFamily: 'evm' };

  return { chainKey: 'ethereum', chainFamily: 'evm' };
}

export function chainFamilyForKey(chainKey: string): ResolvedChain['chainFamily'] {
  return familyForKey(chainKey.toLowerCase());
}
