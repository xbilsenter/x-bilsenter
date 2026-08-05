import { useCallback, useEffect, useMemo, useState } from 'react';

const AUTO_REFRESH_MS = 2 * 60 * 1000;

export function formatPrice(value) {
  if (!Number.isFinite(value)) return 'Pris på forespørsel';
  return `${value.toLocaleString('nb-NO')} kr`;
}

export function formatKm(value) {
  if (!Number.isFinite(value)) return null;
  return `${value.toLocaleString('nb-NO')} km`;
}

export function getModelSpec(car) {
  if (!car) return '';
  if (car.modelSpec) return car.modelSpec;
  const spec = (car.specs || []).find(function (item) {
    return item.key === 'model_spec';
  });
  return spec?.value || '';
}

async function fetchInventory() {
  const response = await fetch('/api/biler', { cache: 'no-store' });
  const contentType = response.headers.get('content-type') || '';

  if (!contentType.includes('application/json')) {
    throw new Error(
      response.status === 404
        ? 'Bil-APIet er ikke tilgjengelig. Start serveren på nytt (npm run dev).'
        : 'Uventet svar fra serveren. Prøv igjen om litt.'
    );
  }

  const data = await response.json();

  if (!response.ok || !data.ok) {
    throw new Error(data.error || 'Kunne ikke hente biler.');
  }

  return data;
}

export default function useFinnInventory() {
  const [cars, setCars] = useState([]);
  const [total, setTotal] = useState(0);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [make, setMake] = useState('');
  const [fuel, setFuel] = useState('');
  const [sort, setSort] = useState('published-desc');

  const load = useCallback(async function (background) {
    if (!background) {
      setLoading(true);
      setError('');
    }

    try {
      const data = await fetchInventory();
      setCars(data.cars || []);
      setTotal(data.total || 0);
      setUpdatedAt(data.updatedAt || null);
      setError('');
    } catch (err) {
      if (!background) {
        setError(err.message || 'Kunne ikke hente biler.');
        setCars([]);
        setTotal(0);
      }
    } finally {
      if (!background) setLoading(false);
    }
  }, []);

  useEffect(function () {
    load(false);

    const timer = window.setInterval(function () {
      if (document.visibilityState === 'visible') load(true);
    }, AUTO_REFRESH_MS);

    function onVisible() {
      if (document.visibilityState === 'visible') load(true);
    }

    document.addEventListener('visibilitychange', onVisible);

    return function () {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [load]);

  const makes = useMemo(function () {
    return [...new Set(cars.map(function (car) { return car.make; }).filter(Boolean))].sort();
  }, [cars]);

  const fuels = useMemo(function () {
    return [...new Set(cars.map(function (car) { return car.fuel; }).filter(Boolean))].sort();
  }, [cars]);

  const filtered = useMemo(function () {
    const q = query.trim().toLowerCase();

    let list = cars.filter(function (car) {
      if (make && car.make !== make) return false;
      if (fuel && car.fuel !== fuel) return false;
      if (!q) return true;
      const haystack = [car.title, car.make, car.model, car.modelSpec, car.year, car.fuel, car.location]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });

    list = [...list].sort(function (a, b) {
      switch (sort) {
        case 'price-desc':
          return (b.price || 0) - (a.price || 0);
        case 'price-asc':
          return (a.price || 0) - (b.price || 0);
        case 'year-desc':
          return Number(b.year || 0) - Number(a.year || 0);
        case 'year-asc':
          return Number(a.year || 0) - Number(b.year || 0);
        case 'km-asc':
          return (a.mileage || 0) - (b.mileage || 0);
        case 'km-desc':
          return (b.mileage || 0) - (a.mileage || 0);
        case 'published-asc': {
          const aTime = Date.parse(a.published || '') || 0;
          const bTime = Date.parse(b.published || '') || 0;
          return aTime - bTime;
        }
        case 'published-desc':
        default: {
          const aTime = Date.parse(a.published || '') || 0;
          const bTime = Date.parse(b.published || '') || 0;
          return bTime - aTime;
        }
      }
    });

    return list;
  }, [cars, query, make, fuel, sort]);

  return {
    cars: filtered,
    total,
    updatedAt,
    loading,
    error,
    query,
    setQuery,
    make,
    setMake,
    fuel,
    setFuel,
    sort,
    setSort,
    makes,
    fuels,
    count: filtered.length
  };
}
