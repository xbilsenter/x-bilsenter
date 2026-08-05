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
    if (!visual || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const onScroll = () => {
      const y = window.scrollY;
      if (y > 600) return;
      visual.style.transform = `translateY(${y * 0.12}px)`;
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

    // Animasjonen må ikke starte før båndet er synlig, ellers har den rullet
    // forbi ankerlogoen lenge før brukeren scroller ned til seksjonen.
    const start = async () => {
      await waitForImages(track);
      if (cancelled) return;
      alignAnchor();
      track.classList.add('is-ready');
    };

    if (typeof IntersectionObserver === 'function') {
      observer = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          observer.disconnect();
          observer = null;
          start();
        },
        { threshold: 0.4 }
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
    };
  }, [anchorName]);

  return { trackRef };
}
