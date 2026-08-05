export function innbytteLink(car) {
  const finnRef = car?.finnUrl
    || (car?.id ? `https://www.finn.no/mobility/item/${car.id}` : '');

  if (!finnRef) return '/innbytte';

  return `/innbytte?finn=${encodeURIComponent(finnRef)}`;
}
