import { Link } from 'react-router-dom';
import useReveal from '../hooks/useReveal';
import { useHeroRotator, useHeroSlides, useReviewSlider, useHeroParallax } from '../hooks/useHomeEffects';

const HERO_SLIDES = [
  { src: '/assets/hero-1.jpg', alt: 'Biler til salgs hos X Bilsenter AS' },
  { src: '/assets/hero-2.jpeg', alt: 'Kundeopplevelse hos X Bilsenter' },
  { src: '/assets/hero-3.jpeg', alt: 'Selg bilen din' },
];

const REVIEWS = [
  {
    lead: true,
    text: 'Super fornøyd med mitt første bilkjøp hos X Bilsenter AS. Selger ordnet alt fra A til Å. God service hele veien med hyggelig oppfølging etter handelen.',
    author: 'Joachim R.',
  },
  {
    text: 'Sitter igjen med et veldig godt inntrykk etter bilkjøp. Seriøst firma som jeg vil anbefale videre.',
    author: 'Ronny M.',
  },
  {
    text: 'Fornøyd hittil. Handler gjerne bil av dere igjen ved en senere anledning.',
    author: 'Stig A.',
  },
];

export default function HomePage() {
  const { word, changing } = useHeroRotator();
  const { activeSlide, handleThumbClick } = useHeroSlides();
  const { idx: reviewIdx, showPrev, showNext, show: showReview } = useReviewSlider();
  const visualRef = useHeroParallax();

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
                  <span className={`home-hero__rotator-word${changing ? ' is-changing' : ''}`} id="heroRotator">
                    {word}
                  </span>
                </p>
                <p className="home-hero__lead">
                  Premium bilforhandler med over 1600 kvm showroom. Personlig oppfølging fra første møte til du kjører hjem.
                </p>
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
                      <img src={slide.src} alt={slide.alt} />
                    </figure>
                  ))}
                </div>
                <div className="home-hero__frame" />
                <aside className="home-hero__callout home-hero__callout--edge" aria-label="Fetsund">
                  <span className="home-hero__callout-label">Fetsund</span>
                  <p className="home-hero__callout-line">10 min fra Lillestrøm</p>
                  <p className="home-hero__callout-line">20 min fra Oslo</p>
                </aside>
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
              <span>Finansiering</span>
              <span className="home-ticker__dot">·</span>
              <span>Forsikring</span>
              <span className="home-ticker__dot">·</span>
              <span>Bruktbilgaranti</span>
              <span className="home-ticker__dot">·</span>
              <span>Transport i hele landet</span>
              <span className="home-ticker__dot">·</span>
              <span>Avtale med Statens vegvesen</span>
              <span className="home-ticker__dot">·</span>
              <span>Finansiering</span>
              <span className="home-ticker__dot">·</span>
              <span>Forsikring</span>
              <span className="home-ticker__dot">·</span>
              <span>Bruktbilgaranti</span>
              <span className="home-ticker__dot">·</span>
              <span>Transport i hele landet</span>
              <span className="home-ticker__dot">·</span>
              <span>Avtale med Statens vegvesen</span>
              <span className="home-ticker__dot">·</span>
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
                  <span className="home-metric__num" data-count="1000">
                    0
                  </span>
                  <span className="home-metric__suffix">+</span>
                </p>
                <span className="home-metric__label">fornøyde kunder</span>
              </li>
              <li className="home-metric home-reveal" data-delay="2">
                <p className="home-metric__value">
                  <span className="home-metric__num home-metric__num--text">AAA-rating</span>
                </p>
                <span className="home-metric__label">høyeste kredittvurdering</span>
              </li>
              <li className="home-metric home-reveal" data-delay="3">
                <p className="home-metric__value">
                  <span className="home-metric__num" data-count="80">
                    0
                  </span>
                  <span className="home-metric__suffix">+</span>
                </p>
                <span className="home-metric__label">biler på lager</span>
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
                  På alle biler vi selger hvor nybilgarantien har utløpt, legger vi til bruktbilgaranti med mindre annet
                  avtales.
                </p>
                <p>Det gir deg mulighet til å kjøre med lave skuldre når du handler bil hos oss.</p>
              </article>
              <article className="home-benefit home-reveal" data-delay="1">
                <div className="home-benefit__icon" aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <path d="M7 8h4M7 12h10" />
                  </svg>
                </div>
                <h3>Autoreg-avtale</h3>
                <p>Vi er godkjent forhandler hos Statens vegvesen, slik at du kan ta bilen med hjem samme dag.</p>
                <p>Vi har skilter på lager og registrerer og utleverer biler alle dager, fra morgen til kveld.</p>
              </article>
              <article className="home-benefit home-reveal" data-delay="2">
                <div className="home-benefit__icon" aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <path d="M2 10h20" />
                  </svg>
                </div>
                <h3>Finansiering</h3>
                <p>Vi samarbeider med Norges største banker og tilbyr fleksible lånevilkår tilpasset deg.</p>
                <p>Opptil 10 års nedbetaling og mulighet for 0 kr i egenkapital.</p>
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
                <p>Kan du ikke hente bilen selv, organiserer vi transport hjem til deg mot et gunstig pristillegg.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="home-paths">
          <div className="container">
            <header className="home-section-head home-reveal">
              <p className="home-kicker home-kicker--dark">Finn din vei</p>
              <h2 className="home-section-title">Hva kan vi hjelpe deg med?</h2>
            </header>
            <div className="home-paths__grid">
              <Link to="/biler" className="home-path home-path--featured home-reveal">
                <img src="/assets/hero-1.jpg" alt="" />
                <div className="home-path__overlay" />
                <div className="home-path__body">
                  <h3>Våre biler</h3>
                  <p>Se vårt utvalg av kvalitetsbiler i Fetsund.</p>
                  <span className="home-path__arrow" aria-hidden="true">
                    →
                  </span>
                </div>
              </Link>
              <Link to="/selg-bil" className="home-path home-reveal" data-delay="1">
                <img src="/assets/hero-3.jpeg" alt="" />
                <div className="home-path__overlay" />
                <div className="home-path__body">
                  <h3>Selg bilen din</h3>
                  <p>Raskt oppgjør uten reklamasjonsansvar.</p>
                  <span className="home-path__arrow" aria-hidden="true">
                    →
                  </span>
                </div>
              </Link>
              <Link to="/innbytte" className="home-path home-reveal" data-delay="2">
                <img src="/assets/about-car.jpeg" alt="" />
                <div className="home-path__overlay" />
                <div className="home-path__body">
                  <h3>Innbytte</h3>
                  <p>Få et uforpliktende tilbud på din bil.</p>
                  <span className="home-path__arrow" aria-hidden="true">
                    →
                  </span>
                </div>
              </Link>
              <Link to="/tjenester" className="home-path home-path--wide home-reveal" data-delay="3">
                <img src="/assets/andre-tjenester.jpeg" alt="" />
                <div className="home-path__overlay" />
                <div className="home-path__body">
                  <h3>Tjenester</h3>
                  <p>Finansiering, forsikring og mer — alt under ett tak.</p>
                  <span className="home-path__arrow" aria-hidden="true">
                    →
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </section>

        <section className="home-process">
          <div className="container">
            <header className="home-section-head home-section-head--center home-reveal">
              <p className="home-kicker home-kicker--dark">Slik fungerer det</p>
              <h2 className="home-section-title">Fra første kontakt til ny bil</h2>
            </header>
            <ol className="home-process__steps">
              <li className="home-process__step home-reveal">
                <span className="home-process__num">01</span>
                <h3>Finn bilen</h3>
                <p>Se utvalget vårt online eller besøk showroom i Fetsund.</p>
              </li>
              <li className="home-process__step home-reveal" data-delay="1">
                <span className="home-process__num">02</span>
                <h3>Prøvekjør &amp; tilbud</h3>
                <p>Vi hjelper med finansiering, innbytte og papirarbeid.</p>
              </li>
              <li className="home-process__step home-reveal" data-delay="2">
                <span className="home-process__num">03</span>
                <h3>Kjør hjem</h3>
                <p>Autoreg-avtale — ta bilen med hjem samme dag.</p>
              </li>
            </ol>
          </div>
        </section>

        <section className="home-story">
          <div className="container home-story__grid">
            <div className="home-story__media home-reveal">
              <img src="/assets/about-car.jpeg" alt="X Bilsenter showroom" />
              <div className="home-story__tag">Fetsund</div>
              <div className="home-story__float">
                <strong>Personlig</strong>
                <span>oppfølging hele veien</span>
              </div>
            </div>
            <div className="home-story__copy home-reveal" data-delay="1">
              <p className="home-kicker home-kicker--dark">Om oss</p>
              <h2 className="home-section-title">Å kjøpe bil skal være en fin opplevelse</h2>
              <p className="home-story__text">
                Vi i X Bilsenter er opptatt av at du skal ha en trygg og enkel bilhandel hos oss — like mye før som etter en
                handel.
              </p>
              <ul className="home-story__list">
                <li>Over 1600 kvm showroom</li>
                <li>Personlig oppfølging før og etter handel</li>
                <li>Kjøp, salg, innbytte og finansiering</li>
              </ul>
              <Link to="/om-oss" className="btn btn--ghost">
                Les mer om oss
              </Link>
            </div>
          </div>
        </section>

        <section className="home-services">
          <div className="container">
            <div className="home-services__grid">
              <Link to="/tjenester" className="home-service-card home-reveal">
                <img src="/assets/finansiering.png" alt="" />
                <div className="home-service-card__body">
                  <h3>Finansiering</h3>
                  <p>Opptil 10 års nedbetaling</p>
                  <span className="home-service-card__link">Les mer →</span>
                </div>
              </Link>
              <Link to="/tjenester" className="home-service-card home-reveal" data-delay="1">
                <img src="/assets/forsikring.png" alt="" />
                <div className="home-service-card__body">
                  <h3>Forsikring</h3>
                  <p>Vi hjelper deg finne riktig dekning</p>
                  <span className="home-service-card__link">Les mer →</span>
                </div>
              </Link>
              <Link to="/innbytte" className="home-service-card home-reveal" data-delay="2">
                <img src="/assets/about-car.jpeg" alt="" />
                <div className="home-service-card__body">
                  <h3>Innbytte</h3>
                  <p>Raskt og uforpliktende tilbud</p>
                  <span className="home-service-card__link">Få tilbud →</span>
                </div>
              </Link>
            </div>
          </div>
        </section>

        <section className="home-reviews">
          <div className="container">
            <header className="home-section-head home-section-head--light home-reveal">
              <p className="home-kicker">Kundetilbakemeldinger</p>
              <h2 className="home-section-title">Dette sier våre kunder</h2>
            </header>
            <div className="home-reviews__slider" id="reviewSlider">
              <div className="home-reviews__track">
                {REVIEWS.map((review, i) => (
                  <blockquote
                    key={i}
                    className={`home-review${review.lead ? ' home-review--lead' : ''}${reviewIdx === i ? ' is-active' : ''}`}
                  >
                    <div className="home-review__stars" aria-label="5 stjerner">
                      ★★★★★
                    </div>
                    <p>{review.text}</p>
                    <footer>{review.author}</footer>
                  </blockquote>
                ))}
              </div>
              <div className="home-reviews__nav">
                <button type="button" className="home-reviews__btn" id="reviewPrev" aria-label="Forrige anmeldelse" onClick={showPrev}>
                  ←
                </button>
                <div className="home-reviews__dots" id="reviewDots">
                  {REVIEWS.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`home-reviews__dot${reviewIdx === i ? ' is-active' : ''}`}
                      aria-label={`Anmeldelse ${i + 1}`}
                      onClick={() => showReview(i)}
                    />
                  ))}
                </div>
                <button type="button" className="home-reviews__btn" id="reviewNext" aria-label="Neste anmeldelse" onClick={showNext}>
                  →
                </button>
              </div>
            </div>

            <div className="home-partners home-reveal">
              <div className="home-partners__inner">
                <h3 className="home-partners__title">Samarbeidspartnere</h3>
                <div className="home-partners__logos">
                  <img
                    src="/assets/samarbeidspartnere.png"
                    alt="Samarbeidspartnere — SpareBank 1, Santander, Gjensidige, If, Fremtind, Enter, Tryg med flere"
                    width="2560"
                    height="289"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="home-location home-reveal">
          <div className="container home-location__grid">
            <div className="home-location__info">
              <h2 className="home-location__title">
                <span className="home-location__title-lead">Besøk vårt</span>
                <span className="home-location__title-main">showroom</span>
                <span className="home-location__title-lead">på Fetsund</span>
              </h2>
              <address className="home-location__address">
                Rovenveien 125,<br />
                1900 Fetsund
              </address>
              <ul className="home-location__links">
                <li>
                  <a href="tel:+4792050990">(+47) 920 50 990</a>
                </li>
                <li>
                  <a href="mailto:post@xbilsenter.no">post@xbilsenter.no</a>
                </li>
              </ul>
              <Link to="/kontakt" className="btn btn--brand">
                Kontakt oss
              </Link>
            </div>
            <div className="home-location__map" aria-hidden="true">
              <img src="/assets/hero-2.jpeg" alt="" />
              <div className="home-location__pin">X Bilsenter</div>
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
              <a href="tel:+4792050990" className="btn btn--outline btn--lg">
                Ring 920 50 990
              </a>
            </div>
          </div>
        </section>
    </main>
  );
}
