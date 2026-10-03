import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={{ backgroundColor: 'var(--color-black)', color: 'var(--color-white)', padding: '5rem 0 3rem 0', marginTop: 'auto', borderTop: '1px solid #222' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', marginBottom: '4rem' }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '1rem', letterSpacing: '2px' }}>DFV PERFUMES</h3>
          <p style={{ color: 'var(--color-gray-light)', fontSize: '0.9rem', marginBottom: '2rem' }}>Tu esencia, tu identidad.<br/>Perfumes que hablan de ti.</p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <a href="#" style={{ color: 'var(--color-white)', opacity: 0.8 }}>Instagram</a>
            <a href="#" style={{ color: 'var(--color-white)', opacity: 0.8 }}>Facebook</a>
            <a href="#" style={{ color: 'var(--color-white)', opacity: 0.8 }}>TikTok</a>
          </div>
        </div>
        
        <div>
          <h4 style={{ marginBottom: '1.5rem', fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--color-gray-light)' }}>Tienda</h4>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <li><Link to="/tienda" style={{ color: 'var(--color-white)', fontSize: '0.9rem', opacity: 0.8 }}>Todos los productos</Link></li>
            <li><Link to="/tienda?category=Hombre" style={{ color: 'var(--color-white)', fontSize: '0.9rem', opacity: 0.8 }}>Hombre</Link></li>
            <li><Link to="/tienda?category=Mujer" style={{ color: 'var(--color-white)', fontSize: '0.9rem', opacity: 0.8 }}>Mujer</Link></li>
            <li><Link to="/tienda?category=Unisex" style={{ color: 'var(--color-white)', fontSize: '0.9rem', opacity: 0.8 }}>Unisex</Link></li>
            <li><Link to="/tienda?category=Marcas" style={{ color: 'var(--color-white)', fontSize: '0.9rem', opacity: 0.8 }}>Marcas</Link></li>
            <li><Link to="/tienda?category=Ofertas" style={{ color: 'var(--color-white)', fontSize: '0.9rem', opacity: 0.8 }}>Ofertas</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 style={{ marginBottom: '1.5rem', fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--color-gray-light)' }}>Ayuda</h4>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <li><Link to="#" style={{ color: 'var(--color-white)', fontSize: '0.9rem', opacity: 0.8 }}>Envíos</Link></li>
            <li><Link to="#" style={{ color: 'var(--color-white)', fontSize: '0.9rem', opacity: 0.8 }}>Cambios y devoluciones</Link></li>
            <li><Link to="#" style={{ color: 'var(--color-white)', fontSize: '0.9rem', opacity: 0.8 }}>Preguntas frecuentes</Link></li>
            <li><Link to="#" style={{ color: 'var(--color-white)', fontSize: '0.9rem', opacity: 0.8 }}>Contacto</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 style={{ marginBottom: '1.5rem', fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--color-gray-light)' }}>Contacto</h4>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <li style={{ color: 'var(--color-white)', fontSize: '0.9rem', opacity: 0.8 }}>WhatsApp: +57 300 000 0000</li>
            <li style={{ color: 'var(--color-white)', fontSize: '0.9rem', opacity: 0.8 }}>Correo: info@dfvperfumes.com</li>
          </ul>
        </div>
      </div>
      
      <div className="container" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <p style={{ color: 'var(--color-gray)', fontSize: '0.8rem' }}>&copy; {new Date().getFullYear()} DFV PERFUMES. Todos los derechos reservados.</p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="#" style={{ color: 'var(--color-gray)', fontSize: '0.8rem' }}>Términos y condiciones</Link>
          <Link to="#" style={{ color: 'var(--color-gray)', fontSize: '0.8rem' }}>Política de privacidad</Link>
          <Link to="#" style={{ color: 'var(--color-gray)', fontSize: '0.8rem' }}>Política de envíos</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
