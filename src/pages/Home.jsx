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
          height: '100svh',
          minHeight: '600px',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
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

        {/* CONTENIDO — alineado al fondo, con paddingBottom mayor para subir los textos */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          color: '#fff',
          width: '100%',
          maxWidth: '600px',
          padding: '0 1.5rem',
          paddingBottom: '10rem',
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
              padding: '0.85rem 2.5rem',
              border: '1px solid rgba(255,255,255,0.65)',
              color: '#fff',
              fontSize: '0.72rem',
              letterSpacing: '2.5px',
              textTransform: 'uppercase',
              backdropFilter: 'blur(8px)',
              backgroundColor: 'rgba(255,255,255,0.08)',
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
          /* Fallback para navegadores sin soporte svh (iOS < 16, Android < 12) */
          @supports not (height: 1svh) {
            .hero-section {
              height: 100vh !important;
            }
          }
        `}</style>
      </section>


      {/* ════ 2. NUESTROS PRODUCTOS ════ */}
      <section className="section-padding" style={{ backgroundColor: 'var(--color-white)' }}>
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

      {/* ════ 4. LA EXPERIENCIA DFV ════ */}
      <section className="section-padding" style={{ backgroundColor: 'var(--color-black)', color: 'var(--color-cream)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '800px' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: '400', marginBottom: '1.5rem' }}>
            Encuentra tu perfume ideal
          </h2>
          <p style={{ fontSize: '1rem', opacity: 0.8, marginBottom: '3.5rem', letterSpacing: '0.5px', fontWeight: '300' }}>
            Una fragancia para cada personalidad, momento y ocasión.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', textAlign: 'left' }}>
            {[
              'Fragancias originales',
              'Envíos a todo el país',
              'Atención personalizada',
              'Asesoría para elegir tu fragancia'
            ].map(b => (
              <div key={b} style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.9rem', fontWeight: '300', letterSpacing: '0.5px' }}>
                <CheckCircle size={18} style={{ color: 'var(--color-gold)', flexShrink: 0 }} />
                <span>{b}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ 5. SECCIÓN DE ATENCIÓN / TIENDA ════ */}
      <section className="section-padding" style={{ backgroundColor: 'var(--color-white)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: '400', color: 'var(--color-black)' }}>
              Nuestras Boutiques
            </h2>
          </div>

          <div className="no-scrollbar" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
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
              <div key={s.name} style={{ background: 'var(--color-cream)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '260px', overflow: 'hidden' }}>
                  <img src={s.img} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '2rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-serif)', marginBottom: '0.8rem', color: 'var(--color-black)' }}>{s.name}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-gray-dark)', marginBottom: '0.4rem', letterSpacing: '0.5px' }}>{s.address}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-gray)', marginBottom: '2rem', lineHeight: '1.7' }}>{s.hours}</p>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <a href={s.maps} style={{ flex: 1, padding: '0.75rem', fontSize: '0.75rem', textAlign: 'center', border: '1px solid var(--color-black)', color: 'var(--color-black)', letterSpacing: '1px', textTransform: 'uppercase' }}>CÓMO LLEGAR</a>
                    <a href={s.wa} target="_blank" rel="noreferrer" style={{ flex: 1, padding: '0.75rem', fontSize: '0.75rem', textAlign: 'center', background: 'var(--color-black)', color: 'var(--color-cream)', letterSpacing: '1px', textTransform: 'uppercase' }}>WHATSAPP</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ 6. MÉTODOS DE PAGO ════ */}
      <section style={{ padding: '4rem 0', backgroundColor: 'var(--color-cream)', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h4 style={{ fontSize: '0.75rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--color-gray)', marginBottom: '1.5rem' }}>MÉTODOS DE PAGO</h4>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap', opacity: 0.7 }}>
            <span style={{ fontSize: '0.9rem', letterSpacing: '1px', color: 'var(--color-black)' }}>TRANSFERENCIA BANCARIA</span>
            <span style={{ fontSize: '0.9rem', letterSpacing: '1px', color: 'var(--color-black)' }}>EFECTIVO</span>
            <span style={{ fontSize: '0.9rem', letterSpacing: '1px', color: 'var(--color-black)' }}>TARJETAS (PRÓXIMAMENTE)</span>
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
