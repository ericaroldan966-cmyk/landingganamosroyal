const host = window.location.hostname;
const isLocal = host === 'localhost' || host === '127.0.0.1';

const WHATSAPP_LINES = [
  '5491125546449',
  '5491140923175',
  '5491125752310',
  '5491125554018',
] as const;

function isKnownLine(value: string): boolean {
  return (WHATSAPP_LINES as readonly string[]).includes(value);
}

function nextLine(): string {
  return WHATSAPP_LINES[Math.floor(Date.now() / 250) % WHATSAPP_LINES.length];
}

function readStoredLine(): string {
  try {
    const visit = JSON.parse(localStorage.getItem('gn_visit') || '{}') as { wa_line?: string };
    if (visit.wa_line && isKnownLine(visit.wa_line)) return visit.wa_line;
  } catch {
    /* ignore */
  }
  return '';
}

function persistLine(line: string): void {
  try {
    const visit = JSON.parse(localStorage.getItem('gn_visit') || '{}') as Record<string, unknown>;
    visit.wa_line = line;
    localStorage.setItem('gn_visit', JSON.stringify(visit));
  } catch {
    /* ignore */
  }
}

export const CONFIG = {
  PIXEL_ID: (import.meta.env.VITE_PIXEL_ID || '1767312904299608').trim(),
  API_URL: (import.meta.env.VITE_API_URL || (isLocal ? 'http://localhost:8787' : 'https://apimanualroyal-production.up.railway.app')).replace(/\/$/, ''),
  WHATSAPP_NUMBERS: [...WHATSAPP_LINES],
  LANDING_URL: import.meta.env.VITE_LANDING_URL || 'https://ericaroldan966-cmyk.github.io/landingappganamos/',
};

export function pickWhatsAppNumber(_ref: string): string {
  const existing = readStoredLine();
  if (existing) return existing;
  const line = nextLine();
  persistLine(line);
  return line;
}
