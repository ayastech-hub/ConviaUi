import { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { X, Camera, Loader, RefreshCw, Check, Upload } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (dataUrl: string) => void;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  guideShape?: 'rect' | 'oval';
}

export function CameraCapture({ onCapture, onClose, title = 'Take Photo', subtitle = 'Position within the frame', guideShape = 'rect' }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState('');
  const [captured, setCaptured] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
    let mounted = true;
    const start = async () => {
      try {
        const constraints: MediaStreamConstraints = {
          video: { facingMode: 'environment' },
          audio: false,
        };
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch {
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        }
        if (!mounted) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch {
        setError('Camera access denied. Please allow camera permissions.');
      }
    };
    start();
    return () => {
      mounted = false;
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const handleCapture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    setCapturing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    setTimeout(() => {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCaptured(dataUrl);
      setCapturing(false);
    }, 400);
  }, []);

  const handleConfirm = () => {
    if (captured) onCapture(captured);
  };

  const handleRetake = () => {
    setCaptured(null);
  };

  const handleClose = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    onClose();
  };

  if (error) {
    return (
      <>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleClose} className="absolute inset-0 z-50" style={{ background: 'rgba(0,0,0,0.85)' }} />
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="absolute inset-0 z-50 flex flex-col items-center justify-center px-8">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <Camera size={32} className="text-white" />
          </div>
          <p className="text-white mb-2" style={{ fontSize: 16, fontWeight: 700 }}>Camera Unavailable</p>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, textAlign: 'center', marginBottom: 20 }}>{error}</p>
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleClose} className="px-8 py-3 rounded-[16px] text-white" style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 15 }}>Go Back</motion.button>
        </motion.div>
      </>
    );
  }

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleClose} className="absolute inset-0 z-50" style={{ background: 'rgba(0,0,0,0.9)' }} />
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="absolute inset-0 z-50 flex flex-col">
        <button onClick={handleClose} aria-label="Close" className="absolute top-12 right-5 w-10 h-10 rounded-full flex items-center justify-center z-10" style={{ background: 'rgba(255,255,255,0.15)' }}>
          <X size={20} className="text-white" />
        </button>

        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <p className="text-white mb-1" style={{ fontSize: 18, fontWeight: 700 }}>{title}</p>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 24 }}>{subtitle}</p>

          {/* Camera viewfinder */}
          <div className="relative rounded-[20px] overflow-hidden" style={{ width: 280, height: guideShape === 'oval' ? 340 : 360, background: '#0a0a0a' }}>
            {!captured ? (
              <>
                <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
                {/* Guide frame */}
                {guideShape === 'oval' ? (
                  <div className="absolute top-1/2 left-1/2 pointer-events-none" style={{ width: 180, height: 220, transform: 'translate(-50%, -50%)', borderRadius: '50%', border: '2.5px dashed rgba(255,255,255,0.4)' }} />
                ) : (
                  <>
                    <div className="absolute pointer-events-none" style={{ width: '78%', height: '72%', top: '14%', left: '11%', border: '2px dashed rgba(255,255,255,0.35)', borderRadius: 12 }} />
                    {[
                      { top: '14%', left: '11%', borderTop: '3px solid #fff', borderLeft: '3px solid #fff' },
                      { top: '14%', right: '11%', borderTop: '3px solid #fff', borderRight: '3px solid #fff' },
                      { bottom: '14%', left: '11%', borderBottom: '3px solid #fff', borderLeft: '3px solid #fff' },
                      { bottom: '14%', right: '11%', borderBottom: '3px solid #fff', borderRight: '3px solid #fff' },
                    ].map((c, i) => <div key={i} className="absolute w-6 h-6 pointer-events-none" style={{ ...c, borderRadius: 2 }} />)}
                  </>
                )}
                {capturing && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0, 0.8, 0] }} transition={{ duration: 0.4 }} className="absolute inset-0" style={{ background: '#fff' }} />
                )}
              </>
            ) : (
              <img src={captured} alt="Captured" className="w-full h-full object-cover" />
            )}
          </div>

          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {/* Controls */}
          <div className="mt-8 flex items-center gap-4">
            {!captured ? (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleCapture}
                disabled={capturing}
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: '#fff', border: '4px solid rgba(255,255,255,0.3)' }}
              >
                {capturing ? <Loader size={22} className="animate-spin" style={{ color: '#000' }} /> : <Camera size={24} style={{ color: '#000' }} />}
              </motion.button>
            ) : (
              <>
                <motion.button whileTap={{ scale: 0.9 }} onClick={handleRetake} className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
                  <RefreshCw size={20} className="text-white" />
                </motion.button>
                <motion.button whileTap={{ scale: 0.9 }} onClick={handleConfirm} className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'var(--positive)', border: '4px solid rgba(255,255,255,0.3)' }}>
                  <Check size={28} className="text-white" />
                </motion.button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}
