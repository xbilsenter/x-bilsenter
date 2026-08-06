import { TURNSTILE_SITE_KEY } from '../lib/turnstile';

export default function TurnstileField({ active, containerRef }) {
  if (!active) return null;

  return (
    <div className="turnstile-field" aria-label="Bot-beskyttelse">
      <div ref={containerRef} />
    </div>
  );
}
