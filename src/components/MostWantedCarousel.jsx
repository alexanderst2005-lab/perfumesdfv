import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../pages/Home';

// Función para mezclar aleatoriamente un arreglo (Fisher-Yates)
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const STORAGE_KEY = 'dfv_most_wanted_selection_v1';

const MostWantedCarousel = ({ products = [], onFav, isFavorite, onAdd }) => {
  const trackRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState([]);

  // Filtrar productos marcados como "Más deseado"
  const candidateProducts = useMemo(() => {
    return products.filter(p => p.isMostWanted && p.active !== false && p.inStock !== false);
  }, [products]);

  // Selección aleatoria estable por sesión
  useEffect(() => {
    if (candidateProducts.length === 0) {
      setSelectedProducts([]);
      return;
    }

    try {
      const cachedIdsJson = sessionStorage.getItem(STORAGE_KEY);
      if (cachedIdsJson) {
        const cachedIds = JSON.parse(cachedIdsJson);
        const matched = cachedIds
          .map(id => candidateProducts.find(p => p.id === id))
          .filter(Boolean);

        // Si la mayoría de los cacheados siguen existiendo, usarlos
        if (matched.length > 0) {
          setSelectedProducts(matched);
          return;
        }
      }
    } catch {
      // Ignorar error de storage
    }

    // Si no hay caché de sesión, mezclar y tomar hasta 12
    const shuffled = shuffleArray(candidateProducts).slice(0, 12);
    setSelectedProducts(shuffled);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(shuffled.map(p => p.id)));
    } catch {}
  }, [candidateProducts]);

  // Calcular páginas y actualizar contador en scroll o resize
  const updatePagination = () => {
    const el = trackRef.current;
    if (!el) return;

    const scrollLeft = el.scrollLeft;
    const scrollWidth = el.scrollWidth;
    const clientWidth = el.clientWidth;

    // Número total de páginas virtuales según el ancho visible
    const maxScroll = Math.max(1, scrollWidth - clientWidth);
    const pages = Math.max(1, Math.round(scrollWidth / clientWidth));
    setTotalPages(pages);

    // Página actual estimada
    const progress = Math.min(1, Math.max(0, scrollLeft / maxScroll));
    const current = Math.min(pages, Math.max(1, Math.round(progress * (pages - 1)) + 1));
    setCurrentPage(current);
  };

  useEffect(() => {
    updatePagination();
    const el = trackRef.current;
    if (!el) return;

    el.addEventListener('scroll', updatePagination, { passive: true });
    window.addEventListener('resize', updatePagination);
    return () => {
      el.removeEventListener('scroll', updatePagination);
      window.removeEventListener('resize', updatePagination);
    };
  }, [selectedProducts]);

  const scrollPrev = () => {
    if (!trackRef.current) return;
    const width = trackRef.current.clientWidth;
    trackRef.current.scrollBy({ left: -width * 0.85, behavior: 'smooth' });
  };

  const scrollNext = () => {
    if (!trackRef.current) return;
    const width = trackRef.current.clientWidth;
    trackRef.current.scrollBy({ left: width * 0.85, behavior: 'smooth' });
  };

  // Si no hay productos marcados, no mostrar la sección
  if (selectedProducts.length === 0) {
    return null;
  }

  return (
    <section className="dfv-most-wanted-section" style={{ backgroundColor: '#ffffff', padding: '3.5rem 0 3rem' }}>
      <div className="container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.25rem' }}>
        
        {/* ENCABEZADO: Título a la izquierda, controles a la derecha */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontFamily: 'var(--font-sans, "Montserrat", sans-serif)', fontSize: '0.68rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#B99A5B', fontWeight: '700', display: 'block', marginBottom: '0.35rem' }}>
              SELECCIÓN EXCLUSIVA
            </span>
            <h2 style={{ fontFamily: 'var(--font-serif, "Playfair Display", serif)', fontSize: 'clamp(1.4rem, 2.8vw, 1.95rem)', fontWeight: '400', color: '#111111', margin: 0, letterSpacing: '0.5px' }}>
              Los más deseados del mes
            </h2>
          </div>

          {/* Flechas y Contador */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <span style={{ fontFamily: 'var(--font-sans, "Montserrat", sans-serif)', fontSize: '0.8rem', color: '#666666', fontWeight: '500', minWidth: '38px', textAlign: 'center' }}>
              {currentPage} / {totalPages}
            </span>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button 
                onClick={scrollPrev}
                aria-label="Anterior perfume"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  border: '1px solid #E5E2DC',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#111111',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#111111'; e.currentTarget.style.backgroundColor = '#FAF8F5'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E2DC'; e.currentTarget.style.backgroundColor = '#ffffff'; }}
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                onClick={scrollNext}
                aria-label="Siguiente perfume"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  border: '1px solid #E5E2DC',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#111111',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#111111'; e.currentTarget.style.backgroundColor = '#FAF8F5'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E2DC'; e.currentTarget.style.backgroundColor = '#ffffff'; }}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* TRACK DE PRODUCTOS CON SCROLL-SNAP */}
        <div 
          ref={trackRef}
          className="dfv-mw-carousel-track"
          style={{
            display: 'flex',
            gap: '1.25rem',
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch',
            paddingBottom: '1rem',
            scrollbarWidth: 'none',
            margin: '0 -0.5rem',
            padding: '0 0.5rem 1rem'
          }}
        >
          {selectedProducts.map((p, idx) => (
            <div 
              key={p.id} 
              className="dfv-mw-card-wrapper"
              style={{
                scrollSnapAlign: 'start',
                flexShrink: 0
              }}
            >
              <ProductCard 
                product={p} 
                onFav={() => onFav(p)} 
                fav={isFavorite(p.id)} 
                onAdd={() => onAdd(p, 1, p.sizes?.[0])}
                priority={idx < 4}
              />
            </div>
          ))}
        </div>

        {/* BOTÓN VER TODOS (ESTILO CONTORNEADO) */}
        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <Link 
            to="/tienda?filtro=deseados"
            style={{
              display: 'inline-block',
              padding: '0.85rem 2.5rem',
              border: '1px solid #111111',
              backgroundColor: 'transparent',
              color: '#111111',
              fontFamily: 'var(--font-sans, "Montserrat", sans-serif)',
              fontSize: '0.75rem',
              fontWeight: '600',
              letterSpacing: '2.5px',
              textTransform: 'uppercase',
              textDecoration: 'none',
              borderRadius: '4px',
              transition: 'all 0.25s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#111111';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#111111';
            }}
          >
            VER TODOS
          </Link>
        </div>

      </div>

      <style>{`
        .dfv-mw-carousel-track::-webkit-scrollbar {
          display: none;
        }

        /* En escritorio: 4 tarjetas visibles */
        .dfv-mw-card-wrapper {
          width: calc((100% - 3.75rem) / 4);
        }

        /* En tablet: 3 tarjetas visibles */
        @media (max-width: 1024px) {
          .dfv-mw-card-wrapper {
            width: calc((100% - 2.5rem) / 3);
          }
        }

        /* En móvil: 2 tarjetas completas + pedacito de la 3ra para invitar a deslizar */
        @media (max-width: 640px) {
          .dfv-mw-card-wrapper {
            width: calc((100% - 2rem) / 2.3);
          }
        }
      `}</style>
    </section>
  );
};

export default MostWantedCarousel;

