import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const TJENESTER_TAB_HASH = /^#(?:finansiering|forsikring|andre(?:-[a-z0-9-]+)?|mer)$/;

export default function ScrollToTop() {
  const { pathname, hash, search } = useLocation();

  useEffect(function () {
    if (pathname === '/tjenester' && TJENESTER_TAB_HASH.test(hash)) {
      const focus = document.getElementById('tjenester-fokus');
      if (focus) {
        focus.scrollIntoView({ behavior: 'auto', block: 'start' });
      } else {
        window.scrollTo(0, 0);
      }
      return;
    }

    if (hash) {
      const target = document.querySelector(hash);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash, search]);

  return null;
}
