import { useEffect, useState, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

function getRouteMeta(pathname) {
  if (/^\/biler\/[^/]+/.test(pathname)) {
    return { page: 'biler', bodyClass: 'page-biler page-bil-detail' };
  }

  const routes = {
    '/': { page: 'home', bodyClass: '' },
    '/biler': { page: 'biler', bodyClass: 'page-biler' },
    '/innbytte': { page: 'innbytte', bodyClass: '' },
    '/kontakt': { page: 'kontakt', bodyClass: '' },
    '/om-oss': { page: 'om-oss', bodyClass: '' },
    '/tjenester': { page: 'tjenester', bodyClass: '' },
    '/selg-bil': { page: 'selg-bil', bodyClass: '' },
  };

  return routes[pathname] || { page: '', bodyClass: '' };
}

function useScrollHeader(page) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (page !== 'home') {
      setIsScrolled(false);
      return undefined;
    }

    const update = () => {
      const y = window.scrollY;
      setIsScrolled((prev) => (prev ? y > 4 : y > 24));
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('scrollend', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('scrollend', update);
    };
  }, [page]);

  return isScrolled;
}

function setMobileHomeThemeColor(page) {
  const mobileTheme = document.getElementById('theme-color-meta');
  const fallbackTheme = document.querySelector('meta[name="theme-color"]:not([media])');
  const mobileHome = page === 'home' && window.matchMedia('(max-width: 1024px)').matches;

  if (mobileHome) {
    if (mobileTheme) mobileTheme.setAttribute('content', '#132a1e');
  } else if (fallbackTheme) {
    fallbackTheme.setAttribute('content', '#19ba60');
  }
}

export default function Layout() {
  const location = useLocation();
  const { page, bodyClass } = getRouteMeta(location.pathname);
  const [menuOpen, setMenuOpen] = useState(false);
  const isScrolled = useScrollHeader(page);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.setAttribute('data-page', page || '');
    document.documentElement.classList.toggle('is-home-route', page === 'home');
    setMobileHomeThemeColor(page);

    if (bodyClass) {
      document.body.className = bodyClass;
    } else {
      document.body.className = '';
    }
    return () => {
      document.body.removeAttribute('data-page');
      document.body.className = '';
      document.documentElement.classList.remove('is-home-route');
    };
  }, [page, bodyClass]);

  useEffect(() => {
    if (page !== 'home') return undefined;

    const syncThemeAtTop = () => {
      if (window.scrollY <= 4) setMobileHomeThemeColor('home');
    };

    syncThemeAtTop();
    window.addEventListener('scroll', syncThemeAtTop, { passive: true });
    window.addEventListener('scrollend', syncThemeAtTop);
    return () => {
      window.removeEventListener('scroll', syncThemeAtTop);
      window.removeEventListener('scrollend', syncThemeAtTop);
    };
  }, [page]);

  useEffect(() => {
    if (!menuOpen) {
      document.body.style.overflow = '';
      return undefined;
    }
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const handleMenuToggle = useCallback(() => {
    setMenuOpen((open) => !open);
  }, []);

  const handleMenuClose = useCallback(() => {
    setMenuOpen(false);
  }, []);

  const handleBackToTop = useCallback((e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <>
      <Header
        page={page}
        menuOpen={menuOpen}
        onMenuToggle={handleMenuToggle}
        onMenuClose={handleMenuClose}
        isScrolled={isScrolled}
      />
      <Outlet />
      <Footer onBackToTop={handleBackToTop} />
    </>
  );
}
