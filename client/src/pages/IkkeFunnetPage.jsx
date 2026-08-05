import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';

export default function IkkeFunnetPage() {
  return (
    <main>
      <PageHero
        title="Siden finnes ikke"
        lead="Lenken kan være utdatert, eller så har siden byttet adresse."
        breadcrumb={[{ label: 'Forside', to: '/' }, { label: '404' }]}
        compact
        darkOverlay
      />

      <section className="section">
        <div className="container">
          <div className="inventory-empty">
            <h3>Vi fant ikke siden du lette etter</h3>
            <p>Prøv en av lenkene under, eller ta kontakt så hjelper vi deg videre.</p>
            <div className="inventory-empty__actions">
              <Link to="/" className="btn btn--brand">Til forsiden</Link>
              <Link to="/biler" className="btn btn--ghost">Se våre biler</Link>
              <Link to="/kontakt" className="btn btn--ghost">Kontakt oss</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
