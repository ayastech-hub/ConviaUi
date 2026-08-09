import { useRef, useEffect, useState, useCallback } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { motion } from 'motion/react';
import { X, ScanLine, Camera, ImageIcon, AlertCircle } from 'lucide-react';

interface QRScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
  onManualEntry?: () => void;
}

export function QRScanner({ onScan, onClose, onManualEntry }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const [error, setError] = useState('');
  const [scanned, setScanned] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);

  useEffect(() => {
    let mounted = true;
    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;

    const startCamera = async () => {
      try {
        const constraints: MediaStreamConstraints = {
          video: { facingMode: 'environment' },
          audio: false,
        };

        // Try environment camera first, fall back to any camera
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch {
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        }

        if (!mounted) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        // Check torch support
        const track = stream.getVideoTracks()[0];
        const capabilities = track.getCapabilities?.() as MediaTrackCapabilities & { torch?: boolean };
        if (capabilities?.torch) setTorchSupported(true);

        // Start ZXing decoding on the video element
        const controls = await reader.decodeFromVideoDevice(
          undefined,
          videoRef.current!,
          (result, err) => {
            if (result && !scanned) {
              setScanned(true);
              controls.stop();
              stream.getTracks().forEach(t => t.stop());
              onScan(result.getText());
            }
          }
        );
        controlsRef.current = controls;
      } catch (e) {
        setError('Camera access denied. Please allow camera permissions to scan QR codes.');
      }
    };

    startCamera();

    return () => {
      mounted = false;
      controlsRef.current?.stop();
      const stream = videoRef.current?.srcObject as MediaStream | null;
      stream?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const toggleTorch = useCallback(async () => {
    const stream = videoRef.current?.srcObject as MediaStream | null;
    const track = stream?.getVideoTracks()[0];
    if (!track) return;
    try {
      await track.applyConstraints({ advanced: [{ torch: !torchOn } as MediaTrackConstraintSet] });
      setTorchOn(!torchOn);
    } catch {
      // torch not supported
    }
  }, [torchOn]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 z-50"
        style={{ background: 'rgba(0,0,0,0.85)' }}
      />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="absolute inset-0 z-50 flex flex-col items-center justify-center px-8"
      >
        <button onClick={onClose} aria-label="Close scanner" className="absolute top-12 right-5 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
          <X size={20} className="text-white" />
        </button>

        {error ? (
          <div className="flex flex-col items-center text-center max-w-xs">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <AlertCircle size={32} className="text-white" />
            </div>
            <p className="text-white mb-2" style={{ fontSize: 16, fontWeight: 700 }}>Camera Unavailable</p>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 20 }}>{error}</p>
            {onManualEntry && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onManualEntry}
                className="px-8 py-3 rounded-[16px] text-white"
                style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 15 }}
              >
                Enter Address Manually
              </motion.button>
            )}
          </div>
        ) : (
          <>
            {/* Scanner frame */}
            <div className="w-64 h-64 rounded-[28px] relative overflow-hidden mb-8" style={{ border: '3px solid rgba(255,255,255,0.2)' }}>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-10 h-10 pointer-events-none" style={{ borderTop: '3px solid var(--primary)', borderLeft: '3px solid var(--primary)', borderRadius: '12px 0 0 0' }} />
              <div className="absolute top-0 right-0 w-10 h-10 pointer-events-none" style={{ borderTop: '3px solid var(--primary)', borderRight: '3px solid var(--primary)', borderRadius: '0 12px 0 0' }} />
              <div className="absolute bottom-0 left-0 w-10 h-10 pointer-events-none" style={{ borderBottom: '3px solid var(--primary)', borderLeft: '3px solid var(--primary)', borderRadius: '0 0 0 12px' }} />
              <div className="absolute bottom-0 right-0 w-10 h-10 pointer-events-none" style={{ borderBottom: '3px solid var(--primary)', borderRight: '3px solid var(--primary)', borderRadius: '0 0 12px 0' }} />
              {/* Scanning line */}
              <motion.div
                animate={{ y: [0, 240, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute left-0 right-0 h-0.5 pointer-events-none"
                style={{ background: 'linear-gradient(90deg, transparent, var(--primary), transparent)' }}
              />
              {scanned && (
                <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
                  <ScanLine size={48} className="text-white" />
                </div>
              )}
            </div>

            <p className="text-white mb-2" style={{ fontSize: 18, fontWeight: 700 }}>Scan QR Code</p>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, textAlign: 'center', marginBottom: 24 }}>
              {scanned ? 'QR detected!' : 'Point your camera at a QR code to send, receive, or pay instantly'}
            </p>

            <div className="flex gap-3">
              {torchSupported && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleTorch}
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: torchOn ? 'var(--primary)' : 'rgba(255,255,255,0.15)' }}
                >
                  <Camera size={20} className="text-white" />
                </motion.button>
              )}
              {onManualEntry && (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={onManualEntry}
                  className="px-8 py-3 rounded-[16px] text-white flex items-center gap-2"
                  style={{ background: 'rgba(255,255,255,0.15)', fontWeight: 700, fontSize: 15 }}
                >
                  <ImageIcon size={16} />
                  Enter Manually
                </motion.button>
              )}
            </div>
          </>
        )}
      </motion.div>
    </>
  );
}
