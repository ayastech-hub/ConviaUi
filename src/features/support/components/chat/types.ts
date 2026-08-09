export interface Message {
  id: string;
  text: string;
  sender: 'me' | 'them';
  time: string;
  type?: 'text' | 'payment';
  payment?: { amount: string; asset: string; status: 'pending' | 'confirmed' };
}

export const initialMessages: Message[] = [
  { id: '1', text: 'Hey! Can you send me that 0.1 ETH we talked about?', sender: 'them', time: '10:23 AM' },
  { id: '2', text: 'Sure, sending now! Give me a sec', sender: 'me', time: '10:25 AM' },
  { id: '3', text: 'Sent!', sender: 'me', time: '10:26 AM', type: 'payment', payment: { amount: '0.1', asset: 'ETH', status: 'confirmed' } },
  { id: '4', text: "Got it! Thanks man, you're the best", sender: 'them', time: '10:27 AM' },
  { id: '5', text: 'SOL looking bullish today, check that 4H', sender: 'them', time: '10:30 AM' },
  { id: '6', text: 'Yeah just bought more at $175', sender: 'me', time: '10:31 AM' },
];

export interface ChatAsset {
  symbol: string;
  name: string;
  balance: string;
  icon: string;
}

export const assets: ChatAsset[] = [
  { symbol: 'USDT', name: 'Tether', balance: '12,450.00', icon: '$' },
  { symbol: 'BTC', name: 'Bitcoin', balance: '0.4821', icon: '₿' },
  { symbol: 'ETH', name: 'Ethereum', balance: '3.214', icon: 'Ξ' },
  { symbol: 'SOL', name: 'Solana', balance: '45.6', icon: '◎' },
  { symbol: 'USDC', name: 'USD Coin', balance: '8,200.00', icon: '$' },
];
