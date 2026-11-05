import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { optimizeImg } from '../utils/img';

const PromoBanner = () => {
  const [banner, setBanner] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/promo-banner')
      .then(r => r.json())
      .then(data => {
        if (data.success && data.banner) {
          setBanner(data.banner);
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  if (!loaded || !banner || banner.active === false) {
    return null;
  }

  const bgImage = banner.image ? optimizeImg(banner.image, 1600) : '/hero_campaign_2.webp';

  return (
    <section className="dfv-promo-banner-section" style={{ position: 'relative', width: '100%', overflow: 'hidden', margin: '3rem 0' }}>
      <div 
        style={{
          position: 'relative',
          minHeight: '380px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Capa de contraste sofisticada: viñeta oscura que realza la tipografía blanca */}
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(5,5,5,0.78) 0%, rgba(15,15,15,0.55) 60%, rgba(5,5,5,0.85) 100%)',
            backdropFilter: 'blur(1px)'
          }} 
        />

        {/* Borde sutil dorado superior e inferior */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(185,154,91,0.5), transparent)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(185,154,91,0.5), transparent)' }} />

        {/* Contenido centrado */}
        <div 
          className="container" 
          style={{ 
            position: 'relative', 
            zIndex: 2, 
            textAlign: 'center', 
            padding: '3rem 1.5rem',
            maxWidth: '780px',
            margin: '0 auto'
          }}
        >
          <span 
            style={{ 
              display: 'inline-block',
              fontFamily: 'var(--font-sans, "Montserrat", sans-serif)',
              fontSize: '0.7rem',
              letterSpacing: '3.5px',
              textTransform: 'uppercase',
              color: '#D1B878',
              fontWeight: '700',
              marginBottom: '0.85rem'
            }}
          >
            ✦ ALTA PERFUMERÍA DFV ✦
          </span>

          <h2 
            style={{ 
              fontFamily: 'var(--font-serif, "Playfair Display", Georgia, serif)',
              fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
              fontWeight: '400',
              color: '#ffffff',
              lineHeight: 1.2,
              margin: '0 0 1rem',
              letterSpacing: '0.8px'
            }}
          >
            {banner.title}
          </h2>

          {banner.subtitle && (
            <p 
              style={{ 
                fontFamily: 'var(--font-sans, "Montserrat", sans-serif)',
                fontSize: 'clamp(0.85rem, 1.8vw, 1.05rem)',
                color: '#e4e4e7',
                lineHeight: 1.6,
                margin: '0 auto 2rem',
                maxWidth: '560px',
                fontWeight: '300'
              }}
            >
              {banner.subtitle}
            </p>
          )}

          <div>
            <Link
              to={banner.button_link || '/tienda'}
              className="dfv-promo-banner-btn"
              style={{
                display: 'inline-block',
                padding: '0.95rem 2.75rem',
                backgroundColor: '#0a0a0a',
                color: '#ffffff',
                fontFamily: 'var(--font-sans, "Montserrat", sans-serif)',
                fontSize: '0.78rem',
                fontWeight: '700',
                letterSpacing: '2.5px',
                textTransform: 'uppercase',
                textDecoration: 'none',
                borderRadius: '4px',
                border: '1px solid rgba(185, 154, 91, 0.4)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#B99A5B';
                e.currentTarget.style.color = '#0a0a0a';
                e.currentTarget.style.borderColor = '#B99A5B';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(185, 154, 91, 0.35)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = '#0a0a0a';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.borderColor = 'rgba(185, 154, 91, 0.4)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.5)';
              }}
            >
              {banner.button_text || 'COMPRAR AHORA'}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;

