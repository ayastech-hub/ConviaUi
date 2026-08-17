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
  KYC_STEPS, DOC_TYPES, validatePersonalInfo,
  type Country, type DocType, type UploadedFile,
} from '../components/kyc/types';
import { useLanguage } from '../../../shared/context/LanguageContext';

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
  const { userId } = useAuth();
  const { isApproved, isPending, kycStatus, loading: kycLoading, invalidate: invalidateKyc, refresh: refreshKyc } = useKycStatus();
  const [apiError, setApiError] = useState<{ code?: string; message?: string } | null>(null);

  const [activeStep, setActiveStep] = useState(0);
  const [direction, setDirection] = useState(1);

  // Step 1 — Personal Info
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [country, setCountry] = useState<Country | null>(null);
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [personalErrors, setPersonalErrors] = useState<Record<string, string>>({});

  // Step 2 — Document Upload
  const [docType, setDocType] = useState<DocType | null>(null);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [docErrors, setDocErrors] = useState<Record<string, string>>({});

  // Step 3 — Selfie Verification
  const [selfieCaptured, setSelfieCaptured] = useState(false);
  const [showSelfieCamera, setShowSelfieCamera] = useState(false);
  const [selfieErrors, setSelfieErrors] = useState<Record<string, string>>({});

  // Step 4 — Review & Submit
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const goToStep = (index: number) => {
    setDirection(index > activeStep ? 1 : -1);
    setActiveStep(index);
  };
  const nextStep = () => { setDirection(1); setActiveStep((prev) => Math.min(prev + 1, KYC_STEPS.length - 1)); };
  const prevStep = () => { setDirection(-1); setActiveStep((prev) => Math.max(prev - 1, 0)); };

  const clearPersonalError = (field: string) => setPersonalErrors((prev) => ({ ...prev, [field]: '' }));
  const clearDocError = (field: string) => setDocErrors((prev) => ({ ...prev, [field]: '' }));

  const handleNext = () => {
    if (activeStep === 0) {
      const errors = validatePersonalInfo({ fullName, dob, country, address1, address2, city, postalCode });
      setPersonalErrors(errors);
      if (Object.keys(errors).length > 0) return;
    }
    if (activeStep === 1) {
      const errors: Record<string, string> = {};
      if (!docType) errors.docType = 'Please select a document type';
      if (!uploadedFile) errors.uploadedFile = 'Please upload your document';
      setDocErrors(errors);
      if (Object.keys(errors).length > 0) return;
    }
    if (activeStep === 2 && !selfieCaptured) {
      setSelfieErrors({ selfie: 'Please complete the selfie verification' });
      return;
    }
    nextStep();
  };

  const handleSelfieCapture = (_dataUrl: string) => {
    setShowSelfieCamera(false);
    setSelfieCaptured(true);
    setSelfieErrors({});
  };

  const handleSubmit = async () => {
    if (!userId) {
      setApiError({ message: 'Sign in required to submit KYC' });
      return;
    }
    // Backend expects hosted image URLs. Local camera captures are data-URLs —
    // until an upload service exists we send placeholders that fail validation
    // only if provider is live; prefer real URLs when available.
    const docUrl =
      uploadedFile && 'url' in uploadedFile && typeof (uploadedFile as { url?: string }).url === 'string'
        ? (uploadedFile as { url: string }).url
        : uploadedFile && 'dataUrl' in (uploadedFile as object)
          ? 'https://example.com/kyc/document-placeholder.jpg'
          : 'https://example.com/kyc/document-placeholder.jpg';
    const selfieUrl = 'https://example.com/kyc/selfie-placeholder.jpg';
    const mapDoc =
      docType === 'passport'
        ? 'passport'
        : docType === 'drivers_license' || docType === 'license'
          ? 'drivers_license'
          : 'national_id';

    setSubmitting(true);
    setApiError(null);
    try {
      await securityApi.submitKyc(userId, {
        documentType: mapDoc as 'national_id' | 'passport' | 'drivers_license',
        documentImageUrl: docUrl,
        selfieImageUrl: selfieUrl,
        declaredCountry: country?.code?.length === 2 ? country.code.toUpperCase() : undefined,
      });
      invalidateKyc();
      await refreshKyc();
      setSubmitted(true);
    } catch (err) {
      if (err instanceof ApiError) setApiError({ code: err.code, message: err.body.message || err.message });
      else setApiError({ message: 'KYC submission failed' });
    } finally {
      setSubmitting(false);
    }
  };

  const docTypeLabel = DOC_TYPES.find((d) => d.id === docType)?.label ?? '';


  if (kycLoading) {
    return (
      <div className="flex flex-col h-full items-center justify-center" style={{ background: 'var(--background)' }}>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Checking verification status…</p>
      </div>
    );
  }

  if (isApproved || isPending) {
    return (
      <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
        <div style={{ height: 50 }} />
        <ScreenHeader title={t('kyc.title')} onBack={goBack} />
        <div className="flex-1 px-5 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4" style={{ background: 'var(--muted)' }}>
            <Shield size={28} style={{ color: isApproved ? 'var(--positive)' : 'var(--primary)' }} />
          </div>
          <h2 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 20, marginBottom: 8 }}>
            {isApproved ? 'You are verified' : 'Verification in review'}
          </h2>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 13, maxWidth: 280, lineHeight: 1.45 }}>
            {isApproved
              ? 'Your identity is approved. You do not need to submit KYC again.'
              : `Status: ${kycStatus}. We will notify you when review completes.`}
          </p>
          <button
            type="button"
            onClick={goBack}
            className="mt-8 w-full max-w-xs py-3.5 rounded-[16px] text-white"
            style={{ background: 'var(--primary)', fontWeight: 700 }}
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return <SuccessView firstName={fullName.split(' ')[0]} onDone={goBack} />;
  }

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />

      <ScreenHeader
        title={t('kyc.title')}
        onBack={goBack}
        marginBottom={16}
        right={
          <div className="px-2.5 py-1 rounded-full" style={{ background: 'var(--muted)' }}>
            <span style={{ color: 'var(--foreground)', fontSize: 11, fontWeight: 700 }}>
              {activeStep + 1}/{KYC_STEPS.length}
            </span>
          </div>
        }
      />
      <div className="flex items-center gap-1 px-5" style={{ marginTop: -12, marginBottom: 16 }}>
        <Shield size={11} style={{ color: 'var(--positive)' }} />
        <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>Secure & encrypted</p>
      </div>

      {apiError && (
        <div className="px-5"><FeatureAlert reason={mapApiCodeToReason(apiError.code)} message={apiError.message} detail={apiError.code} /></div>
      )}
      <StepIndicator activeStep={activeStep} />

      <div className="flex-1 overflow-y-auto px-5 pb-4">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={activeStep}
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 40 : -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -40 : 40 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
          >
            {activeStep === 0 && (
              <PersonalInfoStep
                fullName={fullName} setFullName={setFullName}
                dob={dob} setDob={setDob}
                country={country} setCountry={setCountry}
                address1={address1} setAddress1={setAddress1}
                address2={address2} setAddress2={setAddress2}
                city={city} setCity={setCity}
                postalCode={postalCode} setPostalCode={setPostalCode}
                errors={personalErrors} clearError={clearPersonalError}
                onContinue={handleNext}
              />
            )}
            {activeStep === 1 && (
              <DocumentUploadStep
                docType={docType} setDocType={setDocType}
                uploadedFile={uploadedFile} setUploadedFile={setUploadedFile}
                errors={docErrors} clearError={clearDocError}
                onBack={prevStep} onContinue={handleNext}
              />
            )}
            {activeStep === 2 && (
              <SelfieVerificationStep
                selfieCaptured={selfieCaptured}
                onStartCapture={() => setShowSelfieCamera(true)}
                onRetake={() => setSelfieCaptured(false)}
                errors={selfieErrors}
                onBack={prevStep} onContinue={handleNext}
              />
            )}
            {activeStep === 3 && (
              <ReviewStep
                fullName={fullName} dob={dob} country={country}
                address1={address1} address2={address2} city={city} postalCode={postalCode}
                docTypeLabel={docTypeLabel} uploadedFile={uploadedFile}
                submitting={submitting}
                onEditStep={goToStep} onBack={prevStep} onSubmit={handleSubmit}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showSelfieCamera && (
          <CameraCapture
            onCapture={handleSelfieCapture}
            onClose={() => setShowSelfieCamera(false)}
            title="Selfie Verification"
            subtitle="Center your face in the oval and look directly at the camera"
            guideShape="oval"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
