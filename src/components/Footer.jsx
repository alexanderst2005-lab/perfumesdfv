import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={{ backgroundColor: 'var(--color-black)', color: 'var(--color-white)', padding: '4rem 0 2rem 0', marginTop: 'auto' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '1.5rem', letterSpacing: '2px' }}>NÖIT NOIR</h3>
          <p style={{ color: 'var(--color-gray-light)', fontSize: '0.9rem' }}>Tu esencia, tu identidad. Perfumes que hablan de ti.</p>
        </div>
        <div>
          <h4 style={{ marginBottom: '1.5rem', fontSize: '1rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Tienda</h4>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <li><Link to="/tienda" style={{ color: 'var(--color-gray-light)', fontSize: '0.9rem' }}>Todos los productos</Link></li>
            <li><Link to="/tienda?category=Hombre" style={{ color: 'var(--color-gray-light)', fontSize: '0.9rem' }}>Hombre</Link></li>
            <li><Link to="/tienda?category=Mujer" style={{ color: 'var(--color-gray-light)', fontSize: '0.9rem' }}>Mujer</Link></li>
            <li><Link to="/tienda?category=Unisex" style={{ color: 'var(--color-gray-light)', fontSize: '0.9rem' }}>Unisex</Link></li>
          </ul>
        </div>
        <div>
          <h4 style={{ marginBottom: '1.5rem', fontSize: '1rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Ayuda</h4>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <li><Link to="#" style={{ color: 'var(--color-gray-light)', fontSize: '0.9rem' }}>Preguntas frecuentes</Link></li>
            <li><Link to="#" style={{ color: 'var(--color-gray-light)', fontSize: '0.9rem' }}>Envíos</Link></li>
            <li><Link to="#" style={{ color: 'var(--color-gray-light)', fontSize: '0.9rem' }}>Devoluciones</Link></li>
          </ul>
        </div>
        <div>
          <h4 style={{ marginBottom: '1.5rem', fontSize: '1rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Contacto</h4>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <li style={{ color: 'var(--color-gray-light)', fontSize: '0.9rem' }}>WhatsApp: +57 300 000 0000</li>
            <li style={{ color: 'var(--color-gray-light)', fontSize: '0.9rem' }}>info@noitnoir.com</li>
          </ul>
        </div>
      </div>
      <div className="container" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <p style={{ color: 'var(--color-gray-light)', fontSize: '0.8rem' }}>&copy; {new Date().getFullYear()} Nöit Noir. Todos los derechos reservados.</p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="#" style={{ color: 'var(--color-gray-light)', fontSize: '0.8rem' }}>Términos y condiciones</Link>
          <Link to="#" style={{ color: 'var(--color-gray-light)', fontSize: '0.8rem' }}>Política de privacidad</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
