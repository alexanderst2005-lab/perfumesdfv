import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { products, brands } from '../data/mockProducts';
import { Heart, ArrowRight, CheckCircle, Truck, MessageCircle, ShieldCheck, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';

const HERO_SLIDES = [
  {
    id: 1,
    campaign: 'ROYAL SAPPHIRE',
    title: 'LUJO EN TUS MANOS',
    subtitle: 'Descubre el poder de una joya embotellada.',
    buttonText: 'DESCUBRIR',
    buttonLink: '/tienda',
    imageDesktop: '/hero_campaign_1.jpg',
    imageMobile: '/hero_campaign_1.jpg',
    alignment: 'center'
  },
  {
    id: 2,
    campaign: 'BHARARA COLLECTION',
    title: 'LA DUPLA PERFECTA',
    subtitle: 'Fragancias para destacar en cualquier ocasión.',
    buttonText: 'VER COLECCIÓN',
    buttonLink: '/tienda',
    imageDesktop: '/hero_campaign_2.jpg',
    imageMobile: '/hero_campaign_2.jpg',
    alignment: 'center'
  },
  {
    id: 3,
    campaign: 'LATTAFA PARA ELLA',
    title: 'ESENCIA FEMENINA',
    subtitle: 'Aromas dulces y florales que enamoran.',
    buttonText: 'VER CATÁLOGO',
    buttonLink: '/tienda?cat=Mujer',
    imageDesktop: '/hero_campaign_3.jpg',
    imageMobile: '/hero_campaign_3.jpg',
    alignment: 'center'
  },
  {
    id: 4,
    campaign: "BADE'E AL OUD",
    title: 'MISTERIO ÁRABE',
    subtitle: 'Notas intensas y maderas exóticas.',
    buttonText: 'EXPLORAR',
    buttonLink: '/tienda',
    imageDesktop: '/hero_campaign_4.jpg',
    imageMobile: '/hero_campaign_4.jpg',
    alignment: 'center'
  }
];

const TOTAL_HEADER = 106; // announcement(36) + header(70)

const Home = () => {
  const { addToCart, toggleFavorite, isFavorite } = useShop();
  const [activeCategory, setActiveCategory] = useState('TODOS');
  const featured = products.slice(0, 4);
  const newArrivals = products.slice(0, 4);
  const bestSellers = products.filter(p => p.isBestSeller);

  let displayProducts = products;
  if (activeCategory !== 'TODOS') {
    if (activeCategory === 'OFERTAS') {
      displayProducts = products.filter(p => p.discount);
    } else {
      displayProducts = products.filter(p => p.category?.toUpperCase() === activeCategory);
    }
  }
  displayProducts = displayProducts.slice(0, 8);

  // --- HERO LOGIC ---
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(0);

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
          backgroundColor: '#000'
        }}
      >
        {HERO_SLIDES.map((slide, index) => (
          <div
            key={slide.id}
            style={{
              position: 'absolute',
              inset: 0,
              opacity: index === currentSlide ? 1 : 0,
              visibility: index === currentSlide ? 'visible' : 'hidden',
              transition: 'opacity 1.2s ease-in-out, visibility 1.2s ease-in-out',
              zIndex: index === currentSlide ? 1 : 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: slide.alignment === 'left' ? 'flex-start' : slide.alignment === 'right' ? 'flex-end' : 'center',
              textAlign: slide.alignment,
              padding: '0 5%',
            }}
          >
            <picture>
              <source media="(max-width: 768px)" srcSet={slide.imageMobile} />
              <img 
                src={slide.imageDesktop} 
                alt={slide.title} 
                loading={index === 0 ? "eager" : "lazy"}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  zIndex: -2,
                  transform: index === currentSlide ? 'scale(1.05)' : 'scale(1)',
                  transition: 'transform 7s ease-out'
                }}
              />
            </picture>
            
            {/* Overlay sutil adaptado a la alineación */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: slide.alignment === 'center' 
                ? 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.5) 100%)'
                : slide.alignment === 'left'
                ? 'linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 100%)'
                : 'linear-gradient(to left, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 100%)',
              zIndex: -1
            }} />

            {/* Contenido */}
            <div style={{
              maxWidth: '650px',
              width: '100%',
              opacity: index === currentSlide ? 1 : 0,
              transform: index === currentSlide ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 0.8s ease-out 0.3s'
            }}>
              <p style={{ color: '#fff', fontSize: '0.65rem', letterSpacing: '4px', textTransform: 'uppercase', opacity: 0.8, marginBottom: '1rem' }}>
                {slide.campaign}
              </p>
              <h1 style={{ color: '#fff', fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 6vw, 4.5rem)', fontWeight: '400', lineHeight: '1.1', marginBottom: '1rem', textShadow: '0 2px 20px rgba(0,0,0,0.4)' }}>
                {slide.title}
              </h1>
              <p style={{ color: '#fff', fontSize: '1rem', opacity: 0.85, marginBottom: '2.5rem', fontWeight: '300', textShadow: '0 1px 10px rgba(0,0,0,0.3)' }}>
                {slide.subtitle}
              </p>
              <Link
                to={slide.buttonLink}
                style={{
                  display: 'inline-block',
                  padding: '1.1rem 3rem',
                  border: '1px solid rgba(255,255,255,0.6)',
                  color: '#fff',
                  fontSize: '0.8rem',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  backgroundColor: 'transparent',
                  fontWeight: '500',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#fff';
                  e.target.style.color = '#000';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#fff';
                }}
              >
                {slide.buttonText}
              </Link>
            </div>
          </div>
        ))}

        {/* Flechas Desktop */}
        <button 
          onClick={prevSlide}
          className="hero-arrow hero-arrow-left"
          style={{ position: 'absolute', left: '2rem', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', zIndex: 10, opacity: 0.6, transition: 'opacity 0.3s' }}
          onMouseEnter={e => e.currentTarget.style.opacity = 1}
          onMouseLeave={e => e.currentTarget.style.opacity = 0.6}
        >
          <ChevronLeft size={40} strokeWidth={1} />
        </button>
        <button 
          onClick={nextSlide}
          className="hero-arrow hero-arrow-right"
          style={{ position: 'absolute', right: '2rem', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', zIndex: 10, opacity: 0.6, transition: 'opacity 0.3s' }}
          onMouseEnter={e => e.currentTarget.style.opacity = 1}
          onMouseLeave={e => e.currentTarget.style.opacity = 0.6}
        >
          <ChevronRight size={40} strokeWidth={1} />
        </button>

        {/* Indicadores Inferiores */}
        <div style={{ position: 'absolute', bottom: '2.5rem', display: 'flex', gap: '1rem', alignItems: 'center', zIndex: 10 }}>
          {HERO_SLIDES.map((_, idx) => (
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
              {idx < HERO_SLIDES.length - 1 && (
                <div style={{ width: '30px', height: '1px', backgroundColor: 'rgba(255,255,255,0.3)' }} />
              )}
            </div>
          ))}
        </div>

        <style>{`
          .hero-section { height: 110vh; min-height: 110vh; }
          @media (max-width: 768px) {
            .hero-section { height: 110vh; min-height: 110vh; }
            .hero-arrow { display: none !important; }
          }
        `}</style>
      </section>


      {/* ════ 2. NUESTROS PRODUCTOS (LA COLECCIÓN) ════ */}
      <section className="section-padding" style={{ backgroundColor: '#FCFBF9' }}>
        <div className="container">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: '400', marginBottom: '0.5rem', color: 'var(--color-black)', letterSpacing: '2px', textTransform: 'uppercase' }}>
              LA COLECCIÓN
            </h2>
            <p style={{ color: '#666', fontSize: '0.95rem', marginBottom: '1.5rem', letterSpacing: '0.5px', fontWeight: '300' }}>
              Fragancias seleccionadas para ti
            </p>
            <Link to="/tienda" style={{ fontSize: '0.7rem', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--color-black)', borderBottom: '1px solid var(--color-black)', paddingBottom: '3px', fontWeight: '500', transition: 'opacity 0.3s' }} onMouseEnter={e => e.target.style.opacity = 0.6} onMouseLeave={e => e.target.style.opacity = 1}>
              VER TODOS →
            </Link>
          </div>

          {/* Filtros Editoriales */}
          <div className="catalog-filters no-scrollbar" style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem', marginBottom: '3.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {['TODOS', 'MUJER', 'HOMBRE', 'UNISEX', 'OFERTAS'].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '0.75rem', letterSpacing: '2px', textTransform: 'uppercase',
                  color: activeCategory === cat ? '#000' : '#888',
                  fontWeight: activeCategory === cat ? '500' : '400',
                  borderBottom: activeCategory === cat ? '1px solid #000' : '1px solid transparent',
                  paddingBottom: '0.3rem', transition: 'all 0.3s ease', whiteSpace: 'nowrap'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="featured-grid">
            {displayProducts.map(p => (
              <ProductCard key={p.id} product={p} onFav={() => toggleFavorite(p)} fav={isFavorite(p.id)} onAdd={() => addToCart(p, 1, p.sizes?.[0])} />
            ))}
          </div>
        </div>

        <style>{`
          .catalog-filters { justify-content: center; }
          .featured-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 3rem 2rem; }
          @media (max-width: 1024px) {
            .featured-grid { grid-template-columns: repeat(3, 1fr); gap: 2.5rem 1.5rem; }
          }
          @media (max-width: 768px) {
            .catalog-filters { justify-content: flex-start; padding-left: 1.5rem; padding-right: 1.5rem; }
            .featured-grid { grid-template-columns: repeat(2, 1fr); gap: 2.5rem 1rem; }
          }
        `}</style>
      </section>

      {/* ════ 3. LA EXPERIENCIA DFV ════ */}
      <section className="section-padding">
        <div className="container" style={{ maxWidth: '800px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '4.5rem 2rem', alignItems: 'start' }}>
            {[
              {
                title: 'Fragancias Originales',
                desc: '100% auténticas y garantizadas para tu tranquilidad.',
                icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="10" width="12" height="11" rx="1"/><rect x="10" y="3" width="4" height="4" rx="1"/><line x1="12" y1="7" x2="12" y2="10"/><line x1="8" y1="14" x2="16" y2="14"/></svg>
              },
              {
                title: 'Atención por WhatsApp',
                desc: 'Te brindamos acompañamiento constante de forma inmediata.',
                icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /><path d="M9.5 9c-.3-.2-.5-.3-.8-.3s-.6.2-.8.5c-.3.4-.6 1-.6 1.4s.3 1.1.9 1.8c1.3 1.6 2.8 2.6 4.6 3.1.6.2 1.3.2 1.7-.1.4-.3.6-.8.8-1.2.1-.3.1-.7.1-.8-.2-.1-.8-.4-1.3-.6-.4-.2-.6-.2-.8-.1-.1.1-.3.4-.5.6-.2.2-.4.2-.6.1-.8-.4-1.6-1-2.2-1.7-.2-.2-.2-.4-.1-.6.1-.1.2-.2.3-.4.1-.1.1-.3 0-.5-.2-.4-.6-1.2-.7-1.3z" /></svg>
              },
              {
                title: 'Envíos a Todo el País',
                desc: 'Envíos seguros a nivel nacional con opción de pago contra entrega.',
                icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="8" width="15" height="10" rx="1"/><path d="M17 8h3l2 3v7h-5"/><circle cx="6" cy="19" r="2"/><circle cx="17" cy="19" r="2"/><line x1="2" y1="13" x2="17" y2="13"/></svg>
              },
              {
                title: 'Garantía y Asesoría',
                desc: 'Te ayudamos a descubrir tu aroma perfecto, pensado para ti.',
                icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3L12 3z"/></svg>
              }
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ marginBottom: '1.2rem', color: '#444' }}>
                  {item.icon}
                </div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: '400', letterSpacing: '0.5px', color: '#333', marginBottom: '0.6rem' }}>
                  {item.title}
                </h3>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: '#777', lineHeight: '1.6', maxWidth: '300px' }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ 5. SECCIÓN DE ATENCIÓN / TIENDA ════ */}
      <section className="section-padding">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: '400', color: 'var(--color-black)', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>
              Nuestras Sedes
            </h2>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', color: '#777', letterSpacing: '0.5px' }}>
              Visítanos y encuentra tu fragancia ideal.
            </p>
          </div>

          <div className="sedes-container no-scrollbar">
            {[
              {
                name: 'Sede Palmira',
                address: 'Calle 31 #27-44, Palmira',
                hours: 'L–V: 9 AM – 7 PM  |  S: 9 AM – 7 PM',
                img: 'https://images.unsplash.com/photo-1606159068539-43f36b99d1b2?q=80&w=700&auto=format&fit=crop',
                maps: '#',
                wa: 'https://wa.me/573000000000?text=Hola%20DFV%20Perfumes%20Sede%20Palmira',
              },
              {
                name: 'C.C. Llanogrande',
                address: 'Centro Comercial Llanogrande',
                hours: 'L–J: 10:30 AM – 8 PM  |  V–S: 10:30 AM – 8:30 PM  |  D–F: 11 AM – 7:30 PM',
                img: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?q=80&w=700&auto=format&fit=crop',
                maps: '#',
                wa: 'https://wa.me/573000000000?text=Hola%20DFV%20Perfumes%20Llanogrande',
              },
            ].map(s => (
              <div key={s.name} className="sede-card" style={{ border: '1px solid rgba(0,0,0,0.06)', background: '#fff', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ aspectRatio: '16/9', overflow: 'hidden' }}>
                  <img src={s.img} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-serif)', marginBottom: '0.4rem', color: '#222' }}>{s.name}</h3>
                  <p style={{ fontSize: '0.8rem', color: '#555', marginBottom: '0.2rem', letterSpacing: '0.5px' }}>{s.address}</p>
                  <p style={{ fontSize: '0.75rem', color: '#888', marginBottom: '1.5rem', lineHeight: '1.6' }}>{s.hours}</p>
                  <div style={{ display: 'flex', gap: '0.8rem' }}>
                    <a href={s.maps} style={{ flex: 1, padding: '0.6rem', fontSize: '0.65rem', textAlign: 'center', border: '1px solid #ddd', color: '#333', letterSpacing: '1px', textTransform: 'uppercase', textDecoration: 'none' }}>CÓMO LLEGAR</a>
                    <a href={s.wa} target="_blank" rel="noreferrer" style={{ flex: 1, padding: '0.6rem', fontSize: '0.65rem', textAlign: 'center', background: '#111', color: '#fff', letterSpacing: '1px', textTransform: 'uppercase', textDecoration: 'none' }}>WHATSAPP</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          .sedes-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 2rem;
          }
          @media (max-width: 768px) {
            .sedes-container {
              display: flex;
              overflow-x: auto;
              scroll-snap-type: x mandatory;
              gap: 1rem;
              padding-bottom: 1.5rem;
              margin: 0 -1.5rem;
              padding: 0 1.5rem 1.5rem 1.5rem;
              -webkit-overflow-scrolling: touch;
            }
            .sede-card {
              flex: 0 0 85%;
              scroll-snap-align: center;
            }
          }
        `}</style>
      </section>

      {/* ════ 6. MÉTODOS DE PAGO Y ALIADOS ════ */}
      <section style={{ padding: '3rem 0 2rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '800px' }}>
          
          {/* Métodos de Pago */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '0.9rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--color-black)', marginBottom: '1rem' }}>
              Métodos de Pago
            </h4>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', letterSpacing: '1px', color: '#666', textTransform: 'uppercase' }}>Transferencia</span>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', letterSpacing: '1px', color: '#666', textTransform: 'uppercase' }}>Efectivo</span>
            </div>
          </div>

          <div style={{ width: '30px', height: '1px', backgroundColor: 'var(--color-gold)', margin: '0 auto 2.5rem', opacity: 0.4 }} />

          {/* Nuestros Aliados */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '0.9rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--color-black)', marginBottom: '1.5rem' }}>
              Nuestros Aliados
            </h4>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '3rem', flexWrap: 'wrap', opacity: 0.85 }}>
              {/* Addi */}
              <div style={{ fontSize: '1.3rem', fontWeight: '700', fontFamily: 'var(--font-sans)', letterSpacing: '-1px', color: 'var(--color-black)' }}>
                addi
              </div>
              {/* Sistecrédito */}
              <div style={{ fontSize: '1rem', fontWeight: '600', fontFamily: 'var(--font-sans)', letterSpacing: '-0.3px', color: 'var(--color-black)', display: 'flex', alignItems: 'center' }}>
                <span style={{ fontWeight: '400' }}>siste</span>crédito
              </div>
              {/* Bold */}
              <div style={{ fontSize: '1.2rem', fontWeight: '800', fontFamily: 'var(--font-sans)', letterSpacing: '-0.5px', color: 'var(--color-black)' }}>
                bold.
              </div>
            </div>
          </div>

        </div>
      </section>


    </div>
  );
};

/* ── Shared Product Card Component ── */
export const ProductCard = ({ product, onFav, fav, onAdd }) => (
  <div className="product-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', textAlign: 'left', backgroundColor: 'transparent' }}>
    <div 
      className="product-card__image-wrap" 
      style={{ 
        position: 'relative', 
        aspectRatio: '4/5', 
        overflow: 'hidden', 
        backgroundColor: '#F9F8F6', 
        borderRadius: '6px',
        marginBottom: '1.2rem'
      }}
    >
      <Link to={`/producto/${product.id}`} style={{ display: 'block', width: '100%', height: '100%' }}>
        <img 
          src={product.image} 
          alt={product.name} 
          className="product-img"
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            transition: 'transform 0.6s ease'
          }} 
        />
      </Link>
      
      {/* Etiqueta de Descuento Discreta */}
      {product.discount && (
        <span style={{ 
          position: 'absolute', 
          top: '12px', 
          left: '12px', 
          background: '#111', 
          color: '#fff', 
          padding: '4px 10px', 
          fontSize: '0.6rem', 
          letterSpacing: '1.5px', 
          fontWeight: '500', 
          textTransform: 'uppercase',
          borderRadius: '2px' 
        }}>
          OFERTA · {product.discount}%
        </span>
      )}

      {/* Botón Corazón Minimalista */}
      <button
        onClick={(e) => { e.preventDefault(); onFav(); }}
        style={{
          position: 'absolute', top: '12px', right: '12px',
          background: 'transparent', border: 'none', cursor: 'pointer',
          padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
        className={fav ? 'fav-active' : ''}
      >
        <Heart size={20} strokeWidth={1.5} color={fav ? '#000' : '#444'} fill={fav ? '#000' : 'none'} />
      </button>

      {/* Botón "+" Premium */}
      {onAdd && (
        <button
          onClick={(e) => { e.preventDefault(); onAdd(); }}
          className="add-to-cart-btn"
          style={{ 
            position: 'absolute', 
            bottom: '12px', 
            right: '12px', 
            width: '32px', 
            height: '32px', 
            backgroundColor: '#111', 
            borderRadius: '50%',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            cursor: 'pointer', 
            border: 'none',
            color: '#fff',
            transition: 'transform 0.2s ease, background-color 0.2s ease',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}
        >
          <Plus size={16} strokeWidth={2} />
        </button>
      )}
    </div>
    
    <div className="product-card__info" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, padding: '0 0.2rem' }}>
      <p style={{ 
        fontFamily: 'var(--font-sans)', 
        fontSize: '0.65rem', 
        fontWeight: '500', 
        letterSpacing: '2px',
        textTransform: 'uppercase', 
        color: '#888', 
        marginBottom: '0.4rem' 
      }}>
        {product.brand}
      </p>
      
      <Link to={`/producto/${product.id}`} style={{ textDecoration: 'none' }}>
        <h3 style={{ 
          fontFamily: 'var(--font-serif)', 
          fontSize: '1rem', 
          fontWeight: '400', 
          color: '#111', 
          lineHeight: '1.3', 
          marginBottom: '0.8rem',
          height: '2.6em', /* Fuerza a que siempre ocupe el mismo espacio aunque sea de 1 línea */
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}>
          {product.name}
        </h3>
      </Link>
      
      <div style={{ marginTop: 'auto', display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.95rem', color: '#000', fontWeight: '500' }}>
          ${product.price.toLocaleString()}
        </span>
        {product.oldPrice && (
          <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '0.75rem', fontWeight: '300' }}>
            ${product.oldPrice.toLocaleString()}
          </span>
        )}
      </div>
    </div>

    <style>{`
      .product-card:hover .product-img {
        transform: scale(1.03);
      }
      .add-to-cart-btn:hover {
        transform: scale(1.1);
        background-color: #333 !important;
      }
      .add-to-cart-btn:active {
        transform: scale(0.95);
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
