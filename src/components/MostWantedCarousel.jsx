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
        
        {/* ENCABEZADO EN UNA SOLA LÍNEA: Los más deseados del mes + < 1/6 > */}
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

        {/* TRACK DE PRODUCTOS CON SCROLL-SNAP (2 TARJETAS + ASOMO DE LA 3RA EN MÓVIL, 4 EN PC) */}
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

        {/* RAYITA DIVISORIA DEBAJO DE LOS MÁS DESEADOS DEL MES (COMO EN IMAGEN 1) */}
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
        .dfv-mw-card-wrapper {
          flex: 0 0 calc((100% - 42px) / 4);
        }
        @media (max-width: 1024px) {
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
