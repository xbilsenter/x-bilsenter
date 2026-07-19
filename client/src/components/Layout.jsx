import { useEffect, useState, useCallback } from 'react';
import Header from './Header';
import Footer from './Footer';

function useScrollHeader(page) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (page !== 'home') {
      setIsScrolled(false);
      return undefined;
    }

    const onScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [page]);

  return isScrolled;
}

export default function Layout({ page, children, bodyClass }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isScrolled = useScrollHeader(page);

  useEffect(() => {
    document.body.setAttribute('data-page', page || '');
    if (bodyClass) {
      document.body.className = bodyClass;
    } else {
      document.body.className = '';
    }
    return () => {
      document.body.removeAttribute('data-page');
      document.body.className = '';
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
      {children}
      <Footer onBackToTop={handleBackToTop} />
    </>
  );
}
