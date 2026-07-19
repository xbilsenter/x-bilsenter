import { Link } from 'react-router-dom';
import { NAV_ITEMS } from '../constants';

export default function Header({
  page,
  menuOpen,
  onMenuToggle,
  onMenuClose,
  isScrolled,
}) {
  const headerClass = [
    page === 'home' ? 'site-header site-header--home' : 'site-header site-header--solid',
    page === 'home' && isScrolled ? 'is-scrolled' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <header className={headerClass} id="siteHeader">
      <div className="site-header__top">
        <div className="container site-header__top-inner">
          <p className="site-header__tagline">Bilhandel gjort trygt og enkelt.</p>
          <div className="site-header__top-meta">
            <a href="tel:+4792050990" className="site-header__top-link">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              (+47) 920 50 990
            </a>
            <a href="mailto:post@xbilsenter.no" className="site-header__top-link">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              post@xbilsenter.no
            </a>
            <div className="site-header__social" aria-label="Sosiale medier">
              <a href="https://www.facebook.com/xbilsenter" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a href="https://instagram.com/xbilsenter" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="site-header__main">
        <div className="container site-header__inner">
          <Link to="/" className="site-logo" aria-label="X Bilsenter AS – forsiden">
            <img src="/assets/logo-white.png" alt="X Bilsenter AS" width="154" height="47" />
          </Link>
          <nav className={`site-nav${menuOpen ? ' is-open' : ''}`} id="siteNav" aria-label="Hovednavigasjon">
            <div className="site-nav__panel">
              <p className="site-nav__mobile-label">Meny</p>
              <ul className="site-nav__list">
                {NAV_ITEMS.map((item) => (
                  <li key={item.id}>
                    <Link
                      to={item.to}
                      className={`site-nav__link${page === item.id ? ' is-active' : ''}`}
                      onClick={onMenuClose}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="site-nav__mobile-footer">
                <a href="tel:+4792050990" className="site-nav__mobile-phone">
                  (+47) 920 50 990
                </a>
                <Link to="/selg-bil" className="btn btn--brand btn--full" onClick={onMenuClose}>
                  Selg bilen din
                </Link>
              </div>
            </div>
          </nav>
          <div className="site-header__actions">
            <a href="tel:+4792050990" className="site-header__phone">
              920 50 990
            </a>
            <Link to="/selg-bil" className="site-header__cta">
              Selg bilen din
            </Link>
          </div>
          <button
            type="button"
            className={`menu-btn${menuOpen ? ' is-open' : ''}`}
            id="menuBtn"
            aria-label="Åpne meny"
            aria-expanded={menuOpen}
            onClick={onMenuToggle}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}
