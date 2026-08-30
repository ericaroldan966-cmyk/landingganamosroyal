import { CONFIG } from '../config';

type FbqFn = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[];
  loaded: boolean;
  version: string;
  push: (...args: unknown[]) => void;
};

let pageViewSent = false;

export function initPixel(): void {
  if (!/^\d{5,20}$/.test(CONFIG.PIXEL_ID)) return;
  if (!window.fbq) {
    const fbq: FbqFn = function (...args: unknown[]) {
      if (fbq.callMethod) fbq.callMethod(...args);
      else fbq.queue.push(args);
    } as FbqFn;
    fbq.queue = [];
    fbq.loaded = true;
    fbq.version = '2.0';
    fbq.push = fbq;
    window.fbq = fbq;
    window._fbq = fbq;
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    const first = document.getElementsByTagName('script')[0];
    if (first && first.parentNode) first.parentNode.insertBefore(script, first);
    else document.head.appendChild(script);
  }
  window.fbq?.('init', CONFIG.PIXEL_ID);
  if (!pageViewSent) {
    window.fbq?.('track', 'PageView');
    pageViewSent = true;
  }
}

export function trackBrowserLead(eventId: string): void {
  if (typeof window.fbq !== 'function') return;
  window.fbq('track', 'Lead', {}, { eventID: eventId });
}
