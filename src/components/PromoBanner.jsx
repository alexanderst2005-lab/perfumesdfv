import React, { useState, useEffect, useRef } from 'react';
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
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

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

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [banner]);

  if (!banner || banner.active === false) {
    return null;
  }

  // La imagen subida desde el panel se guarda como image_url (o image)
  const rawImg = banner.image_url || banner.image;
  const bgImage = rawImg ? optimizeImg(rawImg, 1400) : '/hero_campaign_2.webp';

  return (
    <section ref={sectionRef} className="dfv-promo" style={{ backgroundColor: '#FFFFFF', overflow: 'hidden' }}>
      <div className="dfv-promo__wrap">
        <div
          className={`dfv-promo__card ${isVisible ? 'is-revealed' : ''}`}
          style={{ backgroundImage: `url(${bgImage})` }}
        >
          <div className="dfv-promo__overlay" />
          <div className={`dfv-promo__content ${isVisible ? 'is-revealed' : ''}`}>
            <h2 className="dfv-promo__title">{banner.title}</h2>
            {banner.subtitle && <p className="dfv-promo__subtitle">{banner.subtitle}</p>}
            <Link to={banner.button_link || '/tienda'} className="dfv-promo__btn">
              {banner.button_text || 'COMPRAR AHORA'}
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .dfv-promo { padding: 24px 0; }
        .dfv-promo__wrap { max-width: 1280px; margin: 0 auto; padding: 0 18px; }
        .dfv-promo__card {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 440px;
          border-radius: 8px;
          overflow: hidden;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          background-color: #2a2a2a;
          clip-path: inset(0 0 0 100%);
          transform: translateX(48px) scale(1.03);
          opacity: 0;
          transition:
            clip-path 1.05s cubic-bezier(0.22, 1, 0.36, 1),
            transform 1.05s cubic-bezier(0.22, 1, 0.36, 1),
            opacity 0.6s ease;
        }
        .dfv-promo__card.is-revealed {
          clip-path: inset(0 0 0 0);
          transform: translateX(0) scale(1);
          opacity: 1;
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
          opacity: 0;
          transform: translateX(30px);
          transition: opacity 0.8s ease 0.3s, transform 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.3s;
        }
        .dfv-promo__content.is-revealed {
          opacity: 1;
          transform: translateX(0);
        }
        .dfv-promo__title {
          font-family: 'Montserrat', sans-serif;
          font-size: clamp(2.4rem, 8.5vw, 5rem);
          font-weight: 600;
          line-height: 1.04;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          color: #ffffff;
          margin: 0 0 14px;
          text-shadow: 0 2px 18px rgba(0,0,0,0.25);
          overflow-wrap: anywhere;
        }
        .dfv-promo__subtitle {
          font-family: 'Montserrat', sans-serif;
          font-size: clamp(0.76rem, 2.3vw, 0.98rem);
          font-weight: 400;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.92);
          line-height: 1.5;
          margin: 0 0 24px;
          max-width: 560px;
        }
        .dfv-promo__btn {
          display: inline-block;
          padding: 13px 32px;
          font-family: 'Montserrat', sans-serif;
          font-size: 0.76rem;
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
          .dfv-promo { padding: 18px 0; }
          .dfv-promo__card { aspect-ratio: 1/1; min-height: 340px; }
        }
      `}</style>
    </section>
  );
};

export default PromoBanner;
