import { Link } from 'react-router-dom';

export default function OmOssPage() {
  return (
    <main>
      <section className="om-oss-immersive">
        <div className="om-oss-immersive__bg" aria-hidden="true">
          <img src="/assets/showroom.jpeg" alt="" />
        </div>
        <div className="om-oss-immersive__overlay" aria-hidden="true" />

        <div className="container om-oss-immersive__content">
          <div className="om-oss-immersive__panel">
            <nav className="breadcrumb" aria-label="Brødsmulesti">
              <Link to="/">Hjem</Link>
              <span>/</span>
              <span>Om oss</span>
            </nav>

            <div className="om-oss-immersive__grid">
              <header className="om-oss-immersive__intro">
                <p className="om-oss-immersive__kicker">X Bilsenter AS</p>
                <h1>Om oss</h1>
                <p className="om-oss-immersive__lead">
                  En bilbutikk som setter deg først.
                </p>

                <div className="om-oss-immersive__visual">
                  <figure className="om-oss-immersive__photo">
                    <img src="/assets/om-oss-bil.png" alt="Bil hos X Bilsenter AS" />
                  </figure>
                  <div className="om-oss-immersive__photo-cap">
                    <div className="om-oss-immersive__photo-cap-main">
                      <span className="om-oss-immersive__photo-cap-kicker">Velkommen innom</span>
                      <p>Bilhandel gjort trygt og enkelt.</p>
                    </div>
                    <div className="om-oss-immersive__photo-cap-aside">
                      <strong>Lidenskap</strong>
                      <span>for bil siden dag én</span>
                    </div>
                  </div>

                  <div className="om-oss-immersive__member">
                    <span className="om-oss-immersive__member-label">Medlem av</span>
                    <img
                      src="/assets/partners/bruktbilgruppen.svg"
                      alt="Bruktbilgruppen"
                      className="om-oss-immersive__member-logo"
                    />
                  </div>
                </div>
              </header>

              <div className="om-oss-immersive__body">
                <h2>Erfaring og lidenskap for bil</h2>
                <p>
                  X Bilsenter AS er bilbutikken for deg som ønsker en 100&nbsp;% enkel og trygg handel. Vi er opptatt av at
                  bilhandelen skal være enkel for deg som kunde. Vi ordner gjerne med alt av lånesøknader,
                  forsikringer og garantier slik at du skal få en best mulig opplevelse hos oss.
                </p>
                <p>
                  Vi setter veldig stort fokus på personlig service, og stiller opp 100&nbsp;% for våre kunder. Vi hjelper deg
                  med alt som omhandler bil, og vi vil alltid strekke oss til det ytterste for at du som kunde skal være
                  fornøyd med bilhandelen hos oss. Lidenskap for bil er drivkraften vår, og spenningen er like stor ved hver
                  utlevering til heldig ny eier.
                </p>
                <p>
                  Bilbutikken vår ligger på Fetsund i Lillestrøm kommune og måler i overkant av 1600 kvm. Vi er flinke til å
                  utnytte plassen godt, men det er fint om du gir fra deg lyd før du kommer innom slik at bilen du vil besikte
                  står klar. Du er ellers hjertelig velkommen innom for å besikte biler vi har til salgs, og vi ser frem til en
                  uforpliktende og ikke minst en hyggelig bilprat!
                </p>
                <Link to="/kontakt" className="btn btn--brand om-oss-immersive__cta">
                  Ta kontakt
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
