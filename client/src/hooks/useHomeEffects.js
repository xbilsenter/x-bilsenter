import { useEffect, useState, useCallback, useRef } from 'react';

const ROTATOR_WORDS = ['finansiering', 'forsikring', 'utvidet garanti', 'innbytte'];
const REVIEW_COUNT = 3;

export function useHeroRotator() {
  const [wordIdx, setWordIdx] = useState(0);
  const [changing, setChanging] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setChanging(true);
      setTimeout(() => {
        setWordIdx((i) => (i + 1) % ROTATOR_WORDS.length);
        setChanging(false);
      }, 350);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  return { word: ROTATOR_WORDS[wordIdx], changing };
}

export function useHeroSlides(slideCount = 1) {
  const count = Math.max(1, slideCount);
  const [activeSlide, setActiveSlide] = useState(0);
  const timerRef = useRef(null);

  const goTo = useCallback((i) => {
    setActiveSlide((i + count) % count);
  }, [count]);

  const play = useCallback(() => {
    if (count <= 1) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActiveSlide((current) => (current + 1) % count);
    }, 5500);
  }, [count]);

  useEffect(() => {
    setActiveSlide((current) => (current >= count ? 0 : current));
  }, [count]);

  useEffect(() => {
    play();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [play]);

  const handleThumbClick = (index) => {
    goTo(index);
    play();
  };

  return { activeSlide, handleThumbClick };
}

export function useReviewSlider() {
  const [idx, setIdx] = useState(0);

  const show = useCallback((i) => {
    setIdx((i + REVIEW_COUNT) % REVIEW_COUNT);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setIdx((current) => (current + 1) % REVIEW_COUNT);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  return {
    idx,
    showPrev: () => show(idx - 1),
    showNext: () => show(idx + 1),
    show,
  };
}

export function useHeroParallax() {
  const visualRef = useRef(null);

  useEffect(() => {
    const visual = visualRef.current;
    if (!visual) return undefined;

    // Parallax på scroll er en vanlig årsak til hakkete mobil-opplevelse.
    const disable = window.matchMedia(
      '(prefers-reduced-motion: reduce), (max-width: 768px), (pointer: coarse)'
    );
    if (disable.matches) return undefined;

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y <= 600) {
          visual.style.transform = `translate3d(0, ${y * 0.12}px, 0)`;
        }
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return visualRef;
}

function waitForImages(container) {
  const images = [...container.querySelectorAll('img')];

  return Promise.all(
    images.map(
      (img) =>
        img.complete
          ? Promise.resolve()
          : new Promise((resolve) => {
              img.addEventListener('load', resolve, { once: true });
              img.addEventListener('error', resolve, { once: true });
            })
    )
  );
}

export function usePartnerMarquee(anchorName) {
  const trackRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;

    // Båndet består av to identiske grupper, så én periode er halve sporet.
    // Ankerlogoen sentreres ved å hoppe inn i loopen med negativ animation-delay.
    // Å forskyve selve transformen ville skjøvet sporet forbi innholdet og gitt
    // et tomrom på slutten av hver runde.
    const alignAnchor = () => {
      if (!anchorName) return;
      const viewport = track.parentElement;
      const period = track.scrollWidth / 2;
      const duration = parseFloat(getComputedStyle(track).getPropertyValue('--home-partners-duration'));
      if (!viewport || !period || !duration) return;

      const anchors = track.querySelectorAll(`[data-partner-anchor="${anchorName}"]`);
      const anchor = anchors[anchors.length - 1];
      if (!anchor) return;

      const anchorCenter = anchor.offsetLeft + anchor.offsetWidth / 2;
      const offset = anchorCenter - viewport.clientWidth / 2;
      const start = ((offset % period) + period) % period;

      track.style.animationDelay = `${-(start / period) * duration}s`;
    };

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      track.classList.add('is-ready');
      return undefined;
    }

    let cancelled = false;
    let observer = null;
    let started = false;

    // Animasjonen må ikke starte før båndet er synlig, ellers har den rullet
    // forbi ankerlogoen lenge før brukeren scroller ned til seksjonen.
    const start = async () => {
      if (started || cancelled) return;
      started = true;
      const timeout = window.setTimeout(() => {
        if (cancelled || track.classList.contains('is-ready')) return;
        alignAnchor();
        track.classList.add('is-ready');
      }, 1200);
      await waitForImages(track);
      window.clearTimeout(timeout);
      if (cancelled) return;
      alignAnchor();
      track.classList.add('is-ready');
    };

    if (typeof IntersectionObserver === 'function') {
      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries.find((item) => item.target === (track.parentElement || track))
            || entries[0];
          if (!entry) return;
          if (entry.isIntersecting) {
            start();
            track.style.animationPlayState = 'running';
          } else if (started) {
            // Pause utenfor viewport – sparer GPU under scroll på mobil.
            track.style.animationPlayState = 'paused';
          }
        },
        { threshold: 0.15, rootMargin: '80px 0px' }
      );
      observer.observe(track.parentElement || track);
    } else {
      start();
    }

    return () => {
      cancelled = true;
      if (observer) observer.disconnect();
      track.classList.remove('is-ready');
      track.style.removeProperty('animation-delay');
      track.style.removeProperty('animation-play-state');
    };
  }, [anchorName]);

  return { trackRef };
}
