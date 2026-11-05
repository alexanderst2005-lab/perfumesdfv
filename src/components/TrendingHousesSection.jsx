import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { optimizeImg } from '../utils/img';

const TrendingHousesSection = () => {
  const [houses, setHouses] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const trackRef = useRef(null);

  useEffect(() => {
    fetch(`/api/trending-houses?t=${Date.now()}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        if (data.success && Array.isArray(data.houses)) {
          const activeHouses = data.houses.filter(
            h => h.active !== false
          );
          setHouses(activeHouses);
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

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
  }, [houses]);

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

  if (!loaded || houses.length === 0) {
    return null;
  }

  return (
    <section className="dfv-trending-houses-section" style={{ backgroundColor: '#ffffff', padding: '2.5rem 0 2rem' }}>
      <div className="container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.25rem' }}>
        
        {/* ENCABEZADO LIMPIO: TÍTULO A LA IZQUIERDA + CONTROLES A LA DERECHA */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.4rem', gap: '0.75rem' }}>
          <h2 style={{
            fontFamily: 'var(--font-serif, "Montserrat", sans-serif)',
            fontSize: 'clamp(1.3rem, 3vw, 1.75rem)',
            fontWeight: '600',
            color: '#1a1a1a',
            margin: 0,
            letterSpacing: '-0.2px',
            lineHeight: 1.2
          }}>
            Casas en tendencia
          </h2>

          {/* Contador y Flechas estilo referencia < 1/5 > */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            <button 
              onClick={scrollPrev}
              aria-label="Anterior casa"
              style={{
                background: 'transparent',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#1a1a1a',
                padding: '4px'
              }}
            >
              <ChevronLeft size={18} strokeWidth={1.75} />
            </button>
            <span style={{
              fontFamily: 'var(--font-sans, "Montserrat", sans-serif)',
              fontSize: '0.82rem',
              color: '#1a1a1a',
              fontWeight: '500',
              letterSpacing: '0.5px',
              whiteSpace: 'nowrap'
            }}>
              {currentPage}/{totalPages}
            </span>
            <button 
              onClick={scrollNext}
              aria-label="Siguiente casa"
              style={{
                background: 'transparent',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#1a1a1a',
                padding: '4px'
              }}
            >
              <ChevronRight size={18} strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {/* CARRUSEL HORIZONTAL LIMPIO */}
        <div 
          ref={trackRef}
          className="dfv-houses-track"
          style={{
            display: 'flex',
            gap: '16px',
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch',
            paddingBottom: '0.5rem',
            scrollbarWidth: 'none'
          }}
        >
          {houses.map((house) => {
            const rawImg = house.image || house.image_url;
            const imgSrc = rawImg ? optimizeImg(rawImg, 700) : '/hero_campaign_4.webp';

            return (
              <Link
                key={house.id}
                to={`/tienda?casa=${house.id}`}
                className="dfv-house-card"
                style={{
                  scrollSnapAlign: 'start',
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* IMAGEN CUADRADA COMPLETA Y LIMPIA */}
                <div 
                  className="dfv-house-img-wrap"
                  style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '1/1',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: '#f4f4f4'
                  }}
                >
                  <img
                    src={imgSrc}
                    alt={house.name}
                    loading="lazy"
                    decoding="async"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center',
                      display: 'block',
                      transition: 'transform 0.35s ease'
                    }}
                  />
                </div>

                {/* SOLO EL NOMBRE DEBAJO EN MAYÚSCULAS Y CENTRADO */}
                <div style={{ textAlign: 'center', marginTop: '14px' }}>
                  <h3 
                    className="dfv-house-title"
                    style={{
                      fontFamily: 'var(--font-serif, "Montserrat", sans-serif)',
                      fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
                      fontWeight: '600',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: '#1a1a1a',
                      margin: 0
                    }}
                  >
                    {house.name}
                  </h3>
                </div>
              </Link>
            );
          })}
        </div>

      </div>

      <style>{`
        .dfv-houses-track::-webkit-scrollbar {
          display: none;
        }

        .dfv-house-card {
          flex: 0 0 calc((100% - 48px) / 4);
        }

        .dfv-house-card:hover .dfv-house-img-wrap img {
          transform: scale(1.03);
        }

        @media (max-width: 1024px) {
          .dfv-house-card {
            flex: 0 0 calc((100% - 32px) / 3);
          }
        }

        @media (max-width: 640px) {
          .dfv-house-card {
            flex: 0 0 calc(46% - 4px);
          }
        }
      `}</style>
    </section>
  );
};

export default TrendingHousesSection;
