import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { products, brands } from '../data/mockProducts';
import { Heart, ArrowRight, CheckCircle, Truck, MessageCircle, ShieldCheck, Plus, Minus, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [openFaq, setOpenFaq] = useState(null);
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

      {/* ════ PREGUNTAS FRECUENTES ════ */}
      <section style={{ backgroundColor: '#fff', padding: '3rem 0 2rem' }}>
        <div className="container" style={{ maxWidth: '600px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: '400', color: 'var(--color-black)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
              Preguntas Frecuentes
            </h2>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: '#666', lineHeight: '1.5', fontWeight: '300' }}>
              Encuentra respuestas a las preguntas más comunes sobre nuestros perfumes, compras y atención.
            </p>
          </div>

          <div style={{ borderTop: '1px solid #EAE8E4' }}>
            {[
              {
                q: '¿Cómo puedo realizar una compra?',
                a: 'Puedes explorar nuestro catálogo, seleccionar el perfume que deseas y agregarlo al carrito. Luego podrás revisar tu pedido, ingresar tus datos y finalizar la compra. Al finalizar, tu pedido será enviado a nuestro canal de WhatsApp para confirmar la información y continuar con la atención.'
              },
              {
                q: '¿Los perfumes son originales?',
                a: 'Sí. Trabajamos con perfumes originales e importados. En cada producto encontrarás la información disponible sobre la fragancia, su marca, presentación y precio.'
              },
              {
                q: '¿Realizan envíos?',
                a: 'Sí, contamos con opciones de entrega según la ciudad y la disponibilidad del servicio. Si tienes dudas sobre la entrega de tu pedido, puedes comunicarte con nosotros por WhatsApp.'
              },
              {
                q: '¿Qué métodos de pago tienen disponibles?',
                a: 'Los métodos de pago disponibles se informarán durante el proceso de compra o mediante nuestro canal de atención por WhatsApp.'
              },
              {
                q: '¿Puedo recibir ayuda para elegir un perfume?',
                a: 'Claro. Si no sabes qué fragancia elegir, puedes comunicarte con nosotros por WhatsApp y recibir orientación según tus preferencias, el tipo de fragancia que buscas y la ocasión para la que la necesitas.'
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

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: '0.75rem', color: '#888', marginBottom: '0.6rem', letterSpacing: '1px' }}>¿NECESITAS MÁS AYUDA?</p>
            <a 
              href="https://wa.me/573000000000" 
              target="_blank" 
              rel="noreferrer"
              style={{
                display: 'inline-block', fontSize: '0.7rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--color-black)', borderBottom: '1px solid var(--color-black)', paddingBottom: '3px', fontWeight: '500', textDecoration: 'none', transition: 'opacity 0.3s'
              }}
              onMouseEnter={e => e.target.style.opacity = 0.6}
              onMouseLeave={e => e.target.style.opacity = 1}
            >
              CONSULTAR POR WHATSAPP
            </a>
          </div>
        </div>
      </section>

      {/* ════ TRAYECTORIA DE LA MARCA ════ */}
      <section style={{ backgroundColor: '#F9F8F6', padding: '3rem 0', borderTop: '1px solid #EAE8E4' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.6rem', letterSpacing: '3px', color: '#888', textTransform: 'uppercase', marginBottom: '1.2rem' }}>
            DESDE 1992
          </p>
          <div style={{ width: '1px', height: '20px', backgroundColor: '#D5D1C8', margin: '0 auto 1.2rem' }} />
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: '400', color: '#111', letterSpacing: '1px', marginBottom: '0.8rem' }}>
            MÁS DE 30 AÑOS DE TRAYECTORIA
          </h2>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', color: '#666', fontStyle: 'italic' }}>
            Perfumes originales e importados.
          </p>
        </div>
      </section>

      {/* ════ OPCIONES DE PAGO Y ALIADOS ════ */}
      <section style={{ padding: '3rem 0', backgroundColor: '#fff', borderTop: '1px solid #EAE8E4' }}>
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
            </div>
          </div>

          {/* Nuestros Aliados */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#888', marginBottom: '1.5rem' }}>
              NUESTROS ALIADOS
            </h4>
            <div className="allies-logos" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '3rem', opacity: 0.85 }}>
              <img src="/addi.png" alt="Addi" style={{ height: '24px', width: 'auto', objectFit: 'contain' }} />
              <img src="/sistecredito.png" alt="Sistecrédito" style={{ height: '18px', width: 'auto', objectFit: 'contain' }} />
              <img src="/bold.png" alt="Bold" style={{ height: '26px', width: 'auto', objectFit: 'contain' }} />
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
