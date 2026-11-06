import React, { useState, useEffect, useCallback } from 'react';
import { X, Sparkles, ShoppingBag, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ─── Lógica de frecuencia (localStorage / sessionStorage) ────────────────────

function shouldShowCampaign(campaign) {
  const { id, frequency } = campaign;
  const key = `dfv_campaign_${id}`;

  if (frequency === 'every_visit') return true;

  if (frequency === 'once_session') {
    return !sessionStorage.getItem(key);
  }

  if (frequency === 'once_24h') {
    try {
      const ts = localStorage.getItem(key);
      if (!ts) return true;
      const elapsed = Date.now() - parseInt(ts, 10);
      return elapsed > 24 * 60 * 60 * 1000;
    } catch {
      return true;
    }
  }

  return true;
}

function markCampaignSeen(campaign) {
  const { id, frequency } = campaign;
  const key = `dfv_campaign_${id}`;
  if (frequency === 'once_session') {
    sessionStorage.setItem(key, '1');
  } else if (frequency === 'once_24h') {
    localStorage.setItem(key, String(Date.now()));
  }
}

// Pre-carga una imagen en memoria antes de abrir el popup para que foto y textos aparezcan al mismo tiempo
function preloadCampaignImage(url) {
  return new Promise((resolve) => {
    if (!url) {
      resolve(true);
      return;
    }
    const img = new Image();
    let settled = false;
    const done = (ok) => {
      if (settled) return;
      settled = true;
      resolve(ok);
    };
    const timeoutId = setTimeout(() => done(true), 2500);
    img.onload = () => {
      clearTimeout(timeoutId);
      if (typeof img.decode === 'function') {
        img.decode().then(() => done(true)).catch(() => done(true));
      } else {
        done(true);
      }
    };
    img.onerror = () => {
      clearTimeout(timeoutId);
      done(false);
    };
    img.src = url;
  });
}

// ─── Componente Popup de Campaña (Compacto, Completo y 100% Adaptable) ─────────

const CampaignPopup = ({ campaigns }) => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [currentCampaign, setCurrentCampaign] = useState(null);
  const [imgError, setImgError] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!campaigns || campaigns.length === 0) return;
    const toShow = campaigns.find(c => shouldShowCampaign(c));
    if (!toShow) return;

    let cancelled = false;

    // Pre-cargar imagen primero para que al abrir el modal ya esté todo listo de una vez
    Promise.all([
      preloadCampaignImage(toShow.image),
      new Promise(r => setTimeout(r, 300))
    ]).then(([imgLoaded]) => {
      if (cancelled) return;
      setCurrentCampaign(toShow);
      setImgError(!imgLoaded && Boolean(toShow.image));
      setVisible(true);
      setMounted(true);
      markCampaignSeen(toShow);
    });

    return () => {
      cancelled = true;
    };
  }, [campaigns]);

  const handleClose = useCallback(() => {
    setMounted(false);
    setTimeout(() => {
      setVisible(false);
      setCurrentCampaign(null);
    }, 320);
  }, []);

  const handleVerOfertas = useCallback(() => {
    if (!currentCampaign) return;
    handleClose();
    setTimeout(() => navigate(`/campana/${currentCampaign.id}`), 220);
  }, [currentCampaign, navigate, handleClose]);

  if (!currentCampaign || !visible) return null;

  const { title, description, badge, image } = currentCampaign;
  const hasImage = image && !imgError;

  return (
    <>
      <style>{`
        @keyframes dfv-overlay-fadein {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes dfv-overlay-fadeout {
          from { opacity: 1; }
          to   { opacity: 0; }
        }
        @keyframes dfv-card-enter {
          0% {
            opacity: 0;
            transform: translate(-50%, -47%) scale(0.94);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
        @keyframes dfv-card-exit {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -52%) scale(0.95);
          }
        }

        .dfv-promo-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.55rem;
          width: 100%;
          padding: 0.82rem 1.25rem;
          background: linear-gradient(135deg, #B99A5B 0%, #E2CE93 50%, #B99A5B 100%);
          background-size: 200% 200%;
          color: #0a0a0a;
          border: none;
          border-radius: 10px;
          font-family: var(--font-sans, 'Montserrat', sans-serif);
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(185, 154, 91, 0.32);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .dfv-promo-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(185, 154, 91, 0.5);
          background-position: 100% 50%;
        }
        .dfv-promo-btn:active {
          transform: translateY(1px);
        }

        .dfv-close-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          z-index: 30;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(10, 10, 10, 0.72);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.22);
          color: rgba(255, 255, 255, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .dfv-close-btn:hover {
          background: rgba(185, 154, 91, 0.35);
          border-color: #B99A5B;
          color: #ffffff;
          transform: rotate(90deg);
        }

        @media (max-width: 640px) {
          .dfv-modal-box {
            width: 88vw !important;
            max-width: 350px !important;
            max-height: 90dvh !important;
            border-radius: 16px !important;
          }
          .dfv-modal-img-el {
            max-height: 34dvh !important;
          }
          .dfv-modal-body {
            padding: 0.85rem 1.05rem 1.05rem !important;
          }
          .dfv-modal-title {
            font-size: 1.15rem !important;
            margin-bottom: 0.4rem !important;
          }
          .dfv-modal-desc {
            font-size: 0.78rem !important;
            margin-bottom: 0.85rem !important;
            line-height: 1.4 !important;
          }
          .dfv-promo-btn {
            padding: 0.75rem 1rem !important;
            font-size: 0.7rem !important;
          }
        }
      `}</style>

      {/* Backdrop con desenfoque de fondo */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9000,
          backgroundColor: 'rgba(5, 5, 5, 0.82)',
          backdropFilter: 'blur(6px)',
          animation: `${mounted ? 'dfv-overlay-fadein' : 'dfv-overlay-fadeout'} 0.3s ease forwards`
        }}
      />

      {/* Tarjeta del Popup (Compacta para verse 100% completa en cualquier pantalla) */}
      <div
        className="dfv-modal-box"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9001,
          width: '90%',
          maxWidth: '400px',
          maxHeight: '92dvh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0a0a0a',
          borderRadius: '18px',
          border: '1px solid rgba(185, 154, 91, 0.32)',
          boxShadow: '0 25px 80px rgba(0, 0, 0, 0.88), 0 0 40px rgba(185, 154, 91, 0.14)',
          overflow: 'hidden',
          animation: `${mounted ? 'dfv-card-enter' : 'dfv-card-exit'} 0.34s cubic-bezier(0.16, 1, 0.3, 1) forwards`
        }}
      >
        {/* Botón flotante para cerrar (✕) */}
        <button
          onClick={handleClose}
          className="dfv-close-btn"
          aria-label="Cerrar anuncio"
        >
          <X size={15} />
        </button>

        {/* ── IMAGEN COMPLETA Y NÍTIDA (Sin bordes borrosos) ── */}
        {hasImage ? (
          <div
            className="dfv-modal-img"
            style={{
              position: 'relative',
              width: '100%',
              backgroundColor: '#0a0a0a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 1,
              minHeight: 0,
              overflow: 'hidden'
            }}
          >
            <img
              src={image}
              alt={title}
              className="dfv-modal-img-el"
              decoding="sync"
              fetchPriority="high"
              onError={() => setImgError(true)}
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '38dvh',
                objectFit: 'contain',
                backgroundColor: '#0a0a0a',
                display: 'block'
              }}
            />
          </div>
        ) : (
          /* Encabezado alternativo con emblema dorado si no hay foto */
          <div style={{ paddingTop: '1.75rem', textAlign: 'center', flexShrink: 0 }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                margin: '0 auto',
                borderRadius: '50%',
                backgroundColor: 'rgba(185, 154, 91, 0.12)',
                border: '1px solid rgba(185, 154, 91, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#B99A5B'
              }}
            >
              <Sparkles size={20} />
            </div>
          </div>
        )}

        {/* ── CUERPO: TODA LA INFORMACIÓN VISIBLE SIN CORTES ── */}
        <div
          className="dfv-modal-body"
          style={{
            padding: hasImage ? '1rem 1.35rem 1.25rem' : '1rem 1.5rem 1.6rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            zIndex: 10,
            flexShrink: 0,
            backgroundColor: '#0a0a0a',
            borderTop: hasImage ? '1px solid rgba(255,255,255,0.06)' : 'none'
          }}
        >
          {/* Badge dorado metalizado */}
          {badge && (
            <div style={{ marginBottom: '0.65rem' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.32rem 1rem',
                  borderRadius: '999px',
                  background: 'linear-gradient(135deg, #B99A5B 0%, #E6D39E 50%, #B99A5B 100%)',
                  color: '#0a0a0a',
                  fontFamily: 'var(--font-sans, Montserrat, sans-serif)',
                  fontSize: '0.64rem',
                  fontWeight: '800',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  boxShadow: '0 3px 14px rgba(185, 154, 91, 0.4)'
                }}
              >
                ✦ {badge} ✦
              </span>
            </div>
          )}

          {/* Título de Campaña */}
          <h2
            className="dfv-modal-title"
            style={{
              fontFamily: 'var(--font-serif, "Playfair Display", Georgia, serif)',
              fontSize: 'clamp(1.2rem, 3.2vw, 1.48rem)',
              fontWeight: '500',
              color: '#ffffff',
              lineHeight: 1.22,
              margin: '0 0 0.5rem',
              letterSpacing: '0.2px',
              maxWidth: '360px'
            }}
          >
            {title}
          </h2>

          {/* Mensaje o Descripción */}
          {description && (
            <p
              className="dfv-modal-desc"
              style={{
                fontFamily: 'var(--font-sans, Montserrat, sans-serif)',
                fontSize: '0.82rem',
                color: '#b4b4bc',
                lineHeight: 1.45,
                margin: '0 0 1rem',
                maxWidth: '350px',
                fontWeight: '400'
              }}
            >
              {description}
            </p>
          )}

          {/* Botón Principal de Acción (CTA) */}
          <button onClick={handleVerOfertas} className="dfv-promo-btn">
            <ShoppingBag size={15} />
            <span>{currentCampaign.button_text || 'Ver ofertas exclusivas'}</span>
            <ArrowRight size={15} />
          </button>

          <button
            type="button"
            onClick={handleClose}
            style={{
              marginTop: '0.7rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'rgba(255,255,255,0.48)',
              fontFamily: 'var(--font-sans, Montserrat, sans-serif)',
              fontSize: '0.64rem',
              fontWeight: 600,
              letterSpacing: '1.5px',
              textTransform: 'uppercase'
            }}
          >
            Continuar navegando
          </button>
        </div>
      </div>
    </>
  );
};

export default CampaignPopup;
