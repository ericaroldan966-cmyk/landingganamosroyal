import { CONFIG, pickWhatsAppNumber } from '../config';
import { whatsappCode, unwrapDisplayCode } from './visit';

function apiUrl(path: string): string {
  return CONFIG.API_URL ? CONFIG.API_URL + path : '';
}

type PostOptions = {
  timeoutMs?: number;
  keepalive?: boolean;
};

export async function postJson<T>(path: string, body: unknown, options: PostOptions = {}): Promise<T | null> {
  const url = apiUrl(path);
  if (!url) return null;
  const timeoutMs = options.timeoutMs ?? 5000;
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Tenant': CONFIG.TENANT },
      body: JSON.stringify(body),
      signal: controller.signal,
      keepalive: Boolean(options.keepalive),
    });
    if (!response.ok) return null;
    const text = await response.text();
    const data = text ? JSON.parse(text) as T : null;
    if (!data || typeof data !== 'object') return null;
    return data;
  } catch {
    return null;
  } finally {
    window.clearTimeout(timer);
  }
}

export async function postJsonRetry<T extends { ref?: string }>(
  path: string,
  body: unknown,
  attempts = 5,
  options: PostOptions = {},
): Promise<T | null> {
  for (let i = 0; i < attempts; i++) {
    const result = await postJson<T>(path, body, options);
    if (result?.ref) return result;
    await new Promise((resolve) => setTimeout(resolve, 400 * (i + 1)));
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

/** Fire-and-forget lead that should survive navigation to WhatsApp. */
export function postLeadKeepalive(body: unknown): void {
  const url = apiUrl('/api/lead');
  if (!url) return;
  try {
    void fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Tenant': CONFIG.TENANT },
      body: JSON.stringify(body),
      keepalive: true,
    });
  } catch {
    postBeacon('/api/lead', body);
  }
}

export function buildWhatsAppUrl(ref: string): string {
  const code = unwrapDisplayCode(ref);
  if (!/^\d{1,10}$/.test(code)) return '';
  const text = 'Hola, quiero más información. ' + whatsappCode(code) + ' quiero mi beneficio';
  return 'https://wa.me/' + pickWhatsAppNumber(code) + '?text=' + encodeURIComponent(text);
}
