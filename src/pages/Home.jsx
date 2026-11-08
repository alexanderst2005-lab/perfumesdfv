import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Plus, Minus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import OffersSection from '../components/OffersSection';
import MostWantedCarousel from '../components/MostWantedCarousel';
import PromoBanner from '../components/PromoBanner';
import NoteCollectionsSection from '../components/NoteCollectionsSection';
import TrendingHousesSection from '../components/TrendingHousesSection';
import FragranceSetsSection from '../components/FragranceSetsSection';
import CustomerReviewsSection from '../components/CustomerReviewsSection';
import CountersBar from '../components/CountersBar';
import SedeGalleryModal from '../components/SedeGalleryModal';
import LazyOnView from '../components/LazyOnView';
import ProductTagBadge from '../components/ProductTagBadge';
import { optimizeImg, prefetchImg } from '../utils/img';

const InstagramReelsSection = lazy(() => import('../components/InstagramReelsSection'));

const HERO_SLIDES = [
  {
    id: 1,
    campaign: 'ROYAL SAPPHIRE',
    title: 'LUJO EN TUS MANOS',
    subtitle: 'Descubre el poder de una joya embotellada.',
    buttonText: 'DESCUBRIR',
    buttonLink: '/tienda',
    imageDesktop: '/hero_campaign_1.webp',
    imageMobile: '/hero_campaign_1_m.webp',
    alignment: 'center'
  },
  {
    id: 2,
    campaign: 'BHARARA COLLECTION',
    title: 'LA DUPLA PERFECTA',
    subtitle: 'Fragancias para destacar en cualquier ocasión.',
    buttonText: 'VER COLECCIÓN',
    buttonLink: '/tienda',
    imageDesktop: '/hero_campaign_2.webp',
    imageMobile: '/hero_campaign_2_m.webp',
    alignment: 'center'
  },
  {
    id: 3,
    campaign: 'LATTAFA PARA ELLA',
    title: 'ESENCIA FEMENINA',
    subtitle: 'Aromas dulces y florales que enamoran.',
    buttonText: 'VER CATÁLOGO',
    buttonLink: '/tienda?cat=Mujer',
    imageDesktop: '/hero_campaign_3.webp',
    imageMobile: '/hero_campaign_3_m.webp',
    alignment: 'center'
  },
  {
    id: 4,
    campaign: "BADE'E AL OUD",
    title: 'MISTERIO ÁRABE',
    subtitle: 'Notas intensas y maderas exóticas.',
    buttonText: 'EXPLORAR',
    buttonLink: '/tienda',
    imageDesktop: '/hero_campaign_4.webp',
    imageMobile: '/hero_campaign_4_m.webp',
    alignment: 'center'
  }
];

const DEFAULT_SEDES = [
  {
    id: 1,
    name: 'Sede Calle 31 · Centro',
    img: '/sede_calle31.jpg',
    maps: 'https://maps.google.com/?q=Calle+31+%2327-44+Palmira+Valle+del+Cauca'
  },
  {
    id: 2,
    name: 'Sede C.C. Llanogrande',
    img: '/sede_llanogrande.jpg',
    maps: 'https://maps.google.com/?q=Centro+Comercial+Llanogrande+Palmira'
  }
];

let cachedHeroSlides = null;
let cachedSedes = null;

const TOTAL_HEADER = 106; // announcement(36) + header(70)

const Home = () => {
  const { addToCart, toggleFavorite, isFavorite, products } = useShop();

  const [openFaq, setOpenFaq] = useState(null);
  // Se parte de la última versión guardada del navegador (o vacío) para no mostrar
  // primero las imágenes por defecto y luego cambiarlas (efecto "doble" al recargar).
  const readStoredHeroSedes = () => {
    try {
      const raw = localStorage.getItem('dfv_hero_sedes_v2');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  };
  const [heroSlides, setHeroSlides] = useState(() => {
    if (cachedHeroSlides && cachedHeroSlides.length > 0) return cachedHeroSlides;
    const stored = readStoredHeroSedes();
    if (Array.isArray(stored?.hero_slides) && stored.hero_slides.length > 0) return stored.hero_slides;
    return HERO_SLIDES;
  });
  const [sedesList, setSedesList] = useState(() => {
    if (cachedSedes && cachedSedes.length > 0) return cachedSedes;
    const stored = readStoredHeroSedes();
    if (Array.isArray(stored?.sedes) && stored.sedes.length > 0) return stored.sedes;
    return DEFAULT_SEDES;
  });

  useEffect(() => {
    let cancelled = false;
    const loadHeroSedes = async () => {
      try {
        const earlyPromise = window.__early?.heroSedes;
        if (window.__early) window.__early.heroSedes = null;
        const res = earlyPromise ? await earlyPromise : await fetch(`/api/hero-sedes?t=${Date.now()}`, { cache: 'no-store' });
        if (cancelled || !res || !res.ok) return;
        const data = await res.json();
        if (cancelled || !data || !data.success) return;
        const payload = data.data || data;
        const slides = Array.isArray(payload.hero_slides) && payload.hero_slides.length > 0 ? payload.hero_slides : HERO_SLIDES;
        const sedes = Array.isArray(payload.sedes) && payload.sedes.length > 0 ? payload.sedes : DEFAULT_SEDES;
        cachedHeroSlides = slides;
        cachedSedes = sedes;
        setHeroSlides(prev => (JSON.stringify(prev) === JSON.stringify(slides) ? prev : slides));
        setSedesList(prev => (JSON.stringify(prev) === JSON.stringify(sedes) ? prev : sedes));
        try { localStorage.setItem('dfv_hero_sedes_v2', JSON.stringify({ hero_slides: slides, sedes })); } catch { }
      } catch (err) {
        console.error('Error loading hero & sedes:', err);
      }
    };
    loadHeroSedes();
    return () => {
      cancelled = true;
    };
  }, []);

  // --- HERO LOGIC ---
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(0);

  // --- SEDES SLIDER (MOBILE & TABLET) ---
  const [activeSedeIndex, setActiveSedeIndex] = useState(0);
  const [sedeTouchStart, setSedeTouchStart] = useState(0);
  const [selectedSedeForGallery, setSelectedSedeForGallery] = useState(null);

  const handleSedeTouchStart = (e) => {
    setSedeTouchStart(e.targetTouches[0].clientX);
  };

  const handleSedeTouchEnd = (e) => {
    const touchEnd = e.changedTouches[0].clientX;
    const diff = sedeTouchStart - touchEnd;
    if (diff > 45) {
      setActiveSedeIndex(prev => (prev + 1) % sedesList.length);
    } else if (diff < -45) {
      setActiveSedeIndex(prev => (prev - 1 + sedesList.length) % sedesList.length);
    }
  };

  // Pre-cargar todos los slides del hero en memoria
  useEffect(() => {
    heroSlides.forEach(s => {
      if (s.imageDesktop) { const d = new Image(); d.src = s.imageDesktop; }
      if (s.imageMobile) { const m = new Image(); m.src = s.imageMobile; }
    });
  }, [heroSlides]);

  useEffect(() => {
    if (!heroSlides.length) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

  const handleTouchStart = (e) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchEnd = (e) => {
    const touchEnd = e.changedTouches[0].clientX;
    if (touchStart - touchEnd > 50) nextSlide();
    if (touchStart - touchEnd < -50) prevSlide();
  };

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', width: '100%' }}>

      {/* ════ 1. HERO PRINCIPAL EXISTENTE (DISEÑO ORIGINAL CENTRADO) ════ */}
      <section
        className="hero-section"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          backgroundColor: '#121212'
        }}
      >
        {heroSlides.map((slide, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={slide.id || index}
              style={{
                position: 'absolute',
                inset: 0,
                opacity: isActive ? 1 : 0,
                pointerEvents: isActive ? 'auto' : 'none',
                transition: 'opacity 0.9s cubic-bezier(0.4, 0, 0.2, 1)',
                zIndex: isActive ? 2 : 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: slide.alignment === 'left' ? 'flex-start' : slide.alignment === 'right' ? 'flex-end' : 'center',
                textAlign: slide.alignment,
                padding: '0 5%',
              }}
            >
              <picture style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', overflow: 'hidden', zIndex: -2 }}>
                <source media="(max-width: 768px)" srcSet={optimizeImg(slide.imageMobile || slide.imageDesktop, 1400)} />
                <img
                  src={optimizeImg(slide.imageDesktop, 2400)}
                  alt={slide.title}
                  loading={index === 0 ? "eager" : "lazy"}
                  decoding="async"
                  style={{
                    position: 'absolute',
                    top: '-1%',
                    left: '-1.5%',
                    width: '103%',
                    height: '102%',
                    maxWidth: 'none',
                    objectFit: 'cover',
                    objectPosition: 'center',
                    display: 'block'
                  }}
                />
              </picture>

              {/* Overlay sutil adaptado a la alineación */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: slide.alignment === 'center'
                  ? 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 100%)'
                  : slide.alignment === 'left'
                    ? 'linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 100%)'
                    : 'linear-gradient(to left, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 100%)',
                zIndex: -1
              }} />

              {/* Contenido centrado arriba */}
              <div style={{
                maxWidth: '680px',
                width: '100%',
                opacity: index === currentSlide ? 1 : 0,
                transform: index === currentSlide ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.8s ease-out 0.3s'
              }}>
                <p style={{ color: '#fff', fontSize: '0.68rem', letterSpacing: '4px', textTransform: 'uppercase', opacity: 0.85, marginBottom: '0.8rem' }}>
                  {slide.campaign}
                </p>
                <h1 style={{ color: '#fff', fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.2rem, 6.5vw, 4.5rem)', fontWeight: '400', lineHeight: '1.1', marginBottom: '1rem', textShadow: '0 2px 20px rgba(0,0,0,0.45)' }}>
                  {slide.title}
                </h1>
                <p style={{ color: '#fff', fontSize: 'clamp(0.85rem, 1.8vw, 1.05rem)', opacity: 0.9, marginBottom: '2.2rem', fontWeight: '300', textShadow: '0 1px 10px rgba(0,0,0,0.3)' }}>
                  {slide.subtitle}
                </p>
                <Link
                  to={slide.buttonLink}
                  style={{
                    display: 'inline-block',
                    padding: '0.9rem 2.8rem',
                    border: '1px solid rgba(255,255,255,0.65)',
                    color: '#fff',
                    fontSize: '0.75rem',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    backgroundColor: 'transparent',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#fff';
                    e.currentTarget.style.color = '#000';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#fff';
                  }}
                >
                  {slide.buttonText}
                </Link>
              </div>
            </div>
          );
        })}

        {/* Flechas Desktop */}
        <button
          onClick={prevSlide}
          className="hero-arrow hero-arrow-left"
          style={{ position: 'absolute', left: '2rem', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', zIndex: 10, opacity: 0.6, transition: 'opacity 0.3s' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '1'}
          onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}
        >
          <ChevronLeft size={40} strokeWidth={1} />
        </button>
        <button
          onClick={nextSlide}
          className="hero-arrow hero-arrow-right"
          style={{ position: 'absolute', right: '2rem', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', zIndex: 10, opacity: 0.6, transition: 'opacity 0.3s' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '1'}
          onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}
        >
          <ChevronRight size={40} strokeWidth={1} />
        </button>

        {/* Indicadores Inferiores 01 -- 02 -- 03 -- 04 */}
        <div style={{ position: 'absolute', bottom: '2.5rem', display: 'flex', gap: '1rem', alignItems: 'center', zIndex: 10 }}>
          {heroSlides.map((_, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                onClick={() => setCurrentSlide(idx)}
                style={{
                  background: 'none', border: 'none', color: '#fff', cursor: 'pointer',
                  fontSize: '0.75rem', letterSpacing: '1px', opacity: idx === currentSlide ? 1 : 0.4,
                  transition: 'opacity 0.3s'
                }}
              >
                0{idx + 1}
              </button>
              {idx < heroSlides.length - 1 && (
                <div style={{ width: '30px', height: '1px', backgroundColor: 'rgba(255,255,255,0.3)' }} />
              )}
            </div>
          ))}
        </div>

        <style>{`
          .hero-section { height: 100vh; height: 100dvh; width: 100%; overflow: hidden; }
          @media (max-width: 768px) {
            .hero-arrow { display: none !important; }
          }
        `}</style>
      </section>

      {/* ════ 2. LOS MÁS DESEADOS DEL MES ════ */}
      <MostWantedCarousel
        products={products}
        onFav={toggleFavorite}
        isFavorite={isFavorite}
        onAdd={addToCart}
      />

      {/* ════ 3. BANNER PROMOCIONAL ════ */}
      <PromoBanner />

      {/* ════ 4. VIDEOS: MOMENTOS QUE SE QUEDAN EN LA PIEL ════ */}
      <Suspense fallback={null}><InstagramReelsSection /></Suspense>

      {/* ════ 5. BARRA DE CONTADORES ════ */}
      <CountersBar />

      {/* ════ 6. FAVORITOS EN OFERTA ════ */}
      <OffersSection />

      {/* ════ 7. CASAS EN TENDENCIA (DESPUÉS DE FAVORITOS EN OFERTAS) ════ */}
      <TrendingHousesSection />

      {/* ════ 7B. SETS DE FRAGANCIAS EXCLUSIVAS (DEBAJO DE CASAS EN TENDENCIA) ════ */}
      <FragranceSetsSection />

      {/* ════ 8. COLECCIONES POR NOTAS (DESPUÉS DE SETS DE FRAGANCIAS) ════ */}
      <NoteCollectionsSection />

      {/* ════ 9. RESEÑAS DE CLIENTES (EXPERIENCIAS QUE ENAMORAN) ════ */}
      <CustomerReviewsSection />

      {/* ════ 10. SEDES FÍSICAS (DISEÑO LIMPIO Y PROFESIONAL) ════ */}
      <section id="sedes" style={{ backgroundColor: '#ffffff', padding: '1.8rem 0 2.5rem' }}>
        <div className="container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.15rem' }}>

          {/* ENCABEZADO: NUESTRAS SEDES CENTRADO EN PC / CON CONTROLES EN MÓVIL */}
          <div className="sedes-header-wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.15rem', gap: '0.5rem', flexWrap: 'nowrap' }}>
            <h2 className="sedes-main-title" style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: 'clamp(1.05rem, 4.2vw, 1.55rem)',
              fontWeight: '600',
              color: '#1a1a1a',
              margin: 0,
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
              lineHeight: 1.2,
              whiteSpace: 'nowrap'
            }}>
              NUESTRAS SEDES
            </h2>

            <div className="sedes-header-controls" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
              <button
                type="button"
                onClick={() => setActiveSedeIndex(prev => (prev - 1 + sedesList.length) % sedesList.length)}
                aria-label="Sede anterior"
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
                {activeSedeIndex + 1}/{sedesList.length}
              </span>
              <button
                type="button"
                onClick={() => setActiveSedeIndex(prev => (prev + 1) % sedesList.length)}
                aria-label="Sede siguiente"
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

          {/* CARRUSEL / GRID DE SEDES */}
          <div
            className="sedes-slider-wrapper"
            onTouchStart={handleSedeTouchStart}
            onTouchEnd={handleSedeTouchEnd}
            style={{
              width: '100%',
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            <div
              className="sedes-slider-track"
              style={{
                display: 'flex',
                width: '100%',
                transform: `translateX(-${activeSedeIndex * 100}%)`,
                transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              {sedesList.map((s, idx) => (
                <div
                  key={s.id || s.name || idx}
                  className="sede-slide-item"
                  style={{
                    width: '100%',
                    minWidth: '100%',
                    flex: '0 0 100%',
                    boxSizing: 'border-box'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {/* FOTOGRAFÍA GRANDE Y LIMPIA (Al tocar abre la galería de la sede) */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedSedeForGallery(s)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedSedeForGallery(s); } }}
                      aria-label={`Ver galería de ${s.name}`}
                      style={{
                        display: 'block',
                        width: '100%',
                        aspectRatio: '1/1',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        backgroundColor: '#f4f4f4',
                        textDecoration: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <img
                        src={s.img}
                        alt={`DFV Perfumes - Sede ${idx + 1}`}
                        loading="lazy"
                        decoding="async"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          objectPosition: 'center',
                          display: 'block',
                          transition: 'transform 0.4s ease'
                        }}
                      />
                    </div>

                    {/* NOMBRE DE LA SEDE + ENLACE SUBRAYADO ¿CÓMO LLEGAR? */}
                    <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
                      <h3
                        style={{
                          fontFamily: "'Montserrat', sans-serif",
                          fontSize: 'clamp(1.05rem, 2.5vw, 1.3rem)',
                          fontWeight: '600',
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase',
                          color: '#1a1a1a',
                          margin: '0 0 0.6rem 0'
                        }}
                      >
                        {s.name}
                      </h3>
                      <a
                        href={s.maps}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          fontFamily: 'var(--font-sans, "Montserrat", sans-serif)',
                          fontSize: '0.88rem',
                          fontWeight: '500',
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          color: '#1a1a1a',
                          textDecoration: 'none',
                          borderBottom: '1.5px solid #1a1a1a',
                          paddingBottom: '3px',
                          display: 'inline-block',
                          transition: 'opacity 0.2s ease'
                        }}
                      >
                        ¿CÓMO LLEGAR?
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <style>{`
            @media (min-width: 769px) {
              .sedes-header-wrap {
                justify-content: center !important;
                margin-bottom: 2rem !important;
              }
              .sedes-main-title {
                text-align: center !important;
                font-size: 1.85rem !important;
              }
              .sedes-header-controls {
                display: none !important;
              }
              .sedes-slider-wrapper {
                overflow: visible !important;
              }
              .sedes-slider-track {
                display: grid !important;
                grid-template-columns: repeat(2, 1fr) !important;
                gap: 2rem !important;
                transform: none !important;
                transition: none !important;
                width: 100% !important;
              }
              .sede-slide-item {
                width: auto !important;
                min-width: 0 !important;
                flex: auto !important;
              }
            }
          `}</style>
        </div>
      </section>

      <SedeGalleryModal
        sede={selectedSedeForGallery}
        onClose={() => setSelectedSedeForGallery(null)}
      />

      {/* ════ 10. PREGUNTAS FRECUENTES ════ */}
      <section id="faq" style={{ backgroundColor: '#FFFFFF', padding: '4rem 0 3rem', borderTop: '1px solid #F0ECE6' }}>
        <div className="container dfv-faq-container" style={{ maxWidth: '640px', margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{
              fontSize: '0.68rem',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              color: '#B99A5B',
              fontWeight: '600',
              fontFamily: 'var(--font-sans)',
              display: 'block',
              marginBottom: '0.4rem'
            }}>
              RESOLVEMOS TUS DUDAS
            </span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: '400', color: 'var(--color-black)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
              Preguntas Frecuentes
            </h2>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: '#666', lineHeight: '1.5', fontWeight: '300' }}>
              Encuentra respuestas a las preguntas más comunes sobre nuestros perfumes, compras y envíos.
            </p>
          </div>

          <div style={{ borderTop: '1px solid #EAE8E4' }}>
            {[
              {
                q: '¿Cómo puedo realizar una compra?',
                a: 'Puedes explorar nuestro catálogo, seleccionar el perfume que deseas y agregarlo al carrito. Luego podrás revisar tu pedido, ingresar tus datos y finalizar la compra. Al finalizar, tu pedido será recibido y podrás confirmar los detalles por WhatsApp con nuestra atención personalizada.'
              },
              {
                q: '¿Los perfumes son originales?',
                a: 'Sí, 100% garantizados. Trabajamos exclusivamente con perfumes originales e importados de las mejores casas perfumistas del mundo con más de 30 años de experiencia comercial.'
              },
              {
                q: '¿Realizan envíos a todo el país?',
                a: 'Sí, realizamos envíos seguros y asegurados a cualquier municipio de Colombia. Si tienes dudas sobre los tiempos de entrega específicos de tu ciudad, consúltanos directamente por WhatsApp.'
              },
              {
                q: '¿Qué métodos de pago tienen disponibles?',
                a: 'Aceptamos transferencias bancarias (Bancolombia, Nequi, Daviplata), pago seguro en línea mediante pasarela y pagos a través de aliados comerciales como Addi y Sistecrédito.'
              },
              {
                q: '¿Puedo recibir asesoría para elegir mi perfume?',
                a: '¡Por supuesto! Es uno de nuestros sellos distintivos. Puedes escribirnos a nuestra línea de WhatsApp y uno de nuestros expertos perfumistas te guiará según tus gustos, clima, ocasión y notas olfativas favoritas.'
              }
            ].map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} style={{ borderBottom: '1px solid #EAE8E4' }}>
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    style={{
                      width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      background: 'none', border: 'none', padding: '1.2rem 0', cursor: 'pointer', textAlign: 'left',
                      fontFamily: 'var(--font-serif)', fontSize: '0.95rem', color: '#111'
                    }}
                  >
                    <span style={{ paddingRight: '1rem' }}>{faq.q}</span>
                    <span style={{ color: '#000', transition: 'transform 0.3s ease', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}>
                      {isOpen ? <Minus size={16} strokeWidth={1.5} /> : <Plus size={16} strokeWidth={1.5} />}
                    </span>
                  </button>
                  <div
                    style={{
                      overflow: 'hidden',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      maxHeight: isOpen ? '300px' : '0',
                      opacity: isOpen ? 1 : 0
                    }}
                  >
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: '#666', lineHeight: '1.6', paddingBottom: '1.2rem' }}>
                      {faq.a}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: '0.75rem', color: '#888', marginBottom: '0.6rem', letterSpacing: '1px' }}>¿TIENES OTRA PREGUNTA?</p>
            <a
              href="https://wa.me/573027642208"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-block', fontSize: '0.7rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--color-black)', borderBottom: '1px solid var(--color-black)', paddingBottom: '3px', fontWeight: '500', textDecoration: 'none', transition: 'opacity 0.3s'
              }}
              onMouseEnter={e => e.target.style.opacity = 0.6}
              onMouseLeave={e => e.target.style.opacity = 1}
            >
              CONSULTAR POR WHATSAPP →
            </a>
          </div>
        </div>
      </section>

      {/* ════ 11. MEDIOS DE PAGO Y ALIADOS ════ */}
      <section style={{ padding: '3.5rem 0', backgroundColor: '#FFFFFF', borderTop: '1px solid #F0ECE6' }}>
        <div className="container" style={{ textAlign: 'center' }}>

          {/* Opciones de Pago */}
          <div style={{ marginBottom: '3rem' }}>
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#888', marginBottom: '0.8rem' }}>
              OPCIONES DE PAGO
            </h4>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', letterSpacing: '1px', color: '#222' }}>TRANSFERENCIA</span>
              <span style={{ fontSize: '0.75rem', color: '#999' }}>·</span>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', letterSpacing: '1px', color: '#222' }}>EFECTIVO</span>
              <span style={{ fontSize: '0.75rem', color: '#999' }}>·</span>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', letterSpacing: '1px', color: '#222' }}>TARJETAS</span>
            </div>
          </div>

          {/* Nuestros Aliados */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#888', marginBottom: '1.5rem' }}>
              NUESTROS ALIADOS
            </h4>
            <div className="allies-logos" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '3rem', opacity: 0.85 }}>
              <img src="/addi.png" alt="Addi" loading="lazy" decoding="async" style={{ height: '24px', width: 'auto', objectFit: 'contain' }} />
              <img src="/sistecredito.png" alt="Sistecrédito" loading="lazy" decoding="async" style={{ height: '18px', width: 'auto', objectFit: 'contain' }} />
              <img src="/bold.png" alt="Bold" loading="lazy" decoding="async" style={{ height: '26px', width: 'auto', objectFit: 'contain' }} />
            </div>
          </div>

        </div>
        <style>{`
          @media (max-width: 768px) {
            .allies-logos { gap: 2rem !important; flex-wrap: wrap; }
          }
        `}</style>
      </section>

    </div>
  );
};

/* ── Shared Product Card Component (Microinteracciones & Responsive) ── */
export const ProductCard = ({ product, onFav, fav, onAdd, priority = false }) => (
  <div
    className="product-card"
    style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      textAlign: 'center',
      backgroundColor: 'transparent',
      transition: 'transform 0.25s ease, box-shadow 0.25s ease',
      borderRadius: '8px'
    }}
  >
    <div
      className="product-card__image-wrap"
      style={{
        position: 'relative',
        aspectRatio: '4/5',
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
        borderRadius: '8px',
        marginBottom: '0.75rem'
      }}
    >
      <Link
        to={`/producto/${product.id}`}
        onMouseEnter={() => prefetchImg(product.image)}
        onTouchStart={() => prefetchImg(product.image)}
        style={{ display: 'block', width: '100%', height: '100%' }}
      >
        <img
          src={optimizeImg(product.image, 1200)}
          alt={product.name}
          className="product-img"
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            transition: 'transform 0.5s ease'
          }}
        />
      </Link>

      {/* Contenedor Superior Izquierdo: Etiqueta y Descuento independientes */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '5px',
          zIndex: 6,
          pointerEvents: 'none'
        }}
      >
        {Boolean(product.tag) && (
          <ProductTagBadge tag={product.tag} />
        )}
        {Boolean(product.discount && String(product.discount).trim()) && (
          <span style={{
            backgroundColor: '#DC2626',
            color: '#FFFFFF',
            padding: '3px 8px',
            fontSize: '0.68rem',
            letterSpacing: '0.6px',
            fontWeight: '800',
            textTransform: 'uppercase',
            borderRadius: '999px',
            boxShadow: '0 2px 8px rgba(220, 38, 38, 0.4)',
            lineHeight: 1,
            display: 'inline-flex',
            alignItems: 'center'
          }}>
            -{String(product.discount).replace(/[^0-9]/g, '')}% OFF
          </span>
        )}
      </div>

      {/* Overlay AGOTADO */}
      {!product.inStock && (
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(2px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 5,
          pointerEvents: 'none'
        }}>
          <span style={{
            background: '#111',
            color: '#fff',
            padding: '6px 14px',
            fontSize: '0.75rem',
            letterSpacing: '2px',
            fontWeight: '600',
            textTransform: 'uppercase',
            borderRadius: '2px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            fontFamily: 'var(--font-sans)'
          }}>
            AGOTADO
          </span>
        </div>
      )}

      {/* Botón Flotante Desktop en Hover */}
      {(onAdd && product.inStock) && (
        <button
          onClick={(e) => { e.preventDefault(); onAdd(); }}
          className="add-to-cart-btn-desktop"
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '0.55rem 1.1rem',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(4px)',
            border: '1px solid #111',
            borderRadius: '3px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#111',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.62rem',
            fontWeight: '600',
            letterSpacing: '1px',
            transition: 'all 0.25s ease',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            zIndex: 6
          }}
        >
          + AGREGAR AL CARRITO
        </button>
      )}
    </div>

    <div className="product-card__info" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flexGrow: 1, padding: '0 0.25rem' }}>
      <Link to={`/producto/${product.id}`} style={{ textDecoration: 'none', width: '100%' }}>
        <h3 style={{
          fontFamily: 'var(--font-name)',
          fontSize: 'clamp(0.9rem, 1.4vw, 1rem)',
          fontWeight: '500',
          color: '#1A1A1A',
          lineHeight: '1.3',
          marginBottom: '0.3rem',
          minHeight: '2.6em',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          textAlign: 'center'
        }}>
          {product.name}
        </h3>
      </Link>

      <p style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '0.62rem',
        fontWeight: '600',
        letterSpacing: '1.5px',
        textTransform: 'uppercase',
        color: '#8A857D',
        margin: '0 0 0.2rem 0',
        textAlign: 'center'
      }}>
        {product.brand}
      </p>

      <p style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '0.58rem',
        fontWeight: '400',
        letterSpacing: '1px',
        textTransform: 'uppercase',
        color: '#B0AAA0',
        margin: '0 0 0.5rem 0',
        textAlign: 'center'
      }}>
        {product.category}
      </p>

      <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem', alignItems: 'baseline', justifyContent: 'center', width: '100%', marginBottom: '0.5rem' }}>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', color: '#0A0A0A', fontWeight: '600', letterSpacing: '-0.2px' }}>
          ${product.price.toLocaleString()}
        </span>
        {product.oldPrice && (
          <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '0.72rem', fontWeight: '400' }}>
            ${product.oldPrice.toLocaleString()}
          </span>
        )}
      </div>

      {(onAdd && product.inStock) && (
        <button
          onClick={(e) => { e.preventDefault(); onAdd(); }}
          className="add-to-cart-btn-mobile"
          style={{
            width: '100%',
            padding: '0.48rem 0.6rem',
            backgroundColor: '#FFFFFF',
            border: '1px solid #1A1A1A',
            borderRadius: '4px',
            color: '#1A1A1A',
            fontSize: '0.64rem',
            fontWeight: '600',
            letterSpacing: '0.8px',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-sans)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            marginTop: '0.2rem'
          }}
        >
          <span>+ AGREGAR</span>
        </button>
      )}
    </div>

    <style>{`
      .product-card:hover {
        transform: translateY(-4px);
      }
      .product-card:hover .product-img {
        transform: scale(1.03);
      }
      
      .add-to-cart-btn-desktop {
        opacity: 0;
        transform: translate(-50%, 8px) !important;
      }
      .product-card:hover .add-to-cart-btn-desktop {
        opacity: 1;
        transform: translate(-50%, 0) !important;
      }
      .add-to-cart-btn-desktop:hover {
        background-color: #0A0A0A !important;
        color: #fff !important;
      }

      .add-to-cart-btn-mobile {
        display: none !important;
      }
      .add-to-cart-btn-mobile:hover {
        background-color: #0A0A0A !important;
        color: #fff !important;
        border-color: #0A0A0A !important;
      }
      
      @media (max-width: 1024px) {
        .add-to-cart-btn-desktop {
          display: none !important;
        }
        .add-to-cart-btn-mobile {
          display: flex !important;
        }
      }

      .fav-active {
        animation: heartBeat 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
      @keyframes heartBeat {
        0% { transform: scale(1); }
        50% { transform: scale(1.3); }
        100% { transform: scale(1); }
      }
    `}</style>
  </div>
);

export default Home;
