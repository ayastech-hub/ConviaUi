import { motion } from 'motion/react';
import { Phone, ArrowRight, AlertCircle } from 'lucide-react';
import { InputField } from './FormPrimitives';
import { useLanguage } from '../../../shared/context/LanguageContext';

interface PhoneStepProps {
  phone: string;
  setPhone: (v: string) => void;
  error: string;
  onSubmit: () => void;
}

/** Phone number entry step, shown during signup before the OTP step. */
export function PhoneStep({ phone, setPhone, error, onSubmit }: PhoneStepProps) {
  const { t } = useLanguage();
