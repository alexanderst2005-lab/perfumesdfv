import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, Star } from 'lucide-react';
import { useShop } from '../context/ShopContext';

const OffersSection = () => {
  const { products, addToCart, isFavorite, toggleFavorite } = useShop();

  // Filtrar exclusivamente los productos con descuento activo
  const offerProducts = products.filter(p => p.discount && p.discount > 0);

  // Si NO hay ningún perfume en oferta, no renderizar nada (solicitud explícita)
  if (offerProducts.length === 0) {
    return null;
  }

  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Cantidad visible según viewport
  const [visibleCount, setVisibleCount] = useState(4);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setVisibleCount(2); // 2 tarjetas en móvil como en la foto de referencia
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

  const totalPages = Math.ceil(offerProducts.length / visibleCount);
  const maxIndex = Math.max(0, offerProducts.length - visibleCount);

  const prev = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const next = () => {
    setCurrentIndex(prev => Math.min(maxIndex, prev + 1));
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

  const currentPageNumber = Math.min(totalPages, Math.floor(currentIndex / visibleCount) + 1);

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
        {/* Cabecera con título e indicador de páginas con flechitas (Igual a la imagen: Favoritos en Oferta < 1/6 >) */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              fontWeight: '600',
              color: '#050505',
              margin: 0,
              letterSpacing: '-0.3px'
            }}>
              Favoritos en Oferta
            </h2>
          </div>

          {/* Controles de paginación y flechitas tipo < 1/6 > */}
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
              <ChevronLeft size={22} strokeWidth={1.8} />
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
              <ChevronRight size={22} strokeWidth={1.8} />
            </button>
          </div>
        </div>

        {/* Carrusel Contenedor */}
        <div 
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ overflow: 'hidden', paddingBottom: '1rem' }}
        >
          <div 
            style={{
              display: 'flex',
              gap: '1.2rem',
              transition: 'transform 0.45s cubic-bezier(0.25, 1, 0.5, 1)',
              transform: `translateX(-${currentIndex * (100 / visibleCount)}%)`
            }}
          >
            {offerProducts.map((p) => {
              // Calcular cuotas Addi de ejemplo (3 cuotas)
              const addiQuota = Math.round(p.price / 3);

              return (
                <div 
                  key={p.id}
                  style={{
                    flex: `0 0 calc(${100 / visibleCount}% - ${(1.2 * (visibleCount - 1)) / visibleCount}rem)`,
                    boxSizing: 'border-box'
                  }}
                >
                  <div className="offer-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    {/* Imagen con Badge de Descuento y Botón Plus */}
                    <div style={{
                      position: 'relative',
                      aspectRatio: '1/1',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      backgroundColor: '#F7F5F0',
                      marginBottom: '1rem'
                    }}>
                      <Link to={`/producto/${p.id}`} style={{ display: 'block', width: '100%', height: '100%' }}>
                        <img 
                          src={p.image} 
                          alt={p.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.5s ease'
                          }}
                          className="offer-card-img"
                        />
                      </Link>

                      {/* Badge Rojo Redondeado idéntico al screenshot: -15% OFF */}
                      <span style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        backgroundColor: '#FF0022',
                        color: '#FFFFFF',
                        fontWeight: '700',
                        fontSize: '0.68rem',
                        letterSpacing: '0.5px',
                        padding: '5px 10px',
                        borderRadius: '20px',
                        boxShadow: '0 2px 8px rgba(255, 0, 34, 0.35)'
                      }}>
                        -{p.discount}% OFF
                      </span>

                      {/* Botón Circular "+" de agregar rápido */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          addToCart(p, 1, p.sizes?.[0]);
                        }}
                        aria-label={`Agregar ${p.name}`}
                        style={{
                          position: 'absolute',
                          bottom: '12px',
                          right: '12px',
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          backgroundColor: '#FFFFFF',
                          border: '1px solid rgba(0,0,0,0.08)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                          transition: 'transform 0.2s, background-color 0.2s'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.transform = 'scale(1.1)';
                          e.currentTarget.style.backgroundColor = '#111';
                          e.currentTarget.style.color = '#fff';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.backgroundColor = '#fff';
                          e.currentTarget.style.color = '#111';
                        }}
                      >
                        <Plus size={18} strokeWidth={2} />
                      </button>
                    </div>

                    {/* Información del Producto */}
                    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                      <Link to={`/producto/${p.id}`} style={{ textDecoration: 'none' }}>
                        <h3 style={{
                          fontFamily: 'var(--font-sans)',
                          fontSize: '0.88rem',
                          fontWeight: '600',
                          color: '#111',
                          lineHeight: '1.35',
                          marginBottom: '0.4rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.3px',
                          height: '2.5em',
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}>
                          {p.name}
                        </h3>
                      </Link>

                      {/* Estrellas y rating de ejemplo */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '0.5rem' }}>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} fill="#050505" color="#050505" />
                        ))}
                        <span style={{ fontSize: '0.72rem', color: '#777', marginLeft: '4px' }}>(12)</span>
                      </div>

                      {/* Precios: Tachado + Oferta Actual */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                        {p.oldPrice && (
                          <span style={{
                            fontSize: '0.82rem',
                            textDecoration: 'line-through',
                            color: '#999',
                            fontFamily: 'var(--font-sans)',
                            fontWeight: '400'
                          }}>
                            ${p.oldPrice.toLocaleString()}
                          </span>
                        )}
                        <span style={{
                          fontSize: '1rem',
                          fontWeight: '700',
                          color: '#050505',
                          fontFamily: 'var(--font-sans)'
                        }}>
                          ${p.price.toLocaleString()}
                        </span>
                      </div>

                      {/* Cuotas Addi estilo referencia */}
                      <p style={{
                        fontSize: '0.72rem',
                        color: '#666',
                        fontFamily: 'var(--font-sans)',
                        margin: 0
                      }}>
                        3 cuotas de <strong style={{ color: '#111' }}>${addiQuota.toLocaleString()}</strong> con <span style={{ color: '#0052FF', fontWeight: '700' }}>Addi</span>
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Botón inferior grande como en la captura: "DESCÚBRELOS AQUÍ" */}
        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <Link
            to="/tienda?category=Ofertas"
            style={{
              display: 'inline-block',
              padding: '1rem 3rem',
              border: '1.5px solid #050505',
              backgroundColor: 'transparent',
              color: '#050505',
              fontSize: '0.8rem',
              fontWeight: '600',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              textDecoration: 'none',
              borderRadius: '4px',
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

      <style>{`
        .offer-card:hover .offer-card-img {
          transform: scale(1.05);
        }
      `}</style>
    </section>
  );
};

export default OffersSection;
