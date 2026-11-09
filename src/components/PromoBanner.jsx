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
let cachedPromoBanner = (() => {
  try {
    const raw = localStorage.getItem('dfv_promo_banner_cache');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
})();

const PromoBanner = () => {
  const { products = [], addToCart, toggleFavorite, isFavorite } = useShop();
  const [banner, setBanner] = useState(cachedPromoBanner || DEFAULT_BANNER);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  const cardRef = useRef(null);

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
    const loadPromo = async () => {
      try {
        const earlyPromise = window.__early?.promoBanner;
        if (window.__early) window.__early.promoBanner = null;
        const res = earlyPromise ? await earlyPromise : await fetch(`/api/promo-banner?t=${Date.now()}`, { cache: 'no-store' });
        if (!res || !res.ok) return;
        const data = await res.json();
        if (data.success && data.banner) {
          cachedPromoBanner = data.banner;
          setBanner(data.banner);
          try { localStorage.setItem('dfv_promo_banner_cache', JSON.stringify(data.banner)); } catch {}
        }
      } catch {}
    };
    loadPromo();
    window.addEventListener('dfv-sync', loadPromo);
    window.addEventListener('storage', loadPromo);
    return () => {
      window.removeEventListener('dfv-sync', loadPromo);
      window.removeEventListener('storage', loadPromo);
    };
  }, []);

  useEffect(() => {
    const checkReveal = () => {
      const el = cardRef.current || sectionRef.current;
      if (!el) return;
      // No desplegar al abrir la página arriba del todo; solo a medida que el usuario va bajando
      if (window.scrollY < 80) {
        setIsVisible(false);
        return;
      }
      const rect = el.getBoundingClientRect();
      if (rect.height === 0) return;

      if (rect.top <= window.innerHeight * 0.78 && rect.bottom >= 60) {
        setIsVisible(true);
      } else if (rect.top > window.innerHeight * 0.96) {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', checkReveal, { passive: true });
    window.addEventListener('resize', checkReveal);
    const timer = setTimeout(checkReveal, 150);

    return () => {
      window.removeEventListener('scroll', checkReveal);
      window.removeEventListener('resize', checkReveal);
      clearTimeout(timer);
    };
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

  // Movimiento automático continuo en móvil ("que se mantengan cambiando solos")
  useEffect(() => {
    if (randomProducts.length <= 2) return;
    const timer = setInterval(() => {
      if (isPausedRef.current) return;
      if (typeof window !== 'undefined' && window.innerWidth >= 769) return;
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
        <div ref={cardRef} className={`dfv-promo__card ${isVisible ? 'is-revealed' : ''}`}>
          <img
            src={bgImage}
            alt={banner.title || 'Banner Promocional'}
            className="dfv-promo__img"
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

        {/* 2. PRODUCTOS ALEATORIOS (A UN LADO EN PC CON SCROLL VERTICAL / ABAJO EN MÓVIL CON CARRUSEL) */}
        {randomProducts.length > 0 && (
          <div
            className="dfv-promo-products-wrap"
            onMouseEnter={() => { isPausedRef.current = true; }}
            onMouseLeave={() => { isPausedRef.current = false; }}
            onTouchStart={() => { isPausedRef.current = true; }}
            onTouchEnd={() => {
              setTimeout(() => { isPausedRef.current = false; }, 2500);
            }}
          >
            <div
              ref={trackRef}
              className="dfv-promo-products-track"
            >
              {randomProducts.map((p, idx) => (
                <div
                  key={p.id}
                  className="dfv-promo-product-card"
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
          background-color: transparent;
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

        /* Productos aleatorios: en PC a la derecha con scroll vertical / en móvil abajo en carrusel */
        .dfv-promo-products-track::-webkit-scrollbar {
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
          .dfv-promo {
            padding: 28px 0 24px;
          }
          .dfv-promo__wrap {
            max-width: 1420px;
            padding: 0 2.2rem;
            display: grid;
            grid-template-columns: 47% 1fr;
            gap: 28px;
            align-items: stretch;
          }
          .dfv-promo__card {
            display: block;
            border-radius: 8px;
            align-self: start;
          }
          .dfv-promo__img {
            width: 100%;
            height: auto;
            display: block;
          }
          .dfv-promo__title {
            font-size: clamp(1.85rem, 3vw, 2.85rem);
          }
          .dfv-promo-products-wrap {
            margin-top: 0;
            position: relative;
            height: 100%;
            min-height: 520px;
          }
          .dfv-promo-products-track {
            position: absolute;
            inset: 0;
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 260px));
            justify-content: center;
            gap: 22px 20px;
            overflow-y: auto;
            overflow-x: hidden;
            align-content: start;
            padding-bottom: 12px;
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          .dfv-promo-product-card {
            width: 100%;
            min-width: 0;
            box-sizing: border-box;
          }
          .dfv-promo-product-card .product-card__image-wrap {
            max-height: 255px !important;
          }
          .dfv-promo-bottom-pager {
            display: none !important;
          }
        }

        @media (max-width: 768px) {
          .dfv-promo-products-wrap {
            margin-top: 1.35rem;
            position: relative;
          }
          .dfv-promo-products-track {
            display: flex;
            gap: 14px;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            scroll-behavior: smooth;
            -webkit-overflow-scrolling: touch;
            padding-bottom: 0.4rem;
            scrollbar-width: none;
          }
          .dfv-promo-product-card {
            scroll-snap-align: start;
            box-sizing: border-box;
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
