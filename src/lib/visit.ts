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
  landing_url: string;
  referrer: string;
  fbp: string;
  fbc: string;
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

export function isValidRef(ref: string): boolean {
  return /^REF-[A-Z0-9]{6,12}$/.test(ref);
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
  const data = {
    ref: stored.ref || makeRef(),
    landing_url: stored.landing_url || window.location.href,
    referrer: stored.referrer || document.referrer || '',
    fbp: '',
    fbc: '',
  } as VisitData;

  for (const key of ATTR_KEYS) {
    data[key] = params.get(key) || stored[key] || '';
  }

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
    ref: data.ref,
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
  };
}
