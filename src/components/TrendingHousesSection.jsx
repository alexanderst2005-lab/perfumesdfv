import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { optimizeImg } from '../utils/img';

let cachedTrendingHouses = null;

const TrendingHousesSection = () => {
  const [houses, setHouses] = useState(cachedTrendingHouses || []);
  const [loaded, setLoaded] = useState(Boolean(cachedTrendingHouses));
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const trackRef = useRef(null);

  useEffect(() => {
    fetch(`/api/trending-houses?t=${Date.now()}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        if (data.success && Array.isArray(data.houses)) {
          const activeHouses = data.houses.filter(
            h => h.active !== false
          );
          cachedTrendingHouses = activeHouses;
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
    <section className="dfv-trending-houses-section" style={{ backgroundColor: '#ffffff', padding: '1.8rem 0 0' }}>
      <div className="container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.15rem' }}>
        
        {/* ENCABEZADO: EN MÓVIL (IZQUIERDA + < 1/5 >) | EN PC (CENTRADO MÁS GRANDE, SIN 1/5) */}
        <div
          className="dfv-houses-header"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.15rem', gap: '0.5rem', flexWrap: 'nowrap' }}
        >
          <h2
            className="dfv-houses-main-title"
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: 'clamp(1.05rem, 4.2vw, 1.55rem)',
              fontWeight: '600',
              color: '#1a1a1a',
              margin: 0,
              letterSpacing: '-0.3px',
              lineHeight: 1.2,
              whiteSpace: 'nowrap'
            }}
          >
            Casas en tendencia
          </h2>

          {/* Contador y Flechas < 1/5 > SOLO VISIBLE EN MÓVIL */}
          <div className="dfv-houses-controls" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
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

        {/* CONTENEDOR RELATIVO PARA BOTONES FLOTANTES EN PC */}
        <div style={{ position: 'relative' }}>
          {canScrollLeft && (
            <button
              type="button"
              onClick={scrollPrev}
              aria-label="Anterior casa"
              className="dfv-houses-pc-btn dfv-houses-pc-btn--left"
            >
              <ChevronLeft size={20} strokeWidth={1.8} />
            </button>
          )}

          {/* CARRUSEL HORIZONTAL LIMPIO CON TARJETAS DE IGUAL ALTURA */}
          <div 
            ref={trackRef}
            className="dfv-houses-track"
            style={{
              display: 'flex',
              alignItems: 'stretch',
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
              const imgSrc = rawImg ? optimizeImg(rawImg, 800) : '/hero_campaign_4.webp';

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
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  {/* IMAGEN GRANDE 100% COMPLETA SIN RECORTES */}
                  <div 
                    className="dfv-house-img-wrap"
                    style={{
                      position: 'relative',
                      width: '100%',
                      flex: 1,
                      borderRadius: '8px',
                      overflow: 'hidden',
                      backgroundColor: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <img
                      src={imgSrc}
                      alt={house.name}
                      loading="lazy"
                      decoding="async"
                      style={{
                        width: '100%',
                        height: 'auto',
                        objectFit: 'contain',
                        objectPosition: 'center',
                        display: 'block',
                        borderRadius: '8px',
                        transition: 'transform 0.35s ease'
                      }}
                    />
                  </div>

                  {/* NOMBRE SIEMPRE ALINEADO EN LA MISMA LÍNEA HORIZONTAL */}
                  <div style={{ textAlign: 'center', marginTop: 'auto', paddingTop: '14px' }}>
                    <h3 
                      className="dfv-house-title"
                      style={{
                        fontFamily: 'var(--font-serif, "Montserrat", sans-serif)',
                        fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
                        fontWeight: '600',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        color: '#1a1a1a',
                        margin: 0,
                        lineHeight: 1.25
                      }}
                    >
                      {house.name}
                    </h3>
                  </div>
                </Link>
              );
            })}
          </div>

          {(canScrollRight || houses.length > 4) && (
            <button
              type="button"
              onClick={scrollNext}
              aria-label="Siguiente casa"
              className="dfv-houses-pc-btn dfv-houses-pc-btn--right"
            >
              <ChevronRight size={20} strokeWidth={1.8} />
            </button>
          )}
        </div>

        {/* RAYITA DIVISORIA DEBAJO DE CASAS EN TENDENCIA */}
        <div style={{ height: '1px', backgroundColor: '#e8e8e8', marginTop: '1.8rem' }} />

      </div>

      <style>{`
        .dfv-houses-track::-webkit-scrollbar {
          display: none;
        }
        .dfv-houses-pc-btn {
          display: none;
        }

        .dfv-house-card:hover .dfv-house-img-wrap img {
          transform: scale(1.03);
        }

        /* ════ ESTILOS EXCLUSIVOS PARA PC (>= 769px) ════ */
        @media (min-width: 769px) {
          .dfv-trending-houses-section {
            padding: 3rem 0 0 !important;
          }
          .dfv-houses-header {
            justify-content: center !important;
            margin-bottom: 2.2rem !important;
          }
          .dfv-houses-main-title {
            font-size: 2rem !important;
            text-align: center !important;
            letter-spacing: -0.4px !important;
          }
          .dfv-houses-controls {
            display: none !important;
          }
          .dfv-houses-track {
            gap: 22px !important;
          }
          .dfv-house-card {
            flex: 0 0 calc((100% - 44px) / 3.12);
          }
          .dfv-houses-pc-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            position: absolute;
            top: 42%;
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
            transition: background-color 0.2s ease, box-shadow 0.2s ease;
          }
          .dfv-houses-pc-btn:hover {
            background-color: #f8f8f8;
            box-shadow: 0 4px 14px rgba(0, 0, 0, 0.14);
          }
          .dfv-houses-pc-btn--left {
            left: 8px;
          }
          .dfv-houses-pc-btn--right {
            right: 8px;
          }
        }

        @media (max-width: 768px) {
          .dfv-house-card {
            flex: 0 0 calc((100% - 32px) / 3);
          }
        }

        @media (max-width: 640px) {
          .dfv-house-card {
            flex: 0 0 calc(47.5% - 4px);
          }
          .dfv-houses-track {
            gap: 10px !important;
          }
        }
      `}</style>
    </section>
  );
};

export default TrendingHousesSection;
