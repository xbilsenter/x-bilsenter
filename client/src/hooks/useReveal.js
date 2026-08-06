import { useEffect } from 'react';

function animateCounters(scope) {
  const els = scope.querySelectorAll('[data-count]');
  els.forEach((el) => {
    if (el.dataset.animated) return;
    const target = parseInt(el.getAttribute('data-count'), 10);
    if (!target) return;
    el.dataset.animated = 'true';
    const start = 0;
    const duration = 1400;
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

function revealAll(els) {
  els.forEach((el) => {
    el.classList.add('is-visible');
    animateCounters(el);
  });
}

function isMobileViewport() {
  return window.matchMedia('(max-width: 768px), (pointer: coarse)').matches;
}

export default function useReveal(deps = []) {
  useEffect(() => {
    const revealEls = [...document.querySelectorAll('.home-reveal')];
    if (!revealEls.length) return undefined;

    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
      || !('IntersectionObserver' in window)
    ) {
      revealAll(revealEls);
      return undefined;
    }

    const mobile = isMobileViewport();
    const revealObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          animateCounters(entry.target);
          revealObs.unobserve(entry.target);
        });
      },
      {
        // På mobil: start litt før elementet er midt i skjermen, så fade-in rekker å synes.
        threshold: mobile ? 0.05 : 0.12,
        rootMargin: mobile ? '48px 0px 18% 0px' : '0px 0px -40px 0px'
      }
    );

    revealEls.forEach((el) => revealObs.observe(el));

    const fallback = window.setTimeout(() => {
      revealEls.forEach((el) => {
        if (!el.classList.contains('is-visible')) {
          el.classList.add('is-visible');
          animateCounters(el);
        }
      });
    }, mobile ? 3500 : 4000);

    return () => {
      revealObs.disconnect();
      window.clearTimeout(fallback);
    };
  }, deps);
}
