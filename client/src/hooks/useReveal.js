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

function snapCounters(scope) {
  scope.querySelectorAll('[data-count]').forEach((el) => {
    if (el.dataset.animated) return;
    const target = parseInt(el.getAttribute('data-count'), 10);
    if (!target) return;
    el.dataset.animated = 'true';
    el.textContent = String(target);
  });
}

function revealAll(els, { animate = true } = {}) {
  els.forEach((el) => {
    el.classList.add('is-visible');
    if (animate) animateCounters(el);
    else snapCounters(el);
  });
}

function isMobilePerfMode() {
  return window.matchMedia('(max-width: 768px), (pointer: coarse)').matches;
}

export default function useReveal(deps = []) {
  useEffect(() => {
    const revealEls = [...document.querySelectorAll('.home-reveal')];
    if (!revealEls.length) return undefined;

    const mobile = isMobilePerfMode();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Mobil: ingen scroll-reveal. Det skaper lag og «pop» under touch-scroll.
    if (mobile || reducedMotion || !('IntersectionObserver' in window)) {
      revealAll(revealEls, { animate: !mobile && !reducedMotion });
      return undefined;
    }

    const revealObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          animateCounters(entry.target);
          revealObs.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    revealEls.forEach((el) => revealObs.observe(el));

    const fallback = window.setTimeout(() => {
      revealEls.forEach((el) => {
        if (!el.classList.contains('is-visible')) {
          el.classList.add('is-visible');
          animateCounters(el);
        }
      });
    }, 4000);

    return () => {
      revealObs.disconnect();
      window.clearTimeout(fallback);
    };
  }, deps);
}
