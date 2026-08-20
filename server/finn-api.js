'use strict';

const FINN_SEARCH_URL = 'https://cache.api.finn.no/iad/search/car-norway';
const FINN_UA = 'XBilsenter/1.0 (+https://xbilsenter.no)';
const CACHE_TTL_MS = Math.max(
  30,
  Number(process.env.FINN_CACHE_TTL_SECONDS || 120)
) * 1000;
const MAX_ROWS = 1000;

let inventoryCache = {
  key: '',
  fetchedAt: 0,
  data: null
};

const adDetailCache = new Map();

const DETAIL_SPEC_ORDER = [
  { key: 'make', label: 'Merke' },
  { key: 'model', label: 'Modell' },
  { key: 'year', label: 'Årsmodell' },
  { key: 'mileage', label: 'Kilometerstand' },
  { key: 'fuel', label: 'Drivstoff' },
  { key: 'transmission', label: 'Girkasse' },
  { key: 'effect', label: 'Effekt' },
  { key: 'wheel_drive', label: 'Hjuldrift' },
  { key: 'first_registration', label: '1. gang registrert' },
  { key: 'body_type', label: 'Karosseri' },
  { key: 'exterior_color', label: 'Farge' },
  { key: 'interior_color', label: 'Innvendig farge' },
  { key: 'seats', label: 'Antall seter' },
  { key: 'weight', label: 'Vekt' },
  { key: 'registration_class', label: 'Avgiftsklasse' },
  { key: 'chassis_number', label: 'Chassinummer' }
];

function decodeXml(value) {
  return String(value || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function attrValue(tag, name) {
  const re = new RegExp(`${name}\\s*=\\s*"([^"]*)"`, 'i');
  const match = tag.match(re);
  return match ? decodeXml(match[1]) : '';
}

function fieldValue(block, name) {
  const direct = block.match(
    new RegExp(`<(?:finn|f):field\\b[^>]*\\bname="${name}"[^>]*\\bvalue="([^"]*)"`, 'i')
  );
  if (direct) return decodeXml(direct[1]);

  const wrapper = block.match(
    new RegExp(`<(?:finn|f):field\\b[^>]*\\bname="${name}"[^>]*>([\\s\\S]*?)<\\/(?:finn|f):field>`, 'i')
  );
  if (!wrapper) return '';

  const nested = wrapper[1].match(
    /<(?:finn|f):field\b[^>]*\bvalue="([^"]*)"/i
  );
  if (nested) return decodeXml(nested[1]);

  const text = wrapper[1].replace(/<[^>]+>/g, '').trim();
  return decodeXml(text);
}

function fieldValues(block, name) {
  const openMatch = block.match(
    new RegExp(`<(?:finn|f):field\\b[^>]*\\bname="${name}"(?:\\b[^>]*)?>`, 'i')
  );
  if (!openMatch) {
    const single = fieldValue(block, name);
    return single ? [single] : [];
  }

  const start = openMatch.index + openMatch[0].length;
  const rest = block.slice(start);
  const closeMatch = rest.match(/<\/(?:finn|f):field>/i);
  if (!closeMatch) return [];

  const inner = rest.slice(0, closeMatch.index);
  const values = [...inner.matchAll(/<(?:finn|f):value>([\s\S]*?)<\/(?:finn|f):value>/gi)]
    .map(function (match) { return decodeXml(match[1].replace(/<[^>]+>/g, '').trim()); })
    .filter(Boolean);

  if (values.length) return values;

  const single = fieldValue(block, name);
  if (!single) return [];
  return single.split(/[,;|]/).map(function (part) { return part.trim(); }).filter(Boolean);
}

function fieldBoolean(block, name) {
  const value = String(fieldValue(block, name) || '').trim().toLowerCase();
  if (value === 'true' || value === 'ja' || value === 'yes') return true;
  if (value === 'false' || value === 'nei' || value === 'no') return false;
  return null;
}

function extractEquipment(block) {
  return fieldValues(block, 'equipment');
}

function extractServiceInfo(block) {
  const history = fieldBoolean(block, 'car_service_history');
  const planFollowed = fieldBoolean(block, 'service_plan_followed');
  const documents = fieldValue(block, 'service_documents');
  const items = [];

  if (history === true) {
    items.push({ label: 'Servicehistorikk', value: 'Komplett servicehistorikk' });
  }

  if (planFollowed === true) {
    items.push({ label: 'Serviceplan', value: 'Serviceplan fulgt' });
  }

  if (documents) {
    items.push({ label: 'Servicehefte', value: documents });
  }

  if (!items.length) return null;
  return { items };
}

function isMissingWarrantyText(value) {
  const text = String(value || '').trim().toLowerCase();
  if (!text) return true;
  return /^(ingen|uten|nei|no|none|false|0)$/.test(text)
    || /ingen garanti|uten garanti|selges uten garanti|as is|as-is/.test(text);
}

function extractWarrantyInfo(block) {
  const summary = fieldValue(block, 'warranty_summary');
  const type = fieldValue(block, 'warranty') || fieldValue(block, 'warranty_insurance');
  const durationRaw = fieldValue(block, 'warranty_duration');
  const distanceRaw = fieldValue(block, 'warranty_distance');
  const durationMonths = durationRaw ? Number(String(durationRaw).replace(/\D/g, '')) : null;
  const distanceKm = distanceRaw ? Number(String(distanceRaw).replace(/\D/g, '')) : null;

  const hasDuration = Number.isFinite(durationMonths) && durationMonths > 0;
  const hasDistance = Number.isFinite(distanceKm) && distanceKm > 0;
  const hasSummary = summary && !isMissingWarrantyText(summary);
  const hasType = type && !isMissingWarrantyText(type);

  if (!hasSummary && !hasType && !hasDuration && !hasDistance) return null;

  let displaySummary = hasSummary ? summary : '';
  if (!displaySummary && hasType) {
    const parts = [type];
    if (hasDuration) parts.push(`${durationMonths} mnd`);
    if (hasDistance) parts.push(`${distanceKm.toLocaleString('nb-NO')} km`);
    displaySummary = parts.join(' · ');
  }

  if (!displaySummary || isMissingWarrantyText(displaySummary)) return null;

  return {
    summary: displaySummary,
    type: hasType ? type : '',
    durationMonths: hasDuration ? durationMonths : null,
    distanceKm: hasDistance ? distanceKm : null
  };
}

function extractLink(block, rel) {
  const re = new RegExp(
    `<link\\b[^>]*\\brel="${rel}"[^>]*\\bhref="([^"]+)"|<link\\b[^>]*\\bhref="([^"]+)"[^>]*\\brel="${rel}"`,
    'i'
  );
  const match = block.match(re);
  return decodeXml(match ? match[1] || match[2] : '');
}

function extractTitle(block) {
  const match = block.match(/<title(?:\s[^>]*)?>([\s\S]*?)<\/title>/i);
  return decodeXml(match ? match[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/, '$1') : '');
}

function extractImages(block) {
  const images = [];
  const re = /<media:content\b[^>]*\burl="([^"]+)"/gi;
  let match;
  while ((match = re.exec(block)) !== null) {
    const url = decodeXml(match[1]);
    if (url && !images.includes(url)) images.push(url);
  }
  return images;
}

function isCarPhotoUrl(url) {
  const value = String(url || '').toLowerCase();
  if (!value) return false;
  if (value.includes('maptiles.finncdn.no') || value.includes('staticmap')) return false;
  if (value.includes('dealerhub.cdn-vend.com')) return false;
  if (value.includes('/logo/')) return false;
  // Nyere annonser bruker /item/<annonseId>/<uuid>, eldre bruker datobaserte
  // stier som /2024/12/vertical-0/... — begge er gyldige bilbilder.
  return value.includes('images.finncdn.no');
}

function upgradeFinnImageUrl(url, width) {
  if (!url || !url.includes('images.finncdn.no')) return url;
  const target = `${Number(width) || 1600}w`;
  return url
    .replace(/\/dynamic\/default\//, `/dynamic/${target}/`)
    .replace(/\/dynamic\/\d+w\//, `/dynamic/${target}/`);
}

function normalizeCarPhotos(urls) {
  const seen = new Set();
  const photos = [];

  for (const url of urls || []) {
    if (!isCarPhotoUrl(url)) continue;

    const identity = url.replace(/\/dynamic\/(?:default|\d+w)\//, '/');
    if (seen.has(identity)) continue;
    seen.add(identity);

    photos.push({
      full: upgradeFinnImageUrl(url, 1600),
      preview: upgradeFinnImageUrl(url, 960),
      thumb: upgradeFinnImageUrl(url, 320)
    });
  }

  return photos;
}

function extractImage(block) {
  const photos = normalizeCarPhotos(extractImages(block));
  if (photos.length) return photos[0].preview;

  const thumb = block.match(/<media:thumbnail\b[^>]*\burl="([^"]+)"/i);
  if (thumb) {
    const url = decodeXml(thumb[1]);
    return isCarPhotoUrl(url) ? upgradeFinnImageUrl(url, 1600) : '';
  }

  return '';
}

function extractPrice(block) {
  const match = block.match(/<(?:finn|f):price\b[^>]*\bname="main"[^>]*\bvalue="([^"]+)"/i)
    || block.match(/<(?:finn|f):price\b[^>]*\bvalue="([^"]+)"[^>]*\bname="main"/i);
  if (!match) return null;
  const value = Number(String(match[1]).replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(value) ? value : null;
}

function extractPublished(block) {
  const published = block.match(/<published[^>]*>([^<]+)<\/published>/i);
  if (published) return decodeXml(published[1]);

  const updated = block.match(/<updated[^>]*>([^<]+)<\/updated>/i);
  return updated ? decodeXml(updated[1]) : '';
}

function extractDisposed(block) {
  const match = block.match(
    /<category\b[^>]*\bscheme="urn:finn:ad:disposed"[^>]*\bterm="([^"]+)"/i
  ) || block.match(
    /<category\b[^>]*\bterm="([^"]+)"[^>]*\bscheme="urn:finn:ad:disposed"/i
  );
  return match ? String(match[1]).toLowerCase() === 'true' : false;
}

function extractFinnId(block) {
  const alternate = extractLink(block, 'alternate');
  const itemMatch = alternate.match(/\/mobility\/item\/(\d+)/i);
  if (itemMatch) return itemMatch[1];

  const directMatch = alternate.match(/finn\.no\/(\d{6,})/i);
  if (directMatch) return directMatch[1];

  const self = extractLink(block, 'self');
  const adMatch = self.match(/\/ad\/[^/]+\/(\d+)/i);
  if (adMatch) return adMatch[1];

  const idTag = block.match(/<id[^>]*>([^<]+)<\/id>/i);
  if (idTag) {
    const digits = idTag[1].match(/(\d{6,})/);
    if (digits) return digits[1];
  }

  return null;
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function deriveModelSpecFromTitle(title, make, model) {
  if (!title) return '';

  let text = String(title).trim();
  text = text.replace(/^Bruktbil til salgs:\s*/i, '').trim();
  text = text.replace(/\s*[|\-–—]\s*FINN\.no\s*$/i, '').trim();

  if (make) {
    text = text.replace(new RegExp(`^${escapeRegExp(make)}\\s+`, 'i'), '');
  }
  if (model) {
    text = text.replace(new RegExp(`^${escapeRegExp(model)}\\s+`, 'i'), '');
  }

  text = text.replace(/\s[-–—]\s*(19|20)\d{2}\b.*$/i, '').trim();
  text = text.replace(/\s+(19|20)\d{2}\b.*$/i, '').trim();

  if (!text) return '';
  if (model && text.toLowerCase() === model.toLowerCase()) return '';
  return text;
}

function extractModelSpec(block, make, model, title) {
  const direct = fieldValue(block, 'model_spec')
    || fieldValue(block, 'car_model_spec')
    || fieldValue(block, 'model_description');
  if (direct) return direct;

  return deriveModelSpecFromTitle(title, make, model);
}

function parseSearchEntry(block) {
  const id = extractFinnId(block);
  const apiUrl = extractLink(block, 'self');
  const finnUrl = extractLink(block, 'alternate') || (id ? `https://www.finn.no/mobility/item/${id}` : '');
  const make = fieldValue(block, 'make') || fieldValue(block, 'car_make');
  const model = fieldValue(block, 'model') || fieldValue(block, 'car_model');
  const year = fieldValue(block, 'year')
    || fieldValue(block, 'regdate')
    || fieldValue(block, 'year_model');
  const mileageRaw = fieldValue(block, 'mileage') || fieldValue(block, 'km');
  const mileage = mileageRaw ? Number(String(mileageRaw).replace(/\D/g, '')) : null;
  const fuel = fieldValue(block, 'engine_fuel') || fieldValue(block, 'fuel') || fieldValue(block, 'engine');
  const transmission = fieldValue(block, 'transmission') || fieldValue(block, 'gearbox');
  const location = fieldValue(block, 'location') || fieldValue(block, 'city');
  const price = extractPrice(block);
  const photos = normalizeCarPhotos(extractImages(block));
  const image = photos[0]?.full || photos[0]?.preview || extractImage(block);
  const title = extractTitle(block);
  const modelSpec = extractModelSpec(block, make, model, title);
  const sold = extractDisposed(block);

  if (!id && !finnUrl) return null;

  return {
    id,
    url: id ? `/biler/${id}` : '/biler',
    finnUrl,
    apiUrl,
    title: title || [make, model, year].filter(Boolean).join(' ').trim(),
    make,
    model,
    modelSpec,
    year: year ? String(year).slice(0, 4) : '',
    mileage: Number.isFinite(mileage) ? mileage : null,
    fuel,
    transmission,
    location,
    price,
    image,
    photos,
    images: photos.map(function (photo) { return photo.full; }),
    published: extractPublished(block),
    sold,
    availability: sold ? 'sold' : 'available'
  };
}

function parseSearchFeed(xml) {
  const entries = xml.match(/<entry\b[\s\S]*?<\/entry>/gi) || [];
  return entries.map(parseSearchEntry).filter(Boolean);
}

function buildSearchParams(orgId, options) {
  const params = new URLSearchParams();
  params.set('orgId', String(orgId));
  params.set('rows', String(Math.min(Number(options.rows) || MAX_ROWS, MAX_ROWS)));

  if (options.page) params.set('page', String(options.page));
  if (options.sort) params.set('sort', String(options.sort));
  if (options.q) params.set('q', String(options.q));
  if (options.make) params.set('make', String(options.make));
  if (options.model) params.set('model', String(options.model));
  if (options.fuel) params.set('fuel', String(options.fuel));
  if (options.price_from) params.set('price_from', String(options.price_from));
  if (options.price_to) params.set('price_to', String(options.price_to));
  if (options.year_from) params.set('year_from', String(options.year_from));
  if (options.year_to) params.set('year_to', String(options.year_to));

  return params;
}

async function fetchSearchPage(apiKey, orgId, options) {
  const params = buildSearchParams(orgId, options);
  const response = await fetch(`${FINN_SEARCH_URL}?${params.toString()}`, {
    headers: {
      'x-finn-apikey': apiKey,
      Accept: 'application/atom+xml, application/xml, text/xml, */*',
      'User-Agent': FINN_UA
    }
  });

  if (response.status === 401 || response.status === 403) {
    const error = new Error('FINN API-nøkkelen er ugyldig eller mangler tilgang.');
    error.code = 'FINN_AUTH';
    error.status = response.status;
    throw error;
  }

  if (!response.ok) {
    const error = new Error(`FINN API svarte med HTTP ${response.status}.`);
    error.code = 'FINN_UPSTREAM';
    error.status = response.status;
    throw error;
  }

  const xml = await response.text();
  return {
    cars: parseSearchFeed(xml),
    xml
  };
}

async function searchInventory(apiKey, orgId, options) {
  if (!apiKey) {
    const error = new Error('FINN API-nøkkel er ikke konfigurert.');
    error.code = 'FINN_NOT_CONFIGURED';
    throw error;
  }

  if (!orgId) {
    const error = new Error('FINN orgId er ikke konfigurert.');
    error.code = 'FINN_NOT_CONFIGURED';
    throw error;
  }

  const refresh = !!options.refresh;
  const searchOptions = { ...options };
  delete searchOptions.refresh;

  if (refresh) adDetailCache.clear();

  const cacheKey = JSON.stringify({ orgId, options: searchOptions });
  const now = Date.now();
  if (
    !refresh
    && inventoryCache.key === cacheKey
    && inventoryCache.data
    && now - inventoryCache.fetchedAt < CACHE_TTL_MS
  ) {
    return summarizeInventoryPayload({
      ...inventoryCache.data,
      cached: true,
      cacheExpiresAt: new Date(inventoryCache.fetchedAt + CACHE_TTL_MS).toISOString()
    });
  }

  const firstPage = await fetchSearchPage(apiKey, orgId, searchOptions);
  let cars = firstPage.cars;

  const totalMatch = firstPage.xml.match(/<(?:os|opensearch):totalResults>(\d+)<\/(?:os|opensearch):totalResults>/i);
  const totalResults = totalMatch ? Number(totalMatch[1]) : cars.length;

  if (totalResults > cars.length && cars.length >= MAX_ROWS) {
    let page = 2;
    while (page <= 50 && cars.length < totalResults) {
      const next = await fetchSearchPage(apiKey, orgId, { ...searchOptions, page, rows: MAX_ROWS });
      if (!next.cars.length) break;
      cars = cars.concat(next.cars);
      page += 1;
    }
  }

  const payload = {
    cars,
    total: totalResults || cars.length,
    updatedAt: new Date().toISOString(),
    cached: false,
    cacheExpiresAt: new Date(now + CACHE_TTL_MS).toISOString()
  };

  inventoryCache = {
    key: cacheKey,
    fetchedAt: now,
    data: payload
  };

  return summarizeInventoryPayload(payload);
}

function summarizeInventoryPayload(payload) {
  const cars = Array.isArray(payload?.cars) ? payload.cars : [];
  let soldCount = 0;

  cars.forEach(function (car) {
    if (car.sold) soldCount += 1;
  });

  const sorted = [...cars].sort(function (a, b) {
    const aSold = a.sold ? 1 : 0;
    const bSold = b.sold ? 1 : 0;
    if (aSold !== bSold) return aSold - bSold;
    const aTime = Date.parse(a.published || '') || 0;
    const bTime = Date.parse(b.published || '') || 0;
    return bTime - aTime;
  });

  return {
    ...payload,
    cars: sorted,
    total: sorted.length,
    availableCount: sorted.length - soldCount,
    soldCount
  };
}

function normalizeAdBlock(xml) {
  const entry = xml.match(/<entry\b[\s\S]*?<\/entry>/i);
  return entry ? entry[0] : xml;
}

function formatSpecValue(name, value) {
  if (!value) return '';
  if (name === 'mileage') {
    const km = Number(String(value).replace(/\D/g, ''));
    return Number.isFinite(km) ? `${km.toLocaleString('nb-NO')} km` : value;
  }
  if (name === 'effect') {
    const hp = Number(String(value).replace(/[^\d]/g, ''));
    return Number.isFinite(hp) ? `${hp} hk` : value;
  }
  if (name === 'weight') {
    const kg = Number(String(value).replace(/\D/g, ''));
    return Number.isFinite(kg) ? `${kg.toLocaleString('nb-NO')} kg` : value;
  }
  if (name === 'year') return String(value).slice(0, 4);
  if (name === 'engine_displacement') {
    const raw = String(value).trim().replace(',', '.');
    const liters = Number(raw);
    if (Number.isFinite(liters) && liters > 0 && liters < 20) {
      return `${liters.toLocaleString('nb-NO')} L`;
    }
    const cc = Number(String(value).replace(/\D/g, ''));
    if (Number.isFinite(cc) && cc > 0) {
      return `${cc.toLocaleString('nb-NO')} cm³`;
    }
    return value;
  }
  if (name === 'co2_emission') {
    const g = Number(String(value).replace(/[^\d]/g, ''));
    return Number.isFinite(g) ? `${g.toLocaleString('nb-NO')} g/km` : value;
  }
  if (name === 'doors' || name === 'seats' || name === 'owners') {
    const n = Number(String(value).replace(/\D/g, ''));
    return Number.isFinite(n) ? String(n) : value;
  }
  return value;
}

function specFieldValue(block, name) {
  if (name === 'fuel') {
    return fieldValue(block, 'engine_fuel') || fieldValue(block, 'fuel') || fieldValue(block, 'engine');
  }
  if (name === 'transmission') {
    return fieldValue(block, 'transmission') || fieldValue(block, 'gearbox');
  }
  if (name === 'seats') {
    return fieldValue(block, 'seats') || fieldValue(block, 'number_of_seats');
  }
  if (name === 'exterior_color') {
    return fieldValue(block, 'exterior_color') || fieldValue(block, 'color');
  }
  if (name === 'engine_displacement') {
    return fieldValue(block, 'engine_size')
      || fieldValue(block, 'engine_volume')
      || fieldValue(block, 'displacement')
      || fieldValue(block, 'cylinder_volume')
      || fieldValue(block, 'slagvolum')
      || fieldValue(block, 'engine_displacement');
  }
  if (name === 'co2_emission') {
    return fieldValue(block, 'co2_emission')
      || fieldValue(block, 'co2')
      || fieldValue(block, 'emission_co2')
      || fieldValue(block, 'co2_combined')
      || fieldValue(block, 'co2_emissions');
  }
  if (name === 'doors') {
    return fieldValue(block, 'number_of_doors')
      || fieldValue(block, 'doors')
      || fieldValue(block, 'door_count');
  }
  if (name === 'owners') {
    return fieldValue(block, 'number_of_owners')
      || fieldValue(block, 'owners')
      || fieldValue(block, 'owner_count');
  }
  return fieldValue(block, name);
}

function buildSpecs(block) {
  const specs = [];
  DETAIL_SPEC_ORDER.forEach(function (item) {
    const value = specFieldValue(block, item.key);
    const formatted = formatSpecValue(item.key, value);
    if (formatted) {
      specs.push({ key: item.key, label: item.label, value: formatted });
    }
  });
  return specs;
}

function parseAdBlock(block, fallback) {
  const id = extractFinnId(block) || fallback?.id || null;
  const photos = normalizeCarPhotos(extractImages(block));
  const image = photos[0]?.full || photos[0]?.preview || fallback?.image || '';
  const make = fieldValue(block, 'make') || fallback?.make || '';
  const model = fieldValue(block, 'model') || fallback?.model || '';
  const yearRaw = fieldValue(block, 'year')
    || fieldValue(block, 'regdate')
    || fieldValue(block, 'year_model')
    || fallback?.year
    || '';
  const mileageRaw = fieldValue(block, 'mileage') || fieldValue(block, 'km');
  const mileageParsed = mileageRaw ? Number(String(mileageRaw).replace(/\D/g, '')) : null;
  const mileage = Number.isFinite(mileageParsed) ? mileageParsed : fallback?.mileage ?? null;
  const fuel = fieldValue(block, 'engine_fuel') || fieldValue(block, 'fuel') || fieldValue(block, 'engine') || fallback?.fuel || '';
  const transmission = fieldValue(block, 'transmission') || fieldValue(block, 'gearbox') || fallback?.transmission || '';
  const location = fieldValue(block, 'location') || fieldValue(block, 'city') || fallback?.location || '';
  const price = extractPrice(block) ?? fallback?.price ?? null;
  const title = extractTitle(block) || fallback?.title || [make, model, yearRaw].filter(Boolean).join(' ').trim();
  const modelSpec = extractModelSpec(block, make, model, title) || fallback?.modelSpec || '';
  const description = fieldValue(block, 'description') || fieldValue(block, 'general_text') || '';
  const apiUrl = extractLink(block, 'self') || fallback?.apiUrl || '';
  const finnUrl = extractLink(block, 'alternate') || fallback?.finnUrl || (id ? `https://www.finn.no/mobility/item/${id}` : '');
  const sold = extractDisposed(block) || !!fallback?.sold;

  return {
    id,
    url: id ? `/biler/${id}` : '/biler',
    finnUrl,
    apiUrl,
    title,
    make,
    model,
    modelSpec,
    year: yearRaw ? String(yearRaw).slice(0, 4) : '',
    mileage,
    fuel,
    transmission,
    location,
    price,
    image,
    photos,
    images: photos.map(function (photo) { return photo.full; }),
    description,
    specs: buildSpecs(block),
    equipment: extractEquipment(block),
    service: extractServiceInfo(block),
    warranty: extractWarrantyInfo(block),
    updatedAt: new Date().toISOString(),
    sold,
    availability: sold ? 'sold' : 'available'
  };
}

async function finnApiFetch(apiKey, url, method) {
  const response = await fetch(url, {
    method: method || 'GET',
    headers: {
      'x-finn-apikey': apiKey,
      Accept: 'application/atom+xml, application/xml, text/xml, */*',
      'User-Agent': FINN_UA
    },
    redirect: method === 'GET' ? 'follow' : 'manual'
  });

  if (response.status === 401 || response.status === 403) {
    const error = new Error('FINN API-nøkkelen er ugyldig eller mangler tilgang.');
    error.code = 'FINN_AUTH';
    error.status = response.status;
    throw error;
  }

  return response;
}

async function resolveAdUrl(apiKey, id, fallback) {
  if (fallback?.apiUrl) return fallback.apiUrl;

  const templateResponse = await finnApiFetch(apiKey, `https://api.finn.no/iad/ad/${id}`, 'GET');
  if (templateResponse.ok) return templateResponse.url;

  const candidates = [
    `https://cache.api.finn.no/iad/ad/car-norway/${id}`,
    `https://cache.api.finn.no/iad/ad/car-used-sale/${id}`
  ];

  for (const candidate of candidates) {
    const response = await finnApiFetch(apiKey, candidate, 'GET');
    if (response.ok) return candidate;
  }

  return null;
}

async function fetchAdDetail(apiKey, id, fallback) {
  const adUrl = await resolveAdUrl(apiKey, id, fallback);
  if (!adUrl) {
    const error = new Error('Fant ingen bilannonse med denne ID-en.');
    error.code = 'FINN_NOT_FOUND';
    throw error;
  }

  const response = await finnApiFetch(apiKey, adUrl, 'GET');
  if (response.status === 404) {
    const error = new Error('Fant ingen bilannonse med denne ID-en.');
    error.code = 'FINN_NOT_FOUND';
    throw error;
  }

  if (!response.ok) {
    const error = new Error(`FINN API svarte med HTTP ${response.status}.`);
    error.code = 'FINN_UPSTREAM';
    error.status = response.status;
    throw error;
  }

  const xml = await response.text();
  return parseAdBlock(normalizeAdBlock(xml), fallback);
}

function findCachedInventoryCar(id) {
  const cars = inventoryCache.data?.cars || [];
  return cars.find(function (car) { return String(car.id) === String(id); }) || null;
}

async function getCarDetail(apiKey, orgId, id) {
  if (!apiKey || !orgId) {
    const error = new Error('FINN API er ikke konfigurert.');
    error.code = 'FINN_NOT_CONFIGURED';
    throw error;
  }

  if (!id) {
    const error = new Error('Bil-ID mangler.');
    error.code = 'MISSING_ID';
    throw error;
  }

  const cacheKey = String(id);
  const cached = adDetailCache.get(cacheKey);
  const now = Date.now();
  if (cached && now - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.data;
  }

  let fallback = findCachedInventoryCar(id);
  if (!fallback) {
    await searchInventory(apiKey, orgId, {});
    fallback = findCachedInventoryCar(id);
  }

  const detail = await fetchAdDetail(apiKey, id, fallback);
  adDetailCache.set(cacheKey, { fetchedAt: now, data: detail });
  return detail;
}

module.exports = {
  searchInventory,
  getCarDetail,
  parseSearchFeed,
  parseAdBlock,
  extractDisposed,
  summarizeInventoryPayload
};
