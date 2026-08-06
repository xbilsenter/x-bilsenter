import { useEffect } from 'react';

function animateCounters(scope) {
  const els = scope.querySelectorAll('[data-count]');
  els.forEach((el) => {
    if (el.dataset.animated) return;
    const target = parseInt(el.getAttribute('data-count'), 10);
    if (!target) return;
    el.dataset.animated = 'true';
    // Sett sluttverdi først – unngår at React-re-render/fallback viser «0» lenge.
    el.textContent = String(target);
    const start = Math.max(0, Math.round(target * 0.35));
    const duration = 1100;
    let startTime = null;
    el.textContent = String(start);

    function step(ts) {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = String(Math.round(start + (target - start) * eased));
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = String(target);
    }

    requestAnimationFrame(step);
  });
}

function show(el) {
  if (el.classList.contains('is-visible')) {
    animateCounters(el);
    return;
  }
  el.classList.add('is-visible');
  animateCounters(el);
}

function isMobileViewport() {
  return window.matchMedia('(max-width: 768px), (pointer: coarse)').matches;
}

export default function useReveal(deps = []) {
  useEffect(() => {
    const revealEls = [...document.querySelectorAll('.home-reveal')];
    if (!revealEls.length) return undefined;

    const root = document.documentElement;
    const mobile = isMobileViewport();
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Mobil: ingen hide/show-reveal. Innholdet er alltid synlig – kun myk
    // transform via CSS om ønskelig, men aldri tom/hvit flate under hero.
    if (mobile || reduced || !('IntersectionObserver' in window)) {
      revealEls.forEach(show);
      return undefined;
    }

    root.classList.add('home-reveal-armed');

    const eagerBottom = window.innerHeight * 1.35;
    revealEls.forEach((el) => {
      if (el.getBoundingClientRect().top < eagerBottom) show(el);
    });

    const revealObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          show(entry.target);
          revealObs.unobserve(entry.target);
        });
      },
      { threshold: 0, rootMargin: '15% 0px 30% 0px' }
    );

    revealEls.forEach((el) => {
      if (!el.classList.contains('is-visible')) revealObs.observe(el);
    });

    const fallback = window.setTimeout(() => {
      revealEls.forEach(show);
    }, 1000);

    return () => {
      revealObs.disconnect();
      window.clearTimeout(fallback);
      root.classList.remove('home-reveal-armed');
    };
  }, deps);
}
