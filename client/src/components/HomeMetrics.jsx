import { useEffect, useRef, useState } from 'react';

const METRICS = [
  { id: 'kvm', target: 1600, suffix: '+', label: 'kvm showroom' },
  { id: 'solgt', target: 2000, suffix: '+', label: 'solgte biler' },
  { id: 'aaa', text: 'AAA-rating', label: 'høyeste kredittvurdering' },
  { id: 'lager', target: 85, suffix: '+', label: 'biler i snitt på lager' },
];

export default function HomeMetrics() {
  const sectionRef = useRef(null);
  const [values, setValues] = useState(() =>
    METRICS.map((item) => (item.target != null ? 0 : null))
  );
  const startedRef = useRef(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || startedRef.current) return undefined;

    const start = () => {
      if (startedRef.current) return;
      startedRef.current = true;

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setValues(METRICS.map((item) => (item.target != null ? item.target : null)));
        return;
      }

      const duration = 1400;
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
      // Start så snart noe av seksjonen er i nærheten av viewport
      { threshold: 0, rootMargin: '80px 0px 80px 0px' }
    );

    obs.observe(section);

    // Fallback hvis IO aldri fyrer (eldre WebView / rare layout-cases)
    const fallback = window.setTimeout(start, 2500);

    return () => {
      obs.disconnect();
      window.clearTimeout(fallback);
    };
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
