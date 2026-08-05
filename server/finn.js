'use strict';

function parseFinnItemId(input) {
  const s = String(input || '').trim();
  if (!s) return null;
  const urlMatch = s.match(/finn\.no\/mobility\/item\/(\d+)/i);
  if (urlMatch) return urlMatch[1];
  const digits = s.replace(/\D/g, '');
  return digits.length >= 6 ? digits : null;
}

function finnItemUrl(id) {
  return id ? `https://www.finn.no/mobility/item/${id}` : null;
}

function cleanFinnTitle(raw) {
  let title = String(raw || '').trim();
  if (!title) return '';
  title = title.replace(/^Bruktbil til salgs:\s*/i, '').trim();
  title = title.replace(/\s*[|\-–—]\s*FINN\.no\s*$/i, '').trim();
  title = title.replace(/\s*\|\s*FINN\s*$/i, '').trim();
  const yearSplit = title.match(/^(.+?)\s+-\s+(19|20)\d{2}\b/);
  if (yearSplit) title = yearSplit[1].trim();
  return title;
}

async function lookupFinnAnnonse(ref) {
  const id = parseFinnItemId(ref);
  const url = finnItemUrl(id);
  if (!id || !url) {
    return { id: null, url: null, title: null, valid: false };
  }

  let title = '';
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'XBilsenter/1.0 (+https://xbilsenter.no)',
        Accept: 'text/html'
      },
      redirect: 'follow'
    });
    if (!response.ok) {
      return { id, url, title: null, valid: false };
    }

    const html = await response.text();
    const ogMatch = html.match(/property=["']og:title["']\s+content=["']([^"']+)["']/i)
      || html.match(/content=["']([^"']+)["']\s+property=["']og:title["']/i);
    if (ogMatch) {
      title = cleanFinnTitle(ogMatch[1]);
    } else {
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch) title = cleanFinnTitle(titleMatch[1]);
    }

    if (/ikke funnet|finnes ikke|404/i.test(html.slice(0, 4000)) && !title) {
      return { id, url, title: null, valid: false };
    }

    return { id, url, title: title || null, valid: true };
  } catch (_err) {
    return { id, url, title: null, valid: false };
  }
}

module.exports = {
  parseFinnItemId,
  finnItemUrl,
  lookupFinnAnnonse
};
