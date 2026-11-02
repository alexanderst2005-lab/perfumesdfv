const LOCAL_WEBP_MAP = {
  '/sede_calle31.jpg': '/sede_calle31.webp',
  '/sede_llanogrande.jpg': '/sede_llanogrande.webp',
  '/hero.jpg': '/hero.webp',
  '/logo.png': '/logo.webp',
  '/addi.png': '/addi.webp',
  '/sistecredito.png': '/sistecredito.webp',
  '/bold.png': '/bold.webp'
};

/**
 * Devuelve la URL optimizada según el proveedor (Cloudinary, Unsplash o Local WebP).
 * Aplica compresión inteligente (q_auto:good / f_auto), ancho exacto y modo c_limit.
 */
export const optimizeImg = (url, width = 400) => {
  if (!url || typeof url !== 'string') return url;

  // Si es una imagen local que ya convertimos a WebP
  if (LOCAL_WEBP_MAP[url]) {
    return LOCAL_WEBP_MAP[url];
  }

  // Cloudinary
  if (url.includes('/image/upload/')) {
    if (url.includes('/image/upload/w_') || url.includes('/image/upload/f_')) return url;
    return url.replace('/image/upload/', `/image/upload/f_auto,q_auto:good,w_${width},c_limit/`);
  }

  // Unsplash
  if (url.includes('images.unsplash.com')) {
    try {
      const u = new URL(url);
      u.searchParams.set('w', String(width));
      u.searchParams.set('auto', 'format');
      u.searchParams.set('q', '75');
      return u.toString();
    } catch (e) {
      return url;
    }
  }

  return url;
};

/** Descarga la imagen en segundo plano (al pasar el mouse o foco sobre una tarjeta). */
export const prefetchImg = (url, width = 750) => {
  if (!url || typeof window === 'undefined') return;
  const img = new Image();
  img.src = optimizeImg(url, width);
};

