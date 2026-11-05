import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { optimizeImg } from '../utils/img';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../pages/Home';

const DEFAULT_BANNER = {
  title: 'ELEGANCIA QUE PERDURA',
  subtitle: 'Fragancias exclusivas que definen tu presencia con un sello inconfundible de lujo.',
  button_text: 'COMPRAR AHORA',
  button_link: '/tienda',
  image: '/hero_campaign_2.webp',
  active: true
};

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const RANDOM_STORAGE_KEY = 'dfv_promo_random_products_v1';
let cachedPromoBanner = null;

const PromoBanner = () => {
  const { products = [], addToCart, toggleFavorite, isFavorite } = useShop();
  const [banner, setBanner] = useState(cachedPromoBanner || DEFAULT_BANNER);
  const [isVisible, setIsVisible] = useState(Boolean(cachedPromoBanner));
  const sectionRef = useRef(null);

  // Estado del carrusel aleatorio debajo del banner
  const trackRef = useRef(null);
  const [randomProducts, setRandomProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const isPausedRef = useRef(false);

  const activeCatalogProducts = useMemo(() => {
    return products.filter(p => p.active !== false && p.inStock !== false);
  }, [products]);

  useEffect(() => {
    if (activeCatalogProducts.length === 0) {
      setRandomProducts([]);
      return;
    }

    try {
      const savedJson = sessionStorage.getItem(RANDOM_STORAGE_KEY);
      if (savedJson) {
        const ids = JSON.parse(savedJson);
        const matched = ids
          .map(id => activeCatalogProducts.find(p => String(p.id) === String(id)))
          .filter(Boolean);
        if (matched.length >= 4) {
          setRandomProducts(matched);
          return;
        }
      }
    } catch {}

    const picked = shuffleArray(activeCatalogProducts).slice(0, 12);
    setRandomProducts(picked);
    try {
      sessionStorage.setItem(RANDOM_STORAGE_KEY, JSON.stringify(picked.map(p => p.id)));
    } catch {}
  }, [activeCatalogProducts]);

  useEffect(() => {
    fetch(`/api/promo-banner?t=${Date.now()}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        if (data.success && data.banner) {
          cachedPromoBanner = data.banner;
          setBanner(data.banner);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [banner]);

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
  }, [randomProducts]);

  // Movimiento automático continuo ("que se mantengan cambiando solos")
  useEffect(() => {
    if (randomProducts.length <= 2) return;
    const timer = setInterval(() => {
      if (isPausedRef.current) return;
      const el = trackRef.current;
      if (!el) return;
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 10) return;

      if (el.scrollLeft >= maxScroll - 16) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: el.clientWidth * 0.85, behavior: 'smooth' });
      }
    }, 3400);

    return () => clearInterval(timer);
  }, [randomProducts.length]);

  const scrollPrev = () => {
    const el = trackRef.current;
    if (!el) return;
    if (el.scrollLeft <= 10) {
      el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
    } else {
      el.scrollBy({ left: -el.clientWidth * 0.85, behavior: 'smooth' });
    }
  };

  const scrollNext = () => {
    const el = trackRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (el.scrollLeft >= maxScroll - 16) {
      el.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      el.scrollBy({ left: el.clientWidth * 0.85, behavior: 'smooth' });
    }
  };

  if (!banner || banner.active === false) {
    return null;
  }

  const rawImg = banner.image_url || banner.image;
  const bgImage = rawImg ? optimizeImg(rawImg, 1600) : '/hero_campaign_2.webp';

  return (
    <section ref={sectionRef} className="dfv-promo" style={{ backgroundColor: '#FFFFFF', overflow: 'hidden' }}>
      <div className="dfv-promo__wrap">
        {/* 1. BANNER PROMOCIONAL CON IMAGEN 100% COMPLETA */}
        <div className={`dfv-promo__card ${isVisible ? 'is-revealed' : ''}`}>
          <img
            src={bgImage}
            alt={banner.title || 'Banner Promocional'}
            className="dfv-promo__img"
            loading="lazy"
            decoding="async"
          />
          <div className="dfv-promo__overlay" />
          <div className={`dfv-promo__content ${isVisible ? 'is-revealed' : ''}`}>
            <h2 className="dfv-promo__title">{banner.title}</h2>
            {banner.subtitle && <p className="dfv-promo__subtitle">{banner.subtitle}</p>}
            <Link to={banner.button_link || '/tienda'} className="dfv-promo__btn">
              {banner.button_text || 'COMPRAR AHORA'}
            </Link>
          </div>
        </div>

        {/* 2. CARRUSEL DE PRODUCTOS ALEATORIOS ABAJITO DEL BANNER (CAMBIANDO SOLOS COMO IMAGEN 2) */}
        {randomProducts.length > 0 && (
          <div
            className="dfv-promo-products-wrap"
            onMouseEnter={() => { isPausedRef.current = true; }}
            onMouseLeave={() => { isPausedRef.current = false; }}
            onTouchStart={() => { isPausedRef.current = true; }}
            onTouchEnd={() => {
              setTimeout(() => { isPausedRef.current = false; }, 2500);
            }}
            style={{ marginTop: '1.35rem', position: 'relative' }}
          >
            {canScrollLeft && (
              <button
                type="button"
                onClick={scrollPrev}
                aria-label="Anterior"
                className="dfv-promo-pc-btn dfv-promo-pc-btn--left"
              >
                <ChevronLeft size={20} strokeWidth={1.8} />
              </button>
            )}

            <div
              ref={trackRef}
              className="dfv-promo-products-track"
              style={{
                display: 'flex',
                gap: '14px',
                overflowX: 'auto',
                scrollSnapType: 'x mandatory',
                scrollBehavior: 'smooth',
                WebkitOverflowScrolling: 'touch',
                paddingBottom: '0.4rem',
                scrollbarWidth: 'none'
              }}
            >
              {randomProducts.map((p, idx) => (
                <div
                  key={p.id}
                  className="dfv-promo-product-card"
                  style={{
                    scrollSnapAlign: 'start',
                    boxSizing: 'border-box'
                  }}
                >
                  <ProductCard
                    product={p}
                    onFav={() => toggleFavorite && toggleFavorite(p)}
                    fav={isFavorite ? isFavorite(p.id) : false}
                    onAdd={() => addToCart && addToCart(p, 1, p.sizes?.[0])}
                    priority={idx < 4}
                  />
                </div>
              ))}
            </div>

            {(canScrollRight || randomProducts.length > 4) && (
              <button
                type="button"
                onClick={scrollNext}
                aria-label="Siguiente"
                className="dfv-promo-pc-btn dfv-promo-pc-btn--right"
              >
                <ChevronRight size={20} strokeWidth={1.8} />
              </button>
            )}

            {/* PAGINACIÓN INFERIOR CENTRADA < 1/6 > EN MÓVIL (IDÉNTICA A IMAGEN 2) */}
            <div className="dfv-promo-bottom-pager">
              <button
                type="button"
                onClick={scrollPrev}
                aria-label="Anterior página"
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
                fontFamily: "'Montserrat', sans-serif",
                fontSize: '0.84rem',
                color: '#1a1a1a',
                fontWeight: '500',
                letterSpacing: '0.5px',
                whiteSpace: 'nowrap'
              }}>
                {currentPage}/{totalPages}
              </span>

              <button
                type="button"
                onClick={scrollNext}
                aria-label="Siguiente página"
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
        )}
      </div>

      <style>{`
        .dfv-promo { padding: 24px 0 18px; }
        .dfv-promo__wrap { max-width: 1280px; margin: 0 auto; padding: 0 1.15rem; }
        .dfv-promo__card {
          position: relative;
          width: 100%;
          border-radius: 8px;
          overflow: hidden;
          background-color: #111111;
          clip-path: inset(0 0 0 100%);
          transform: translateX(48px) scale(1.02);
          opacity: 0;
          transition:
            clip-path 1.05s cubic-bezier(0.22, 1, 0.36, 1),
            transform 1.05s cubic-bezier(0.22, 1, 0.36, 1),
            opacity 0.6s ease;
        }
        .dfv-promo__card.is-revealed {
          clip-path: inset(0 0 0 0);
          transform: translateX(0) scale(1);
          opacity: 1;
        }
        .dfv-promo__img {
          width: 100%;
          height: auto;
          display: block;
          object-fit: contain;
          object-position: center;
        }
        .dfv-promo__overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0,0,0,0.34) 0%, rgba(0,0,0,0.46) 100%);
          pointer-events: none;
        }
        .dfv-promo__content {
          position: absolute;
          inset: 0;
          z-index: 2;
          width: 100%;
          padding: 24px;
          box-sizing: border-box;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transform: translateX(30px);
          transition: opacity 0.8s ease 0.3s, transform 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.3s;
        }
        .dfv-promo__content.is-revealed {
          opacity: 1;
          transform: translateX(0);
        }
        .dfv-promo__title {
          font-family: 'Montserrat', sans-serif;
          font-size: clamp(1.85rem, 6.5vw, 4.5rem);
          font-weight: 600;
          line-height: 1.05;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          color: #ffffff;
          margin: 0 0 12px;
          max-width: 760px;
          text-shadow: 0 2px 18px rgba(0,0,0,0.3);
          overflow-wrap: anywhere;
        }
        .dfv-promo__subtitle {
          font-family: 'Montserrat', sans-serif;
          font-size: clamp(0.72rem, 2.1vw, 0.96rem);
          font-weight: 400;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.92);
          line-height: 1.45;
          margin: 0 0 20px;
          max-width: 560px;
        }
        .dfv-promo__btn {
          display: inline-block;
          padding: 12px 30px;
          font-family: 'Montserrat', sans-serif;
          font-size: 0.75rem;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          text-decoration: none;
          color: #ffffff;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.75);
          border-radius: 999px;
          transition: background-color 0.25s ease, color 0.25s ease;
        }
        .dfv-promo__btn:hover { background: #ffffff; color: #1a1a1a; }

        /* Carrusel de productos aleatorios debajo del banner */
        .dfv-promo-products-track::-webkit-scrollbar {
          display: none;
        }
        .dfv-promo-pc-btn {
          display: none;
        }
        .dfv-promo-bottom-pager {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.55rem;
          margin-top: 0.9rem;
        }

        @media (min-width: 769px) {
          .dfv-promo-product-card {
            flex: 0 0 calc((100% - 42px) / 4.15);
          }
          .dfv-promo-bottom-pager {
            display: none !important;
          }
          .dfv-promo-pc-btn {
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
          .dfv-promo-pc-btn:hover {
            background-color: #f8f8f8;
            box-shadow: 0 4px 14px rgba(0, 0, 0, 0.14);
          }
          .dfv-promo-pc-btn--left {
            left: 8px;
          }
          .dfv-promo-pc-btn--right {
            right: 8px;
          }
        }

        @media (max-width: 768px) {
          .dfv-promo-product-card {
            flex: 0 0 calc((100% - 28px) / 3);
          }
        }

        @media (max-width: 640px) {
          .dfv-promo { padding: 18px 0 12px; }
          .dfv-promo__content { padding: 16px; }
          .dfv-promo-product-card {
            flex: 0 0 calc((100% - 12px) / 2.12) !important;
            min-width: 145px !important;
          }
          .dfv-promo-products-track {
            gap: 12px !important;
          }
        }
      `}</style>
    </section>
  );
};

export default PromoBanner;
