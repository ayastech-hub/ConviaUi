import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft, ChevronRight, ChevronDown, Upload, Camera, FileText, CheckCircle2,
  User, MapPin, Calendar, Globe, BookUser, IdCard, Car, Loader, Shield, ShieldCheck,
  Clock, X, AlertCircle, ArrowLeft, ArrowRight, Home, RefreshCw, Eye, EyeOff, Trash2,
  Check, Lock, Sparkles,
} from 'lucide-react';
import { CameraCapture } from '../../../shared/components/CameraCapture';

interface KYCScreenProps {
  goBack: () => void;
}

type DocType = 'passport' | 'id' | 'license';
type StepId = 'personal' | 'document' | 'selfie' | 'review';

interface UploadedFile {
  name: string;
  size: number;
  type: string;
}

interface Country {
  code: string;
  name: string;
  flag: string;
}

const COUNTRIES: Country[] = [
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
  { code: 'MA', name: 'Morocco', flag: '🇲🇦' },
  { code: 'ET', name: 'Ethiopia', flag: '🇪🇹' },
  { code: 'TZ', name: 'Tanzania', flag: '🇹🇿' },
  { code: 'UG', name: 'Uganda', flag: '🇺🇬' },
  { code: 'RW', name: 'Rwanda', flag: '🇷🇼' },
  { code: 'SN', name: 'Senegal', flag: '🇸🇳' },
  { code: 'CI', name: "Côte d'Ivoire", flag: '🇨🇮' },
  { code: 'CM', name: 'Cameroon', flag: '🇨🇲' },
  { code: 'AO', name: 'Angola', flag: '🇦🇴' },
  { code: 'DZ', name: 'Algeria', flag: '🇩🇿' },
  { code: 'TN', name: 'Tunisia', flag: '🇹🇳' },
  { code: 'MZ', name: 'Mozambique', flag: '🇲🇿' },
  { code: 'ZM', name: 'Zambia', flag: '🇿🇲' },
  { code: 'BW', name: 'Botswana', flag: '🇧🇼' },
  { code: 'NA', name: 'Namibia', flag: '🇳🇦' },
];

const STEPS: { id: StepId; label: string; icon: React.ComponentType<{ size?: number; style?: React.CSSProperties; className?: string }> }[] = [
  { id: 'personal', label: 'Personal Info', icon: User },
  { id: 'document', label: 'Document Upload', icon: FileText },
  { id: 'selfie', label: 'Selfie Verification', icon: Camera },
  { id: 'review', label: 'Review', icon: ShieldCheck },
];

const DOC_TYPES: { id: DocType; label: string; desc: string; icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }> }[] = [
  { id: 'id', label: 'National ID Card', desc: 'Government-issued national identity card', icon: IdCard },
  { id: 'passport', label: 'International Passport', desc: 'Valid passport bio-data page', icon: BookUser },
  { id: 'license', label: "Driver's License", desc: 'Official driving license card', icon: Car },
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function KYCScreen({ goBack }: KYCScreenProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [direction, setDirection] = useState(1);

  // Step 1 - Personal Info
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [country, setCountry] = useState<Country | null>(null);
  const [countryOpen, setCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [personalErrors, setPersonalErrors] = useState<Record<string, string>>({});

  // Step 2 - Document Upload
  const [docType, setDocType] = useState<DocType | null>(null);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showSelfieCamera, setShowSelfieCamera] = useState(false);
  const [docErrors, setDocErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 3 - Selfie Verification
  const [selfieCaptured, setSelfieCaptured] = useState(false);
  const [selfieCapturing, setSelfieCapturing] = useState(false);
  const [livenessStep, setLivenessStep] = useState(0);
  const [livenessActive, setLivenessActive] = useState(false);
  const [livenessComplete, setLivenessComplete] = useState(false);
  const livenessTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [selfieErrors, setSelfieErrors] = useState<Record<string, string>>({});

  // Step 4 - Review & Submit
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (livenessTimerRef.current) clearTimeout(livenessTimerRef.current);
    };
  }, []);

  const goToStep = (index: number) => {
    setDirection(index > activeStep ? 1 : -1);
    setActiveStep(index);
  };

  const nextStep = () => {
    setDirection(1);
    setActiveStep(prev => Math.min(prev + 1, STEPS.length - 1));
  };

  const prevStep = () => {
    setDirection(-1);
    setActiveStep(prev => Math.max(prev - 1, 0));
  };

  const validatePersonal = (): boolean => {
    const errors: Record<string, string> = {};
    if (!fullName.trim()) errors.fullName = 'Full name is required';
    else if (fullName.trim().length < 3) errors.fullName = 'Enter your full name';
    if (!dob) errors.dob = 'Date of birth is required';
    else {
      const birth = new Date(dob);
      const age = (Date.now() - birth.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      if (age < 18) errors.dob = 'You must be at least 18 years old';
      if (age > 120) errors.dob = 'Please enter a valid date';
    }
    if (!country) errors.country = 'Please select your country';
    if (!address1.trim()) errors.address1 = 'Address is required';
    if (!city.trim()) errors.city = 'City is required';
    if (!postalCode.trim()) errors.postalCode = 'Postal code is required';
    setPersonalErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateDocument = (): boolean => {
    const errors: Record<string, string> = {};
    if (!docType) errors.docType = 'Please select a document type';
    if (!uploadedFile) errors.uploadedFile = 'Please upload your document';
    setDocErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateSelfie = (): boolean => {
    const errors: Record<string, string> = {};
    if (!selfieCaptured) errors.selfie = 'Please complete the selfie verification';
    setSelfieErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (activeStep === 0 && !validatePersonal()) return;
    if (activeStep === 1 && !validateDocument()) return;
    if (activeStep === 2 && !validateSelfie()) return;
    nextStep();
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile({ name: file.name, size: file.size, type: file.type });
      setDocErrors(prev => ({ ...prev, uploadedFile: '' }));
    }
    if (e.target.value) e.target.value = '';
  };

  const triggerFilePick = () => {
    fileInputRef.current?.click();
  };

  const handleCameraCapture = (dataUrl: string) => {
    setShowCamera(false);
    setUploadedFile({ name: 'document_camera_capture.jpg', size: Math.round(dataUrl.length * 0.75), type: 'image/jpeg' });
    setDocErrors(prev => ({ ...prev, uploadedFile: '' }));
  };

  const handleSelfieCapture = (dataUrl: string) => {
    setShowSelfieCamera(false);
    setSelfieCaptured(true);
    setLivenessComplete(true);
    setSelfieErrors({});
  };

  const startLivenessCheck = () => {
    setShowSelfieCamera(true);
  };

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 2800);
  };

  const resetFlow = () => {
    setActiveStep(0);
    setDirection(1);
    setFullName('');
    setDob('');
    setCountry(null);
    setAddress1('');
    setAddress2('');
    setCity('');
    setPostalCode('');
    setPersonalErrors({});
    setDocType(null);
    setUploadedFile(null);
    setShowCamera(false);
    setDocErrors({});
    setSelfieCaptured(false);
    setSelfieCapturing(false);
    setLivenessStep(0);
    setLivenessActive(false);
    setLivenessComplete(false);
    setSelfieErrors({});
    setSubmitting(false);
    setSubmitted(false);
  };

  const filteredCountries = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const docTypeLabel = DOC_TYPES.find(d => d.id === docType)?.label ?? '';

  // ---------- SUCCESS STATE ----------
  if (submitted) {
    return (
      <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
        <div style={{ height: 50 }} />
        <div className="flex items-center gap-3 px-5 mb-5">
          <motion.button whileTap={{ scale: 0.9 }} onClick={goBack} className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
            <ChevronLeft size={20} style={{ color: 'var(--foreground)' }} />
          </motion.button>
          <h2 style={{ color: 'var(--foreground)', fontWeight: 800 }}>Verification</h2>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-5">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
            className="text-center w-full"
          >
            {/* Animated checkmark */}
            <div className="relative w-32 h-32 mx-auto mb-8">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 160, damping: 14, delay: 0.1 }}
                className="absolute inset-0 rounded-full flex items-center justify-center"
                style={{ background: 'var(--muted)' }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 16, delay: 0.25 }}
                  className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--positive)' }}
                >
                  <motion.div
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <Check size={40} style={{ color: '#fff', strokeWidth: 3 }} />
                  </motion.div>
                </motion.div>
              </motion.div>
              {/* Sparkle decorations */}
              {[0, 1, 2, 3].map(i => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
                  transition={{ duration: 1.6, delay: 0.6 + i * 0.2, repeat: Infinity, repeatDelay: 0.8 }}
                  className="absolute"
                  style={{
                    top: `${[10, 20, 80, 70][i]}%`,
                    left: `${[85, 5, 90, 0][i]}%`,
                  }}
                >
                  <Sparkles size={14} style={{ color: 'var(--foreground)' }} />
                </motion.div>
              ))}
            </div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 22, marginBottom: 8 }}
            >
              Verification Submitted
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              style={{ color: 'var(--muted-foreground)', fontSize: 14, lineHeight: 1.6, marginBottom: 24, maxWidth: 300, margin: '0 auto 24px' }}
            >
              Thank you, {fullName.split(' ')[0] || 'there'}. Your KYC documents have been securely received and are now under review.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="rounded-[20px] p-5 mb-6 mx-auto"
              style={{ background: 'var(--card)', border: '1px solid var(--border)', maxWidth: 340, width: '100%' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--muted)' }}>
                  <Clock size={18} style={{ color: 'var(--foreground)' }} />
                </div>
                <div className="text-left">
                  <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>Estimated Review Time</p>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>24 – 48 hours</p>
                </div>
              </div>
              <div className="h-px mb-4" style={{ background: 'var(--border)' }} />
              <div className="space-y-3 text-left">
                {[
                  { icon: Shield, label: 'Bank-grade encryption', color: 'var(--foreground)' },
                  { icon: Lock, label: 'Data stored securely', color: 'var(--positive)' },
                  { icon: CheckCircle2, label: 'Email notification on completion', color: 'var(--warning)' },
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-center gap-2.5">
                      <Icon size={15} style={{ color: item.color }} />
                      <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col gap-3"
              style={{ maxWidth: 340, width: '100%', margin: '0 auto' }}
            >
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={goBack}
                className="w-full py-3.5 rounded-[16px] text-white flex items-center justify-center gap-2"
                style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 15 }}
              >
                <Home size={18} /> Back to Home
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ---------- MAIN FLOW ----------
  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        onChange={handleFileSelected}
        style={{ display: 'none' }}
      />

      <div style={{ height: 50 }} />

      {/* Header */}
      <div className="flex items-center gap-3 px-5 mb-4">
        <motion.button whileTap={{ scale: 0.9 }} onClick={goBack} aria-label="Go back" className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
          <ChevronLeft size={20} style={{ color: 'var(--foreground)' }} />
        </motion.button>
        <div className="flex-1">
          <h2 style={{ color: 'var(--foreground)', fontWeight: 800 }}>KYC Verification</h2>
          <div className="flex items-center gap-1">
            <Shield size={11} style={{ color: 'var(--positive)' }} />
            <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>Secure & encrypted</p>
          </div>
        </div>
        <div className="px-2.5 py-1 rounded-full" style={{ background: 'var(--muted)' }}>
          <span style={{ color: 'var(--foreground)', fontSize: 11, fontWeight: 700 }}>
            {activeStep + 1}/{STEPS.length}
          </span>
        </div>
      </div>

      {/* Step indicator */}
      <div className="px-5 mb-6">
        <div className="flex items-center">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const done = i < activeStep;
            const active = i === activeStep;
            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                  <motion.div
                    initial={false}
                    animate={{
                      scale: active ? 1.1 : 1,
                    }}
                    className="w-9 h-9 rounded-full flex items-center justify-center relative"
                    style={{
                      background: done ? 'var(--primary)' : active ? 'var(--primary)' : 'var(--muted)',
                      boxShadow: active ? '0 0 0 4px var(--muted)' : 'none',
                      border: `1px solid ${done || active ? 'transparent' : 'var(--border)'}`,
                    }}
                  >
                    <AnimatePresence mode="wait">
                      {done ? (
                        <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                          <Check size={16} style={{ color: '#fff', strokeWidth: 3 }} />
                        </motion.div>
                      ) : (
                        <motion.div key="icon" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                          <Icon size={15} style={{ color: active ? '#fff' : 'var(--muted-foreground)' }} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                  <span
                    style={{
                      color: active ? 'var(--foreground)' : 'var(--muted-foreground)',
                      fontSize: 9,
                      fontWeight: active ? 700 : 500,
                      textAlign: 'center',
                      width: 64,
                      lineHeight: 1.2,
                    }}
                  >
                    {step.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="flex-1 h-0.5 mx-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)', marginTop: -14 }}>
                    <motion.div
                      initial={false}
                      animate={{ width: i < activeStep ? '100%' : '0%' }}
                      transition={{ duration: 0.4 }}
                      className="h-full rounded-full"
                      style={{ background: 'var(--foreground)' }}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Step content */}
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
            {/* =================== STEP 1: PERSONAL INFO =================== */}
            {activeStep === 0 && (
              <div>
                <div className="mb-5">
                  <h3 style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 17, marginBottom: 4 }}>Personal Information</h3>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Tell us a bit about yourself. This must match your ID document.</p>
                </div>

                <div className="rounded-[20px] p-4 mb-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                  {/* Full Name */}
                  <div className="mb-4">
                    <label style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600, marginBottom: 6, display: 'block' }}>Full Name <span style={{ color: 'var(--destructive)' }}>*</span></label>
                    <div className="flex items-center gap-2 px-3.5 rounded-[12px]" style={{ background: 'var(--muted)', border: `1px solid ${personalErrors.fullName ? 'var(--destructive)' : 'var(--border)'}` }}>
                      <User size={16} style={{ color: personalErrors.fullName ? 'var(--destructive)' : 'var(--muted-foreground)' }} />
                      <input
                        type="text"
                        placeholder="e.g. Adeola Okonkwo"
                        value={fullName}
                        onChange={e => { setFullName(e.target.value); if (personalErrors.fullName) setPersonalErrors(prev => ({ ...prev, fullName: '' })); }}
                        className="flex-1 bg-transparent outline-none py-3"
                        style={{ color: 'var(--foreground)', fontSize: 14 }}
                      />
                    </div>
                    {personalErrors.fullName && (
                      <p className="flex items-center gap-1 mt-1.5" style={{ color: 'var(--destructive)', fontSize: 11 }}>
                        <AlertCircle size={11} /> {personalErrors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Date of Birth */}
                  <div className="mb-4">
                    <label style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600, marginBottom: 6, display: 'block' }}>Date of Birth <span style={{ color: 'var(--destructive)' }}>*</span></label>
                    <div className="flex items-center gap-2 px-3.5 rounded-[12px]" style={{ background: 'var(--muted)', border: `1px solid ${personalErrors.dob ? 'var(--destructive)' : 'var(--border)'}` }}>
                      <Calendar size={16} style={{ color: personalErrors.dob ? 'var(--destructive)' : 'var(--muted-foreground)' }} />
                      <input
                        type="date"
                        value={dob}
                        onChange={e => { setDob(e.target.value); if (personalErrors.dob) setPersonalErrors(prev => ({ ...prev, dob: '' })); }}
                        className="flex-1 bg-transparent outline-none py-3"
                        style={{ color: 'var(--foreground)', fontSize: 14 }}
                      />
                    </div>
                    {personalErrors.dob && (
                      <p className="flex items-center gap-1 mt-1.5" style={{ color: 'var(--destructive)', fontSize: 11 }}>
                        <AlertCircle size={11} /> {personalErrors.dob}
                      </p>
                    )}
                  </div>

                  {/* Country Selector */}
                  <div className="mb-4 relative">
                    <label style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600, marginBottom: 6, display: 'block' }}>Country <span style={{ color: 'var(--destructive)' }}>*</span></label>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setCountryOpen(!countryOpen)}
                      className="w-full flex items-center gap-2 px-3.5 py-3 rounded-[12px]"
                      style={{ background: 'var(--muted)', border: `1px solid ${personalErrors.country ? 'var(--destructive)' : countryOpen ? 'var(--primary)' : 'var(--border)'}` }}
                    >
                      <Globe size={16} style={{ color: personalErrors.country ? 'var(--destructive)' : 'var(--primary)' }} />
                      {country ? (
                        <span className="flex items-center gap-2 flex-1 text-left">
                          <span style={{ fontSize: 18 }}>{country.flag}</span>
                          <span style={{ color: 'var(--foreground)', fontSize: 14 }}>{country.name}</span>
                        </span>
                      ) : (
                        <span style={{ color: 'var(--muted-foreground)', fontSize: 14, flex: 1, textAlign: 'left' }}>Select your country</span>
                      )}
                      <motion.div animate={{ rotate: countryOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown size={16} style={{ color: 'var(--muted-foreground)' }} />
                      </motion.div>
                    </motion.button>
                    {personalErrors.country && !countryOpen && (
                      <p className="flex items-center gap-1 mt-1.5" style={{ color: 'var(--destructive)', fontSize: 11 }}>
                        <AlertCircle size={11} /> {personalErrors.country}
                      </p>
                    )}
                    <AnimatePresence>
                      {countryOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -8, height: 0 }}
                          animate={{ opacity: 1, y: 0, height: 'auto' }}
                          exit={{ opacity: 0, y: -8, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden rounded-[12px] mt-1.5 absolute left-0 right-0 z-20"
                          style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 12px 32px rgba(0,0,0,0.18)' }}
                        >
                          <div className="p-2">
                            <div className="flex items-center gap-2 px-3 py-2 rounded-[10px] mb-1" style={{ background: 'var(--muted)' }}>
                              <ChevronRight size={14} style={{ color: 'var(--muted-foreground)', transform: 'rotate(0deg)' }} />
                              <input
                                autoFocus
                                placeholder="Search country..."
                                value={countrySearch}
                                onChange={e => setCountrySearch(e.target.value)}
                                className="flex-1 bg-transparent outline-none"
                                style={{ color: 'var(--foreground)', fontSize: 13 }}
                              />
                            </div>
                            <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                              {filteredCountries.map(c => (
                                <motion.button
                                  key={c.code}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => {
                                    setCountry(c);
                                    setCountryOpen(false);
                                    setCountrySearch('');
                                    if (personalErrors.country) setPersonalErrors(prev => ({ ...prev, country: '' }));
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[10px]"
                                  style={{ background: country?.code === c.code ? 'var(--muted)' : 'transparent' }}
                                >
                                  <span style={{ fontSize: 18 }}>{c.flag}</span>
                                  <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 500 }}>{c.name}</span>
                                  {country?.code === c.code && <Check size={14} style={{ color: 'var(--foreground)', marginLeft: 'auto' }} />}
                                </motion.button>
                              ))}
                              {filteredCountries.length === 0 && (
                                <p style={{ color: 'var(--muted-foreground)', fontSize: 12, textAlign: 'center', padding: '12px 0' }}>No country found</p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Address Line 1 */}
                  <div className="mb-4">
                    <label style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600, marginBottom: 6, display: 'block' }}>Address Line 1 <span style={{ color: 'var(--destructive)' }}>*</span></label>
                    <div className="flex items-center gap-2 px-3.5 rounded-[12px]" style={{ background: 'var(--muted)', border: `1px solid ${personalErrors.address1 ? 'var(--destructive)' : 'var(--border)'}` }}>
                      <MapPin size={16} style={{ color: personalErrors.address1 ? 'var(--destructive)' : 'var(--muted-foreground)' }} />
                      <input
                        type="text"
                        placeholder="Street address"
                        value={address1}
                        onChange={e => { setAddress1(e.target.value); if (personalErrors.address1) setPersonalErrors(prev => ({ ...prev, address1: '' })); }}
                        className="flex-1 bg-transparent outline-none py-3"
                        style={{ color: 'var(--foreground)', fontSize: 14 }}
                      />
                    </div>
                    {personalErrors.address1 && (
                      <p className="flex items-center gap-1 mt-1.5" style={{ color: 'var(--destructive)', fontSize: 11 }}>
                        <AlertCircle size={11} /> {personalErrors.address1}
                      </p>
                    )}
                  </div>

                  {/* Address Line 2 */}
                  <div className="mb-4">
                    <label style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600, marginBottom: 6, display: 'block' }}>Address Line 2 <span style={{ color: 'var(--muted-foreground)', fontSize: 10 }}>(optional)</span></label>
                    <div className="flex items-center gap-2 px-3.5 rounded-[12px]" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
                      <MapPin size={16} style={{ color: 'var(--muted-foreground)', opacity: 0.5 }} />
                      <input
                        type="text"
                        placeholder="Apartment, suite, unit (optional)"
                        value={address2}
                        onChange={e => setAddress2(e.target.value)}
                        className="flex-1 bg-transparent outline-none py-3"
                        style={{ color: 'var(--foreground)', fontSize: 14 }}
                      />
                    </div>
                  </div>

                  {/* City & Postal Code */}
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600, marginBottom: 6, display: 'block' }}>City <span style={{ color: 'var(--destructive)' }}>*</span></label>
                      <div className="flex items-center gap-2 px-3.5 rounded-[12px]" style={{ background: 'var(--muted)', border: `1px solid ${personalErrors.city ? 'var(--destructive)' : 'var(--border)'}` }}>
                        <input
                          type="text"
                          placeholder="City"
                          value={city}
                          onChange={e => { setCity(e.target.value); if (personalErrors.city) setPersonalErrors(prev => ({ ...prev, city: '' })); }}
                          className="flex-1 bg-transparent outline-none py-3 w-full"
                          style={{ color: 'var(--foreground)', fontSize: 14 }}
                        />
                      </div>
                      {personalErrors.city && (
                        <p className="flex items-center gap-1 mt-1.5" style={{ color: 'var(--destructive)', fontSize: 11 }}>
                          <AlertCircle size={11} /> {personalErrors.city}
                        </p>
                      )}
                    </div>
                    <div className="flex-1">
                      <label style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600, marginBottom: 6, display: 'block' }}>Postal Code <span style={{ color: 'var(--destructive)' }}>*</span></label>
                      <div className="flex items-center gap-2 px-3.5 rounded-[12px]" style={{ background: 'var(--muted)', border: `1px solid ${personalErrors.postalCode ? 'var(--destructive)' : 'var(--border)'}` }}>
                        <input
                          type="text"
                          placeholder="Postal code"
                          value={postalCode}
                          onChange={e => { setPostalCode(e.target.value); if (personalErrors.postalCode) setPersonalErrors(prev => ({ ...prev, postalCode: '' })); }}
                          className="flex-1 bg-transparent outline-none py-3 w-full"
                          style={{ color: 'var(--foreground)', fontSize: 14 }}
                        />
                      </div>
                      {personalErrors.postalCode && (
                        <p className="flex items-center gap-1 mt-1.5" style={{ color: 'var(--destructive)', fontSize: 11 }}>
                          <AlertCircle size={11} /> {personalErrors.postalCode}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex gap-3">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={prevStep}
                    disabled
                    className="flex items-center justify-center gap-1.5 py-3.5 rounded-[16px]"
                    style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', fontWeight: 700, fontSize: 15, width: 56, opacity: 0.5 }}
                  >
                    <ArrowLeft size={18} />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleNext}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[16px] text-white"
                    style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 15 }}
                  >
                    Continue <ArrowRight size={18} />
                  </motion.button>
                </div>
              </div>
            )}

            {/* =================== STEP 2: DOCUMENT UPLOAD =================== */}
            {activeStep === 1 && (
              <div>
                <div className="mb-5">
                  <h3 style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 17, marginBottom: 4 }}>Document Upload</h3>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Choose your document type and upload a clear photo.</p>
                </div>

                {/* Document type cards */}
                <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600, marginBottom: 10 }}>Select Document Type <span style={{ color: 'var(--destructive)' }}>*</span></p>
                <div className="flex flex-col gap-2.5 mb-4">
                  {DOC_TYPES.map(doc => {
                    const DocIcon = doc.icon;
                    const selected = docType === doc.id;
                    return (
                      <motion.button
                        key={doc.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => { setDocType(doc.id); if (docErrors.docType) setDocErrors(prev => ({ ...prev, docType: '' })); }}
                        className="flex items-center gap-3 p-4 rounded-[16px] text-left"
                        style={{
                          background: 'var(--card)',
                          border: `1.5px solid ${selected ? 'var(--primary)' : 'var(--border)'}`,
                          boxShadow: selected ? '0 0 0 3px var(--muted)' : 'none',
                        }}
                      >
                        <div className="w-11 h-11 rounded-[12px] flex items-center justify-center flex-shrink-0" style={{ background: selected ? 'var(--muted)' : 'var(--muted)' }}>
                          <DocIcon size={22} style={{ color: selected ? 'var(--primary)' : 'var(--muted-foreground)' }} />
                        </div>
                        <div className="flex-1">
                          <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>{doc.label}</p>
                          <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{doc.desc}</p>
                        </div>
                        <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0" style={{ borderColor: selected ? 'var(--primary)' : 'var(--border)', background: selected ? 'var(--primary)' : 'transparent' }}>
                          {selected && <Check size={12} style={{ color: '#fff', strokeWidth: 3 }} />}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
                {docErrors.docType && (
                  <p className="flex items-center gap-1 mb-3" style={{ color: 'var(--destructive)', fontSize: 11 }}>
                    <AlertCircle size={11} /> {docErrors.docType}
                  </p>
                )}

                {/* Upload area / preview / camera */}
                <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600, marginBottom: 10 }}>
                  {uploadedFile ? 'Document Preview' : 'Upload Front of Document'} {!uploadedFile && <span style={{ color: 'var(--destructive)' }}>*</span>}
                </p>

                <AnimatePresence mode="wait">
                  {showCamera ? (
                    <CameraCapture
                      key="camera"
                      onCapture={handleCameraCapture}
                      onClose={() => setShowCamera(false)}
                      title="Capture Document"
                      subtitle="Align your document within the frame"
                      guideShape="rect"
                    />
                  ) : uploadedFile ? (
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="rounded-[16px] p-4 mb-4"
                      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-[12px] flex items-center justify-center flex-shrink-0" style={{ background: 'var(--muted)' }}>
                          {uploadedFile.type.includes('pdf') ? <FileText size={22} style={{ color: 'var(--positive)' }} /> : <CheckCircle2 size={22} style={{ color: 'var(--positive)' }} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{uploadedFile.name}</p>
                          <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{formatFileSize(uploadedFile.size)} • {uploadedFile.type.includes('pdf') ? 'PDF' : 'Image'}</p>
                        </div>
                        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setUploadedFile(null)} className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--muted)' }}>
                          <Trash2 size={16} style={{ color: 'var(--destructive)' }} />
                        </motion.button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="dropzone"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <motion.div
                        whileTap={{ scale: 0.99 }}
                        onClick={triggerFilePick}
                        onDragEnter={e => { e.preventDefault(); setIsDragging(true); }}
                        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={e => { e.preventDefault(); setIsDragging(false); }}
                        onDrop={e => { e.preventDefault(); setIsDragging(false); triggerFilePick(); }}
                        className="rounded-[20px] py-8 px-5 flex flex-col items-center gap-3 cursor-pointer mb-3"
                        style={{
                          background: 'var(--card)',
                          border: `2px dashed ${isDragging ? 'var(--primary)' : 'var(--border)'}`,
                          background2: isDragging ? 'var(--muted)' : 'var(--card)',
                        }}
                      >
                        <motion.div
                          animate={{ y: isDragging ? -4 : 0 }}
                          className="w-14 h-14 rounded-full flex items-center justify-center"
                          style={{ background: isDragging ? 'var(--muted)' : 'var(--muted)' }}
                        >
                          <Upload size={26} style={{ color: isDragging ? 'var(--primary)' : 'var(--muted-foreground)' }} />
                        </motion.div>
                        <div className="text-center">
                          <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>
                            {isDragging ? 'Drop to upload' : 'Tap to upload or drag & drop'}
                          </p>
                          <p style={{ color: 'var(--muted-foreground)', fontSize: 11, marginTop: 2 }}>PNG, JPG or PDF • Max 10MB</p>
                        </div>
                      </motion.div>

                      {/* Take Photo button */}
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setShowCamera(true)}
                        className="w-full py-3 rounded-[14px] flex items-center justify-center gap-2 mb-4"
                        style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}
                      >
                        <Camera size={18} style={{ color: 'var(--foreground)' }} /> Take Photo
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
                {docErrors.uploadedFile && !showCamera && (
                  <p className="flex items-center gap-1 mb-3" style={{ color: 'var(--destructive)', fontSize: 11 }}>
                    <AlertCircle size={11} /> {docErrors.uploadedFile}
                  </p>
                )}

                {/* Navigation */}
                <div className="flex gap-3 mt-2">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={prevStep}
                    className="flex items-center justify-center gap-1.5 py-3.5 rounded-[16px]"
                    style={{ background: 'var(--muted)', color: 'var(--foreground)', fontWeight: 700, fontSize: 15, width: 56, border: '1px solid var(--border)' }}
                  >
                    <ArrowLeft size={18} />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleNext}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[16px] text-white"
                    style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 15 }}
                  >
                    Continue <ArrowRight size={18} />
                  </motion.button>
                </div>
              </div>
            )}

            {/* =================== STEP 3: SELFIE VERIFICATION =================== */}
            {activeStep === 2 && (
              <div>
                <div className="mb-5">
                  <h3 style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 17, marginBottom: 4 }}>Selfie Verification</h3>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>We need to confirm it's really you. Follow the liveness prompts.</p>
                </div>

                <div className="rounded-[20px] p-5 mb-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                  {/* Camera viewfinder with face guide */}
                  <div className="relative mx-auto rounded-[20px] overflow-hidden mb-4" style={{ width: 220, height: 280, background: 'var(--card)' }}>
                    {/* Oval face guide */}
                    <div
                      className="absolute top-1/2 left-1/2"
                      style={{
                        width: 150,
                        height: 190,
                        transform: 'translate(-50%, -50%)',
                        borderRadius: '50%',
                        border: `2.5px ${livenessComplete ? 'solid var(--positive)' : livenessActive ? 'solid var(--primary)' : 'dashed rgba(255,255,255,0.45)'}`,
                        boxShadow: livenessActive ? '0 0 24px var(--muted)' : 'none',
                        transition: 'all 0.4s ease',
                      }}
                    />
                    {/* Placeholder face silhouette */}
                    {!selfieCaptured && (
                      <div className="absolute top-1/2 left-1/2 flex items-center justify-center" style={{ transform: 'translate(-50%, -50%)' }}>
                        <User size={56} style={{ color: 'rgba(255,255,255,0.25)' }} />
                      </div>
                    )}
                    {/* Captured selfie placeholder */}
                    {selfieCaptured && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ background: 'var(--card)' }}
                      >
                        <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'var(--muted)' }}>
                          <CheckCircle2 size={40} style={{ color: 'var(--positive)' }} />
                        </div>
                      </motion.div>
                    )}

                    {/* Top status bar */}
                    <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-3 py-2.5" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.5), transparent)' }}>
                      <span style={{ color: '#fff', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: livenessActive ? 'var(--destructive)' : 'var(--positive)', display: 'inline-block' }} />
                        {livenessActive ? 'LIVE' : 'READY'}
                      </span>
                      {livenessComplete && (
                        <span style={{ color: 'var(--positive)', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Check size={12} /> VERIFIED
                        </span>
                      )}
                    </div>

                    {/* Liveness prompt overlay */}
                    <AnimatePresence>
                      {livenessActive && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute bottom-0 left-0 right-0 px-3 pb-3 pt-8"
                          style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.7), transparent)' }}
                        >
                          <motion.div
                            key={livenessStep}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="rounded-full px-3 py-2 flex items-center justify-center gap-2"
                            style={{ background: 'var(--foreground)' }}
                          >
                            {livenessStep === 0 ? (
                              <>
                                <ArrowLeft size={14} style={{ color: '#fff' }} />
                                <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>Look Left</span>
                              </>
                            ) : livenessStep === 1 ? (
                              <>
                                <ArrowRight size={14} style={{ color: '#fff' }} />
                                <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>Look Right</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 size={14} style={{ color: '#fff' }} />
                                <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>Hold Still</span>
                              </>
                            )}
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Progress dots */}
                    {livenessActive && (
                      <div className="absolute top-10 left-1/2 flex gap-1.5" style={{ transform: 'translateX(-50%)' }}>
                        {[0, 1, 2].map(i => (
                          <div
                            key={i}
                            style={{
                              width: 18,
                              height: 3,
                              borderRadius: 2,
                              background: i <= livenessStep ? '#fff' : 'rgba(255,255,255,0.3)',
                              transition: 'background 0.3s',
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Tips / status */}
                  {!selfieCaptured && !livenessActive && (
                    <>
                      <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15, textAlign: 'center', marginBottom: 6 }}>Position Your Face</p>
                      <p style={{ color: 'var(--muted-foreground)', fontSize: 12, textAlign: 'center', lineHeight: 1.5, marginBottom: 16 }}>
                        Center your face in the oval and follow the on-screen prompts.
                      </p>
                      <div className="space-y-2 mb-5">
                        {[
                          { icon: Eye, text: 'Look directly at the camera' },
                          { icon: EyeOff, text: 'Remove glasses, hats or masks' },
                          { icon: CheckCircle2, text: 'Ensure your face is well lit' },
                          { icon: Shield, text: 'No filters or face modifications' },
                        ].map(tip => {
                          const Icon = tip.icon;
                          return (
                            <div key={tip.text} className="flex items-center gap-2.5">
                              <Icon size={14} style={{ color: 'var(--foreground)' }} />
                              <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{tip.text}</span>
                            </div>
                          );
                        })}
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={startLivenessCheck}
                        className="w-full py-3.5 rounded-[16px] text-white flex items-center justify-center gap-2"
                        style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 15, boxShadow: 'none' }}
                      >
                        <Camera size={18} /> Start Selfie Capture
                      </motion.button>
                    </>
                  )}

                  {livenessActive && (
                    <div className="text-center py-2">
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14, marginBottom: 4 }}
                      >
                        Liveness Check in Progress
                      </motion.p>
                      <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Keep your face within the oval and follow the prompts</p>
                    </div>
                  )}

                  {selfieCaptured && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                      <div className="rounded-[12px] p-3 mb-4 flex items-center gap-2.5" style={{ background: 'var(--muted)', border: '1px solid var(--muted)' }}>
                        <CheckCircle2 size={18} style={{ color: 'var(--positive)' }} />
                        <div className="flex-1">
                          <p style={{ color: 'var(--positive)', fontWeight: 700, fontSize: 13 }}>Selfie Captured Successfully</p>
                          <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>Liveness verification passed</p>
                        </div>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => { setSelfieCaptured(false); setLivenessComplete(false); setLivenessStep(0); }}
                        className="w-full py-3 rounded-[14px] flex items-center justify-center gap-2 mb-3"
                        style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}
                      >
                        <RefreshCw size={16} /> Retake Selfie
                      </motion.button>
                    </motion.div>
                  )}
                </div>

                {selfieErrors.selfie && (
                  <p className="flex items-center gap-1 mb-3" style={{ color: 'var(--destructive)', fontSize: 11 }}>
                    <AlertCircle size={11} /> {selfieErrors.selfie}
                  </p>
                )}

                {/* Navigation */}
                <div className="flex gap-3">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={prevStep}
                    className="flex items-center justify-center gap-1.5 py-3.5 rounded-[16px]"
                    style={{ background: 'var(--muted)', color: 'var(--foreground)', fontWeight: 700, fontSize: 15, width: 56, border: '1px solid var(--border)' }}
                  >
                    <ArrowLeft size={18} />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleNext}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[16px] text-white"
                    style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 15 }}
                  >
                    Continue <ArrowRight size={18} />
                  </motion.button>
                </div>
              </div>
            )}

            {/* =================== STEP 4: REVIEW =================== */}
            {activeStep === 3 && (
              <div>
                <div className="mb-5">
                  <h3 style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 17, marginBottom: 4 }}>Review & Submit</h3>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Please confirm your information before submitting.</p>
                </div>

                {/* Personal Info Summary */}
                <div className="rounded-[20px] p-4 mb-3" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-[10px] flex items-center justify-center" style={{ background: 'var(--muted)' }}>
                        <User size={16} style={{ color: 'var(--foreground)' }} />
                      </div>
                      <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>Personal Information</p>
                    </div>
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => goToStep(0)} className="px-3 py-1.5 rounded-[10px] flex items-center gap-1" style={{ background: 'var(--muted)' }}>
                      <ChevronLeft size={12} style={{ color: 'var(--foreground)', transform: 'rotate(180deg)' }} />
                      <span style={{ color: 'var(--foreground)', fontSize: 12, fontWeight: 600 }}>Edit</span>
                    </motion.button>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: 'Full Name', value: fullName },
                      { label: 'Date of Birth', value: dob },
                      { label: 'Country', value: country ? `${country.flag} ${country.name}` : '' },
                      { label: 'Address', value: [address1, address2].filter(Boolean).join(', ') },
                      { label: 'City', value: city },
                      { label: 'Postal Code', value: postalCode },
                    ].map(row => (
                      <div key={row.label} className="flex justify-between items-start gap-3">
                        <span style={{ color: 'var(--muted-foreground)', fontSize: 12, flexShrink: 0 }}>{row.label}</span>
                        <span style={{ color: 'var(--foreground)', fontSize: 12, fontWeight: 600, textAlign: 'right', wordBreak: 'break-word' }}>{row.value || '—'}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Document Summary */}
                <div className="rounded-[20px] p-4 mb-3" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-[10px] flex items-center justify-center" style={{ background: 'var(--muted)' }}>
                        <FileText size={16} style={{ color: 'var(--foreground)' }} />
                      </div>
                      <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>Document</p>
                    </div>
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => goToStep(1)} className="px-3 py-1.5 rounded-[10px] flex items-center gap-1" style={{ background: 'var(--muted)' }}>
                      <ChevronLeft size={12} style={{ color: 'var(--foreground)', transform: 'rotate(180deg)' }} />
                      <span style={{ color: 'var(--foreground)', fontSize: 12, fontWeight: 600 }}>Edit</span>
                    </motion.button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-3">
                      <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Document Type</span>
                      <span style={{ color: 'var(--foreground)', fontSize: 12, fontWeight: 600, textAlign: 'right' }}>{docTypeLabel || '—'}</span>
                    </div>
                    <div className="flex justify-between items-start gap-3">
                      <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>File</span>
                      <span style={{ color: 'var(--foreground)', fontSize: 12, fontWeight: 600, textAlign: 'right' }}>
                        {uploadedFile ? `${uploadedFile.name} (${formatFileSize(uploadedFile.size)})` : '—'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Selfie Summary */}
                <div className="rounded-[20px] p-4 mb-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-[10px] flex items-center justify-center" style={{ background: 'var(--muted)' }}>
                        <Camera size={16} style={{ color: 'var(--foreground)' }} />
                      </div>
                      <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>Selfie Verification</p>
                    </div>
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => goToStep(2)} className="px-3 py-1.5 rounded-[10px] flex items-center gap-1" style={{ background: 'var(--muted)' }}>
                      <ChevronLeft size={12} style={{ color: 'var(--foreground)', transform: 'rotate(180deg)' }} />
                      <span style={{ color: 'var(--foreground)', fontSize: 12, fontWeight: 600 }}>Edit</span>
                    </motion.button>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} style={{ color: 'var(--positive)' }} />
                    <span style={{ color: 'var(--foreground)', fontSize: 12, fontWeight: 600 }}>Liveness check passed</span>
                  </div>
                </div>

                {/* Consent note */}
                <div className="rounded-[14px] p-3.5 mb-4 flex items-start gap-2.5" style={{ background: 'var(--muted)', border: '1px solid var(--muted)' }}>
                  <Shield size={16} style={{ color: 'var(--foreground)', flexShrink: 0, marginTop: 1 }} />
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 11, lineHeight: 1.5 }}>
                    By submitting, you confirm the information is accurate and consent to Convia verifying your identity with our compliance partners. Your data is encrypted and stored securely.
                  </p>
                </div>

                {/* Navigation */}
                <div className="flex gap-3">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={prevStep}
                    className="flex items-center justify-center gap-1.5 py-3.5 rounded-[16px]"
                    style={{ background: 'var(--muted)', color: 'var(--foreground)', fontWeight: 700, fontSize: 15, width: 56, border: '1px solid var(--border)' }}
                  >
                    <ArrowLeft size={18} />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[16px] text-white"
                    style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 15, opacity: submitting ? 0.8 : 1 }}
                  >
                    {submitting ? (
                      <>
                        <Loader size={18} className="animate-spin" /> Submitting...
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={18} /> Submit Verification
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Selfie Camera Capture Modal */}
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
