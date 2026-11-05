import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from '../pages/Home';

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const STORAGE_KEY = 'dfv_most_wanted_selection_v2';

const MostWantedCarousel = ({ products = [], onFav, isFavorite, onAdd }) => {
  const trackRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState([]);

  const candidateProducts = useMemo(() => {
    return products.filter(p => p.isMostWanted && p.active !== false && p.inStock !== false);
  }, [products]);

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
          .map(id => candidateProducts.find(p => String(p.id) === String(id)))
          .filter(Boolean);

        if (matched.length > 0) {
          setSelectedProducts(matched);
          return;
        }
      }
    } catch {}

    const shuffled = shuffleArray(candidateProducts).slice(0, 12);
    setSelectedProducts(shuffled);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(shuffled.map(p => p.id)));
    } catch {}
  }, [candidateProducts]);

  const updatePagination = () => {
    const el = trackRef.current;
    if (!el) return;

    const scrollLeft = el.scrollLeft;
    const scrollWidth = el.scrollWidth;
    const clientWidth = el.clientWidth;

    setCanScrollLeft(scrollLeft > 8);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 8);

    const maxScroll = Math.max(1, scrollWidth - clientWidth);
    const pages = Math.max(1, Math.round(scrollWidth / clientWidth));
    setTotalPages(pages);

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

  if (selectedProducts.length === 0) {
    return null;
  }

  return (
    <section className="dfv-most-wanted-section" style={{ backgroundColor: '#ffffff', padding: '2rem 0 0' }}>
      <div className="container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.15rem' }}>
        
        {/* ENCABEZADO: EN MÓVIL (IZQUIERDA + < 1/6 >) | EN PC (CENTRADO Y MÁS GRANDE, SIN 1/2) */}
        <div 
          className="dfv-mw-header"
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '1.15rem',
            width: '100%',
            gap: '0.5rem',
            flexWrap: 'nowrap'
          }}
        >
          <h2 className="dfv-section-inline-title">
            Los más deseados del mes
          </h2>

          {/* Contador < 1/6 > SOLO VISIBLE EN MÓVIL */}
          <div 
            className="dfv-mw-controls"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.35rem',
              flexShrink: 0
            }}
          >
            <button 
              onClick={scrollPrev}
              aria-label="Anterior perfume"
              style={{
                background: 'transparent',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#1a1a1a',
                padding: '2px'
              }}
            >
              <ChevronLeft size={17} strokeWidth={1.75} />
            </button>

            <span style={{ 
              fontFamily: "'Montserrat', sans-serif", 
              fontSize: '0.8rem', 
              color: '#1a1a1a', 
              fontWeight: '500',
              letterSpacing: '0.3px',
              whiteSpace: 'nowrap'
            }}>
              {currentPage}/{totalPages}
            </span>

            <button 
              onClick={scrollNext}
              aria-label="Siguiente perfume"
              style={{
                background: 'transparent',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#1a1a1a',
                padding: '2px'
              }}
            >
              <ChevronRight size={17} strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {/* CONTENEDOR RELATIVO PARA BOTONES FLOTANTES EN PC */}
        <div style={{ position: 'relative' }}>
          {/* Botón Izquierdo PC estilo Imagen 2 */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={scrollPrev}
              aria-label="Anterior"
              className="dfv-pc-slider-btn dfv-pc-slider-btn--left"
            >
              <ChevronLeft size={20} strokeWidth={1.8} />
            </button>
          )}

          {/* TRACK DE PRODUCTOS CON SCROLL-SNAP */}
          <div 
            ref={trackRef}
            className="dfv-mw-carousel-track"
            style={{
              display: 'flex',
              gap: '14px',
              overflowX: 'auto',
              scrollSnapType: 'x mandatory',
              scrollBehavior: 'smooth',
              WebkitOverflowScrolling: 'touch',
              paddingBottom: '0.5rem',
              scrollbarWidth: 'none'
            }}
          >
            {selectedProducts.map((p, idx) => (
              <div 
                key={p.id} 
                className="dfv-mw-card-wrapper"
                style={{
                  scrollSnapAlign: 'start',
                  boxSizing: 'border-box'
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

          {/* Botón Derecho PC estilo Imagen 2 */}
          {(canScrollRight || selectedProducts.length > 4) && (
            <button
              type="button"
              onClick={scrollNext}
              aria-label="Siguiente"
              className="dfv-pc-slider-btn dfv-pc-slider-btn--right"
            >
              <ChevronRight size={20} strokeWidth={1.8} />
            </button>
          )}
        </div>

        {/* RAYITA DIVISORIA DEBAJO DE LOS MÁS DESEADOS DEL MES */}
        <div style={{ height: '1px', backgroundColor: '#e8e8e8', marginTop: '1.6rem' }} />

      </div>

      <style>{`
        .dfv-mw-carousel-track::-webkit-scrollbar {
          display: none;
        }
        .dfv-section-inline-title {
          font-family: 'Montserrat', sans-serif;
          font-size: clamp(1.02rem, 4.1vw, 1.55rem);
          font-weight: 600;
          color: #1a1a1a;
          margin: 0;
          letter-spacing: -0.3px;
          line-height: 1.2;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .dfv-pc-slider-btn {
          display: none;
        }

        /* ════ ESTILOS EXCLUSIVOS PARA PC (>= 769px) ════ */
        @media (min-width: 769px) {
          .dfv-most-wanted-section {
            padding: 3rem 0 0 !important;
          }
          .dfv-mw-header {
            justify-content: center !important;
            margin-bottom: 2.2rem !important;
          }
          .dfv-section-inline-title {
            font-size: 2rem !important;
            text-align: center !important;
            letter-spacing: -0.4px !important;
          }
          .dfv-mw-controls {
            display: none !important;
          }
          .dfv-mw-carousel-track {
            gap: 20px !important;
          }
          .dfv-mw-card-wrapper {
            flex: 0 0 calc((100% - 60px) / 4.12);
          }
          .dfv-pc-slider-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            position: absolute;
            top: 38%;
            transform: translateY(-50%);
            width: 44px;
            height: 44px;
            background-color: #ffffff;
            border: 1px solid #d9d9d9;
            border-radius: 3px;
            color: #1a1a1a;
            cursor: pointer;
            z-index: 15;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
            transition: background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
          }
          .dfv-pc-slider-btn:hover {
            background-color: #f8f8f8;
            box-shadow: 0 4px 14px rgba(0, 0, 0, 0.14);
          }
          .dfv-pc-slider-btn--left {
            left: 8px;
          }
          .dfv-pc-slider-btn--right {
            right: 8px;
          }
        }

        @media (max-width: 768px) {
          .dfv-mw-card-wrapper {
            flex: 0 0 calc((100% - 28px) / 3);
          }
        }
        @media (max-width: 640px) {
          .dfv-most-wanted-section {
            padding: 1.6rem 0 0 !important;
          }
          .dfv-mw-card-wrapper {
            flex: 0 0 calc((100% - 12px) / 2.12) !important;
            min-width: 145px !important;
          }
          .dfv-mw-carousel-track {
            gap: 12px !important;
          }
        }
        @media (max-width: 375px) {
          .dfv-section-inline-title {
            font-size: 0.96rem !important;
          }
        }
      `}</style>
    </section>
  );
};

export default MostWantedCarousel;
