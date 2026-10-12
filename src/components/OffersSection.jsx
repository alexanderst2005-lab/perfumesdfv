import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../pages/Home';

const OffersSection = () => {
  const { products, addToCart, isFavorite, toggleFavorite } = useShop();

  // Filtrar exclusivamente los perfumes con descuento activo
  const offerProducts = products.filter(p => p.discount && p.discount > 0);

  // Si no hay perfumes en oferta, NO renderizar nada
  if (offerProducts.length === 0) {
    return null;
  }

  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Cantidad visible según pantalla (en móvil 2 tarjetas como las de la tienda, en PC 4)
  const [visibleCount, setVisibleCount] = useState(4);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setVisibleCount(2);
      } else if (window.innerWidth < 1024) {
        setVisibleCount(3);
      } else {
        setVisibleCount(4);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalPages = Math.max(1, Math.ceil(offerProducts.length / visibleCount));
  const maxIndex = Math.max(0, offerProducts.length - visibleCount);

  const prev = () => {
    setCurrentIndex(prev => Math.max(0, prev - visibleCount));
  };

  const next = () => {
    setCurrentIndex(prev => {
      const target = prev + visibleCount;
      return target > maxIndex ? maxIndex : target;
    });
  };

  const handleTouchStart = (e) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50) next();
    if (distance < -50) prev();
    setTouchStart(0);
    setTouchEnd(0);
  };

  const currentPageNumber = Math.min(
    totalPages,
    Math.floor(currentIndex / visibleCount) + (currentIndex % visibleCount > 0 && Math.floor(currentIndex / visibleCount) + 1 < totalPages ? 2 : 1)
  );

  return (
    <section 
      id="ofertas"
      className="section-padding"
      style={{
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid #EAE8E4',
        borderBottom: '1px solid #EAE8E4',
        position: 'relative'
      }}
    >
      <div className="container">
        {/* Cabecera con título e indicador de páginas con flechitas: Favoritos en Oferta < 1/3 > */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2.5rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <p style={{
              fontSize: '0.68rem',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              color: '#B99A5B',
              fontWeight: '600',
              fontFamily: 'var(--font-sans)',
              marginBottom: '0.3rem'
            }}>
              PRECIOS ESPECIALES
            </p>
            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1.6rem, 3.2vw, 2.2rem)',
              fontWeight: '400',
              color: '#050505',
              margin: 0,
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}>
              Favoritos en Oferta
            </h2>
          </div>

          {/* Controles de paginación con flechitas */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              onClick={prev}
              disabled={currentIndex === 0}
              aria-label="Anterior"
              style={{
                background: 'none',
                border: 'none',
                color: currentIndex === 0 ? '#C5C0B8' : '#050505',
                cursor: currentIndex === 0 ? 'default' : 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                transition: 'opacity 0.2s'
              }}
            >
              <ChevronLeft size={24} strokeWidth={1.5} />
            </button>

            <span style={{
              fontSize: '0.9rem',
              fontWeight: '500',
              fontFamily: 'var(--font-sans)',
              color: '#333',
              letterSpacing: '1px'
            }}>
              {currentPageNumber}/{totalPages || 1}
            </span>

            <button
              onClick={next}
              disabled={currentIndex >= maxIndex}
              aria-label="Siguiente"
              style={{
                background: 'none',
                border: 'none',
                color: currentIndex >= maxIndex ? '#C5C0B8' : '#050505',
                cursor: currentIndex >= maxIndex ? 'default' : 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                transition: 'opacity 0.2s'
              }}
            >
              <ChevronRight size={24} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Carrusel Contenedor con las MISMAS tarjetas oficiales de DFV Perfumes */}
        <div 
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ overflow: 'hidden', paddingBottom: '1rem' }}
        >
          <div 
            style={{
              display: 'flex',
              gap: '2rem 1.5rem',
              transition: 'transform 0.45s cubic-bezier(0.25, 1, 0.5, 1)',
              transform: `translateX(-${currentIndex * (100 / visibleCount)}%)`
            }}
          >
            {offerProducts.map((p) => (
              <div 
                key={p.id}
                style={{
                  flex: `0 0 calc(${100 / visibleCount}% - ${(1.5 * (visibleCount - 1)) / visibleCount}rem)`,
                  boxSizing: 'border-box'
                }}
              >
                <ProductCard
                  product={p}
                  onFav={() => toggleFavorite(p)}
                  fav={isFavorite(p.id)}
                  onAdd={() => addToCart(p, 1, p.sizes?.[0])}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Botón inferior elegante "DESCÚBRELOS AQUÍ" */}
        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <Link
            to="/tienda?category=Ofertas"
            style={{
              display: 'inline-block',
              padding: '1rem 3rem',
              border: '1px solid #050505',
              backgroundColor: 'transparent',
              color: '#050505',
              fontSize: '0.78rem',
              fontWeight: '500',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              textDecoration: 'none',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#050505';
              e.currentTarget.style.color = '#FFFFFF';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#050505';
            }}
          >
            DESCÚBRELOS AQUÍ
          </Link>
        </div>
      </div>
    </section>
  );
};

export default OffersSection;
