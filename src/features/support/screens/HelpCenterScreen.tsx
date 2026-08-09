import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft, Search, ChevronRight, MessageCircle, Shield, CreditCard,
  TrendingUp, User, Zap, HelpCircle, X, Send, Check, CheckCheck,
} from 'lucide-react';

interface HelpCenterScreenProps {
  goBack: () => void;
}

const categories = [
  { icon: User, title: 'Account & Profile', desc: 'Setup, verification, login issues', key: 'Account', count: 12 },
  { icon: CreditCard, title: 'Payments & Banking', desc: 'Deposits, withdrawals, bank accounts', key: 'Payments', count: 18 },
  { icon: TrendingUp, title: 'Trading & Swaps', desc: 'Buy, sell, swap, OTC trading', key: 'Trading', count: 15 },
  { icon: Shield, title: 'Security & Privacy', desc: 'PIN, 2FA, biometrics, recovery', key: 'Security', count: 9 },
  { icon: Zap, title: 'On-Ramp & Off-Ramp', desc: 'Cash to crypto, crypto to cash', key: 'On-Ramp', count: 11 },
  { icon: HelpCircle, title: 'General FAQ', desc: 'Common questions and guides', key: 'General', count: 24 },
];

const allArticles = [
  // ── Account (12) ──
  { title: 'How to verify your identity (KYC)', category: 'Account', time: '3 min read', steps: ['Go to Profile > KYC Verification', 'Select your country and document type', 'Take a clear photo of your ID', 'Take a selfie when prompted', 'Wait 1-5 minutes for verification'] },
  { title: 'How to recover your account', category: 'Account', time: '3 min read', steps: ['Tap "Forgot Password" on the login screen', 'Enter your registered email or phone', 'Check your email/SMS for a recovery code', 'Enter the code and set a new password', 'If you lost 2FA, contact support@convia.app'] },
  { title: 'Creating your Convia account', category: 'Account', time: '2 min read', steps: ['Tap "Sign Up" on the welcome screen', 'Enter your email and create a strong password', 'Verify your email address', 'Set your display name and profile photo', 'You are ready to start using Convia'] },
  { title: 'Updating your profile photo and name', category: 'Account', time: '1 min read', steps: ['Go to Profile > Edit Profile', 'Tap your photo to upload a new image', 'Edit your display name', 'Tap Save to confirm changes', 'Your profile updates instantly'] },
  { title: 'Changing your password', category: 'Account', time: '2 min read', steps: ['Go to Settings > Security > Change Password', 'Enter your current password', 'Enter your new password twice', 'Tap Confirm', 'You will be logged out and need to log in with the new password'] },
  { title: 'Linking your phone number', category: 'Account', time: '2 min read', steps: ['Go to Profile > Edit Profile > Phone', 'Enter your phone number', 'Enter the 6-digit SMS code to verify', 'Your phone is now linked for recovery and 2FA', 'You can change it anytime in Settings'] },
  { title: 'Switching between light and dark mode', category: 'Account', time: '1 min read', steps: ['Go to Settings from the bottom nav', 'Toggle "Dark Mode" on or off', 'The app switches instantly', 'Your preference is saved automatically', 'You can also let it follow your system setting'] },
  { title: 'Changing your display currency', category: 'Account', time: '1 min read', steps: ['Go to Settings > Currency', 'Select from NGN, GHS, KES, UGX, ZAR, XOF, XAF', 'All balances and prices update instantly', 'Your selection is saved across sessions', 'You can change it anytime'] },
  { title: 'Deleting your account', category: 'Account', time: '3 min read', steps: ['Go to Settings > Account > Delete Account', 'Read the warning carefully', 'Withdraw all funds before deletion', 'Enter your password to confirm', 'Account deletion is permanent and cannot be undone'] },
  { title: 'Managing notification preferences', category: 'Account', time: '2 min read', steps: ['Go to Settings > Notifications', 'Toggle categories on or off (price alerts, security, social, rewards)', 'Choose push or in-app notifications', 'Tap Save', 'You will only receive the notifications you enabled'] },
  { title: 'Transferring your account to a new phone', category: 'Account', time: '3 min read', steps: ['Install Convia on your new phone', 'Log in with your email and password', 'Complete 2FA verification', 'Re-enable biometric login on the new device', 'Your portfolio and history are restored automatically'] },
  { title: 'Understanding account limits', category: 'Account', time: '2 min read', steps: ['Unverified accounts have a $500 daily limit', 'KYC Level 1 raises the limit to $5,000 daily', 'KYC Level 2 unlocks unlimited trading', 'Limits apply to deposits, withdrawals, and trades', 'Check your current limit in Profile > Verification'] },

  // ── Payments (18) ──
  { title: 'Adding a bank account for withdrawals', category: 'Payments', time: '2 min read', steps: ['Go to Profile > Payment Methods', 'Tap "Add Bank Account"', 'Enter your bank name and account number', 'Verify with a small test deposit', 'Your bank account is now ready for withdrawals'] },
  { title: 'Withdrawing crypto to an external wallet', category: 'Payments', time: '2 min read', steps: ['Go to Wallet and select your asset', 'Tap "Withdraw"', 'Enter the destination wallet address', 'Select the correct network (e.g. ERC-20, BEP-20)', 'Enter the amount and confirm with your PIN', 'Withdrawal typically completes in 5-30 minutes'] },
  { title: 'How to deposit fiat into your Convia wallet', category: 'Payments', time: '2 min read', steps: ['Tap "Deposit" from the home screen', 'Select your currency (NGN, GHS, KES, etc.)', 'Choose a payment method (bank transfer or card)', 'Enter the amount and confirm', 'Funds appear in your wallet within minutes'] },
  { title: 'Adding a debit or credit card', category: 'Payments', time: '2 min read', steps: ['Go to Profile > Payment Methods', 'Tap "Add Card"', 'Enter your card number, expiry, and CVV', 'Verify with an OTP from your bank', 'Your card is ready for instant purchases'] },
  { title: 'Removing a payment method', category: 'Payments', time: '1 min read', steps: ['Go to Profile > Payment Methods', 'Tap the method you want to remove', 'Tap "Remove" and confirm', 'The method is removed instantly', 'Pending transactions are not affected'] },
  { title: 'Understanding withdrawal limits and processing times', category: 'Payments', time: '3 min read', steps: ['Bank transfer withdrawals take 1-3 business days', 'Crypto withdrawals take 5-30 minutes depending on network', 'Daily withdrawal limits depend on your KYC level', 'Minimum withdrawal is $10 for bank, $5 for crypto', 'Large withdrawals may require additional verification'] },
  { title: 'Why is my withdrawal pending?', category: 'Payments', time: '2 min read', steps: ['Withdrawals may be pending due to network congestion', 'Bank withdrawals may require manual review for large amounts', 'Check the transaction status in Wallet > History', 'If pending for over 24 hours, contact support', 'Never share your PIN or OTP with anyone'] },
  { title: 'How to track a transaction', category: 'Payments', time: '1 min read', steps: ['Go to Wallet > History', 'Find your transaction in the list', 'Tap it to view full details', 'For crypto, tap the transaction hash to view on the blockchain', 'You will see the current status and confirmations'] },
  { title: 'Receiving crypto from another wallet', category: 'Payments', time: '2 min read', steps: ['Tap "Receive" from the home screen', 'Select the cryptocurrency you want to receive', 'Share your QR code or wallet address with the sender', 'Ask the sender to use the correct network', 'Funds arrive once the transaction is confirmed on-chain'] },
  { title: 'What to do if a deposit is missing', category: 'Payments', time: '3 min read', steps: ['Check the transaction status on the blockchain explorer', 'Ensure the sender used the correct network', 'Wait at least 30 minutes for network confirmations', 'If still missing after 1 hour, go to Help Center > Chat', 'Provide the transaction hash and sender details to support'] },
  { title: 'Bank transfer troubleshooting', category: 'Payments', time: '3 min read', steps: ['Ensure your bank account name matches your Convia account name', 'Check that your bank supports the transfer type', 'Verify the account number is correct', 'Some banks may block crypto-related transfers — contact your bank', 'If the issue persists, try a different bank account'] },
  { title: 'Understanding transaction fees', category: 'Payments', time: '3 min read', steps: ['Bank deposit fees: free for bank transfers, 1.5% for cards', 'Crypto withdrawal fees depend on the network (e.g. ERC-20 is higher)', 'Swap fees: 0.3% per trade', 'OTC trades: 1% fee per transaction', 'All fees are shown before you confirm any transaction'] },
  { title: 'How to set up mobile money payments', category: 'Payments', time: '2 min read', steps: ['Go to Profile > Payment Methods', 'Tap "Add Mobile Money"', 'Select your provider (MTN, Airtel, MoMo, etc.)', 'Enter your mobile money number', 'Verify with a PIN sent to your phone'] },
  { title: 'Cancelling a pending transaction', category: 'Payments', time: '2 min read', steps: ['Go to Wallet > History', 'Find the pending transaction', 'Tap it and select "Cancel" if available', 'Bank transfers cannot be cancelled once submitted', 'Crypto transactions cannot be cancelled once broadcast'] },
  { title: 'How chargebacks work', category: 'Payments', time: '3 min read', steps: ['Card payments may be eligible for chargeback via your bank', 'Contact your bank within 30 days of the transaction', 'Provide the transaction ID and reason for dispute', 'Convia will cooperate with the bank investigation', 'Chargeback fraud is reported to authorities'] },
  { title: 'Setting up automatic deposits', category: 'Payments', time: '2 min read', steps: ['Go to Settings > Auto-Deposit', 'Select the asset and amount', 'Choose frequency (weekly, monthly)', 'Select your payment method', 'Funds are deposited automatically on schedule'] },
  { title: 'Payment method verification process', category: 'Payments', time: '2 min read', steps: ['New payment methods require verification', 'Bank accounts: a small test deposit is sent', 'Cards: an OTP from your bank confirms ownership', 'Mobile money: a PIN sent to your phone', 'Verification takes 1-5 minutes'] },
  { title: 'Using multiple bank accounts', category: 'Payments', time: '2 min read', steps: ['You can add up to 5 bank accounts', 'Go to Profile > Payment Methods > Add', 'Each account must be verified separately', 'Set a default account for withdrawals', 'Switch between accounts when making a withdrawal'] },

  // ── Trading (15) ──
  { title: 'Trading on the OTC P2P marketplace', category: 'Trading', time: '5 min read', steps: ['Go to the OTC tab from the bottom nav', 'Browse listings or create your own', 'Select a listing and enter the amount', 'Choose your payment method', 'Confirm the trade — funds are held in escrow', 'Mark payment as made once you pay the seller', 'Seller confirms receipt and crypto is released to you'] },
  { title: 'How to swap between cryptocurrencies', category: 'Trading', time: '2 min read', steps: ['Tap Swap from the home screen', 'Select the asset you want to swap from', 'Select the asset you want to receive', 'Enter the amount and check the rate', 'Review price impact and slippage', 'Confirm the swap — it completes in seconds'] },
  { title: 'How to buy your first cryptocurrency', category: 'Trading', time: '3 min read', steps: ['Tap "Buy Crypto" from the home screen', 'Select the cryptocurrency you want to buy', 'Enter the amount in your local currency or crypto', 'Choose a payment method (bank transfer, card, mobile money)', 'Review the rate and fees', 'Confirm the purchase — crypto arrives in your wallet instantly'] },
  { title: 'How to sell cryptocurrency for cash', category: 'Trading', time: '3 min read', steps: ['Tap "Sell Crypto" from the home screen', 'Select the cryptocurrency you want to sell', 'Enter the amount to sell', 'Choose your withdrawal method (bank or mobile money)', 'Review the rate and fees', 'Confirm — cash arrives in your account in 1-3 business days'] },
  { title: 'Understanding price charts and market data', category: 'Trading', time: '4 min read', steps: ['Tap any asset on the Markets list to open its detail page', 'View the price chart with 1D, 1W, 1M, and 1Y ranges', 'Green candles indicate price increase, red indicates decrease', 'Check volume, market cap, and 24h change', 'Use the chart to inform your trading decisions — not financial advice'] },
  { title: 'Setting price alerts', category: 'Trading', time: '2 min read', steps: ['Open any token detail page', 'Tap the bell icon to set an alert', 'Enter your target price', 'Choose above or below the current price', 'You will be notified when the price is reached'] },
  { title: 'Understanding slippage and price impact', category: 'Trading', time: '3 min read', steps: ['Slippage is the difference between expected and actual price', 'Large swaps move the market, increasing slippage', 'Convia sets a default slippage tolerance of 1%', 'You can adjust slippage in Swap settings', 'If slippage exceeds your tolerance, the swap fails and funds are returned'] },
  { title: 'How to create an OTC listing', category: 'Trading', time: '3 min read', steps: ['Go to OTC > Create Listing', 'Choose Buy or Sell', 'Select the cryptocurrency and amount', 'Set your price and accepted payment methods', 'Publish the listing — it appears in the marketplace', 'Wait for a buyer or seller to accept'] },
  { title: 'OTC dispute resolution', category: 'Trading', time: '4 min read', steps: ['If a trade goes wrong, tap "Dispute" in the trade chat', 'Provide evidence (payment receipt, chat logs)', 'Convia support reviews the case within 24 hours', 'Escrow funds are held until resolution', 'Both parties are notified of the decision'] },
  { title: 'Understanding market orders vs limit orders', category: 'Trading', time: '3 min read', steps: ['Market orders execute immediately at the current price', 'Limit orders execute only when the price reaches your target', 'Convia OTC uses market-style matching for instant trades', 'Limit orders are available on the Swap screen', 'Choose the order type that fits your strategy'] },
  { title: 'How to use the token detail page', category: 'Trading', time: '2 min read', steps: ['Tap any token in the Markets list', 'View the full chart, stats, and description', 'Use the Buy and Sell panel to trade directly', 'Switch between tokens using the dropdown', 'Check the About section for project information'] },
  { title: 'Trading safety tips', category: 'Trading', time: '3 min read', steps: ['Never trade more than you can afford to lose', 'Always verify the recipient address before sending', 'Use escrow for all OTC trades', 'Enable 2FA to protect your account', 'Be wary of offers that seem too good to be true'] },
  { title: 'Understanding candlestick charts', category: 'Trading', time: '4 min read', steps: ['Each candle shows open, high, low, and close prices for a period', 'Green candles: close price is higher than open', 'Red candles: close price is lower than open', 'Wicks show the highest and lowest prices reached', 'Patterns can indicate trends — but past performance does not guarantee future results'] },
  { title: 'How to read order book depth', category: 'Trading', time: '3 min read', steps: ['The order book shows buy and sell orders at different prices', 'Green side: buy orders (bids)', 'Red side: sell orders (asks)', 'The spread is the gap between the best bid and ask', 'A deep order book means more liquidity and less slippage'] },
  { title: 'Tax reporting for crypto trades', category: 'Trading', time: '3 min read', steps: ['Convia provides a transaction history export in Settings', 'Download your CSV or PDF report', 'Each trade shows date, asset, amount, and value', 'Consult a local tax professional for your obligations', 'Keep records of all trades for tax season'] },

  // ── Security (9) ──
  { title: 'How to enable two-factor authentication', category: 'Security', time: '1 min read', steps: ['Go to Profile > Security', 'Tap "Two-Factor Authentication"', 'Enter your phone number', 'Enter the 6-digit code sent via SMS', '2FA is now enabled for all transactions'] },
  { title: 'Setting up biometric login', category: 'Security', time: '1 min read', steps: ['Go to Profile > Security', 'Enable "Biometric Login"', 'Authenticate with Face ID or fingerprint', 'You can now log in with biometrics', 'You can disable this anytime in Settings'] },
  { title: 'Understanding escrow protection', category: 'Security', time: '3 min read', steps: ['Escrow protects both parties in OTC trades', 'When you start a trade, crypto is locked in escrow', 'Funds are only released when both parties confirm', 'If there is a dispute, Convia support mediates', 'Never release escrow before confirming payment'] },
  { title: 'How to recognize and avoid scams', category: 'Security', time: '4 min read', steps: ['Never share your PIN, password, or 2FA code with anyone', 'Convia staff will never ask for your password', 'Be wary of unsolicited investment offers', 'Always verify wallet addresses before sending', 'Report suspicious activity to support immediately'] },
  { title: 'What to do if your account is compromised', category: 'Security', time: '3 min read', steps: ['Immediately change your password', 'Disable trusted devices in Settings > Security', 'Contact support via Help Center > Chat', 'Freeze your account if available', 'Review recent transactions and report unauthorized activity'] },
  { title: 'Managing trusted devices', category: 'Security', time: '2 min read', steps: ['Go to Settings > Security > Trusted Devices', 'View all devices logged into your account', 'Tap "Remove" on any unfamiliar device', 'The device is logged out instantly', 'You will need to log in again on removed devices'] },
  { title: 'How transaction PINs work', category: 'Security', time: '2 min read', steps: ['Your transaction PIN is a 4-digit code for confirming trades', 'It is separate from your login password', 'Set it up in Profile > Security > Transaction PIN', 'You must enter it for every withdrawal, swap, and trade', 'Never share it with anyone — not even Convia support'] },
  { title: 'Recovering a lost 2FA device', category: 'Security', time: '3 min read', steps: ['Go to the login screen and tap "Lost 2FA?"', 'Verify your identity with your email and ID', 'Contact support to complete verification', 'Once verified, 2FA is reset on your account', 'Set up 2FA on your new device immediately'] },
  { title: 'Data privacy and your information', category: 'Security', time: '3 min read', steps: ['Convia encrypts all personal data at rest and in transit', 'Your KYC documents are stored securely and access-restricted', 'We never sell your data to third parties', 'You can request a data export or deletion anytime', 'Read our full privacy policy in Settings > About'] },

  // ── On-Ramp (11) ──
  { title: 'Understanding on-ramp fees and rates', category: 'On-Ramp', time: '4 min read', steps: ['On-ramp fees range from 1.5% to 3% depending on payment method', 'Bank transfers have the lowest fees', 'Card payments are instant but have higher fees', 'Rates are locked for 15 minutes after quoting', 'No hidden fees — all costs are shown before payment'] },
  { title: 'How to buy crypto with bank transfer', category: 'On-Ramp', time: '3 min read', steps: ['Tap "Buy Crypto" from the home screen', 'Select your cryptocurrency', 'Choose "Bank Transfer" as the payment method', 'Enter the amount and confirm', 'Transfer funds to the provided account', 'Crypto is released once the transfer is confirmed'] },
  { title: 'How to buy crypto with card', category: 'On-Ramp', time: '2 min read', steps: ['Tap "Buy Crypto" from the home screen', 'Select your cryptocurrency', 'Choose "Debit/Credit Card" as the payment method', 'Enter your card details or select a saved card', 'Confirm the purchase — crypto arrives instantly'] },
  { title: 'How to buy crypto with mobile money', category: 'On-Ramp', time: '2 min read', steps: ['Tap "Buy Crypto" from the home screen', 'Select your cryptocurrency', 'Choose "Mobile Money" as the payment method', 'Enter your mobile money number', 'Approve the payment in your mobile money app', 'Crypto arrives in your wallet within minutes'] },
  { title: 'Off-ramp: converting crypto to cash', category: 'On-Ramp', time: '3 min read', steps: ['Tap "Sell Crypto" from the home screen', 'Select the cryptocurrency to sell', 'Enter the amount', 'Choose your payout method (bank or mobile money)', 'Confirm — funds arrive in 1-3 business days'] },
  { title: 'Understanding exchange rates', category: 'On-Ramp', time: '3 min read', steps: ['Rates are sourced from multiple exchanges for the best price', 'The rate you see includes Convia spread (typically 0.5-1%)', 'Rates update every few seconds', 'Your rate is locked for 15 minutes after quoting', 'Large orders may get a custom OTC rate'] },
  { title: 'Minimum and maximum purchase limits', category: 'On-Ramp', time: '2 min read', steps: ['Minimum purchase: $5 (or local equivalent)', 'Maximum depends on your KYC level', 'Unverified: $500/day', 'KYC Level 1: $5,000/day', 'KYC Level 2: unlimited'] },
  { title: 'What networks are supported for on-ramp?', category: 'On-Ramp', time: '2 min read', steps: ['BTC: Bitcoin network', 'ETH: ERC-20', 'USDT: ERC-20, BEP-20, and Solana', 'USDC: ERC-20 and Solana', 'SOL: Solana network', 'Always confirm the network before purchasing'] },
  { title: 'Why did my on-ramp order fail?', category: 'On-Ramp', time: '3 min read', steps: ['Card decline: check with your bank or try a different card', 'Bank transfer: ensure the exact amount was sent', 'Mobile money: check your balance and try again', 'Network issues: wait a few minutes and retry', 'If the problem persists, contact support with your order ID'] },
  { title: 'How long does on-ramp take?', category: 'On-Ramp', time: '2 min read', steps: ['Card payments: instant', 'Bank transfers: 1-30 minutes', 'Mobile money: 1-5 minutes', 'Large orders may require additional verification', 'Check status in Wallet > History'] },
  { title: 'Off-ramp processing times by country', category: 'On-Ramp', time: '3 min read', steps: ['Nigeria (NGN): 1-2 business days', 'Ghana (GHS): 1-3 business days', 'Kenya (KES): instant to 1 business day via M-Pesa', 'Uganda (UGX): 1-2 business days', 'South Africa (ZAR): 1-2 business days'] },

  // ── General (24) ──
  { title: 'How referral rewards work', category: 'General', time: '2 min read', steps: ['Go to Rewards > Invite Friends', 'Share your referral code or link', 'Your friend must sign up and complete KYC', 'You both receive 500 points', 'Points can be redeemed for USDT at 1,000 pts = $1'] },
  { title: 'Supported countries and currencies', category: 'General', time: '2 min read', steps: ['Convia supports 12+ African countries', 'Supported currencies include NGN, GHS, KES, UGX, ZAR, XOF, XAF and more', 'Crypto support includes BTC, ETH, USDT, USDC, SOL', 'New countries are added regularly', 'Check Settings > Region for your country'] },
  { title: 'What is Convia?', category: 'General', time: '3 min read', steps: ['Convia is a crypto wallet built for Africa', 'Buy, sell, swap, and store cryptocurrency', 'On-ramp and off-ramp to local currencies', 'OTC P2P marketplace for direct trading', 'Social features to connect with other traders'] },
  { title: 'Getting started guide for new users', category: 'General', time: '5 min read', steps: ['Download and install Convia', 'Create an account with your email', 'Complete KYC verification', 'Add a payment method', 'Buy your first cryptocurrency', 'Explore the OTC marketplace and social features'] },
  { title: 'How to use the QR scanner', category: 'General', time: '1 min read', steps: ['Tap the scan icon in the top right of the home screen', 'Point your camera at the QR code', 'The app detects wallet addresses and payment requests automatically', 'For wallet addresses, you are taken to the Send screen pre-filled', 'For payment requests, the amount is pre-filled'] },
  { title: 'Earning and redeeming reward points', category: 'General', time: '3 min read', steps: ['Earn points by trading, referring friends, and completing tasks', 'Check your balance in Rewards > Points', 'Redeem points for USDT at 1,000 pts = $1', 'Minimum redemption: 5,000 points', 'Points expire 12 months after earning'] },
  { title: 'How to share your referral link', category: 'General', time: '2 min read', steps: ['Go to Rewards > Invite Friends', 'Tap "Share Link"', 'Choose a sharing method (WhatsApp, X, copy link)', 'Your friend uses the link to sign up', 'You both get 500 points after they complete KYC'] },
  { title: 'Understanding the Convia social feed', category: 'General', time: '3 min read', steps: ['The Social tab shows posts from traders you follow', 'Share your trades, analysis, and milestones', 'Like, comment, and share posts', 'Discover new traders in the Discover tab', 'Message your contacts in the Messages tab'] },
  { title: 'How to follow other traders', category: 'General', time: '1 min read', steps: ['Open a user profile from a post or message', 'Tap "Follow"', 'Their posts appear in your feed', 'You can unfollow anytime', 'Your following list is visible on your profile'] },
  { title: 'Posting on the social feed', category: 'General', time: '2 min read', steps: ['Go to the Social tab', 'Tap the compose button', 'Write your post or share a trade', 'Add tags to reach more people', 'Tap Post — your followers will see it'] },
  { title: 'How to contact support', category: 'General', time: '1 min read', steps: ['Go to Help Center from the profile menu', 'Tap "Start a Conversation"', 'Chat with our support team 24/7', 'Provide your issue and transaction details', 'Support typically responds within minutes'] },
  { title: 'App updates and new features', category: 'General', time: '2 min read', steps: ['Convia updates regularly with new features', 'Updates are automatic if auto-update is enabled', 'Check Settings > About for your current version', 'Follow our social channels for announcements', 'Report bugs via Help Center > Chat'] },
  { title: 'Why is my balance different from the market price?', category: 'General', time: '2 min read', steps: ['Your balance shows the current market value of your holdings', 'Crypto prices fluctuate constantly', 'The value updates every few seconds', 'Your actual holdings (amount of crypto) do not change unless you trade', 'Check the Markets tab for live prices'] },
  { title: 'Can I use Convia without KYC?', category: 'General', time: '2 min read', steps: ['You can create an account without KYC', 'Without KYC, you have a $500 daily limit', 'You can receive crypto without KYC', 'KYC is required for deposits, withdrawals, and trading', 'Complete KYC to unlock full features'] },
  { title: 'What cryptocurrencies are supported?', category: 'General', time: '2 min read', steps: ['Bitcoin (BTC)', 'Ethereum (ETH)', 'Tether (USDT) on multiple networks', 'USD Coin (USDC) on multiple networks', 'Solana (SOL)', 'More assets are added regularly'] },
  { title: 'How to report a bug', category: 'General', time: '2 min read', steps: ['Go to Help Center > Chat', 'Describe the bug with steps to reproduce', 'Include screenshots if possible', 'Mention your device and app version', 'Our team investigates and responds'] },
  { title: 'Is Convia available on iOS and Android?', category: 'General', time: '1 min read', steps: ['Convia is available on both iOS and Android', 'Download from the App Store or Google Play', 'The web version is also available at convia.app', 'All versions sync automatically', 'Your account works across all devices'] },
  { title: 'How to change your language', category: 'General', time: '1 min read', steps: ['Go to Settings > Language', 'Choose from English, French, Swahili, and more', 'The app switches instantly', 'Your preference is saved automatically', 'New languages are added regularly'] },
  { title: 'What are gas fees and who pays them?', category: 'General', time: '3 min read', steps: ['Gas fees are network transaction costs for blockchain operations', 'For withdrawals, you pay the gas fee', 'For swaps, the fee is included in the slippage', 'For on-ramp/off-ramp, Convia covers the network fee', 'Gas fees vary by network and congestion'] },
  { title: 'How to enable dark mode', category: 'General', time: '1 min read', steps: ['Go to Settings', 'Toggle "Dark Mode" on', 'The app switches to a dark color scheme', 'Easier on the eyes in low light', 'You can also follow your system setting'] },
  { title: 'Understanding portfolio performance', category: 'General', time: '3 min read', steps: ['Your portfolio value is the total worth of all your holdings', 'The 24h change shows how much your portfolio changed in 24 hours', 'Check the chart on the home screen for trends', 'Diversification can reduce risk', 'Past performance does not guarantee future results'] },
  { title: 'How to use the Convia wallet', category: 'General', time: '3 min read', steps: ['The Wallet tab shows all your crypto holdings', 'Tap any asset to see details and transactions', 'Use Send to transfer out and Receive to get funds', 'Swap between assets instantly', 'Buy and sell directly from the wallet'] },
  { title: 'What is slippage tolerance?', category: 'General', time: '2 min read', steps: ['Slippage tolerance is the maximum price change you accept on a swap', 'Default is 1%', 'Higher tolerance means more likely to succeed but worse price', 'Lower tolerance means better price or the swap fails', 'Adjust in Swap settings before confirming'] },
  { title: 'How does Convia make money?', category: 'General', time: '2 min read', steps: ['Convia charges small fees on transactions', 'On-ramp/off-ramp: 1.5-3% depending on method', 'Swaps: 0.3% per trade', 'OTC trades: 1% per transaction', 'We do not sell your data — fees are our only revenue model'] },
];

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'support';
  time: string;
  status?: 'sent' | 'delivered' | 'read';
}

const initialMessages: ChatMessage[] = [
  { id: '1', text: 'Hi there! Welcome to Convia Support. How can I help you today?', sender: 'support', time: 'Just now', status: 'read' },
];

const quickReplies = [
  'I have a withdrawal issue',
  'My KYC is pending',
  'I was charged a wrong fee',
  'I cannot log in',
];

const botResponses: Record<string, string> = {
  'withdrawal': 'I understand you are having a withdrawal issue. Could you please share the transaction ID or the asset you are trying to withdraw? I will look into it right away.',
  'kyc': 'For KYC pending issues, verification typically takes 1-5 minutes. If it has been longer, please ensure your document photo is clear and all corners are visible. I can escalate this to our verification team if needed.',
  'fee': 'I am sorry about the fee concern. All our fees are transparent and shown before each transaction. Could you tell me which transaction had the incorrect fee so I can investigate?',
  'login': 'For login issues, please try resetting your password using the "Forgot Password" link. If you have 2FA enabled and cannot access it, I can help you recover your account securely.',
};

function getBotResponse(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('withdraw')) return botResponses.withdrawal;
  if (lower.includes('kyc') || lower.includes('verif')) return botResponses.kyc;
  if (lower.includes('fee') || lower.includes('charge')) return botResponses.fee;
  if (lower.includes('login') || lower.includes('log in') || lower.includes('password')) return botResponses.login;
  return 'Thank you for reaching out. I have noted your concern and our team will look into this. Is there anything else I can help you with?';
}

export function HelpCenterScreen({ goBack }: HelpCenterScreenProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<typeof allArticles[0] | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredArticles = allArticles.filter(article => {
    const matchesSearch = search === '' || article.title.toLowerCase().includes(search.toLowerCase()) || article.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !activeCategory || article.category.toLowerCase().includes(activeCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const popularArticles = filteredArticles.slice(0, 6);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = {
      id: 'u_' + Date.now(),
      text: text.trim(),
      sender: 'user',
      time: 'Just now',
      status: 'sent',
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const botMsg: ChatMessage = {
        id: 's_' + Date.now(),
        text: getBotResponse(text),
        sender: 'support',
        time: 'Just now',
        status: 'read',
      };
      setMessages(prev => [...prev.map(m => m.sender === 'user' ? { ...m, status: 'read' as const } : m), botMsg]);
      setIsTyping(false);
    }, 1500);
  };

  // ── Chat View ──────────────────────────────────────────────
  if (chatOpen) {
    return (
      <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
        {/* Header */}
        <div className="flex items-center gap-3 px-5 pt-3 pb-3" style={{ borderBottom: '1px solid var(--border)', background: 'var(--card)' }}>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => { setChatOpen(false); setMessages(initialMessages); }}
            aria-label="Back"
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: 'var(--muted)' }}
          >
            <ChevronLeft size={20} style={{ color: 'var(--foreground)' }} />
          </motion.button>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--secondary)' }}>
              <MessageCircle size={18} className="text-white" />
            </div>
            <div>
              <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>Convia Support</p>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: 'var(--positive)' }} />
                <span style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>Online · Usually replies instantly</span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4">
          <div className="flex flex-col gap-3">
            {messages.map(msg => {
              const isUser = msg.sender === 'user';
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className="px-4 py-2.5 rounded-[18px] max-w-[80%]"
                    style={{
                      background: isUser ? 'var(--primary)' : 'var(--card)',
                      color: isUser ? '#FFF' : 'var(--foreground)',
                      fontSize: 14,
                      lineHeight: 1.5,
                      fontWeight: 500,
                      borderBottomRightRadius: isUser ? 4 : 18,
                      borderBottomLeftRadius: isUser ? 18 : 4,
                      border: isUser ? 'none' : '1px solid var(--border)',
                    }}
                  >
                    {msg.text}
                  </div>
                  <div className="flex items-center gap-1 mt-1 px-1">
                    <span style={{ color: 'var(--muted-foreground)', fontSize: 10 }}>{msg.time}</span>
                    {isUser && msg.status === 'read' && <CheckCheck size={12} style={{ color: 'var(--foreground)' }} />}
                    {isUser && msg.status === 'sent' && <Check size={12} style={{ color: 'var(--muted-foreground)' }} />}
                  </div>
                </motion.div>
              );
            })}

            {/* Typing indicator */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1.5 px-4 py-3 rounded-[18px]"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)', borderBottomLeftRadius: 4, width: 'fit-content' }}
                >
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full"
                      style={{ background: 'var(--muted-foreground)' }}
                      animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Quick replies */}
        {messages.length <= 1 && (
          <div className="px-5 pb-2">
            <p style={{ color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600, marginBottom: 8 }}>QUICK REPLIES</p>
            <div className="flex gap-2 flex-wrap">
              {quickReplies.map(reply => (
                <motion.button
                  key={reply}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => sendMessage(reply)}
                  className="px-3 py-2 rounded-[12px]"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)', fontSize: 12, fontWeight: 500 }}
                >
                  {reply}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Input bar */}
        <div className="px-4 py-3" style={{ borderTop: '1px solid var(--border)', background: 'var(--card)' }}>
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-[16px]" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') sendMessage(input); }}
                placeholder="Type a message..."
                className="flex-1 bg-transparent outline-none"
                style={{ color: 'var(--foreground)', fontSize: 14 }}
              />
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => sendMessage(input)}
              disabled={!input.trim()}
              className="w-11 h-11 rounded-[16px] flex items-center justify-center"
              style={{
                background: input.trim() ? 'var(--primary)' : 'var(--muted)',
                boxShadow: input.trim() ? 'none' : 'none',
              }}
            >
              <Send size={18} style={{ color: input.trim() ? '#FFF' : 'var(--muted-foreground)' }} />
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main Help Center View ───────────────────────────────────
  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />

      <div className="flex items-center gap-3 px-5 mb-6">
        <motion.button whileTap={{ scale: 0.9 }} onClick={goBack} aria-label="Go back" className="w-10 h-10 rounded-2xl flex items-center justify-center glass-card" style={{ border: '1px solid var(--border)' }}>
          <ChevronLeft size={20} style={{ color: 'var(--foreground)' }} />
        </motion.button>
        <h2 style={{ color: 'var(--foreground)', fontWeight: 800 }}>Help Center</h2>
      </div>

      <div className="px-5">
        <div className="flex items-center gap-2 px-4 py-3 rounded-[14px] mb-6 glass-card" style={{ border: '1px solid var(--border)' }}>
          <Search size={16} style={{ color: 'var(--muted-foreground)' }} />
          <input
            placeholder="Search for help..."
            value={search}
            onChange={e => { setSearch(e.target.value); setActiveCategory(null); }}
            className="flex-1 bg-transparent outline-none"
            style={{ color: 'var(--foreground)', fontSize: 14 }}
          />
          {search && (
            <button onClick={() => setSearch('')}>
              <X size={16} style={{ color: 'var(--muted-foreground)' }} />
            </button>
          )}
        </div>

        {/* Contact Support Card */}
        <div className="rounded-[20px] p-5 mb-6 glass-card glass-refraction" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--border)' }}>
              <MessageCircle size={20} style={{ color: 'var(--foreground)' }} />
            </div>
            <div>
              <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>Need help? Chat with us</p>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Our support team is available 24/7</p>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setChatOpen(true)}
            className="w-full py-3 rounded-[12px] text-white mt-2"
            style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 14, boxShadow: 'none' }}
          >
            Start a Conversation
          </motion.button>
        </div>

        <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 12, fontWeight: 600 }}>BROWSE BY TOPIC</p>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {categories.map((cat, i) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.title;
            return (
              <motion.button
                key={i}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveCategory(isActive ? null : cat.title)}
                className="p-4 rounded-[16px] glass-card text-left"
                style={{ border: `1px solid ${isActive ? 'var(--primary)' : 'var(--border)'}`, background: isActive ? 'var(--muted)' : undefined }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: 'var(--muted)' }}>
                  <Icon size={18} style={{ color: 'var(--foreground)' }} />
                </div>
                <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{cat.title}</p>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 11, marginBottom: 6 }}>{cat.desc}</p>
                <p style={{ color: 'var(--foreground)', fontSize: 11, fontWeight: 600 }}>{allArticles.filter(a => a.category === cat.key).length} articles</p>
              </motion.button>
            );
          })}
        </div>

        <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 12, fontWeight: 600 }}>
          {activeCategory ? `${activeCategory.toUpperCase()} ARTICLES` : 'POPULAR ARTICLES'}
        </p>
        {filteredArticles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <HelpCircle size={32} style={{ color: 'var(--muted-foreground)', marginBottom: 8 }} />
            <p style={{ color: 'var(--muted-foreground)', fontSize: 14 }}>No articles found for "{search}"</p>
          </div>
        ) : (
          <div className="rounded-[20px] overflow-hidden glass-card mb-6" style={{ border: '1px solid var(--border)' }}>
            {popularArticles.map((article, i) => (
              <motion.button
                key={i}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedArticle(article)}
                className="flex items-center gap-3 px-4 py-3.5 w-full"
                style={{ borderBottom: i < popularArticles.length - 1 ? '1px solid var(--border)' : 'none' }}
              >
                <div className="flex-1 text-left">
                  <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13 }}>{article.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded-md" style={{ background: 'var(--muted)', color: 'var(--foreground)', fontSize: 10, fontWeight: 600 }}>{article.category}</span>
                    <span style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{article.time}</span>
                  </div>
                </div>
                <ChevronRight size={16} style={{ color: 'var(--muted-foreground)' }} />
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Article Detail Bottom Sheet */}
      <AnimatePresence>
        {selectedArticle && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedArticle(null)}
              className="absolute inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.5)' }}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="absolute bottom-0 left-0 right-0 z-50 rounded-t-[28px] overflow-hidden"
              style={{ background: 'var(--card)', maxHeight: '80%', overflowY: 'auto' }}
            >
              <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4" style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }}>
                <div className="w-12 h-1 rounded-full mx-auto" style={{ background: 'var(--muted)' }} />
                <button onClick={() => setSelectedArticle(null)} className="absolute right-4 top-4 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--muted)' }}>
                  <X size={18} style={{ color: 'var(--foreground)' }} />
                </button>
              </div>
              <div className="px-5 pb-8 pt-2">
                <span className="px-2 py-0.5 rounded-md" style={{ background: 'var(--muted)', color: 'var(--foreground)', fontSize: 10, fontWeight: 600 }}>{selectedArticle.category}</span>
                <h2 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 20, marginTop: 12, marginBottom: 4, lineHeight: 1.3 }}>{selectedArticle.title}</h2>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 20 }}>{selectedArticle.time}</p>
                <div className="flex flex-col gap-3">
                  {selectedArticle.steps.map((step, si) => (
                    <div key={si} className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: 'var(--muted)' }}>
                        <span style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 13 }}>{si + 1}</span>
                      </div>
                      <p style={{ color: 'var(--foreground)', fontSize: 14, lineHeight: 1.5, paddingTop: 4 }}>{step}</p>
                    </div>
                  ))}
                </div>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedArticle(null)}
                  className="w-full py-3.5 rounded-[14px] text-white mt-8"
                  style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 14 }}
                >
                  Got it
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
