const host = window.location.hostname;
const isLocal = host === 'localhost' || host === '127.0.0.1';

const WHATSAPP_LINES = [
  '5491125546449',
  '5491140923175',
  '5491125752310',
  '5491125554018',
] as const;

function lineFromRef(ref: string): string {
  let hash = 0;
  const key = String(ref || '');
  for (let i = 0; i < key.length; i++) {
    hash = Math.imul(hash, 31) + key.charCodeAt(i);
  }
  return WHATSAPP_LINES[(hash >>> 0) % WHATSAPP_LINES.length];
}

export const CONFIG = {
  PIXEL_ID: (import.meta.env.VITE_PIXEL_ID || '1767312904299608').trim(),
  API_URL: (import.meta.env.VITE_API_URL || (isLocal ? 'http://localhost:8787' : 'https://apimanualroyal-production.up.railway.app')).replace(/\/$/, ''),
  WHATSAPP_NUMBERS: [...WHATSAPP_LINES],
  LANDING_URL: import.meta.env.VITE_LANDING_URL || 'https://ericaroldan966-cmyk.github.io/landingappganamos/',
};

export function pickWhatsAppNumber(ref: string): string {
  return lineFromRef(ref);
}
