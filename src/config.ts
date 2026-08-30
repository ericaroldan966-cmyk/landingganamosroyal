const host = window.location.hostname;
const isLocal = host === 'localhost' || host === '127.0.0.1';

export const CONFIG = {
  PIXEL_ID: (import.meta.env.VITE_PIXEL_ID || '1767312904299608').trim(),
  API_URL: (import.meta.env.VITE_API_URL || (isLocal ? 'http://localhost:8787' : 'https://apimanualroyal-production.up.railway.app')).replace(/\/$/, ''),
  WHATSAPP_NUMBER: (import.meta.env.VITE_WHATSAPP_NUMBER || '5492235471076').replace(/\D/g, ''),
  LANDING_URL: import.meta.env.VITE_LANDING_URL || 'https://ericaroldan966-cmyk.github.io/landingappganamos/',
};
