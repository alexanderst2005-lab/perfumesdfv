/**
 * Devuelve la URL de Cloudinary optimizada (ancho, formato y calidad automáticos).
 * Si la URL no es de Cloudinary o ya trae transformaciones, la devuelve igual.
 */
export const optimizeImg = (url, width = 500) => {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('/image/upload/') || url.includes('/image/upload/w_') || url.includes('/image/upload/f_')) return url;
  return url.replace('/image/upload/', `/image/upload/w_${width},f_auto,q_auto/`);
};

/** Descarga la imagen grande en segundo plano (p. ej. al pasar el mouse sobre una tarjeta). */
export const prefetchImg = (url, width = 900) => {
  if (!url || typeof window === 'undefined') return;
  const img = new Image();
  img.src = optimizeImg(url, width);
};
