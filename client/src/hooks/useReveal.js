import { useEffect } from 'react';

function animateCounters(scope) {
  const els = scope.querySelectorAll('[data-count]');
  els.forEach((el) => {
    if (el.dataset.animated) return;
    const target = parseInt(el.getAttribute('data-count'), 10);
    if (!target) return;
    el.dataset.animated = 'true';
    const start = 0;
    const duration = 1200;
    let startTime = null;

    function step(ts) {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = String(Math.round(start + (target - start) * eased));
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  });
}

function show(el) {
  if (el.classList.contains('is-visible')) return;
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

    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
      || !('IntersectionObserver' in window)
    ) {
      revealEls.forEach(show);
      return undefined;
    }

    const mobile = isMobileViewport();
    root.classList.add('home-reveal-armed');

    // Vis umiddelbart alt som ligger i eller rett under hero – ingen «hvitt hull».
    const eagerBottom = window.innerHeight * (mobile ? 1.6 : 1.25);
    revealEls.forEach((el) => {
      const top = el.getBoundingClientRect().top;
      if (top < eagerBottom) show(el);
    });

    const revealObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          show(entry.target);
          revealObs.unobserve(entry.target);
        });
      },
      {
        threshold: 0,
        rootMargin: mobile ? '30% 0px 55% 0px' : '15% 0px 25% 0px'
      }
    );

    revealEls.forEach((el) => {
      if (!el.classList.contains('is-visible')) revealObs.observe(el);
    });

    // Kort sikkerhetsnett – ikke flere sekunder med tom side.
    const fallback = window.setTimeout(() => {
      revealEls.forEach(show);
    }, 1200);

    return () => {
      revealObs.disconnect();
      window.clearTimeout(fallback);
      root.classList.remove('home-reveal-armed');
    };
  }, deps);
}
