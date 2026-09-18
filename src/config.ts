const host = window.location.hostname;
const isLocal = host === 'localhost' || host === '127.0.0.1';

const WHATSAPP_LINES = [
  '5491125778364',
] as const;

export const CONFIG = {
  TENANT: 'royal' as const,
  PIXEL_ID: (import.meta.env.VITE_PIXEL_ID || '1767312904299608').trim(),
  PIXEL_ID_2: (import.meta.env.VITE_PIXEL_ID_2 || '1075060428238436').trim(),
  API_URL: (import.meta.env.VITE_API_URL || (isLocal ? 'http://localhost:8787' : 'https://apimanualroyal-production.up.railway.app')).replace(/\/$/, ''),
  WHATSAPP_NUMBERS: [...WHATSAPP_LINES],
  LANDING_URL: import.meta.env.VITE_LANDING_URL || 'https://ericaroldan966-cmyk.github.io/landingappganamos/',
};

export function pickWhatsAppNumber(_ref: string): string {
  return '5491125778364';
}
