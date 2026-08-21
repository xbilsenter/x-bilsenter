export function trimText(value) {
  return String(value ?? '').trim();
}

export function isValidEmail(value) {
  const email = trimText(value);
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u.test(email);
}

export function isValidPhone(value) {
  const digits = String(value ?? '').replace(/\D/g, '');
  return digits.length >= 8;
}

export function isValidName(value) {
  return trimText(value).length >= 2;
}

export function validateContactFields({ navn, epost, mobil }, showError) {
  if (!isValidName(navn)) {
    showError('Skriv inn fullt navn.');
    document.getElementById('navn')?.focus();
    return false;
  }
  if (!isValidPhone(mobil)) {
    showError('Skriv inn et gyldig mobilnummer (minst 8 siffer).');
    document.getElementById('mobil')?.focus();
    return false;
  }
  if (!isValidEmail(epost)) {
    showError('Skriv inn en gyldig e-postadresse (f.eks. navn@epost.no).');
    document.getElementById('epost')?.focus();
    return false;
  }
  return true;
}

export function validateKontaktFields({ name, email, subject }, showError) {
  if (!isValidName(name)) {
    showError('Skriv inn navn.');
    document.getElementById('name')?.focus();
    return false;
  }
  if (!isValidEmail(email)) {
    showError('Skriv inn en gyldig e-postadresse (f.eks. navn@epost.no).');
    document.getElementById('email')?.focus();
    return false;
  }
  if (!trimText(subject)) {
    showError('Velg emne.');
    document.getElementById('subject')?.focus();
    return false;
  }
  return true;
}

export async function parseJsonResponse(res) {
  if (res.status === 413) {
    throw new Error(
      'Skjemaet ble for stort (ofte pga. bilder). Fjern noen bilder og prøv igjen.'
    );
  }

  const text = await res.text();
  if (text) {
    try {
      return JSON.parse(text);
    } catch (_err) {
      // Not JSON – fall through to status-based message below.
    }
  }

  if (res.status >= 500) {
    throw new Error('Serveren er midlertidig utilgjengelig. Prøv igjen om litt, eller ring oss.');
  }

  throw new Error('Serveren svarte uventet. Prøv igjen om litt, eller ring oss.');
}
