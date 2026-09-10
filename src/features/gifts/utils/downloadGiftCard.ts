import QRCode from 'qrcode';
import type { Gift } from '../types';
import { claimUrl } from '../types';
import { THEMES } from '../components/GiftCard';

/** Render a share poster to PNG and trigger download. */
export async function downloadGiftCard(gift: Gift, filename?: string): Promise<void> {
  const theme = THEMES[gift.cardTheme || 'classic'] || THEMES.classic;
  const url = claimUrl(gift.code);
  const W = 720;
  const H = 1080;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');

  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, '#1a1a22');
  g.addColorStop(1, '#0c0c10');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = theme.accent;
  ctx.globalAlpha = 0.45;
  ctx.lineWidth = 3;
  roundRect(ctx, 28, 28, W - 56, H - 56, 36);
  ctx.stroke();
  ctx.globalAlpha = 1;

  ctx.fillStyle = theme.muted;
  ctx.font = '600 28px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${gift.creatorMask || 'user'}'s Giveaway`, W / 2, 120);

  ctx.fillStyle = theme.accent;
  ctx.font = '700 40px system-ui, -apple-system, sans-serif';
  const message = gift.note?.trim() || 'All the Best — Claim Your Gift!';
  wrapText(ctx, message, W / 2, 200, W - 120, 48);

  ctx.strokeStyle = theme.accent;
  ctx.lineWidth = 2;
  roundRect(ctx, W / 2 - 90, 320, 180, 40, 20);
  ctx.stroke();
  ctx.fillStyle = theme.text;
  ctx.font = '800 18px system-ui, -apple-system, sans-serif';
  ctx.fillText('CONVIA', W / 2, 347);

  const qrData = await QRCode.toDataURL(url, {
    width: 360,
    margin: 2,
    color: { dark: '#0A0A0A', light: '#FFFFFF' },
  });
  const img = await loadImage(qrData);
  const qrBox = 380;
  const qx = (W - qrBox) / 2;
  const qy = 400;
  ctx.fillStyle = theme.giftBox;
  roundRect(ctx, qx - 16, qy - 16, qrBox + 32, qrBox + 32, 28);
  ctx.fill();
  ctx.strokeStyle = theme.accent;
  ctx.lineWidth = 4;
  roundRect(ctx, qx - 16, qy - 16, qrBox + 32, qrBox + 32, 28);
  ctx.stroke();
  ctx.fillStyle = '#fff';
  roundRect(ctx, qx, qy, qrBox, qrBox, 16);
  ctx.fill();
  ctx.drawImage(img, qx + 20, qy + 20, qrBox - 40, qrBox - 40);

  ctx.fillStyle = theme.muted;
  ctx.font = '500 24px system-ui, -apple-system, sans-serif';
  ctx.fillText('Scan the QR code to claim', W / 2, 900);

  ctx.fillStyle = theme.text;
  ctx.font = '700 22px system-ui, -apple-system, sans-serif';
  ctx.fillText(gift.code, W / 2, 960);

  const a = document.createElement('a');
  a.download = filename || `convia-giveaway-${gift.code}.png`;
  a.href = canvas.toDataURL('image/png');
  a.click();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(' ');
  let line = '';
  let yy = y;
  for (let n = 0; n < words.length; n++) {
    const test = line + words[n] + ' ';
    if (ctx.measureText(test).width > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, yy);
      line = words[n] + ' ';
      yy += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line.trim(), x, yy);
}
