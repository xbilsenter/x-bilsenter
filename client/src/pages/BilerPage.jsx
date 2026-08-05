import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import useFinnInventory, { formatKm, formatPrice, getModelSpec } from '../hooks/useFinnInventory';

const FINN_ORG_SEARCH_URL = 'https://www.finn.no/mobility/search/car?orgId=7640539';

function carPath(car) {
  return car.id ? `/biler/${car.id}` : '/biler';
}

function InventorySkeleton() {
  return (
    <div className="inventory-grid" aria-hidden="true">
      {[0, 1, 2, 3, 4, 5].map(function (i) {
        return <div key={i} className="inventory-card inventory-card--skeleton" />;
      })}
    </div>
  );
}

function InventoryCard({ car }) {
  const specs = [
    car.year ? String(car.year) : null,
    formatKm(car.mileage),
    car.fuel,
    car.transmission
  ].filter(Boolean);
  const modelSpec = getModelSpec(car);

  return (
    <article className="inventory-card">
      <Link to={carPath(car)} className="inventory-card__media">
        {car.image ? (
          <img src={car.image} alt={car.title} loading="lazy" />
        ) : (
          <div className="inventory-card__placeholder" aria-hidden="true" />
        )}
      </Link>
      <div className="inventory-card__body">
        <p className="inventory-card__eyebrow">{car.make || 'Bil'}</p>
        <h3 className="inventory-card__title">
          <Link to={carPath(car)}>
            {car.model || car.title}
          </Link>
        </h3>
        {modelSpec ? (
          <p className="inventory-card__variant">{modelSpec}</p>
        ) : null}
        {specs.length > 0 ? (
          <ul className="inventory-card__specs">
            {specs.map(function (item) {
              return <li key={item}>{item}</li>;
            })}
          </ul>
        ) : null}
        {car.location ? <p className="inventory-card__location">{car.location}</p> : null}
        <p className="inventory-card__price">{formatPrice(car.price)}</p>
        <div className="inventory-card__actions">
          <Link to={carPath(car)} className="btn btn--brand btn--sm inventory-card__cta">
            Se bil
          </Link>
          <Link to="/kontakt" className="btn btn--ghost btn--sm">
            Kontakt oss
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function BilerPage() {
  const {
    cars,
    total,
    updatedAt,
    loading,
    error,
    query,
    setQuery,
    make,
    setMake,
    fuel,
    setFuel,
    sort,
    setSort,
    makes,
    fuels,
    count
  } = useFinnInventory();

  return (
    <main>
      <PageHero
        title="Våre biler"
        lead="På jakt etter ny bil? Hos oss finner du et variert utvalg av biler."
        breadcrumb={[{ label: 'Hjem', to: '/' }, { label: 'Biler' }]}
        compact
        bgImage="/assets/vare-biler-scaled.jpeg"
        variant="biler"
      />

      <section className="section inventory inventory--showcase" aria-labelledby="inventory-title">
        <div className="inventory__backdrop" aria-hidden="true">
          <div className="inventory__glow inventory__glow--left" />
          <div className="inventory__glow inventory__glow--right" />
          <div className="inventory__grid-lines" />
        </div>

        <div className="container inventory__inner">
          <div className="inventory__head">
            <div>
              <span className="label">Utvalg</span>
              <h2 className="section-title" id="inventory-title">
                Biler til salgs
              </h2>
              <p className="inventory__lead">
                Vi har til enhver tid flere biler på lager enn det som er annonsert på FINN. Finner du ikke drømmebilen blant bilene nedenfor, er sjansen derfor stor for at vi likevel kan hjelpe deg.
              </p>
            </div>
            <div className="inventory__head-aside">
              {!loading && !error ? (
                <div className="inventory__stat-pills" aria-hidden="true">
                  <span className="inventory__stat-pill">
                    <strong>{total}</strong> biler til salgs
                  </span>
                  {updatedAt ? (
                    <span className="inventory__stat-pill inventory__stat-pill--muted">
                      Oppdatert {new Date(updatedAt).toLocaleDateString('nb-NO')}
                    </span>
                  ) : null}
                </div>
              ) : null}
              <a
                href={FINN_ORG_SEARCH_URL}
                className="inventory__finn-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                Se også på FINN.no
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>

          <div className="inventory__controls">
            <div className="inventory__controls-head">
              <p className="inventory__controls-title">Filtrer utvalget</p>
              <p className="inventory__controls-hint">Søk og sorter blant bilene våre</p>
            </div>
            <div className="inventory__toolbar">
              <label className="inventory__search">
                <span className="inventory__field-label">Søk</span>
                <input
                  type="search"
                  value={query}
                  onChange={function (e) { setQuery(e.target.value); }}
                  placeholder="Merke, modell, år…"
                />
              </label>

              <label className="inventory__filter">
                <span className="inventory__field-label">Merke</span>
                <select value={make} onChange={function (e) { setMake(e.target.value); }}>
                  <option value="">Alle merker</option>
                  {makes.map(function (item) {
                    return <option key={item} value={item}>{item}</option>;
                  })}
                </select>
              </label>

              <label className="inventory__filter">
                <span className="inventory__field-label">Drivstoff</span>
                <select value={fuel} onChange={function (e) { setFuel(e.target.value); }}>
                  <option value="">Alle drivstoff</option>
                  {fuels.map(function (item) {
                    return <option key={item} value={item}>{item}</option>;
                  })}
                </select>
              </label>

              <label className="inventory__filter">
                <span className="inventory__field-label">Sortering</span>
                <select value={sort} onChange={function (e) { setSort(e.target.value); }}>
                  <option value="published-desc">Publisert</option>
                  <option value="price-asc">Pris lav–høy</option>
                  <option value="price-desc">Pris høy–lav</option>
                  <option value="year-desc">Nyeste årsmodell</option>
                  <option value="year-asc">Eldste årsmodell</option>
                  <option value="km-asc">Lavest km</option>
                  <option value="km-desc">Høyest km</option>
                </select>
              </label>
            </div>

            <div className="inventory__status" aria-live="polite">
              {loading ? (
                <span>Henter biler…</span>
              ) : error ? (
                <span className="inventory__status--error">{error}</span>
              ) : (
                <span>
                  Viser {count} av {total} biler
                </span>
              )}
            </div>
          </div>

          {loading ? <InventorySkeleton /> : null}

          {!loading && error ? (
            <div className="inventory-empty">
              <h3>Kunne ikke laste bilutvalget</h3>
              <p>Prøv igjen senere, eller ta kontakt så hjelper vi deg finne riktig bil.</p>
              <div className="inventory-empty__actions">
                <Link to="/kontakt" className="btn btn--brand">Kontakt oss</Link>
                <a
                  href={FINN_ORG_SEARCH_URL}
                  className="btn btn--ghost"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Se på FINN.no
                </a>
              </div>
            </div>
          ) : null}

          {!loading && !error && cars.length === 0 ? (
            <div className="inventory-empty">
              <h3>Ingen biler matcher søket</h3>
              <p>
                {total === 0
                  ? 'Vi har ingen aktive annonser akkurat nå. Ta gjerne kontakt — vi hjelper deg finne riktig bil.'
                  : 'Prøv å justere filtrene, eller ta kontakt for personlig hjelp.'}
              </p>
              <div className="inventory-empty__actions">
                <Link to="/kontakt" className="btn btn--brand">Kontakt oss</Link>
                <a
                  href={FINN_ORG_SEARCH_URL}
                  className="btn btn--ghost"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Se på FINN.no
                </a>
              </div>
            </div>
          ) : null}

          {!loading && !error && cars.length > 0 ? (
            <div className="inventory-grid">
              {cars.map(function (car) {
                return <InventoryCard key={car.id || car.url} car={car} />;
              })}
            </div>
          ) : null}

          <div className="inventory__cta">
            <div className="cta-band">
              <div>
                <h2>Fant du ikke det du leter etter?</h2>
                <p>Vi har alltid langt flere biler på lager enn det som er annonsert på FINN til enhver tid. Ta kontakt — så hjelper vi deg finne riktig bil.</p>
              </div>
              <div className="inventory__cta-actions">
                <Link to="/kontakt" className="btn btn--outline-light btn--lg">Kontakt oss</Link>
                <Link to="/innbytte" className="btn btn--outline-light btn--lg">Innbytte</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
