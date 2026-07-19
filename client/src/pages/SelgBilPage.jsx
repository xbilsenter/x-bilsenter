import PageHero from '../components/PageHero';

export default function SelgBilPage() {
  return (
    <main>
        <PageHero
          title="Selg bilen din"
          lead="X Bilsenter AS gjør bilsalget enkelt og trygt – uten at du trenger å kjøpe ny bil hos oss."
          breadcrumb={[{ label: 'Hjem', to: '/' }, { label: 'Selg bilen din' }]}
          bgImage="/assets/hero-3.jpeg"
        />

        <section className="section">
          <div className="container">
            <div className="split">
              <div>
                <span className="label">Selg bil</span>
                <h2 className="section-title">Klar for å bytte ut den gamle bilen?</h2>
                <p className="section-lead">
                  At det er raskt og enkelt å selge bil til oss er blant de viktigste grunnene til å la oss ta inn din gamle
                  bil.
                </p>
                <ol className="steps">
                  <li className="step">
                    <span className="step__num">01</span>
                    <div>
                      <h3>Betydelig tidsbesparelse</h3>
                      <p>Du slipper salgsannonser, visninger, prøvekjøringer, papirarbeid, service og polering.</p>
                    </div>
                  </li>
                  <li className="step">
                    <span className="step__num">02</span>
                    <div>
                      <h3>Du slipper reklamasjonsansvar</h3>
                      <p>Vi kjøper bilen med ukjente feil og mangler. Du opplyser om det du kjenner til – vi ordner resten.</p>
                    </div>
                  </li>
                  <li className="step">
                    <span className="step__num">03</span>
                    <div>
                      <h3>Raskt og trygt oppgjør</h3>
                      <p>Utbetaling skjer umiddelbart ved innlevering, eller første virkedag ved handel i helg/helligdager.</p>
                    </div>
                  </li>
                </ol>
                <a
                  href="https://xbilsenter.no/selg-bil/"
                  className="btn btn--brand btn--lg"
                  target="_blank"
                  rel="noopener"
                >
                  Få tilbud
                </a>
              </div>
              <div className="split__media">
                <img src="/assets/hero-3.jpeg" alt="Selg bilen din enkelt og trygt" />
              </div>
            </div>
          </div>
        </section>
    </main>
  );
}
