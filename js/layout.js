(function () {
  'use strict';

  var page = document.body.getAttribute('data-page') || '';

  var nav = [
    { id: 'biler', href: 'biler.html', label: 'Biler' },
    { id: 'innbytte', href: 'innbytte.html', label: 'Innbytte' },
    { id: 'tjenester', href: 'tjenester.html', label: 'Tjenester' },
    { id: 'om-oss', href: 'om-oss.html', label: 'Om oss' },
    { id: 'kontakt', href: 'kontakt.html', label: 'Kontakt' }
  ];

  function link(item) {
    var active = page === item.id ? ' is-active' : '';
    return '<li><a href="' + item.href + '" class="site-nav__link' + active + '">' + item.label + '</a></li>';
  }

  var headerClass = page === 'home' ? 'site-header site-header--home' : 'site-header site-header--solid';

  var header =
    '<header class="' + headerClass + '" id="siteHeader">' +
      '<div class="site-header__top">' +
        '<div class="container site-header__top-inner">' +
          '<p class="site-header__tagline">Bilhandel gjort trygt og enkelt.</p>' +
          '<div class="site-header__top-meta">' +
            '<a href="tel:+4792050990" class="site-header__top-link">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>' +
              '(+47) 920 50 990' +
            '</a>' +
            '<a href="mailto:post@xbilsenter.no" class="site-header__top-link">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>' +
              'post@xbilsenter.no' +
            '</a>' +
            '<div class="site-header__social" aria-label="Sosiale medier">' +
              '<a href="https://www.facebook.com/xbilsenter" target="_blank" rel="noopener noreferrer" aria-label="Facebook">' +
                '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>' +
              '</a>' +
              '<a href="https://instagram.com/xbilsenter" target="_blank" rel="noopener noreferrer" aria-label="Instagram">' +
                '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>' +
              '</a>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="site-header__main">' +
        '<div class="container site-header__inner">' +
          '<a href="index.html" class="site-logo" aria-label="X Bilsenter AS – forsiden">' +
            '<img src="assets/logo-white.png" alt="X Bilsenter AS" width="154" height="47">' +
          '</a>' +
          '<nav class="site-nav" id="siteNav" aria-label="Hovednavigasjon">' +
            '<div class="site-nav__panel">' +
              '<p class="site-nav__mobile-label">Meny</p>' +
              '<ul class="site-nav__list">' + nav.map(link).join('') + '</ul>' +
              '<div class="site-nav__mobile-footer">' +
                '<a href="tel:+4792050990" class="site-nav__mobile-phone">(+47) 920 50 990</a>' +
                '<a href="selg-bil.html" class="btn btn--brand btn--full">Selg bilen din</a>' +
              '</div>' +
            '</div>' +
          '</nav>' +
          '<div class="site-header__actions">' +
            '<a href="tel:+4792050990" class="site-header__phone">920 50 990</a>' +
            '<a href="selg-bil.html" class="site-header__cta">Selg bilen din</a>' +
          '</div>' +
          '<button class="menu-btn" id="menuBtn" aria-label="Åpne meny" aria-expanded="false">' +
            '<span></span><span></span><span></span>' +
          '</button>' +
        '</div>' +
      '</div>' +
    '</header>';

  var footer =
    '<footer class="site-footer">' +
      '<div class="site-footer__accent" aria-hidden="true"></div>' +
      '<div class="container site-footer__grid">' +
        '<div class="site-footer__brand">' +
          '<img src="assets/logo-white.png" alt="X Bilsenter AS" width="148" height="45">' +
          '<p class="site-footer__tagline">Bilhandel gjort trygt og enkelt.</p>' +
          '<p class="site-footer__desc">Din bilforhandler i Fetsund med over 1600 kvm showroom. Vi hjelper deg med kjøp, salg, innbytte og finansiering.</p>' +
          '<div class="site-footer__social" aria-label="Sosiale medier">' +
            '<a href="https://www.facebook.com/xbilsenter" target="_blank" rel="noopener noreferrer" aria-label="Facebook">' +
              '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>' +
            '</a>' +
            '<a href="https://instagram.com/xbilsenter" target="_blank" rel="noopener noreferrer" aria-label="Instagram">' +
              '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>' +
            '</a>' +
          '</div>' +
        '</div>' +
        '<nav class="site-footer__col" aria-label="Sider">' +
          '<h4>Sider</h4>' +
          '<ul>' +
            '<li><a href="index.html">Forside</a></li>' +
            '<li><a href="biler.html">Våre biler</a></li>' +
            '<li><a href="innbytte.html">Innbytte</a></li>' +
            '<li><a href="om-oss.html">Om oss</a></li>' +
            '<li><a href="kontakt.html">Kontakt</a></li>' +
          '</ul>' +
        '</nav>' +
        '<nav class="site-footer__col" aria-label="Tjenester">' +
          '<h4>Tjenester</h4>' +
          '<ul>' +
            '<li><a href="tjenester.html">Finansiering</a></li>' +
            '<li><a href="tjenester.html">Forsikring</a></li>' +
            '<li><a href="tjenester.html">Bruktbilgaranti</a></li>' +
            '<li><a href="selg-bil.html">Selg bilen din</a></li>' +
            '<li><a href="tjenester.html">Andre tjenester</a></li>' +
          '</ul>' +
        '</nav>' +
        '<div class="site-footer__col site-footer__contact">' +
          '<h4>Kontakt</h4>' +
          '<address class="site-footer__address">' +
            'Rovenveien 125,<br>1900 Fetsund' +
          '</address>' +
          '<ul class="site-footer__contact-list">' +
            '<li><a href="tel:+4792050990" class="site-footer__contact-link site-footer__contact-link--phone">(+47) 920 50 990</a></li>' +
            '<li><a href="mailto:post@xbilsenter.no" class="site-footer__contact-link">post@xbilsenter.no</a></li>' +
          '</ul>' +
          '<a href="kontakt.html" class="btn btn--outline site-footer__cta">Kontakt oss</a>' +
        '</div>' +
      '</div>' +
      '<div class="site-footer__bottom">' +
        '<div class="container site-footer__bottom-inner">' +
          '<p>&copy; 2026 X Bilsenter AS. Alle rettigheter reservert.</p>' +
          '<a href="#" class="site-footer__top-link" id="backToTop">' +
            'Til toppen' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m18 15-6-6-6 6"/></svg>' +
          '</a>' +
        '</div>' +
      '</div>' +
    '</footer>';

  var headerEl = document.getElementById('site-header');
  var footerEl = document.getElementById('site-footer');
  if (headerEl) headerEl.innerHTML = header;
  if (footerEl) footerEl.innerHTML = footer;
})();
