import { useEffect, useState } from 'react';

export default function useFinnCar(id) {
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(function () {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(`/api/biler/${encodeURIComponent(id)}`, { cache: 'no-store' });
        const contentType = response.headers.get('content-type') || '';

        if (!contentType.includes('application/json')) {
          throw new Error('Kunne ikke hente bilannonsen.');
        }

        const data = await response.json();

        if (!response.ok || !data.ok) {
          throw new Error(data.error || 'Kunne ikke hente bilannonsen.');
        }

        if (!cancelled) setCar(data.car || null);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Kunne ikke hente bilannonsen.');
          setCar(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (id) load();

    return function () {
      cancelled = true;
    };
  }, [id]);

  return { car, loading, error };
}
