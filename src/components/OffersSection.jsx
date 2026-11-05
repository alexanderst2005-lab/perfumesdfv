import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../pages/Home';

const OffersSection = () => {
  const { products, activeCampaigns, addToCart, isFavorite, toggleFavorite } = useShop();

  // 1. Productos con descuento del inventario normal
  const inventoryOffers = products.filter(p => p.discount && p.discount > 0);

  // 2. Productos de campañas activas que no estén ya en inventoryOffers
  const shownIds = new Set(inventoryOffers.map(p => p.id));
  const campaignProducts = [];
  (activeCampaigns || []).forEach(campaign => {
    (campaign.products || []).forEach(cp => {
      if (!shownIds.has(cp.product_id) && cp.name) {
        campaignProducts.push({
          id: cp.product_id,
          name: cp.name,
          brand: cp.brand,
          image: cp.image,
          images: cp.images || [],
          price: cp.promo_price,
          oldPrice: cp.ref_price,
          discount: cp.discount_pct,
          inStock: true,
          active: true
        });
        shownIds.add(cp.product_id);
      }
    });
  });

  // Lista final: primero campaña, luego inventario normal
  const offerProducts = [...campaignProducts, ...inventoryOffers];

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

  // Si no hay perfumes en oferta, NO renderizar nada
  if (offerProducts.length === 0) {
    return null;
  }

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
        borderTop: '1px solid #F0ECE6',
        borderBottom: '1px solid #F0ECE6',
        position: 'relative'
      }}
    >
      <div className="container">
        {/* Cabecera con título e indicador de páginas con flechitas: Favoritos en Oferta < 1/3 > */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.6rem',
          gap: '0.75rem'
        }}>
          <h2 style={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: 'clamp(1.25rem, 3.2vw, 1.7rem)',
            fontWeight: '600',
            color: '#1a1a1a',
            margin: 0,
            letterSpacing: '-0.2px',
            lineHeight: 1.2
          }}>
            Favoritos en Oferta
          </h2>

          {/* Controles de paginación con flechitas: < 1/6 > */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            <button
              onClick={prev}
              disabled={currentIndex === 0}
              aria-label="Anterior"
              style={{
                background: 'none',
                border: 'none',
                color: currentIndex === 0 ? '#C5C0B8' : '#1a1a1a',
                cursor: currentIndex === 0 ? 'default' : 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                transition: 'opacity 0.2s'
              }}
            >
              <ChevronLeft size={18} strokeWidth={1.75} />
            </button>

            <span style={{
              fontSize: '0.82rem',
              fontWeight: '500',
              fontFamily: "'Montserrat', sans-serif",
              color: '#1a1a1a',
              letterSpacing: '0.5px',
              whiteSpace: 'nowrap'
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
                color: currentIndex >= maxIndex ? '#C5C0B8' : '#1a1a1a',
                cursor: currentIndex >= maxIndex ? 'default' : 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                transition: 'opacity 0.2s'
              }}
            >
              <ChevronRight size={18} strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {/* Carrusel Contenedor con las MISMAS tarjetas oficiales de DFV Perfumes */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="offers-carousel-wrapper"
          style={{ overflow: 'hidden', paddingBottom: '0.5rem' }}
        >
          <div
            className="offers-carousel-track"
            style={{
              display: 'flex',
              transition: 'transform 0.45s cubic-bezier(0.25, 1, 0.5, 1)',
              transform: `translateX(-${currentIndex * (100 / visibleCount)}%)`
            }}
          >
            {offerProducts.map((p, idx) => (
              <div
                key={p.id}
                className="offers-slide-card"
                style={{
                  flex: `0 0 calc(${100 / visibleCount}% - ${((visibleCount === 2 ? 0.9 : 1.4) * (visibleCount - 1)) / visibleCount}rem)`,
                  boxSizing: 'border-box'
                }}
              >
                <ProductCard
                  product={p}
                  onFav={() => toggleFavorite(p)}
                  fav={isFavorite(p.id)}
                  onAdd={() => addToCart(p, 1, p.sizes?.[0])}
                  priority={idx < 4}
                />
              </div>
            ))}
          </div>
        </div>

        <style>{`
          .offers-carousel-track {
            gap: 1.4rem;
          }
          @media (max-width: 640px) {
            .offers-carousel-track {
              gap: 0.9rem;
            }
          }
        `}</style>

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
