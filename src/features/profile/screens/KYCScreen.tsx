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
import { NigeriaIdStep } from '../components/kyc/NigeriaIdStep';
import {
  KYC_STEPS,
  DOC_TYPES,
  COUNTRIES,
  validatePersonalInfo,
  stepsForCountry,
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
  const {
    isApproved,
    isPending,
    isRejected,
    kycStatus,
    loading: kycLoading,
    invalidate: invalidateKyc,
    refresh: refreshKyc,
  } = useKycStatus();
  const { profile } = useMyProfile();
  const { countries } = useSupportedCountries();
  const [forceForm, setForceForm] = useState(false);
  const [tier2, setTier2] = useState(false);
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

  const [nin, setNin] = useState('');
  const [bvn, setBvn] = useState('');
  const [idErrors, setIdErrors] = useState<Record<string, string>>({});

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
    const live = countries.map((c) => ({ code: c.code, name: c.name || c.code }));
    if (live.length) return live;
    return COUNTRIES;
  }, [countries]);

  const isNG = (country?.code || profile?.country || '').toUpperCase() === 'NG';
  const flowSteps = useMemo(
    () => stepsForCountry(country?.code || profile?.country, tier2),
    [country?.code, profile?.country, tier2],
  );

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

  // Reset step when country mode changes
  useEffect(() => {
    setActiveStep(0);
  }, [isNG, tier2]);

  const nextStep = () => {
    setDirection(1);
    setActiveStep((prev) => Math.min(prev + 1, flowSteps.length - 1));
  };
  const prevStep = () => {
    setDirection(-1);
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const clearPersonalError = (field: string) => setPersonalErrors((prev) => ({ ...prev, [field]: '' }));
  const clearDocError = (field: string) => setDocErrors((prev) => ({ ...prev, [field]: '' }));
  const clearIdError = (field: string) => setIdErrors((prev) => ({ ...prev, [field]: '' }));

  const currentId = flowSteps[activeStep]?.id;

  const handleNext = () => {
    if (currentId === 'nin') {
      const errors: Record<string, string> = {};
      if (nin.length !== 11) errors.nin = 'Enter a valid 11-digit NIN';
      if (bvn && bvn.length !== 11) errors.bvn = 'BVN must be 11 digits if provided';
      setIdErrors(errors);
      if (Object.keys(errors).length > 0) return;
    }
    if (currentId === 'personal') {
      const errors = validatePersonalInfo({ fullName, dob, country, address1, address2, city, postalCode });
      setPersonalErrors(errors);
      if (Object.keys(errors).length > 0) return;
    }
    if (currentId === 'document' || currentId === 'utility') {
      const errors: Record<string, string> = {};
      if (currentId === 'document' && !docType) errors.docType = 'Select a document type';
      if (!uploadedFile) errors.uploadedFile = currentId === 'utility' ? 'Upload a utility bill' : 'Upload your document';
      setDocErrors(errors);
      if (Object.keys(errors).length > 0) return;
    }
    if (currentId === 'selfie' && !selfieCaptured) {
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
    const selfieUrl = hostedSelfie || (isNG && !tier2 ? '' : 'https://example.com/kyc/selfie-placeholder.jpg');
    const mapDoc =
      isNG && !tier2
        ? 'national_id'
        : docType === 'passport'
          ? 'passport'
          : docType === 'license'
            ? 'drivers_license'
            : 'national_id';

    setSubmitting(true);
    setApiError(null);
    try {
      await securityApi.submitKyc(userId, {
        documentType: mapDoc,
        documentImageUrl: docUrl,
        selfieImageUrl: selfieUrl || docUrl,
        declaredCountry: country?.code?.length === 2 ? country.code.toUpperCase() : undefined,
      });
      invalidateKyc();
      await refreshKyc();
      setSubmitted(true);
    } catch (err) {
      if (err instanceof ApiError) setApiError({ code: err.code, message: err.body?.message || err.message });
      else setApiError({ message: 'Could not submit KYC' });
    } finally {
      setSubmitting(false);
    }
  };

  if (kycLoading) {
    return (
      <div className="flex flex-col h-full items-center justify-center" style={{ background: 'var(--background)' }}>
        <Loader className="animate-spin" style={{ color: 'var(--muted-foreground)' }} />
      </div>
    );
  }

  if (submitted) {
    return <SuccessView onDone={goBack} />;
  }

  if ((isApproved || isPending) && !forceForm) {
    return (
      <KycStatusView
        mode={isApproved ? 'approved' : isPending ? 'pending' : 'rejected'}
        statusLabel={String(kycStatus || (isApproved ? 'approved' : isPending ? 'pending' : 'rejected'))}
        onBack={goBack}
        onResubmit={() => {
          setForceForm(true);
          if (isNG && isApproved) setTier2(true);
        }}
      />
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <ScreenHeader
        title={t('kyc.title') || 'Identity'}
        subtitle={isNG ? (tier2 ? 'Nigeria · Tier 2' : 'Nigeria · Tier 1') : 'Identity verification'}
        onBack={goBack}
        marginBottom={12}
        right={
          <div className="px-2.5 py-1 rounded-full" style={{ background: 'var(--muted)' }}>
            <span style={{ color: 'var(--foreground)', fontSize: 11, fontWeight: 700 }}>
              {activeStep + 1}/{flowSteps.length}
            </span>
          </div>
        }
      />
      <div className="flex items-center gap-1.5 px-5 mb-3">
        <Shield size={11} style={{ color: 'var(--primary)' }} />
        <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>
          {isNG && !tier2
            ? 'NIN verification · No face capture required'
            : 'Bank-grade encryption · 24–48h review'}
        </p>
      </div>

      {apiError && (
        <div className="px-5">
          <FeatureAlert reason={mapApiCodeToReason(apiError.code)} message={apiError.message} detail={apiError.code} />
        </div>
      )}
      <StepIndicator activeStep={activeStep} steps={flowSteps} />

      <div className="flex-1 overflow-y-auto px-5 pb-4">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`${currentId}-${activeStep}`}
            custom={direction}
            initial={{ opacity: 0, x: direction * 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -24 }}
            transition={{ duration: 0.22 }}
          >
            {currentId === 'nin' && (
              <NigeriaIdStep
                nin={nin}
                setNin={setNin}
                bvn={bvn}
                setBvn={setBvn}
                errors={idErrors}
                clearError={clearIdError}
                onContinue={handleNext}
              />
            )}
            {currentId === 'personal' && (
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
            {(currentId === 'document' || currentId === 'utility') && (
              <DocumentUploadStep
                docType={docType || (currentId === 'utility' ? 'id' : null)}
                setDocType={(d) => {
                  setDocType(d);
                  if (currentId === 'utility') setDocType('id');
                }}
                uploadedFile={uploadedFile}
                setUploadedFile={setUploadedFile}
                errors={docErrors}
                clearError={clearDocError}
                onContinue={handleNext}
                onBack={prevStep}
              />
            )}
            {currentId === 'selfie' && (
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
            {currentId === 'review' && (
              <ReviewStep
                fullName={fullName}
                dob={dob}
                country={country}
                address1={address1}
                address2={address2}
                city={city}
                postalCode={postalCode}
                docTypeLabel={
                  isNG && !tier2
                    ? `NIN ${nin}${bvn ? ` · BVN ${bvn}` : ''}`
                    : tier2
                      ? 'Utility bill'
                      : DOC_TYPES.find((d) => d.id === docType)?.label || 'Document'
                }
                uploadedFile={uploadedFile}
                submitting={submitting}
                onEditStep={(s) => {
                  setDirection(s < activeStep ? -1 : 1);
                  setActiveStep(s);
                }}
                onBack={prevStep}
                onSubmit={() => void handleSubmit()}
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
