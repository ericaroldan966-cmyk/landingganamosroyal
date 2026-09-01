const host = window.location.hostname;
const isLocal = host === 'localhost' || host === '127.0.0.1';

const DEFAULT_WHATSAPP_NUMBERS = [
  '5491125546449',
  '5491140923175',
  '5491125752310',
  '5491125554018',
];
const WA_ROTATION_KEY = 'ganamos_wa_rr';
const WA_CHOSEN_KEY = 'ganamos_wa_line';

function parseWhatsAppNumbers(value: string | undefined): string[] {
  const parsed = String(value || '')
    .split(/[,\s]+/)
    .map((item) => item.trim())
    .filter(Boolean);
  return parsed.length ? parsed : DEFAULT_WHATSAPP_NUMBERS;
}

export const CONFIG = {
  PIXEL_ID: (import.meta.env.VITE_PIXEL_ID || '1767312904299608').trim(),
  API_URL: (import.meta.env.VITE_API_URL || (isLocal ? 'http://localhost:8787' : 'https://apimanualroyal-production.up.railway.app')).replace(/\/$/, ''),
  WHATSAPP_NUMBERS: parseWhatsAppNumbers(
    import.meta.env.VITE_WHATSAPP_NUMBERS || import.meta.env.VITE_WHATSAPP_NUMBER
  ),
  LANDING_URL: import.meta.env.VITE_LANDING_URL || 'https://ericaroldan966-cmyk.github.io/landingappganamos/',
};

export function pickWhatsAppNumber(_ref: string): string {
  const numbers = CONFIG.WHATSAPP_NUMBERS;
  if (!numbers.length) return '';

  try {
    const chosen = sessionStorage.getItem(WA_CHOSEN_KEY);
    if (chosen && numbers.includes(chosen)) return chosen;
  } catch {
    // ignore
  }

  let next = 0;
  try {
    next = Number(localStorage.getItem(WA_ROTATION_KEY) || '0') || 0;
  } catch {
    // ignore
  }

  const number = numbers[((next % numbers.length) + numbers.length) % numbers.length];

  try {
    localStorage.setItem(WA_ROTATION_KEY, String(next + 1));
    sessionStorage.setItem(WA_CHOSEN_KEY, number);
  } catch {
    // ignore
  }

  return number;
}
