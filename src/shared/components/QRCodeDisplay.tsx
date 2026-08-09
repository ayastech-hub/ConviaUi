import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  fgColor?: string;
  bgColor?: string;
}

export function QRCodeDisplay({ value, size = 200, fgColor = '#000000', bgColor = '#FFFFFF' }: QRCodeDisplayProps) {
  const [dataUrl, setDataUrl] = useState('');

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(value, {
      width: size * 2,
      margin: 1,
      color: { dark: fgColor, light: bgColor },
      errorCorrectionLevel: 'M',
    }).then(url => {
      if (!cancelled) setDataUrl(url);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [value, size, fgColor, bgColor]);

  if (!dataUrl) {
    return <div style={{ width: size, height: size, borderRadius: 10, background: bgColor }} />;
  }

  return (
    <img
      src={dataUrl}
      alt="QR Code"
      style={{ width: size, height: size, borderRadius: 10, display: 'block' }}
    />
  );
}
