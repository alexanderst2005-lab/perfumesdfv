import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { optimizeImg } from '../utils/img';

const DEFAULT_BANNER = {
  title: 'ELEGANCIA QUE PERDURA',
  subtitle: 'Fragancias exclusivas que definen tu presencia con un sello inconfundible de lujo.',
  button_text: 'COMPRAR AHORA',
  button_link: '/tienda',
  image: '/hero_campaign_2.webp',
  active: true
};

const PromoBanner = () => {
  const [banner, setBanner] = useState(DEFAULT_BANNER);

  useEffect(() => {
    fetch(`/api/promo-banner?t=${Date.now()}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        if (data.success && data.banner) {
          setBanner(data.banner);
        }
      })
      .catch(() => {});
  }, []);

  if (!banner || banner.active === false) {
    return null;
  }

  // La imagen subida desde el panel se guarda como image_url (o image)
  const rawImg = banner.image_url || banner.image;
  const bgImage = rawImg ? optimizeImg(rawImg, 1400) : '/hero_campaign_2.webp';

  return (
    <section className="dfv-promo" style={{ backgroundColor: '#FFFFFF' }}>
      <div className="dfv-promo__wrap">
        <div className="dfv-promo__card" style={{ backgroundImage: `url(${bgImage})` }}>
          <div className="dfv-promo__overlay" />
          <div className="dfv-promo__content">
            <h2 className="dfv-promo__title">{banner.title}</h2>
            {banner.subtitle && <p className="dfv-promo__subtitle">{banner.subtitle}</p>}
            <Link to={banner.button_link || '/tienda'} className="dfv-promo__btn">
              {banner.button_text || 'COMPRAR AHORA'}
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .dfv-promo { padding: 48px 0; }
        .dfv-promo__wrap { max-width: 1320px; margin: 0 auto; padding: 0 20px; }
        .dfv-promo__card {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 460px;
          border-radius: 8px;
          overflow: hidden;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          background-color: #2a2a2a;
        }
        .dfv-promo__overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0,0,0,0.38) 0%, rgba(0,0,0,0.50) 100%);
        }
        .dfv-promo__content {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 760px;
          padding: 40px 24px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .dfv-promo__title {
          font-family: 'Montserrat', sans-serif;
          font-size: clamp(2.6rem, 8.5vw, 5.2rem);
          font-weight: 600;
          line-height: 1.02;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          color: #ffffff;
          margin: 0 0 16px;
          text-shadow: 0 2px 18px rgba(0,0,0,0.25);
          overflow-wrap: anywhere;
        }
        .dfv-promo__subtitle {
          font-family: 'Montserrat', sans-serif;
          font-size: clamp(0.78rem, 2.4vw, 1rem);
          font-weight: 400;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.92);
          line-height: 1.5;
          margin: 0 0 28px;
          max-width: 560px;
        }
        .dfv-promo__btn {
          display: inline-block;
          padding: 14px 34px;
          font-family: 'Montserrat', sans-serif;
          font-size: 0.78rem;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          text-decoration: none;
          color: #ffffff;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.75);
          border-radius: 999px;
          transition: background-color 0.25s ease, color 0.25s ease;
        }
        .dfv-promo__btn:hover { background: #ffffff; color: #1a1a1a; }
        @media (max-width: 640px) {
          .dfv-promo { padding: 40px 0; }
          .dfv-promo__card { min-height: 440px; }
        }
      `}</style>
    </section>
  );
};

export default PromoBanner;
