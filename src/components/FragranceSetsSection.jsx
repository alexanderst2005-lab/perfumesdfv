import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { optimizeImg } from '../utils/img';

let cachedSetsBanner = null;

const FragranceSetsSection = () => {
  const [setsBanner, setSetsBanner] = useState(cachedSetsBanner);
  const [loaded, setLoaded] = useState(Boolean(cachedSetsBanner));
  const [isVisible, setIsVisible] = useState(Boolean(cachedSetsBanner));
  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const sectionRef = useRef(null);

  useEffect(() => {
    fetch(`/api/fragrance-sets?t=${Date.now()}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        if (data && data.success && data.setsBanner) {
          cachedSetsBanner = data.setsBanner;
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
        <div className="dfv-sets-layout">
          {/* IMAGEN COMPLETA DESPLEGABLE ANIMADA DE DERECHA A IZQUIERDA (ARRIBA EN MÓVIL / DERECHA EN PC) */}
          <div className={`dfv-sets-image-wrap ${isVisible ? 'is-revealed' : ''}`}>
            <img
              src={optimizeImg(imagesList[currentImgIdx] || imagesList[0], 1400)}
              alt={setsBanner.title || 'Sets de Fragancias Exclusivas'}
              loading="lazy"
              decoding="async"
              className="dfv-sets-img"
            />
          </div>

          {/* CONTENIDO: ABAJO CENTRADO EN MÓVIL | IZQUIERDA ALINEADO EN PC (COMO IMAGEN 4) */}
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
        </div>

        <div className="dfv-sets-divider" />
      </div>

      <style>{`
        .dfv-sets-container {
          max-width: 1280px;
          margin: 0 auto;
        }

        .dfv-sets-layout {
          display: flex;
          flex-direction: column;
        }

        .dfv-sets-image-wrap {
          position: relative;
          width: 100%;
          overflow: hidden;
          background-color: #ffffff;
          display: flex;
          justify-content: center;
          align-items: center;
          clip-path: inset(0 0 0 100%);
          transform: translateX(48px);
          opacity: 0;
          transition:
            clip-path 1.05s cubic-bezier(0.22, 1, 0.36, 1),
            transform 1.05s cubic-bezier(0.22, 1, 0.36, 1),
            opacity 0.6s ease;
        }

        .dfv-sets-image-wrap.is-revealed {
          clip-path: inset(0 0 0 0);
          transform: translateX(0);
          opacity: 1;
        }

        .dfv-sets-img {
          width: 100%;
          height: auto;
          max-height: 750px;
          object-fit: contain;
          object-position: center;
          display: block;
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
          font-family: 'Montserrat', sans-serif;
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
          font-family: 'Montserrat', sans-serif;
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

        /* ════ DISEÑO EXCLUSIVO PC (COMO IMAGEN 4: TEXTO A LA IZQUIERDA ALINEADO AL BORDE + IMAGEN A LA DERECHA) ════ */
        @media (min-width: 769px) {
          .dfv-sets-section {
            padding: 3.5rem 0 3rem !important;
          }
          .dfv-sets-container {
            max-width: 100% !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 28px !important;
            box-sizing: border-box !important;
          }
          .dfv-sets-layout {
            display: grid;
            grid-template-columns: 42% 1fr;
            align-items: center;
            gap: 2.5rem;
            margin-bottom: 3rem;
            width: 100%;
          }
          .dfv-sets-content {
            order: 1;
            text-align: left;
            padding: 0 !important;
            margin: 0 !important;
            justify-self: start;
            width: 100%;
            max-width: 520px;
          }
          .dfv-sets-image-wrap {
            order: 2;
            border-radius: 0;
            width: 100%;
          }
          .dfv-sets-title {
            font-size: clamp(2.2rem, 3.6vw, 3.15rem);
            line-height: 1.12;
            margin: 0 0 1.25rem;
            max-width: 440px;
          }
          .dfv-sets-subtitle {
            font-size: 0.96rem;
            margin: 0 0 2rem;
            max-width: 460px;
            color: #333333;
          }
          .dfv-sets-btn {
            background-color: #222222;
            color: #ffffff;
            border: 1.5px solid #222222;
            padding: 13px 26px;
            font-size: 0.78rem;
            letter-spacing: 0.06em;
          }
          .dfv-sets-btn:hover {
            background-color: #000000;
            border-color: #000000;
            color: #ffffff;
          }
          .dfv-sets-divider {
            margin: 0 !important;
          }
        }
      `}</style>
    </section>
  );
};

export default FragranceSetsSection;
