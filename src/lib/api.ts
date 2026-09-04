import { CONFIG, pickWhatsAppNumber } from '../config';

function apiUrl(path: string): string {
  return CONFIG.API_URL ? CONFIG.API_URL + path : '';
}

export async function postJson<T>(path: string, body: unknown): Promise<T | null> {
  const url = apiUrl(path);
  if (!url) return null;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
    });
    const text = await response.text();
    return text ? JSON.parse(text) as T : null;
  } catch {
    return null;
  }
}

export async function postJsonRetry<T>(path: string, body: unknown, attempts = 3): Promise<T | null> {
  for (let i = 0; i < attempts; i++) {
    const result = await postJson<T>(path, body);
    if (result) return result;
    await new Promise((resolve) => setTimeout(resolve, 300 * (i + 1)));
  }
  return null;
}

export function postBeacon(path: string, body: unknown): boolean {
  const url = apiUrl(path);
  if (!url || typeof navigator === 'undefined' || !navigator.sendBeacon) return false;
  try {
    return navigator.sendBeacon(url, new Blob([JSON.stringify(body)], { type: 'text/plain' }));
  } catch {
    return false;
  }
}

export function buildWhatsAppUrl(ref: string): string {
  const text = 'Hola, quiero más información. ' + ref + ' quiero mi 100%!';
  return 'https://wa.me/' + pickWhatsAppNumber(ref) + '?text=' + encodeURIComponent(text);
}
