import { useEffect } from 'react';

function runCounters(scope) {
  const els = scope.querySelectorAll('[data-count]');
  els.forEach((el) => {
    if (el.dataset.animated) return;
    const target = parseInt(el.getAttribute('data-count'), 10);
    if (!Number.isFinite(target) || target <= 0) return;
    el.dataset.animated = 'true';

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = String(target);
      return;
    }

    const duration = 1400;
    let startTime = null;

    function step(ts) {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = String(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = String(target);
    }

    el.textContent = '0';
    requestAnimationFrame(step);
  });
}

/** Tallene i .home-metrics telles opp når seksjonen kommer i synsfeltet. */
export default function useMetricCounters() {
  useEffect(() => {
    const section = document.querySelector('.home-metrics');
    if (!section) return undefined;

    if (!('IntersectionObserver' in window)) {
      runCounters(section);
      return undefined;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        runCounters(section);
        obs.disconnect();
      },
      { threshold: 0.35, rootMargin: '0px 0px -8% 0px' }
    );

    obs.observe(section);
    return () => obs.disconnect();
  }, []);
}
