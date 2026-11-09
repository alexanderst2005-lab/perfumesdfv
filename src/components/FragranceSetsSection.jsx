import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { optimizeImg } from '../utils/img';
import initialSnapshot from '../data/initialSnapshot.json';

let cachedSetsBanner = (() => {
  try {
    const raw = localStorage.getItem('dfv_fragrance_sets_cache');
    if (raw) return JSON.parse(raw);
  } catch { }
  return initialSnapshot?.fragranceSets || null;
})();

const FragranceSetsSection = () => {
  const [setsBanner, setSetsBanner] = useState(cachedSetsBanner);
  const [loaded, setLoaded] = useState(Boolean(cachedSetsBanner));
  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  const imageWrapRef = useRef(null);

  useEffect(() => {
    const loadSets = () => {
      fetch(`/api/fragrance-sets?t=${Date.now()}`, { cache: 'no-store' })
        .then(r => r.json())
        .then(data => {
          if (data && data.success && data.setsBanner) {
            cachedSetsBanner = data.setsBanner;
            setSetsBanner(data.setsBanner);
            try { localStorage.setItem('dfv_fragrance_sets_cache', JSON.stringify(data.setsBanner)); } catch {}
          }
        })
        .catch(() => {})
        .finally(() => setLoaded(true));
    };
    loadSets();
    window.addEventListener('dfv-sync', loadSets);
    window.addEventListener('storage', loadSets);
    return () => {
      window.removeEventListener('dfv-sync', loadSets);
      window.removeEventListener('storage', loadSets);
    };
  }, []);

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

  useEffect(() => {
    if (!loaded || !setsBanner || setsBanner.active === false || imagesList.length === 0) return;

    const checkReveal = () => {
      const el = imageWrapRef.current || sectionRef.current;
      if (!el) return;
      // No desplegar al abrir la página arriba del todo; solo a medida que el usuario va bajando
      if (window.scrollY < 80) {
        setIsVisible(false);
        return;
      }
      const rect = el.getBoundingClientRect();
      if (rect.height === 0) return;

      if (rect.top <= window.innerHeight * 0.78 && rect.bottom >= 60) {
        setIsVisible(true);
      } else if (rect.top > window.innerHeight * 0.96) {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', checkReveal, { passive: true });
    window.addEventListener('resize', checkReveal);
    const timer = setTimeout(checkReveal, 150);

    return () => {
      window.removeEventListener('scroll', checkReveal);
      window.removeEventListener('resize', checkReveal);
      clearTimeout(timer);
    };
  }, [loaded, setsBanner, imagesList.length]);

  // Solo mostrar cuando esté configurado y activo desde el panel
  if (!loaded || !setsBanner || setsBanner.active === false || imagesList.length === 0) {
    return null;
  }

  const activeImageUrl = imagesList[currentImgIdx] || imagesList[0];

  return (
    <section
      ref={sectionRef}
      className="dfv-sets-section"
      style={{ backgroundColor: '#FFFFFF', padding: '2rem 0 2.5rem', overflow: 'hidden' }}
    >
      <div className="dfv-sets-container">
        <div className="dfv-sets-layout">
          {/* IMAGEN COMPLETA A LA DERECHA EN PC / ARRIBA EN MÓVIL */}
          <div ref={imageWrapRef} className={`dfv-sets-image-wrap ${isVisible ? 'is-revealed' : ''}`}>
            <img
              src={optimizeImg(activeImageUrl, 2000)}
              alt={setsBanner.title || 'Sets de Fragancias Exclusivas'}
              decoding="async"
              className="dfv-sets-img"
            />
          </div>

          {/* CONTENIDO: ABAJO CENTRADO EN MÓVIL | IZQUIERDA ALINEADO EN PC */}
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
          max-width: 1420px;
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
          transform: translateX(48px) scale(1.03);
          opacity: 0;
          transition:
            clip-path 1.1s cubic-bezier(0.22, 1, 0.36, 1),
            transform 1.1s cubic-bezier(0.22, 1, 0.36, 1),
            opacity 0.65s ease;
        }

        .dfv-sets-image-wrap.is-revealed {
          clip-path: inset(0 0 0 0);
          transform: translateX(0) scale(1);
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
          transform: translateY(28px);
          transition:
            opacity 0.85s ease 0.25s,
            transform 0.85s cubic-bezier(0.22, 1, 0.36, 1) 0.25s;
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

        /* ════ DISEÑO EXCLUSIVO PC (TEXTO A LA IZQUIERDA + IMAGEN GRANDE A LA DERECHA) ════ */
        @media (min-width: 769px) {
          .dfv-sets-section {
            padding: 3rem 0 2.5rem !important;
          }
          .dfv-sets-container {
            max-width: 1420px !important;
            width: 100% !important;
            margin: 0 auto !important;
            padding: 0 2.2rem !important;
            box-sizing: border-box !important;
          }
          .dfv-sets-layout {
            display: grid;
            grid-template-columns: 42% 58%;
            align-items: center;
            gap: 2.5rem;
            margin-bottom: 2.6rem;
            width: 100%;
          }
          .dfv-sets-content {
            order: 1;
            text-align: left;
            padding: 0 !important;
            margin: 0 !important;
            justify-self: start;
            width: 100%;
            max-width: 490px;
          }
          .dfv-sets-image-wrap {
            order: 2;
            border-radius: 6px;
            width: 100%;
            display: flex !important;
            justify-content: flex-end !important;
            align-items: center !important;
          }
          .dfv-sets-img {
            width: 100% !important;
            height: auto !important;
            max-height: 660px !important;
            object-fit: contain !important;
            object-position: right center !important;
            display: block !important;
          }
          .dfv-sets-title {
            font-size: clamp(1.95rem, 3vw, 2.75rem);
            line-height: 1.13;
            margin: 0 0 1.15rem;
            max-width: 430px;
          }
          .dfv-sets-subtitle {
            font-size: 0.95rem;
            margin: 0 0 1.8rem;
            max-width: 440px;
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
