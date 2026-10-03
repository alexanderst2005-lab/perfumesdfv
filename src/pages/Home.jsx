import React from 'react';
import { Link } from 'react-router-dom';
import { products, brands } from '../data/mockProducts';
import { Heart, ArrowRight, CheckCircle, Truck, MessageCircle, ShieldCheck } from 'lucide-react';
import { useShop } from '../context/ShopContext';

const TOTAL_HEADER = 106; // announcement(36) + header(70)

const Home = () => {
  const { addToCart, toggleFavorite, isFavorite } = useShop();
  const featured = products.slice(0, 4);
  const newArrivals = products.slice(0, 4);
  const bestSellers = products.filter(p => p.isBestSeller);

  return (
    <div>

      {/* ════ 1. HERO — PANTALLA COMPLETA ════
          
          ARQUITECTURA:
          • El header fijo (106px) es transparente y flota SOBRE la hero (no resta altura)
          • main tiene marginTop:0 en home, así que la hero empieza en y=0 del documento
          • height: 100svh = exactamente el viewport visible del móvil (excluye browser UI)
          • La imagen cubre inset:0 incluyendo los 106px detrás del header transparente
          • La siguiente sección empieza en y=100svh = fuera del viewport inicial ✓
      */}
      <section
        className="hero-section"
        style={{
          height: '100dvh',
          minHeight: '600px',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          textAlign: 'center',
        }}
      >
        {/* Imagen animada — cubre TODA la sección incluido el área del header */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(/hero.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          animation: 'kenBurns 18s ease-in-out infinite alternate',
          transformOrigin: 'center center',
          zIndex: 0,
        }} />

        {/* Gradiente — sutil arriba, oscuro abajo para leer el texto */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.02) 30%, rgba(0,0,0,0.55) 65%, rgba(0,0,0,0.88) 100%)',
          zIndex: 1,
        }} />

        {/* CONTENIDO — centrado verticalmente */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          color: '#fff',
          width: '100%',
          maxWidth: '600px',
          padding: '0 1.5rem',
        }}>
          <p style={{
            fontSize: '0.65rem',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            opacity: 0.6,
            marginBottom: '0.8rem',
            fontWeight: '400',
          }}>
            FRAGANCIAS DE LUJO
          </p>

          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.9rem, 6vw, 4.5rem)',
            fontWeight: '400',
            lineHeight: '1.15',
            marginBottom: '0.85rem',
            textShadow: '0 2px 30px rgba(0,0,0,0.6)',
          }}>
            Tu esencia,<br/>tu identidad.
          </h1>

          <p style={{
            fontSize: '0.9rem',
            opacity: 0.7,
            marginBottom: '2rem',
            fontWeight: '300',
            letterSpacing: '0.3px',
          }}>
            Fragancias que cuentan tu historia.
          </p>

          <Link
            to="/tienda"
            style={{
              display: 'inline-block',
              padding: '1.2rem 3rem',
              border: '1px solid rgba(255,255,255,0.4)',
              color: '#fff',
              fontSize: '0.8rem',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              backdropFilter: 'blur(10px)',
              backgroundColor: 'rgba(0,0,0,0.45)',
              fontWeight: '500',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(0,0,0,0.7)';
              e.target.style.borderColor = 'rgba(255,255,255,0.8)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(0,0,0,0.45)';
              e.target.style.borderColor = 'rgba(255,255,255,0.4)';
            }}
          >
            DESCUBRIR COLECCIÓN
          </Link>
        </div>

        {/* SCROLL — al borde inferior de la hero */}
        <div style={{
          position: 'absolute',
          bottom: '1rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 3,
          color: 'rgba(255,255,255,0.5)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.3rem',
        }}>
          <span style={{ fontSize: '0.5rem', letterSpacing: '3px', textTransform: 'uppercase' }}>SCROLL</span>
          <div style={{
            width: '1px',
            height: '30px',
            backgroundColor: 'rgba(255,255,255,0.3)',
            animation: 'scrollLine 2s ease-in-out infinite',
            transformOrigin: 'top',
          }} />
        </div>

        <style>{`
          @keyframes kenBurns {
            0%   { transform: scale(1)    translate(0, 0); }
            50%  { transform: scale(1.07) translate(-1%, 0.5%); }
            100% { transform: scale(1.05) translate(0.5%, -0.5%); }
          }
          @keyframes scrollLine {
            0%   { transform: scaleY(0); opacity: 0; }
            60%  { transform: scaleY(1); opacity: 1; }
            100% { transform: scaleY(1); opacity: 0; }
          }
          /* Fallback para navegadores sin soporte dvh */
          @supports not (height: 1dvh) {
            .hero-section {
              height: 100vh !important;
            }
          }
        `}</style>
      </section>


      {/* ════ 2. NUESTROS PRODUCTOS ════ */}
      <section className="section-padding">
        <div className="container">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.2rem', fontWeight: '500', marginBottom: '0.8rem', color: 'var(--color-black)', letterSpacing: '4px', textTransform: 'uppercase' }}>
              NUESTROS PRODUCTOS
            </h2>
            <p style={{ color: 'var(--color-gray)', fontSize: '0.9rem', marginBottom: '1.5rem', letterSpacing: '0.5px' }}>
              Descubre nuestra selección de fragancias.
            </p>
            <Link to="/tienda" style={{ fontSize: '0.75rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--color-black)', borderBottom: '1px solid var(--color-black)', paddingBottom: '3px' }}>
              VER TODOS →
            </Link>
          </div>

          <div className="featured-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem' }}>
            {products.slice(0, 8).map(p => (
              <ProductCard key={p.id} product={p} onFav={() => toggleFavorite(p)} fav={isFavorite(p.id)} onAdd={() => addToCart(p, 1, p.sizes?.[0])} />
            ))}
          </div>
        </div>

        <style>{`
          @media (max-width: 1024px) {
            .featured-grid { grid-template-columns: repeat(3,1fr) !important; }
          }
          @media (max-width: 768px) {
            .featured-grid { grid-template-columns: repeat(2,1fr) !important; gap: 1rem !important; }
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
  <div className="product-card" style={{ background: '#ffffff', display: 'flex', flexDirection: 'column', height: '100%' }}>
    <div className="product-card__image-wrap" style={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden' }}>
      <Link to={`/producto/${product.id}`}>
        <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </Link>
      {product.id % 2 !== 0 && (
        <span className="product-card__badge" style={{ position: 'absolute', top: '12px', left: '12px', background: '#333', color: '#fff', padding: '4px 8px', fontSize: '0.65rem', letterSpacing: '1px', fontWeight: '500' }}>NUEVO</span>
      )}
      <button
        className="product-card__fav"
        onClick={onFav}
        aria-label="Favorito"
        style={{ position: 'absolute', top: '12px', right: '12px', background: '#fff', border: 'none', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
      >
        <Heart size={16} fill={fav ? '#333' : 'none'} stroke={fav ? '#333' : '#666'} strokeWidth={1.5} />
      </button>
    </div>
    <div className="product-card__info" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      <Link to={`/producto/${product.id}`} style={{ textDecoration: 'none' }}>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', color: '#222', lineHeight: '1.4', marginBottom: '1rem' }}>
          {product.name}
        </p>
      </Link>
      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', color: '#444', letterSpacing: '0.5px' }}>$ {product.price.toLocaleString()}</span>
        {onAdd && (
          <button 
            onClick={(e) => { e.preventDefault(); onAdd(); }}
            style={{ 
              fontSize: '0.65rem', color: '#666', background: 'transparent', 
              border: 'none', borderBottom: '1px solid #ccc', paddingBottom: '2px',
              textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer', transition: 'var(--transition)'
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#000'; e.currentTarget.style.borderColor = '#000'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#666'; e.currentTarget.style.borderColor = '#ccc'; }}
            aria-label="Añadir a carrito"
          >
            Añadir
          </button>
        )}
      </div>
    </div>
  </div>
);

export default Home;
