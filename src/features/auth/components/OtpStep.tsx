import { motion } from 'motion/react';
import { Shield, Loader, Check, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../../shared/context/LanguageContext';

interface OtpStepProps {
  phone: string;
  otp: string[];
  setOtp: (otp: string[]) => void;
  loading: boolean;
  error: string;
  onSubmit: () => void;
}

/** 6-digit OTP entry step, shown after the phone step during signup. */
export function OtpStep({ phone, otp, setOtp, loading, error, onSubmit }: OtpStepProps) {
  const { t } = useLanguage();
