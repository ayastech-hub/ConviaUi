import { useState } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { useKycStatus } from '../../../shared/hooks/useKycStatus';
import * as securityApi from '../../../shared/api/security';
import { ApiError } from '../../../shared/api/types';
import { FeatureAlert, mapApiCodeToReason } from '../../../shared/components/FeatureAlert';
import { motion, AnimatePresence } from 'motion/react';
import { Shield } from 'lucide-react';
import { CameraCapture } from '../../../shared/components/CameraCapture';
import { ScreenHeader } from '../../../shared/components/ScreenHeader';
import { StepIndicator } from '../components/kyc/StepIndicator';
import { PersonalInfoStep } from '../components/kyc/PersonalInfoStep';
import { DocumentUploadStep } from '../components/kyc/DocumentUploadStep';
import { SelfieVerificationStep } from '../components/kyc/SelfieVerificationStep';
import { ReviewStep } from '../components/kyc/ReviewStep';
import { SuccessView } from '../components/kyc/SuccessView';
import {
import { useLanguage } from '../../../shared/context/LanguageContext';
  KYC_STEPS, DOC_TYPES, validatePersonalInfo,
  type Country, type DocType, type UploadedFile,
} from '../components/kyc/types';

interface KYCScreenProps {
  goBack: () => void;
}

/**
 * KYC Verification flow. Acts purely as an orchestrator: it owns the form
 * state (needed across steps and for the final review) and renders one of
 * the 4 step components from `../components/kyc`, plus the shared
 * `SuccessView` once submitted. Each step's own layout/markup lives in its
 * own file — this screen only wires state + navigation between them.
 */
export function KYCScreen({ goBack }: KYCScreenProps) {
  const { t } = useLanguage();
