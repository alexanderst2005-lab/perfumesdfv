import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { optimizeImg } from '../utils/img';

const DEFAULT_HOUSES = [
  { id: 'lattafa', name: 'Lattafa', product_count: 14, image: '/hero_campaign_1.webp' },
  { id: 'afnan', name: 'Afnan', product_count: 9, image: '/hero_campaign_2.webp' },
  { id: 'armaf', name: 'Armaf', product_count: 11, image: '/hero_campaign_3.webp' },
  { id: 'al-haramain', name: 'Al Haramain', product_count: 8, image: '/hero_campaign_1_m.webp' }
];

const TrendingHousesSection = () => {
  const [houses, setHouses] = useState(DEFAULT_HOUSES);
  const [loaded, setLoaded] = useState(false);
  const trackRef = useRef(null);

  useEffect(() => {
    fetch('/api/trending-houses')
      .then(r => r.json())
      .then(data => {
        if (data.success && Array.isArray(data.houses)) {
          const activeWithProducts = data.houses.filter(
            h => h.active !== false && h.product_count > 0
          );
          if (activeWithProducts.length > 0) {
            setHouses(activeWithProducts);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const scrollPrev = () => {
    if (!trackRef.current) return;
    trackRef.current.scrollBy({ left: -320, behavior: 'smooth' });
  };

  const scrollNext = () => {
    if (!trackRef.current) return;
    trackRef.current.scrollBy({ left: 320, behavior: 'smooth' });
  };

  if (houses.length === 0) {
    return null;
  }

  return (
    <section className="dfv-trending-houses-section" style={{ backgroundColor: '#ffffff', padding: '3.5rem 0' }}>
      <div className="container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.25rem' }}>
        
        {/* ENCABEZADO CON CONTROLES */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontFamily: 'var(--font-sans, "Montserrat", sans-serif)', fontSize: '0.68rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#B99A5B', fontWeight: '700', display: 'block', marginBottom: '0.35rem' }}>
              DISTINCIÓN & PRESTIGIO
            </span>
            <h2 style={{ fontFamily: 'var(--font-serif, "Playfair Display", Georgia, serif)', fontSize: 'clamp(1.4rem, 2.8vw, 1.95rem)', fontWeight: '400', color: '#111111', margin: 0, letterSpacing: '0.5px' }}>
              CASAS EN TENDENCIA
            </h2>
          </div>

          {/* Flechas de navegación */}
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button 
              onClick={scrollPrev}
              aria-label="Anterior casa"
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
              aria-label="Siguiente casa"
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

        {/* CARRUSEL HORIZONTAL */}
        <div 
          ref={trackRef}
          className="dfv-houses-track"
          style={{
            display: 'flex',
            gap: '1.5rem',
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
          {houses.map((house) => {
            const imgSrc = house.image ? optimizeImg(house.image, 600) : '/hero_campaign_4.webp';

            return (
              <Link
                key={house.id}
                to={`/tienda?casa=${house.id}`}
                className="dfv-house-card"
                style={{
                  flex: '0 0 calc((100% - 4.5rem) / 4)',
                  scrollSnapAlign: 'start',
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div 
                  className="dfv-house-img-wrap"
                  style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '16/10',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    backgroundColor: '#111111',
                    border: '1px solid #EAE6DF',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
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
                      display: 'block',
                      transition: 'transform 0.4s ease'
                    }}
                  />
                  {/* Overlay sutil */}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)' }} />
                </div>

                <div style={{ textAlign: 'center', marginTop: '0.85rem' }}>
                  <h3 
                    className="dfv-house-title"
                    style={{
                      fontFamily: 'var(--font-serif, "Playfair Display", Georgia, serif)',
                      fontSize: '1rem',
                      fontWeight: '500',
                      letterSpacing: '1px',
                      color: '#111111',
                      margin: '0 0 0.2rem 0',
                      transition: 'color 0.2s ease'
                    }}
                  >
                    {house.name}
                  </h3>
                  <span style={{ fontSize: '0.7rem', color: '#888888', letterSpacing: '0.5px' }}>
                    {house.product_count} {house.product_count === 1 ? 'fragancia' : 'fragancias'}
                  </span>
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

        .dfv-house-card:hover .dfv-house-img-wrap {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.12);
          border-color: #B99A5B;
        }

        .dfv-house-card:hover .dfv-house-img-wrap img {
          transform: scale(1.05);
        }

        .dfv-house-card:hover .dfv-house-title {
          color: #B99A5B;
        }

        @media (max-width: 1024px) {
          .dfv-house-card {
            flex: 0 0 calc((100% - 3rem) / 3) !important;
          }
        }

        @media (max-width: 640px) {
          .dfv-house-card {
            flex: 0 0 72% !important;
          }
        }
      `}</style>
    </section>
  );
};

export default TrendingHousesSection;

