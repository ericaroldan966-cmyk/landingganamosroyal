import { CONFIG } from '../config';

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
    });
    const text = await response.text();
    return text ? JSON.parse(text) as T : null;
  } catch {
    return null;
  }
}

export function buildWhatsAppUrl(ref: string): string {
  const text = 'Hola, quiero más información. ' + ref + ' quiero mi 100%!';
  return 'https://wa.me/' + CONFIG.WHATSAPP_NUMBER + '?text=' + encodeURIComponent(text);
}
