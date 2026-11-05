import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Plus, Minus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import OffersSection from '../components/OffersSection';
import BenefitsBar from '../components/BenefitsBar';
import MostWantedCarousel from '../components/MostWantedCarousel';
import PromoBanner from '../components/PromoBanner';
import NoteCollectionsSection from '../components/NoteCollectionsSection';
import TrendingHousesSection from '../components/TrendingHousesSection';
import CountersBar from '../components/CountersBar';
import LazyOnView from '../components/LazyOnView';
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

const TOTAL_HEADER = 106; // announcement(36) + header(70)

const Home = () => {
  const { addToCart, toggleFavorite, isFavorite, products } = useShop();

  const [openFaq, setOpenFaq] = useState(null);

  // --- HERO LOGIC ---
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(0);

  // --- SEDES SLIDER (MOBILE & TABLET) ---
  const [activeSedeIndex, setActiveSedeIndex] = useState(0);
  const [sedeTouchStart, setSedeTouchStart] = useState(0);

  const handleSedeTouchStart = (e) => {
    setSedeTouchStart(e.targetTouches[0].clientX);
  };

  const handleSedeTouchEnd = (e) => {
    const touchEnd = e.changedTouches[0].clientX;
    const diff = sedeTouchStart - touchEnd;
    if (diff > 45) {
      setActiveSedeIndex(1);
    } else if (diff < -45) {
      setActiveSedeIndex(0);
    }
  };

  // Pre-cargar todos los slides del hero en memoria
  useEffect(() => {
    HERO_SLIDES.forEach(s => {
      const d = new Image(); d.src = s.imageDesktop;
      const m = new Image(); m.src = s.imageMobile;
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);

  const handleTouchStart = (e) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchEnd = (e) => {
    const touchEnd = e.changedTouches[0].clientX;
    if (touchStart - touchEnd > 50) nextSlide();
    if (touchStart - touchEnd < -50) prevSlide();
  };

  return (
    <div>

      {/* ════ 1. HERO PRINCIPAL EXISTENTE ════ */}
      <section 
        className="hero-section"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          position: 'relative',
          paddingTop: `${TOTAL_HEADER}px`,
          boxSizing: 'border-box',
          backgroundColor: '#0a0a0a'
        }}
      >
        <button
          onClick={prevSlide}
          aria-label="Anterior"
          className="hero-arrow"
          style={{
            position: 'absolute',
            left: '2rem',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            zIndex: 10,
            opacity: 0.6,
            transition: 'opacity 0.3s',
            padding: '1rem'
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '1'}
          onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}
        >
          <span style={{ fontSize: '1.5rem', fontFamily: 'monospace' }}>&#x2039;</span>
        </button>

        <button
          onClick={nextSlide}
          aria-label="Siguiente"
          className="hero-arrow"
          style={{
            position: 'absolute',
            right: '2rem',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            zIndex: 10,
            opacity: 0.6,
            transition: 'opacity 0.3s',
            padding: '1rem'
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '1'}
          onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}
        >
          <span style={{ fontSize: '1.5rem', fontFamily: 'monospace' }}>&#x203A;</span>
        </button>

        <div style={{ position: 'absolute', inset: 0 }}>
          {HERO_SLIDES.map((slide, index) => (
            <div
              key={slide.id}
              style={{
                position: 'absolute',
                inset: 0,
                opacity: currentSlide === index ? 1 : 0,
                transition: 'opacity 0.8s ease-in-out',
                pointerEvents: currentSlide === index ? 'auto' : 'none'
              }}
            >
              <picture>
                <source media="(max-width: 768px)" srcSet={slide.imageMobile} />
                <img
                  src={slide.imageDesktop}
                  alt={slide.title}
                  loading={index === 0 ? "eager" : "lazy"}
                  fetchPriority={index === 0 ? "high" : "auto"}
                  decoding="async"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center',
                    transform: currentSlide === index ? 'scale(1)' : 'scale(1.05)',
                    transition: 'transform 7s ease-out'
                  }}
                />
              </picture>

              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.4) 100%)'
                }}
              />

              <div
                style={{
                  position: 'relative',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  paddingBottom: 'clamp(2.5rem, 6vh, 4.5rem)',
                  textAlign: 'center',
                  zIndex: 2,
                  paddingLeft: '1.5rem',
                  paddingRight: '1.5rem'
                }}
              >
                <div style={{ maxWidth: '700px', width: '100%' }}>
                  <p
                    style={{
                      color: 'var(--color-gold)',
                      fontSize: 'clamp(0.65rem, 1.2vw, 0.78rem)',
                      letterSpacing: 'clamp(2px, 0.5vw, 4px)',
                      textTransform: 'uppercase',
                      marginBottom: '0.4rem',
                      fontWeight: '500'
                    }}
                  >
                    {slide.campaign}
                  </p>

                  <h1
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: 'clamp(1.75rem, 5vw, 3.2rem)',
                      color: 'white',
                      fontWeight: '400',
                      letterSpacing: 'clamp(1px, 0.3vw, 2px)',
                      marginBottom: '0.5rem',
                      lineHeight: 1.15
                    }}
                  >
                    {slide.title}
                  </h1>

                  <p
                    style={{
                      color: 'rgba(255,255,255,0.85)',
                      fontSize: 'clamp(0.78rem, 1.5vw, 0.95rem)',
                      fontWeight: '300',
                      marginBottom: '1.3rem',
                      letterSpacing: '0.5px'
                    }}
                  >
                    {slide.subtitle}
                  </p>

                  <Link
                    to={slide.buttonLink}
                    style={{
                      display: 'inline-block',
                      backgroundColor: 'white',
                      color: 'var(--color-black)',
                      padding: 'clamp(0.65rem, 1.5vh, 0.85rem) clamp(1.8rem, 4vw, 2.5rem)',
                      fontSize: 'clamp(0.68rem, 1.2vw, 0.75rem)',
                      letterSpacing: '2px',
                      textTransform: 'uppercase',
                      fontWeight: '500',
                      textDecoration: 'none',
                      transition: 'all 0.3s ease',
                      border: '1px solid white'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.color = 'var(--color-black)';
                    }}
                  >
                    {slide.buttonText}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: '1.2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '8px',
            zIndex: 10
          }}
        >
          {HERO_SLIDES.map((_, index) => (
            <div
              key={index}
              onClick={() => setCurrentSlide(index)}
              style={{
                width: currentSlide === index ? '28px' : '6px',
                height: '3px',
                backgroundColor: currentSlide === index ? 'white' : 'rgba(255,255,255,0.4)',
                borderRadius: '2px',
                transition: 'all 0.4s ease',
                cursor: 'pointer'
              }}
            />
          ))}
        </div>

        <style>{`
          .hero-section { height: 100vh; height: 100dvh; width: 100%; overflow: hidden; }
          @media (max-width: 768px) {
            .hero-arrow { display: none !important; }
          }
        `}</style>
      </section>

      {/* ════ 2. BARRA DE BENEFICIOS (NUEVA) ════ */}
      <BenefitsBar />

      {/* ════ 3. LOS MÁS DESEADOS DEL MES (NUEVO CARRUSEL) ════ */}
      <MostWantedCarousel 
        products={products} 
        onFav={toggleFavorite} 
        isFavorite={isFavorite} 
        onAdd={addToCart} 
      />

      {/* ════ 4. FAVORITOS EN OFERTA (SECCIÓN EXISTENTE) ════ */}
      <OffersSection />

      {/* ════ 5. BANNER PROMOCIONAL (NUEVO) ════ */}
      <PromoBanner />

      {/* ════ 6. COLECCIONES POR NOTAS (NUEVA) ════ */}
      <NoteCollectionsSection />

      {/* ════ 7. CASAS EN TENDENCIA (NUEVA) ════ */}
      <TrendingHousesSection />

      {/* ════ 8. BARRA DE CONTADORES (NUEVA) ════ */}
      <CountersBar />

      {/* ════ 9. VIDEOS: MOMENTOS QUE SE QUEDAN EN LA PIEL (EXISTENTE REORGANIZADA) ════ */}
      <LazyOnView minHeight={520}>
        <Suspense fallback={null}><InstagramReelsSection /></Suspense>
      </LazyOnView>

      {/* ════ 10. SEDES FÍSICAS (EXISTENTE) ════ */}
      <section id="sedes" className="section-padding container">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{
            fontSize: '0.72rem',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: '#B99A5B',
            fontWeight: '600',
            fontFamily: 'var(--font-sans)',
            display: 'block',
            marginBottom: '0.4rem'
          }}>
            PALMIRA, VALLE DEL CAUCA
          </span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: '400', color: 'var(--color-black)', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>
            Nuestras Sedes
          </h2>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.92rem', color: '#777', letterSpacing: '0.3px', maxWidth: '620px', margin: '0 auto' }}>
            Visítanos en nuestras dos ubicaciones físicas en Palmira o escríbenos directamente a la línea de WhatsApp de cada sede.
          </p>
        </div>

        {/* Pestañas selectoras en celular y tablet */}
        <div className="sedes-mobile-tabs">
          <button
            type="button"
            onClick={() => setActiveSedeIndex(0)}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: activeSedeIndex === 0 ? '1.5px solid #B99A5B' : '1px solid #ECE7DE',
              backgroundColor: activeSedeIndex === 0 ? '#111111' : '#FFFFFF',
              color: activeSedeIndex === 0 ? '#FFFFFF' : '#666666',
              fontSize: '0.78rem',
              fontWeight: '600',
              letterSpacing: '0.5px',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              fontFamily: 'var(--font-sans)',
              boxShadow: activeSedeIndex === 0 ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            Sede Calle 31 · Centro
          </button>
          <button
            type="button"
            onClick={() => setActiveSedeIndex(1)}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: activeSedeIndex === 1 ? '1.5px solid #B99A5B' : '1px solid #ECE7DE',
              backgroundColor: activeSedeIndex === 1 ? '#111111' : '#FFFFFF',
              color: activeSedeIndex === 1 ? '#FFFFFF' : '#666666',
              fontSize: '0.78rem',
              fontWeight: '600',
              letterSpacing: '0.5px',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              fontFamily: 'var(--font-sans)',
              boxShadow: activeSedeIndex === 1 ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            Sede C.C. Llanogrande
          </button>
        </div>

        {/* Carrusel Sedes */}
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
            {[
              {
                name: 'Sede Calle 31 · Centro',
                tag: 'Palmira · Centro',
                address: 'Calle 31 #27-44, Palmira, Valle',
                hours: 'Lunes a sábado: 9:00 a. m. – 12:30 p. m. y 2:30 p. m. – 7:00 p. m.',
                phoneFormatted: '+57 320 697 0036',
                img: '/sede_calle31.jpg',
                maps: 'https://maps.google.com/?q=Calle+31+%2327-44+Palmira+Valle+del+Cauca',
                wa: 'https://wa.me/573206970036?text=Hola%20DFV%20Perfumes%2C%20quisiera%20asesor%C3%ADa%20de%20la%20Sede%20Calle%2031%20Palmira',
              },
              {
                name: 'Sede C.C. Llanogrande',
                tag: 'Palmira · C.C. Llanogrande',
                address: 'Centro Comercial Llanogrande, Palmira, Valle',
                hours: 'L–J: 10:30 a. m. – 8:00 p. m. | V–S: 10:30 a. m. – 8:30 p. m. | D–F: 11:00 a. m. – 7:30 p. m.',
                phoneFormatted: '+57 320 862 7036',
                img: '/sede_llanogrande.jpg',
                maps: 'https://maps.google.com/?q=Centro+Comercial+Llanogrande+Palmira',
                wa: 'https://wa.me/573208627036?text=Hola%20DFV%20Perfumes%2C%20quisiera%20asesor%C3%ADa%20de%20la%20Sede%20Llanogrande%20Palmira',
              },
            ].map(s => (
              <div 
                key={s.name}
                className="sede-slide-item"
                style={{
                  width: '100%',
                  minWidth: '100%',
                  flex: '0 0 100%',
                  boxSizing: 'border-box'
                }}
              >
                <div 
                  className="sede-card"
                  style={{
                    border: '1px solid rgba(0,0,0,0.06)',
                    background: '#fff',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
                    width: '100%',
                    height: '100%'
                  }}
                >
                  <div style={{ aspectRatio: '16/9', overflow: 'hidden', position: 'relative' }}>
                    <img src={s.img} alt={s.name} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <span style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      backgroundColor: 'rgba(0,0,0,0.65)',
                      backdropFilter: 'blur(6px)',
                      color: '#fff',
                      fontSize: '0.68rem',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontWeight: '600'
                    }}>
                      {s.tag}
                    </span>
                  </div>
                  <div style={{ padding: '1.6rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif)', marginBottom: '0.4rem', color: '#111' }}>{s.name}</h3>
                      <p style={{ fontSize: '0.88rem', color: '#444', marginBottom: '0.3rem', letterSpacing: '0.3px' }}>📍 {s.address}</p>
                      <p style={{ fontSize: '0.78rem', color: '#777', marginBottom: '0.5rem', lineHeight: '1.5' }}>🕒 {s.hours}</p>
                      <p style={{ fontSize: '0.86rem', color: '#059669', marginBottom: '1.4rem', fontWeight: '600' }}>
                        💬 WhatsApp: {s.phoneFormatted}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.8rem' }}>
                      <a href={s.maps} target="_blank" rel="noreferrer" style={{ flex: 1, padding: '0.75rem', fontSize: '0.7rem', textAlign: 'center', border: '1px solid #ddd', color: '#333', letterSpacing: '1px', textTransform: 'uppercase', textDecoration: 'none', fontWeight: '600', borderRadius: '4px' }}>CÓMO LLEGAR</a>
                      <a href={s.wa} target="_blank" rel="noreferrer" style={{ flex: 1, padding: '0.75rem', fontSize: '0.7rem', textAlign: 'center', background: '#111', color: '#fff', letterSpacing: '1px', textTransform: 'uppercase', textDecoration: 'none', fontWeight: '600', borderRadius: '4px' }}>WHATSAPP</a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Controles de cambio en celular y tablet */}
        <div className="sedes-mobile-controls">
          <button
            type="button"
            onClick={() => setActiveSedeIndex(0)}
            aria-label="Sede anterior"
            disabled={activeSedeIndex === 0}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: '1px solid #E5E0D8',
              background: activeSedeIndex === 0 ? '#F9F8F6' : '#FFFFFF',
              color: activeSedeIndex === 0 ? '#BBB' : '#111',
              cursor: activeSedeIndex === 0 ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: activeSedeIndex === 0 ? 'none' : '0 2px 8px rgba(0,0,0,0.06)',
              transition: 'all 0.2s'
            }}
          >
            <ChevronLeft size={20} />
          </button>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setActiveSedeIndex(0)}
              aria-label="Ver Sede Calle 31"
              style={{
                width: activeSedeIndex === 0 ? '36px' : '14px',
                height: '7px',
                borderRadius: '999px',
                border: 'none',
                backgroundColor: activeSedeIndex === 0 ? '#B99A5B' : '#DCD7CE',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                padding: 0
              }}
            />
            <button
              type="button"
              onClick={() => setActiveSedeIndex(1)}
              aria-label="Ver Sede C.C. Llanogrande"
              style={{
                width: activeSedeIndex === 1 ? '36px' : '14px',
                height: '7px',
                borderRadius: '999px',
                border: 'none',
                backgroundColor: activeSedeIndex === 1 ? '#B99A5B' : '#DCD7CE',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                padding: 0
              }}
            />
          </div>

          <button
            type="button"
            onClick={() => setActiveSedeIndex(1)}
            aria-label="Sede siguiente"
            disabled={activeSedeIndex === 1}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: '1px solid #E5E0D8',
              background: activeSedeIndex === 1 ? '#F9F8F6' : '#FFFFFF',
              color: activeSedeIndex === 1 ? '#BBB' : '#111',
              cursor: activeSedeIndex === 1 ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: activeSedeIndex === 1 ? 'none' : '0 2px 8px rgba(0,0,0,0.06)',
              transition: 'all 0.2s'
            }}
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <p className="sedes-swipe-hint">
          {activeSedeIndex === 0 ? 'Desliza hacia la izquierda para ver Sede C.C. Llanogrande ➔' : '◀ Desliza hacia la derecha para ver Sede Calle 31'}
        </p>

        <style>{`
          .sedes-mobile-tabs,
          .sedes-mobile-controls,
          .sedes-swipe-hint {
            display: none;
          }
          @media (min-width: 1025px) {
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
          @media (max-width: 1024px) {
            .sedes-mobile-tabs {
              display: flex !important;
              gap: 10px;
              margin-bottom: 1.4rem;
            }
            .sedes-slider-wrapper {
              overflow: hidden !important;
              width: 100% !important;
            }
            .sedes-mobile-controls {
              display: flex !important;
              justify-content: center;
              align-items: center;
              gap: 1.4rem;
              margin-top: 1.4rem;
            }
            .sedes-swipe-hint {
              display: block !important;
              text-align: center;
              font-size: 0.76rem;
              color: #888;
              margin-top: 0.6rem;
              letter-spacing: 0.5px;
            }
          }
        `}</style>
      </section>

      {/* ════ 11. PREGUNTAS FRECUENTES (EXISTENTE REORGANIZADA) ════ */}
      <section style={{ backgroundColor: '#FCFBF9', padding: '4rem 0 3rem', borderTop: '1px solid #EAE8E4' }}>
        <div className="container" style={{ maxWidth: '640px' }}>
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

      {/* ════ 12. MEDIOS DE PAGO Y ALIADOS (EXISTENTE) ════ */}
      <section style={{ padding: '3.5rem 0', backgroundColor: '#fff', borderTop: '1px solid #EAE8E4' }}>
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
      textAlign: 'left', 
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
          src={optimizeImg(product.image, 400)} 
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
      
      {/* Etiqueta de Descuento Discreta */}
      {product.discount && (
        <span style={{ 
          position: 'absolute', 
          top: '10px', 
          left: '10px', 
          background: 'rgba(10, 10, 10, 0.9)', 
          backdropFilter: 'blur(4px)',
          color: '#fff', 
          padding: '3px 7px', 
          fontSize: '0.58rem', 
          letterSpacing: '0.5px', 
          fontWeight: '600', 
          textTransform: 'uppercase',
          borderRadius: '3px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
        }}>
          -{product.discount}%
        </span>
      )}

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

      {/* Botón Favorito Minimalista con fondo suave */}
      <button
        onClick={(e) => { e.preventDefault(); onFav(); }}
        style={{
          position: 'absolute', top: '10px', right: '10px',
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(4px)',
          border: 'none', cursor: 'pointer',
          width: '30px', height: '30px',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          zIndex: 6,
          boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
        }}
        className={fav ? 'fav-active' : ''}
        aria-label="Guardar en favoritos"
      >
        <Heart size={15} strokeWidth={1.8} color={fav ? '#E11D48' : '#222'} fill={fav ? '#E11D48' : 'none'} />
      </button>

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
    
    <div className="product-card__info" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, padding: '0 0.1rem' }}>
      <Link to={`/producto/${product.id}`} style={{ textDecoration: 'none' }}>
        <h3 style={{ 
          fontFamily: 'var(--font-serif)', 
          fontSize: 'clamp(0.9rem, 1.4vw, 1rem)', 
          fontWeight: '500', 
          color: '#1A1A1A', 
          lineHeight: '1.3', 
          marginBottom: '0.3rem',
          minHeight: '2.6em',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
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
        margin: '0 0 0.2rem 0' 
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
        margin: '0 0 0.5rem 0' 
      }}>
        {product.category}
      </p>
      
      <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem', alignItems: 'baseline', marginBottom: '0.5rem' }}>
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
            backgroundColor: '#FAF9F6',
            border: '1px solid #D5D0C6',
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
