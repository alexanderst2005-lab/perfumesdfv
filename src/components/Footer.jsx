import React from 'react';
import { Link } from 'react-router-dom';

import { MapPin } from 'lucide-react';

const InstagramIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const FacebookIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const TikTokIcon = ({ size = 20, color = 'currentColor' }) => (
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
  <footer style={{ backgroundColor: 'var(--color-black)', color: 'var(--color-cream)', padding: '5rem 0 3rem' }}>
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>

      <div className="footer-grid">
        
        {/* 1. Marca */}
        <div className="footer-brand">
          <svg viewBox="0 0 160 50" height="38" aria-label="DFB Perfumes" style={{ display: 'block', marginBottom: '1.25rem' }}>
            <text x="0" y="36" fontFamily="Georgia, 'Times New Roman', serif" fontSize="46" fontWeight="400" letterSpacing="-1" fill="var(--color-cream)">DFB</text>
            <text x="0" y="50" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="10" fontWeight="400" letterSpacing="6" fill="var(--color-cream)">PERFUMES</text>
          </svg>
          <p style={{ color: 'rgba(245,242,236,0.65)', fontSize: '0.88rem', lineHeight: '1.8', maxWidth: '260px', marginBottom: '2rem', fontFamily: 'var(--font-sans)', fontWeight: '300' }}>
            Tu esencia, tu identidad.<br />Fragancias que cuentan tu historia.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }} className="social-links">
            <a href="https://www.instagram.com/perfumesdfv?stkn=N2V4M3Z2emh4cWR2" target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,0.5)', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}>
              <InstagramIcon size={20} />
            </a>
            <a href="#" target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,0.5)', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}>
              <FacebookIcon size={20} />
            </a>
            <a href="#" target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,0.5)', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}>
              <TikTokIcon size={20} />
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
        <div className="stores-section">
          <h4 style={sectionTitleStyle}>Nuestras Tiendas</h4>
          
          <div className="stores-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.8rem', padding: 0, margin: 0 }}>
              <li style={{ display: 'flex', gap: '0.5rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', lineHeight: '1.4' }}>
                <MapPin size={14} style={{ marginTop: '3px', flexShrink: 0 }} />
                <span>Centro Comercial Llanogrande</span>
              </li>
              <li style={{ display: 'flex', gap: '0.5rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', lineHeight: '1.4' }}>
                <MapPin size={14} style={{ marginTop: '3px', flexShrink: 0 }} />
                <span>Palmira<br/><span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Calle 31 #27-44</span></span>
              </li>
            </ul>
            
            <Link 
              to="#" 
              style={{ 
                fontSize: '0.7rem', 
                letterSpacing: '2px', 
                textTransform: 'uppercase', 
                color: '#fff', 
                borderBottom: '1px solid rgba(255,255,255,0.3)', 
                paddingBottom: '3px', 
                fontWeight: '500', 
                textDecoration: 'none',
                transition: 'all 0.3s',
                display: 'inline-block',
                width: 'fit-content',
                marginTop: '0.5rem'
              }}
              onMouseEnter={e => { e.target.style.opacity = 0.7; e.target.style.borderBottomColor = '#fff'; }}
              onMouseLeave={e => { e.target.style.opacity = 1; e.target.style.borderBottomColor = 'rgba(255,255,255,0.3)'; }}
            >
              VER UBICACIONES →
            </Link>
          </div>
        </div>

      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontFamily: 'var(--font-sans)', letterSpacing: '1px', marginBottom: '1rem', fontWeight: '500' }}>
          &copy; 2026 DFB PERFUMES. TODOS LOS DERECHOS RESERVADOS.
        </p>
        <div className="footer-legal">
          {['Términos y condiciones', 'Política de envíos', 'Política de cambios', 'Política de privacidad'].map((l, index) => (
            <React.Fragment key={l}>
              <Link to="#" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem', textDecoration: 'none', transition: 'color 0.2s', letterSpacing: '0.5px' }} onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,0.6)'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.3)'}>
                {l}
              </Link>
              {index < 3 && <span className="legal-separator" style={{ color: 'rgba(255,255,255,0.1)' }}>·</span>}
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
        margin-bottom: 4rem;
      }
      .footer-bottom {
        border-top: 1px solid rgba(255,255,255,0.08);
        padding-top: 2rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
      }
      .footer-legal {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
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
          padding: 3rem 0 6rem !important; /* Espacio extra para WhatsApp */
        }
        .footer-grid {
          grid-template-columns: 1fr 1fr;
          gap: 2rem 1rem;
          margin-bottom: 2rem;
        }
        .footer-brand {
          grid-column: 1 / -1;
          margin-bottom: 0.5rem;
        }
        .stores-section {
          grid-column: 1 / -1;
        }
        .social-links {
          justify-content: flex-start;
        }
        .footer-legal {
          gap: 0.6rem;
        }
        .legal-separator {
          display: none;
        }
      }
    `}</style>
  </footer>
);

export default Footer;
