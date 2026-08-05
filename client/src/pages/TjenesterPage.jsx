import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import PageHero from '../components/PageHero';
import ExtraServicesPanel from '../components/ExtraServicesPanel';
import { EXTRA_SERVICES } from '../data/extraServices';

const FOCUS_TABS = [
  { id: 'finansiering', label: 'Finansiering' },
  { id: 'forsikring', label: 'Forsikring' },
  { id: 'andre', label: 'Andre tjenester' },
];

const SECONDARY_SERVICES = [
  {
    title: 'Bruktbilgaranti',
    text: 'På alle biler hvor nybilgarantien har utløpt legger vi til bruktbilgaranti med mindre annet avtales – slik at du kan kjøre med lave skuldre.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    title: 'Innbytte',
    text: 'Vi tar imot din nåværende bil i innbytte. Fyll ut innbytteskjemaet, så kommer vi tilbake med et raskt og konkret tilbud.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
      </svg>
    ),
    link: { to: '/innbytte', label: 'Gå til innbytte' },
  },
  {
    title: 'Autosys-avtale',
    text: 'Godkjent forhandler hos Statens vegvesen. Skilter på lager – registrer og ta bilen med hjem samme dag.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M7 8h4M7 12h10" />
      </svg>
    ),
  },
  {
    title: 'Transport',
    text: 'Kan du ikke hente bilen selv, organiserer vi transport hjem til deg mot et gunstig pristillegg.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
        <circle cx="17" cy="18" r="2" />
        <circle cx="7" cy="18" r="2" />
      </svg>
    ),
  },
];

const EXTRA_IDS = EXTRA_SERVICES.map(function (item) {
  return item.id;
});

function parseHash(hash) {
  const value = hash.replace(/^#/, '');

  if (value === 'mer') {
    return { focus: 'finansiering', extra: 'solfilm' };
  }

  if (value === 'andre' || value.startsWith('andre-')) {
    const extraId = value === 'andre' ? 'solfilm' : value.slice('andre-'.length);
    return {
      focus: 'andre',
      extra: EXTRA_IDS.includes(extraId) ? extraId : 'solfilm',
    };
  }

  if (FOCUS_TABS.some(function (tab) {
    return tab.id === value;
  })) {
    return { focus: value, extra: 'solfilm' };
  }

  return { focus: 'finansiering', extra: 'solfilm' };
}

function focusHash(focus, extra) {
  if (focus === 'andre') {
    return `#andre-${extra}`;
  }
  return `#${focus}`;
}

export default function TjenesterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeFocus, setActiveFocus] = useState('finansiering');
  const [activeExtra, setActiveExtra] = useState('solfilm');

  useEffect(function () {
    const params = new URLSearchParams(location.search);
    const legacyFocus = params.get('fokus');

    if (legacyFocus) {
      const legacyExtra = params.get('tjeneste') || 'solfilm';
      const legacyHash = legacyFocus === 'andre' ? `#andre-${legacyExtra}` : `#${legacyFocus}`;
      const next = parseHash(legacyHash);
      navigate(
        { pathname: '/tjenester', hash: focusHash(next.focus, next.extra).replace(/^#/, ''), search: '' },
        { replace: true, preventScrollReset: true }
      );
      setActiveFocus(next.focus);
      setActiveExtra(next.extra);
      return;
    }

    if (location.hash) {
      const next = parseHash(location.hash);
      setActiveFocus(next.focus);
      setActiveExtra(next.extra);
    }
  }, [location.pathname, location.hash, location.search, navigate]);

  function updateServiceHash(focus, extra) {
    navigate(
      { pathname: '/tjenester', hash: focusHash(focus, extra).replace(/^#/, '') },
      { replace: true, preventScrollReset: true }
    );
  }

  function setFocus(id) {
    setActiveFocus(id);
    const extra = id === 'andre' ? activeExtra : 'solfilm';
    updateServiceHash(id, extra);
  }

  function setExtraService(id) {
    setActiveFocus('andre');
    setActiveExtra(id);
    updateServiceHash('andre', id);
  }

  return (
    <main>
      <PageHero
        title="Våre tjenester"
        lead="Alt du trenger for en trygg og enkel bilhandel – under ett tak."
        breadcrumb={[{ label: 'Hjem', to: '/' }, { label: 'Tjenester' }]}
        bgImage="/assets/tjenester-hero-bmw.jpg?v=4032"
        bgImageSrcSet="/assets/tjenester-hero-bmw-1920.jpg?v=4032 1920w, /assets/tjenester-hero-bmw.jpg?v=4032 4032w"
        variant="tjenester"
      />

      <section className="section service-focus" id="tjenester-fokus">
        <div className="container">
          <header className="section-head section-head--center">
            <span className="label">Hovedtjenester</span>
            <h2 className="section-title">Finansiering, forsikring og mer</h2>
            <p className="section-lead">
              Vi ordner gjerne med lånesøknader, forsikring og tilleggstjenester slik at du får en enkel og trygg
              opplevelse hos oss.
            </p>
          </header>

          <div className="service-tabs" role="tablist" aria-label="Hovedtjenester">
            {FOCUS_TABS.map(function (tab) {
              const isActive = tab.id === activeFocus;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  id={`focus-tab-${tab.id}`}
                  aria-selected={isActive}
                  aria-controls={`focus-panel-${tab.id}`}
                  className={`service-tabs__btn${isActive ? ' is-active' : ''}`}
                  onClick={function () {
                    setFocus(tab.id);
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="service-focus__panel">
            {activeFocus === 'finansiering' ? (
              <article id="focus-panel-finansiering" role="tabpanel" aria-labelledby="focus-tab-finansiering" className="service-focus__content">
                <div className="service-focus__media">
                  <img src="/assets/finansiering.png" alt="Finansiering hos X Bilsenter" />
                </div>
                <div className="service-focus__copy">
                  <h3>Finansiering</h3>
                  <p>
                    Vi hjelper deg gjerne med å finne en finansieringsløsning som passer både bilen og økonomien din.
                  </p>
                  <p>
                    Gjennom våre samarbeidende banker kan vi tilby fleksibel bilfinansiering med mulighet for 0 kr i
                    egenkapital og opptil 10 års nedbetalingstid. Sammen finner vi en løsning tilpasset dine ønsker og
                    behov.
                  </p>
                  <p>
                    Finansieringssøknaden behandles raskt hos oss mens du venter. Det betyr at du, dersom alt er i
                    orden, kan få finansieringen på plass, signere lånedokumentene og kjøre hjem med din nye bil samme
                    dag.
                  </p>
                  <p>Vi hjelper deg gjennom hele prosessen – enkelt, trygt og effektivt.</p>
                  <Link to="/kontakt" className="btn btn--brand">
                    Kontakt oss for uforpliktende tilbud
                  </Link>
                </div>
              </article>
            ) : null}

            {activeFocus === 'forsikring' ? (
              <article id="focus-panel-forsikring" role="tabpanel" aria-labelledby="focus-tab-forsikring" className="service-focus__content">
                <div className="service-focus__media">
                  <img src="/assets/forsikring.png" alt="Forsikring hos X Bilsenter" />
                </div>
                <div className="service-focus__copy">
                  <h3>Forsikring</h3>
                  <p>
                    Vi samarbeider med flere av landets største forsikringsselskaper og hjelper deg gjerne med å finne
                    en gunstig forsikring som passer både bilen og behovene dine.
                  </p>
                  <p>
                    På mange bilmodeller er det også mulig å tegne forsikring med maskinskadedekning, som blant annet
                    kan omfatte motor, girkasse, drivverk og høyvoltbatteri på el- og hybridbiler. Avhengig av valgt
                    forsikring kan også leiebil, veihjelp og glassdekning inkluderes.
                  </p>
                  <p>
                    Vi ordner forsikringen for deg mens du venter, slik at alt er klart før levering og du kan kjøre
                    trygt hjem i din nye bil.
                  </p>
                  <Link to="/kontakt" className="btn btn--brand">
                    Kontakt oss for uforpliktende tilbud
                  </Link>
                </div>
              </article>
            ) : null}

            {activeFocus === 'andre' ? (
              <article id="focus-panel-andre" role="tabpanel" aria-labelledby="focus-tab-andre">
                <ExtraServicesPanel activeId={activeExtra} onChange={setExtraService} />
              </article>
            ) : null}
          </div>
        </div>
      </section>

      <section className="section section--soft" id="mer">
        <div className="container">
          <header className="section-head section-head--center">
            <span className="label">I tillegg hos oss</span>
            <h2 className="section-title">Mer vi tilbyr</h2>
            <p className="section-lead">
              I tillegg til finansiering og forsikring får du tilgang til trygghet, innbytte, registrering og transport
              når du handler hos oss.
            </p>
          </header>

          <div className="card-grid card-grid--2">
            {SECONDARY_SERVICES.map(function (service) {
              return (
                <article key={service.title} className="card">
                  <div className="card__icon">{service.icon}</div>
                  <h3>{service.title}</h3>
                  <p>{service.text}</p>
                  {service.link ? (
                    <Link to={service.link.to} className="btn btn--ghost btn--sm card__link">
                      {service.link.label}
                    </Link>
                  ) : null}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cta-band">
            <div>
              <h2>Klar for å finne din neste bil?</h2>
              <p>Vi hjelper deg med alt fra finansiering til forsikring og registrering.</p>
            </div>
            <Link to="/biler" className="btn btn--dark btn--lg">
              Se våre biler
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
