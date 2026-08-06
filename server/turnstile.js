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

  let result;
  try {
    const response = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret,
        response: token,
        remoteip: remoteip || '',
      }),
    });
    if (!response.ok) {
      throw new Error('siteverify ' + response.status);
    }
    result = await response.json();
  } catch (err) {
    console.error('[turnstile]', err.message);
    return { ok: false, error: 'Captcha kunne ikke verifiseres akkurat nå. Prøv igjen.' };
  }

  if (result.success !== true) {
    return { ok: false, error: 'Captcha-verifisering feilet. Prøv igjen.' };
  }

  return { ok: true };
}

module.exports = {
  isTurnstileConfigured,
  verifyTurnstile,
};
