export interface QRPayload {
  address: string;
  asset?: string;
  chain?: string;
  amount?: string;
}

export function encodeQRPayload(data: QRPayload): string {
  const parts: string[] = [];
  if (data.address) parts.push(`address=${data.address}`);
  if (data.asset) parts.push(`asset=${data.asset}`);
  if (data.chain) parts.push(`chain=${data.chain}`);
  if (data.amount) parts.push(`amount=${data.amount}`);
  return parts.join('|');
}

export function parseQRPayload(raw: string): QRPayload | null {
  if (!raw) return null;
  const payload: QRPayload = { address: '' };
  const parts = raw.split('|');
  for (const part of parts) {
    const [key, ...valueParts] = part.split('=');
    const value = valueParts.join('=').trim();
    if (!key || !value) continue;
    if (key === 'address') payload.address = value;
    else if (key === 'asset') payload.asset = value;
    else if (key === 'chain') payload.chain = value;
    else if (key === 'amount') payload.amount = value;
  }
  if (!payload.address) {
    if (/^(0x)?[0-9a-fA-F]{40,}$/.test(raw.trim()) || /^[1-9A-HJ-NP-Za-km-z]{32,}$/.test(raw.trim()) || /^bc1[a-z0-9]{30,}$/.test(raw.trim())) {
      return { address: raw.trim() };
    }
    return null;
  }
  return payload;
}

let pendingPrefill: QRPayload | null = null;

export function setSendPrefill(data: QRPayload | null) {
  pendingPrefill = data;
}

export function consumeSendPrefill(): QRPayload | null {
  const data = pendingPrefill;
  pendingPrefill = null;
  return data;
}
