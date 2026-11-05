import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
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
          .map(id => candidateProducts.find(p => p.id === id))
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
    <section className="dfv-most-wanted-section" style={{ backgroundColor: '#ffffff', padding: '3rem 0 2.5rem' }}>
      <div className="container" style={{ maxWidth: '1320px', margin: '0 auto', padding: '0 1rem' }}>
        
        {/* ENCABEZADO */}
        <div 
          className="dfv-mw-header"
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-end', 
            marginBottom: '1.4rem',
            position: 'relative',
            width: '100%'
          }}
        >
          {/* Título a la izquierda */}
          <div style={{ flex: 1, minWidth: 0, paddingRight: '0.8rem' }}>
            <span style={{ 
              fontFamily: 'var(--font-sans, "Montserrat", sans-serif)', 
              fontSize: '0.62rem', 
              letterSpacing: '2.5px', 
              textTransform: 'uppercase', 
              color: '#B99A5B', 
              fontWeight: '700', 
              display: 'block', 
              marginBottom: '0.25rem' 
            }}>
              SELECCIÓN EXCLUSIVA
            </span>
            <h2 style={{ 
              fontFamily: 'var(--font-serif, "Playfair Display", serif)', 
              fontSize: 'clamp(1.15rem, 3.2vw, 1.75rem)', 
              fontWeight: '400', 
              color: '#111111', 
              margin: 0, 
              letterSpacing: '0.5px',
              lineHeight: 1.2
            }}>
              Los más deseados del mes
            </h2>
          </div>

          {/* Flechas y Contador a la derecha ESQUINADO Y PEQUEÑO */}
          <div 
            className="dfv-mw-controls"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              flexShrink: 0
            }}
          >
            <span style={{ 
              fontFamily: 'var(--font-sans, "Montserrat", sans-serif)', 
              fontSize: '0.68rem', 
              color: '#888888', 
              fontWeight: '600',
              letterSpacing: '1px',
              paddingRight: '0.2rem',
              whiteSpace: 'nowrap'
            }}>
              {currentPage} / {totalPages}
            </span>

            <div style={{ display: 'flex', gap: '0.3rem' }}>
              <button 
                onClick={scrollPrev}
                aria-label="Anterior perfume"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: '1px solid #E5E2DC',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#111111',
                  transition: 'all 0.2s ease',
                  padding: 0
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#111111'; e.currentTarget.style.backgroundColor = '#F5F5F5'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E2DC'; e.currentTarget.style.backgroundColor = '#ffffff'; }}
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={scrollNext}
                aria-label="Siguiente perfume"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: '1px solid #E5E2DC',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#111111',
                  transition: 'all 0.2s ease',
                  padding: 0
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#111111'; e.currentTarget.style.backgroundColor = '#F5F5F5'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E2DC'; e.currentTarget.style.backgroundColor = '#ffffff'; }}
              >
                <ChevronRight size={16} />
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
            gap: '1rem',
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch',
            paddingBottom: '0.8rem',
            scrollbarWidth: 'none',
            margin: '0 -0.5rem',
            padding: '0 0.5rem 0.8rem'
          }}
        >
          {selectedProducts.map((p, idx) => (
            <div 
              key={p.id} 
              className="dfv-mw-card-wrapper"
              style={{
                flex: '0 0 260px',
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

        {/* BOTÓN VER TODOS */}
        <div style={{ textAlign: 'center', marginTop: '1.8rem' }}>
          <Link
            to="/tienda?filtro=deseados"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.7rem 2.2rem',
              border: '1px solid #111111',
              backgroundColor: 'transparent',
              color: '#111111',
              fontFamily: 'var(--font-sans, "Montserrat", sans-serif)',
              fontSize: '0.72rem',
              fontWeight: '600',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              textDecoration: 'none',
              borderRadius: '2px',
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
        @media (max-width: 1024px) {
          .dfv-mw-card-wrapper {
            flex: 0 0 220px !important;
          }
        }
        @media (max-width: 640px) {
          .dfv-most-wanted-section {
            padding: 3.25rem 0 2.25rem !important;
          }
          .dfv-mw-header {
            align-items: flex-start !important;
            margin-bottom: 1.2rem !important;
          }
          .dfv-mw-controls {
            align-self: flex-start !important;
            margin-top: 0.2rem !important;
          }
          .dfv-mw-card-wrapper {
            flex: 0 0 calc((100% - 1rem) / 2.25) !important; /* 2 tarjetas completas + asomo de la 3ra */
            min-width: 152px !important;
          }
          .dfv-mw-carousel-track {
            gap: 0.85rem !important;
          }
        }
      `}</style>
    </section>
  );
};

export default MostWantedCarousel;
