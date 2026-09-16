import { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { X, Camera, Loader, RefreshCw, Check, Image as ImageIcon } from 'lucide-react';
import { createPortal } from 'react-dom';

interface CameraCaptureProps {
  onCapture: (dataUrl: string) => void;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  guideShape?: 'rect' | 'oval';
  /** environment = document, user = selfie */
  facingMode?: 'user' | 'environment';
}

/**
 * Full-viewport camera (portal) — does not sit as a translucent overlay over the form.
 */
export function CameraCapture({
  onCapture,
  onClose,
  title = 'Take Photo',
  subtitle = 'Position within the frame',
  guideShape = 'rect',
  facingMode = 'environment',
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState('');
  const [captured, setCaptured] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    const start = async () => {
      try {
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: facingMode }, width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: false,
          });
        } catch {
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        }
        if (!mounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setReady(true);
        }
      } catch {
        setError('Camera access denied. Allow camera permission or upload a file instead.');
      }
    };
    void start();
    return () => {
      mounted = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [facingMode]);

  const handleCapture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    setCapturing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setCapturing(false);
      return;
    }
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    setCaptured(dataUrl);
    setCapturing(false);
  }, [facingMode]);

  const handleClose = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    onClose();
  };

  const body = (
    <div
      className="fixed inset-0 z-[200] flex flex-col"
      style={{ background: '#0a0a0a' }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-[max(12px,env(safe-area-inset-top))] pb-2">
        <button
          type="button"
          onClick={handleClose}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.12)' }}
          aria-label="Close"
        >
          <X size={20} className="text-white" />
        </button>
        <div className="text-center flex-1 px-2">
          <p className="text-white" style={{ fontSize: 16, fontWeight: 750 }}>
            {title}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>{subtitle}</p>
        </div>
        <div className="w-10" />
      </div>

      <div className="flex-1 flex flex-col min-h-0 relative">
        {error ? (
          <div className="flex-1 flex flex-col items-center justify-center px-8">
            <Camera size={40} className="text-white mb-4 opacity-70" />
            <p className="text-white text-center mb-2" style={{ fontWeight: 700, fontSize: 16 }}>
              Camera unavailable
            </p>
            <p className="text-center mb-6" style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>
              {error}
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="px-8 h-11 rounded-full text-white"
              style={{ background: 'var(--primary)', fontWeight: 700 }}
            >
              Go back
            </button>
          </div>
        ) : captured ? (
          /* Real image preview */
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 relative mx-3 mb-3 rounded-[20px] overflow-hidden bg-black">
              <img
                src={captured}
                alt="Capture preview"
                className="absolute inset-0 w-full h-full object-contain"
              />
            </div>
            <div className="px-5 pb-[max(20px,env(safe-area-inset-bottom))] flex gap-3">
              <button
                type="button"
                onClick={() => setCaptured(null)}
                className="flex-1 h-12 rounded-2xl flex items-center justify-center gap-2 text-white"
                style={{ background: 'rgba(255,255,255,0.12)', fontWeight: 700, fontSize: 14 }}
              >
                <RefreshCw size={18} /> Retake
              </button>
              <button
                type="button"
                onClick={() => onCapture(captured)}
                className="flex-1 h-12 rounded-2xl flex items-center justify-center gap-2 text-white"
                style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 14 }}
              >
                <Check size={18} /> Use photo
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 relative mx-0 bg-black overflow-hidden">
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className="absolute inset-0 w-full h-full object-cover"
                style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : undefined }}
              />
              {/* Guide frame */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                  className={guideShape === 'oval' ? 'rounded-full' : 'rounded-[24px]'}
                  style={{
                    width: guideShape === 'oval' ? '72%' : '88%',
                    height: guideShape === 'oval' ? '52%' : '62%',
                    maxWidth: 340,
                    maxHeight: guideShape === 'oval' ? 420 : 480,
                    border: '2px solid rgba(255,255,255,0.85)',
                    boxShadow: '0 0 0 9999px rgba(0,0,0,0.45)',
                  }}
                />
              </div>
              {!ready && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <Loader className="animate-spin text-white" size={28} />
                </div>
              )}
            </div>
            <div className="px-5 py-5 pb-[max(24px,env(safe-area-inset-bottom))] flex flex-col items-center gap-3">
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }} className="flex items-center gap-1">
                <ImageIcon size={12} /> Hold steady · good light
              </p>
              <button
                type="button"
                disabled={!ready || capturing}
                onClick={handleCapture}
                className="w-[72px] h-[72px] rounded-full flex items-center justify-center"
                style={{
                  background: 'white',
                  opacity: !ready || capturing ? 0.5 : 1,
                  boxShadow: '0 0 0 6px rgba(255,255,255,0.25)',
                }}
                aria-label="Capture"
              >
                {capturing ? (
                  <Loader className="animate-spin" size={24} style={{ color: '#111' }} />
                ) : (
                  <div className="w-14 h-14 rounded-full border-[3px] border-black/20" />
                )}
              </button>
            </div>
          </div>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(body, document.body);
}
