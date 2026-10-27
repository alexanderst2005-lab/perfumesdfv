import React, { useEffect, useRef, useState } from 'react';

/**
 * Renderiza a sus hijos solo cuando el usuario se acerca a esa zona de la página.
 * Evita cargar videos, imágenes y datos de secciones que están muy abajo.
 */
const LazyOnView = ({ children, minHeight = 400, rootMargin = '700px' }) => {
  const ref = useRef(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (show) return undefined;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setShow(true);
      return undefined;
    }
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setShow(true);
        io.disconnect();
      }
    }, { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [show, rootMargin]);

  return <div ref={ref} style={show ? undefined : { minHeight }}>{show ? children : null}</div>;
};

export default LazyOnView;
