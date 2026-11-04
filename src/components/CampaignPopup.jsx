import React, { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
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

// ─── Componente Popup ─────────────────────────────────────────────────────────

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
    }, 1800);
    return () => clearTimeout(timer);
  }, [campaigns]);

  const handleClose = useCallback(() => {
    setMounted(false);
    setTimeout(() => {
      setVisible(false);
      setCurrentCampaign(null);
    }, 420);
  }, []);

  const handleVerOfertas = useCallback(() => {
    if (!currentCampaign) return;
    handleClose();
    setTimeout(() => navigate(`/campana/${currentCampaign.id}`), 300);
  }, [currentCampaign, navigate, handleClose]);

  if (!currentCampaign || !visible) return null;

  const { title, description, badge, image } = currentCampaign;
  const hasImage = image && !imgError;

  return (
    <>
      <style>{`
        @keyframes dfv-overlay-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes dfv-overlay-out {
          from { opacity: 1; }
          to   { opacity: 0; }
        }
        @keyframes dfv-popup-in {
          from { opacity: 0; transform: translate(-50%, -46%) scale(0.94); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes dfv-popup-out {
          from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          to   { opacity: 0; transform: translate(-50%, -53%) scale(0.95); }
        }
        @keyframes dfv-badge-in {
          0%   { opacity: 0; transform: translateY(-6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes dfv-shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .dfv-popup-btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.9rem 2rem;
          background-color: var(--color-black, #050505);
          color: #fff;
          border: 1px solid var(--color-black, #050505);
          font-family: var(--font-sans, 'Montserrat', sans-serif);
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 2px;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s ease;
          width: 100%;
        }
        .dfv-popup-btn-primary:hover {
          background-color: var(--color-gold, #B99A5B);
          border-color: var(--color-gold, #B99A5B);
          color: #fff;
          letter-spacing: 2.5px;
        }
        .dfv-popup-close:hover {
          background: rgba(255,255,255,0.15) !important;
          border-color: rgba(255,255,255,0.4) !important;
        }
        @media (min-width: 600px) {
          .dfv-popup-layout { flex-direction: row !important; }
          .dfv-popup-img-col { width: 260px !important; min-height: 100% !important; height: auto !important; flex-shrink: 0; }
        }
      `}</style>

      {/* Overlay */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 9000,
          backgroundColor: 'rgba(5,5,5,0.78)',
          backdropFilter: 'blur(3px)',
          animation: `${mounted ? 'dfv-overlay-in' : 'dfv-overlay-out'} 0.4s ease forwards`
        }}
      />

      {/* Popup */}
      <div style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 9001,
        width: '92%',
        maxWidth: hasImage ? '720px' : '500px',
        animation: `${mounted ? 'dfv-popup-in' : 'dfv-popup-out'} 0.42s cubic-bezier(0.34, 1.4, 0.64, 1) forwards`,
        overflow: 'hidden',
        boxShadow: '0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(185,154,91,0.15)',
        borderRadius: '2px',
      }}>

        {/* Layout flex: imagen (izquierda en desktop) + contenido (derecha) */}
        <div className="dfv-popup-layout" style={{ display: 'flex', flexDirection: 'column', minHeight: '0' }}>

          {/* ── Columna imagen ── */}
          {hasImage && (
            <div className="dfv-popup-img-col" style={{
              width: '100%', height: '220px',
              flexShrink: 0, overflow: 'hidden',
              backgroundColor: '#0d0d0d', position: 'relative'
            }}>
              <img
                src={image}
                alt={title}
                onError={() => setImgError(true)}
                style={{
                  width: '100%', height: '100%',
                  objectFit: 'cover', display: 'block',
                  opacity: 0.92
                }}
              />
              {/* Degradado sobre la imagen para suavizar la unión con el contenido */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                height: '60px',
                background: 'linear-gradient(to bottom, transparent, rgba(5,5,5,0.5))'
              }} />
            </div>
          )}

          {/* ── Columna contenido (fondo negro de lujo) ── */}
          <div style={{
            flex: 1,
            backgroundColor: '#050505',
            color: '#fff',
            padding: hasImage ? '2rem 2rem 2.25rem' : '2.5rem 2rem 2.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative',
            minWidth: 0
          }}>
            {/* Botón cerrar — esquina superior derecha, estilo fantasma */}
            <button
              onClick={handleClose}
              className="dfv-popup-close"
              aria-label="Cerrar anuncio"
              style={{
                position: 'absolute', top: '1rem', right: '1rem',
                width: '34px', height: '34px',
                border: '1px solid rgba(255,255,255,0.18)',
                borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'rgba(255,255,255,0.65)',
                transition: 'all 0.25s ease', flexShrink: 0
              }}
            >
              <X size={15} />
            </button>

            {/* Línea decorativa dorada superior */}
            <div style={{
              width: '32px', height: '1px',
              backgroundColor: 'var(--color-gold, #B99A5B)',
              marginBottom: '1.25rem',
              animation: 'dfv-badge-in 0.5s ease 0.2s both'
            }} />

            {/* Badge */}
            {badge && (
              <div style={{
                marginBottom: '0.9rem',
                animation: 'dfv-badge-in 0.5s ease 0.3s both'
              }}>
                <span style={{
                  display: 'inline-block',
                  color: 'var(--color-gold, #B99A5B)',
                  fontFamily: 'var(--font-sans, Montserrat, sans-serif)',
                  fontSize: '0.62rem',
                  fontWeight: '600',
                  letterSpacing: '3px',
                  textTransform: 'uppercase',
                  borderBottom: '1px solid var(--color-gold, #B99A5B)',
                  paddingBottom: '2px'
                }}>
                  {badge}
                </span>
              </div>
            )}

            {/* Título */}
            <h2 style={{
              fontFamily: 'var(--font-serif, "Playfair Display", Georgia, serif)',
              fontSize: 'clamp(1.3rem, 3.5vw, 1.9rem)',
              fontWeight: '400',
              color: '#fff',
              lineHeight: 1.25,
              marginBottom: description ? '0.85rem' : '1.5rem',
              paddingRight: '2.5rem',
              animation: 'dfv-badge-in 0.5s ease 0.4s both'
            }}>
              {title}
            </h2>

            {/* Descripción */}
            {description && (
              <p style={{
                fontFamily: 'var(--font-sans, Montserrat, sans-serif)',
                fontSize: '0.82rem',
                color: 'rgba(255,255,255,0.58)',
                lineHeight: 1.65,
                marginBottom: '1.75rem',
                animation: 'dfv-badge-in 0.5s ease 0.5s both'
              }}>
                {description}
              </p>
            )}

            {/* Botones */}
            <div style={{
              display: 'flex', flexDirection: 'column', gap: '0.65rem',
              animation: 'dfv-badge-in 0.5s ease 0.6s both'
            }}>
              <button onClick={handleVerOfertas} className="dfv-popup-btn-primary">
                Ver ofertas exclusivas
              </button>
              <button
                onClick={handleClose}
                style={{
                  background: 'none', border: 'none',
                  fontFamily: 'var(--font-sans, Montserrat, sans-serif)',
                  fontSize: '0.68rem',
                  color: 'rgba(255,255,255,0.35)',
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  padding: '0.4rem 0',
                  textAlign: 'center',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.65)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
              >
                No, gracias
              </button>
            </div>

            {/* Ornamento inferior */}
            <div style={{
              marginTop: '1.5rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              opacity: 0.2
            }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.4)' }} />
              <span style={{
                fontFamily: 'var(--font-serif, "Playfair Display")',
                fontSize: '0.65rem', letterSpacing: '2px', color: '#fff'
              }}>DFV</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.4)' }} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CampaignPopup;
