/** Map UI network labels → backend chainKey + chainFamily. */
export function resolveChain(networkOrKey: string): { chainKey: string; chainFamily: 'evm' | 'solana' | 'bitcoin' | 'tron' } {
  const n = networkOrKey.toLowerCase().replace(/\s+/g, '');
  if (n.includes('sol')) return { chainKey: 'solana', chainFamily: 'solana' };
  if (n.includes('bitcoin') || n === 'btc') return { chainKey: 'bitcoin', chainFamily: 'bitcoin' };
  if (n.includes('tron') || n === 'trx') return { chainKey: 'tron', chainFamily: 'tron' };
  if (n.includes('polygon') || n === 'matic') return { chainKey: 'polygon', chainFamily: 'evm' };
  if (n.includes('bsc') || n.includes('bnb')) return { chainKey: 'bsc', chainFamily: 'evm' };
  if (n.includes('base')) return { chainKey: 'base', chainFamily: 'evm' };
  if (n.includes('arbitrum')) return { chainKey: 'arbitrum', chainFamily: 'evm' };
  return { chainKey: 'ethereum', chainFamily: 'evm' };
}
