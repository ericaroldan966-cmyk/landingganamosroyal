import { CONFIG } from '../config';

const STORAGE_KEY = 'gn_visit';
const REF_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const ATTR_KEYS = [
  'fbclid',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'campaign_id',
  'adset_id',
  'ad_id',
  'campaign_name',
  'adset_name',
  'ad_name',
] as const;

export type VisitData = {
  ref: string;
  ref_confirmed?: boolean;
  landing_url: string;
  referrer: string;
  fbp: string;
  fbc: string;
  a?: number;
  wa_line?: string;
  lead_sent?: boolean;
} & Record<(typeof ATTR_KEYS)[number], string>;

export function makeRef(): string {
  let out = '';
  for (let i = 0; i < 6; i++) {
    out += REF_CHARS.charAt(Math.floor(Math.random() * REF_CHARS.length));
  }
  return 'REF-' + out;
}

export function unwrapDisplayCode(ref: string): string {
  const raw = String(ref || '').trim();
  const glued = raw.toUpperCase().replace(/[\u2011\u2060]/g, '-').replace(/[\s\u00A0]+/g, '');
  const visual = glued.match(/^REF-?(\d{1,10})$/);
  if (visual) return visual[1];
  return raw;
}

export function displayCode(ref: string): string {
  const raw = unwrapDisplayCode(ref);
  if (/^\d{1,10}$/.test(raw)) return 'REF-' + raw;
  return raw;
}

export function whatsappCode(ref: string): string {
  const raw = unwrapDisplayCode(ref);
  if (/^\d{1,10}$/.test(raw)) return 'REF-\u2060' + raw;
  return raw;
}

export function isValidRef(ref: string): boolean {
  return /^\d{1,10}$/.test(unwrapDisplayCode(ref));
}

export function normalizeRef(ref: string): string {
  const raw = unwrapDisplayCode(String(ref || '').trim());
  if (/^\d{1,10}$/.test(raw)) return raw;
  const compact = raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (compact.startsWith('REF')) {
    const rest = compact.slice(3);
    if (/^\d{1,10}$/.test(rest)) return rest;
    if (compact.length >= 9 && compact.length <= 15) {
      const next = 'REF-' + rest;
      return /^REF-[A-Z0-9]{6,12}$/.test(next) ? next : '';
    }
  }
  if (/^[A-Z0-9]{6,12}$/.test(compact) && /[A-Z]/.test(compact)) return 'REF-' + compact;
  return '';
}

export function getCookie(name: string): string {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/[$()*+./?[\\\]^{|}]/g, '\\$&') + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : '';
}

export function setCookie(name: string, value: string, days: number): void {
  const exp = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + exp + '; path=/; SameSite=Lax';
}

function readStored(): Partial<VisitData> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {};
  } catch {
    return {};
  }
}

export function saveStored(data: VisitData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

export function captureVisit(): VisitData {
  const stored = readStored();
  const params = new URLSearchParams(window.location.search);
  const storedRef = normalizeRef(String(stored.ref || ''));
  const data = {
    ref: stored.ref_confirmed && storedRef ? storedRef : '',
    ref_confirmed: Boolean(stored.ref_confirmed && storedRef),
    landing_url: stored.landing_url || window.location.href,
    referrer: stored.referrer || document.referrer || '',
    fbp: '',
    fbc: '',
  } as VisitData;

  for (const key of ATTR_KEYS) {
    data[key] = params.get(key) || stored[key] || '';
  }

  const ad = Number(params.get('a') || stored.a || 0);
  data.a = Number.isInteger(ad) && ad >= 1 ? ad : 0;

  const cookieFbc = getCookie('_fbc');
  const cookieFbp = getCookie('_fbp');
  if (data.fbclid && !cookieFbc && !stored.fbc) {
    const generated = 'fb.1.' + Date.now() + '.' + data.fbclid;
    setCookie('_fbc', generated, 90);
    data.fbc = generated;
  } else {
    data.fbc = cookieFbc || stored.fbc || '';
  }
  data.fbp = cookieFbp || stored.fbp || '';
  data.wa_line = stored.wa_line;
  data.lead_sent = stored.lead_sent;
  data.ref_confirmed = Boolean(data.ref_confirmed && isValidRef(data.ref));
  if (!isValidRef(data.ref)) {
    data.ref = '';
    data.ref_confirmed = false;
  }
  saveStored(data);
  return data;
}

export function refreshCookies(data: VisitData): VisitData {
  data.fbc = getCookie('_fbc') || data.fbc || '';
  data.fbp = getCookie('_fbp') || data.fbp || '';
  if (data.fbclid && !data.fbc) {
    data.fbc = 'fb.1.' + Date.now() + '.' + data.fbclid;
    setCookie('_fbc', data.fbc, 90);
  }
  saveStored(data);
  return data;
}

export function visitPayload(data: VisitData) {
  return {
    ref: data.ref_confirmed && isValidRef(data.ref) ? data.ref : '',
    fbclid: data.fbclid,
    fbp: data.fbp,
    fbc: data.fbc,
    utm_source: data.utm_source,
    utm_medium: data.utm_medium,
    utm_campaign: data.utm_campaign,
    utm_content: data.utm_content,
    utm_term: data.utm_term,
    campaign_id: data.campaign_id,
    adset_id: data.adset_id,
    ad_id: data.ad_id,
    campaign_name: data.campaign_name,
    adset_name: data.adset_name,
    ad_name: data.ad_name,
    landing_url: data.landing_url,
    referrer: data.referrer,
    tenant: CONFIG.TENANT,
    a: data.a && data.a >= 1 ? data.a : undefined,
  };
}
