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

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const next = window.scrollY > 40;
        setIsScrolled((prev) => (prev === next ? prev : next));
        ticking = false;
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [page]);

  return isScrolled;
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
    const theme = document.querySelector('meta[name="theme-color"]');
    if (theme) theme.setAttribute('content', page === 'home' ? '#101812' : '#19ba60');
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
