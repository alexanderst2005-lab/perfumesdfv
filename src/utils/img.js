/**
 * Optimiza URLs de Cloudinary:
 * - Para miniaturas pequeñas del panel admin (width <= 320): usa f_auto,q_auto,w_{width} (~5KB) para carga instantánea.
 * - Para la tienda y vistas grandes (width > 320): mantiene máxima nitidez (f_auto,q_100) en alta resolución.
 */
export const optimizeImg = (url, width = 1400) => {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('/image/upload/') || url.includes('/image/upload/w_') || url.includes('/image/upload/f_')) return url;
  const numW = Number(width) || 1400;
  if (numW <= 320) {
    return url.replace('/image/upload/', `/image/upload/f_auto,q_auto,w_${numW},c_limit/`);
  }
  const targetWidth = Math.max(numW, 1200);
  return url.replace('/image/upload/', `/image/upload/f_auto,q_100,w_${targetWidth},c_limit/`);
};

/** Descarga la imagen grande en segundo plano (p. ej. al pasar el mouse sobre una tarjeta). */
export const prefetchImg = (url, width = 1600) => {
  if (!url || typeof window === 'undefined') return;
  const img = new Image();
  img.src = optimizeImg(url, width);
};

/**
 * Prepara una imagen (File, Blob, blob: URL o data: URL) para subirla súper rápido a Cloudinary
 * manteniendo nitidez total (hasta 2000px en WebP/JPEG de alta calidad).
 */
export const prepareImageForUpload = async (input, maxSize = 2000, quality = 0.92) => {
  try {
    let blob;
    if (input instanceof Blob) {
      blob = input;
    } else if (typeof input === 'string') {
      const res = await fetch(input);
      blob = await res.blob();
    } else {
      return input;
    }

    // Si ya es una imagen liviana (< 350 KB) en formato webp/jpeg, leer directo sin re-codificar
    if (blob.size < 350 * 1024 && (blob.type === 'image/webp' || blob.type === 'image/jpeg')) {
      return await new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result);
        r.onerror = reject;
        r.readAsDataURL(blob);
      });
    }

    if (typeof window !== 'undefined' && window.createImageBitmap) {
      const bmp = await createImageBitmap(blob);
      const scale = Math.min(1, maxSize / Math.max(bmp.width, bmp.height));
      const w = Math.max(1, Math.round(bmp.width * scale));
      const h = Math.max(1, Math.round(bmp.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(bmp, 0, 0, w, h);
      if (bmp.close) bmp.close();

      // WebP es ~35% más liviano que JPEG a igual nitidez y se sube mucho más rápido
      const webp = canvas.toDataURL('image/webp', quality);
      if (webp && webp.startsWith('data:image/webp')) {
        return webp;
      }
      return canvas.toDataURL('image/jpeg', quality);
    }

    // Fallback clásico si createImageBitmap no está disponible
    const objUrl = URL.createObjectURL(blob);
    try {
      const img = await new Promise((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = reject;
        el.src = objUrl;
      });
      const scale = Math.min(1, maxSize / Math.max(img.naturalWidth, img.naturalHeight));
      const w = Math.max(1, Math.round(img.naturalWidth * scale));
      const h = Math.max(1, Math.round(img.naturalHeight * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, w, h);
      return canvas.toDataURL('image/jpeg', quality);
    } finally {
      URL.revokeObjectURL(objUrl);
    }
  } catch {
    if (input instanceof Blob) {
      return await new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result);
        r.onerror = reject;
        r.readAsDataURL(input);
      });
    }
    return input;
  }
};

/**
 * Sube un File/Blob/URL a Cloudinary a través de /api/admin/upload de forma ultra rápida.
 */
export const uploadAdminImage = async (fileOrUrl, maxSize = 2000, quality = 0.92) => {
  const prepared = await prepareImageForUpload(fileOrUrl, maxSize, quality);
  const res = await fetch('/api/admin/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: prepared })
  });
  let data = {};
  try {
    data = await res.json();
  } catch {
    throw new Error(`Error del servidor (${res.status})`);
  }
  if (!res.ok || !data.url) {
    throw new Error(data.details || data.error || `Error ${res.status}`);
  }
  return data.url;
};
