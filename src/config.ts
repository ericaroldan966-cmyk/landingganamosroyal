const host = window.location.hostname;
const isLocal = host === 'localhost' || host === '127.0.0.1';

const FALLBACK_WHATSAPP_NUMBERS = [
  '5491125689335',
  '5491125778364',
  '5491125546449',
  '5491125693189',
];

let activeLines: string[] = [...FALLBACK_WHATSAPP_NUMBERS];

function currentLines(): string[] {
  return activeLines.length ? activeLines : [...FALLBACK_WHATSAPP_NUMBERS];
}

function readStoredLine(): string {
  try {
    const visit = JSON.parse(localStorage.getItem('gn_visit') || '{}') as { wa_line?: string };
    const stored = String(visit.wa_line || '');
    if (stored && currentLines().includes(stored)) return stored;
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
  TENANT: 'royal' as const,
  PIXEL_ID: (import.meta.env.VITE_PIXEL_ID || '1767312904299608').trim(),
  PIXEL_ID_2: (import.meta.env.VITE_PIXEL_ID_2 || '1075060428238436').trim(),
  API_URL: (import.meta.env.VITE_API_URL || (isLocal ? 'http://localhost:8787' : 'https://apimanualroyal-production.up.railway.app')).replace(/\/$/, ''),
  WHATSAPP_NUMBERS: [...FALLBACK_WHATSAPP_NUMBERS],
  LANDING_URL: import.meta.env.VITE_LANDING_URL || 'https://ericaroldan966-cmyk.github.io/landingappganamos/',
};

export async function refreshWhatsAppLines(): Promise<string[]> {
  const url = CONFIG.API_URL + '/api/whatsapp-lines?tenant=' + CONFIG.TENANT;
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 4000);
  try {
    const response = await fetch(url, { headers: { 'X-Tenant': CONFIG.TENANT }, signal: controller.signal });
    if (response.ok) {
      const data = await response.json() as { numbers?: string[] };
      const next = (Array.isArray(data.numbers) ? data.numbers : []).map((item) => String(item || '')).filter(Boolean);
      if (next.length) {
        activeLines = next;
        return activeLines;
      }
    }
  } catch {
    /* fallback */
  } finally {
    window.clearTimeout(timer);
  }
  activeLines = [...FALLBACK_WHATSAPP_NUMBERS];
  return activeLines;
}

export function pickWhatsAppNumber(_ref: string): string {
  const lines = currentLines();
  const existing = readStoredLine();
  if (existing) return existing;
  const line = lines[Math.floor(Date.now() / 250) % lines.length] || '';
  if (line) persistLine(line);
  return line;
}
