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
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // 1. Productos con descuento del inventario normal
  const inventoryOffers = products.filter(p => p.discount && p.discount > 0);

  // 2. Productos de campañas activas que no estén ya en inventoryOffers (sincronizados con las fotos actuales del inventario)
  const shownIds = new Set(inventoryOffers.map(p => String(p.id)));
  const campaignProducts = [];
  (activeCampaigns || []).forEach(campaign => {
    (campaign.products || []).forEach(cp => {
      const pid = String(cp.product_id);
      if (!shownIds.has(pid) && cp.name) {
        const liveProd = products.find(p => String(p.id) === pid);
        campaignProducts.push({
          ...(liveProd || {}),
          id: cp.product_id,
          name: liveProd?.name || cp.name,
          brand: liveProd?.brand || cp.brand,
          image: liveProd?.image || cp.image,
          images: liveProd?.images || cp.images || [],
          price: cp.promo_price,
          oldPrice: cp.ref_price,
          discount: cp.discount_pct,
          inStock: liveProd ? liveProd.inStock : true,
          active: true
        });
        shownIds.add(pid);
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
        {/* Cabecera: en móvil (Izquierda + < 1/6 >) | en PC (Centrado más grande, sin 1/1) */}
        <div
          className="dfv-offers-header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.15rem',
            gap: '0.5rem',
            flexWrap: 'nowrap'
          }}
        >
          <h2
            className="dfv-offers-title"
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
            Favoritos en Oferta
          </h2>

          {/* Contador < 1/6 > SOLO VISIBLE EN MÓVIL */}
          <div className="dfv-offers-controls" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
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

        {/* Contenedor relativo para botones flotantes en PC */}
        <div style={{ position: 'relative' }}>
          {canScrollLeft && (
            <button
              type="button"
              onClick={scrollPrev}
              aria-label="Anterior"
              className="dfv-offers-pc-btn dfv-offers-pc-btn--left"
            >
              <ChevronLeft size={20} strokeWidth={1.8} />
            </button>
          )}

          {/* Track de productos con scroll-snap */}
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

          {(canScrollRight || offerProducts.length > 4) && (
            <button
              type="button"
              onClick={scrollNext}
              aria-label="Siguiente"
              className="dfv-offers-pc-btn dfv-offers-pc-btn--right"
            >
              <ChevronRight size={20} strokeWidth={1.8} />
            </button>
          )}
        </div>

        {/* Botón inferior: DESCÚBRELOS AQUÍ */}
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
        .dfv-offers-pc-btn {
          display: none;
        }

        /* ════ ESTILOS EXCLUSIVOS PARA PC (>= 769px) ════ */
        @media (min-width: 769px) {
          .dfv-offers-section {
            padding: 2.8rem 0 0 !important;
          }
          .dfv-offers-header {
            justify-content: center !important;
            margin-bottom: 2rem !important;
          }
          .dfv-offers-title {
            font-size: 1.85rem !important;
            text-align: center !important;
            letter-spacing: -0.35px !important;
          }
          .dfv-offers-controls {
            display: none !important;
          }
          .dfv-offers-track {
            gap: 18px !important;
          }
          .dfv-offer-card-wrap {
            flex: 0 0 calc((100% - 54px) / 4.12);
            max-width: 340px;
          }
          .dfv-offers-pc-btn {
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
            transition: background-color 0.2s ease, box-shadow 0.2s ease;
          }
          .dfv-offers-pc-btn:hover {
            background-color: #f8f8f8;
            box-shadow: 0 4px 14px rgba(0, 0, 0, 0.14);
          }
          .dfv-offers-pc-btn--left {
            left: 8px;
          }
          .dfv-offers-pc-btn--right {
            right: 8px;
          }
        }

        @media (max-width: 768px) {
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
