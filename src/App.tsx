import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { CONFIG } from './config';
import { postJson, buildWhatsAppUrl } from './lib/api';
import { initPixel, trackBrowserLead } from './lib/pixel';
import { captureVisit, refreshCookies, saveStored, visitPayload, type VisitData } from './lib/visit';

type LeadResult = { ok?: boolean; ref?: string };

export default function App() {
  const visitRef = useRef<VisitData>(captureVisit());
  const [waUrl, setWaUrl] = useState(() => buildWhatsAppUrl(visitRef.current.ref));
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const leadLocked = useRef(false);

  useEffect(() => {
    initPixel();
    const timer = window.setTimeout(() => {
      const visit = refreshCookies(visitRef.current);
      visitRef.current = visit;
      void postJson<{ ref?: string }>('/api/visit', visitPayload(visit)).then((result) => {
        if (result?.ref) {
          visit.ref = result.ref;
          saveStored(visit);
          visitRef.current = visit;
          setWaUrl(buildWhatsAppUrl(visit.ref));
        }
      });
    }, 600);
    return () => window.clearTimeout(timer);
  }, []);

  async function sendLead(openWhatsApp: boolean): Promise<LeadResult | null> {
    if (leadLocked.current) return null;
    leadLocked.current = true;
    setBusy(true);
    const visit = refreshCookies(visitRef.current);
    visitRef.current = visit;
    const eventId = 'lead_' + visit.ref;
    const wa = buildWhatsAppUrl(visit.ref);
    setWaUrl(wa);
    const payload = { ...visitPayload(visit), event_id: eventId };

    if (!visit.lead_sent) {
      trackBrowserLead(eventId);
      visit.lead_sent = true;
      saveStored(visit);
    }

    const result = await postJson<LeadResult>('/api/lead', payload);
    leadLocked.current = false;
    setBusy(false);
    if (result?.ref) {
      visit.ref = result.ref;
      saveStored(visit);
      visitRef.current = visit;
      setWaUrl(buildWhatsAppUrl(visit.ref));
    }
    if (openWhatsApp) {
      window.location.href = wa;
      return result;
    }
    if (result?.ok) setStatus({ ok: true, text: 'Lead guardado. REF: ' + visit.ref });
    else setStatus({ ok: false, text: 'Backend desconectado. El REF local es ' + visit.ref });
    return result;
  }

  function onCtaClick(event: MouseEvent<HTMLAnchorElement>) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      window.location.href = buildWhatsAppUrl(visitRef.current.ref);
    };
    void sendLead(false).then(finish);
    window.setTimeout(finish, 700);
  }

  return (
    <>
      <main>
        <p className="promo">100% DE BENEFICIO ❤️</p>
        <p className="logo" aria-label="Ganamos.net">
          G
          <svg viewBox="0 0 64 64" aria-hidden="true">
            <path fill="#c084fc" d="M32 4C18 22 8 30 8 42c0 9 7 16 16 16 4.2 0 8-1.8 10-5.2C36 56.2 39.8 58 44 58c9 0 16-7 16-16C60 30 50 22 32 4zm-3.2 54 3.2-10 3.2 10H28.8z" />
          </svg>
          NAMOS<span className="net">.NET</span>
        </p>
        <p className="badge">JUGÁ ONLINE</p>
        <h1>
          BONU$ DE
          <br />
          BIENVENIDA!
        </h1>
        <p className="sub">DIVERTITE OFICIALMENTE CON NOSOTROS, SIN VUELTAS!</p>
        <div className="cta-block">
          <p className="benefit">100% DE BENEFICIO</p>
          <a
            id="cta"
            className={busy ? 'btn is-busy' : 'btn'}
            href={waUrl}
            rel="noopener noreferrer"
            aria-label="Activar beneficio por WhatsApp"
            onClick={onCtaClick}
          >
            <span className="wa" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path fill="#fff" d="M12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.4 1.3 4.9L2 22l5.3-1.3A10 10 0 0 0 22 12C22 6.5 17.5 2 12 2zm5.8 14.4c-.2.7-1.2 1.2-1.9 1.4-.5.1-1.2.2-3.5-.7-2.9-1.2-4.8-4.2-4.9-4.4-.2-.2-1.3-1.7-1.3-3.3 0-1.5.8-2.3 1.1-2.6.3-.3.6-.4.8-.4h.6c.2 0 .4 0 .6.5.2.6.8 2 .8 2.1s.1.3 0 .5l-.4.7c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.2 1.4 2.5 1.5.3.1.5.1.7-.1l.8-1c.2-.2.4-.2.6-.1.3.1 1.7.8 2 .9.3.1.5.2.6.3.1.2.1.8-.1 1.5z" />
              </svg>
            </span>
            ACTIVAR BENEFICIO POR WHATSAPP
          </a>
          {CONFIG.IS_LOCAL ? (
            <button type="button" className="btn-sim" onClick={() => void sendLead(false)}>
              Simular clic WhatsApp
            </button>
          ) : null}
          {CONFIG.IS_LOCAL && status ? (
            <p className={status.ok ? 'local-status ok' : 'local-status err'}>{status.text}</p>
          ) : null}
        </div>
      </main>
      <footer>
        <a href="https://ganamos.net" rel="noopener">
          Ganamos.net
        </a>
      </footer>
    </>
  );
}
