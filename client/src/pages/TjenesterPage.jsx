import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';

export default function TjenesterPage() {
  return (
    <main>
        <PageHero
          title="Våre tjenester"
          lead="Alt du trenger for en trygg og enkel bilhandel – under ett tak."
          breadcrumb={[{ label: 'Hjem', to: '/' }, { label: 'Tjenester' }]}
          bgImage="/assets/finansiering.png"
        />

        <section className="section">
          <div className="container">
            <header className="section-head section-head--center">
              <span className="label">Hvorfor handle hos oss</span>
              <h2 className="section-title">Hvorfor handle hos X Bilsenter AS?</h2>
              <p className="section-lead">
                Vel, mange grunner til det, men viktigst av alt fordi vi vet at det å kjøpe bil er en stor økonomisk
                beslutning, og vi er svært opptatt av din trygghet rundt en handel hos oss. Vi ordner gjerne med alt av
                lånesøknader, forsikringer og garantier slik at du skal få fin opplevelse hos oss.
              </p>
            </header>

            <div className="card-grid">
              <article className="card">
                <div className="card__icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <h3>Bruktbilgaranti</h3>
                <p>
                  På alle biler hvor nybilgarantien har utløpt legger vi til bruktbilgaranti med mindre annet avtales – slik
                  at du kan kjøre med lave skuldre.
                </p>
              </article>
              <article className="card">
                <div className="card__icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
                  </svg>
                </div>
                <h3>Innbytte</h3>
                <p>
                  Vi tar imot din nåværende bil i innbytte. Fyll ut innbytteskjemaet, så kommer vi tilbake med et raskt og
                  konkret tilbud.
                </p>
              </article>
              <article className="card">
                <div className="card__icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <path d="M7 8h4M7 12h10" />
                  </svg>
                </div>
                <h3>Autoreg-avtale</h3>
                <p>Godkjent forhandler hos Statens vegvesen. Skilter på lager – registrer og ta bilen med hjem samme dag.</p>
              </article>
              <article className="card">
                <div className="card__icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
                    <circle cx="17" cy="18" r="2" />
                    <circle cx="7" cy="18" r="2" />
                  </svg>
                </div>
                <h3>Transport</h3>
                <p>
                  Vi beskriver bilen i detalj. Kan du ikke hente bilen selv, organiserer vi transport hjem til deg mot et
                  gunstig pristillegg.
                </p>
              </article>
              <article className="card card--media">
                <img src="/assets/finansiering.png" alt="Finansiering" />
                <div className="card__body">
                  <h3>Finansiering</h3>
                  <p>Samarbeid med Norges største banker. Opptil 10 års nedbetaling og mulighet for 0 kr i egenkapital.</p>
                </div>
              </article>
              <article className="card card--media">
                <img src="/assets/forsikring.png" alt="Forsikring" />
                <div className="card__body">
                  <h3>Forsikring</h3>
                  <p>Samarbeid med If, Gjensidige, Fremtind, Enter og Tryg. Gunstige priser på forsikring til din nye bil.</p>
                </div>
              </article>
              <article className="card card--media">
                <img src="/assets/andre-tjenester.jpeg" alt="Andre tjenester" />
                <div className="card__body">
                  <h3>Andre tjenester</h3>
                  <p>Detailing, polering, coating, lakkforsegling og solfilm på bilruter til gunstige priser.</p>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="section section--soft">
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
