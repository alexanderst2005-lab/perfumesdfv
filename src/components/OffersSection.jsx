import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../pages/Home';

const OffersSection = () => {
  const { products, activeCampaigns, addToCart, isFavorite, toggleFavorite } = useShop();
  const trackRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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
  }, [offerProducts.length]);

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

  if (offerProducts.length === 0) {
    return null;
  }

  return (
    <section
      id="ofertas"
      className="dfv-offers-section"
      style={{
        backgroundColor: '#FFFFFF',
        padding: '2rem 0 0',
        position: 'relative'
      }}
    >
      <div className="container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.15rem' }}>
        {/* Cabecera en una sola línea: Favoritos en Oferta + < 1/6 > */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.15rem',
          gap: '0.5rem',
          flexWrap: 'nowrap'
        }}>
          <h2 style={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: 'clamp(1.05rem, 4.2vw, 1.55rem)',
            fontWeight: '600',
            color: '#1a1a1a',
            margin: 0,
            letterSpacing: '-0.3px',
            lineHeight: 1.2,
            whiteSpace: 'nowrap'
          }}>
            Favoritos en Oferta
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
            <button
              onClick={scrollPrev}
              aria-label="Anterior"
              style={{
                background: 'none',
                border: 'none',
                color: '#1a1a1a',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <ChevronLeft size={17} strokeWidth={1.75} />
            </button>

            <span style={{
              fontSize: '0.8rem',
              fontWeight: '500',
              fontFamily: "'Montserrat', sans-serif",
              color: '#1a1a1a',
              letterSpacing: '0.3px',
              whiteSpace: 'nowrap'
            }}>
              {currentPage}/{totalPages}
            </span>

            <button
              onClick={scrollNext}
              aria-label="Siguiente"
              style={{
                background: 'none',
                border: 'none',
                color: '#1a1a1a',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <ChevronRight size={17} strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {/* Track de productos con scroll-snap (2 tarjetas + asomo de la 3ra en móvil, 4 en PC) */}
        <div
          ref={trackRef}
          className="dfv-offers-track"
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
          {offerProducts.map((p, idx) => (
            <div
              key={p.id}
              className="dfv-offer-card-wrap"
              style={{
                scrollSnapAlign: 'start',
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

        {/* Botón inferior estilo Imagen 3: DESCÚBRELOS AQUÍ */}
        <div style={{ textAlign: 'center', marginTop: '1.6rem' }}>
          <Link
            to="/tienda?category=Ofertas"
            style={{
              display: 'inline-block',
              padding: '13px 28px',
              border: '1.5px solid #1a1a1a',
              borderRadius: '2px',
              backgroundColor: '#FFFFFF',
              color: '#1a1a1a',
              fontFamily: "'Montserrat', sans-serif",
              fontSize: '0.8rem',
              fontWeight: '500',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              transition: 'all 0.25s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#1a1a1a';
              e.currentTarget.style.color = '#FFFFFF';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
              e.currentTarget.style.color = '#1a1a1a';
            }}
          >
            DESCÚBRELOS AQUÍ
          </Link>
        </div>

        {/* Rayita divisoria debajo de Favoritos en Oferta */}
        <div style={{ height: '1px', backgroundColor: '#e8e8e8', marginTop: '1.8rem' }} />
      </div>

      <style>{`
        .dfv-offers-track::-webkit-scrollbar {
          display: none;
        }
        .dfv-offer-card-wrap {
          flex: 0 0 calc((100% - 42px) / 4);
        }
        @media (max-width: 1024px) {
          .dfv-offer-card-wrap {
            flex: 0 0 calc((100% - 28px) / 3);
          }
        }
        @media (max-width: 640px) {
          .dfv-offers-section {
            padding: 1.6rem 0 0 !important;
          }
          .dfv-offer-card-wrap {
            flex: 0 0 calc((100% - 12px) / 2.12) !important;
            min-width: 145px !important;
          }
          .dfv-offers-track {
            gap: 12px !important;
          }
        }
      `}</style>
    </section>
  );
};

export default OffersSection;
