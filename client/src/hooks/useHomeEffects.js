import { useEffect, useState, useCallback, useRef } from 'react';

const ROTATOR_WORDS = ['finansiering', 'forsikring', 'garantier', 'innbytte'];
const SLIDE_COUNT = 3;
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

export function useHeroSlides() {
  const [activeSlide, setActiveSlide] = useState(0);
  const timerRef = useRef(null);

  const goTo = useCallback((i) => {
    setActiveSlide((i + SLIDE_COUNT) % SLIDE_COUNT);
  }, []);

  const play = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActiveSlide((current) => (current + 1) % SLIDE_COUNT);
    }, 5500);
  }, []);

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
