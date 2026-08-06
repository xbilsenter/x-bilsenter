'use strict';

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

function isTurnstileConfigured() {
  return !!(process.env.TURNSTILE_SECRET || '').trim();
}

async function verifyTurnstile(token, remoteip) {
  const secret = (process.env.TURNSTILE_SECRET || '').trim();

  if (!secret) {
    return { ok: true, skipped: true };
  }

  if (!token) {
    return { ok: false, error: 'Bekreft at du ikke er en robot (captcha mangler).' };
  }

  const params = new URLSearchParams({ secret, response: token });
  if (remoteip) params.set('remoteip', remoteip);

  let result;
  try {
    const response = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });
    const raw = await response.text();
    result = raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.error('[turnstile]', err.message);
    return { ok: false, error: 'Captcha kunne ikke verifiseres akkurat nå. Prøv igjen.' };
  }

  if (result.success === true) {
    return { ok: true };
  }

  const codes = Array.isArray(result['error-codes']) ? result['error-codes'] : [];
  if (codes.includes('invalid-input-secret')) {
    console.error('[turnstile] TURNSTILE_SECRET is invalid for this widget');
    return { ok: false, error: 'Captcha er midlertidig utilgjengelig. Ring oss eller prøv igjen senere.' };
  }
  if (codes.includes('timeout-or-duplicate')) {
    return { ok: false, error: 'Captcha utløpt. Bekreft på nytt og send igjen.' };
  }

  return { ok: false, error: 'Captcha-verifisering feilet. Prøv igjen.' };
}

module.exports = {
  isTurnstileConfigured,
  verifyTurnstile,
};
