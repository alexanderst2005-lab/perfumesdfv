import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer style={{ backgroundColor: 'var(--color-black)', color: 'var(--color-cream)', padding: '5rem 0 3rem' }}>
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2.5rem' }}>

      {/* Top grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '4rem', marginBottom: '4rem' }}>

        {/* Brand */}
        <div>
          <svg viewBox="0 0 160 50" height="38" aria-label="DFV Perfumes" style={{ display: 'block', marginBottom: '1.25rem' }}>
            <text x="0" y="36" fontFamily="Georgia, 'Times New Roman', serif" fontSize="46" fontWeight="400" letterSpacing="-1" fill="var(--color-cream)">DFV</text>
            <text x="0" y="50" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="10" fontWeight="400" letterSpacing="6" fill="var(--color-cream)">PERFUMES</text>
          </svg>
          <p style={{ color: 'rgba(245,242,236,0.65)', fontSize: '0.88rem', lineHeight: '1.8', maxWidth: '260px' }}>
            Tu esencia, tu identidad.<br />Fragancias que cuentan tu historia.
          </p>
          <div style={{ display: 'flex', gap: '1.25rem', marginTop: '1.5rem' }}>
            {['Instagram', 'Facebook', 'TikTok'].map(s => (
              <a key={s} href="#" style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem', letterSpacing: '1px', textTransform: 'uppercase', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = '#fff'}
                onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.45)'}
              >{s}</a>
            ))}
          </div>
        </div>

        {/* Tienda */}
        <div>
          <h4 style={{ fontSize: '0.72rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '1.25rem', fontFamily: 'var(--font-sans)', fontWeight: '500' }}>Tienda</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {[['Todos', '/tienda'], ['Hombre', '/tienda?category=Hombre'], ['Mujer', '/tienda?category=Mujer'], ['Unisex', '/tienda?category=Unisex'], ['Ofertas', '/tienda?offers=true']].map(([l, p]) => (
              <li key={l}><Link to={p} style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.88rem' }}>{l}</Link></li>
            ))}
          </ul>
        </div>

        {/* Ayuda */}
        <div>
          <h4 style={{ fontSize: '0.72rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '1.25rem', fontFamily: 'var(--font-sans)', fontWeight: '500' }}>Ayuda</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {['Envíos', 'Cambios y devoluciones', 'Preguntas frecuentes', 'Contacto'].map(i => (
              <li key={i}><a href="#" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.88rem' }}>{i}</a></li>
            ))}
          </ul>
        </div>

        {/* Contacto */}
        <div>
          <h4 style={{ fontSize: '0.72rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '1.25rem', fontFamily: 'var(--font-sans)', fontWeight: '500' }}>Contacto</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <li style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.88rem' }}>WhatsApp: +57 300 000 0000</li>
            <li style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.88rem' }}>info@dfvperfumes.com</li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.78rem' }}>
          &copy; {new Date().getFullYear()} DFV PERFUMES. Todos los derechos reservados.
        </p>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          {['Términos y condiciones', 'Política de privacidad', 'Política de envíos'].map(l => (
            <a key={l} href="#" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.78rem' }}>{l}</a>
          ))}
        </div>
      </div>
    </div>

    <style>{`
      @media (max-width: 768px) {
        footer > div > div:first-child {
          grid-template-columns: 1fr 1fr !important;
          gap: 2.5rem !important;
        }
        footer > div > div:first-child > div:first-child {
          grid-column: 1 / -1;
        }
      }
    `}</style>
  </footer>
);

export default Footer;
