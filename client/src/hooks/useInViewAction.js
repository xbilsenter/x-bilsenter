import { useEffect, useRef, useState } from 'react';

export default function useInViewAction(threshold = 0.2, rootMargin = '0px 0px -5% 0px') {
  const ref = useRef(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || active) return undefined;

    const run = () => setActive(true);

    if (!('IntersectionObserver' in window)) {
      run();
      return undefined;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        run();
        obs.disconnect();
      },
      { threshold, rootMargin }
    );

    obs.observe(node);
    return () => obs.disconnect();
  }, [active, threshold, rootMargin]);

  return { ref, active };
}
