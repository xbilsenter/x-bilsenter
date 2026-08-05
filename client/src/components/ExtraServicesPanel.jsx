import { Link } from 'react-router-dom';
import { EXTRA_SERVICES } from '../data/extraServices';

export default function ExtraServicesPanel({ activeId, onChange }) {
  const service = EXTRA_SERVICES.find(function (item) {
    return item.id === activeId;
  }) || EXTRA_SERVICES[0];

  return (
    <div className="extra-services extra-services--embedded">
      <p className="extra-services__notice">
        Disse tjenestene er forbeholdt kunder som kjøper bil hos oss.
      </p>

      <div className="service-subtabs" role="tablist" aria-label="Andre tjenester">
        {EXTRA_SERVICES.map(function (item) {
          const isActive = item.id === service.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`extra-tab-${item.id}`}
              aria-selected={isActive}
              aria-controls={`extra-panel-${item.id}`}
              className={`service-subtabs__btn${isActive ? ' is-active' : ''}`}
              onClick={function () {
                onChange(item.id);
              }}
            >
              {item.title}
            </button>
          );
        })}
      </div>

      <article
        id={`extra-panel-${service.id}`}
        role="tabpanel"
        aria-labelledby={`extra-tab-${service.id}`}
        className="extra-services__item extra-services__item--embedded"
      >
        <div className="extra-services__content">
          <p className="extra-services__kicker">{service.intro}</p>
          <h3 className="extra-services__title">{service.title}</h3>
          <p className="extra-services__body">{service.body}</p>

          <h4 className="extra-services__benefits-title">{service.benefitsTitle}</h4>
          <ul className="extra-services__benefits">
            {service.benefits.map(function (item) {
              return <li key={item}>{item}</li>;
            })}
          </ul>

          {service.outro ? <p className="extra-services__outro">{service.outro}</p> : null}
        </div>

        <aside className="extra-services__aside">
          <div className="extra-services__price-card">
            <span className="extra-services__price-label">{service.title}</span>
            <p className="extra-services__price">
              {service.price}
              <span>NOK</span>
            </p>
            <p className="extra-services__price-note">per bil</p>
            <ul className="extra-services__features">
              {service.features.map(function (item) {
                return <li key={item}>{item}</li>;
              })}
            </ul>
            <Link to="/kontakt" className="btn btn--brand btn--full">
              Kontakt oss
            </Link>
          </div>
        </aside>
      </article>
    </div>
  );
}
