import React from 'react';
import { Link } from 'react-router-dom';
import { products, brands } from '../data/mockProducts';

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <section style={{ height: '100vh', position: 'relative', display: 'flex', alignItems: 'center', marginTop: '-115px', backgroundImage: 'url(https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1400&auto=format&fit=crop)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' }}></div>
        <div className="container" style={{ position: 'relative', zIndex: 1, color: 'var(--color-white)', maxWidth: '600px', width: '100%' }}>
          <h2 style={{ fontSize: '1rem', letterSpacing: '2px', marginBottom: '1rem', color: 'var(--color-gold)' }}>TU ESENCIA, TU IDENTIDAD</h2>
          <h1 className="title-large" style={{ marginBottom: '2rem', lineHeight: '1.1' }}>Perfumes que<br />hablan de ti.</h1>
          <Link to="/tienda" className="btn-primary" style={{ backgroundColor: 'var(--color-gold)', borderColor: 'var(--color-gold)', color: 'var(--color-black)', width: 'max-content' }}>DESCUBRIR PERFUMES</Link>
        </div>
        <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', color: 'var(--color-white)', zIndex: 1, textAlign: 'center', letterSpacing: '2px', fontSize: '0.8rem' }}>
          SCROLL &darr;
        </div>
      </section>

      {/* Nuevos Ingresos */}
      <section className="section-padding container">
        <h2 className="title-medium text-center">Nuevos Ingresos</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
          {products.map(product => (
            <div key={product.id} style={{ textAlign: 'center' }}>
              <Link to={`/producto/${product.id}`}>
                <div style={{ position: 'relative', paddingBottom: '120%', overflow: 'hidden', backgroundColor: 'var(--color-cream)', marginBottom: '1rem' }}>
                  <img src={product.image} alt={product.name} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <h3 style={{ fontSize: '0.9rem', color: 'var(--color-gray)', textTransform: 'uppercase', letterSpacing: '1px' }}>{product.brand}</h3>
                <h4 style={{ fontSize: '1.2rem', margin: '0.5rem 0' }}>{product.name}</h4>
                <p style={{ fontWeight: '500' }}>${product.price}</p>
              </Link>
            </div>
          ))}
        </div>
      </section>
      {/* Marcas Carousel */}
      <section style={{ backgroundColor: 'var(--color-cream)', padding: '4rem 0', overflow: 'hidden' }}>
        <h2 className="title-medium text-center" style={{ marginBottom: '3rem' }}>Las marcas que amamos</h2>
        <div style={{ display: 'flex', width: 'max-content', animation: 'marquee 20s linear infinite' }}>
          {[...brands, ...brands, ...brands].map((brand, i) => (
            <div key={i} style={{ margin: '0 3rem', fontSize: '1.2rem', fontFamily: 'var(--font-serif)', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--color-gray)' }}>
              {brand}
            </div>
          ))}
        </div>
      </section>

      {/* Categorías */}
      <section className="section-padding container">
        <h2 className="title-medium text-center" style={{ marginBottom: '3rem' }}>Compra por categoría</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
          {['Mujer', 'Hombre', 'Unisex', 'Sets'].map(cat => (
            <Link key={cat} to={`/tienda?category=${cat}`} style={{ position: 'relative', height: '300px', backgroundColor: 'var(--color-black)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'absolute', inset: 0, opacity: 0.6, backgroundImage: 'url(https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=600&auto=format&fit=crop)', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
              <h3 style={{ position: 'relative', color: 'white', zIndex: 1, fontSize: '2rem', letterSpacing: '2px' }}>{cat}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Más Vendidos */}
      <section className="section-padding container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
          <h2 className="title-medium">Más Vendidos</h2>
          <Link to="/tienda" style={{ color: 'var(--color-gray)', textDecoration: 'underline', paddingBottom: '0.5rem' }}>VER TODOS</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1.5rem' }}>
          {products.filter(p => p.isBestSeller).map(product => (
            <div key={product.id} style={{ textAlign: 'center' }}>
              <Link to={`/producto/${product.id}`}>
                <div style={{ position: 'relative', paddingBottom: '120%', overflow: 'hidden', backgroundColor: 'var(--color-cream)', marginBottom: '1rem' }}>
                  <img src={product.image} alt={product.name} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <h3 style={{ fontSize: '0.8rem', color: 'var(--color-gray)', textTransform: 'uppercase', letterSpacing: '1px' }}>{product.brand}</h3>
                <h4 style={{ fontSize: '1.1rem', margin: '0.5rem 0' }}>{product.name}</h4>
                <p style={{ fontWeight: '500' }}>${product.price}</p>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Familias Olfativas */}
      <section className="section-padding container">
        <h2 className="title-medium text-center" style={{ marginBottom: '3rem' }}>Descubre por familia olfativa</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
          {['Dulces', 'Florales', 'Cítricos', 'Amaderados', 'Frescos', 'Frutales', 'Orientales'].map(family => (
            <Link key={family} to={`/tienda?family=${family}`} className="btn-secondary" style={{ borderRadius: '30px', padding: '0.8rem 1.5rem', border: '1px solid var(--color-gray-light)' }}>
              {family}
            </Link>
          ))}
        </div>
      </section>

      {/* Sección Promocional */}
      <section style={{ position: 'relative', padding: '8rem 2rem', textAlign: 'center', color: 'white', backgroundColor: '#111' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=1400&auto=format&fit=crop)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.4 }}></div>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px', margin: '0 auto' }}>
          <h2 className="title-medium">Encuentra tu nueva fragancia</h2>
          <p style={{ marginBottom: '2rem', fontSize: '1.1rem' }}>Descubre perfumes seleccionados para cada personalidad y ocasión.</p>
          <Link to="/tienda" className="btn-primary" style={{ backgroundColor: 'white', color: 'black', border: 'none' }}>EXPLORAR COLECCIÓN</Link>
        </div>
      </section>

      {/* Encuentra tu perfume Quiz Simple */}
      <section className="section-padding container" style={{ backgroundColor: 'var(--color-cream)', marginTop: '4rem', padding: '4rem 2rem', textAlign: 'center' }}>
        <h2 className="title-medium" style={{ marginBottom: '2rem' }}>Encuentra el perfume para ti</h2>
        <div style={{ maxWidth: '400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <select style={{ padding: '1rem', border: '1px solid var(--color-gray-light)', width: '100%' }}>
            <option>¿Para quién buscas?</option>
            <option>Hombre</option>
            <option>Mujer</option>
            <option>Unisex</option>
          </select>
          <select style={{ padding: '1rem', border: '1px solid var(--color-gray-light)', width: '100%' }}>
            <option>¿Qué estilo prefieres?</option>
            <option>Dulce</option>
            <option>Fresco</option>
            <option>Floral</option>
            <option>Amaderado</option>
          </select>
          <select style={{ padding: '1rem', border: '1px solid var(--color-gray-light)', width: '100%' }}>
            <option>¿Para qué ocasión?</option>
            <option>Uso diario</option>
            <option>Oficina</option>
            <option>Noche</option>
            <option>Ocasión especial</option>
          </select>
          <Link to="/tienda" className="btn-primary" style={{ marginTop: '1rem' }}>ENCONTRAR PERFUMES</Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
