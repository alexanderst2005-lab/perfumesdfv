import React from 'react';
import { Link } from 'react-router-dom';

const InstagramIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const FacebookIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const TikTokIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5v3a3 3 0 0 1-3-3" />
  </svg>
);

const sectionTitleStyle = {
  fontSize: '0.7rem',
  letterSpacing: '2px',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.4)',
  marginBottom: '1.25rem',
  fontFamily: 'var(--font-sans)',
  fontWeight: '500'
};

const linkStyle = {
  color: 'rgba(255,255,255,0.6)',
  fontSize: '0.85rem',
  textDecoration: 'none',
  transition: 'color 0.2s',
  fontFamily: 'var(--font-sans)',
  fontWeight: '300'
};

const Footer = () => (
  <footer style={{ backgroundColor: 'var(--color-black)', color: 'var(--color-cream)', padding: '4rem 0 2rem' }}>
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>

      <div className="footer-grid">
        
        {/* 1. Marca */}
        <div className="footer-brand">
          <svg viewBox="0 0 160 50" height="34" aria-label="DFV Perfumes" style={{ display: 'block', marginBottom: '1.2rem' }}>
            <text x="0" y="36" fontFamily="Georgia, 'Times New Roman', serif" fontSize="46" fontWeight="400" letterSpacing="-1" fill="var(--color-cream)">DFV</text>
            <text x="0" y="50" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="10" fontWeight="400" letterSpacing="6" fill="var(--color-cream)">PERFUMES</text>
          </svg>
          <p style={{ color: 'rgba(245,242,236,0.65)', fontSize: '0.85rem', lineHeight: '1.6', maxWidth: '240px', marginBottom: '1.5rem', fontFamily: 'var(--font-sans)', fontWeight: '300' }}>
            Tu esencia, tu identidad.<br />Fragancias que cuentan tu historia.
          </p>
          <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
            <a href="https://www.instagram.com/perfumesdfv" target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,0.4)', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>
              <InstagramIcon />
            </a>
            <a href="#" target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,0.4)', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>
              <FacebookIcon />
            </a>
            <a href="#" target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,0.4)', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>
              <TikTokIcon />
            </a>
          </div>
        </div>

        {/* 2. Tienda */}
        <div>
          <h4 style={sectionTitleStyle}>Tienda</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.8rem', padding: 0, margin: 0 }}>
            {[['Todos', '/tienda'], ['Mujer', '/tienda?category=Mujer'], ['Hombre', '/tienda?category=Hombre'], ['Unisex', '/tienda?category=Unisex'], ['Ofertas', '/tienda?offers=true']].map(([l, p]) => (
              <li key={l}>
                <Link to={p} style={linkStyle} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.6)'}>{l}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* 3. Ayuda */}
        <div>
          <h4 style={sectionTitleStyle}>Ayuda</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.8rem', padding: 0, margin: 0 }}>
            {['Envíos', 'Cambios y devoluciones', 'Preguntas frecuentes', 'Contacto'].map(i => (
              <li key={i}>
                <Link to="#" style={linkStyle} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.6)'}>{i}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* 4. Nuestras Tiendas */}
        <div>
          <h4 style={sectionTitleStyle}>Nuestras Tiendas</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', fontFamily: 'var(--font-sans)', fontWeight: '300' }}>
              Centro Comercial Llanogrande
            </p>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', fontFamily: 'var(--font-sans)', fontWeight: '300' }}>Palmira</p>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', marginTop: '0.2rem' }}>Calle 31 #27-44</p>
            </div>
            
            <Link to="/" style={{ 
              display: 'inline-block',
              fontSize: '0.7rem',
              letterSpacing: '1px',
              color: '#fff',
              textDecoration: 'none',
              marginTop: '0.5rem',
              opacity: 0.8,
              transition: 'opacity 0.2s',
              fontWeight: '500'
            }} onMouseEnter={e => e.target.style.opacity = 1} onMouseLeave={e => e.target.style.opacity = 0.8}>
              VER UBICACIONES &rarr;
            </Link>
          </div>
        </div>

      </div>

      {/* Cierre Final Centrado */}
      <div className="footer-bottom">
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontFamily: 'var(--font-sans)', letterSpacing: '1px', marginBottom: '0.8rem', fontWeight: '500' }}>
          &copy; 2026 DFV PERFUMES. TODOS LOS DERECHOS RESERVADOS.
        </p>
        <div className="footer-legal">
          {['Términos y condiciones', 'Política de envíos', 'Política de cambios', 'Política de privacidad'].map((l, index) => (
            <React.Fragment key={l}>
              <Link to="#" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', textDecoration: 'none', transition: 'color 0.2s', letterSpacing: '0.5px' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.4)'}>
                {l}
              </Link>
              {index < 3 && <span className="legal-separator" style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>

    <style>{`
      .footer-grid {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr 1.5fr;
        gap: 3rem;
        margin-bottom: 3rem;
      }
      .footer-bottom {
        border-top: 1px solid rgba(255,255,255,0.06);
        padding-top: 2rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
      }
      .footer-legal {
        display: flex;
        gap: 0.8rem;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        max-width: 600px;
        line-height: 1.8;
      }

      @media (max-width: 1024px) {
        .footer-grid {
          grid-template-columns: 1fr 1fr 1fr;
          gap: 3rem;
        }
        .footer-brand {
          grid-column: 1 / -1;
        }
      }

      @media (max-width: 768px) {
        footer {
          padding: 3rem 0 5rem !important; /* Espacio extra para WhatsApp */
        }
        .footer-grid {
          grid-template-columns: 1fr 1fr;
          gap: 2.5rem 1rem;
          margin-bottom: 2rem;
        }
        .footer-brand {
          grid-column: 1 / -1;
          margin-bottom: 0;
        }
        .footer-legal {
          gap: 0.5rem 0.8rem;
        }
        .legal-separator {
          display: none;
        }
      }
    `}</style>
  </footer>
);

export default Footer;
