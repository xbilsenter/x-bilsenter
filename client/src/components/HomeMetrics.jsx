import { useEffect, useRef, useState } from 'react';

const METRICS = [
  { id: 'kvm', target: 1600, suffix: '+', label: 'kvm showroom' },
  { id: 'solgt', target: 2000, suffix: '+', label: 'solgte biler' },
  { id: 'aaa', text: 'AAA-rating', label: 'høyeste kredittvurdering' },
  { id: 'lager', target: 85, suffix: '+', label: 'biler i snitt på lager' },
];

function finalValues() {
  return METRICS.map((item) => (item.target != null ? item.target : null));
}

function prefersInstantMetrics() {
  if (typeof window === 'undefined') return true;
  return window.matchMedia('(max-width: 768px), (pointer: coarse), (prefers-reduced-motion: reduce)').matches;
}

export default function HomeMetrics() {
  const sectionRef = useRef(null);
  const [values, setValues] = useState(() =>
    prefersInstantMetrics()
      ? finalValues()
      : METRICS.map((item) => (item.target != null ? 0 : null))
  );
  const startedRef = useRef(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || startedRef.current) return undefined;

    const animate = () => {
      if (startedRef.current) return;
      startedRef.current = true;

      setValues(METRICS.map(() => 0));

      const duration = 1200;
      const from = performance.now();

      function tick(now) {
        const progress = Math.min((now - from) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValues(
          METRICS.map((item) =>
            item.target != null ? Math.round(item.target * eased) : null
          )
        );
        if (progress < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
    };

    if (prefersInstantMetrics()) {
      setValues(finalValues());
      startedRef.current = true;
      return undefined;
    }

    const start = () => animate();

    const rect = section.getBoundingClientRect();
    if (rect.top < window.innerHeight + 120) {
      start();
      return undefined;
    }

    if (!('IntersectionObserver' in window)) {
      start();
      return undefined;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        start();
        obs.disconnect();
      },
      { threshold: 0, rootMargin: '120px 0px 120px 0px' }
    );

    obs.observe(section);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="home-metrics" aria-label="Nøkkeltall">
      <div className="container">
        <ul className="home-metrics__grid">
          {METRICS.map((item, index) => (
            <li key={item.id} className="home-metric">
              <p className="home-metric__value">
                {item.text ? (
                  <span className="home-metric__num home-metric__num--text">{item.text}</span>
                ) : (
                  <>
                    <span className="home-metric__num">{values[index]}</span>
                    <span className="home-metric__suffix">{item.suffix}</span>
                  </>
                )}
              </p>
              <span className="home-metric__label">{item.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
