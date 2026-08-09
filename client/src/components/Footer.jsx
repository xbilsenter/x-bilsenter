import { Link } from 'react-router-dom';

export default function Footer({ onBackToTop }) {
  return (
    <footer className="site-footer">
      <div className="site-footer__accent" aria-hidden="true" />
      <div className="site-footer__inner">
        <div className="site-footer__grid">
          <div className="site-footer__brand">
          <img src="/assets/logo-white.svg" alt="X Bilsenter AS" width="148" height="45" />
          <p className="site-footer__tagline">Bilhandel gjort trygt og enkelt.</p>
          <p className="site-footer__desc">
            X Bilsenter AS er bilbutikken for deg som ønsker en 100 % enkel og trygg handel.
          </p>
          <div className="site-footer__social" aria-label="Sosiale medier">
            <a href="https://www.facebook.com/xbilsenter" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
            <a href="https://instagram.com/xbilsenter" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
          </div>
        </div>
        <div className="site-footer__nav-grid">
          <nav className="site-footer__col" aria-label="Sider">
            <h4>Sider</h4>
            <ul>
              <li><Link to="/">Forside</Link></li>
              <li><Link to="/biler">Våre biler</Link></li>
              <li><Link to="/innbytte">Innbytte</Link></li>
              <li><Link to="/om-oss">Om oss</Link></li>
              <li><Link to="/kontakt">Kontakt</Link></li>
            </ul>
          </nav>
          <nav className="site-footer__col" aria-label="Tjenester">
            <h4>Tjenester</h4>
            <ul>
              <li><Link to="/tjenester#finansiering">Finansiering</Link></li>
              <li><Link to="/tjenester#forsikring">Forsikring</Link></li>
              <li><Link to="/tjenester#andre">Andre tjenester</Link></li>
              <li><Link to="/selg-bil">Selg bilen din</Link></li>
            </ul>
          </nav>
        </div>
        <div className="site-footer__col site-footer__contact">
          <h4>Kontakt</h4>
          <ul className="site-footer__contact-list">
            <li>
              <span className="site-footer__contact-label">Besøksadresse</span>
              <span className="site-footer__contact-value">Rovenveien 125, 1900 Fetsund</span>
            </li>
            <li>
              <span className="site-footer__contact-label">Postadresse</span>
              <span className="site-footer__contact-value">Postboks 1730 Vika, 0121 Oslo</span>
            </li>
            <li>
              <span className="site-footer__contact-label">Telefon</span>
              <a href="tel:+4792050990" className="site-footer__contact-value site-footer__contact-value--link">
                (+47) 920 50 990
              </a>
            </li>
            <li>
              <span className="site-footer__contact-label">E-post</span>
              <a href="mailto:post@xbilsenter.no" className="site-footer__contact-value site-footer__contact-value--link">
                post@xbilsenter.no
              </a>
            </li>
          </ul>
          <Link to="/kontakt" className="btn btn--outline site-footer__cta">
            Kontakt oss
          </Link>
        </div>
        </div>
      </div>
      <div className="site-footer__bottom">
        <div className="site-footer__inner site-footer__bottom-inner">
          <p>&copy; 2026 X Bilsenter AS. Alle rettigheter reservert.</p>
          <a href="#" className="site-footer__top-link" id="backToTop" onClick={onBackToTop}>
            Til toppen
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="m18 15-6-6-6 6" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
