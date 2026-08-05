import { useEffect, useState } from 'react';

export default function PreviewBanner() {
  const [preview, setPreview] = useState(false);

  useEffect(function () {
    let cancelled = false;

    fetch('/api/preview/status', { cache: 'no-store' })
      .then(function (res) {
        return res.ok ? res.json() : { preview: false };
      })
      .then(function (data) {
        if (!cancelled) setPreview(!!data.preview);
      })
      .catch(function () {
        if (!cancelled) setPreview(false);
      });

    return function () {
      cancelled = true;
    };
  }, []);

  if (!preview) return null;

  return (
    <div className="site-preview-banner" role="status">
      <span>Forhåndsvisning – nettsiden er i vedlikehold for andre besøkende</span>
      <a href="/api/preview/exit" className="site-preview-banner__exit">
        Avslutt forhåndsvisning
      </a>
    </div>
  );
}
