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

      {/* ════ 1. HERO ════ */}
      <section style={{
        height: '100vh',
        minHeight: '600px',
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-end',
        marginTop: `-${TOTAL_HEADER}px`,
        backgroundImage: 'url(https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1600&auto=format&fit=crop)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.1) 60%)' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1, color: '#fff', paddingBottom: '5rem', maxWidth: '700px' }}>
          <p className="eyebrow" style={{ color: 'var(--color-gold)', marginBottom: '1rem' }}>DFV PERFUMES</p>
          <h1 className="title-xl" style={{ marginBottom: '1.5rem', fontWeight: '400' }}>
            Tu esencia,<br />tu identidad.
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.85, marginBottom: '2.5rem', fontWeight: '300' }}>
            Fragancias que cuentan tu historia.
          </p>
          <Link to="/tienda" className="btn-primary" style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(4px)' }}>
            DESCUBRIR COLECCIÓN
          </Link>
        </div>
      </section>

      {/* ════ 2. CATEGORÍAS ════ */}
      <section className="section-padding" style={{ backgroundColor: 'var(--color-cream)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p className="eyebrow" style={{ marginBottom: '0.75rem' }}>Por género y ocasión</p>
            <h2 className="title-md">Descubre tu fragancia</h2>
          </div>

          <div className="no-scrollbar" style={{ display: 'flex', gap: '1rem', paddingBottom: '0.5rem' }}>
            {[
              { label: 'Hombre', cat: 'Hombre', img: 'https://images.unsplash.com/photo-1547887538-047f814db358?q=80&w=400&auto=format&fit=crop' },
              { label: 'Mujer',  cat: 'Mujer',  img: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?q=80&w=400&auto=format&fit=crop' },
              { label: 'Unisex', cat: 'Unisex', img: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=400&auto=format&fit=crop' },
              { label: 'Sets',   cat: 'Sets',   img: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=400&auto=format&fit=crop' },
              { label: 'Ofertas',cat: 'Ofertas',img: 'https://images.unsplash.com/photo-1606159068539-43f36b99d1b2?q=80&w=400&auto=format&fit=crop' },
            ].map(c => (
              <Link
                key={c.label}
                to={`/tienda?category=${c.cat}`}
                style={{ flex: '0 0 auto', minWidth: '140px', position: 'relative', overflow: 'hidden', height: '180px', borderRadius: '4px', background: '#111' }}
              >
                <img src={c.img} alt={c.label} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6, transition: 'transform 0.4s ease' }}
                  onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                  onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                />
                <span style={{ position: 'absolute', bottom: '12px', left: '12px', color: '#fff', fontSize: '0.8rem', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: '500' }}>
                  {c.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ════ 3. NUESTROS PRODUCTOS ════ */}
      <section className="section-padding">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p className="eyebrow" style={{ marginBottom: '0.5rem' }}>Selección curada</p>
              <h2 className="title-md">Nuestros Productos</h2>
            </div>
            <Link to="/tienda" className="btn-ghost">VER TODOS <ArrowRight size={14} /></Link>
          </div>

          <div className="featured-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
            {featured.map(p => (
              <ProductCard key={p.id} product={p} onFav={() => toggleFavorite(p)} fav={isFavorite(p.id)} onAdd={() => addToCart(p, 1, p.sizes[0])} />
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

      {/* ════ 4. EDITORIAL BANNER ════ */}
      <section className="editorial-grid" style={{
        position: 'relative',
        backgroundColor: '#0a0a0a',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        minHeight: '420px',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <img
            src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=800&auto=format&fit=crop"
            alt="Perfume editorial"
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4rem 3rem', color: '#fff' }}>
          <p className="eyebrow" style={{ color: 'var(--color-gold)', marginBottom: '1.2rem' }}>La experiencia DFV</p>
          <h2 className="title-md" style={{ marginBottom: '1.5rem' }}>Encuentra tu<br/>perfume ideal</h2>
          <p style={{ opacity: 0.75, marginBottom: '2.5rem', fontSize: '0.95rem', lineHeight: '1.8' }}>
            Una fragancia para cada personalidad,<br/>momento y ocasión.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '2.5rem' }}>
            {['Fragancias originales', 'Envíos a todo el país', 'Atención personalizada'].map(b => (
              <div key={b} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', opacity: 0.85 }}>
                <CheckCircle size={16} style={{ color: 'var(--color-gold)', flexShrink: 0 }} /> {b}
              </div>
            ))}
          </div>
          <Link to="/tienda" className="btn-secondary" style={{ borderColor: 'rgba(255,255,255,0.4)', color: '#fff', alignSelf: 'flex-start' }}>
            DESCUBRIR COLECCIÓN →
          </Link>
        </div>

        <style>{`
          @media (max-width: 768px) {
            .editorial-grid { grid-template-columns: 1fr !important; }
            .editorial-grid > div:first-child { height: 220px; }
            .editorial-grid > div:last-child { padding: 2.5rem 1.5rem !important; }
          }
        `}</style>
      </section>

      {/* ════ 5. NUEVOS INGRESOS ════ */}
      <section className="section-padding" style={{ backgroundColor: 'var(--color-cream)' }}>
        <div className="container">
          <h2 className="title-md text-center" style={{ marginBottom: '3rem' }}>Nuevos Ingresos</h2>
          <div className="no-scrollbar" style={{ display: 'flex', gap: '1.25rem' }}>
            {newArrivals.map(p => (
              <div key={p.id} style={{ flex: '0 0 240px' }}>
                <ProductCard product={p} onFav={() => toggleFavorite(p)} fav={isFavorite(p.id)} onAdd={() => addToCart(p, 1, p.sizes[0])} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ 6. MARCAS ════ */}
      <section className="section-padding" style={{ borderTop: '1px solid var(--color-gray-light)', borderBottom: '1px solid var(--color-gray-light)', overflow: 'hidden' }}>
        <div className="container">
          <p className="eyebrow text-center" style={{ marginBottom: '2rem' }}>Nuestras marcas</p>
        </div>
        <div style={{ display: 'flex', width: 'max-content', animation: 'marquee 20s linear infinite' }}>
          {[...brands, ...brands, ...brands].map((b, i) => (
            <span key={i} style={{ padding: '0 3rem', fontSize: '1rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--color-gray)', fontFamily: 'var(--font-serif)', whiteSpace: 'nowrap' }}>
              {b}
            </span>
          ))}
        </div>
      </section>

      {/* ════ 7. BENEFICIOS ════ */}
      <section className="section-padding">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2.5rem', textAlign: 'center' }}>
            {[
              { icon: <CheckCircle size={28} />, title: 'Fragancias Originales', desc: '100% auténticas y garantizadas.' },
              { icon: <Truck size={28} />, title: 'Envíos a todo el país', desc: 'Rápidos y seguros a tu puerta.' },
              { icon: <MessageCircle size={28} />, title: 'Atención Personalizada', desc: 'Te ayudamos a elegir tu esencia.' },
              { icon: <ShieldCheck size={28} />, title: 'Compra Segura', desc: 'Tus datos están protegidos.' },
            ].map(b => (
              <div key={b.title}>
                <div style={{ color: 'var(--color-gold)', display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>{b.icon}</div>
                <h4 style={{ fontSize: '0.8rem', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.5rem', fontFamily: 'var(--font-sans)', fontWeight: '600' }}>{b.title}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-gray)' }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ 8. VISÍTANOS ════ */}
      <section className="section-padding" style={{ backgroundColor: 'var(--color-cream)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p className="eyebrow" style={{ marginBottom: '0.75rem' }}>Encuéntranos</p>
            <h2 className="title-md">Visítanos</h2>
            <p style={{ color: 'var(--color-gray)', marginTop: '0.75rem', fontSize: '0.95rem' }}>Encuentra nuestras tiendas y recibe atención personalizada.</p>
          </div>

          <div className="no-scrollbar" style={{ display: 'flex', gap: '1.5rem' }}>
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
              <div key={s.name} style={{ flex: '0 0 320px', flexGrow: 1, background: '#fff', overflow: 'hidden', border: '1px solid var(--color-gray-light)' }}>
                <div style={{ height: '220px', overflow: 'hidden' }}>
                  <img src={s.img} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-serif)', marginBottom: '0.4rem' }}>{s.name}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-gray)', marginBottom: '0.5rem' }}>{s.address}</p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--color-gray)', marginBottom: '1.5rem', lineHeight: '1.7' }}>{s.hours}</p>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <a href={s.maps} className="btn-secondary" style={{ flex: 1, padding: '0.65rem', fontSize: '0.72rem', textAlign: 'center' }}>CÓMO LLEGAR</a>
                    <a href={s.wa} target="_blank" rel="noreferrer" className="btn-primary" style={{ flex: 1, padding: '0.65rem', fontSize: '0.72rem', textAlign: 'center' }}>WHATSAPP</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ 9. FORMAS DE PAGO ════ */}
      <section className="section-padding">
        <div className="container text-center">
          <p className="eyebrow" style={{ marginBottom: '0.75rem' }}>Flexibilidad para ti</p>
          <h2 className="title-md" style={{ marginBottom: '0.75rem' }}>Formas de Pago</h2>
          <p style={{ color: 'var(--color-gray)', marginBottom: '3rem', fontSize: '0.9rem' }}>Elige la opción que más se adapte a ti.</p>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
            {[
              { label: 'Transferencia Bancaria', icon: '🏦', available: true },
              { label: 'Pago en Efectivo', icon: '💵', available: true },
              { label: 'Pago en Línea', icon: '💳', available: false },
            ].map(m => (
              <div key={m.label} style={{
                padding: '2rem 2.5rem',
                border: '1px solid var(--color-gray-light)',
                minWidth: '180px',
                position: 'relative',
                opacity: m.available ? 1 : 0.65,
              }}>
                <div style={{ fontSize: '1.8rem', marginBottom: '0.75rem' }}>{m.icon}</div>
                <p style={{ fontSize: '0.85rem', fontWeight: '500', letterSpacing: '0.5px' }}>{m.label}</p>
                {!m.available && (
                  <span style={{
                    position: 'absolute', top: '-10px', right: '-10px',
                    background: '#111', color: '#fff',
                    fontSize: '0.6rem', padding: '0.25rem 0.6rem',
                    borderRadius: '20px', letterSpacing: '1px',
                  }}>PRÓXIMAMENTE</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

/* ── Shared Product Card Component ── */
export const ProductCard = ({ product, onFav, fav, onAdd }) => (
  <div className="product-card">
    <div className="product-card__image-wrap">
      <Link to={`/producto/${product.id}`}>
        <img src={product.image} alt={product.name} />
      </Link>
      <button
        className="product-card__fav"
        onClick={onFav}
        aria-label="Favorito"
        style={{ border: 'none', cursor: 'pointer' }}
      >
        <Heart
          size={16}
          fill={fav ? 'var(--color-gold)' : 'none'}
          stroke={fav ? 'var(--color-gold)' : 'var(--color-gray-dark)'}
        />
      </button>
    </div>
    <div className="product-card__info">
      <p className="product-card__brand">{product.brand}</p>
      <Link to={`/producto/${product.id}`}>
        <p className="product-card__name">{product.name}</p>
      </Link>
      <p className="product-card__size">{product.sizes?.[0] || '100 ml'}</p>
      <div className="product-card__footer">
        <span className="product-card__price">${product.price.toLocaleString()}</span>
        <button className="product-card__btn" onClick={onAdd}>AGREGAR</button>
      </div>
    </div>
  </div>
);

export default Home;
