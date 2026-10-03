import React from 'react';
import { Link } from 'react-router-dom';
import { products, brands } from '../data/mockProducts';
import { CheckCircle, ShieldCheck, Truck, MessageCircle, Heart } from 'lucide-react';

const Home = () => {
  const featuredProducts = products.slice(0, 4);
  const newArrivals = products.filter(p => p.id === 1 || p.id === 2 || p.id === 3 || p.id === 4);
  const bestSellers = products.filter(p => p.isBestSeller).slice(0, 4);

  return (
    <div style={{ paddingBottom: '65px' /* for mobile bottom nav */ }}>
      {/* 1. HERO */}
      <section style={{ height: '100vh', position: 'relative', display: 'flex', alignItems: 'center', marginTop: '-115px', backgroundImage: 'url(https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1400&auto=format&fit=crop)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)' }}></div>
        <div className="container" style={{ position: 'relative', zIndex: 1, color: 'var(--color-white)', maxWidth: '600px', width: '100%' }}>
          <h2 style={{ fontSize: '1rem', letterSpacing: '2px', marginBottom: '1rem', color: 'var(--color-gold)' }}>TU ESENCIA, TU IDENTIDAD</h2>
          <h1 className="title-large" style={{ fontFamily: 'var(--font-serif)', marginBottom: '2rem' }}>Fragancias que<br/>cuentan tu historia.</h1>
          <Link to="/tienda" className="btn-primary" style={{ backgroundColor: 'var(--color-white)', color: 'var(--color-black)', border: 'none' }}>
            DESCUBRIR COLECCIÓN
          </Link>
        </div>
        <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', color: 'white', fontSize: '0.8rem', letterSpacing: '2px', zIndex: 1, textAlign: 'center' }}>
          SCROLL <br/> ↓
        </div>
      </section>

      {/* 2. CATEGORÍAS RÁPIDAS */}
      <section className="section-padding container" style={{ paddingBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-serif)', textAlign: 'center', marginBottom: '2rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Descubre tu fragancia</h2>
        <div className="quick-categories" style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
          {['Hombre', 'Mujer', 'Unisex', 'Sets', 'Lujo', 'Ofertas'].map(cat => (
            <Link key={cat} to={`/tienda?category=${cat}`} style={{ minWidth: '120px', flex: 1, textAlign: 'center', border: '1px solid var(--color-gray-light)', padding: '1.5rem 1rem', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem', color: 'var(--color-black)' }}>
              {cat}
            </Link>
          ))}
        </div>
      </section>

      {/* 3. NUESTROS PRODUCTOS */}
      <section className="section-padding container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
          <div>
            <h2 className="title-medium" style={{ fontFamily: 'var(--font-serif)', marginBottom: '0.5rem' }}>Nuestros Productos</h2>
            <p style={{ color: 'var(--color-gray)' }}>Descubre nuestra selección de fragancias.</p>
          </div>
          <Link to="/tienda" className="view-all-link" style={{ fontSize: '0.9rem', letterSpacing: '1px', textTransform: 'uppercase', borderBottom: '1px solid var(--color-black)', paddingBottom: '2px' }}>
            VER TODOS &rarr;
          </Link>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '2rem' }}>
          {featuredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. ENCUENTRA TU PERFUME IDEAL */}
      <section style={{ position: 'relative', padding: '8rem 2rem', textAlign: 'center', color: 'white', backgroundColor: '#000', margin: '4rem 0' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=1400&auto=format&fit=crop)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.5 }}></div>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px', margin: '0 auto' }}>
          <h2 className="title-medium" style={{ fontFamily: 'var(--font-serif)' }}>Encuentra tu perfume ideal</h2>
          <p style={{ marginBottom: '2.5rem', fontSize: '1.1rem', color: 'var(--color-cream)' }}>Una fragancia para cada personalidad, momento y ocasión.</p>
          <Link to="/tienda" className="btn-primary" style={{ backgroundColor: 'transparent', border: '1px solid var(--color-gold)', color: 'var(--color-gold)' }}>
            EXPLORAR COLECCIÓN
          </Link>
        </div>
      </section>

      {/* 5. NUEVOS INGRESOS */}
      <section className="section-padding container">
        <h2 className="title-medium text-center" style={{ fontFamily: 'var(--font-serif)', marginBottom: '3rem' }}>Nuevos Ingresos</h2>
        <div className="product-carousel" style={{ display: 'flex', gap: '2rem', overflowX: 'auto', paddingBottom: '2rem', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
          {newArrivals.map(product => (
            <div key={product.id} style={{ minWidth: '250px', flex: '0 0 auto' }}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      {/* 6. MÁS VENDIDOS */}
      <section className="section-padding container">
        <h2 className="title-medium text-center" style={{ fontFamily: 'var(--font-serif)', marginBottom: '3rem' }}>Más Vendidos</h2>
        <div className="product-carousel" style={{ display: 'flex', gap: '2rem', overflowX: 'auto', paddingBottom: '2rem', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
          {bestSellers.map(product => (
            <div key={product.id} style={{ minWidth: '250px', flex: '0 0 auto' }}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      {/* 7. MARCAS */}
      <section style={{ backgroundColor: 'var(--color-cream)', padding: '4rem 0', overflow: 'hidden' }}>
        <h2 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-serif)', textAlign: 'center', marginBottom: '3rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Descubre nuestras marcas</h2>
        <div style={{ display: 'flex', width: 'max-content', animation: 'marquee 25s linear infinite' }}>
          {[...brands, ...brands, ...brands].map((brand, i) => (
            <div key={i} style={{ margin: '0 3rem', fontSize: '1.5rem', fontFamily: 'var(--font-serif)', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--color-gray)' }}>
              {brand}
            </div>
          ))}
        </div>
      </section>

      {/* 8. BENEFICIOS */}
      <section className="section-padding container" style={{ padding: '6rem 1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', textAlign: 'center' }}>
          <div>
            <CheckCircle size={32} style={{ margin: '0 auto 1rem', color: 'var(--color-gold)' }} />
            <h4 style={{ fontSize: '0.9rem', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Fragancias Originales</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-gray)' }}>100% auténticas y garantizadas.</p>
          </div>
          <div>
            <Truck size={32} style={{ margin: '0 auto 1rem', color: 'var(--color-gold)' }} />
            <h4 style={{ fontSize: '0.9rem', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Envíos a todo el país</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-gray)' }}>Rápidos y seguros a tu puerta.</p>
          </div>
          <div>
            <MessageCircle size={32} style={{ margin: '0 auto 1rem', color: 'var(--color-gold)' }} />
            <h4 style={{ fontSize: '0.9rem', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Atención Personalizada</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-gray)' }}>Te ayudamos a elegir tu esencia.</p>
          </div>
          <div>
            <ShieldCheck size={32} style={{ margin: '0 auto 1rem', color: 'var(--color-gold)' }} />
            <h4 style={{ fontSize: '0.9rem', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Compra Segura</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-gray)' }}>Tus datos están protegidos.</p>
          </div>
        </div>
      </section>

      {/* 9. VISÍTANOS (Sedes) */}
      <section className="section-padding container" style={{ borderTop: '1px solid var(--color-gray-light)' }}>
        <h2 className="title-medium text-center" style={{ fontFamily: 'var(--font-serif)', marginBottom: '3rem' }}>Visítanos</h2>
        <div className="product-carousel" style={{ display: 'flex', gap: '2rem', overflowX: 'auto', paddingBottom: '2rem', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
          
          {/* Sede Palmira */}
          <div style={{ minWidth: '300px', flex: '1', border: '1px solid var(--color-gray-light)', backgroundColor: 'var(--color-white)', overflow: 'hidden' }}>
            <div style={{ height: '250px', backgroundImage: 'url(https://images.unsplash.com/photo-1606159068539-43f36b99d1b2?q=80&w=800&auto=format&fit=crop)', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
            <div style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-serif)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Sede Palmira</h3>
              <p style={{ color: 'var(--color-gray)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Calle 31 #27-44, Palmira</p>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-gray)', marginBottom: '2rem' }}>
                <p><strong>L-V:</strong> 09:00 AM — 07:00 PM</p>
                <p><strong>S:</strong> 09:00 AM — 07:00 PM</p>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <a href="#" className="btn-secondary" style={{ flex: 1, textAlign: 'center', padding: '0.8rem', fontSize: '0.8rem' }}>CÓMO LLEGAR</a>
                <a href="#" className="btn-primary" style={{ flex: 1, textAlign: 'center', padding: '0.8rem', fontSize: '0.8rem' }}>WHATSAPP</a>
              </div>
            </div>
          </div>

          {/* Sede Llanogrande */}
          <div style={{ minWidth: '300px', flex: '1', border: '1px solid var(--color-gray-light)', backgroundColor: 'var(--color-white)', overflow: 'hidden' }}>
            <div style={{ height: '250px', backgroundImage: 'url(https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?q=80&w=800&auto=format&fit=crop)', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
            <div style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-serif)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Sede Llanogrande</h3>
              <p style={{ color: 'var(--color-gray)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Centro Comercial Llanogrande</p>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-gray)', marginBottom: '2rem' }}>
                <p><strong>L-J:</strong> 10:30 AM — 08:00 PM</p>
                <p><strong>V-S:</strong> 10:30 AM — 08:30 PM</p>
                <p><strong>D-F:</strong> 11:00 AM — 07:30 PM</p>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <a href="#" className="btn-secondary" style={{ flex: 1, textAlign: 'center', padding: '0.8rem', fontSize: '0.8rem' }}>CÓMO LLEGAR</a>
                <a href="#" className="btn-primary" style={{ flex: 1, textAlign: 'center', padding: '0.8rem', fontSize: '0.8rem' }}>WHATSAPP</a>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 10. FORMAS DE PAGO */}
      <section style={{ backgroundColor: 'var(--color-cream)', padding: '4rem 0' }}>
        <div className="container text-center">
          <h2 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-serif)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Formas de Pago</h2>
          <p style={{ color: 'var(--color-gray)', marginBottom: '3rem', fontSize: '0.9rem' }}>Elige la opción que más se adapte a ti.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.5rem' }}>
            <div style={{ backgroundColor: 'white', padding: '1.5rem', minWidth: '180px', border: '1px solid var(--color-gray-light)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Transferencia
            </div>
            <div style={{ backgroundColor: 'white', padding: '1.5rem', minWidth: '180px', border: '1px solid var(--color-gray-light)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Efectivo
            </div>
            <div style={{ backgroundColor: 'white', padding: '1.5rem', minWidth: '180px', border: '1px solid var(--color-gray-light)', position: 'relative', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-gray)' }}>
              <div style={{ position: 'absolute', top: '-10px', right: '-10px', backgroundColor: 'var(--color-black)', color: 'white', fontSize: '0.6rem', padding: '0.3rem 0.6rem', borderRadius: '12px', letterSpacing: '1px' }}>PRÓXIMAMENTE</div>
              Pago en Línea
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .quick-categories::-webkit-scrollbar, .product-carousel::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

// Componente para la Tarjeta de Producto rediseñada
const ProductCard = ({ product }) => (
  <div style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
    <Link to={`/producto/${product.id}`} style={{ position: 'relative', paddingBottom: '125%', overflow: 'hidden', backgroundColor: 'var(--color-cream)', marginBottom: '1rem' }}>
      <img src={product.image} alt={product.name} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
    </Link>
    <button style={{ position: 'absolute', top: '10px', right: '10px', color: 'var(--color-black)', backgroundColor: 'rgba(255,255,255,0.8)', padding: '8px', borderRadius: '50%' }}>
      <Heart size={18} />
    </button>
    <Link to={`/producto/${product.id}`} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <p style={{ fontSize: '0.75rem', color: 'var(--color-gray)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.2rem' }}>{product.brand}</p>
      <h3 style={{ fontSize: '1rem', marginBottom: '0.2rem', fontFamily: 'var(--font-sans)', fontWeight: '400' }}>{product.name}</h3>
      <p style={{ fontSize: '0.8rem', color: 'var(--color-gray)', marginBottom: '0.5rem' }}>100 ml</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
        <p style={{ fontWeight: '500' }}>${product.price}</p>
        <button style={{ padding: '0.4rem 0.8rem', border: '1px solid var(--color-black)', backgroundColor: 'transparent', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Agregar</button>
      </div>
    </Link>
  </div>
);

export default Home;
