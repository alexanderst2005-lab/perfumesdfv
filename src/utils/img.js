/**
 * Devuelve la URL de Cloudinary en máxima nitidez (calidad 100% sin pérdida visual).
 * Si la URL no es de Cloudinary o ya trae transformaciones, la devuelve igual.
 */
export const optimizeImg = (url, width = 1400) => {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('/image/upload/') || url.includes('/image/upload/w_') || url.includes('/image/upload/f_')) return url;
  const targetWidth = Math.max(Number(width) || 1400, 1200);
  return url.replace('/image/upload/', `/image/upload/f_auto,q_100,w_${targetWidth},c_limit/`);
};

/** Descarga la imagen grande en segundo plano (p. ej. al pasar el mouse sobre una tarjeta). */
export const prefetchImg = (url, width = 1600) => {
  if (!url || typeof window === 'undefined') return;
  const img = new Image();
  img.src = optimizeImg(url, width);
};
