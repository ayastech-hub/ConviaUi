import { Wallet, ArrowLeftRight, ShieldCheck } from 'lucide-react';

export interface OnboardingSlideData {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>;
  title: string;
  subtitle: string;
}

export const ONBOARDING_SLIDES: OnboardingSlideData[] = [
  {
    icon: Wallet,
    title: 'Your money, one place',
    subtitle: 'Hold crypto and cash, track balances, and move funds without switching apps.',
  },
  {
    icon: ArrowLeftRight,
    title: 'Buy, sell, and swap',
    subtitle: 'On-ramp with bank or card, off-ramp to local currency, and swap tokens in a few taps.',
  },
  {
    icon: ShieldCheck,
    title: 'Built for trust',
    subtitle: 'PIN protection, device control, and verification so your account stays yours.',
  },
];
