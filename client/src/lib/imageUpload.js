export const UPLOAD_LIMITS = {
  maxFiles: 8,
  maxFileBytes: 15 * 1024 * 1024,
  maxTotalPayloadBytes: 3.2 * 1024 * 1024,
  maxDimension: 1600,
  jpegQuality: 0.82,
};

function scaleDimensions(width, height, maxDimension) {
  const longest = Math.max(width, height);
  if (longest <= maxDimension) return { width, height };
  const scale = maxDimension / longest;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Kunne ikke lese bildefilen.'));
    reader.readAsDataURL(file);
  });
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Kunne ikke behandle bildet.'));
    reader.readAsDataURL(blob);
  });
}

function estimatePayloadBytes(dataUrl) {
  const base64 = String(dataUrl).split(',')[1] || '';
  return Math.ceil(base64.length * 0.75);
}

async function loadImageSource(file) {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file);
    } catch (_err) {
      // Fall through to object URL + Image.
    }
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Kunne ikke lese bildet.'));
      image.src = objectUrl;
    });
    return img;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function compressImageFile(file, limits) {
  if (!String(file.type || '').startsWith('image/')) {
    throw new Error('Kun bildefiler kan lastes opp.');
  }

  const source = await loadImageSource(file);
  const sourceWidth = source.width || source.naturalWidth;
  const sourceHeight = source.height || source.naturalHeight;
  if (!sourceWidth || !sourceHeight) {
    if (typeof source.close === 'function') source.close();
    throw new Error('Kunne ikke lese bildeoppløsningen.');
  }

  const { width, height } = scaleDimensions(sourceWidth, sourceHeight, limits.maxDimension);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    if (typeof source.close === 'function') source.close();
    throw new Error('Kunne ikke behandle bildet i nettleseren.');
  }

  ctx.drawImage(source, 0, 0, width, height);
  if (typeof source.close === 'function') source.close();

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error('Kunne ikke komprimere bildet.'))),
      'image/jpeg',
      limits.jpegQuality
    );
  });

  const data = await blobToDataUrl(blob);
  const name = String(file.name || 'bilde').replace(/\.[^.]+$/u, '') + '.jpg';
  return { name, type: 'image/jpeg', data, payloadBytes: estimatePayloadBytes(data) };
}

async function prepareSingleImage(file, limits) {
  if (file.size <= 180 * 1024 && /^image\/(jpe?g|webp)$/iu.test(file.type || '')) {
    const data = await readFileAsDataUrl(file);
    return {
      name: file.name,
      type: file.type || 'image/jpeg',
      data,
      payloadBytes: estimatePayloadBytes(data),
    };
  }

  try {
    return await compressImageFile(file, limits);
  } catch (_err) {
    if (file.size <= 700 * 1024) {
      const data = await readFileAsDataUrl(file);
      return {
        name: file.name,
        type: file.type || 'application/octet-stream',
        data,
        payloadBytes: estimatePayloadBytes(data),
      };
    }
    throw new Error(
      `Kunne ikke behandle "${file.name}". Lagre bildet som JPG/PNG, eller fjern det og prøv igjen.`
    );
  }
}

export async function prepareUploadImages(files, limits = UPLOAD_LIMITS) {
  const list = Array.from(files || []);
  if (!list.length) return [];

  if (list.length > limits.maxFiles) {
    throw new Error(`Du kan laste opp maks ${limits.maxFiles} bilder.`);
  }

  for (const file of list) {
    if (file.size > limits.maxFileBytes) {
      throw new Error(
        `"${file.name}" er for stort. Velg et mindre bilde (maks ca. ${Math.round(limits.maxFileBytes / 1024 / 1024)} MB).`
      );
    }
  }

  let prepared = await Promise.all(list.map((file) => prepareSingleImage(file, limits)));
  let total = prepared.reduce((sum, item) => sum + item.payloadBytes, 0);

  if (total > limits.maxTotalPayloadBytes) {
    prepared = await Promise.all(
      list.map((file) =>
        prepareSingleImage(file, {
          ...limits,
          maxDimension: 1200,
          jpegQuality: 0.72,
        })
      )
    );
    total = prepared.reduce((sum, item) => sum + item.payloadBytes, 0);
  }

  if (total > limits.maxTotalPayloadBytes) {
    throw new Error(
      'Bildene er for store til å sendes. Fjern noen bilder, eller bruk færre/l mindre bilder, og prøv igjen.'
    );
  }

  return prepared.map(({ name, type, data }) => ({ name, type, data }));
}
