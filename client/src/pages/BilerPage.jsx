import PageHero from '../components/PageHero';

export default function BilerPage() {
  return (
    <main>
        <PageHero
          title="Våre biler"
          lead="Håndplukkede biler med garanti, transparent prising og personlig oppfølging."
          breadcrumb={[{ label: 'Hjem', to: '/' }, { label: 'Biler' }]}
          compact
          bgImage="/assets/hero-1.jpg"
        />

        <section className="section finn-inventory" aria-labelledby="finn-inventory-title">
          <div className="finn-inventory__bar">
            <div className="finn-inventory__intro">
              <span className="label">Bil-lager</span>
              <h2 className="section-title" id="finn-inventory-title">
                Biler til salgs
              </h2>
              <p className="finn-inventory__lead">
                Oppdatert lager med pris, spesifikasjoner og bilder — direkte fra vårt FINN-utvalg.
              </p>
            </div>
            <a
              href="https://www.finn.no/pw/search/car-norway?orgId=7640539"
              className="finn-inventory__link"
              target="_blank"
              rel="noopener"
            >
              Åpne full visning på FINN.no
              <span aria-hidden="true">↗</span>
            </a>
          </div>

          <div className="finn-embed">
            <iframe
              className="finn-embed__frame"
              src="https://www.finn.no/pw/search/car-norway?orgId=7640539"
              title="X Bilsenter AS – biler til salgs på FINN.no"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </section>
    </main>
  );
}
