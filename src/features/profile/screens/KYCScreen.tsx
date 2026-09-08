import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { useKycStatus } from '../../../shared/hooks/useKycStatus';
import { useMyProfile } from '../../../shared/hooks/useMyProfile';
import { useSupportedCountries } from '../../../shared/hooks/useSupportedCountries';
import * as securityApi from '../../../shared/api/security';
import { ApiError } from '../../../shared/api/types';
import { FeatureAlert, mapApiCodeToReason } from '../../../shared/components/FeatureAlert';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Loader } from 'lucide-react';
import { CameraCapture } from '../../../shared/components/CameraCapture';
import { ScreenHeader } from '../../../shared/components/ScreenHeader';
import { StepIndicator } from '../components/kyc/StepIndicator';
import { PersonalInfoStep } from '../components/kyc/PersonalInfoStep';
import { DocumentUploadStep } from '../components/kyc/DocumentUploadStep';
import { SelfieVerificationStep } from '../components/kyc/SelfieVerificationStep';
import { ReviewStep } from '../components/kyc/ReviewStep';
import { SuccessView } from '../components/kyc/SuccessView';
import { KycStatusView } from '../components/kyc/KycStatusView';
import {
  KYC_STEPS,
  DOC_TYPES,
  COUNTRIES,
  validatePersonalInfo,
  type Country,
  type DocType,
  type UploadedFile,
} from '../components/kyc/types';
import { useLanguage } from '../../../shared/context/LanguageContext';

interface KYCScreenProps {
  goBack: () => void;
}

export function KYCScreen({ goBack }: KYCScreenProps) {
  const { t } = useLanguage();
  const { userId } = useAuth();
  const { isApproved, isPending, isRejected, kycStatus, loading: kycLoading, invalidate: invalidateKyc, refresh: refreshKyc } =
    useKycStatus();
  const { profile } = useMyProfile();
  const { countries } = useSupportedCountries();
  const [forceForm, setForceForm] = useState(false);
  const [apiError, setApiError] = useState<{ code?: string; message?: string } | null>(null);

  const [activeStep, setActiveStep] = useState(0);
  const [direction, setDirection] = useState(1);

  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [country, setCountry] = useState<Country | null>(null);
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [personalErrors, setPersonalErrors] = useState<Record<string, string>>({});

  const [docType, setDocType] = useState<DocType | null>(null);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [docErrors, setDocErrors] = useState<Record<string, string>>({});

  const [selfieCaptured, setSelfieCaptured] = useState(false);
  const [selfieDataUrl, setSelfieDataUrl] = useState<string | null>(null);
  const [showSelfieCamera, setShowSelfieCamera] = useState(false);
  const [selfieErrors, setSelfieErrors] = useState<Record<string, string>>({});

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const countryOptions = useMemo(() => {
    const live = countries.map((c) => ({ code: c.code, name: c.name }));
    if (live.length) return live;
    return COUNTRIES;
  }, [countries]);

  useEffect(() => {
    if (!profile) return;
    if (!fullName && (profile.displayName || profile.username)) {
      setFullName(profile.displayName || profile.username || '');
    }
    if (!country && profile.country) {
      const code = String(profile.country).toUpperCase();
      const match = countryOptions.find((c) => c.code === code) || { code, name: code };
      setCountry(match);
    }
  }, [profile, countryOptions, fullName, country]);

  const goToStep = (index: number) => {
    setDirection(index > activeStep ? 1 : -1);
    setActiveStep(index);
  };
  const nextStep = () => {
    setDirection(1);
    setActiveStep((prev) => Math.min(prev + 1, KYC_STEPS.length - 1));
  };
  const prevStep = () => {
    setDirection(-1);
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

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
      if (!docType) errors.docType = 'Select a document type';
      if (!uploadedFile) errors.uploadedFile = 'Upload or photograph your document';
      setDocErrors(errors);
      if (Object.keys(errors).length > 0) return;
    }
    if (activeStep === 2 && !selfieCaptured) {
      setSelfieErrors({ selfie: 'Capture a selfie to continue' });
      return;
    }
    nextStep();
  };

  const handleSelfieCapture = (dataUrl: string) => {
    setShowSelfieCamera(false);
    setSelfieCaptured(true);
    setSelfieDataUrl(dataUrl);
    setSelfieErrors({});
  };

  const handleSubmit = async () => {
    if (!userId) {
      setApiError({ message: 'Sign in required to submit KYC' });
      return;
    }
    const hostedDoc =
      uploadedFile?.dataUrl && /^https?:\/\//i.test(uploadedFile.dataUrl) ? uploadedFile.dataUrl : null;
    const hostedSelfie = selfieDataUrl && /^https?:\/\//i.test(selfieDataUrl) ? selfieDataUrl : null;
    const docUrl = hostedDoc || 'https://example.com/kyc/document-placeholder.jpg';
    const selfieUrl = hostedSelfie || 'https://example.com/kyc/selfie-placeholder.jpg';
    const mapDoc =
      docType === 'passport' ? 'passport' : docType === 'license' ? 'drivers_license' : 'national_id';

    setSubmitting(true);
    setApiError(null);
    try {
      await securityApi.submitKyc(userId, {
        documentType: mapDoc,
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
      <div className="flex flex-col h-full items-center justify-center gap-3" style={{ background: 'var(--background)' }}>
        <Loader className="animate-spin" style={{ color: 'var(--muted-foreground)' }} />
        <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Checking verification…</p>
      </div>
    );
  }

  if ((isApproved || isPending) && !forceForm) {
    return (
      <KycStatusView
        mode={isApproved ? 'approved' : 'pending'}
        statusLabel={kycStatus}
        onBack={goBack}
      />
    );
  }

  if (isRejected && !forceForm && !submitted) {
    return (
      <KycStatusView
        mode="rejected"
        statusLabel={kycStatus}
        onBack={goBack}
        onResubmit={() => setForceForm(true)}
      />
    );
  }

  if (submitted) {
    return <SuccessView firstName={fullName.split(' ')[0]} onDone={goBack} />;
  }

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <ScreenHeader
        title={t('kyc.title')}
        subtitle="Encrypted identity check"
        onBack={goBack}
        marginBottom={12}
        right={
          <div className="px-2.5 py-1 rounded-full" style={{ background: 'var(--muted)' }}>
            <span style={{ color: 'var(--foreground)', fontSize: 11, fontWeight: 700 }}>
              {activeStep + 1}/{KYC_STEPS.length}
            </span>
          </div>
        }
      />
      <div className="flex items-center gap-1.5 px-5 mb-3">
        <Shield size={11} style={{ color: 'var(--primary)' }} />
        <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>Bank-grade encryption · 24–48h review</p>
      </div>

      {apiError && (
        <div className="px-5">
          <FeatureAlert reason={mapApiCodeToReason(apiError.code)} message={apiError.message} detail={apiError.code} />
        </div>
      )}
      <StepIndicator activeStep={activeStep} />

      <div className="flex-1 overflow-y-auto px-5 pb-4">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={activeStep}
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 24 : -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -24 : 24 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            {activeStep === 0 && (
              <PersonalInfoStep
                fullName={fullName}
                setFullName={setFullName}
                dob={dob}
                setDob={setDob}
                country={country}
                setCountry={setCountry}
                address1={address1}
                setAddress1={setAddress1}
                address2={address2}
                setAddress2={setAddress2}
                city={city}
                setCity={setCity}
                postalCode={postalCode}
                setPostalCode={setPostalCode}
                errors={personalErrors}
                clearError={clearPersonalError}
                onContinue={handleNext}
                countryOptions={countryOptions}
              />
            )}
            {activeStep === 1 && (
              <DocumentUploadStep
                docType={docType}
                setDocType={setDocType}
                uploadedFile={uploadedFile}
                setUploadedFile={setUploadedFile}
                errors={docErrors}
                clearError={clearDocError}
                onBack={prevStep}
                onContinue={handleNext}
              />
            )}
            {activeStep === 2 && (
              <SelfieVerificationStep
                selfieCaptured={selfieCaptured}
                onStartCapture={() => setShowSelfieCamera(true)}
                onRetake={() => {
                  setSelfieCaptured(false);
                  setSelfieDataUrl(null);
                }}
                errors={selfieErrors}
                onBack={prevStep}
                onContinue={handleNext}
              />
            )}
            {activeStep === 3 && (
              <ReviewStep
                fullName={fullName}
                dob={dob}
                country={country}
                address1={address1}
                address2={address2}
                city={city}
                postalCode={postalCode}
                docTypeLabel={docTypeLabel}
                uploadedFile={uploadedFile}
                submitting={submitting}
                onEditStep={goToStep}
                onBack={prevStep}
                onSubmit={handleSubmit}
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
            title="Selfie"
            subtitle="Center your face in the oval"
            guideShape="oval"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
