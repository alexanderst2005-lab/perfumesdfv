/**
 * Optimiza URLs de Cloudinary en 4 buckets estándar (200, 800, 1400, 2000) con compresión inteligente:
 * - Al compartir exactamente el mismo tamaño (800px) entre las tarjetas del catálogo y la vista detalle,
 *   la foto ya está en la memoria caché del navegador al abrir un producto (carga en 0ms).
 * - Usa f_auto,q_auto:good para reducir el peso un 85% (~30-45KB) manteniendo nitidez Retina total.
 */
export const optimizeImg = (url, width = 800) => {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('/image/upload/') || url.includes('/image/upload/w_') || url.includes('/image/upload/f_')) return url;
  const numW = Number(width) || 800;
  if (numW <= 220) {
    return url.replace('/image/upload/', '/image/upload/f_auto,q_auto,w_200,c_limit/');
  }
  if (numW <= 950) {
    return url.replace('/image/upload/', '/image/upload/f_auto,q_auto:good,w_800,c_limit/');
  }
  if (numW <= 1650) {
    return url.replace('/image/upload/', '/image/upload/f_auto,q_auto:good,w_1400,c_limit/');
  }
  return url.replace('/image/upload/', '/image/upload/f_auto,q_auto:good,w_2000,c_limit/');
};

const prefetchedSet = new Set();
const retainedImages = [];

/** Descarga y decodifica la imagen en memoria RAM en segundo plano para visualización instantánea (0ms). */
export const prefetchImg = (url, width = 800) => {
  if (!url || typeof window === 'undefined') return;
  const finalUrl = optimizeImg(url, width);
  if (!finalUrl || prefetchedSet.has(finalUrl)) return;
  prefetchedSet.add(finalUrl);
  const img = new Image();
  img.decoding = 'async';
  img.src = finalUrl;
  if (typeof img.decode === 'function') {
    img.decode().catch(() => {});
  }
  if (retainedImages.length < 250) {
    retainedImages.push(img);
  }
};

/** Notifica a todas las pestañas abiertas y componentes que hubo un cambio en el panel admin. */
export const notifyStoreSync = (type = 'all', payload = null) => {
  if (typeof window === 'undefined') return;
  try {
    const msg = { type, payload, ts: Date.now() };
    localStorage.setItem('dfv_last_sync', JSON.stringify(msg));
    if (typeof BroadcastChannel !== 'undefined') {
      const bc = new BroadcastChannel('dfv_sync');
      bc.postMessage(msg);
      bc.close();
    }
    window.dispatchEvent(new CustomEvent('dfv-sync', { detail: msg }));
  } catch {}
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
 * Sube un File/Blob/URL a Cloudinary a través de /api/admin/upload de forma ultra rápida
 * y pre-calienta de inmediato en caché las versiones optimizadas para la tienda y el panel.
 */
export const uploadAdminImage = async (fileOrUrl, maxSize = 1600, quality = 0.88) => {
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
  // Pre-calentar en segundo plano en la caché del navegador y CDN de Cloudinary
  prefetchImg(data.url, 200);
  prefetchImg(data.url, 800);
  prefetchImg(data.url, 1400);
  return data.url;
};

/**
 * Obtiene la URL de miniatura (póster JPG) a partir de un video alojado en Cloudinary.
 */
export const getVideoThumbnailUrl = (videoUrl, width = 800) => {
  if (!videoUrl || typeof videoUrl !== 'string') return '';
  if (videoUrl.includes('/video/upload/')) {
    return videoUrl
      .replace('/video/upload/', `/video/upload/so_1,w_${width},c_limit,q_auto,f_jpg/`)
      .replace(/\.[^/.?#]+(\?.*)?$/, '.jpg');
  }
  return '';
};

/**
 * Sube un archivo de video (MP4, MOV, WebM) directamente a Cloudinary usando firma segura
 * para soportar videos sin límite de 4.5MB de Vercel.
 */
export const uploadAdminVideo = async (file, folder = 'dfv_sedes') => {
  if (!file) throw new Error('Archivo de video requerido');

  const signRes = await fetch(`/api/admin/cloudinary-sign?folder=${encodeURIComponent(folder)}`);
  if (!signRes.ok) {
    throw new Error('No se pudo obtener autorización para subir el video');
  }
  const signData = await signRes.json();

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', signData.apiKey);
  formData.append('timestamp', signData.timestamp);
  formData.append('signature', signData.signature);
  formData.append('folder', signData.folder);

  const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${signData.cloudName}/video/upload`, {
    method: 'POST',
    body: formData
  });

  let cloudData = {};
  try {
    cloudData = await cloudRes.json();
  } catch {
    throw new Error('Error de red al subir el video');
  }

  if (!cloudRes.ok || !cloudData.secure_url) {
    throw new Error(cloudData.error?.message || 'Error al subir el video a Cloudinary');
  }

  const videoUrl = cloudData.secure_url;
  const thumbnailUrl = getVideoThumbnailUrl(videoUrl, 800);

  return {
    url: videoUrl,
    thumbnailUrl
  };
};

/**
 * Normaliza la galería multimedia de una sede conservando su imagen principal actual.
 */
export const normalizeSedeGallery = (sede) => {
  if (!sede || typeof sede !== 'object') return [];
  const rawGallery = Array.isArray(sede.gallery) ? sede.gallery : [];
  const cleaned = rawGallery
    .filter(item => item && typeof item.url === 'string' && item.url.trim() !== '')
    .map((item, idx) => {
      const type = item.type === 'video' ? 'video' : 'image';
      return {
        id: item.id || `media-${sede.id || 0}-${idx}-${Date.now()}`,
        type,
        url: item.url,
        thumbnailUrl: type === 'video' ? (item.thumbnailUrl || getVideoThumbnailUrl(item.url, 800)) : item.url,
        isMain: type === 'image' && Boolean(item.isMain)
      };
    });

  // Si la imagen principal actual (sede.img) no está aún en la galería, la incluimos al inicio
  if (sede.img && typeof sede.img === 'string' && sede.img.trim() !== '') {
    const existsIdx = cleaned.findIndex(item => item.type === 'image' && item.url === sede.img);
    if (existsIdx === -1) {
      cleaned.unshift({
        id: `main-${sede.id || 0}`,
        type: 'image',
        url: sede.img,
        thumbnailUrl: sede.img,
        isMain: true
      });
    } else if (!cleaned.some(item => item.type === 'image' && item.isMain)) {
      cleaned[existsIdx].isMain = true;
    }
  }

  // Asegurar que exista exactamente una imagen marcada como principal si hay imágenes
  const firstImgIdx = cleaned.findIndex(item => item.type === 'image');
  if (firstImgIdx !== -1 && !cleaned.some(item => item.type === 'image' && item.isMain)) {
    cleaned[firstImgIdx].isMain = true;
  }

  return cleaned;
};
