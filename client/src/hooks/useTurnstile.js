import { useState, useEffect, useRef, useCallback } from 'react';
import { TURNSTILE_SITE_KEY } from '../lib/turnstile';

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
let scriptPromise = null;

function loadTurnstileScript() {
  if (typeof window !== 'undefined' && window.turnstile) {
    return Promise.resolve();
  }
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error('Turnstile script failed to load'));
    };
    document.head.appendChild(script);
  });

  return scriptPromise;
}

export function useTurnstile({ active = true } = {}) {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);

  useEffect(() => {
    if (!active || !containerRef.current) return undefined;

    let cancelled = false;
    setError('');

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return;

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          action: 'turnstile-spin-v2',
          theme: 'light',
          callback: (value) => {
            setToken(value);
            setError('');
          },
          'expired-callback': () => {
            setToken('');
            setError('Sikkerhetssjekken utløp. Bekreft på nytt og send igjen.');
          },
          'error-callback': () => {
            setToken('');
            setError('Sikkerhetssjekken feilet. Last siden på nytt, eller slå av annonseblokkering.');
          },
        });
      })
      .catch(() => {
        if (!cancelled) {
          setError('Sikkerhetssjekken kunne ikke lastes. Last siden på nytt og prøv igjen.');
        }
      });

    return () => {
      cancelled = true;
      if (widgetIdRef.current != null && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
      setToken('');
    };
  }, [active]);

  const reset = useCallback(() => {
    if (widgetIdRef.current != null && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
    }
    setToken('');
  }, []);

  const getToken = useCallback(() => token, [token]);

  return {
    active,
    token,
    error,
    getToken,
    reset,
    containerRef,
    ready: !!token,
  };
}
