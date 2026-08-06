import { useEffect } from 'react';

function show(el) {
  if (el.classList.contains('is-visible')) return;
  el.classList.add('is-visible');
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

    root.classList.add('home-reveal-armed');

    // Vis det som allerede er i/nær viewport med en gang, så det ikke «popper» sent.
    const eagerBottom = window.innerHeight * 1.15;
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
      {
        threshold: 0.08,
        // Start litt før seksjonen er midt i skjermen.
        rootMargin: '0px 0px 20% 0px'
      }
    );

    revealEls.forEach((el) => {
      if (!el.classList.contains('is-visible')) revealObs.observe(el);
    });

    return () => {
      revealObs.disconnect();
      root.classList.remove('home-reveal-armed');
    };
  }, deps);
}
