import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, AlertCircle, Camera, Upload, FileText, CheckCircle2, Trash2 } from 'lucide-react';
import { CameraCapture } from '../../../../shared/components/CameraCapture';
import { DOC_TYPES, formatFileSize, type DocType, type UploadedFile } from './types';
import { StepNavButtons } from './StepNavButtons';

interface DocumentUploadStepProps {
  docType: DocType | null;
  setDocType: (t: DocType) => void;
  uploadedFile: UploadedFile | null;
  setUploadedFile: (f: UploadedFile | null) => void;
  errors: Record<string, string>;
  clearError: (field: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

/** KYC Step 2: choose a document type, then upload or photograph it. */
export function DocumentUploadStep({
  docType, setDocType, uploadedFile, setUploadedFile, errors, clearError, onBack, onContinue,
}: DocumentUploadStepProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerFilePick = () => fileInputRef.current?.click();

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile({ name: file.name, size: file.size, type: file.type });
      clearError('uploadedFile');
    }
    if (e.target.value) e.target.value = '';
  };

  const handleCameraCapture = (dataUrl: string) => {
    setShowCamera(false);
    setUploadedFile({ name: 'document_camera_capture.jpg', size: Math.round(dataUrl.length * 0.75), type: 'image/jpeg' });
    clearError('uploadedFile');
  };

  return (
    <div>
      <div className="mb-5">
        <h3 style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 17, marginBottom: 4 }}>Document Upload</h3>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Choose your document type and upload a clear photo.</p>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={handleFileSelected} />

      <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600, marginBottom: 10 }}>
        Select Document Type <span style={{ color: 'var(--destructive)' }}>*</span>
      </p>
      <div className="flex flex-col gap-2.5 mb-4">
        {DOC_TYPES.map((doc) => {
          const DocIcon = doc.icon;
          const selected = docType === doc.id;
          return (
            <motion.button
              key={doc.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setDocType(doc.id); clearError('docType'); }}
              className="flex items-center gap-3 p-4 rounded-[16px] text-left"
              style={{ background: 'var(--card)', border: `1.5px solid ${selected ? 'var(--primary)' : 'var(--border)'}`, boxShadow: selected ? '0 0 0 3px var(--muted)' : 'none' }}
            >
              <div className="w-11 h-11 rounded-[12px] flex items-center justify-center flex-shrink-0" style={{ background: 'var(--muted)' }}>
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
      {errors.docType && (
        <p className="flex items-center gap-1 mb-3" style={{ color: 'var(--destructive)', fontSize: 11 }}>
          <AlertCircle size={11} /> {errors.docType}
        </p>
      )}

      <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600, marginBottom: 10 }}>
        {uploadedFile ? 'Document Preview' : 'Upload Front of Document'} {!uploadedFile && <span style={{ color: 'var(--destructive)' }}>*</span>}
      </p>

      <AnimatePresence mode="wait">
        {showCamera ? (
          <CameraCapture key="camera" onCapture={handleCameraCapture} onClose={() => setShowCamera(false)} title="Capture Document" subtitle="Align your document within the frame" guideShape="rect" />
        ) : uploadedFile ? (
          <motion.div key="preview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="rounded-[16px] p-4 mb-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
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
          <motion.div key="dropzone" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
              whileTap={{ scale: 0.99 }}
              onClick={triggerFilePick}
              onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); triggerFilePick(); }}
              className="rounded-[20px] py-8 px-5 flex flex-col items-center gap-3 cursor-pointer mb-3"
              style={{ background: 'var(--card)', border: `2px dashed ${isDragging ? 'var(--primary)' : 'var(--border)'}` }}
            >
              <motion.div animate={{ y: isDragging ? -4 : 0 }} className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'var(--muted)' }}>
                <Upload size={26} style={{ color: isDragging ? 'var(--primary)' : 'var(--muted-foreground)' }} />
              </motion.div>
              <div className="text-center">
                <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>{isDragging ? 'Drop to upload' : 'Tap to upload or drag & drop'}</p>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 11, marginTop: 2 }}>PNG, JPG or PDF • Max 10MB</p>
              </div>
            </motion.div>

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
      {errors.uploadedFile && !showCamera && (
        <p className="flex items-center gap-1 mb-3" style={{ color: 'var(--destructive)', fontSize: 11 }}>
          <AlertCircle size={11} /> {errors.uploadedFile}
        </p>
      )}

      <div className="mt-2">
        <StepNavButtons onBack={onBack} onContinue={onContinue} />
      </div>
    </div>
  );
}
