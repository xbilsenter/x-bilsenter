import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';

export default function OmOssPage() {
  return (
    <main>
        <PageHero
          title="Om oss"
          lead={'Bilbutikken for deg som ønsker en 100\u00a0% enkel og trygg handel.'}
          breadcrumb={[{ label: 'Hjem', to: '/' }, { label: 'Om oss' }]}
          bgImage="/assets/hero-3.jpeg"
        />

        <section className="section">
          <div className="container">
            <div className="split">
              <div className="split__media">
                <img src="/assets/about-car.jpeg" alt="Bil hos X Bilsenter AS" />
                <div className="split__badge">
                  <div>
                    <strong>1600+</strong>
                    <span>kvm showroom</span>
                  </div>
                  <div>
                    <strong>Fetsund</strong>
                    <span>Lillestrøm kommune</span>
                  </div>
                </div>
              </div>
              <div>
                <span className="label">X Bilsenter AS</span>
                <h2 className="section-title">Erfaring og lidenskap for bil</h2>
                <p className="section-lead" style={{ marginBottom: 20 }}>
                  X Bilsenter AS er bilbutikken for deg som ønsker en 100&nbsp;% enkel og trygg handel.
                </p>
                <p>
                  Vi er opptatt av at bilhandelen skal være enkel for deg som kunde. Vi ordner derfor gjerne med alt av
                  lånesøknader, forsikringer og garantier slik at du skal få en best mulig opplevelse hos oss.
                </p>
                <p style={{ marginTop: 16 }}>
                  Vi setter veldig stort fokus på personlig service, og stiller opp 100&nbsp;% for våre kunder. Lidenskap
                  for bil er fortsatt drivkraften i oss, og spenningen er like stor hver gang vi utleverer bil til en heldig
                  ny eier.
                </p>
                <p style={{ marginTop: 16 }}>
                  Bilbutikken vår ligger på Fetsund i Lillestrøm kommune og måler i overkant av 1600 kvm. Gi gjerne lyd
                  før du kommer innom, så bilen du vil besikte står klar. Du er hjertelig velkommen til en uforpliktende og
                  hyggelig bilprat!
                </p>
                <div style={{ marginTop: 32 }}>
                  <Link to="/kontakt" className="btn btn--brand">
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
