import { Link } from 'react-router-dom';
import useReveal from '../hooks/useReveal';
import { useHeroRotator, useHeroSlides, useHeroParallax, usePartnerMarquee } from '../hooks/useHomeEffects';

const HERO_SLIDES = [
  { src: '/assets/hero-1.jpg', alt: 'Biler til salgs hos X Bilsenter AS' },
  { src: '/assets/hero-3.jpeg', alt: 'Selg bilen din' },
];

const TICKER_ITEMS = [
  'Finansiering',
  'Forsikring',
  'Bruktbilgaranti',
  'Transport i hele landet',
  'Avtale med Statens vegvesen',
];

function HomeTickerGroup({ id, hidden }) {
  return (
    <div className="home-ticker__group" aria-hidden={hidden || undefined}>
      {[0, 1].flatMap(function (rep) {
        return TICKER_ITEMS.flatMap(function (item, index) {
          return [
            <span key={`${id}-${rep}-t-${index}`}>{item}</span>,
            <span key={`${id}-${rep}-d-${index}`} className="home-ticker__dot" aria-hidden="true">·</span>,
          ];
        });
      })}
    </div>
  );
}

const REVIEWS = [
  {
    text: 'Super fornøyd med mitt første bilkjøp hos X Bilsenter AS. Selger ordnet alt fra A til Å og gjorde dette til en enkel prosess for meg. God service hele veien med hyggelig oppfølging etter handelen.',
    author: 'Joachim R.',
  },
  {
    text: 'Sitter igjen med et veldig godt inntrykk etter bilkjøp. Bilen er som avtalt, og det har vært en veldig grei og imøtekommende selger. Seriøst firma, som jeg vil anbefale videre.',
    author: 'Ronny M.',
  },
  {
    text: 'Fornøyd hittil. Handler gjerne bil av dere igjen ved en senere anledning om det skulle dukke opp noe av interesse.',
    author: 'Stig A.',
  },
  {
    text: 'Takk for en meget hyggelig handel. Bilen virker sålangt veldig bra, så jeg er en fornøyd kunde. Ønsker deg/dere en fortsatt fin sommer og regner med at våre veier møtes ved neste bilkjøp.',
    author: 'Torstein W.',
  },
];

const PARTNERS = [
  { src: '/assets/partners/axess.svg', alt: 'Axess Logistics', logoClass: 'home-partners__logo--axess', anchor: 'axess' },
  { src: '/assets/partners/sparebank1.svg?v=2', alt: 'SpareBank 1 Finans Østlandet', logoClass: 'home-partners__logo--sparebank1' },
  { src: '/assets/partners/santander.svg', alt: 'Santander Consumer Bank' },
  { src: '/assets/partners/as-finansiering.svg', alt: 'AS Finansiering', logoClass: 'home-partners__logo--as-finansiering' },
  { src: '/assets/partners/if.svg', alt: 'If', logoClass: 'home-partners__logo--if' },
  { src: '/assets/partners/gjensidige.svg', alt: 'Gjensidige' },
  { src: '/assets/partners/fremtind.svg', alt: 'Fremtind' },
  { src: '/assets/partners/enter-tryg.svg', alt: 'Enter, en del av Tryg' },
  { src: '/assets/partners/auto-concept.svg', alt: 'Auto Concept' },
  { src: '/assets/partners/fragus.svg', alt: 'Fragus Group', logoClass: 'home-partners__logo--fragus' },
  { src: '/assets/partners/nbt.svg', alt: 'NBT Norsk Biltransport', logoClass: 'home-partners__logo--nbt' },
];

function renderPartnerItem(partner, i) {
  return (
    <div
      key={`${partner.alt}-${i}`}
      className="home-partners__item"
      data-partner-anchor={partner.anchor ? partner.anchor : undefined}
    >
      <img
        src={partner.src}
        alt={partner.alt}
        className={['home-partners__logo', partner.logoClass].filter(Boolean).join(' ')}
        loading={i < 4 ? 'eager' : 'lazy'}
        decoding="async"
        draggable="false"
      />
    </div>
  );
}

const HOME_PATHS = [
  {
    title: 'Våre biler',
    text: 'Et variert utvalg av biler.',
    to: '/biler',
    image: '/assets/varer-biler-front.jpg',
    featured: true,
  },
  {
    title: 'Selg bilen din',
    text: 'Raskt oppgjør uten reklamasjonsansvar.',
    to: '/selg-bil',
    image: '/assets/selg-bil-porsche.jpg',
  },
  {
    title: 'Innbytte',
    text: 'Få et uforpliktende tilbud på din bil.',
    to: '/innbytte',
    image: '/assets/innbytte-finncdn.jpg',
  },
];

const HOME_SERVICES = [
  {
    title: 'Finansiering',
    text: '0 kr i egenkapital, opptil 10 års nedbetaling',
    singleLine: true,
    to: '/tjenester#finansiering',
    image: '/assets/finansiering.png',
    imageAlt: 'Finansiering hos X Bilsenter',
  },
  {
    title: 'Forsikring',
    text: 'Vi hjelper deg finne riktig dekning',
    to: '/tjenester#forsikring',
    image: '/assets/forsikring.png',
    imageAlt: 'Forsikring hos X Bilsenter',
  },
  {
    title: 'Andre tjenester',
    text: 'Solfilm og chrome delete.',
    to: '/tjenester#andre',
    image: '/assets/andre-tjenester-bil.jpg',
    imageAlt: 'Andre tjenester hos X Bilsenter',
  },
];

export default function HomePage() {
  const { word, changing } = useHeroRotator();
  const { activeSlide, handleThumbClick } = useHeroSlides(HERO_SLIDES.length);
  const visualRef = useHeroParallax();
  const { trackRef } = usePartnerMarquee('axess');

  useReveal([]);

  return (
    <main className="home">
        <section className="home-hero" aria-label="Velkommen">
          <div className="home-hero__backdrop" aria-hidden="true">
            <div className="home-hero__glow home-hero__glow--1" />
            <div className="home-hero__glow home-hero__glow--2" />
            <div className="home-hero__grid-lines" />
          </div>

          <div className="home-hero__inner">
            <div className="home-hero__panel home-hero__panel--copy">
              <div className="home-hero__copy">
                <p className="home-kicker home-hero__kicker">X Bilsenter AS · Fetsund</p>
                <h1 className="home-hero__title">
                  <span className="home-hero__title-line">
                    Bilhandel gjort <span className="home-hero__title-accent">trygt</span>
                  </span>
                  <span className="home-hero__title-line">
                    og <span className="home-hero__title-accent">enkelt</span>.
                  </span>
                </h1>
                <p className="home-hero__rotator" aria-live="polite">
                  <span className="home-hero__rotator-label">Vi hjelper deg med</span>
                  <span className="home-hero__rotator-tail">
                    <span className={`home-hero__rotator-word${changing ? ' is-changing' : ''}`} id="heroRotator">
                      {word}
                    </span>
                    <span className="home-hero__rotator-period" aria-hidden="true">.</span>
                  </span>
                </p>
                <ul className="home-hero__highlights">
                  <li>Spesialist på nyere bruktbiler</li>
                  <li>Personlig oppfølging hele veien</li>
                  <li>Kåret til Gaselle bedrift 2025</li>
                </ul>
                <div className="home-hero__actions">
                  <Link to="/biler" className="btn btn--brand btn--lg home-btn-glow">
                    Se våre biler
                  </Link>
                  <Link to="/innbytte" className="btn btn--outline btn--lg">
                    Innbytte
                  </Link>
                </div>
                <div className="home-hero__meta">
                  <a href="tel:+4792050990" className="home-hero__phone">
                    (+47) 920 50 990
                  </a>
                  <span>Rovenveien 125 · 1900 Fetsund</span>
                </div>
              </div>
            </div>

            <div className="home-hero__panel home-hero__panel--visual">
              <div className="home-hero__visual" id="heroVisual" ref={visualRef}>
                <div className="home-hero__slides">
                  {HERO_SLIDES.map((slide, i) => (
                    <figure key={i} className={`home-hero__slide${activeSlide === i ? ' is-active' : ''}`}>
                      <img
                        src={slide.src}
                        alt={slide.alt}
                        loading={i === 0 ? 'eager' : 'lazy'}
                        decoding="async"
                        fetchPriority={i === 0 ? 'high' : 'auto'}
                      />
                    </figure>
                  ))}
                </div>
                <div className="home-hero__frame" />
                <div className="home-hero__callouts home-hero__callouts--edge">
                  <aside className="home-hero__callout home-hero__callout--location" aria-label="Beliggenhet">
                    <span className="home-hero__callout-label">Fetsund</span>
                    <p className="home-hero__callout-line">10 min fra Lillestrøm</p>
                    <p className="home-hero__callout-line">20 min fra Oslo</p>
                  </aside>
                  <aside className="home-hero__callout home-hero__callout--gaselle" aria-label="Gaselle bedrift 2025">
                    <span className="home-hero__gaselle-kicker">DN Gaselle</span>
                    <span className="home-hero__gaselle-year">2025</span>
                    <span className="home-hero__gaselle-sub">Kåret av Dagens Næringsliv</span>
                  </aside>
                </div>
                <div className="home-hero__thumbs" id="heroThumbs" aria-label="Velg bilde">
                  {HERO_SLIDES.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`home-hero__thumb${activeSlide === i ? ' is-active' : ''}`}
                      data-slide={i}
                      aria-label={`Bilde ${i + 1}`}
                      onClick={() => handleThumbClick(i)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="home-hero__scroll" aria-hidden="true">
            <span>Scroll</span>
            <span className="home-hero__scroll-line" />
          </div>

          <div className="home-ticker" aria-hidden="true">
            <div className="home-ticker__track">
              <HomeTickerGroup id="a" />
              <HomeTickerGroup id="b" hidden />
            </div>
          </div>
        </section>

        <section className="home-metrics">
          <div className="container">
            <ul className="home-metrics__grid">
              <li className="home-metric home-reveal">
                <p className="home-metric__value">
                  <span className="home-metric__num" data-count="1600">
                    0
                  </span>
                  <span className="home-metric__suffix">+</span>
                </p>
                <span className="home-metric__label">kvm showroom</span>
              </li>
              <li className="home-metric home-reveal" data-delay="1">
                <p className="home-metric__value">
                  <span className="home-metric__num" data-count="2000">
                    0
                  </span>
                  <span className="home-metric__suffix">+</span>
                </p>
                <span className="home-metric__label">solgte biler</span>
              </li>
              <li className="home-metric home-reveal" data-delay="2">
                <p className="home-metric__value">
                  <span className="home-metric__num home-metric__num--text">AAA-rating</span>
                </p>
                <span className="home-metric__label">høyeste kredittvurdering</span>
              </li>
              <li className="home-metric home-reveal" data-delay="3">
                <p className="home-metric__value">
                  <span className="home-metric__num" data-count="85">
                    0
                  </span>
                  <span className="home-metric__suffix">+</span>
                </p>
                <span className="home-metric__label">biler i snitt på lager</span>
              </li>
            </ul>
          </div>
        </section>

        <section className="home-benefits">
          <div className="container">
            <header className="home-section-head home-reveal">
              <p className="home-kicker home-kicker--dark">Derfor X Bilsenter</p>
              <h2 className="home-section-title">Hvorfor handle hos X Bilsenter AS?</h2>
              <p className="home-section-lead">
                Vel, mange grunner til det, men viktigst av alt fordi vi vet at det å kjøpe bil er en stor økonomisk
                beslutning, og vi er svært opptatt av din trygghet rundt en handel hos oss. Vi ordner gjerne med alt av
                lånesøknader, forsikringer og garantier slik at du skal få fin opplevelse hos oss.
              </p>
            </header>
            <div className="home-benefits__grid">
              <article className="home-benefit home-reveal">
                <div className="home-benefit__icon" aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <h3>Bruktbilgaranti</h3>
                <p>
                  På alle biler vi selger hvor nybilgaranti har utløpt, legger vi til bruktbilgaranti med mindre annet
                  avtales.
                </p>
                <p>Det gir deg mulighet til å kjøre med lave skuldre når du handler bil hos oss.</p>
              </article>
              <article className="home-benefit home-reveal" data-delay="1">
                <div className="home-benefit__icon" aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M7 16V4M7 4L3 8M7 4l4 4" />
                    <path d="M17 8v12M17 20l4-4M17 20l-4-4" />
                  </svg>
                </div>
                <h3>Innbytte</h3>
                <p>Når du handler bil hos oss, tar vi gjerne din nåværende bil i innbytte.</p>
                <p>
                  Fyll ut innbytteskjemaet vårt, så gjennomgår vi det og kommer tilbake med et raskt og konkret tilbud.
                </p>
              </article>
              <article className="home-benefit home-reveal" data-delay="2">
                <div className="home-benefit__icon" aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <path d="M7 8h4M7 12h10" />
                  </svg>
                </div>
                <h3>Autosys-avtale</h3>
                <p>Vi er godkjent forhandler hos Statens vegvesen, slik at du kan ta bilen med hjem samme dag.</p>
                <p>Vi har skilter på lager og utleverer biler hver dag, fra morgen til kveld.</p>
              </article>
              <article className="home-benefit home-reveal" data-delay="3">
                <div className="home-benefit__icon" aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
                    <circle cx="17" cy="18" r="2" />
                    <circle cx="7" cy="18" r="2" />
                  </svg>
                </div>
                <h3>Transport</h3>
                <p>Vi beskriver bilen i detalj, så du skal føle deg trygg på å kjøpe bil usett av oss.</p>
                <p>
                  Dersom du ikke kan hente bilen selv, kan vi organisere transport hjem til deg mot et gunstig pristillegg.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="home-hub">
          <div className="home-hub__backdrop" aria-hidden="true">
            <div className="home-hub__glow" />
          </div>
          <div className="container">
            <header className="home-section-head home-hub__head home-reveal">
              <p className="home-kicker home-kicker--dark">Finn din vei</p>
              <h2 className="home-section-title">Hva kan vi hjelpe deg med?</h2>
              <p className="home-hub__lead">Kjøp, salg og innbytte — personlig oppfølging hele veien.</p>
            </header>

            <div className="home-hub__grid">
              {HOME_PATHS.map((path, i) => (
                <Link
                  key={path.title}
                  to={path.to}
                  className={[
                    'home-hub__card',
                    path.featured ? 'home-hub__card--featured' : '',
                    'home-reveal',
                  ].filter(Boolean).join(' ')}
                  data-delay={i > 0 ? String(i) : undefined}
                >
                  <img src={path.image} alt="" loading="lazy" />
                  <div className="home-hub__overlay" />
                  <div className="home-hub__body">
                    <h3>{path.title}</h3>
                    <p>{path.text}</p>
                    <span className="home-hub__arrow" aria-hidden="true">
                      →
                    </span>
                  </div>
                </Link>
              ))}

              <div className="home-hub__services home-reveal" data-delay="3">
                <p className="home-hub__services-kicker">Tjenester</p>
                <div className="home-hub__services-grid">
                  {HOME_SERVICES.map((service) => (
                    <Link key={service.title} to={service.to} className="home-hub__service">
                      <img src={service.image} alt={service.imageAlt} loading="lazy" />
                      <div className="home-hub__overlay home-hub__overlay--service" />
                      <div className="home-hub__service-body">
                        <h4>{service.title}</h4>
                        <p className={service.singleLine ? 'is-single-line' : undefined}>{service.text}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="home-story">
          <div className="home-story__backdrop" aria-hidden="true">
            <div className="home-story__grid-lines" />
            <div className="home-story__glow" />
          </div>
          <div className="container home-story__grid">
            <div className="home-story__media home-reveal">
              <div className="home-story__accent" aria-hidden="true" />
              <div className="home-story__frame">
                <img src="/assets/showroom.jpeg" alt="Bil i X Bilsenter sitt showroom på Fetsund" />
                <div className="home-story__member">
                  <div className="om-oss-immersive__member">
                    <span className="om-oss-immersive__member-label">Medlem av</span>
                    <img
                      src="/assets/partners/bruktbilgruppen.svg"
                      alt="Bruktbilgruppen"
                      className="om-oss-immersive__member-logo"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="home-story__copy home-reveal" data-delay="1">
              <div className="home-story__panel">
                <p className="home-kicker home-kicker--light">Om oss</p>
                <h2 className="home-story__title">
                  Å kjøpe bil skal være
                  <em>en fin opplevelse</em>
                </h2>
                <p className="home-story__lead">
                  X Bilsenter AS — Bilhandel gjort trygt og enkelt.
                </p>
                <p className="home-story__text">
                  Vi er opptatt av at bilhandelen skal oppleves enkel og trygg for deg som kunde.
                  <br />
                  Vi ordner lånesøknader, forsikring og garantier — og følger deg personlig hele veien.
                </p>
                <ul className="home-story__features">
                  <li>
                    <span className="home-story__feature-copy">
                      <strong>Personlig oppfølging</strong>
                      <span>Før, under og etter handel</span>
                    </span>
                  </li>
                  <li>
                    <span className="home-story__feature-copy">
                      <strong>Alt under ett tak</strong>
                      <span>Kjøp, salg, innbytte og finansiering</span>
                    </span>
                  </li>
                </ul>
                <div className="home-story__actions">
                  <Link to="/om-oss" className="btn btn--brand btn--lg home-btn-glow">
                    Les mer om oss
                  </Link>
                  <Link to="/kontakt" className="btn btn--outline btn--lg">
                    Ta kontakt
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="home-reviews">
          <div className="home-reviews__backdrop" aria-hidden="true">
            <div className="home-reviews__glow" />
          </div>
          <div className="container">
            <header className="home-reviews__head home-reveal">
              <h2 className="home-reviews__title">Dette sier våre kunder...</h2>
            </header>

            <div className="home-reviews__grid home-reveal" data-delay="1">
              {REVIEWS.map((review) => (
                <blockquote key={review.author} className="home-review">
                  <p>{review.text}</p>
                  <footer>
                    <cite>{review.author}</cite>
                  </footer>
                </blockquote>
              ))}
            </div>

            <div className="home-partners home-reveal" data-delay="2">
              <h3 className="home-partners__title">Samarbeidspartnere</h3>
              <div className="home-partners__marquee" aria-label="Samarbeidspartnere">
                <div className="home-partners__track" ref={trackRef}>
                  <div className="home-partners__group">
                    {PARTNERS.map((partner, i) => renderPartnerItem(partner, i))}
                  </div>
                  <div className="home-partners__group" aria-hidden="true">
                    {PARTNERS.map((partner, i) => renderPartnerItem(partner, i + PARTNERS.length))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="home-location">
          <div className="home-location__cinema home-reveal">
            <div className="home-location__media">
              <img
                src="/assets/showroom-tesla-model-x.jpeg?v=1"
                alt="Tesla Model X i X Bilsenter sitt showroom på Fetsund"
              />
              <div className="home-location__shade" />
              <div className="home-location__beam" />
            </div>

            <div className="container home-location__content">
              <div className="home-location__head">
                <p className="home-location__eyebrow">Bilbutikk</p>
                <h2 className="home-location__title">
                  <span className="home-location__title-line">Besøk vårt</span>
                  <span className="home-location__title-showroom">showroom</span>
                  <span className="home-location__title-line">på Fetsund</span>
                </h2>
                <p className="home-location__intro">
                  Kom innom og se bilene våre på nært hold. Ta kontakt i dag for å avtale visning av våre biler.
                </p>
              </div>

              <div className="home-location__dock home-reveal" data-delay="1">
                <div className="home-location__dock-top">
                  <div className="home-location__facts">
                    <span>
                      <strong>1600+</strong> kvm
                    </span>
                    <span className="home-location__facts-sep" aria-hidden="true" />
                    <div className="home-location__facts-times">
                      <span>
                        <strong>10 min</strong> fra Lillestrøm
                      </span>
                      <span>
                        <strong>20 min</strong> fra Oslo
                      </span>
                    </div>
                  </div>
                  <div className="home-location__actions">
                    <a href="tel:+4792050990" className="btn btn--brand">
                      Ring 920 50 990
                    </a>
                    <a
                      href="https://www.google.com/maps/dir/?api=1&destination=Rovenveien+125,+1900+Fetsund"
                      className="btn btn--outline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Veibeskrivelse
                    </a>
                  </div>
                </div>
                <div className="home-location__dock-meta">
                  <a
                    href="https://www.google.com/maps/dir/?api=1&destination=Rovenveien+125,+1900+Fetsund"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Rovenveien 125, 1900 Fetsund
                  </a>
                  <span className="home-location__meta-sep" aria-hidden="true" />
                  <span>Man–fre 09–17 · Lør 10–15</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="home-cta">
          <div className="container home-cta__inner home-reveal">
            <div className="home-cta__glow" aria-hidden="true" />
            <div className="home-cta__copy">
              <p className="home-kicker home-kicker--light">Klar for neste steg?</p>
              <h2>Vi hjelper deg med bilen — enten du skal kjøpe, selge eller bytte inn.</h2>
            </div>
            <div className="home-cta__actions">
              <Link to="/biler" className="btn btn--dark btn--lg">
                Se våre biler
              </Link>
              <Link to="/kontakt" className="btn btn--outline btn--lg">
                Kontakt oss
              </Link>
            </div>
          </div>
        </section>
    </main>
  );
}
