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

// ─── Componente Popup de Campaña (Estilo Alta Perfumería) ─────────────────────

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
    const timer = setTimeout(() => {
      setCurrentCampaign(toShow);
      setImgError(false);
      setVisible(true);
      setMounted(true);
      markCampaignSeen(toShow);
    }, 1500);
    return () => clearTimeout(timer);
  }, [campaigns]);

  const handleClose = useCallback(() => {
    setMounted(false);
    setTimeout(() => {
      setVisible(false);
      setCurrentCampaign(null);
    }, 380);
  }, []);

  const handleVerOfertas = useCallback(() => {
    if (!currentCampaign) return;
    handleClose();
    setTimeout(() => navigate(`/campana/${currentCampaign.id}`), 250);
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
            transform: translate(-50%, -46%) scale(0.92);
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
            transform: translate(-50%, -52%) scale(0.94);
          }
        }
        @keyframes dfv-gold-shimmer {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .dfv-promo-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.65rem;
          width: 100%;
          max-width: 440px;
          padding: 1.05rem 2rem;
          background: linear-gradient(135deg, #B99A5B 0%, #E2CE93 50%, #B99A5B 100%);
          background-size: 200% 200%;
          color: #0a0a0a;
          border: none;
          border-radius: 12px;
          font-family: var(--font-sans, 'Montserrat', sans-serif);
          font-size: 0.82rem;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          cursor: pointer;
          box-shadow: 0 10px 30px rgba(185, 154, 91, 0.35);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .dfv-promo-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 40px rgba(185, 154, 91, 0.55);
          background-position: 100% 50%;
        }
        .dfv-promo-btn:active {
          transform: translateY(1px);
        }

        .dfv-close-btn {
          position: absolute;
          top: 14px;
          right: 14px;
          z-index: 30;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(10, 10, 10, 0.65);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.18);
          color: rgba(255, 255, 255, 0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .dfv-close-btn:hover {
          background: rgba(185, 154, 91, 0.3);
          border-color: #B99A5B;
          color: #ffffff;
          transform: rotate(90deg);
        }

        @media (max-width: 640px) {
          .dfv-modal-box {
            width: 94% !important;
            max-height: 94vh !important;
          }
          .dfv-modal-img img:last-child {
            max-height: 62vh !important;
          }
          .dfv-modal-body {
            padding: 1.1rem 1.1rem 1.5rem !important;
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
          animation: `${mounted ? 'dfv-overlay-fadein' : 'dfv-overlay-fadeout'} 0.35s ease forwards`
        }}
      />

      {/* Tarjeta del Popup */}
      <div
        className="dfv-modal-box"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9001,
          width: '92%',
          maxWidth: '500px',
          maxHeight: '94vh',
          overflowY: 'auto',
          backgroundColor: '#0a0a0a',
          borderRadius: '22px',
          border: '1px solid rgba(185, 154, 91, 0.3)',
          boxShadow: '0 30px 100px rgba(0, 0, 0, 0.85), 0 0 50px rgba(185, 154, 91, 0.15)',
          overflow: 'hidden',
          animation: `${mounted ? 'dfv-card-enter' : 'dfv-card-exit'} 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards`
        }}
      >
        {/* Botón flotante para cerrar (✕) */}
        <button
          onClick={handleClose}
          className="dfv-close-btn"
          aria-label="Cerrar anuncio"
        >
          <X size={17} />
        </button>

        {/* ── FOTO GRANDE: fondo difuminado con la misma imagen + imagen nítida completa al centro ── */}
        {hasImage ? (
          <div
            className="dfv-modal-img"
            style={{
              position: 'relative',
              width: '100%',
              backgroundColor: '#0a0a0a',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {/* Fondo borroso (se adapta a los colores de cada imagen) */}
            <img
              src={image}
              alt=""
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: '-30px',
                width: 'calc(100% + 60px)',
                height: 'calc(100% + 60px)',
                objectFit: 'cover',
                filter: 'blur(28px) brightness(0.55) saturate(1.25)',
                transform: 'scale(1.1)',
                pointerEvents: 'none'
              }}
            />
            {/* Imagen principal nítida y completa */}
            <img
              src={image}
              alt={title}
              onError={() => setImgError(true)}
              style={{
                position: 'relative',
                zIndex: 2,
                width: '100%',
                height: 'auto',
                maxHeight: '68vh',
                objectFit: 'contain',
                display: 'block'
              }}
            />
          </div>
        ) : (
          /* Encabezado alternativo con emblema dorado si no hay foto */
          <div style={{ paddingTop: '2.5rem', textAlign: 'center' }}>
            <div
              style={{
                width: '54px',
                height: '54px',
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
              <Sparkles size={24} />
            </div>
          </div>
        )}
        {/* ── CUERPO: INFORMACIÓN DE LA CAMPAÑA ── */}
        <div
          className="dfv-modal-body"
          style={{
            padding: hasImage ? '1.1rem 1.5rem 1.6rem' : '1rem 2rem 2.5rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            zIndex: 10
          }}
        >
          {/* Badge dorado metalizado */}
          {badge && (
            <div style={{ marginBottom: '1.1rem' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 1.4rem',
                  borderRadius: '999px',
                  background: 'linear-gradient(135deg, #B99A5B 0%, #E6D39E 50%, #B99A5B 100%)',
                  color: '#0a0a0a',
                  fontFamily: 'var(--font-sans, Montserrat, sans-serif)',
                  fontSize: '0.72rem',
                  fontWeight: '800',
                  letterSpacing: '2.5px',
                  textTransform: 'uppercase',
                  boxShadow: '0 4px 18px rgba(185, 154, 91, 0.45)'
                }}
              >
                ✦ {badge} ✦
              </span>
            </div>
          )}

          {/* Título de Campaña en Playfair Display */}
          <h2
            style={{
              fontFamily: 'var(--font-serif, "Playfair Display", Georgia, serif)',
              fontSize: 'clamp(1.5rem, 4vw, 2.15rem)',
              fontWeight: '500',
              color: '#ffffff',
              lineHeight: 1.22,
              margin: '0 0 0.85rem',
              letterSpacing: '0.3px',
              maxWidth: '480px'
            }}
          >
            {title}
          </h2>

          {/* Mensaje o Descripción */}
          {description && (
            <p
              style={{
                fontFamily: 'var(--font-sans, Montserrat, sans-serif)',
                fontSize: '0.92rem',
                color: '#a1a1aa',
                lineHeight: 1.6,
                margin: '0 0 1.85rem',
                maxWidth: '440px',
                fontWeight: '400'
              }}
            >
              {description}
            </p>
          )}

          {/* Botón Principal de Acción (CTA) */}
          <button onClick={handleVerOfertas} className="dfv-promo-btn">
            <ShoppingBag size={17} />
            <span>{currentCampaign.button_text || 'Ver ofertas exclusivas'}</span>
            <ArrowRight size={17} />
          </button>

          <button
            type="button"
            onClick={handleClose}
            style={{
              marginTop: '0.95rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'rgba(255,255,255,0.45)',
              fontFamily: 'var(--font-sans, Montserrat, sans-serif)',
              fontSize: '0.68rem',
              fontWeight: 600,
              letterSpacing: '1.8px',
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
