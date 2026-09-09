/** English only — single language app. */
export type LocaleCode = 'en';

export const LOCALE_LABELS: Record<LocaleCode, string> = {
  en: 'English',
};

export const LANGUAGES_BY_COUNTRY: Record<string, LocaleCode[]> = {
  NG: ['en'],
  GH: ['en'],
  KE: ['en'],
  ZA: ['en'],
  UG: ['en'],
  TZ: ['en'],
  EG: ['en'],
};

type Dict = Record<string, string>;

const en: Dict = {
  // Nav
  'nav.home': 'Home',
  'nav.wallet': 'Wallet',
  'nav.profile': 'Profile',
  'nav.services': 'Services',
  'nav.send': 'Send',
  'nav.request': 'Request',
  'nav.receive': 'Receive',
  'nav.swap': 'Swap',
  'nav.buy': 'Buy',
  'nav.sell': 'Sell',
  'nav.settings': 'Settings',
  'nav.deposit': 'Deposit',
  'nav.withdraw': 'Withdraw',

  // Common
  'common.continue': 'Continue',
  'common.done': 'Done',
  'common.cancel': 'Cancel',
  'common.save': 'Save',
  'common.back': 'Back',
  'common.loading': 'Loading…',
  'common.error': 'Something went wrong',
  'common.retry': 'Try again',
  'common.search': 'Search',
  'common.max': 'Max',
  'common.confirm': 'Confirm',
  'common.close': 'Close',
  'common.share': 'Share',
  'common.copy': 'Copy',
  'common.success': 'Success',
  'common.pending': 'Pending',
  'common.failed': 'Failed',
  'common.amount': 'Amount',
  'common.balance': 'Balance',
  'common.history': 'History',
  'common.seeAll': 'See all',
  'common.optional': 'Optional',

  // Home
  'home.portfolio': 'Portfolio',
  'home.totalBalance': 'Total balance',
  'home.quickActions': 'Quick actions',
  'home.recent': 'Recent activity',
  'home.markets': 'Markets',

  // Wallet
  'wallet.title': 'Wallet',
  'wallet.assets': 'Assets',
  'wallet.empty': 'No assets yet',
  'wallet.deposit': 'Deposit',
  'wallet.withdraw': 'Withdraw',

  // Send / receive / swap
  'send.title': 'Send',
  'send.recipient': 'Recipient',
  'send.amount': 'Amount',
  'send.confirm': 'Confirm',
  'send.success': 'Sent',
  'send.searchUsername': 'Search @username…',
  'send.findFriends': 'Find friends on Convia',
  'send.onConvia': 'On Convia',
  'send.enterUsername': 'Or enter @username',
  'send.usernameOnly': 'Send to a Convia username. Phone is only for finding friends.',
  'receive.title': 'Receive',
  'receive.share': 'Share your username or QR',
  'swap.title': 'Swap',
  'swap.youPay': 'You pay',
  'swap.youReceive': 'You receive',
  'swap.review': 'Review Swap',
  'swap.fee': 'Platform fee',
  'swap.rate': 'Rate',
  'swap.complete': 'Swap Complete',

  // Request
  'request.title': 'Request money',
  'request.subtitle': 'Ask a Convia user to pay you by @username',
  'request.payer': 'Their @username',
  'request.amount': 'Amount',
  'request.note': 'Note (optional)',
  'request.submit': 'Send request',
  'request.incoming': 'Requests for you',
  'request.outgoing': 'Your requests',
  'request.pay': 'Pay',
  'request.decline': 'Decline',
  'request.cancel': 'Cancel',
  'request.empty': 'No requests yet',
  'request.success': 'Request sent',

  // Ramps / bills
  'onramp.title': 'Buy crypto',
  'offramp.title': 'Sell crypto',
  'bills.title': 'Bills & airtime',
  'deposit.title': 'Deposit',
  'withdraw.title': 'Withdraw',

  // Profile
  'profile.title': 'Profile',
  'profile.edit': 'Edit Profile',
  'profile.editDesc': 'Name, username, bio, country',
  'profile.security': 'Security Center',
  'profile.securityDesc': 'PIN, sessions, whitelist',
  'profile.payments': 'Payment Methods',
  'profile.paymentsDesc': 'Bank accounts',
  'profile.kyc': 'KYC Verification',
  'profile.kycDesc': 'Verify your identity',
  'profile.rewards': 'Rewards & Points',
  'profile.portfolio': 'Portfolio',
  'profile.notifications': 'Notifications',
  'profile.settings': 'Settings',
  'profile.help': 'Help Center',
  'profile.helpDesc': 'FAQs & guides',
  'profile.support': 'Support Centre',
  'profile.supportDesc': 'Cases & live chat with agents',
  'profile.about': 'About Convia',
  'profile.aboutDesc': 'Terms, privacy, licenses',
  'profile.signOut': 'Sign out',

  // Settings
  'settings.title': 'Settings',
  'settings.appearance': 'Appearance',
  'settings.darkMode': 'Dark mode',
  'settings.currency': 'Display currency',
  'settings.notifications': 'Notifications',
  'settings.notifInApp': 'In-app alerts',
  'settings.notifPush': 'Push',
  'settings.notifEmail': 'Email',
  'settings.notifSms': 'SMS',
  'lang.title': 'Language',
  'lang.hint': 'Translates the app interface. Server messages stay in English.',

  // Auth
  'auth.welcomeBack': 'Welcome Back',
  'auth.createAccount': 'Create Account',
  'auth.resetPassword': 'Reset Password',
  'auth.signInSubtitle': 'Sign in to your Convia account',
  'auth.signupSubtitle': "Join Africa's financial universe",
  'auth.resetSubtitle': "We'll send you a reset link",
  'auth.login': 'Log in',
  'auth.signup': 'Sign up',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.forgot': 'Forgot password?',

  // Gates / status
  'gate.kyc': 'Verification required',
  'gate.frozen': 'Account frozen',
  'gate.unavailable': 'Feature unavailable',

  // Notifications inbox
  'notif.title': 'Notifications',
  'notif.markAll': 'Mark all read',
  'notif.empty': 'No notifications',

  // Rewards
  'rewards.title': 'Rewards',
  'rewards.daily': 'Daily login',
  'auth.verifyPhone': 'Verify Your Phone',
  'auth.enterOtp': 'Enter Verification Code',
  'auth.biometric': 'Biometric Login',
  'auth.phone': 'Phone number',
  'auth.sendCode': 'Send code',
  'auth.verify': 'Verify',
  'send.sending': 'Sending…',
  'receive.shareHint': 'Share your username or QR',
  'withdraw.processing': 'Processing Withdrawal...',
  'withdraw.submitted': 'Withdrawal Submitted!',
  'withdraw.enterPin': 'Enter PIN',
  'deposit.titleAsset': 'Deposit',
  'offramp.titleFull': 'Off-Ramp to Cash',
  'offramp.success': 'Off-Ramp Successful!',
  'onramp.success': 'On-Ramp Successful!',
  'swap.reviewTitle': 'Review Swap',
  'security.sessions': 'Active sessions',
  'security.whitelist': 'Withdrawal whitelist',
  'security.pin': 'Transaction PIN',
  'security.recovery': 'Recovery phrase',
  'currency.select': 'Select Currency',
  'services.title': 'Services',
  'portfolio.title': 'Portfolio',
  'paymentMethods.title': 'Payment Methods',
  'kyc.title': 'KYC Verification',
  'editProfile.title': 'Edit Profile',
  'security.title': 'Security Center',
  'help.title': 'Help Center',
  'support.title': 'Support Centre',
  'about.title': 'About',

};

export const DICTS: Record<LocaleCode, Dict> = { en };

export function t(_locale: LocaleCode, key: string): string {
  return DICTS.en[key] ?? key;
}

export function cacheDynamicTranslation(_locale: LocaleCode, _sourceEn: string, _translated: string) {
  /* no-op — English only */
}

export function getCachedDynamicTranslation(_locale: LocaleCode, _sourceEn: string): string | null {
  return null;
}
