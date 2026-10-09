import { TURNSTILE_SITE_KEY } from '../lib/turnstile';

export default function TurnstileField({ active, containerRef, error }) {
  if (!active) return null;

  return (
    <div className="turnstile-field" aria-label="Bot-beskyttelse">
      <div ref={containerRef} />
      {error ? <p className="turnstile-field__error">{error}</p> : null}
    </div>
  );
}
