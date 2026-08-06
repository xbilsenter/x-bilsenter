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

function show(el) {
  el.classList.add('is-visible');
  animateCounters(el);
}

function isNearViewport(el, leadPx) {
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight;
  return rect.top < vh + leadPx && rect.bottom > -leadPx;
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
    // Vis alt som allerede er i/nær viewport FØR vi skjuler resten,
    // ellers blir seksjoner hvite tomrom til observøren rekker å fyre.
    const lead = mobile ? Math.round(window.innerHeight * 0.35) : 80;
    revealEls.forEach((el) => {
      if (isNearViewport(el, lead)) show(el);
    });

    // Arm hiding først etter at synlige elementer er markert.
    root.classList.add('home-reveal-armed');

    const revealObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          show(entry.target);
          revealObs.unobserve(entry.target);
        });
      },
      {
        threshold: 0.01,
        // Start animasjonen før seksjonen er synlig, så fade-in er ferdig i tide.
        rootMargin: mobile ? '20% 0px 40% 0px' : '10% 0px 15% 0px'
      }
    );

    revealEls.forEach((el) => {
      if (!el.classList.contains('is-visible')) revealObs.observe(el);
    });

    const fallback = window.setTimeout(() => {
      revealEls.forEach((el) => {
        if (!el.classList.contains('is-visible')) show(el);
      });
    }, 5000);

    return () => {
      revealObs.disconnect();
      window.clearTimeout(fallback);
      root.classList.remove('home-reveal-armed');
    };
  }, deps);
}
