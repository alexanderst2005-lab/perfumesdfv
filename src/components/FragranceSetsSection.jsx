import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { optimizeImg } from '../utils/img';

const FragranceSetsSection = () => {
  const [setsBanner, setSetsBanner] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const sectionRef = useRef(null);

  useEffect(() => {
    fetch(`/api/fragrance-sets?t=${Date.now()}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        if (data && data.success && data.setsBanner) {
          setSetsBanner(data.setsBanner);
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
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
  }, [loaded, setsBanner]);

  const imagesList = setsBanner
    ? (Array.isArray(setsBanner.images) && setsBanner.images.length > 0
        ? setsBanner.images
        : (setsBanner.image || setsBanner.image_url ? [setsBanner.image || setsBanner.image_url] : []))
    : [];

  useEffect(() => {
    if (imagesList.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentImgIdx(prev => (prev + 1) % imagesList.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [imagesList.length]);

  // Solo mostrar cuando esté configurado y activo desde el panel
  if (!loaded || !setsBanner || setsBanner.active === false || imagesList.length === 0) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      className="dfv-sets-section"
      style={{ backgroundColor: '#FFFFFF', padding: '2rem 0 2.5rem', overflow: 'hidden' }}
    >
      <div className="dfv-sets-container">
        
        {/* IMAGEN DESPLEGABLE ANIMADA DE DERECHA A IZQUIERDA */}
        <div className={`dfv-sets-image-wrap ${isVisible ? 'is-revealed' : ''}`}>
          {imagesList.map((imgUrl, idx) => (
            <img
              key={idx}
              src={optimizeImg(imgUrl, 1200)}
              alt={setsBanner.title || 'Sets de Fragancias Exclusivas'}
              loading="lazy"
              decoding="async"
              className={`dfv-sets-img ${idx === currentImgIdx ? 'is-active' : ''}`}
            />
          ))}
        </div>

        {/* CONTENIDO DEBAJO: TÍTULO GRANDE + SUBTÍTULO + BOTÓN CUADRADO */}
        <div className={`dfv-sets-content ${isVisible ? 'is-revealed' : ''}`}>
          <h2 className="dfv-sets-title">
            {setsBanner.title || 'SETS DE FRAGANCIAS EXCLUSIVAS'}
          </h2>

          {setsBanner.subtitle && (
            <p className="dfv-sets-subtitle">
              {setsBanner.subtitle}
            </p>
          )}

          <Link to="/tienda?sets=1" className="dfv-sets-btn">
            {setsBanner.button_text || 'VER SETS'}
          </Link>
        </div>

        <div className="dfv-sets-divider" />
      </div>

      <style>{`
        .dfv-sets-container {
          max-width: 1280px;
          margin: 0 auto;
        }

        .dfv-sets-image-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 3.4;
          max-height: 560px;
          overflow: hidden;
          background-color: #f4f4f4;
          clip-path: inset(0 0 0 100%);
          transform: translateX(48px) scale(1.04);
          opacity: 0;
          transition:
            clip-path 1.05s cubic-bezier(0.22, 1, 0.36, 1),
            transform 1.05s cubic-bezier(0.22, 1, 0.36, 1),
            opacity 0.6s ease;
        }

        .dfv-sets-image-wrap.is-revealed {
          clip-path: inset(0 0 0 0);
          transform: translateX(0) scale(1);
          opacity: 1;
        }

        .dfv-sets-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
          opacity: 0;
          transform: scale(1.04);
          transition: opacity 0.8s ease, transform 4.5s ease;
        }

        .dfv-sets-img.is-active {
          opacity: 1;
          transform: scale(1);
        }

        .dfv-sets-content {
          text-align: center;
          padding: 2.2rem 1.5rem 2.2rem;
          max-width: 680px;
          margin: 0 auto;
          opacity: 0;
          transform: translateY(22px);
          transition: opacity 0.75s ease 0.25s, transform 0.75s cubic-bezier(0.22, 1, 0.36, 1) 0.25s;
        }

        .dfv-sets-content.is-revealed {
          opacity: 1;
          transform: translateY(0);
        }

        .dfv-sets-title {
          font-family: var(--font-serif, 'Montserrat', sans-serif);
          font-size: clamp(1.75rem, 6.2vw, 2.5rem);
          font-weight: 600;
          line-height: 1.18;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          color: #1a1a1a;
          margin: 0 0 1rem;
        }

        .dfv-sets-subtitle {
          font-family: var(--font-name, 'Archivo', 'Inter', sans-serif);
          font-size: clamp(0.95rem, 2.6vw, 1.08rem);
          font-weight: 400;
          line-height: 1.5;
          color: #2b2b2b;
          margin: 0 auto 1.75rem;
          max-width: 480px;
        }

        .dfv-sets-btn {
          display: inline-block;
          padding: 15px 34px;
          font-family: var(--font-sans, 'Montserrat', sans-serif);
          font-size: 0.85rem;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          text-decoration: none;
          color: #1a1a1a;
          background-color: #ffffff;
          border: 1.8px solid #1a1a1a;
          border-radius: 2px;
          transition: all 0.25s ease;
        }

        .dfv-sets-btn:hover {
          background-color: #1a1a1a;
          color: #ffffff;
        }

        .dfv-sets-divider {
          height: 1px;
          background-color: #e8e8e8;
          margin: 0 1.25rem;
        }

        @media (min-width: 769px) {
          .dfv-sets-container {
            padding: 0 1.25rem;
          }
          .dfv-sets-image-wrap {
            border-radius: 8px;
          }
          .dfv-sets-divider {
            margin: 0;
          }
        }
      `}</style>
    </section>
  );
};

export default FragranceSetsSection;

