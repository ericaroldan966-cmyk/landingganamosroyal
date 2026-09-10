import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { postBeacon, postJson, postJsonRetry, buildWhatsAppUrl } from './lib/api';
import { initPixel, trackBrowserLead, trackBrowserCheckout } from './lib/pixel';
import DepthText from './components/DepthText';
import SpecularButton from './components/SpecularButton';
import { captureVisit, isValidRef, refreshCookies, saveStored, visitPayload, type VisitData } from './lib/visit';

type LeadResult = { ok?: boolean; ref?: string };

export default function App() {
  const visitRef = useRef<VisitData>(captureVisit());
  const [busy, setBusy] = useState(false);
  const [ctaError, setCtaError] = useState('');

  function applyRef(ref: string): string {
    const raw = String(ref || '').trim();
    const next = /^\d{1,10}$/.test(raw) ? raw : raw.toUpperCase();
    if (!isValidRef(next)) return visitRef.current.ref;
    visitRef.current.ref = next;
    visitRef.current.ref_confirmed = true;
    saveStored(visitRef.current);
    return next;
  }

  useEffect(() => {
    const visit = refreshCookies(visitRef.current);
    visitRef.current = visit;
    void postJson<LeadResult>('/api/visit', visitPayload(visit)).then((result) => {
      if (result?.ref) applyRef(result.ref);
      initPixel(result?.ref ? 'pv_' + result.ref : undefined);
    });
    const flushVisit = () => {
      if (!visitRef.current.ref_confirmed) return;
      postBeacon('/api/visit', visitPayload(visitRef.current));
    };
    window.addEventListener('pagehide', flushVisit);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) flushVisit();
    });
    return () => {
      window.removeEventListener('pagehide', flushVisit);
    };
  }, []);

  async function persistLead(): Promise<LeadResult | null> {
    const visit = refreshCookies(visitRef.current);
    visitRef.current = visit;
    const visitResult = await postJsonRetry<LeadResult>('/api/visit', visitPayload(visit));
    const savedRef = visitResult?.ref ? applyRef(visitResult.ref) : '';
    if (!isValidRef(savedRef)) return null;

    const current = visitRef.current;
    const eventId = 'lead_' + current.ref;
    const payload = { ...visitPayload(current), event_id: eventId };
    if (!current.lead_sent) {
      trackBrowserLead(eventId);
      trackBrowserCheckout('ic_' + current.ref);
      current.lead_sent = true;
      saveStored(current);
    }
    void postJsonRetry<LeadResult>('/api/lead', payload);
    return { ok: true, ref: savedRef };
  }

  async function onCtaClick(event: MouseEvent<HTMLElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (busy) return;
    setBusy(true);
    setCtaError('');
    const popup = window.open('about:blank', '_blank');
    try {
      const result = await persistLead();
      const ref = result?.ref ? result.ref.toUpperCase() : '';
      if (!isValidRef(ref)) {
        popup?.close();
        setCtaError('No pudimos generar tu código. Tocá de nuevo para reintentar.');
        return;
      }
      const wa = buildWhatsAppUrl(ref);
      if (!wa) {
        popup?.close();
        setCtaError('No pudimos generar tu código. Tocá de nuevo para reintentar.');
        return;
      }
      if (popup && !popup.closed) popup.location.replace(wa);
      else window.location.assign(wa);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <main>
        <div className="promo-plain" aria-label="100% de beneficio. Duplica tu carga">
          <p>100% DE BENEFICIO</p>
          <p>DUPLICA TU CARGA!!!</p>
        </div>
        <p className="logo" aria-label="Ganamos.net">
          G
          <svg viewBox="0 0 64 64" aria-hidden="true">
            <path fill="#c084fc" d="M32 4C18 22 8 30 8 42c0 9 7 16 16 16 4.2 0 8-1.8 10-5.2C36 56.2 39.8 58 44 58c9 0 16-7 16-16C60 30 50 22 32 4zm-3.2 54 3.2-10 3.2 10H28.8z" />
          </svg>
          NAMOS<span className="net">.NET</span>
        </p>
        <p className="badge">JUGÁ ONLINE</p>
        <h1 className="hero-title">
          <DepthText
            text="BONU$ DE"
            faceColor="#f0abfc"
            depthColor="#c026d3"
            fontSize="1em"
            fontWeight={800}
            layers={8}
            depth={1.8}
            tilt={7.5}
            shadow={false}
          />
          <DepthText
            text="BIENVENIDA!"
            faceColor="#f0abfc"
            depthColor="#c026d3"
            fontSize="1em"
            fontWeight={800}
            layers={8}
            depth={1.8}
            tilt={7.5}
            shadow={false}
          />
        </h1>
        <p className="sub">DIVERTITE OFICIALMENTE CON NOSOTROS, SIN VUELTAS!</p>
        <div className="cta-block">
          <p className="benefit">100% DE BENEFICIO</p>
          <SpecularButton
            type="button"
            ariaLabel="Activar beneficio"
            className={busy ? 'specular-cta is-busy' : 'specular-cta'}
            size="lg"
            radius={14}
            textColor="#ffffff"
            disabled={busy}
            onClick={onCtaClick}
          >
            <span className="wa" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path fill="#fff" d="M12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.4 1.3 4.9L2 22l5.3-1.3A10 10 0 0 0 22 12C22 6.5 17.5 2 12 2zm5.8 14.4c-.2.7-1.2 1.2-1.9 1.4-.5.1-1.2.2-3.5-.7-2.9-1.2-4.8-4.2-4.9-4.4-.2-.2-1.3-1.7-1.3-3.3 0-1.5.8-2.3 1.1-2.6.3-.3.6-.4.8-.4h.6c.2 0 .4 0 .6.5.2.6.8 2 .8 2.1s.1.3 0 .5l-.4.7c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.2 1.4 2.5 1.5.3.1.5.1.7-.1l.8-1c.2-.2.4-.2.6-.1.3.1 1.7.8 2 .9.3.1.5.2.6.3.1.2.1.8-.1 1.5z" />
              </svg>
            </span>
            ACTIVAR BENEFICIO
          </SpecularButton>
          {ctaError ? <p className="sub" role="alert">{ctaError}</p> : null}
        </div>
      </main>
    </>
  );
}
